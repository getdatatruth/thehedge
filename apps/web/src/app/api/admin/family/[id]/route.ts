import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Family details
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', id)
    .single();

  if (!family) return NextResponse.json({ error: 'Family not found' }, { status: 404 });

  // Members
  const { data: members } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('family_id', id);

  // Children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests, school_status')
    .eq('family_id', id);

  // Activity logs (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, rating, activity_id, activities(title, category)')
    .eq('family_id', id)
    .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // Calculate health metrics
  const allLogs = logs || [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Streak
  const uniqueDates = [...new Set(allLogs.map(l => l.date))].sort().reverse();
  let streak = 0;
  let checkDate = new Date(todayStr);
  for (const dateStr of uniqueDates) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateStr === checkStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < checkStr) break;
  }

  // Weekly activity for last 12 weeks
  const weeklyActivity: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1 - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    const count = allLogs.filter(l => l.date >= startStr && l.date < endStr).length;
    weeklyActivity.push({
      week: weekStart.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }),
      count,
    });
  }

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  for (const log of allLogs) {
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    const cat = (activity as { category?: string })?.category || 'unknown';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  // Days since last activity
  const lastActivityDate = uniqueDates[0] || null;
  const daysSinceLastActivity = lastActivityDate
    ? Math.floor((now.getTime() - new Date(lastActivityDate + 'T00:00:00').getTime()) / 86400000)
    : null;

  // Risk assessment
  let riskLevel: 'healthy' | 'at-risk' | 'churning' | 'inactive' = 'healthy';
  if (daysSinceLastActivity === null || daysSinceLastActivity > 30) riskLevel = 'inactive';
  else if (daysSinceLastActivity > 14) riskLevel = 'churning';
  else if (daysSinceLastActivity > 7) riskLevel = 'at-risk';

  // Average rating
  const rated = allLogs.filter(l => l.rating);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((s, l) => s + (l.rating || 0), 0) / rated.length) * 10) / 10
    : null;

  // Recent activities (last 10)
  const recentActivities = allLogs.slice(0, 10).map(l => {
    const activity = Array.isArray(l.activities) ? l.activities[0] : l.activities;
    return {
      date: l.date,
      title: (activity as { title?: string })?.title || 'Unknown',
      category: (activity as { category?: string })?.category || 'unknown',
      duration: l.duration_minutes,
      rating: l.rating,
    };
  });

  return NextResponse.json({
    family: {
      id: family.id,
      name: family.name,
      county: family.county,
      country: family.country,
      tier: family.subscription_tier,
      status: family.subscription_status,
      stripeCustomerId: family.stripe_customer_id,
      trialEndsAt: family.trial_ends_at,
      onboardingCompleted: family.onboarding_completed,
      createdAt: family.created_at,
    },
    members: members || [],
    children: (children || []).map(c => ({
      ...c,
      age: Math.floor((now.getTime() - new Date(c.date_of_birth).getTime()) / (365.25 * 86400000)),
    })),
    health: {
      totalActivities: allLogs.length,
      currentStreak: streak,
      daysSinceLastActivity,
      lastActivityDate,
      riskLevel,
      avgRating,
      totalMinutes: allLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0),
      categoriesExplored: Object.keys(categoryBreakdown).filter(k => k !== 'unknown').length,
    },
    weeklyActivity,
    categoryBreakdown,
    recentActivities,
  });
}
