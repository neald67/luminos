import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FREE_QUOTA_PER_WEEK = 3;

interface PlanCard {
  title: string;
  description: string;
  activity: string;
  suggested_place_type: string;
  estimated_duration_minutes: number;
  vibe: string;
  public_space: boolean;
  budget_label: "free" | "low" | "medium";
}

const MOCK_PLANS: Record<string, PlanCard[]> = {
  coffee: [
    {
      title: "Specialty Pour-Over Session",
      description: "Find a cozy third-wave coffee shop, grab a pour-over, and people-watch out the window. No agenda needed.",
      activity: "coffee",
      suggested_place_type: "specialty coffee shop",
      estimated_duration_minutes: 60,
      vibe: "chill, lowkey",
      public_space: true,
      budget_label: "low",
    },
  ],
  boba: [
    {
      title: "Boba Crawl",
      description: "Hit two boba spots in the same neighborhood and rank them. Brown sugar milk tea vs. taro — you decide the winner.",
      activity: "boba",
      suggested_place_type: "boba tea shop",
      estimated_duration_minutes: 75,
      vibe: "fun, competitive",
      public_space: true,
      budget_label: "low",
    },
  ],
  walk: [
    {
      title: "Sunset Walk",
      description: "Pick a park or waterfront path, walk and talk until the sun goes down. Simple and surprisingly great every time.",
      activity: "walk",
      suggested_place_type: "park or waterfront",
      estimated_duration_minutes: 60,
      vibe: "relaxed, scenic",
      public_space: true,
      budget_label: "free",
    },
  ],
  photos: [
    {
      title: "Golden Hour Photo Shoot",
      description: "Find a mural, rooftop view, or botanical garden and take turns being photographer. No pro gear needed.",
      activity: "photos",
      suggested_place_type: "outdoor murals or park",
      estimated_duration_minutes: 90,
      vibe: "creative, aesthetic",
      public_space: true,
      budget_label: "free",
    },
  ],
  basketball: [
    {
      title: "Pickup Run at the Courts",
      description: "Head to the nearest outdoor courts for a casual game. Bring water, warm up properly, and keep it fun.",
      activity: "basketball",
      suggested_place_type: "public basketball courts",
      estimated_duration_minutes: 90,
      vibe: "active, energetic",
      public_space: true,
      budget_label: "free",
    },
  ],
  food: [
    {
      title: "Local Lunch Spot Discovery",
      description: "Pick a neighborhood you haven't eaten in, walk until something looks good, and just go in. No Yelp allowed.",
      activity: "food",
      suggested_place_type: "local restaurant",
      estimated_duration_minutes: 75,
      vibe: "adventurous, social",
      public_space: true,
      budget_label: "medium",
    },
  ],
  study: [
    {
      title: "Library Power Session",
      description: "Claim a table at the public library, work in parallel, and break every 45 min for a snack run. Accountability with company.",
      activity: "study",
      suggested_place_type: "public library",
      estimated_duration_minutes: 120,
      vibe: "focused, productive",
      public_space: true,
      budget_label: "free",
    },
  ],
  board_games: [
    {
      title: "Board Game Café Night",
      description: "Head to a board game café, pick something neither of you has played before, and learn it together. Extra points for dramatic losses.",
      activity: "board_games",
      suggested_place_type: "board game café",
      estimated_duration_minutes: 120,
      vibe: "fun, competitive",
      public_space: true,
      budget_label: "low",
    },
  ],
  thrift: [
    {
      title: "Thrift Store Challenge",
      description: "$10 budget each. Best find wins bragging rights. Meet back at the front in 30 minutes.",
      activity: "thrift",
      suggested_place_type: "thrift or vintage store",
      estimated_duration_minutes: 90,
      vibe: "fun, creative",
      public_space: true,
      budget_label: "low",
    },
  ],
  open_mic: [
    {
      title: "Open Mic Night",
      description: "Find a local open mic at a café or bookstore. You don't have to perform — just show up, order a drink, and enjoy other people's courage.",
      activity: "open_mic",
      suggested_place_type: "café or bookstore with open mic",
      estimated_duration_minutes: 120,
      vibe: "artsy, social",
      public_space: true,
      budget_label: "low",
    },
  ],
  gym: [
    {
      title: "Partner Workout",
      description: "Meet at a public gym or outdoor fitness area. Spot each other, keep it conversational. Post-workout protein smoothie is mandatory.",
      activity: "gym",
      suggested_place_type: "gym or outdoor fitness area",
      estimated_duration_minutes: 75,
      vibe: "active, supportive",
      public_space: true,
      budget_label: "low",
    },
  ],
  gaming: [
    {
      title: "Arcade Run",
      description: "Hit up a local arcade — budget $10 in tokens and go head-to-head on racing or air hockey. Retro is always better.",
      activity: "gaming",
      suggested_place_type: "arcade or gaming center",
      estimated_duration_minutes: 90,
      vibe: "playful, nostalgic",
      public_space: true,
      budget_label: "low",
    },
  ],
  library: [
    {
      title: "Browse & Chill",
      description: "Go to the library with zero agenda. Wander the stacks, pick up random books, read a few pages of each. Leave with one pick.",
      activity: "library",
      suggested_place_type: "public library",
      estimated_duration_minutes: 60,
      vibe: "calm, exploratory",
      public_space: true,
      budget_label: "free",
    },
  ],
};

const DEFAULT_PLANS: PlanCard[] = [
  {
    title: "Coffee & People Watch",
    description: "Grab your favorite drink at a busy café and find a window seat. Best people-watching stories win.",
    activity: "coffee",
    suggested_place_type: "café",
    estimated_duration_minutes: 60,
    vibe: "relaxed, social",
    public_space: true,
    budget_label: "low",
  },
  {
    title: "Neighborhood Walk",
    description: "Pick a neighborhood neither of you knows well and just wander. No destination required.",
    activity: "walk",
    suggested_place_type: "city streets or park",
    estimated_duration_minutes: 60,
    vibe: "chill, exploratory",
    public_space: true,
    budget_label: "free",
  },
  {
    title: "Boba & Bench",
    description: "Get boba and find a good bench or plaza to sit and talk. Underrated classic.",
    activity: "boba",
    suggested_place_type: "boba shop + public park or plaza",
    estimated_duration_minutes: 75,
    vibe: "lowkey, fun",
    public_space: true,
    budget_label: "low",
  },
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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { user_ids = [], activity, radius, budget, time_window } = body;

    // Check subscription entitlement
    const { data: subscription } = await serviceClient
      .from("subscriptions")
      .select("entitlement, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("entitlement", ["hangout_plus", "premium"])
      .limit(1)
      .single();

    const hasPremium = subscription != null;

    if (!hasPremium) {
      // Check free quota: 3 per week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentUsage } = await serviceClient
        .from("points_ledger")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "admin_adjustment")
        .like("reason", "plan_ideas_quota%")
        .gte("created_at", weekAgo);

      if ((recentUsage?.length ?? 0) >= FREE_QUOTA_PER_WEEK) {
        return new Response(
          JSON.stringify({
            error: `Free plan idea quota reached (${FREE_QUOTA_PER_WEEK}/week). Upgrade to Hangout+ for unlimited ideas.`,
            quota_exceeded: true,
          }),
          { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Log quota usage
      await serviceClient.from("points_ledger").insert({
        user_id: user.id,
        type: "admin_adjustment",
        amount: 0,
        reason: `plan_ideas_quota_use_${Date.now()}`,
        status: "approved",
        metadata: { feature: "generate_plan_ideas", activity, user_ids },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    let plans: PlanCard[] = [];

    if (anthropicKey) {
      // Call Claude claude-haiku-4-5-20251001 for dynamic suggestions
      const systemPrompt = `You are a helpful assistant for a social hangout app. Generate exactly 3 specific, realistic, and fun hangout plan ideas as a JSON array. Each plan must be at a PUBLIC place (never a private residence). Each plan object must have these exact fields: title (string), description (string, 1-2 sentences), activity (string), suggested_place_type (string), estimated_duration_minutes (number), vibe (string), public_space (boolean, always true), budget_label ("free"|"low"|"medium"). Keep descriptions concise and energetic.`;

      const userMessage = [
        activity ? `Activity preference: ${activity}` : "No specific activity preference",
        radius ? `Radius: ${radius} miles` : "",
        budget ? `Budget: ${budget}` : "",
        time_window ? `Time window: ${time_window}` : "",
        user_ids.length > 1 ? `Group of ${user_ids.length} people` : "2 people",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: `Generate 3 hangout plan ideas for: ${userMessage}. Return ONLY a valid JSON array of plan objects, no other text.`,
              },
            ],
          }),
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          const content = claudeData.content?.[0]?.text ?? "";
          // Extract JSON array from response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              plans = parsed.slice(0, 3);
            }
          }
        }
      } catch (claudeErr) {
        console.error("Claude API call failed, falling back to mock plans:", claudeErr);
      }
    }

    // Fallback to mock plans if Claude not available or failed
    if (plans.length === 0) {
      if (activity && MOCK_PLANS[activity]) {
        plans = [...MOCK_PLANS[activity]];
        // Fill remaining with defaults from other categories
        const otherActivities = Object.keys(MOCK_PLANS).filter((k) => k !== activity);
        let i = 0;
        while (plans.length < 3 && i < otherActivities.length) {
          plans.push(MOCK_PLANS[otherActivities[i]][0]);
          i++;
        }
      } else {
        plans = DEFAULT_PLANS;
      }
      plans = plans.slice(0, 3);
    }

    return new Response(
      JSON.stringify({
        plans,
        source: anthropicKey && plans.length > 0 ? "ai" : "curated",
        quota_remaining: hasPremium ? null : FREE_QUOTA_PER_WEEK - 1,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate_plan_ideas error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
