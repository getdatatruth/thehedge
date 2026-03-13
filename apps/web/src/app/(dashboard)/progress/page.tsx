import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProgressClient } from './progress-client';
import {
  calculateBadges,
  calculateStreak,
  buildCalendarHeatmap,
  type LogForBadges,
} from '@/lib/badges';

export const metadata = {
  title: 'Progress & Badges — The Hedge',
};

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user profile with family
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) redirect('/onboarding');

  const familyId = profile.family_id;

  // Fetch children and activity_logs (with activity join) in parallel
  const [childrenRes, logsRes] = await Promise.all([
    supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status')
      .eq('family_id', familyId)
      .order('date_of_birth', { ascending: true }),
    supabase
      .from('activity_logs')
      .select('id, activity_id, child_ids, date, duration_minutes, rating, activities(title, category, slug)')
      .eq('family_id', familyId)
      .order('date', { ascending: false }),
  ]);

  const children = childrenRes.data || [];
  const logs = logsRes.data || [];

  // Calculate age from date_of_birth
  const childrenWithAge = children.map((child) => {
    const dob = new Date(child.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return { ...child, age };
  });

  // Helper to extract category from a log entry
  function getCategory(log: (typeof logs)[number]): string | null {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.category || null;
  }

  // Build LogForBadges for all family logs
  const allLogsForBadges: LogForBadges[] = logs.map((log) => ({
    date: log.date,
    category: getCategory(log),
    duration_minutes: log.duration_minutes,
  }));

  // Family-level calculations
  const familyBadges = calculateBadges(allLogsForBadges);
  const allDates = allLogsForBadges.map((l) => l.date);
  const { current: currentStreak, longest: longestStreak } = calculateStreak(allDates);
  const calendarData = buildCalendarHeatmap(allDates, 6);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const log of allLogsForBadges) {
    const cat = log.category || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // This week
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().split('T')[0];
  const activitiesThisWeek = logs.filter((l) => l.date >= weekStart).length;

  // Monthly breakdown (last 6 months)
  const monthlyActivity: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().substring(0, 7);
    const monthName = d.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
    const count = logs.filter((l) => l.date.startsWith(monthKey)).length;
    monthlyActivity.push({ month: monthName, count });
  }

  // Per-child stats with badges
  const childStats = childrenWithAge.map((child) => {
    const childLogs = logs.filter(
      (l) => Array.isArray(l.child_ids) && l.child_ids.includes(child.id)
    );

    const childLogsForBadges: LogForBadges[] = childLogs.map((log) => ({
      date: log.date,
      category: getCategory(log),
      duration_minutes: log.duration_minutes,
    }));

    const childDates = childLogsForBadges.map((l) => l.date);
    const childStreak = calculateStreak(childDates);
    const childBadges = calculateBadges(childLogsForBadges);

    const childCategoryCounts: Record<string, number> = {};
    for (const log of childLogsForBadges) {
      const cat = log.category || 'unknown';
      childCategoryCounts[cat] = (childCategoryCounts[cat] || 0) + 1;
    }

    return {
      id: child.id,
      name: child.name,
      age: child.age,
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

  return (
    <ProgressClient
      totalActivities={logs.length}
      totalMinutes={logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      activitiesThisWeek={activitiesThisWeek}
      categoryCounts={categoryCounts}
      childStats={childStats}
      badges={familyBadges}
      calendarData={calendarData}
      monthlyActivity={monthlyActivity}
    />
  );
}
