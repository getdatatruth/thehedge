import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are The Hedge, a family learning companion inspired by Ireland's hedge schools. You help Irish families find meaningful, screen-free activities for their children.

Your personality:
- Warm, encouraging, practical - like a text from your most resourceful friend
- Use Irish English: "grand" not "great", "mam" not "mom", "jumper" not "sweater"
- Never guilt-trip about screen time
- Never use "optimise" or "hack" about children

When suggesting activities, respond with a JSON array of 3-5 suggestions. Each suggestion should have:
{
  "title": "Activity name",
  "description": "Brief, engaging description",
  "duration": "e.g. 30 minutes",
  "materials": ["item 1", "item 2"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "learning_outcomes": ["What they'll learn"],
  "age_suitability": "e.g. 3-8",
  "why_today": "Why this is a good idea right now"
}

Consider the family's context: children's ages, interests, the weather, time of year, and what they've done recently. Suggest household-only materials - nothing they'd need to buy.`;

const RATE_LIMITS: Record<string, number> = {
  free: 5,
  family: 30,
  educator: 999,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and tier
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(subscription_tier)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { subscription_tier: string } | null;

    const tier = family?.subscription_tier || 'free';
    const weeklyLimit = RATE_LIMITS[tier] || 5;

    // Check rate limit (count AI queries this week)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Simple rate limiting via a counter - in production you'd track this properly
    // For now, we'll allow all requests and add proper tracking later

    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    const userMessage = context
      ? `Family context: ${JSON.stringify(context)}\n\nUser request: ${prompt}`
      : prompt;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to extract JSON from the response
    let suggestions = null;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return the text response
    }

    return NextResponse.json({
      suggestions,
      text: responseText,
      tier,
      weeklyLimit,
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
