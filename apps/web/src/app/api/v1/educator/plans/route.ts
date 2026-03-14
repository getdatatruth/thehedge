import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/plans
 * Returns all education plans for this family with child name joined.
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

  const { data: plans, error: queryError } = await supabase
    .from('education_plans')
    .select('*, children(name)')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: false });

  if (queryError) {
    return apiError('Failed to fetch education plans', 500);
  }

  const formatted = (plans || []).map((plan) => {
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
 * POST /api/v1/educator/plans
 * Create a new education plan.
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
  const { child_id, academic_year, approach, hours_per_day, days_per_week, curriculum_areas } = body;

  if (!child_id || !academic_year) {
    return apiError('child_id and academic_year are required', 422, 'VALIDATION_ERROR');
  }

  // Verify child belongs to this family
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', child_id)
    .eq('family_id', profile.family_id)
    .single();

  if (!child) return apiError('Child not found in this family', 404);

  const { data: plan, error: insertError } = await supabase
    .from('education_plans')
    .insert({
      family_id: profile.family_id,
      child_id,
      academic_year,
      approach: approach || null,
      hours_per_day: hours_per_day || null,
      days_per_week: days_per_week || null,
      curriculum_areas: curriculum_areas || null,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create education plan', 500);
  }

  return apiSuccess(plan, undefined, 201);
}

/**
 * PUT /api/v1/educator/plans
 * Update an existing education plan.
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
  const { id, ...updates } = body;

  if (!id) return apiError('Plan id is required', 422, 'VALIDATION_ERROR');

  // Verify plan belongs to this family
  const { data: existing } = await supabase
    .from('education_plans')
    .select('id')
    .eq('id', id)
    .eq('family_id', profile.family_id)
    .single();

  if (!existing) return apiError('Education plan not found', 404);

  const allowedFields: Record<string, unknown> = {};
  const allowed = ['approach', 'hours_per_day', 'days_per_week', 'curriculum_areas', 'academic_year', 'tusla_status'];
  for (const key of allowed) {
    if (key in updates) {
      allowedFields[key] = updates[key];
    }
  }

  const { data: plan, error: updateError } = await supabase
    .from('education_plans')
    .update(allowedFields)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return apiError('Failed to update education plan', 500);
  }

  return apiSuccess(plan);
}
