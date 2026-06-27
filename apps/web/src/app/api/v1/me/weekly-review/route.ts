import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { computeAreaWarmth, buildQuietFloor, LEARNING_AREAS } from '@/lib/personalisation';

export const maxDuration = 30;

export async function OPTIONS() {
  return apiOptions();
}

const AREA_LABEL: Record<string, string> = {
  nature: 'nature and the outdoors', science: 'science', art: 'art and making', maths: 'numbers',
  literacy: 'stories and words', movement: 'moving about', kitchen: 'the kitchen',
  life_skills: 'life skills', calm: 'calm and quiet', social: 'time with others',
};

// GET /api/v1/me/weekly-review
// The Sunday review: what the past week covered (breadth + the lovely/quiet
// areas), the moments kept, and a gentle look at the week ahead.
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase.from('users').select('name, family_id').eq('id', user.id).single();
  if (!profile?.family_id) return apiError('No family found', 400);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const { data: children } = await supabase.from('children').select('id, name').eq('family_id', profile.family_id);
  const childIds = (children || []).map((c) => c.id);

  // This week's logs (with category).
  const { data: weekLogs } = await supabase
    .from('activity_logs')
    .select('date, child_ids, duration_minutes, activities(title, category)')
    .eq('family_id', profile.family_id)
    .gte('date', weekAgo)
    .lte('date', today);
  const logs = weekLogs || [];

  const catOf = (l: { activities: unknown }) => {
    const a = Array.isArray(l.activities) ? l.activities[0] : l.activities;
    return (a as { category?: string } | null)?.category || null;
  };

  const categoryCounts: Record<string, number> = {};
  let minutes = 0;
  const days = new Set<string>();
  for (const l of logs) {
    const c = catOf(l);
    if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    minutes += (l as { duration_minutes?: number }).duration_minutes || 0;
    days.add(l.date as string);
  }

  // Recency-weighted warmth over more history (so a quiet week reads honestly).
  const { data: allLogs } = await supabase
    .from('activity_logs')
    .select('date, activities(category)')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false })
    .limit(200);
  const warmth = computeAreaWarmth(
    (allLogs || []).map((l) => ({ date: l.date as string, category: catOf(l) })),
    now,
  );
  const lovely = LEARNING_AREAS.filter((a) => warmth[a]?.klass === 'warm').slice(0, 3).map((a) => AREA_LABEL[a] || a);
  const quietFloor = buildQuietFloor(warmth);

  // The week ahead: planned blocks across the family.
  const { count: nextWeekPlanned } = childIds.length
    ? await supabase.from('daily_plans').select('id', { count: 'exact', head: true }).in('child_id', childIds).gte('date', today).lte('date', nextWeek)
    : { count: 0 };

  return apiSuccess({
    firstName: profile.name?.split(' ')[0] || 'there',
    weekFrom: weekAgo,
    weekTo: today,
    activityCount: logs.length,
    daysOfLearning: days.size,
    totalMinutes: minutes,
    areasTouched: Object.keys(categoryCounts).length,
    categoryBreakdown: categoryCounts,
    lovelyAreas: lovely,
    quietFloor,
    nextWeekPlanned: nextWeekPlanned || 0,
  });
}
