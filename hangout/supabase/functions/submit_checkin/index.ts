import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.toUpperCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    const { hangout_id, scanned_code, lat, lng, event_type = "qr_scanned" } = body;

    if (!hangout_id || !scanned_code) {
      return new Response(
        JSON.stringify({ error: "hangout_id and scanned_code are required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is a participant
    const { data: participant } = await serviceClient
      .from("hangout_participants")
      .select("id, user_id")
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return new Response(
        JSON.stringify({ error: "You are not a participant in this hangout" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Hash the submitted code
    const submittedHash = await hashCode(scanned_code);

    // Find matching QR code
    const { data: qrCode } = await serviceClient
      .from("qr_checkin_codes")
      .select("*")
      .eq("hangout_id", hangout_id)
      .eq("code_hash", submittedHash)
      .is("used_at", null)
      .single();

    if (!qrCode) {
      return new Response(
        JSON.stringify({ error: "Invalid or already used check-in code" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date(qrCode.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: "Check-in code has expired" }),
        { status: 410, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Must be scanning OTHER participant's code (not your own)
    if (qrCode.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: "You cannot scan your own check-in code" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Mark code as used
    await serviceClient
      .from("qr_checkin_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", qrCode.id);

    // Update participant check-in time
    await serviceClient
      .from("hangout_participants")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id);

    // Compute geohash from coordinates (approximate, for privacy)
    let approxGeohash: string | null = null;
    if (typeof lat === "number" && typeof lng === "number") {
      const roundedLat = Math.round(lat * 200) / 200;
      const roundedLng = Math.round(lng * 200) / 200;
      approxGeohash = geohashFromCoords(roundedLat, roundedLng, 5);
    }

    // Insert verification event
    await serviceClient.from("verification_events").insert({
      hangout_id,
      user_id: user.id,
      event_type: "qr_scanned",
      approximate_geohash: approxGeohash,
      metadata: {
        qr_code_id: qrCode.id,
        code_owner_id: qrCode.user_id,
        event_type,
      },
    });

    // Check verification progress — how many participants have checked in?
    const { data: allParticipants } = await serviceClient
      .from("hangout_participants")
      .select("user_id, checked_in_at, status")
      .eq("hangout_id", hangout_id);

    const totalCount = allParticipants?.length ?? 0;
    const checkedInCount = allParticipants?.filter((p) => p.checked_in_at != null).length ?? 0;
    const allCheckedIn = checkedInCount >= totalCount && totalCount > 0;

    if (allCheckedIn) {
      await serviceClient
        .from("hangouts")
        .update({ verification_status: "completed" })
        .eq("id", hangout_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked_in: true,
        progress: { checked_in: checkedInCount, total: totalCount, all_checked_in: allCheckedIn },
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("submit_checkin error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
