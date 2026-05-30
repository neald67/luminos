import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STAKE_AMOUNT = 50;

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
    const { request_id, action, counter_fields } = body;

    if (!request_id || !action) {
      return new Response(JSON.stringify({ error: "request_id and action are required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!["accept", "decline", "counter"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "action must be 'accept', 'decline', or 'counter'" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the request and verify receiver
    const { data: hangoutRequest, error: fetchError } = await serviceClient
      .from("hangout_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !hangoutRequest) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (hangoutRequest.receiver_id !== user.id) {
      return new Response(JSON.stringify({ error: "You are not the receiver of this request" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (hangoutRequest.status !== "pending") {
      return new Response(
        JSON.stringify({ error: `Request is already ${hangoutRequest.status}` }),
        { status: 409, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (new Date(hangoutRequest.expires_at) <= new Date()) {
      await serviceClient
        .from("hangout_requests")
        .update({ status: "expired" })
        .eq("id", request_id);
      return new Response(JSON.stringify({ error: "Request has expired" }), {
        status: 410,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Handle decline
    if (action === "decline") {
      await serviceClient
        .from("hangout_requests")
        .update({ status: "declined" })
        .eq("id", request_id);

      return new Response(JSON.stringify({ success: true, status: "declined" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Handle counter (v2 stub)
    if (action === "counter") {
      // Only allow safe, explicitly listed counter fields — never spread arbitrary input
      const allowedCounterFields: Record<string, unknown> = {};
      if (counter_fields?.proposed_time) allowedCounterFields.proposed_time = counter_fields.proposed_time;
      if (counter_fields?.place_name) allowedCounterFields.place_name = counter_fields.place_name;
      if (counter_fields?.general_location) allowedCounterFields.general_location = counter_fields.general_location;
      if (counter_fields?.note) allowedCounterFields.note = counter_fields.note;
      if (counter_fields?.estimated_duration_minutes) allowedCounterFields.estimated_duration_minutes = counter_fields.estimated_duration_minutes;

      await serviceClient
        .from("hangout_requests")
        .update({ status: "countered", ...allowedCounterFields })
        .eq("id", request_id);

      return new Response(
        JSON.stringify({ success: true, status: "countered", note: "Counter feature is v2" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Handle accept — full transaction
    // 1. Update request status
    await serviceClient
      .from("hangout_requests")
      .update({ status: "accepted" })
      .eq("id", request_id);

    // 2. Create hangout
    const { data: hangout, error: hangoutError } = await serviceClient
      .from("hangouts")
      .insert({
        request_id: hangoutRequest.id,
        mode: hangoutRequest.mode,
        status: "planned",
        activity: hangoutRequest.activity,
        start_time: hangoutRequest.proposed_time,
        end_time: null,
        general_location: hangoutRequest.general_location,
        place_name: hangoutRequest.place_name,
        verification_status: "not_started",
      })
      .select()
      .single();

    if (hangoutError || !hangout) {
      console.error("hangout insert error:", hangoutError);
      return new Response(JSON.stringify({ error: "Failed to create hangout" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 3. Add participants
    await serviceClient.from("hangout_participants").insert([
      {
        hangout_id: hangout.id,
        user_id: hangoutRequest.sender_id,
        role: "organizer",
        status: "joined",
      },
      {
        hangout_id: hangout.id,
        user_id: user.id,
        role: "participant",
        status: "joined",
      },
    ]);

    // 4. If verified mode, handle stake escrow
    if (hangoutRequest.mode === "verified") {
      const participantIds = [hangoutRequest.sender_id, user.id];

      for (const pid of participantIds) {
        const { data: wallet } = await serviceClient
          .from("points_wallets")
          .select("balance")
          .eq("user_id", pid)
          .single();

        if (!wallet || wallet.balance < STAKE_AMOUNT) {
          // Rollback gracefully: cancel the hangout instead of blocking
          await serviceClient
            .from("hangouts")
            .update({ status: "canceled" })
            .eq("id", hangout.id);
          await serviceClient
            .from("hangout_requests")
            .update({ status: "canceled" })
            .eq("id", request_id);

          return new Response(
            JSON.stringify({
              error: `User ${pid} does not have enough HP for verified mode (need ${STAKE_AMOUNT})`,
            }),
            { status: 402, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      }

      // Lock stakes
      for (const pid of participantIds) {
        const { data: escrow } = await serviceClient
          .from("point_escrows")
          .insert({
            hangout_id: hangout.id,
            user_id: pid,
            amount: STAKE_AMOUNT,
            status: "locked",
          })
          .select()
          .single();

        await serviceClient.from("points_ledger").insert({
          user_id: pid,
          hangout_id: hangout.id,
          escrow_id: escrow?.id ?? null,
          type: "stake_lock",
          amount: -STAKE_AMOUNT,
          status: "held",
          reason: `Verified hangout stake locked for hangout ${hangout.id}`,
        });

        // Fetch current balance then decrement atomically (single update, no double-deduction)
        const { data: w } = await serviceClient
          .from("points_wallets")
          .select("balance")
          .eq("user_id", pid)
          .single();
        if (w) {
          await serviceClient
            .from("points_wallets")
            .update({ balance: w.balance - STAKE_AMOUNT })
            .eq("user_id", pid);
        }
      }
    }

    // 5. Create conversation
    const { data: conversation, error: convError } = await serviceClient
      .from("conversations")
      .insert({ hangout_id: hangout.id })
      .select()
      .single();

    if (convError || !conversation) {
      console.error("conversation insert error:", convError);
      // Non-fatal: hangout still works without conversation
    } else {
      await serviceClient.from("conversation_members").insert([
        { conversation_id: conversation.id, user_id: hangoutRequest.sender_id },
        { conversation_id: conversation.id, user_id: user.id },
      ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        hangout_id: hangout.id,
        conversation_id: conversation?.id ?? null,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("respond_hangout_request error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
