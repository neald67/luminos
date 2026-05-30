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
    const {
      receiver_id,
      mode = "casual",
      activity,
      proposed_time,
      estimated_duration_minutes = 60,
      place_name,
      general_location,
      note = "",
    } = body;

    // Validate required fields
    if (!receiver_id) {
      return new Response(JSON.stringify({ error: "receiver_id is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!activity || !proposed_time || !place_name || !general_location) {
      return new Response(
        JSON.stringify({ error: "activity, proposed_time, place_name, and general_location are required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (note.trim().length > 0 && note.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "note must be empty or at least 5 characters" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (place_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "place_name cannot be empty" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const proposedDate = new Date(proposed_time);
    if (isNaN(proposedDate.getTime()) || proposedDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "proposed_time must be a valid future timestamp" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!["casual", "verified"].includes(mode)) {
      return new Response(JSON.stringify({ error: "mode must be 'casual' or 'verified'" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check block status in both directions
    const blocked = await serviceClient.rpc("users_blocked_each_other", {
      user_a: user.id,
      user_b: receiver_id,
    });

    if (blocked.data === true) {
      return new Response(
        JSON.stringify({ error: "Cannot send hangout request to this user" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Check receiver exists
    const { data: receiver } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", receiver_id)
      .single();

    if (!receiver) {
      return new Response(JSON.stringify({ error: "Receiver not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { data: newRequest, error: insertError } = await serviceClient
      .from("hangout_requests")
      .insert({
        sender_id: user.id,
        receiver_id,
        mode,
        activity,
        proposed_time: proposedDate.toISOString(),
        estimated_duration_minutes: Math.min(Math.max(Number(estimated_duration_minutes), 15), 480),
        place_name: place_name.trim(),
        general_location: general_location.trim(),
        note: note.trim(),
        status: "pending",
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("hangout request insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create hangout request" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ request: newRequest }), {
      status: 201,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create_hangout_request error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
