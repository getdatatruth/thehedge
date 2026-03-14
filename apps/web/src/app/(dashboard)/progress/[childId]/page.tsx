import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChildProgressClient } from './child-progress-client';
import {
  calculateBadges,
  calculateStreak,
  buildCalendarHeatmap,
  type LogForBadges,
} from '@/lib/badges';

export const metadata = {
  title: 'Child Progress - The Hedge',
};

export default async function ChildProgressPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user's family_id
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) redirect('/onboarding');

  // Get child info (and verify it belongs to this family)
  const { data: child } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests, school_status')
    .eq('id', childId)
    .eq('family_id', profile.family_id)
    .single();

  if (!child) notFound();

  // Calculate age
  const dob = new Date(child.date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Fetch activity_logs and portfolio_entries in parallel
  const [logsRes, portfolioRes] = await Promise.all([
    supabase
      .from('activity_logs')
      .select('id, activity_id, child_ids, date, duration_minutes, rating, notes, activities(title, category, slug)')
      .eq('family_id', profile.family_id)
      .contains('child_ids', [childId])
      .order('date', { ascending: false }),
    supabase
      .from('portfolio_entries')
      .select('id, date, title, description, curriculum_areas, photos, activity_log_id')
      .eq('child_id', childId)
      .order('date', { ascending: false }),
  ]);

  const logs = logsRes.data || [];
  const portfolioEntries = portfolioRes.data || [];

  // Calculate stats
  const totalActivities = logs.length;
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const ratedLogs = logs.filter((l) => l.rating != null && l.rating > 0);
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum, l) => sum + (l.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null;

  // Build badge data
  const logsForBadges: LogForBadges[] = logs.map((log) => {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return {
      date: log.date,
      category: activity?.category || null,
      duration_minutes: log.duration_minutes,
    };
  });

  const badges = calculateBadges(logsForBadges);
  const dates = logsForBadges.map((l) => l.date);
  const { current: currentStreak, longest: longestStreak } = calculateStreak(dates);
  const calendarData = buildCalendarHeatmap(dates, 6);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const log of logsForBadges) {
    const cat = log.category || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Serialize logs for the client
  const serializedLogs = logs.map((log) => {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return {
      id: log.id,
      date: log.date,
      duration_minutes: log.duration_minutes,
      rating: log.rating,
      notes: log.notes,
      activity: activity
        ? { title: activity.title, category: activity.category, slug: activity.slug }
        : { title: 'Unknown Activity', category: 'nature', slug: '' },
    };
  });

  // Serialize portfolio entries
  const serializedPortfolio = portfolioEntries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    title: entry.title,
    description: entry.description,
    curriculum_areas: entry.curriculum_areas || [],
    photos: entry.photos || [],
  }));

  return (
    <ChildProgressClient
      child={{
        id: child.id,
        name: child.name,
        age,
        interests: child.interests || [],
      }}
      totalActivities={totalActivities}
      totalMinutes={totalMinutes}
      avgRating={avgRating}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      categoryCounts={categoryCounts}
      badges={badges}
      calendarData={calendarData}
      activityLogs={serializedLogs}
      portfolioEntries={serializedPortfolio}
    />
  );
}
