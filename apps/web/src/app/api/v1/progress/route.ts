import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

// ── Progress, the gentle way ───────────────────────────────
//
// The Hedge does not score, rank, or streak families. Our brand
// promise is no points, no leaderboards, no guilt. We surface
// honest raw counts (activities, hours, days, breadth of areas)
// as warm, backward-looking reflection - never a number to chase.
//

/**
 * GET /api/v1/progress
 * Returns honest progress counts and category breadth (no score, tier, or streak).
 * Query params: child_id (optional)
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

  const { searchParams } = request.nextUrl;
  const childId = searchParams.get('child_id');

  // Get activity logs with activity details for category
  let logQuery = supabase
    .from('activity_logs')
    .select('*, activity:activity_id(category)')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false });

  if (childId) {
    logQuery = logQuery.contains('child_ids', [childId]);
  }

  const { data: logs } = await logQuery;
  const allLogs = logs || [];

  // Calculate stats
  const totalActivities = allLogs.length;
  const totalMinutes = allLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

  // Category breakdown - use joined activity category
  const categoryCount: Record<string, number> = {};
  for (const log of allLogs) {
    const category = Array.isArray(log.activity)
      ? log.activity[0]?.category
      : log.activity?.category;
    const cat = category || 'uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }

  // Distinct days with any learning logged (honest count, never a "streak")
  const uniqueDates = [...new Set(allLogs.map((l) => l.date))];

  // This week count
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split('T')[0];
  const thisWeek = allLogs.filter((l) => l.date >= mondayStr).length;

  // Average rating
  const rated = allLogs.filter((l) => l.rating);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, l) => sum + (l.rating || 0), 0) / rated.length
    : null;

  // Breadth of learning areas explored (warm reflection, not a target)
  const areasExplored = Object.keys(categoryCount).filter((k) => k !== 'uncategorized').length;

  return apiSuccess({
    total_activities: totalActivities,
    total_minutes: totalMinutes,
    this_week: thisWeek,
    average_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    unique_days: uniqueDates.length,
    areas_explored: areasExplored,
    category_breakdown: categoryCount,
  });
}
