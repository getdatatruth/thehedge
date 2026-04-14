import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

interface ActivityRow {
  id: string;
  title: string;
  category: string;
}

interface LogRow {
  activity_id: string | null;
  rating: number | null;
}

interface ActivityPerformance {
  id: string;
  title: string;
  category: string;
  logCount: number;
  avgRating: number | null;
}

interface CategoryStat {
  category: string;
  logCount: number;
  activityCount: number;
  avgRating: number | null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const supabase = await createClient();

    // Fetch published activities and all logs in parallel
    const [activitiesRes, logsRes] = await Promise.all([
      supabase
        .from('activities')
        .select('id, title, category')
        .eq('published', true)
        .order('title', { ascending: true }),
      supabase
        .from('activity_logs')
        .select('activity_id, rating')
        .limit(50000),
    ]);

    const activities = (activitiesRes.data || []) as ActivityRow[];
    const logs = (logsRes.data || []) as LogRow[];

    // Build a map of activity_id -> log data
    const logsByActivity = new Map<string, { count: number; ratings: number[] }>();
    for (const log of logs) {
      if (!log.activity_id) continue;
      const entry = logsByActivity.get(log.activity_id) || { count: 0, ratings: [] };
      entry.count++;
      if (log.rating !== null && log.rating !== undefined) {
        entry.ratings.push(log.rating);
      }
      logsByActivity.set(log.activity_id, entry);
    }

    // Build performance data for each activity
    const activityPerformance: ActivityPerformance[] = activities.map((a) => {
      const entry = logsByActivity.get(a.id);
      const logCount = entry?.count || 0;
      const avgRating =
        entry && entry.ratings.length > 0
          ? Math.round((entry.ratings.reduce((s, r) => s + r, 0) / entry.ratings.length) * 10) / 10
          : null;
      return {
        id: a.id,
        title: a.title,
        category: a.category,
        logCount,
        avgRating,
      };
    });

    // Sort by log count descending
    const sorted = [...activityPerformance].sort((a, b) => b.logCount - a.logCount);
    const top20 = sorted.slice(0, 20);
    const bottom20 = sorted
      .filter((a) => a.logCount > 0)
      .slice(-20)
      .reverse();

    // Never logged activities
    const neverLogged = activityPerformance.filter((a) => a.logCount === 0);

    // Category performance
    const categoryMap = new Map<string, { logCount: number; activityCount: number; ratings: number[] }>();
    for (const a of activityPerformance) {
      const entry = categoryMap.get(a.category) || { logCount: 0, activityCount: 0, ratings: [] };
      entry.activityCount++;
      entry.logCount += a.logCount;
      const logEntry = logsByActivity.get(a.id);
      if (logEntry) {
        entry.ratings.push(...logEntry.ratings);
      }
      categoryMap.set(a.category, entry);
    }

    const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        logCount: data.logCount,
        activityCount: data.activityCount,
        avgRating:
          data.ratings.length > 0
            ? Math.round((data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length) * 10) / 10
            : null,
      }))
      .sort((a, b) => b.logCount - a.logCount);

    // Summary KPIs
    const totalActivities = activities.length;
    const totalLogs = logs.filter((l) => l.activity_id !== null).length;
    const avgLogsPerActivity = totalActivities > 0 ? Math.round((totalLogs / totalActivities) * 10) / 10 : 0;
    const categoriesCovered = categoryMap.size;

    return NextResponse.json({
      kpis: {
        totalActivities,
        totalLogs,
        avgLogsPerActivity,
        categoriesCovered,
      },
      top20,
      bottom20,
      categoryStats,
      neverLoggedCount: neverLogged.length,
      neverLoggedSample: neverLogged.slice(0, 10).map((a) => ({ title: a.title, category: a.category })),
    });
  } catch (error) {
    console.error('GET /api/admin/content error:', error);
    return NextResponse.json({ error: 'Failed to fetch content performance data' }, { status: 500 });
  }
}
