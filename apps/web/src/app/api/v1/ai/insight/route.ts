import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

const SYSTEM_PROMPTS: Record<string, string> = {
  today: `You're a warm, knowledgeable Irish parenting coach for The Hedge family learning app. Give a 2-3 sentence morning briefing. Reference the weather, what's planned today, the family's streak, and which children benefit from today's activities. Be encouraging, specific, and natural - not cheesy. Use Irish English. Never use em dashes.`,

  plan_week: `You're an education advisor for The Hedge family learning app. In 2-3 sentences, explain why this week's activities were chosen for this family. Reference curriculum balance (Aistear themes, NCCA areas), child ages and developmental stages, and any category gaps being filled. Be specific about which child benefits from which types of activities. Use parent-friendly language - no jargon. Never use em dashes.`,

  activity: `You're a child development expert for The Hedge family learning app. In 2 sentences, explain why this specific activity is valuable for this family's children. Reference their ages, interests, and what curriculum areas it covers. Explain the developmental benefit in plain language a parent would appreciate. Never use em dashes.`,

  progress: `You're a supportive learning coach for The Hedge family learning app. In 2-3 sentences, summarise this family's learning journey so far. Highlight their strengths (which categories they're doing well in), suggest what to focus on next for balanced development, and give genuine encouragement. Reference their tier and what they need to progress. Be specific and actionable. Never use em dashes.`,
};

/**
 * POST /api/v1/ai/insight
 * Generates contextual AI insights for different screens in the app.
 * Cached client-side for 1 hour to minimise API calls.
 */
export async function POST(request: NextRequest) {
  const { user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const body = await request.json();
  const { type, context } = body;

  if (!type || !SYSTEM_PROMPTS[type]) {
    return apiError('Invalid insight type. Must be: today, plan_week, activity, progress', 400);
  }

  if (!context) {
    return apiError('Context is required', 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return apiError('AI service not configured', 500);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Build a concise user prompt from context
    let userPrompt = '';

    switch (type) {
      case 'today':
        userPrompt = `Family context:
Children: ${(context.children || []).map((c: any) => `${c.name} (${c.age} years, interests: ${(c.interests || []).join(', ')})`).join('; ')}
Weather: ${context.weather ? `${context.weather.temperature}C, ${context.weather.condition}` : 'Unknown'}
Current streak: ${context.streak || 0} days
Activities this week: ${context.activitiesThisWeek || 0}
Today's planned activities: ${(context.todayActivities || []).map((a: any) => `${a.title} (${a.category})`).join(', ') || 'None planned'}
Category balance this week: ${JSON.stringify(context.categoryBreakdown || {})}

Give a personalised morning briefing.`;
        break;

      case 'plan_week':
        userPrompt = `Family context:
Children: ${(context.children || []).map((c: any) => `${c.name} (${c.age} years, interests: ${(c.interests || []).join(', ')})`).join('; ')}
This week's activities: ${(context.planActivities || []).map((a: any) => `${a.day}: ${a.title} (${a.category}, for ${a.childName || 'family'})`).join('; ')}
Category breakdown overall: ${JSON.stringify(context.categoryBreakdown || {})}
Hedge Score: ${context.hedgeScore || 0}, Tier: ${context.tierName || 'Seedling'}

Explain why this week's plan was designed this way.`;
        break;

      case 'activity':
        userPrompt = `Family context:
Children: ${(context.children || []).map((c: any) => `${c.name} (${c.age} years, interests: ${(c.interests || []).join(', ')})`).join('; ')}

Activity: "${context.activityTitle}"
Category: ${context.activityCategory}
Learning outcomes: ${(context.learningOutcomes || []).join('; ')}
Curriculum: Aistear themes: ${(context.aistearThemes || []).join(', ')}; NCCA areas: ${(context.nccaAreas || []).join(', ')}

Explain why this activity is great for this family.`;
        break;

      case 'progress':
        userPrompt = `Family progress:
Children: ${(context.children || []).map((c: any) => `${c.name} (${c.age} years)`).join('; ')}
Total activities: ${context.totalActivities || 0}
Current streak: ${context.streak || 0} days
Unique active days: ${context.uniqueDays || 0}
Total learning time: ${context.totalMinutes || 0} minutes
Category breakdown: ${JSON.stringify(context.categoryBreakdown || {})}
Hedge Score: ${context.hedgeScore || 0}/1000
Current tier: ${context.tierName || 'Seedling'}
Score breakdown: Volume ${context.scoreBreakdown?.volume || 0}/250, Consistency ${context.scoreBreakdown?.consistency || 0}/250, Breadth ${context.scoreBreakdown?.breadth || 0}/250, Depth ${context.scoreBreakdown?.depth || 0}/250

Provide a personalised progress narrative with actionable next steps.`;
        break;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: SYSTEM_PROMPTS[type],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = (response.content[0] as any).text || '';

    // Split into insight + suggestion if possible
    const sentences = text.split(/(?<=[.!?])\s+/);
    const insight = sentences.slice(0, -1).join(' ') || text;
    const suggestion = sentences.length > 1 ? sentences[sentences.length - 1] : null;

    return apiSuccess({
      insight,
      suggestion,
      type,
    });
  } catch (err: any) {
    console.error('AI insight error:', err.message);
    return apiError('Failed to generate insight', 500);
  }
}
