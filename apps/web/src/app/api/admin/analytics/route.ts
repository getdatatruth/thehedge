import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  calcTotalFamilies, calcWeeklySignupTrend, calcMAU, calcWAU, calcDAU,
  calcChurnRate, calcTrialConversion, calcAvgActivitiesPerFamily,
  calcWeeklySignups, calcCumulativeFamilies, calcTierDistribution, calcStatusDistribution,
  calcDailyLogs, calcTopActivities, calcCategoryBreakdown,
  calcRetentionCohorts, buildRecentEvents,
  type FamilyRow, type ActivityLogRow, type ActivityRow,
} from '@/lib/admin/metrics';
import { getCurrentMRR, getMRRHistory, getRevenueByTier } from '@/lib/admin/stripe-metrics';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin (check if user has admin role or is in admin list)
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all data in parallel
  const [familiesRes, logsRes, activitiesRes, usersRes] = await Promise.all([
    supabase
      .from('families')
      .select('id, created_at, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('activity_logs')
      .select('id, family_id, date, duration_minutes, activity_id')
      .order('date', { ascending: false })
      .limit(5000),
    supabase
      .from('activities')
      .select('id, title, category')
      .eq('published', true),
    supabase
      .from('users')
      .select('id')
      .limit(1000),
  ]);

  const families = (familiesRes.data || []) as FamilyRow[];
  const logs = (logsRes.data || []) as ActivityLogRow[];
  const activities = (activitiesRes.data || []) as ActivityRow[];
  const totalUsers = usersRes.data?.length || 0;

  // Compute all metrics
  const totalFamilies = calcTotalFamilies(families);
  const signupTrend = calcWeeklySignupTrend(families);
  const mau = calcMAU(logs);
  const wau = calcWAU(logs);
  const dau = calcDAU(logs);
  const churnRate = calcChurnRate(families);
  const trialConversion = calcTrialConversion(families);
  const avgActivities = calcAvgActivitiesPerFamily(logs, totalFamilies);

  // Stripe metrics (async)
  const [mrr, mrrHistory, revenueByTier] = await Promise.all([
    getCurrentMRR(),
    getMRRHistory(12),
    getRevenueByTier(),
  ]);

  // Growth
  const weeklySignups = calcWeeklySignups(families, 12);
  const cumulativeFamilies = calcCumulativeFamilies(families, 12);
  const tierDistribution = calcTierDistribution(families);
  const statusDistribution = calcStatusDistribution(families);

  // Engagement
  const dailyLogs = calcDailyLogs(logs, 30);
  const topActivities = calcTopActivities(logs, activities, 10);
  const categoryBreakdown = calcCategoryBreakdown(logs, activities);

  // Retention
  const retentionCohorts = calcRetentionCohorts(families, logs, 6);

  // Recent events
  const recentEvents = buildRecentEvents(families, logs, activities, 15);

  return NextResponse.json({
    kpis: {
      totalFamilies,
      totalUsers,
      mau,
      wau,
      dau,
      mrr,
      churnRate,
      trialConversion,
      avgActivitiesPerFamily: avgActivities,
      signupTrend,
      totalActivities: activities.length,
      totalLogs: logs.length,
    },
    revenue: {
      mrr,
      mrrHistory,
      revenueByTier,
    },
    growth: {
      weeklySignups,
      cumulativeFamilies,
      tierDistribution,
      statusDistribution,
    },
    engagement: {
      dau, wau, mau,
      dailyLogs,
      topActivities,
      categoryBreakdown,
    },
    retention: {
      cohorts: retentionCohorts,
    },
    recentEvents,
  });
}
