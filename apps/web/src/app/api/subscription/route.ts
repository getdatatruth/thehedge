import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(subscription_tier, subscription_status, trial_ends_at)')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ tier: 'free', status: 'active', isTrialing: false, trialDaysLeft: null });
    }

    const family = Array.isArray(profile.families)
      ? profile.families[0]
      : profile.families;

    if (!family) {
      return NextResponse.json({ tier: 'free', status: 'active', isTrialing: false, trialDaysLeft: null });
    }

    const rawTier = (family as { subscription_tier: string }).subscription_tier || 'free';
    const status = (family as { subscription_status: string }).subscription_status || 'active';
    const trialEndsAt = (family as { trial_ends_at: string | null }).trial_ends_at;

    let effectiveTier = rawTier;
    let isTrialing = false;
    let trialDaysLeft: number | null = null;

    if (status === 'trialing' && trialEndsAt) {
      const trialEnd = new Date(trialEndsAt);
      const now = new Date();
      if (now > trialEnd) {
        effectiveTier = 'free';
      } else {
        isTrialing = true;
        trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    } else if (status === 'cancelled' || status === 'past_due') {
      effectiveTier = 'free';
    }

    return NextResponse.json({
      tier: effectiveTier,
      status,
      isTrialing,
      trialDaysLeft,
    });
  } catch (error) {
    console.error('GET /api/subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
