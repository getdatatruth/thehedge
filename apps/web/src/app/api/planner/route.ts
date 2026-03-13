import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';

// ─── Helpers ────────────────────────────────────────────

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Irish academic year starts in September
  if (month >= 8) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

function getWeekDates(weekOffset = 0): { start: string; end: string; dates: string[] } {
  const now = new Date();
  // Shift to Monday of the current week
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
}

function getChildAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const TIME_SLOTS = ['09:00', '11:00', '14:00'] as const;
const SUBJECT_MAP: Record<string, string> = {
  nature: 'SESE',
  science: 'SESE',
  kitchen: 'Life Skills',
  art: 'Arts',
  movement: 'PE',
  literacy: 'Language',
  maths: 'Mathematics',
  life_skills: 'SPHE',
  calm: 'Wellbeing',
  social: 'SPHE',
};

// ─── GET: Fetch weekly plan ─────────────────────────────

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('week') || '0', 10);
    const { start, end } = getWeekDates(weekOffset);

    // Get children for this family
    const { data: children } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status')
      .eq('family_id', profile.family_id)
      .order('date_of_birth', { ascending: true });

    // Get daily plans for the week, joined with education_plans
    const { data: dailyPlans } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id, approach, curriculum_areas)')
      .gte('date', start)
      .lte('date', end)
      .in(
        'child_id',
        (children || []).map((c) => c.id)
      )
      .order('date', { ascending: true });

    // Filter to only this family's plans (RLS should handle this but belt-and-suspenders)
    const familyPlans = (dailyPlans || []).filter((p) => {
      const ep = Array.isArray(p.education_plans)
        ? p.education_plans[0]
        : p.education_plans;
      return ep?.family_id === profile.family_id;
    });

    return NextResponse.json({
      data: {
        children: children || [],
        dailyPlans: familyPlans,
        weekStart: start,
        weekEnd: end,
      },
    });
  } catch (err) {
    console.error('Planner GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Generate a weekly plan ──────────────────────

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

    const body = await request.json().catch(() => ({}));
    const weekOffset = body.weekOffset || 0;
    const { dates } = getWeekDates(weekOffset);

    // 1. Get children
    const { data: children } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status')
      .eq('family_id', profile.family_id)
      .order('date_of_birth', { ascending: true });

    if (!children || children.length === 0) {
      return NextResponse.json(
        { error: 'No children found. Add children in Settings first.' },
        { status: 400 }
      );
    }

    // 2. Ensure education_plans exist for each child
    const educationPlanIds: Record<string, string> = {};
    const academicYear = getAcademicYear();

    for (const child of children) {
      const { data: existingPlan } = await supabase
        .from('education_plans')
        .select('id')
        .eq('family_id', profile.family_id)
        .eq('child_id', child.id)
        .eq('academic_year', academicYear)
        .single();

      if (existingPlan) {
        educationPlanIds[child.id] = existingPlan.id;
      } else {
        // Create a default education plan
        const { data: newPlan, error: planError } = await supabase
          .from('education_plans')
          .insert({
            family_id: profile.family_id,
            child_id: child.id,
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
          console.error('Failed to create education plan:', planError);
          return NextResponse.json(
            { error: 'Failed to create education plan' },
            { status: 500 }
          );
        }
        educationPlanIds[child.id] = newPlan.id;
      }
    }

    // 3. Get available activities from DB, with MOCK_ACTIVITIES as fallback
    let activities: Array<{
      id: string;
      title: string;
      category: string;
      duration_minutes: number;
      age_min: number;
      age_max: number;
      description: string;
    }> = [];

    const { data: dbActivities } = await supabase
      .from('activities')
      .select('id, title, category, duration_minutes, age_min, age_max, description')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (dbActivities && dbActivities.length > 0) {
      activities = dbActivities;
    } else {
      // Use mock activities as fallback
      activities = MOCK_ACTIVITIES.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        duration_minutes: a.duration_minutes,
        age_min: a.age_min,
        age_max: a.age_max,
        description: a.description,
      }));
    }

    // 4. Delete existing daily_plans for this week (regenerate)
    for (const child of children) {
      await supabase
        .from('daily_plans')
        .delete()
        .eq('child_id', child.id)
        .eq('education_plan_id', educationPlanIds[child.id])
        .in('date', dates);
    }

    // 5. Generate plans for each child for Mon-Fri (indices 0-4)
    const weekdayDates = dates.slice(0, 5); // Mon-Fri
    const allNewPlans: Array<{
      education_plan_id: string;
      child_id: string;
      date: string;
      blocks: Array<{
        time: string;
        subject: string;
        activity_id: string;
        title: string;
        duration: number;
        notes: string;
        completed: boolean;
        outcome_ids: string[];
      }>;
      status: string;
      attendance_logged: boolean;
    }> = [];

    for (const child of children) {
      const childAge = getChildAge(child.date_of_birth);
      const interests = child.interests || [];

      // Filter activities suitable for this child's age
      let suitable = activities.filter(
        (a) => a.age_min <= childAge && a.age_max >= childAge
      );

      // Boost activities matching child's interests
      if (interests.length > 0) {
        suitable.sort((a, b) => {
          const aMatch = interests.includes(a.category) ? 0 : 1;
          const bMatch = interests.includes(b.category) ? 0 : 1;
          return aMatch - bMatch;
        });
      }

      // If no suitable activities, use all available
      if (suitable.length === 0) suitable = [...activities];

      // Shuffle to add variety
      const shuffled = [...suitable].sort(() => Math.random() - 0.5);
      let activityIndex = 0;

      for (const date of weekdayDates) {
        const blocks: Array<{
          time: string;
          subject: string;
          activity_id: string;
          title: string;
          duration: number;
          notes: string;
          completed: boolean;
          outcome_ids: string[];
        }> = [];

        // Assign 2-3 activity blocks per day
        const numBlocks = childAge < 4 ? 2 : 3;

        for (let b = 0; b < numBlocks; b++) {
          const activity = shuffled[activityIndex % shuffled.length];
          activityIndex++;

          blocks.push({
            time: TIME_SLOTS[b] || '15:00',
            subject: SUBJECT_MAP[activity.category] || activity.category,
            activity_id: activity.id,
            title: activity.title,
            duration: activity.duration_minutes,
            notes: '',
            completed: false,
            outcome_ids: [],
          });
        }

        allNewPlans.push({
          education_plan_id: educationPlanIds[child.id],
          child_id: child.id,
          date,
          blocks,
          status: 'planned',
          attendance_logged: false,
        });
      }
    }

    // 6. Insert all plans
    const { data: insertedPlans, error: insertError } = await supabase
      .from('daily_plans')
      .insert(allNewPlans)
      .select('*');

    if (insertError) {
      console.error('Failed to insert daily plans:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate weekly plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        plans: insertedPlans,
        childCount: children.length,
        daysPlanned: weekdayDates.length,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Planner POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT: Update a specific plan block ──────────────────

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, blockIndex, updates } = body;

    if (!planId || blockIndex === undefined) {
      return NextResponse.json(
        { error: 'planId and blockIndex are required' },
        { status: 400 }
      );
    }

    // Fetch the existing plan
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id)')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    const ep = Array.isArray(plan.education_plans)
      ? plan.education_plans[0]
      : plan.education_plans;

    if (ep?.family_id !== profile?.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the specific block
    const blocks = [...(plan.blocks || [])];
    if (blockIndex < 0 || blockIndex >= blocks.length) {
      return NextResponse.json({ error: 'Invalid block index' }, { status: 400 });
    }

    blocks[blockIndex] = { ...blocks[blockIndex], ...updates };

    // Compute new status
    const allCompleted = blocks.every(
      (b: { completed: boolean }) => b.completed
    );
    const anyCompleted = blocks.some(
      (b: { completed: boolean }) => b.completed
    );
    const newStatus = allCompleted
      ? 'completed'
      : anyCompleted
        ? 'in_progress'
        : 'planned';

    const { data: updated, error: updateError } = await supabase
      .from('daily_plans')
      .update({
        blocks,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Planner PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
