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
    const { hangout_id, reason, safety_cancel = false } = body;

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
      .select("id, status")
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return new Response(
        JSON.stringify({ error: "You are not a participant in this hangout" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Fetch hangout details
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

    if (!["planned", "active"].includes(hangout.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot cancel hangout with status: ${hangout.status}` }),
        { status: 409, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const startTime = new Date(hangout.start_time);
    const minutesUntilStart = (startTime.getTime() - now.getTime()) / 60000;
    const isVerifiedMode = hangout.mode === "verified";

    // Safety cancel — no penalty, freeze escrows
    if (safety_cancel) {
      await serviceClient
        .from("hangouts")
        .update({ status: "safety_cancelled" })
        .eq("id", hangout_id);

      await serviceClient
        .from("hangout_participants")
        .update({ status: "canceled", canceled_at: now.toISOString() })
        .eq("hangout_id", hangout_id);

      if (isVerifiedMode) {
        await serviceClient
          .from("point_escrows")
          .update({ status: "frozen" })
          .eq("hangout_id", hangout_id);
      }

      await serviceClient.from("verification_events").insert({
        hangout_id,
        user_id: user.id,
        event_type: "safety_bail",
        metadata: { reason: reason ?? "safety_cancel", triggered_by: user.id },
      });

      return new Response(
        JSON.stringify({ success: true, status: "safety_cancelled", penalty: 0 }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Standard cancel — apply time-based penalty
    let cancelerReturnPercent = 1.0;
    let otherUserRespiteHp = 0;

    if (minutesUntilStart > 120) {
      // >2h before: return 80%, forfeit 20%
      cancelerReturnPercent = 0.8;
      otherUserRespiteHp = 0;
    } else if (minutesUntilStart > 0) {
      // <2h before: return 50%, forfeit 50%, +5 HP to other user
      cancelerReturnPercent = 0.5;
      otherUserRespiteHp = 5;
    } else {
      // No-show (post start_time): forfeit 100%, +10 HP to other user
      cancelerReturnPercent = 0;
      otherUserRespiteHp = 10;

      await serviceClient
        .from("hangout_participants")
        .update({ no_show: true })
        .eq("hangout_id", hangout_id)
        .eq("user_id", user.id);
    }

    // Update hangout and participants
    // A no-show is still a cancellation — use "canceled" so award_points is not triggered
    const newHangoutStatus = "canceled";
    await serviceClient
      .from("hangouts")
      .update({ status: newHangoutStatus })
      .eq("id", hangout_id);

    await serviceClient
      .from("hangout_participants")
      .update({ status: "canceled", canceled_at: now.toISOString() })
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id);

    // Process escrow if verified mode
    if (isVerifiedMode) {
      const { data: escrow } = await serviceClient
        .from("point_escrows")
        .select("id, amount, user_id")
        .eq("hangout_id", hangout_id)
        .eq("user_id", user.id)
        .single();

      if (escrow) {
        const returnAmount = Math.floor(escrow.amount * cancelerReturnPercent);
        const forfeitAmount = escrow.amount - returnAmount;

        // Update escrow status
        const escrowStatus =
          returnAmount === escrow.amount
            ? "returned"
            : returnAmount > 0
            ? "partially_returned"
            : "forfeited";

        await serviceClient
          .from("point_escrows")
          .update({ status: escrowStatus, resolved_at: now.toISOString() })
          .eq("id", escrow.id);

        // Return portion to canceler wallet
        if (returnAmount > 0) {
          const { data: cancelerWallet } = await serviceClient
            .from("points_wallets")
            .select("balance")
            .eq("user_id", user.id)
            .single();

          if (cancelerWallet) {
            await serviceClient
              .from("points_wallets")
              .update({ balance: cancelerWallet.balance + returnAmount })
              .eq("user_id", user.id);
          }

          await serviceClient.from("points_ledger").insert({
            user_id: user.id,
            hangout_id,
            escrow_id: escrow.id,
            type: "stake_return",
            amount: returnAmount,
            status: "returned",
            reason: `Partial stake return on cancellation (${Math.round(cancelerReturnPercent * 100)}% returned)`,
          });
        }

        // Record penalty
        if (forfeitAmount > 0) {
          await serviceClient.from("points_ledger").insert({
            user_id: user.id,
            hangout_id,
            escrow_id: escrow.id,
            type: "cancellation_penalty",
            amount: -forfeitAmount,
            status: "forfeited",
            reason: `Cancellation penalty: ${minutesUntilStart <= 0 ? "no-show" : "late cancellation"}`,
          });
        }

      }
    }

    // Respect rebate for other participants applies in ALL modes (casual and verified)
    if (otherUserRespiteHp > 0) {
      const { data: allParticipants } = await serviceClient
        .from("hangout_participants")
        .select("user_id")
        .eq("hangout_id", hangout_id)
        .neq("user_id", user.id);

      for (const other of allParticipants ?? []) {
        const { data: otherWallet } = await serviceClient
          .from("points_wallets")
          .select("balance")
          .eq("user_id", other.user_id)
          .single();

        if (otherWallet) {
          await serviceClient
            .from("points_wallets")
            .update({ balance: otherWallet.balance + otherUserRespiteHp })
            .eq("user_id", other.user_id);

          await serviceClient.from("points_ledger").insert({
            user_id: other.user_id,
            hangout_id,
            type: "respect_rebate",
            amount: otherUserRespiteHp,
            status: "approved",
            reason: `Respect rebate for other user's ${minutesUntilStart <= 0 ? "no-show" : "late cancellation"}`,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: newHangoutStatus,
        stake_returned_percent: Math.round(cancelerReturnPercent * 100),
        respect_rebate_awarded: otherUserRespiteHp,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cancel_hangout error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
