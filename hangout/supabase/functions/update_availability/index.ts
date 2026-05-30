import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function geohashFromCoords(lat: number, lng: number, precision = 5): string {
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let idx = 0, bit = 0;
  let even = true;
  let latRange = [-90.0, 90.0];
  let lngRange = [-180.0, 180.0];
  let hash = "";
  while (hash.length < precision) {
    if (even) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) { idx = (idx << 1) | 1; lngRange[0] = mid; }
      else { idx = idx << 1; lngRange[1] = mid; }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) { idx = (idx << 1) | 1; latRange[0] = mid; }
      else { idx = idx << 1; latRange[1] = mid; }
    }
    even = !even;
    if (++bit === 5) { hash += BASE32[idx]; idx = 0; bit = 0; }
  }
  return hash;
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

    const body = await req.json();
    const {
      active,
      lat,
      lng,
      radius_miles = 3,
      duration_minutes = 60,
      available_for = [],
      status_note,
    } = body;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // End any existing active sessions
    await serviceClient
      .from("availability_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active");

    if (!active) {
      return new Response(JSON.stringify({ active: false }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Validate inputs
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ error: "lat and lng are required when setting active=true" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const clampedRadius = Math.min(Math.max(Number(radius_miles), 1), 25);
    const clampedDuration = Math.min(Math.max(Number(duration_minutes), 15), 480);

    if (!Array.isArray(available_for) || available_for.length === 0) {
      return new Response(
        JSON.stringify({ error: "available_for must have at least one activity" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Round coordinates to ~500m precision for privacy
    const roundedLat = Math.round(lat * 200) / 200;
    const roundedLng = Math.round(lng * 200) / 200;
    const geohash = geohashFromCoords(roundedLat, roundedLng, 5);

    const expiresAt = new Date(Date.now() + clampedDuration * 60 * 1000).toISOString();

    const { data: newSession, error: insertError } = await serviceClient
      .from("availability_sessions")
      .insert({
        user_id: user.id,
        status: "active",
        available_for,
        status_note: status_note ?? null,
        radius_miles: clampedRadius,
        location: `SRID=4326;POINT(${roundedLng} ${roundedLat})`,
        approximate_geohash: geohash,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("availability insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create availability session" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        active: true,
        session_id: newSession.id,
        expires_at: newSession.expires_at,
        approximate_geohash: newSession.approximate_geohash,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("update_availability error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
