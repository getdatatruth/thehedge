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
  title: 'Progress & Badges - The Hedge',
};

// ── Hedge Score Algorithm (mirrored from /api/v1/progress) ──

const TIERS = [
  { name: 'Seedling', emoji: '🌱', min: 0, max: 99 },
  { name: 'Sprout', emoji: '🌿', min: 100, max: 249 },
  { name: 'Sapling', emoji: '🌳', min: 250, max: 449 },
  { name: 'Young Oak', emoji: '🌲', min: 450, max: 699 },
  { name: 'Oak', emoji: '🏆', min: 700, max: 899 },
  { name: 'Ancient Oak', emoji: '👑', min: 900, max: 1000 },
];

function calculateHedgeScore(stats: {
  totalActivities: number;
  currentStreak: number;
  uniqueDays: number;
  totalMinutes: number;
  categoriesExplored: number;
}) {
  const volume = Math.min(250, stats.totalActivities);
  const consistency = Math.min(250,
    Math.min(150, stats.currentStreak * 5) +
    Math.min(100, stats.uniqueDays)
  );
  const breadth = Math.min(250, stats.categoriesExplored * 25);
  const depth = Math.min(250, Math.floor(stats.totalMinutes / 10));
  return {
    score: volume + consistency + breadth + depth,
    breakdown: { volume, consistency, breadth, depth },
  };
}

function getTierInfo(score: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i].min) {
      const tier = TIERS[i];
      const nextTier = i < TIERS.length - 1 ? TIERS[i + 1] : null;
      const tierRange = tier.max - tier.min;
      const progress = tierRange > 0 ? Math.min(1, (score - tier.min) / tierRange) : 1;
      return {
        name: tier.name,
        emoji: tier.emoji,
        nextTier: nextTier?.name || null,
        minScore: tier.min,
        maxScore: tier.max,
        progress,
      };
    }
  }
  return { name: 'Seedling', emoji: '🌱', nextTier: 'Sprout', minScore: 0, maxScore: 99, progress: 0 };
}

function computeAchievements(totalActivities: number, streak: number, categoriesExplored: number, totalMinutes: number, uniqueDays: number) {
  return [
    { id: 'first_activity', name: 'First Activity', emoji: '🌱', unlocked: totalActivities >= 1, requirement: 'Complete 1 activity', threshold: 1, current: totalActivities },
    { id: 'streak_3', name: '3-Day Streak', emoji: '🔥', unlocked: streak >= 3 || uniqueDays >= 3, requirement: '3 days in a row', threshold: 3, current: streak },
    { id: 'streak_7', name: 'Week Warrior', emoji: '⚡', unlocked: streak >= 7 || uniqueDays >= 7, requirement: '7 days in a row', threshold: 7, current: streak },
    { id: 'ten_activities', name: 'Getting Going', emoji: '🚀', unlocked: totalActivities >= 10, requirement: '10 activities completed', threshold: 10, current: totalActivities },
    { id: 'five_categories', name: 'Explorer', emoji: '🧭', unlocked: categoriesExplored >= 5, requirement: 'Try 5 different categories', threshold: 5, current: categoriesExplored },
    { id: 'all_categories', name: 'Renaissance', emoji: '🌈', unlocked: categoriesExplored >= 10, requirement: 'Try all 10 categories', threshold: 10, current: categoriesExplored },
    { id: 'fifty_activities', name: 'Half Century', emoji: '⭐', unlocked: totalActivities >= 50, requirement: '50 activities completed', threshold: 50, current: totalActivities },
    { id: 'streak_30', name: 'Month Master', emoji: '👑', unlocked: streak >= 30, requirement: '30 days in a row', threshold: 30, current: streak },
    { id: 'hundred_activities', name: 'Centurion', emoji: '🏆', unlocked: totalActivities >= 100, requirement: '100 activities completed', threshold: 100, current: totalActivities },
    { id: 'ten_hours', name: 'Time Investor', emoji: '⏰', unlocked: totalMinutes >= 600, requirement: '10 hours of learning', threshold: 600, current: totalMinutes },
  ];
}

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) redirect('/onboarding');

  const familyId = profile.family_id;

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

  function getCategory(log: (typeof logs)[number]): string | null {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.category || null;
  }

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

  const categoryCounts: Record<string, number> = {};
  for (const log of allLogsForBadges) {
    const cat = log.category || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().split('T')[0];
  const activitiesThisWeek = logs.filter((l) => l.date >= weekStart).length;

  const monthlyActivity: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().substring(0, 7);
    const monthName = d.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
    const count = logs.filter((l) => l.date.startsWith(monthKey)).length;
    monthlyActivity.push({ month: monthName, count });
  }

  // Hedge Score
  const uniqueDates = [...new Set(allDates)];
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const categoriesExplored = Object.keys(categoryCounts).filter(k => k !== 'unknown').length;
  const hedgeScore = calculateHedgeScore({
    totalActivities: logs.length,
    currentStreak,
    uniqueDays: uniqueDates.length,
    totalMinutes,
    categoriesExplored,
  });
  const tier = getTierInfo(hedgeScore.score);

  // Achievements
  const achievements = computeAchievements(logs.length, currentStreak, categoriesExplored, totalMinutes, uniqueDates.length);

  // Milestones
  const milestones = [
    { id: 'first_week', name: 'First week complete', done: uniqueDates.length >= 7 },
    { id: 'ten_activities', name: '10 activities logged', done: logs.length >= 10 },
    { id: 'all_categories', name: 'All categories explored', done: categoriesExplored >= 10 },
    { id: 'streak_30', name: '30-day streak', done: currentStreak >= 30 },
  ];

  // Per-child stats
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
    const childTotalMinutes = childLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
    const childUniqueDates = [...new Set(childDates)];
    const childCatsExplored = Object.keys(childCategoryCounts).filter(k => k !== 'unknown').length;
    const childHedgeScore = calculateHedgeScore({
      totalActivities: childLogs.length,
      currentStreak: childStreak.current,
      uniqueDays: childUniqueDates.length,
      totalMinutes: childTotalMinutes,
      categoriesExplored: childCatsExplored,
    });
    const childTier = getTierInfo(childHedgeScore.score);

    return {
      id: child.id,
      name: child.name,
      age: child.age,
      interests: child.interests || [],
      totalActivities: childLogs.length,
      totalMinutes: childTotalMinutes,
      currentStreak: childStreak.current,
      longestStreak: childStreak.longest,
      categoryCounts: childCategoryCounts,
      categoriesCovered: childCatsExplored,
      badgesEarned: childBadges.filter((b) => b.unlocked).length,
      badges: childBadges,
      calendarData: buildCalendarHeatmap(childDates, 6),
      hedgeScore: childHedgeScore,
      tier: childTier,
    };
  });

  return (
    <ProgressClient
      totalActivities={logs.length}
      totalMinutes={totalMinutes}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      activitiesThisWeek={activitiesThisWeek}
      categoryCounts={categoryCounts}
      childStats={childStats}
      badges={familyBadges}
      calendarData={calendarData}
      monthlyActivity={monthlyActivity}
      hedgeScore={hedgeScore}
      tier={tier}
      achievements={achievements}
      milestones={milestones}
      children={childrenWithAge.map(c => ({ id: c.id, name: c.name, age: c.age }))}
    />
  );
}
