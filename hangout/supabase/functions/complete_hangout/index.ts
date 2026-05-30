import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { hangout_id } = body;

    if (!hangout_id) {
      return new Response(JSON.stringify({ error: "hangout_id is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is a participant
    const { data: participant } = await serviceClient
      .from("hangout_participants")
      .select("id, status, completed_at")
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return new Response(
        JSON.stringify({ error: "You are not a participant in this hangout" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (participant.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, already_completed: true }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Verify hangout status allows completion
    const { data: hangout } = await serviceClient
      .from("hangouts")
      .select("id, status, mode, start_time")
      .eq("id", hangout_id)
      .single();

    if (!hangout) {
      return new Response(JSON.stringify({ error: "Hangout not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!["active", "planned"].includes(hangout.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot complete hangout with status: ${hangout.status}` }),
        { status: 409, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    // Mark this participant as completed
    await serviceClient
      .from("hangout_participants")
      .update({ status: "completed", completed_at: now })
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id);

    // Re-fetch participants AFTER the UPDATE has committed to get accurate statuses
    const { data: allParticipants } = await serviceClient
      .from("hangout_participants")
      .select("user_id, status, completed_at")
      .eq("hangout_id", hangout_id);

    const totalCount = allParticipants?.length ?? 0;
    const completedCount = allParticipants?.filter((p) => p.status === "completed").length ?? 0;

    const allCompleted = completedCount >= totalCount && totalCount > 0;

    if (allCompleted) {
      // Update hangout status to completed
      await serviceClient
        .from("hangouts")
        .update({
          status: "completed",
          end_time: now,
          verification_status: "completed",
        })
        .eq("id", hangout_id);

      // Insert log event
      await serviceClient.from("verification_events").insert({
        hangout_id,
        user_id: user.id,
        event_type: "end",
        metadata: { triggered_by: user.id, all_completed: true },
      });

      // Trigger award_points (call internal edge function)
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

      try {
        await fetch(`${supabaseUrl}/functions/v1/award_points`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ hangout_id }),
        });
      } catch (awardErr) {
        console.error("award_points trigger failed (non-fatal):", awardErr);
      }

      return new Response(
        JSON.stringify({ success: true, all_completed: true, hangout_status: "completed" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        all_completed: false,
        progress: { completed: completedCount, total: totalCount },
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("complete_hangout error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
