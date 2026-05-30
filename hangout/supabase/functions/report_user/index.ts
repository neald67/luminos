import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_CATEGORIES = [
  "harassment",
  "unsafe_behavior",
  "fake_profile",
  "spam",
  "inappropriate_content",
  "underage_concern",
  "no_show_abuse",
  "location_abuse",
  "other",
];

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
      reported_user_id,
      reported_event_id,
      reported_message_id,
      reported_hangout_id,
      category,
      details,
    } = body;

    // At least one reported entity is required
    if (!reported_user_id && !reported_event_id && !reported_message_id && !reported_hangout_id) {
      return new Response(
        JSON.stringify({ error: "At least one of reported_user_id, reported_event_id, reported_message_id, or reported_hangout_id is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return new Response(
        JSON.stringify({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Cannot report yourself
    if (reported_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot report yourself" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert report
    const { data: report, error: reportError } = await serviceClient
      .from("reports")
      .insert({
        reporter_id: user.id,
        reported_user_id: reported_user_id ?? null,
        reported_event_id: reported_event_id ?? null,
        reported_message_id: reported_message_id ?? null,
        reported_hangout_id: reported_hangout_id ?? null,
        category,
        details: details ?? null,
        status: "open",
      })
      .select()
      .single();

    if (reportError) {
      console.error("report insert error:", reportError);
      return new Response(JSON.stringify({ error: "Failed to submit report" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // If hangout involved and category is safety-related, hold any pending points awards
    const safetyCats = ["harassment", "unsafe_behavior", "underage_concern", "no_show_abuse", "location_abuse"];
    if (reported_hangout_id && safetyCats.includes(category)) {
      await serviceClient
        .from("points_ledger")
        .update({ status: "held" })
        .eq("hangout_id", reported_hangout_id)
        .eq("status", "approved")
        .in("type", ["completion_bonus", "stake_return"]);
    }

    return new Response(
      JSON.stringify({ success: true, report_id: report.id }),
      { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("report_user error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
