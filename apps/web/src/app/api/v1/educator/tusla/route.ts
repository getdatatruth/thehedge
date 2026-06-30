import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/tusla
 * Returns Tusla compliance status for each child's education plan.
 * Includes a checklist derived from plan completeness.
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

  // Get all education plans with child info
  const { data: plans, error: queryError } = await supabase
    .from('education_plans')
    .select('*, children(name, date_of_birth, school_status)')
    .eq('family_id', profile.family_id);

  if (queryError) {
    return apiError('Failed to fetch education plans', 500);
  }

  // Get portfolio counts per child
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', profile.family_id);

  const childIds = (children || []).map((c) => c.id);

  const { data: portfolioCounts } = await supabase
    .from('portfolio_entries')
    .select('child_id')
    .in('child_id', childIds.length > 0 ? childIds : ['00000000-0000-0000-0000-000000000000']);

  const portfolioByChild: Record<string, number> = {};
  for (const entry of portfolioCounts || []) {
    portfolioByChild[entry.child_id] = (portfolioByChild[entry.child_id] || 0) + 1;
  }

  // Get attendance counts per child (this academic year)
  const currentYear = new Date().getFullYear();
  const academicYearStart = new Date().getMonth() >= 8
    ? `${currentYear}-09-01`
    : `${currentYear - 1}-09-01`;

  const planIds = (plans || []).map((p) => p.id);

  const { data: attendanceRecords } = await supabase
    .from('daily_plans')
    .select('child_id, attendance_logged')
    .in('education_plan_id', planIds.length > 0 ? planIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('attendance_logged', true)
    .gte('date', academicYearStart);

  const attendanceByChild: Record<string, number> = {};
  for (const record of attendanceRecords || []) {
    attendanceByChild[record.child_id] = (attendanceByChild[record.child_id] || 0) + 1;
  }

  const results = (plans || []).map((plan) => {
    const child = Array.isArray(plan.children) ? plan.children[0] : plan.children;
    const portfolioCount = portfolioByChild[plan.child_id] || 0;
    const attendanceDays = attendanceByChild[plan.child_id] || 0;

    // An honest picture of the evidence this family has gathered. AEARS sets no
    // required curriculum, no minimum hours, no attendance bar and no portfolio
    // count, so we never invent thresholds or a "compliance score" - we just
    // reflect what is there as gentle reassurance.
    const evidence = {
      has_education_plan: true,
      has_approach: !!plan.approach,
      has_curriculum_areas: !!(plan.curriculum_areas && Object.keys(plan.curriculum_areas).length > 0),
      has_portfolio_entries: portfolioCount >= 1,
    };

    return {
      plan_id: plan.id,
      child_id: plan.child_id,
      child_name: child?.name || null,
      academic_year: plan.academic_year,
      tusla_status: plan.tusla_status,
      portfolio_count: portfolioCount,
      days_of_learning: attendanceDays,
      evidence,
    };
  });

  return apiSuccess(results);
}
