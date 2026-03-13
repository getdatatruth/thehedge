import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculateBadges, calculateStreak, buildCalendarHeatmap, type LogForBadges } from '@/lib/badges';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json(
        { error: 'No family found for user' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId'); // optional filter

    // Fetch all logs with activity details
    let query = supabase
      .from('activity_logs')
      .select('id, activity_id, child_ids, date, duration_minutes, rating, activities(title, category, slug)')
      .eq('family_id', profile.family_id)
      .order('date', { ascending: false });

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error('Failed to fetch activity logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
    }

    // Fetch children
    const { data: childrenData } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status')
      .eq('family_id', profile.family_id)
      .order('date_of_birth', { ascending: true });

    const children = childrenData || [];
    const allLogs = logs || [];

    // Filter logs if childId is specified
    const filteredLogs = childId
      ? allLogs.filter((l) => Array.isArray(l.child_ids) && l.child_ids.includes(childId))
      : allLogs;

    // Build LogForBadges array
    const logsForBadges: LogForBadges[] = filteredLogs.map((log) => {
      const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
      return {
        date: log.date,
        category: activity?.category || null,
        duration_minutes: log.duration_minutes,
      };
    });

    // Calculate badges
    const badges = calculateBadges(logsForBadges);

    // Calculate streaks
    const dates = logsForBadges.map((l) => l.date);
    const { current: currentStreak, longest: longestStreak } = calculateStreak(dates);

    // Calendar heatmap
    const calendarData = buildCalendarHeatmap(dates, 6);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const log of logsForBadges) {
      const cat = log.category || 'unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Total stats
    const totalActivities = filteredLogs.length;
    const totalMinutes = filteredLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

    // This week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.toISOString().split('T')[0];
    const activitiesThisWeek = filteredLogs.filter((l) => l.date >= weekStart).length;

    // Per-child stats
    const childStats = children.map((child) => {
      const dob = new Date(child.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const childLogs = allLogs.filter(
        (l) => Array.isArray(l.child_ids) && l.child_ids.includes(child.id)
      );

      const childLogsForBadges: LogForBadges[] = childLogs.map((log) => {
        const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
        return {
          date: log.date,
          category: activity?.category || null,
          duration_minutes: log.duration_minutes,
        };
      });

      const childDates = childLogsForBadges.map((l) => l.date);
      const childStreak = calculateStreak(childDates);

      const childCategoryCounts: Record<string, number> = {};
      for (const log of childLogsForBadges) {
        const cat = log.category || 'unknown';
        childCategoryCounts[cat] = (childCategoryCounts[cat] || 0) + 1;
      }

      const childBadges = calculateBadges(childLogsForBadges);

      return {
        id: child.id,
        name: child.name,
        age,
        interests: child.interests || [],
        totalActivities: childLogs.length,
        totalMinutes: childLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
        currentStreak: childStreak.current,
        longestStreak: childStreak.longest,
        categoryCounts: childCategoryCounts,
        categoriesCovered: Object.keys(childCategoryCounts).filter((k) => k !== 'unknown').length,
        badgesEarned: childBadges.filter((b) => b.unlocked).length,
        badges: childBadges,
        calendarData: buildCalendarHeatmap(childDates, 6),
      };
    });

    // Monthly breakdown (last 6 months)
    const monthlyActivity: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().substring(0, 7);
      const monthName = d.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
      const count = filteredLogs.filter((l) => l.date.startsWith(monthKey)).length;
      monthlyActivity.push({ month: monthName, count });
    }

    return NextResponse.json({
      totalActivities,
      totalMinutes,
      currentStreak,
      longestStreak,
      activitiesThisWeek,
      categoryCounts,
      badges,
      calendarData,
      childStats,
      monthlyActivity,
    });
  } catch (err) {
    console.error('Progress GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
