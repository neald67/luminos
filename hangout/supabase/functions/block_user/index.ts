import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
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
    const { blocked_id, unblock = false } = body;

    if (!blocked_id) {
      return new Response(JSON.stringify({ error: "blocked_id is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (blocked_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot block yourself" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Unblock
    if (unblock) {
      const { error: deleteError } = await serviceClient
        .from("blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", blocked_id);

      if (deleteError) {
        console.error("unblock error:", deleteError);
        return new Response(JSON.stringify({ error: "Failed to unblock user" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ success: true, action: "unblocked", blocked_id }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Block — upsert to avoid duplicates
    const { error: blockError } = await serviceClient
      .from("blocks")
      .upsert(
        { blocker_id: user.id, blocked_id },
        { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true }
      );

    if (blockError) {
      console.error("block insert error:", blockError);
      return new Response(JSON.stringify({ error: "Failed to block user" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Cancel any active/pending hangout requests between the two users
    await serviceClient
      .from("hangout_requests")
      .update({ status: "canceled" })
      .eq("status", "pending")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${blocked_id}),and(sender_id.eq.${blocked_id},receiver_id.eq.${user.id})`
      );

    return new Response(
      JSON.stringify({ success: true, action: "blocked", blocked_id }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("block_user error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
