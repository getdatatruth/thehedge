import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ─── PUT: Toggle attendance_logged on a daily plan ──────

export async function PUT(request: NextRequest) {
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
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const body = await request.json();
    const { planId, attendance_logged } = body;

    if (!planId || attendance_logged === undefined) {
      return NextResponse.json(
        { error: 'planId and attendance_logged are required' },
        { status: 400 }
      );
    }

    // Fetch the plan and verify ownership through education_plans
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id)')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const ep = Array.isArray(plan.education_plans)
      ? plan.education_plans[0]
      : plan.education_plans;

    if (ep?.family_id !== profile.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('daily_plans')
      .update({
        attendance_logged: !!attendance_logged,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update attendance:', updateError);
      return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Attendance PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
