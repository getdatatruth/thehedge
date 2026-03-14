import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/attendance
 * Returns daily plans with attendance logged for a date range.
 * Query params: ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&child_id=uuid
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

  // Get education plans for this family
  const { data: plans } = await supabase
    .from('education_plans')
    .select('id')
    .eq('family_id', profile.family_id);

  if (!plans || plans.length === 0) {
    return apiSuccess([]);
  }

  const planIds = plans.map((p) => p.id);

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const childId = searchParams.get('child_id');

  let query = supabase
    .from('daily_plans')
    .select('*, children(name)')
    .in('education_plan_id', planIds)
    .eq('attendance_logged', true)
    .order('date', { ascending: false });

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);
  if (childId) query = query.eq('child_id', childId);

  const { data: attendance, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch attendance records', 500);
  }

  const formatted = (attendance || []).map((record) => {
    const child = Array.isArray(record.children) ? record.children[0] : record.children;
    return {
      ...record,
      child_name: child?.name || null,
      children: undefined,
    };
  });

  return apiSuccess(formatted);
}

/**
 * POST /api/v1/educator/attendance
 * Toggle attendance for a daily plan.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { daily_plan_id, attendance_logged } = body;

  if (!daily_plan_id || attendance_logged === undefined) {
    return apiError('daily_plan_id and attendance_logged are required', 422, 'VALIDATION_ERROR');
  }

  // Verify daily plan belongs to this family
  const { data: dailyPlan } = await supabase
    .from('daily_plans')
    .select('id, education_plan_id, education_plans(family_id)')
    .eq('id', daily_plan_id)
    .single();

  if (!dailyPlan) return apiError('Daily plan not found', 404);

  const edPlan = Array.isArray(dailyPlan.education_plans)
    ? dailyPlan.education_plans[0]
    : dailyPlan.education_plans;

  if (edPlan?.family_id !== profile.family_id) {
    return apiError('Daily plan not found', 404);
  }

  const { data: updated, error: updateError } = await supabase
    .from('daily_plans')
    .update({ attendance_logged })
    .eq('id', daily_plan_id)
    .select()
    .single();

  if (updateError) {
    return apiError('Failed to update attendance', 500);
  }

  return apiSuccess(updated);
}
