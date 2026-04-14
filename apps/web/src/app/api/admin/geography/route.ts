import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthStr = startOfMonth.toISOString();

  // Fetch families and activity logs in parallel
  const [familiesRes, logsRes] = await Promise.all([
    supabase
      .from('families')
      .select('id, county, subscription_tier, created_at'),
    supabase
      .from('activity_logs')
      .select('family_id, date')
      .gte('date', thirtyDaysAgoStr)
      .limit(10000),
  ]);

  const families = familiesRes.data || [];
  const logs = logsRes.data || [];

  // Build a set of active family IDs (activity in last 30 days)
  const activeFamilyIds = new Set(logs.map((l: { family_id: string }) => l.family_id));

  // Count logs per family
  const logsByFamily: Record<string, number> = {};
  for (const log of logs) {
    const fid = (log as { family_id: string }).family_id;
    logsByFamily[fid] = (logsByFamily[fid] || 0) + 1;
  }

  // Group families by county
  const countyMap: Record<string, {
    totalFamilies: number;
    activeFamilies: number;
    totalActivities: number;
    tiers: Record<string, number>;
    newSignups: number;
  }> = {};

  for (const family of families) {
    const f = family as {
      id: string;
      county: string | null;
      subscription_tier: string;
      created_at: string;
    };
    const county = f.county || 'Unknown';

    if (!countyMap[county]) {
      countyMap[county] = {
        totalFamilies: 0,
        activeFamilies: 0,
        totalActivities: 0,
        tiers: {},
        newSignups: 0,
      };
    }

    const entry = countyMap[county];
    entry.totalFamilies += 1;

    if (activeFamilyIds.has(f.id)) {
      entry.activeFamilies += 1;
    }

    entry.totalActivities += logsByFamily[f.id] || 0;

    const tier = f.subscription_tier || 'free';
    entry.tiers[tier] = (entry.tiers[tier] || 0) + 1;

    if (f.created_at >= startOfMonthStr) {
      entry.newSignups += 1;
    }
  }

  // Build county stats array
  const counties = Object.entries(countyMap).map(([county, data]) => {
    // Determine top tier
    let topTier = 'free';
    let topTierCount = 0;
    for (const [tier, count] of Object.entries(data.tiers)) {
      if (count > topTierCount) {
        topTier = tier;
        topTierCount = count;
      }
    }

    return {
      county,
      totalFamilies: data.totalFamilies,
      activeFamilies: data.activeFamilies,
      avgActivities: data.totalFamilies > 0
        ? Math.round((data.totalActivities / data.totalFamilies) * 10) / 10
        : 0,
      topTier,
      growth: data.newSignups,
    };
  });

  // Sort by totalFamilies descending by default
  counties.sort((a, b) => b.totalFamilies - a.totalFamilies);

  // Summary KPIs
  const countiesWithFamilies = counties.filter(c => c.county !== 'Unknown').length;
  const mostPopular = counties.length > 0 ? counties[0] : null;
  const fastestGrowing = [...counties].sort((a, b) => b.growth - a.growth)[0] || null;

  return NextResponse.json({
    counties,
    summary: {
      countiesWithFamilies,
      mostPopularCounty: mostPopular?.county || '-',
      mostPopularCount: mostPopular?.totalFamilies || 0,
      fastestGrowingCounty: fastestGrowing?.county || '-',
      fastestGrowingSignups: fastestGrowing?.growth || 0,
    },
  });
}
