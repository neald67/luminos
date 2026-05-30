import type { PlanCard, ActivityType } from '@/lib/types';

// Generate 3 AI plan card ideas
// If API key present: call AI (Anthropic or OpenAI)
// If not: return high-quality mock plans
export async function generatePlanIdeas(params: {
  activity?: ActivityType;
  radiusMiles: number;
  budgetHint?: string;
  timeWindow?: string;
  userAName: string;
  userBName: string;
}): Promise<PlanCard[]> {
  const apiKey =
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return getMockPlanCards(params.activity);
  }

  // If we have an Anthropic key, attempt AI generation
  if (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    try {
      const prompt = buildPrompt(params);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-20240307',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        console.warn('AI plan generation failed, using mock plans');
        return getMockPlanCards(params.activity);
      }

      const data = await response.json();
      const text = data?.content?.[0]?.text ?? '';
      const parsed = parsePlanCards(text);
      if (parsed.length > 0) return parsed;
    } catch (err) {
      console.warn('AI plan generation error:', err);
    }
  }

  return getMockPlanCards(params.activity);
}

function buildPrompt(params: {
  activity?: ActivityType;
  radiusMiles: number;
  budgetHint?: string;
  timeWindow?: string;
  userAName: string;
  userBName: string;
}): string {
  return `Generate 3 hangout plan ideas for ${params.userAName} and ${params.userBName}.
Activity preference: ${params.activity ?? 'any'}
Radius: ${params.radiusMiles} miles
Budget: ${params.budgetHint ?? 'flexible'}
Time: ${params.timeWindow ?? 'flexible'}

Return JSON array with this shape:
[{
  "title": string,
  "vibe": string,
  "activity": string,
  "suggestedPlaceType": string,
  "durationMinutes": number,
  "estimatedBudget": string,
  "whyItFits": string,
  "safetyNote": string,
  "suggestedMessage": string
}]`;
}

function parsePlanCards(text: string): PlanCard[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as PlanCard[];
  } catch {
    return [];
  }
}

// Always return mock plans if API key missing
function getMockPlanCards(activity?: ActivityType): PlanCard[] {
  return [
    {
      title: 'Coffee + Walk Loop',
      vibe: 'Chill, low-pressure',
      activity: 'coffee',
      suggestedPlaceType: 'Local coffee shop near a park',
      durationMinutes: 75,
      estimatedBudget: '$5-12',
      whyItFits: 'Low commitment, public, easy exit if vibe is off',
      safetyNote: 'Public place recommended. Meet at the coffee shop.',
      suggestedMessage: 'Coffee at 4:30 then a walk? Low stakes, public spot.',
    },
    {
      title: 'Boba Study Session',
      vibe: 'Productive, chill',
      activity: 'boba',
      suggestedPlaceType: 'Boba shop with seating',
      durationMinutes: 90,
      estimatedBudget: '$6-10',
      whyItFits: 'Built-in task (studying) takes the pressure off',
      safetyNote: 'Public place recommended.',
      suggestedMessage: 'Boba and study session? Bring your laptop.',
    },
    {
      title: 'Thrift + Food Run',
      vibe: 'Adventurous, casual',
      activity: 'thrift',
      suggestedPlaceType: 'Thrift store then nearby food spot',
      durationMinutes: 120,
      estimatedBudget: '$10-25',
      whyItFits: 'Natural flow from one place to another, easy conversation',
      safetyNote: 'Public places the whole time.',
      suggestedMessage: "Thrift run then grab food after? There's a good spot nearby.",
    },
  ];
}
