import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Base bonus reward per completion
const BASE_BONUS_HP = 25;
const MAX_BONUS_HP = 100;

/** Compute duration multiplier based on total verified minutes */
function durationMultiplier(verifiedMinutes: number): number {
  if (verifiedMinutes >= 120) return 1.5;
  if (verifiedMinutes >= 60) return 1.2;
  if (verifiedMinutes >= 30) return 1.0;
  return 0.8;
}

/** Group size multiplier */
function groupMultiplier(groupSize: number): number {
  if (groupSize >= 4) return 1.3;
  if (groupSize >= 3) return 1.15;
  return 1.0;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // This function is service-role only — verify via service key or internal call
    const authHeader = req.headers.get("Authorization") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Allow calls authenticated with the service role key only.
    // Do NOT trust arbitrary request headers (x-internal-call etc.) as they can be spoofed by clients.
    const isServiceRole = authHeader === `Bearer ${serviceKey}`;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey
    );

    // Also allow authenticated user calls (for the hangout participants)
    if (!isServiceRole) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const { hangout_id } = body;

    if (!hangout_id) {
      return new Response(JSON.stringify({ error: "hangout_id is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Load hangout
    const { data: hangout } = await serviceClient
      .from("hangouts")
      .select("id, status, mode, start_time, end_time, verified_duration_minutes")
      .eq("id", hangout_id)
      .single();

    if (!hangout || hangout.status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Hangout is not in completed status" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Idempotency check — if completion_bonus ledger entries already exist, skip
    const { data: existingBonus } = await serviceClient
      .from("points_ledger")
      .select("id")
      .eq("hangout_id", hangout_id)
      .eq("type", "completion_bonus")
      .limit(1);

    if (existingBonus && existingBonus.length > 0) {
      return new Response(
        JSON.stringify({ success: true, already_awarded: true }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Load participants
    const { data: participants } = await serviceClient
      .from("hangout_participants")
      .select("user_id, status, checked_in_at, completed_at, no_show")
      .eq("hangout_id", hangout_id);

    if (!participants || participants.length === 0) {
      return new Response(JSON.stringify({ error: "No participants found" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Load verification events to compute verified duration
    const { data: verificationEvents } = await serviceClient
      .from("verification_events")
      .select("event_type, timestamp, user_id")
      .eq("hangout_id", hangout_id)
      .order("timestamp", { ascending: true });

    // Compute verified duration from start/end events or checkin timing
    let verifiedMinutes = hangout.verified_duration_minutes ?? 0;
    if (verifiedMinutes === 0 && hangout.start_time && hangout.end_time) {
      const startMs = new Date(hangout.start_time).getTime();
      const endMs = new Date(hangout.end_time).getTime();
      verifiedMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));
    }
    if (verifiedMinutes === 0) {
      // Compute from first qr_scanned to end event
      const firstScan = verificationEvents?.find((e) => e.event_type === "qr_scanned");
      const endEvent = verificationEvents?.find((e) => e.event_type === "end");
      if (firstScan && endEvent) {
        const startMs = new Date(firstScan.timestamp).getTime();
        const endMs = new Date(endEvent.timestamp).getTime();
        verifiedMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));
      }
    }

    // Check for repeat pair penalty (same pair in rolling 7 days)
    const completedParticipantIds = participants
      .filter((p) => p.status === "completed" && !p.no_show)
      .map((p) => p.user_id);

    const groupSize = completedParticipantIds.length;

    if (groupSize === 0) {
      return new Response(
        JSON.stringify({ success: true, awarded: 0, note: "No completed participants" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Check new connection multiplier (first hangout between this pair)
    let newConnectionMultiplier = 1.0;
    if (groupSize === 2) {
      const [userA, userB] = completedParticipantIds;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: priorHangouts } = await serviceClient
        .from("hangout_participants")
        .select("hangout_id")
        .eq("user_id", userA)
        .neq("hangout_id", hangout_id);

      const priorHangoutIds = (priorHangouts ?? []).map((p) => p.hangout_id);

      if (priorHangoutIds.length > 0) {
        const { data: sharedPrior } = await serviceClient
          .from("hangout_participants")
          .select("hangout_id")
          .eq("user_id", userB)
          .in("hangout_id", priorHangoutIds);

        const isFirstHangoutTogether = !sharedPrior || sharedPrior.length === 0;
        if (isFirstHangoutTogether) newConnectionMultiplier = 1.2;

        // Repeat pair penalty: same two users within 7 days
        const { data: recentHangouts } = await serviceClient
          .from("hangouts")
          .select("id")
          .in(
            "id",
            (sharedPrior ?? []).map((r: { hangout_id: string }) => r.hangout_id)
          )
          .gte("start_time", sevenDaysAgo)
          .neq("id", hangout_id);

        if (recentHangouts && recentHangouts.length > 0) {
          newConnectionMultiplier = Math.min(newConnectionMultiplier, 0.7);
        }
      } else {
        // No prior hangouts with anyone — definitely new connection
        newConnectionMultiplier = 1.2;
      }
    }

    // Compute risk score
    const { data: riskRecord } = await serviceClient
      .from("hangout_risk_scores")
      .select("score")
      .eq("hangout_id", hangout_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const riskScore = riskRecord?.score ?? 0;
    const riskMultiplier = riskScore > 70 ? 0.5 : riskScore > 40 ? 0.8 : 1.0;

    // Compute final bonus per participant
    const durationMult = durationMultiplier(verifiedMinutes);
    const groupMult = groupMultiplier(groupSize);
    const rawBonus = BASE_BONUS_HP * durationMult * groupMult * newConnectionMultiplier * riskMultiplier;
    const finalBonus = Math.min(Math.round(rawBonus), MAX_BONUS_HP);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Award each completed participant
    for (const userId of completedParticipantIds) {
      const { data: wallet } = await serviceClient
        .from("points_wallets")
        .select("balance, lifetime_earned, weekly_score")
        .eq("user_id", userId)
        .single();

      if (!wallet) continue;

      let totalCredit = finalBonus;

      // Return stake if verified mode
      if (hangout.mode === "verified") {
        const { data: escrow } = await serviceClient
          .from("point_escrows")
          .select("id, amount, status")
          .eq("hangout_id", hangout_id)
          .eq("user_id", userId)
          .single();

        if (escrow && escrow.status === "locked") {
          const stakeAmount = escrow.amount;
          totalCredit += stakeAmount;

          await serviceClient
            .from("point_escrows")
            .update({ status: "returned", resolved_at: new Date().toISOString() })
            .eq("id", escrow.id);

          await serviceClient.from("points_ledger").insert({
            user_id: userId,
            hangout_id,
            escrow_id: escrow.id,
            type: "stake_return",
            amount: stakeAmount,
            status: "returned",
            reason: `Stake returned on successful hangout completion`,
            metadata: { hangout_id, verified_minutes: verifiedMinutes },
          });
        }
      }

      // Completion bonus ledger entry
      await serviceClient.from("points_ledger").insert({
        user_id: userId,
        hangout_id,
        type: "completion_bonus",
        amount: finalBonus,
        status: "approved",
        approved_at: new Date().toISOString(),
        reason: `Hangout completion bonus`,
        risk_score: riskScore,
        metadata: {
          verified_minutes: verifiedMinutes,
          duration_mult: durationMult,
          group_mult: groupMult,
          connection_mult: newConnectionMultiplier,
          risk_mult: riskMultiplier,
          base_bonus: BASE_BONUS_HP,
          final_bonus: finalBonus,
        },
      });

      // Update wallet
      await serviceClient
        .from("points_wallets")
        .update({
          balance: wallet.balance + totalCredit,
          lifetime_earned: wallet.lifetime_earned + finalBonus,
          weekly_score: wallet.weekly_score + finalBonus,
        })
        .eq("user_id", userId);

      // Upsert leaderboard snapshot for this week
      await serviceClient.from("leaderboard_snapshots").upsert(
        {
          scope: "city",
          scope_id: null,
          user_id: userId,
          score: wallet.weekly_score + finalBonus,
          rank: 0, // rank computed separately
          period_start: weekStart.toISOString().split("T")[0],
          period_end: weekEnd.toISOString().split("T")[0],
        },
        { onConflict: "user_id,scope,period_start" }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        bonus_per_participant: finalBonus,
        participants_awarded: completedParticipantIds.length,
        verified_minutes: verifiedMinutes,
        multipliers: {
          duration: durationMult,
          group: groupMult,
          new_connection: newConnectionMultiplier,
          risk: riskMultiplier,
        },
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("award_points error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
