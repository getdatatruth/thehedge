import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

export async function POST(request: NextRequest) {
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
    const { childId, date, time, activityId, title, duration, subject } = body;

    if (!childId || !date || !title) {
      return NextResponse.json(
        { error: 'childId, date, and title are required' },
        { status: 400 }
      );
    }

    // Verify child belongs to this family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('family_id', profile.family_id)
      .single();

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Find or create education plan
    const academicYear = getAcademicYear();
    let educationPlanId: string;

    const { data: existingPlan } = await supabase
      .from('education_plans')
      .select('id')
      .eq('family_id', profile.family_id)
      .eq('child_id', childId)
      .eq('academic_year', academicYear)
      .single();

    if (existingPlan) {
      educationPlanId = existingPlan.id;
    } else {
      const { data: newPlan, error: planError } = await supabase
        .from('education_plans')
        .insert({
          family_id: profile.family_id,
          child_id: childId,
          academic_year: academicYear,
          approach: 'blended',
          hours_per_day: 4,
          days_per_week: 5,
          curriculum_areas: {
            Language: { priority: 'high' },
            Mathematics: { priority: 'high' },
            SESE: { priority: 'medium' },
            Arts: { priority: 'medium' },
            PE: { priority: 'medium' },
            SPHE: { priority: 'medium' },
            Wellbeing: { priority: 'low' },
          },
          tusla_status: 'not_applied',
        })
        .select('id')
        .single();

      if (planError || !newPlan) {
        return NextResponse.json(
          { error: 'Failed to create education plan' },
          { status: 500 }
        );
      }
      educationPlanId = newPlan.id;
    }

    // Check if a daily plan already exists for this child + date
    const { data: existingDaily } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('child_id', childId)
      .eq('education_plan_id', educationPlanId)
      .eq('date', date)
      .single();

    const newBlock = {
      time: time || '09:00',
      subject: subject || 'Activity',
      activity_id: activityId || undefined,
      title,
      duration: duration || 30,
      notes: '',
      completed: false,
      outcome_ids: [],
    };

    if (existingDaily) {
      // Append block to existing plan
      const blocks = [...(existingDaily.blocks || []), newBlock];
      // Sort blocks by time
      blocks.sort((a: { time: string }, b: { time: string }) =>
        a.time.localeCompare(b.time)
      );

      const { data: updated, error: updateError } = await supabase
        .from('daily_plans')
        .update({
          blocks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDaily.id)
        .select('*')
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update plan' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: updated }, { status: 200 });
    } else {
      // Create new daily plan
      const { data: newDaily, error: insertError } = await supabase
        .from('daily_plans')
        .insert({
          education_plan_id: educationPlanId,
          child_id: childId,
          date,
          blocks: [newBlock],
          status: 'planned',
          attendance_logged: false,
        })
        .select('*')
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create plan' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: newDaily }, { status: 201 });
    }
  } catch (err) {
    console.error('Planner add error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
