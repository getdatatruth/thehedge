import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWeather, getSeason } from '@/lib/weather';
import { TodayClient } from './today-client';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';

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
    .select('name, families(name, county, latitude, longitude, family_style, subscription_tier, subscription_status, trial_ends_at)')
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

  // Use real activities from DB if available, fall back to mock data
  let activities = MOCK_ACTIVITIES;

  const { data: dbActivities } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (dbActivities && dbActivities.length > 0) {
    activities = dbActivities;
  }

  // Filter for weather
  const isRaining = weather?.isRaining || false;
  if (isRaining) {
    activities = activities.filter(
      (a) =>
        a.location === 'indoor' ||
        a.location === 'both' ||
        a.location === 'anywhere'
    );
  }

  const familyName = family?.name || 'your family';
  const county = family?.county || 'Ireland';

  // Get the user's family_id for stats queries
  const { data: userRow } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  const familyId = userRow?.family_id;

  // Get real children from DB
  let childNames: string[] = [];
  let childIds: string[] = [];
  if (familyId) {
    const { data: dbChildren } = await supabase
      .from('children')
      .select('id, name')
      .eq('family_id', familyId);
    childNames = dbChildren?.map((c) => c.name) || [];
    childIds = dbChildren?.map((c) => c.id) || [];
  }

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
  const todayStr = new Date().toISOString().split('T')[0];
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

  // Calculate streak
  let streak = 0;
  if (familyId) {
    const { data: logDates } = await supabase
      .from('activity_logs')
      .select('date')
      .eq('family_id', familyId)
      .order('date', { ascending: false })
      .limit(365);

    if (logDates && logDates.length > 0) {
      const uniqueDates = [...new Set(logDates.map((l) => l.date))]
        .sort()
        .reverse();
      let checkDate = new Date(todayStr);

      for (const dateStr of uniqueDates) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dateStr === checkStr) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dateStr < checkStr) {
          break;
        }
      }
    }
  }

  // Calculate activities this week
  let activitiesThisWeek = 0;
  if (familyId) {
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .gte('date', start);

    activitiesThisWeek = count || 0;
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
      streak={streak}
      activitiesThisWeek={activitiesThisWeek}
      planActivities={planActivities}
      isFreeUser={effectiveTier === 'free'}
    />
  );
}
