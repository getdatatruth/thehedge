import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/planner
 * Returns the weekly plan for the authenticated user's family.
 * Query params:
 *   - week_start (YYYY-MM-DD, defaults to current Monday)
 *   - child_id (optional - filter to specific child)
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { searchParams } = request.nextUrl;
  let weekStart = searchParams.get('week_start');
  const childId = searchParams.get('child_id');

  if (!weekStart) {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    weekStart = monday.toISOString().split('T')[0];
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // Get education plan IDs for this family
  let plansQuery = supabase
    .from('education_plans')
    .select('id')
    .eq('family_id', profile.family_id);

  if (childId) {
    plansQuery = plansQuery.eq('child_id', childId);
  }

  const { data: plans } = await plansQuery;

  if (!plans || plans.length === 0) {
    return apiSuccess({ week_start: weekStart, week_end: weekEndStr, days: [] });
  }

  const planIds = plans.map((p) => p.id);

  let dailyQuery = supabase
    .from('daily_plans')
    .select('*')
    .in('education_plan_id', planIds)
    .gte('date', weekStart)
    .lte('date', weekEndStr)
    .order('date', { ascending: true });

  if (childId) {
    dailyQuery = dailyQuery.eq('child_id', childId);
  }

  const { data: dailyPlans } = await dailyQuery;

  // Also get children names for labelling
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('family_id', profile.family_id);

  const childMap: Record<string, string> = {};
  for (const c of children || []) {
    childMap[c.id] = c.name;
  }

  // Enrich daily plans with child names
  const enrichedDays = (dailyPlans || []).map((dp: any) => ({
    ...dp,
    child_name: childMap[dp.child_id] || 'Unknown',
  }));

  return apiSuccess({
    week_start: weekStart,
    week_end: weekEndStr,
    days: enrichedDays,
  });
}
