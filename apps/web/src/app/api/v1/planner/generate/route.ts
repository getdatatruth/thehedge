import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * POST /api/v1/planner/generate
 * Auto-generates a week of daily plans for a family based on their
 * education plans and children's ages. Selects age-appropriate activities
 * with balanced curriculum coverage.
 *
 * Body: { week_start?: string (YYYY-MM-DD, defaults to current Monday) }
 *
 * This is the key link between education_plans and daily_plans.
 * Without this, the Plan tab shows empty even after creating education plans.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json().catch(() => ({}));

  // Determine week start (Monday)
  let weekStart: string;
  if (body.week_start) {
    weekStart = body.week_start;
  } else {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    weekStart = monday.toISOString().split('T')[0];
  }

  // Get all children in this family
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth')
    .eq('family_id', profile.family_id);

  if (!children || children.length === 0) {
    return apiError('No children found', 400);
  }

  // Get education plans for this family
  const { data: educationPlans } = await supabase
    .from('education_plans')
    .select('*')
    .eq('family_id', profile.family_id);

  // Get family info for onboarding preferences
  const { data: family } = await supabase
    .from('families')
    .select('family_style, county')
    .eq('id', profile.family_id)
    .single();

  // For each child, generate a week of activities
  const createdPlans: any[] = [];

  for (const child of children) {
    // Calculate child's age
    const dob = new Date(child.date_of_birth);
    const age = Math.floor(
      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    // Find education plan for this child (or use defaults)
    const eduPlan = educationPlans?.find((p: any) => p.child_id === child.id);
    const daysPerWeek = eduPlan?.days_per_week || 5;
    const hoursPerDay = eduPlan?.hours_per_day || 3;

    // How many activities per day? Based on hours and avg 30min per activity
    const activitiesPerDay = Math.max(2, Math.min(6, Math.round(hoursPerDay * 2)));

    // Ensure or create education plan
    let educationPlanId: string;
    if (eduPlan) {
      educationPlanId = eduPlan.id;
    } else {
      // Auto-create a default education plan
      const now = new Date();
      const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
      const academicYear = `${startYear}-${startYear + 1}`;

      const { data: newPlan, error: planError } = await supabase
        .from('education_plans')
        .insert({
          family_id: profile.family_id,
          child_id: child.id,
          academic_year: academicYear,
          approach: 'blended',
          hours_per_day: hoursPerDay,
          days_per_week: daysPerWeek,
        })
        .select('id')
        .single();

      if (planError || !newPlan) continue;
      educationPlanId = newPlan.id;
    }

    // Get age-appropriate activities from the database
    // Select more than needed so we can distribute without repeats
    const { data: availableActivities } = await supabase
      .from('activities')
      .select('id, title, category, duration_minutes, location, slug')
      .eq('published', true)
      .lte('age_min', age)
      .gte('age_max', age)
      .limit(200);

    if (!availableActivities || availableActivities.length === 0) continue;

    // Check what's already planned this week to avoid duplicates
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const { data: existingPlans } = await supabase
      .from('daily_plans')
      .select('date, blocks')
      .eq('child_id', child.id)
      .eq('education_plan_id', educationPlanId)
      .gte('date', weekStart)
      .lte('date', weekEnd);

    // Get already-used activity IDs this week
    const usedActivityIds = new Set<string>();
    for (const plan of existingPlans || []) {
      for (const block of plan.blocks || []) {
        if (block.activity_id) usedActivityIds.add(block.activity_id);
      }
    }

    // Existing planned dates
    const plannedDates = new Set((existingPlans || []).map((p: any) => p.date));

    // Curriculum balance: rotate through categories
    // Priority order ensures balanced coverage
    const categoryRotation = [
      'literacy', 'maths', 'science', 'nature', 'art',
      'movement', 'kitchen', 'life_skills', 'calm', 'social',
    ];

    // Group available activities by category
    const byCategory: Record<string, typeof availableActivities> = {};
    for (const act of availableActivities) {
      if (usedActivityIds.has(act.id)) continue;
      if (!byCategory[act.category]) byCategory[act.category] = [];
      byCategory[act.category].push(act);
    }

    // Shuffle each category pool
    for (const cat of Object.keys(byCategory)) {
      byCategory[cat].sort(() => Math.random() - 0.5);
    }

    // Generate daily plans for each day of the week
    const categoryIndex = { value: 0 };

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      // Only plan for configured days (e.g. 5 days = Mon-Fri)
      if (dayOffset >= daysPerWeek) break;

      const dateObj = new Date(weekStart);
      dateObj.setDate(dateObj.getDate() + dayOffset);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOffset];

      // Skip if already planned
      if (plannedDates.has(dateStr)) continue;

      // Pick activities for this day, rotating through categories
      const blocks: any[] = [];
      const startHour = 9;

      for (let i = 0; i < activitiesPerDay; i++) {
        // Find an activity from the next category in rotation
        let activity = null;
        let attempts = 0;

        while (!activity && attempts < categoryRotation.length) {
          const cat = categoryRotation[categoryIndex.value % categoryRotation.length];
          categoryIndex.value++;

          const pool = byCategory[cat];
          if (pool && pool.length > 0) {
            activity = pool.shift()!; // Take and remove from pool
          }
          attempts++;
        }

        if (!activity) {
          // Fallback: pick any remaining activity
          for (const cat of Object.keys(byCategory)) {
            if (byCategory[cat].length > 0) {
              activity = byCategory[cat].shift()!;
              break;
            }
          }
        }

        if (!activity) break; // No more activities available

        const time = `${String(startHour + Math.floor(i * 1.5)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;

        blocks.push({
          time,
          subject: activity.category.charAt(0).toUpperCase() + activity.category.slice(1).replace('_', ' '),
          activity_id: activity.id,
          title: activity.title,
          duration: activity.duration_minutes,
          notes: '',
          completed: false,
          outcome_ids: [],
        });
      }

      if (blocks.length === 0) continue;

      // Insert daily plan
      const { data: dailyPlan, error: insertError } = await supabase
        .from('daily_plans')
        .insert({
          education_plan_id: educationPlanId,
          child_id: child.id,
          date: dateStr,
          blocks,
          status: 'planned',
          attendance_logged: false,
        })
        .select('*')
        .single();

      if (!insertError && dailyPlan) {
        createdPlans.push({
          child_name: child.name,
          date: dateStr,
          day: dayName,
          activities: blocks.length,
        });
      }
    }
  }

  return apiSuccess({
    week_start: weekStart,
    plans_created: createdPlans.length,
    details: createdPlans,
  });
}
