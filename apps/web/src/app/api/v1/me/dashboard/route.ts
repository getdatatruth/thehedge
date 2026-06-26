import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { ageInYears, computeAreaWarmth, weightActivity } from '@/lib/personalisation';

export async function OPTIONS() {
  return apiOptions();
}

async function fetchWeather(lat: number, lng: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=Europe%2FDublin`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const code = current.weather_code;
    let condition = 'Clear';
    if (code >= 61) condition = 'Rain';
    else if (code >= 51) condition = 'Drizzle';
    else if (code >= 45) condition = 'Fog';
    else if (code >= 2) condition = 'Cloudy';

    return {
      temperature: current.temperature_2m,
      condition,
      isRaining: code >= 51,
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/v1/me/dashboard
 * Returns dashboard data for the Today screen in the mobile app.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id, families(name, latitude, longitude)')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const family = Array.isArray(profile.families) ? profile.families[0] : profile.families;

  // Fetch weather if family has coordinates
  let weather = null;
  const lat = (family as any)?.latitude;
  const lng = (family as any)?.longitude;
  if (lat && lng) {
    weather = await fetchWeather(lat, lng);
  }

  // Get activity logs for streak and this week count
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('date, activity:activity_id(category)')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false })
    .limit(200);

  const allLogs = logs || [];
  const activitiesThisWeek = allLogs.filter((l) => l.date >= mondayStr).length;

  // Distinct days with any learning logged (honest count, never a "streak")
  const daysOfLearning = new Set(allLogs.map((l) => l.date)).size;

  // Children for age/interest-aware selection
  const { data: dbChildren } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests')
    .eq('family_id', profile.family_id);
  const childCtxs = (dbChildren || []).map((c) => ({
    age: ageInYears(c.date_of_birth as string, now),
    interests: (c.interests as string[] | null) || [],
  }));

  // The invisible "rounded-childhood" warmth signal from recent logs
  const warmth = computeAreaWarmth(
    allLogs.map((l) => ({
      date: l.date,
      category: Array.isArray(l.activity) ? l.activity[0]?.category : (l.activity as { category?: string } | null)?.category,
    })),
    now,
  );

  const isRaining = weather?.isRaining || false;

  // Candidate pool, ranked by the personalisation engine so the mobile Thread
  // hero is age-appropriate, interest-bridged and gently floor-balanced. Include
  // the fields the engine + reframe chips need (age, interests, season, location).
  // Hard-filter to activities that suit at least one child's actual age (a
  // 10-year-old's activity should never surface for a 3 and a 7 year old). Ages
  // are computed live from date of birth, so this tracks children as they grow.
  const childAges = [...new Set(childCtxs.map((c) => c.age).filter((a): a is number => a != null))];
  let poolQuery = supabase.from('activities').select('*').eq('published', true);
  if (childAges.length > 0) {
    poolQuery = poolQuery.or(childAges.map((a) => `and(age_min.lte.${a},age_max.gte.${a})`).join(','));
  }
  const { data: candidatePool } = await poolQuery.limit(120);

  const activities = (candidatePool || [])
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
        ? Math.max(...childCtxs.map((cc) => weightActivity(af, { age: cc.age, childInterests: cc.interests, warmth, isRaining })))
        : weightActivity(af, { age: null, warmth, isRaining });
      return { a, w };
    })
    // Rank age-appropriate + interest-bridged to the top (never hard-empty the
    // day: a less-good fit still beats a blank Today).
    .sort((x, y) => y.w - x.w)
    .map((x) => x.a)
    .slice(0, 24);

  // Get featured collections
  const { data: featuredCollections } = await supabase
    .from('collections')
    .select('id, title, slug, emoji, activity_ids')
    .eq('published', true)
    .eq('featured', true)
    .limit(4);

  const collections = (featuredCollections || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    emoji: c.emoji,
    activity_count: Array.isArray(c.activity_ids) ? c.activity_ids.length : 0,
  }));

  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return apiSuccess({
    greeting,
    firstName: profile.name?.split(' ')[0] || 'there',
    familyName: (family as any)?.name || 'Your family',
    weather,
    daysOfLearning,
    activitiesThisWeek,
    todayActivities: activities || [],
    featuredCollections: collections,
  });
}
