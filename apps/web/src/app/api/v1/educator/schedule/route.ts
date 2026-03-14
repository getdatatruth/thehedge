import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/schedule
 * Returns daily plans for this week. Optional ?child_id filter.
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

  // Get education plans for this family to scope daily_plans
  const { data: plans } = await supabase
    .from('education_plans')
    .select('id')
    .eq('family_id', profile.family_id);

  if (!plans || plans.length === 0) {
    return apiSuccess([]);
  }

  const planIds = plans.map((p) => p.id);

  // Calculate this week's date range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const { searchParams } = request.nextUrl;
  const childId = searchParams.get('child_id');

  let query = supabase
    .from('daily_plans')
    .select('*, children(name)')
    .in('education_plan_id', planIds)
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)
    .order('date', { ascending: true });

  if (childId) {
    query = query.eq('child_id', childId);
  }

  const { data: dailyPlans, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch schedule', 500);
  }

  const formatted = (dailyPlans || []).map((plan) => {
    const child = Array.isArray(plan.children) ? plan.children[0] : plan.children;
    return {
      ...plan,
      child_name: child?.name || null,
      children: undefined,
    };
  });

  return apiSuccess(formatted);
}

/**
 * POST /api/v1/educator/schedule
 * Create a new daily plan.
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
  const { education_plan_id, child_id, date, blocks } = body;

  if (!education_plan_id || !child_id || !date) {
    return apiError('education_plan_id, child_id, and date are required', 422, 'VALIDATION_ERROR');
  }

  // Verify education plan belongs to this family
  const { data: plan } = await supabase
    .from('education_plans')
    .select('id')
    .eq('id', education_plan_id)
    .eq('family_id', profile.family_id)
    .single();

  if (!plan) return apiError('Education plan not found', 404);

  const { data: dailyPlan, error: insertError } = await supabase
    .from('daily_plans')
    .insert({
      education_plan_id,
      child_id,
      date,
      blocks: blocks || [],
      status: 'planned',
      attendance_logged: false,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create daily plan', 500);
  }

  return apiSuccess(dailyPlan, undefined, 201);
}

/**
 * PUT /api/v1/educator/schedule
 * Update an existing daily plan.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { id, blocks, status, attendance_logged } = body;

  if (!id) return apiError('Daily plan id is required', 422, 'VALIDATION_ERROR');

  // Verify daily plan belongs to this family via education_plan
  const { data: dailyPlan } = await supabase
    .from('daily_plans')
    .select('id, education_plan_id, education_plans(family_id)')
    .eq('id', id)
    .single();

  if (!dailyPlan) return apiError('Daily plan not found', 404);

  const edPlan = Array.isArray(dailyPlan.education_plans)
    ? dailyPlan.education_plans[0]
    : dailyPlan.education_plans;

  if (edPlan?.family_id !== profile.family_id) {
    return apiError('Daily plan not found', 404);
  }

  const updateData: Record<string, unknown> = {};
  if (blocks !== undefined) updateData.blocks = blocks;
  if (status !== undefined) updateData.status = status;
  if (attendance_logged !== undefined) updateData.attendance_logged = attendance_logged;

  const { data: updated, error: updateError } = await supabase
    .from('daily_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return apiError('Failed to update daily plan', 500);
  }

  return apiSuccess(updated);
}
