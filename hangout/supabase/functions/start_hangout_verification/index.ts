import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous chars
const CODE_LENGTH = 8;
const CODE_EXPIRY_SECONDS = 60;

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => CODE_CHARSET[b % CODE_CHARSET.length])
    .join("");
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

    // Verify hangout status
    const { data: hangout } = await serviceClient
      .from("hangouts")
      .select("id, status, mode")
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
        JSON.stringify({ error: `Cannot start verification for hangout with status: ${hangout.status}` }),
        { status: 409, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Generate QR code
    const rawCode = generateCode();
    const codeHash = await hashCode(rawCode);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_SECONDS * 1000).toISOString();

    const { data: qrRecord, error: qrError } = await serviceClient
      .from("qr_checkin_codes")
      .insert({
        hangout_id,
        user_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (qrError) {
      console.error("QR code insert error:", qrError);
      return new Response(JSON.stringify({ error: "Failed to generate verification code" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Log verification event
    await serviceClient.from("verification_events").insert({
      hangout_id,
      user_id: user.id,
      event_type: "qr_generated",
      metadata: { qr_code_id: qrRecord.id },
    });

    // Update hangout verification status if not started
    if (hangout.status === "planned") {
      await serviceClient
        .from("hangouts")
        .update({ status: "active", verification_status: "in_progress" })
        .eq("id", hangout_id);
    }

    return new Response(
      JSON.stringify({
        code: rawCode,
        expires_at: expiresAt,
        qr_code_id: qrRecord.id,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("start_hangout_verification error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
