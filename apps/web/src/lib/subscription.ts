import { createAdminClient } from '@/lib/supabase/admin';
import type { SubscriptionTier } from '@/types/database';

// Feature definitions by tier
const TIER_FEATURES: Record<SubscriptionTier, Set<string>> = {
  free: new Set([
    'browse_activities',
    'log_activities',
    'ai_suggestions',
    'timeline',
  ]),
  family: new Set([
    'browse_activities',
    'browse_premium',
    'log_activities',
    'ai_suggestions',
    'ai_unlimited',
    'timeline',
    'weekly_planner',
    'favourites',
  ]),
  educator: new Set([
    'browse_activities',
    'browse_premium',
    'log_activities',
    'ai_suggestions',
    'ai_unlimited',
    'timeline',
    'weekly_planner',
    'favourites',
    'educator_suite',
    'tusla_compliance',
    'portfolio',
    'curriculum_tracking',
    'pdf_reports',
  ]),
};

// Usage limits for free tier per week
const FREE_LIMITS: Record<string, number> = {
  ai_suggestions: 5,
  browse_activities: 50,
};

export type Feature = string;

export async function getFamilyTier(familyId: string): Promise<SubscriptionTier> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('families')
    .select('subscription_tier, subscription_status')
    .eq('id', familyId)
    .single();

  if (!data) return 'free';

  // If subscription is not active, treat as free
  if (data.subscription_status !== 'active' && data.subscription_status !== 'trialing') {
    return 'free';
  }

  return (data.subscription_tier as SubscriptionTier) || 'free';
}

export async function checkFeatureAccess(
  familyId: string,
  feature: Feature
): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
  const tier = await getFamilyTier(familyId);
  const features = TIER_FEATURES[tier];

  if (!features.has(feature)) {
    return {
      allowed: false,
      reason: `This feature requires a ${getMinimumTier(feature)} plan or higher.`,
    };
  }

  // Check usage limits for free tier
  if (tier === 'free' && FREE_LIMITS[feature]) {
    const limit = FREE_LIMITS[feature];
    const used = await getUsageCount(familyId, feature, 'week');
    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've reached your weekly limit of ${limit} for this feature. Upgrade to unlock unlimited access.`,
        limit,
        used,
      };
    }
    return { allowed: true, limit, used };
  }

  return { allowed: true };
}

export async function getUsageCount(
  familyId: string,
  feature: string,
  period: 'day' | 'week' | 'month'
): Promise<number> {
  const supabase = createAdminClient();

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      break;
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Map feature to table/query
  if (feature === 'ai_suggestions') {
    // Count chat messages from the family this period
    // Uses activity_logs as a proxy — in production you'd have a usage_tracking table
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .gte('created_at', startDate.toISOString());

    return count || 0;
  }

  if (feature === 'browse_activities') {
    // For browse, we don't typically track — return 0
    return 0;
  }

  return 0;
}

function getMinimumTier(feature: string): string {
  if (TIER_FEATURES.free.has(feature)) return 'Free';
  if (TIER_FEATURES.family.has(feature)) return 'Family';
  return 'Educator';
}

export function getTierFeatures(tier: SubscriptionTier): string[] {
  return Array.from(TIER_FEATURES[tier]);
}

export function isPremiumTier(tier: SubscriptionTier): boolean {
  return tier === 'family' || tier === 'educator';
}
