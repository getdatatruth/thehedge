import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/planner
 * Returns the weekly plan for the authenticated user's family.
 * Query params: week_start (YYYY-MM-DD, defaults to current Monday)
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
  const { data: plans } = await supabase
    .from('education_plans')
    .select('id')
    .eq('family_id', profile.family_id);

  if (!plans || plans.length === 0) {
    return apiSuccess({ week_start: weekStart, days: [] });
  }

  const planIds = plans.map((p) => p.id);

  const { data: dailyPlans } = await supabase
    .from('daily_plans')
    .select('*')
    .in('education_plan_id', planIds)
    .gte('date', weekStart)
    .lte('date', weekEndStr)
    .order('date', { ascending: true });

  return apiSuccess({
    week_start: weekStart,
    week_end: weekEndStr,
    days: dailyPlans || [],
  });
}
