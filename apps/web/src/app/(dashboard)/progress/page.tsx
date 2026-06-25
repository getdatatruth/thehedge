import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProgressClient } from './progress-client';

export const metadata = {
  title: 'Progress - The Hedge',
};

const ALL_CATEGORIES = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];

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

  // Family-level reflection stats
  const categoryCounts: Record<string, number> = {};
  const allDates: string[] = [];
  for (const log of logs) {
    const cat = getCategory(log) || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    allDates.push(log.date);
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

  const uniqueDays = new Set(allDates).size;
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const areasExplored = Object.keys(categoryCounts).filter((k) => k !== 'unknown').length;
  const ratedLogs = logs.filter((l) => l.rating != null && l.rating > 0);
  const averageRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum, l) => sum + (l.rating || 0), 0) / ratedLogs.length)
    : null;

  // Per-child reflection stats
  const childStats = childrenWithAge.map((child) => {
    const childLogs = logs.filter(
      (l) => Array.isArray(l.child_ids) && l.child_ids.includes(child.id)
    );
    const childCategoryCounts: Record<string, number> = {};
    const childDates: string[] = [];
    for (const log of childLogs) {
      const cat = getCategory(log) || 'unknown';
      childCategoryCounts[cat] = (childCategoryCounts[cat] || 0) + 1;
      childDates.push(log.date);
    }
    const childTotalMinutes = childLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
    const childRated = childLogs.filter((l) => l.rating != null && l.rating > 0);
    const childAverageRating = childRated.length > 0
      ? (childRated.reduce((sum, l) => sum + (l.rating || 0), 0) / childRated.length)
      : null;

    return {
      id: child.id,
      name: child.name,
      age: child.age,
      interests: child.interests || [],
      totalActivities: childLogs.length,
      totalMinutes: childTotalMinutes,
      uniqueDays: new Set(childDates).size,
      categoryCounts: childCategoryCounts,
      areasExplored: Object.keys(childCategoryCounts).filter((k) => k !== 'unknown').length,
      averageRating: childAverageRating,
    };
  });

  return (
    <ProgressClient
      totalActivities={logs.length}
      totalMinutes={totalMinutes}
      uniqueDays={uniqueDays}
      activitiesThisWeek={activitiesThisWeek}
      areasExplored={areasExplored}
      totalAreas={ALL_CATEGORIES.length}
      averageRating={averageRating}
      categoryCounts={categoryCounts}
      childStats={childStats}
      monthlyActivity={monthlyActivity}
      children={childrenWithAge.map((c) => ({ id: c.id, name: c.name, age: c.age }))}
    />
  );
}
