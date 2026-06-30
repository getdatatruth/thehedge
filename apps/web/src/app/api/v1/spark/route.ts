import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { generateSparkActivity } from '@/lib/spark';

export const maxDuration = 60;

// Spark is the one premium-ish move families make often, so it gets its own,
// more generous ledger than the broad chat/suggest pool.
const RATE_LIMITS: Record<string, number> = { free: 3, family: 40, educator: 999 };

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    const body = await request.json();
    const { childId, prompt, lean } = body as { childId?: string; prompt?: string; lean?: string };
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return apiError('Tell me what they are curious about.', 400);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(subscription_tier)')
      .eq('id', user.id)
      .single();
    const family = (Array.isArray(profile?.families) ? profile.families[0] : profile?.families) as { subscription_tier: string } | null;
    const tier = family?.subscription_tier || 'free';
    const familyId = profile?.family_id;
    if (!familyId) return apiError('Finish setting up your family first.', 400);

    // Weekly rate limit (Monday-start week), against the ai_usage ledger.
    const weeklyLimit = RATE_LIMITS[tier] || 3;
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + (day === 0 ? -6 : 1));
    const { count } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('feature', 'ai_spark')
      .gte('created_at', weekStart.toISOString());
    if ((count || 0) >= weeklyLimit) {
      return apiError(`You have followed all ${weeklyLimit} of this week's sparks on the ${tier} plan. Upgrade to follow more.`, 402);
    }

    // The child this spark is for (their own family's child only).
    let child = null;
    if (childId) {
      const { data: c } = await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status, territory')
        .eq('id', childId)
        .eq('family_id', familyId)
        .single();
      child = c;
    }
    if (!child) {
      const { data: first } = await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status, territory')
        .eq('family_id', familyId)
        .limit(1)
        .single();
      child = first;
    }
    if (!child) return apiError('Add a child first so I can shape this for them.', 400);

    const result = await generateSparkActivity(supabase, { familyId, child, prompt, lean });
    if (!result) return apiError('I could not shape that one just now. Have another go in a moment.', 502);

    await supabase.from('ai_usage').insert({ family_id: familyId, feature: 'ai_spark' });

    return apiSuccess({
      ...result,
      tier,
      weeklyLimit,
      used: (count || 0) + 1,
    });
  } catch (err) {
    console.error('spark error:', err);
    return apiError('Something went sideways shaping that. Have another go in a moment.', 500);
  }
}
