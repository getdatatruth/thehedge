import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

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
    .select('date')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false })
    .limit(100);

  const allLogs = logs || [];
  const activitiesThisWeek = allLogs.filter((l) => l.date >= mondayStr).length;

  // Streak calculation
  const uniqueDates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  const todayStr = now.toISOString().split('T')[0];
  const checkDate = new Date(todayStr);

  for (const dateStr of uniqueDates) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateStr === checkStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < checkStr) {
      break;
    }
  }

  // Get a few suggested activities for today
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, category, slug, duration_minutes')
    .limit(5);

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
    streak,
    activitiesThisWeek,
    todayActivities: activities || [],
    featuredCollections: collections,
  });
}
