// ─── The Starter Week ───────────────────────────────────────────────────────
//
// The first time a family finishes The Kitchen Table, the Plan tab should feel
// alive, not empty. This seeds a gentle, personalised week of daily_plans so the
// product greets them with a few lovely things already laid out, picked for each
// child's age and what they love, paced to the family's rhythm.
//
// Brand: calm, a breath not a battle. We never over-fill a day. Lighter for
// child-led and relaxed families, a touch more structured for structured ones.
// No points, no scores, no streaks.
//
// It writes the SAME rows the planner reads: one education_plans row per child,
// then daily_plans rows (with a `blocks` jsonb array) across the current week.
// Best-effort: it must never break onboarding, and it is idempotent (it only
// seeds if the family has no daily_plans yet).

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ageInYears,
  rankForChild,
  type Approach,
  type WeightContext,
} from '@/lib/personalisation';

// How many calm activities to lay out on each planned day, and how many days of
// the week to gently fill. Lighter for child-led/relaxed (a single invitation a
// day, only a few days), a little more for structured families (still gentle).
function rhythmForApproach(approach: Approach | string | null | undefined): {
  perDay: number;
  days: number;
} {
  switch (approach) {
    case 'structured':
      return { perDay: 2, days: 5 };
    case 'blended':
      return { perDay: 2, days: 4 };
    case 'exploratory':
      return { perDay: 1, days: 4 };
    case 'relaxed':
      return { perDay: 1, days: 3 };
    case 'child_led':
      return { perDay: 1, days: 3 };
    default:
      return { perDay: 1, days: 4 };
  }
}

// Monday of the current week, as YYYY-MM-DD, matching the planner page exactly.
function currentWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function seasonForMonth(month: number): string {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

interface ActivityRow {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  location: string | null;
  interests: string[] | null;
  age_min: number;
  age_max: number;
  season: string[] | null;
  energy_level: string | null;
}

/**
 * Seed a gentle, personalised starter week of daily_plans for a freshly
 * onboarded family. Best-effort and idempotent: any error is swallowed, and it
 * does nothing if the family already has daily_plans.
 *
 * Returns the number of daily_plans rows created (0 if it skipped or failed).
 */
export async function seedStarterWeek(
  supabase: SupabaseClient,
  familyId: string,
  approach: Approach | string | null | undefined,
): Promise<number> {
  try {
    // Find this family's children (real ids + dob + interests).
    const { data: children } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests')
      .eq('family_id', familyId);

    if (!children || children.length === 0) return 0;

    const childIds = children.map((c) => c.id as string);

    // Idempotency: if any daily_plan already exists for any of these children,
    // the family is not empty, so leave their week alone.
    const { data: existingPlans } = await supabase
      .from('daily_plans')
      .select('id')
      .in('child_id', childIds)
      .limit(1);
    if (existingPlans && existingPlans.length > 0) return 0;

    const now = new Date();
    const season = seasonForMonth(now.getMonth());
    const dates = currentWeekDates();
    const { perDay, days } = rhythmForApproach(approach);

    // One education_plans row per child anchors the daily_plans (the planner
    // joins through it to scope to the family). Mirror the planner-generate
    // defaults so nothing downstream is surprised.
    const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const academicYear = `${startYear}-${startYear + 1}`;

    let created = 0;

    for (const child of children) {
      const age = ageInYears(child.date_of_birth as string, now);

      // Pull a generous pool of published, age-appropriate activities, then let
      // the personalisation engine float the best fit (age + interests + season)
      // to the top. We never hard-empty the pool, so a calm few always land.
      // Note: the activities table has no `interests` column (interest fit comes
      // through category in the weighting), so we must not select it - doing so
      // errors the whole query and silently empties the pool.
      const { data: pool, error: poolErr } = await supabase
        .from('activities')
        .select(
          'id, title, category, duration_minutes, location, age_min, age_max, season, energy_level',
        )
        .eq('published', true)
        .lte('age_min', age ?? 99)
        .gte('age_max', age ?? 0)
        .limit(120);
      if (poolErr) console.error('starter-week: activity pool query failed:', poolErr.message);

      const activities = (pool || []) as ActivityRow[];
      if (activities.length === 0) continue;

      const ctx: WeightContext = {
        age,
        childInterests: (child.interests as string[] | null) || [],
        warmth: {}, // cold-start: no floor nudges for a brand-new family
        season,
      };

      const ranked = rankForChild(
        activities.map((a) => ({
          ...a,
          ageMin: a.age_min,
          ageMax: a.age_max,
          energyLevel: a.energy_level,
        })),
        ctx,
      );

      // Create the anchoring education plan for this child. We mint the id
      // ourselves rather than depend on an INSERT ... RETURNING read, so a
      // brand-new family (whose RLS scope can lag a returning SELECT) still gets
      // a usable id for the daily_plans below.
      const educationPlanId = crypto.randomUUID();
      const { error: eduErr } = await supabase
        .from('education_plans')
        .insert({
          id: educationPlanId,
          family_id: familyId,
          child_id: child.id,
          academic_year: academicYear,
          approach: 'blended',
        });

      if (eduErr) {
        console.error('starter-week: education_plans insert failed:', eduErr.message);
        continue;
      }

      // Spread the ranked picks across the gentle number of days, a calm few per
      // day, without repeating an activity. Keep a little variety by avoiding
      // two of the same category back to back where we can.
      let cursor = 0;
      const usedCategoriesByDay: string[][] = [];

      for (let dayIndex = 0; dayIndex < days && dayIndex < dates.length; dayIndex++) {
        const blocks: {
          time: string;
          subject: string;
          activity_id: string;
          title: string;
          duration: number;
          notes: string;
          completed: boolean;
          outcome_ids: string[];
        }[] = [];
        const dayCategories: string[] = [];

        for (let slot = 0; slot < perDay && cursor < ranked.length; slot++) {
          // Skip ahead a little if the next pick repeats this day's category and
          // there is a fresh one waiting, for a touch more variety.
          let pickIndex = cursor;
          if (
            dayCategories.includes(ranked[pickIndex].category) &&
            cursor + 1 < ranked.length &&
            !dayCategories.includes(ranked[cursor + 1].category)
          ) {
            pickIndex = cursor + 1;
          }

          const activity = ranked[pickIndex];
          // Advance the cursor past whichever index we consumed.
          if (pickIndex === cursor) cursor += 1;
          else {
            // We took cursor+1; swap so cursor still advances by one usable item.
            ranked.splice(pickIndex, 1);
            cursor += 1;
          }

          if (!activity) break;
          dayCategories.push(activity.category);

          const startHour = 10; // mid-morning, unhurried
          const time = `${String(startHour + slot * 2).padStart(2, '0')}:00`;
          const subject =
            activity.category.charAt(0).toUpperCase() +
            activity.category.slice(1).replace('_', ' ');

          blocks.push({
            time,
            subject,
            activity_id: activity.id,
            title: activity.title,
            duration: activity.duration_minutes,
            notes: '',
            completed: false,
            outcome_ids: [],
          });
        }

        if (blocks.length === 0) continue;
        usedCategoriesByDay.push(dayCategories);

        const { error: insertErr } = await supabase.from('daily_plans').insert({
          education_plan_id: educationPlanId,
          child_id: child.id,
          date: dates[dayIndex],
          blocks,
          status: 'planned',
          attendance_logged: false,
        });

        if (insertErr) console.error('starter-week: daily_plans insert failed:', insertErr.message);
        else created += 1;
      }
    }

    return created;
  } catch (err) {
    // Best-effort: never let a starter-week hiccup break onboarding, but do not
    // fail silently - log it so a regression here is visible.
    console.error('starter-week: seeding failed:', err instanceof Error ? err.message : err);
    return 0;
  }
}
