import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DistanceBucket = "super_close" | "nearby" | "bit_further" | "far";

function getDistanceBucket(distanceMeters: number): DistanceBucket {
  if (distanceMeters < 800) return "super_close";
  if (distanceMeters < 1600) return "nearby";
  if (distanceMeters < 5000) return "bit_further";
  return "far";
}

function getReliabilityLabel(score: number): string {
  if (score >= 90) return "very_reliable";
  if (score >= 75) return "reliable";
  if (score >= 50) return "fair";
  return "unreliable";
}

function getPointsBadge(balance: number): string {
  if (balance >= 400) return "gold";
  if (balance >= 200) return "silver";
  if (balance >= 100) return "bronze";
  return "starter";
}

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

    // Check safety onboarding
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("safety_onboarding_completed, community_id")
      .eq("id", user.id)
      .single();

    if (!requesterProfile?.safety_onboarding_completed) {
      return new Response(
        JSON.stringify({ error: "Safety onboarding must be completed before viewing nearby users" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { lat, lng, radius_miles = 5, available_for, community_id } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat and lng are required numbers" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const radiusMeters = Math.min(radius_miles, 25) * 1609.34;

    // Use service role client for PostGIS query (location is hidden from direct client access)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch blocked users in both directions
    const { data: blockedRows } = await serviceClient
      .from("blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedUserIds = new Set<string>();
    for (const row of blockedRows ?? []) {
      if (row.blocker_id === user.id) blockedUserIds.add(row.blocked_id);
      else blockedUserIds.add(row.blocker_id);
    }

    // PostGIS nearby query — attempts the RPC first, falls back to table scan with client-side distance filter
    let nearbyRows: unknown[] | null = null;
    let geoError: unknown = null;

    const rpcResult = await serviceClient.rpc("get_nearby_available_users", {
      p_lat: lat,
      p_lng: lng,
      p_radius_meters: radiusMeters,
      p_exclude_user_id: user.id,
    });

    if (!rpcResult.error && rpcResult.data) {
      // RPC succeeded — use its results (already radius-filtered by PostGIS)
      nearbyRows = rpcResult.data;
    } else {
      // Fallback: full table scan; radius filtering applied client-side via Haversine below
      const fallback = await serviceClient
        .from("availability_sessions")
        .select(`
          id,
          user_id,
          available_for,
          status_note,
          expires_at,
          location,
          profiles!inner(
            id,
            username,
            display_name,
            avatar_url,
            bio,
            community_id,
            points_wallets(balance, reliability_score)
          )
        `)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString());

      if (fallback.error) {
        geoError = fallback.error;
      } else {
        nearbyRows = fallback.data;
      }
    }

    if (geoError) {
      console.error("Geo query error:", geoError);
      return new Response(JSON.stringify({ error: "Failed to query nearby users" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Filter and transform results
    const results = [];

    for (const session of nearbyRows ?? []) {
      // Skip self
      if (session.user_id === user.id) continue;

      // Skip blocked users
      if (blockedUserIds.has(session.user_id)) continue;

      // Filter by available_for if requested
      if (available_for?.length > 0) {
        const hasMatch = session.available_for?.some((a: string) =>
          available_for.includes(a)
        );
        if (!hasMatch) continue;
      }

      // Community filter — check the session owner's profile community, not the requester's
      if (community_id) {
        const profileCommunityId = (session.profiles as any)?.community_id ?? null;
        if (profileCommunityId !== community_id) continue;
      }

      // Calculate distance using PostGIS values if available
      // For now compute approximate distance from stored coordinates
      const sessionLng = session.location?.coordinates?.[0];
      const sessionLat = session.location?.coordinates?.[1];
      let distanceMeters = 9999;

      if (sessionLat != null && sessionLng != null) {
        // Haversine approximation
        const R = 6371000;
        const dLat = ((sessionLat - lat) * Math.PI) / 180;
        const dLng = ((sessionLng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((sessionLat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        distanceMeters = 2 * R * Math.asin(Math.sqrt(a));
      }

      if (distanceMeters > radiusMeters) continue;

      const profile = session.profiles as any;
      const wallet = Array.isArray(profile?.points_wallets)
        ? profile.points_wallets[0]
        : profile?.points_wallets;

      const expiresAt = new Date(session.expires_at);
      const expiresInMinutes = Math.max(
        0,
        Math.round((expiresAt.getTime() - Date.now()) / 60000)
      );

      results.push({
        user_id: session.user_id,
        display_name: profile?.display_name ?? "",
        username: profile?.username ?? "",
        avatar_url: profile?.avatar_url ?? null,
        bio_short: profile?.bio ? profile.bio.slice(0, 80) : null,
        available_for: session.available_for ?? [],
        status_note: session.status_note ?? null,
        distance_bucket: getDistanceBucket(distanceMeters),
        expires_in_minutes: expiresInMinutes,
        points_badge: getPointsBadge(wallet?.balance ?? 0),
        reliability_label: getReliabilityLabel(wallet?.reliability_score ?? 100),
        mutual_crew_count: 0,
      });
    }

    // Sort by distance bucket then expiry
    const bucketOrder: Record<DistanceBucket, number> = {
      super_close: 0,
      nearby: 1,
      bit_further: 2,
      far: 3,
    };
    results.sort(
      (a, b) =>
        bucketOrder[a.distance_bucket as DistanceBucket] -
        bucketOrder[b.distance_bucket as DistanceBucket]
    );

    return new Response(JSON.stringify({ users: results }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("nearby_available error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
