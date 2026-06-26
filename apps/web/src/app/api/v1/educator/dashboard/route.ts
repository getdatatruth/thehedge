import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/dashboard
 * Returns educator dashboard stats: hours, curriculum coverage, active days, etc.
 * Requires educator subscription tier.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Check educator tier
  const { data: family } = await supabase
    .from('families')
    .select('subscription_tier')
    .eq('id', profile.family_id)
    .single();

  if (!family || family.subscription_tier !== 'educator') {
    return apiError('Educator subscription required', 403);
  }

  // Get children count
  const { count: childrenCount } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', profile.family_id);

  // Get activity logs this week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: weekLogs } = await supabase
    .from('activity_logs')
    .select('duration_minutes, date, activities(category)')
    .eq('family_id', profile.family_id)
    .gte('date', weekStartStr);

  const hoursThisWeek = (weekLogs || []).reduce(
    (sum, log) => sum + (log.duration_minutes || 0),
    0
  ) / 60;

  // Curriculum areas covered this week
  const areasSet = new Set<string>();
  for (const log of weekLogs || []) {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    if (activity?.category) {
      areasSet.add(activity.category as string);
    }
  }

  // Count unique active days over the last 90 days (an honest backward-looking measure, no streaks)
  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('date')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false })
    .limit(90);

  const activeDays = recentLogs
    ? new Set(recentLogs.map((l) => l.date)).size
    : 0;

  // Aistear coverage by category
  const aistearThemes = ['wellbeing', 'identity', 'communicating', 'exploring'];
  // Maps the real activity_category enum values to Aistear themes. (Previously
  // keyed on stale category names like 'stem'/'arts', so coverage was always ~0.)
  const categoryToTheme: Record<string, string> = {
    nature: 'exploring',
    science: 'exploring',
    maths: 'exploring',
    art: 'communicating',
    literacy: 'communicating',
    movement: 'wellbeing',
    kitchen: 'wellbeing',
    calm: 'wellbeing',
    life_skills: 'identity',
    social: 'identity',
  };

  const aistearCoverage: Record<string, number> = {};
  for (const theme of aistearThemes) {
    aistearCoverage[theme] = 0;
  }
  for (const log of weekLogs || []) {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    if (activity?.category) {
      const theme = categoryToTheme[activity.category as string];
      if (theme) {
        aistearCoverage[theme] += log.duration_minutes || 0;
      }
    }
  }

  // Check if family has any education plans
  const { count: planCount } = await supabase
    .from('education_plans')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', profile.family_id);

  return apiSuccess({
    hours_this_week: Math.round(hoursThisWeek * 10) / 10,
    curriculum_areas_covered: areasSet.size,
    children_count: childrenCount || 0,
    active_days: activeDays,
    aistear_coverage: aistearCoverage,
    has_plans: (planCount || 0) > 0,
  });
}
