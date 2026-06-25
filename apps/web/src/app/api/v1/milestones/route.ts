import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

// ── Milestone Definitions ────────────────────────────────────
//
// The Hedge has no points, no streaks, no leaderboards, no guilt.
// "Milestones" here are gentle, backward-looking reflections on what
// a family has actually done together (e.g. "10 activities so far").
// There are no streaks, no competitive targets, and nothing to chase.
//
// Each milestone has an ID, display info, and a flag for whether it
// has happened yet, with an optional warm description.

interface MilestoneResult {
  id: string;
  name: string;
  emoji: string;
  achieved: boolean;
  achievedDate?: string;
  description?: string;
}

const ALL_CATEGORIES = [
  'nature', 'science', 'art', 'maths', 'literacy',
  'movement', 'kitchen', 'life_skills', 'calm', 'social',
];

function formatAge(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} month${rem !== 1 ? 's' : ''}`;
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${rem} month${rem !== 1 ? 's' : ''}`;
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/**
 * GET /api/v1/milestones
 * Returns milestone data, family journey stats, and new activities this week.
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

  // Fetch family, children, activity logs, and new activities in parallel
  const [familyResult, childrenResult, logsResult, newActivitiesResult] = await Promise.all([
    supabase
      .from('families')
      .select('id, name, created_at')
      .eq('id', profile.family_id)
      .single(),
    supabase
      .from('children')
      .select('id, name, date_of_birth')
      .eq('family_id', profile.family_id)
      .order('date_of_birth', { ascending: true }),
    supabase
      .from('activity_logs')
      .select('id, date, duration_minutes, activity_id, child_ids, activity:activity_id(category)')
      .eq('family_id', profile.family_id)
      .order('date', { ascending: false }),
    supabase
      .from('activities')
      .select('title, category, slug, duration_minutes')
      .eq('published', true)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const family = familyResult.data;
  const children = childrenResult.data || [];
  const logs = logsResult.data || [];
  const newActivities = newActivitiesResult.data || [];

  if (!family) return apiError('Family not found', 404);

  const now = new Date();
  const familyCreatedAt = new Date(family.created_at);
  const daysSinceJoined = Math.floor((now.getTime() - familyCreatedAt.getTime()) / 86400000);

  // ── Compute stats ────────────────────────────────────────
  const totalActivities = logs.length;
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const dates = logs.map((l) => l.date as string);
  const uniqueDates = [...new Set(dates)].sort().reverse();

  // Categories explored
  const categoriesSet = new Set<string>();
  for (const log of logs) {
    const cat = Array.isArray(log.activity)
      ? log.activity[0]?.category
      : (log.activity as any)?.category;
    if (cat) categoriesSet.add(cat);
  }
  const categoriesExplored = categoriesSet.size;

  // First activity date
  const firstActivityDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;

  // First week - did they log at least one activity within 7 days of joining?
  const firstWeekEnd = new Date(familyCreatedAt);
  firstWeekEnd.setDate(firstWeekEnd.getDate() + 7);
  const firstWeekEndStr = firstWeekEnd.toISOString().split('T')[0];
  const hasFirstWeekActivity = uniqueDates.some((d) => d <= firstWeekEndStr);
  const firstWeekAchievedDate = hasFirstWeekActivity && uniqueDates.length > 0
    ? uniqueDates.filter((d) => d <= firstWeekEndStr).sort().pop() || null
    : null;

  // Months since joined
  const monthsSinceJoined = monthsBetween(familyCreatedAt, now);

  // ── Build milestones ─────────────────────────────────────
  const milestones: MilestoneResult[] = [
    {
      id: 'first_activity',
      name: 'First Activity',
      emoji: '\u{1F331}',
      achieved: totalActivities >= 1,
      achievedDate: firstActivityDate || undefined,
      description: 'You logged your first family activity together.',
    },
    {
      id: 'first_week',
      name: 'First Week',
      emoji: '\u2B50',
      achieved: hasFirstWeekActivity && daysSinceJoined >= 7,
      achievedDate: firstWeekAchievedDate || undefined,
      description: 'You shared some learning in your first week together.',
    },
    {
      id: '10_activities',
      name: '10 Activities',
      emoji: '\u{1F680}',
      achieved: totalActivities >= 10,
      description: totalActivities >= 10
        ? 'You have logged 10 activities so far. Lovely.'
        : 'A note for when you have logged 10 activities together.',
    },
    {
      id: 'all_categories',
      name: 'Every Area Explored',
      emoji: '\u{1F308}',
      achieved: categoriesExplored >= ALL_CATEGORIES.length,
      description: categoriesExplored >= ALL_CATEGORIES.length
        ? 'You have explored every learning area together.'
        : `You have explored ${categoriesExplored} of the learning areas so far.`,
    },
    {
      id: '100_activities',
      name: 'A Hundred Moments',
      emoji: '\u{1F4AF}',
      achieved: totalActivities >= 100,
      description: totalActivities >= 100
        ? 'You have shared 100 activities together. What a journey.'
        : 'A note for when you have shared 100 activities together.',
    },
    {
      id: '6_months',
      name: 'Half Year',
      emoji: '\u{1F389}',
      achieved: monthsSinceJoined >= 6,
      description: '6 months with The Hedge.',
    },
    {
      id: '1_year',
      name: 'Anniversary',
      emoji: '\u{1F3C6}',
      achieved: monthsSinceJoined >= 12,
      description: '1 year of family learning.',
    },
  ];

  // For achieved milestones that track counts, estimate achieved date from logs
  // (10 activities -> date of 10th log, etc.)
  if (totalActivities >= 10 && logs.length >= 10) {
    const sortedAsc = [...logs].sort((a, b) => (a.date as string).localeCompare(b.date as string));
    const tenth = sortedAsc[9];
    const m = milestones.find((ms) => ms.id === '10_activities');
    if (m && tenth) m.achievedDate = tenth.date as string;
  }

  if (totalActivities >= 100 && logs.length >= 100) {
    const sortedAsc = [...logs].sort((a, b) => (a.date as string).localeCompare(b.date as string));
    const hundredth = sortedAsc[99];
    const m = milestones.find((ms) => ms.id === '100_activities');
    if (m && hundredth) m.achievedDate = hundredth.date as string;
  }

  // ── Child growth data ────────────────────────────────────
  const childGrowth = children.map((child) => {
    const dob = new Date(child.date_of_birth);
    const ageAtJoinMonths = monthsBetween(dob, familyCreatedAt);
    const currentAgeMonths = monthsBetween(dob, now);
    const childLogs = logs.filter((l) =>
      Array.isArray(l.child_ids) && l.child_ids.includes(child.id)
    );
    return {
      name: child.name,
      startAge: formatAge(Math.max(0, ageAtJoinMonths)),
      currentAge: formatAge(Math.max(0, currentAgeMonths)),
      activitiesCompleted: childLogs.length,
    };
  });

  // ── New this week ────────────────────────────────────────
  const newThisWeek = {
    count: newActivities.length,
    activities: newActivities.map((a) => ({
      title: a.title,
      category: a.category,
      slug: a.slug,
      durationMinutes: a.duration_minutes,
    })),
  };

  return apiSuccess({
    milestones,
    familyJourney: {
      memberSince: family.created_at.split('T')[0],
      daysActive: uniqueDates.length,
      totalActivities,
      categoriesExplored,
      totalLearningHours: totalHours,
      childGrowth,
    },
    newThisWeek,
  });
}
