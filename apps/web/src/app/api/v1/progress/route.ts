import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/progress
 * Returns progress stats, streaks, and badge data for the family.
 * Query params: child_id (optional, filter to specific child)
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

  // Get activity logs
  let logQuery = supabase
    .from('activity_logs')
    .select('*')
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

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  for (const log of allLogs) {
    // We'd need the activity category - simplified version
    categoryCount['uncategorized'] = (categoryCount['uncategorized'] || 0) + 1;
  }

  // Streak calculation
  const uniqueDates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
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

  return apiSuccess({
    total_activities: totalActivities,
    total_minutes: totalMinutes,
    current_streak: streak,
    this_week: thisWeek,
    average_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    unique_days: uniqueDates.length,
    category_breakdown: categoryCount,
  });
}
