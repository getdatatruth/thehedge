import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWeather, getSeason } from '@/lib/weather';
import { TodayClient } from './today-client';
import type { MockActivity } from '@/lib/mock-data';
import { ageInYears, computeAreaWarmth, weightActivity, buildQuietFloor } from '@/lib/personalisation';
import { buildReassurance } from '@/lib/reassurance';

export const metadata = {
  title: 'Today - The Hedge',
};

function getWeekDates() {
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

  return { start: dates[0], end: dates[6], dates };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, families(name, county, latitude, longitude, family_style, approach, doorway, subscription_tier, subscription_status, trial_ends_at)')
    .eq('id', user.id)
    .single();

  const family = (
    Array.isArray(profile?.families) ? profile.families[0] : profile?.families
  ) as {
    name: string;
    county: string | null;
    latitude: number | null;
    longitude: number | null;
    family_style: string | null;
    approach: string | null;
    doorway: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
  } | null;

  // Determine effective tier
  let effectiveTier = family?.subscription_tier || 'free';
  if (family?.subscription_status === 'trialing' && family?.trial_ends_at) {
    if (new Date() > new Date(family.trial_ends_at)) effectiveTier = 'free';
  } else if (family?.subscription_status === 'cancelled' || family?.subscription_status === 'past_due') {
    effectiveTier = 'free';
  }

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const weather = await getWeather(family?.latitude, family?.longitude);
  const season = getSeason();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isRaining = weather?.isRaining || false;
  const familyName = family?.name || 'your family';
  const county = family?.county || 'Ireland';
  const now = new Date();

  // Get the user's family_id
  const { data: userRow } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  const familyId = userRow?.family_id;

  // Real children (with the bits the personalisation engine needs)
  let childNames: string[] = [];
  let childIds: string[] = [];
  let sparkChildren: { id: string; name: string }[] = [];
  let childCtxs: { age: number | null; interests: string[] }[] = [];
  let childSchoolStatuses: string[] = [];
  if (familyId) {
    const { data: dbChildren } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status')
      .eq('family_id', familyId);
    childNames = dbChildren?.map((c) => c.name) || [];
    sparkChildren = (dbChildren || []).map((c) => ({ id: c.id, name: c.name }));
    childIds = dbChildren?.map((c) => c.id) || [];
    childCtxs = (dbChildren || []).map((c) => ({
      age: ageInYears(c.date_of_birth, now),
      interests: (c.interests as string[] | null) || [],
    }));
    childSchoolStatuses = (dbChildren || [])
      .map((c) => (c.school_status as string | null) || '')
      .filter(Boolean);
  }

  // The "open door" path: prefer the doorway the family chose at the Kitchen
  // Table; otherwise infer it from any child's school status. (Previously this
  // was wired to family_style, an unrelated enum, so it never matched and the
  // homeschool/considering CTA never rendered.)
  const learningPath =
    family?.doorway ||
    (childSchoolStatuses.includes('homeschool')
      ? 'homeschool'
      : childSchoolStatuses.includes('considering')
        ? 'considering'
        : null);

  // Recent logs feed the invisible "rounded-childhood" warmth signal
  let warmth = {} as ReturnType<typeof computeAreaWarmth>;
  if (familyId) {
    const { data: recentLogs } = await supabase
      .from('activity_logs')
      .select('date, activity:activity_id(category)')
      .eq('family_id', familyId)
      .order('date', { ascending: false })
      .limit(200);
    warmth = computeAreaWarmth(
      (recentLogs || []).map((l) => ({
        date: l.date,
        category: Array.isArray(l.activity) ? l.activity[0]?.category : (l.activity as { category?: string } | null)?.category,
      })),
      now,
    );
  }

  // The visible face of the rounded-childhood floor (null on cold start / a
  // balanced week), same logic the mobile dashboard uses.
  const quietFloor = buildQuietFloor(warmth);

  // The reassurance card: a calm "you are doing enough", cold-start aware and
  // never a score (gap analysis #1; wellbeing §14).
  const reassurance = familyId ? await buildReassurance(supabase, { familyId }) : null;

  // Candidate pool, then rank by the personalisation engine so the hero is
  // age-appropriate, interest-bridged, weather-aware, and gently floor-balanced.
  // Hard-filter to activities that suit at least one child's actual age, so a
  // 10-year-old's activity never shows up for a family of, say, a 3 and a 7 year
  // old. Ages are computed live from each child's date of birth, so this tracks
  // them as they grow without anyone touching a setting.
  const childAges = [...new Set(childCtxs.map((c) => c.age).filter((a): a is number => a != null))];
  let activitiesQuery = supabase.from('activities').select('*').eq('published', true);
  if (childAges.length > 0) {
    activitiesQuery = activitiesQuery.or(
      childAges.map((a) => `and(age_min.lte.${a},age_max.gte.${a})`).join(','),
    );
  }
  const { data: dbActivities } = await activitiesQuery.limit(120);

  const candidates = (dbActivities as MockActivity[] | null) || [];
  let activities: MockActivity[] = candidates
    .map((a) => {
      const af = {
        category: a.category,
        ageMin: (a as { age_min?: number }).age_min,
        ageMax: (a as { age_max?: number }).age_max,
        interests: (a as { interests?: string[] }).interests,
        location: a.location,
        season: (a as { season?: string[] }).season,
      };
      const w = childCtxs.length
        ? Math.max(
            ...childCtxs.map((cc) =>
              weightActivity(af, { age: cc.age, childInterests: cc.interests, warmth, isRaining, season }),
            ),
          )
        : weightActivity(af, { age: null, warmth, isRaining, season });
      return { a, w };
    })
    // Rank age-appropriate + interest-bridged to the top (never hard-empty the
    // day: a less-good fit still beats a blank Today).
    .sort((x, y) => y.w - x.w)
    .map((x) => x.a)
    .slice(0, 24);

  // Fetch real weekly plan data
  const { start, end } = getWeekDates();
  interface PlanBlock {
    time: string;
    subject: string;
    activity_id?: string;
    title: string;
    duration: number;
    notes?: string;
    completed: boolean;
  }
  interface DailyPlanRow {
    id: string;
    child_id: string;
    date: string;
    blocks: PlanBlock[];
    status: string;
    education_plans: { family_id: string } | { family_id: string }[];
  }

  let weeklyPlanData: DailyPlanRow[] = [];
  if (childIds.length > 0) {
    const { data: dailyPlans } = await supabase
      .from('daily_plans')
      .select('id, child_id, date, blocks, status, education_plans(family_id)')
      .gte('date', start)
      .lte('date', end)
      .in('child_id', childIds)
      .order('date', { ascending: true });

    if (dailyPlans) {
      weeklyPlanData = (dailyPlans as DailyPlanRow[]).filter((p) => {
        const ep = Array.isArray(p.education_plans)
          ? p.education_plans[0]
          : p.education_plans;
        return ep?.family_id === familyId;
      });
    }
  }

  // Transform to a shape the client can use
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Build a simple plan activities array from real data
  const planActivities = weeklyPlanData.flatMap((plan) => {
    const planDate = new Date(plan.date + 'T00:00:00');
    const dayName = dayNames[planDate.getDay()];

    return plan.blocks.map((block) => {
      // Find matching activity in our list
      const matchingActivity = activities.find(
        (a) => a.id === block.activity_id
      );

      const hour = parseInt(block.time.split(':')[0], 10);
      const timeSlot =
        hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      return {
        day: dayName,
        date: plan.date,
        activity_id: block.activity_id || plan.id,
        title: block.title,
        category: matchingActivity?.category || 'nature',
        slug: matchingActivity?.slug || block.activity_id || '',
        duration_minutes: block.duration,
        time_slot: timeSlot,
        completed: block.completed,
      };
    });
  });

  // Calculate activities this week and total logged
  let activitiesThisWeek = 0;
  let activitiesLogged = 0;
  if (familyId) {
    const [weekResult, totalResult] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .gte('date', start),
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId),
    ]);

    activitiesThisWeek = weekResult.count || 0;
    activitiesLogged = totalResult.count || 0;
  }

  return (
    <TodayClient
      activities={activities}
      season={season}
      greeting={greeting}
      firstName={firstName}
      familyName={familyName}
      county={county}
      childNames={childNames}
      isRaining={isRaining}
      temperature={weather?.temperature}
      weatherDescription={weather?.weatherLabel}
      activitiesThisWeek={activitiesThisWeek}
      planActivities={planActivities}
      isFreeUser={effectiveTier === 'free'}
      learningPath={learningPath}
      activitiesLogged={activitiesLogged}
      approach={family?.approach}
      sparkChildren={sparkChildren}
      quietFloor={quietFloor}
      reassurance={reassurance}
    />
  );
}
