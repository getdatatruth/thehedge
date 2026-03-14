import { createClient } from '@/lib/supabase/server';
import { PlannerClient } from './planner-client';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';
import { getWeather } from '@/lib/weather';

export const metadata = {
  title: 'Weekly Plan - The Hedge',
};

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  return { start: dates[0], end: dates[6], dates };
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekOffset = parseInt(params.week || '0', 10) || 0;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-clay">Please sign in to view your planner.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id, families(name, family_style, latitude, longitude)')
    .eq('id', user.id)
    .single();

  const familyId = profile?.family_id;
  const family = Array.isArray(profile?.families)
    ? profile.families[0]
    : profile?.families;

  // Get weather for suggestions
  const familyData = family as {
    name?: string;
    family_style?: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  const weather = await getWeather(
    familyData?.latitude,
    familyData?.longitude
  );

  // Get children
  const { data: children } = familyId
    ? await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status')
        .eq('family_id', familyId)
        .order('date_of_birth', { ascending: true })
    : { data: null };

  // Get current week's daily plans
  const { start, end } = getWeekDates(weekOffset);
  const childIds = (children || []).map((c) => c.id);

  const { data: dailyPlans } =
    childIds.length > 0
      ? await supabase
          .from('daily_plans')
          .select('*, education_plans(family_id, approach, curriculum_areas)')
          .gte('date', start)
          .lte('date', end)
          .in('child_id', childIds)
          .order('date', { ascending: true })
      : { data: null };

  // Filter to only this family's plans
  const familyPlans = (dailyPlans || []).filter((p) => {
    const ep = Array.isArray(p.education_plans)
      ? p.education_plans[0]
      : p.education_plans;
    return ep?.family_id === familyId;
  });

  // Get available activities for suggestions (include season/weather/location)
  let activities: Array<{
    id: string;
    title: string;
    slug?: string;
    category: string;
    duration_minutes: number;
    age_min: number;
    age_max: number;
    description: string;
    season?: string[];
    weather?: string[];
    location?: string;
  }> = [];

  const { data: dbActivities } = await supabase
    .from('activities')
    .select(
      'id, title, slug, category, duration_minutes, age_min, age_max, description, season, weather, location'
    )
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(100);

  if (dbActivities && dbActivities.length > 0) {
    activities = dbActivities;
  } else {
    activities = MOCK_ACTIVITIES.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      duration_minutes: a.duration_minutes,
      age_min: a.age_min,
      age_max: a.age_max,
      description: a.description,
      season: a.season,
      weather: a.weather,
      location: a.location,
    }));
  }

  // Determine weather condition for suggestions
  let weatherCondition: string | undefined;
  if (weather?.isRaining) {
    weatherCondition = 'rain';
  }

  return (
    <PlannerClient
      children={children || []}
      weeklyPlans={familyPlans}
      activities={activities}
      weekStart={start}
      weekEnd={end}
      weekOffset={weekOffset}
      familyName={
        (family as { name?: string } | null)?.name || 'Your Family'
      }
      weatherCondition={weatherCondition}
      temperature={weather?.temperature}
    />
  );
}
