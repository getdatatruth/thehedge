import { createAdminClient } from '@/lib/supabase/admin';

// ─── Dashboard Stats ────────────────────────────────────

export async function getAdminStats() {
  const supabase = createAdminClient();

  const [
    { count: totalFamilies },
    { count: totalUsers },
    { count: totalActivities },
    { count: totalLogs },
    { count: publishedActivities },
    { count: draftActivities },
  ] = await Promise.all([
    supabase.from('families').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('published', false),
  ]);

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentSignups } = await supabase
    .from('families')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  // Previous 7 days for comparison
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const { count: prevWeekSignups } = await supabase
    .from('families')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', fourteenDaysAgo.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString());

  // Subscription tier distribution
  const { data: tierData } = await supabase
    .from('families')
    .select('subscription_tier');

  const tierDistribution: Record<string, number> = { free: 0, family: 0, educator: 0 };
  (tierData || []).forEach((f: { subscription_tier: string }) => {
    const tier = f.subscription_tier || 'free';
    tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
  });

  // Activity logs this week
  const { count: logsThisWeek } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  // Recent signups list (last 7 days, limit 10)
  const { data: recentSignupsList } = await supabase
    .from('families')
    .select('id, name, county, subscription_tier, onboarding_completed, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Top activities by log count
  const { data: topActivitiesRaw } = await supabase
    .from('activity_logs')
    .select('activity_id')
    .not('activity_id', 'is', null);

  const activityLogCounts: Record<string, number> = {};
  (topActivitiesRaw || []).forEach((log: { activity_id: string }) => {
    activityLogCounts[log.activity_id] = (activityLogCounts[log.activity_id] || 0) + 1;
  });

  const topActivityIds = Object.entries(activityLogCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  let topActivities: { title: string; logs: number }[] = [];
  if (topActivityIds.length > 0) {
    const { data: activityDetails } = await supabase
      .from('activities')
      .select('id, title')
      .in('id', topActivityIds);

    topActivities = topActivityIds.map((id) => {
      const activity = (activityDetails || []).find((a: { id: string; title: string }) => a.id === id);
      return {
        title: activity?.title || 'Unknown',
        logs: activityLogCounts[id],
      };
    });
  }

  return {
    totalFamilies: totalFamilies || 0,
    totalUsers: totalUsers || 0,
    totalActivities: totalActivities || 0,
    totalLogs: totalLogs || 0,
    publishedActivities: publishedActivities || 0,
    draftActivities: draftActivities || 0,
    recentSignups: recentSignups || 0,
    prevWeekSignups: prevWeekSignups || 0,
    tierDistribution,
    logsThisWeek: logsThisWeek || 0,
    recentSignupsList: recentSignupsList || [],
    topActivities,
  };
}

// ─── Activities ─────────────────────────────────────────

export async function getAllActivities() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getActivityById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function toggleActivityPublished(id: string, published: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('activities')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteActivity(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createActivity(data: {
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[] };
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  location: string;
  energy_level: string;
  mess_level: string;
  screen_free: boolean;
  premium: boolean;
  materials: { name: string; household_common: boolean }[];
  learning_outcomes: string[];
  published: boolean;
}) {
  const supabase = createAdminClient();
  const { data: result, error } = await supabase
    .from('activities')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateActivity(id: string, data: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('activities')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// ─── Users / Families ───────────────────────────────────

export async function getAllFamilies() {
  const supabase = createAdminClient();

  const { data: families, error } = await supabase
    .from('families')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get child counts per family
  const { data: children } = await supabase
    .from('children')
    .select('family_id');

  const childCounts: Record<string, number> = {};
  (children || []).forEach((c: { family_id: string }) => {
    childCounts[c.family_id] = (childCounts[c.family_id] || 0) + 1;
  });

  // Get user (member) counts per family
  const { data: users } = await supabase
    .from('users')
    .select('family_id, email');

  const userInfo: Record<string, { count: number; email: string }> = {};
  (users || []).forEach((u: { family_id: string; email: string }) => {
    if (!u.family_id) return;
    if (!userInfo[u.family_id]) {
      userInfo[u.family_id] = { count: 0, email: u.email };
    }
    userInfo[u.family_id].count++;
  });

  // Get activity log counts per family
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('family_id');

  const logCounts: Record<string, number> = {};
  (logs || []).forEach((l: { family_id: string }) => {
    logCounts[l.family_id] = (logCounts[l.family_id] || 0) + 1;
  });

  return (families || []).map((f: Record<string, unknown>) => ({
    ...f,
    child_count: childCounts[f.id as string] || 0,
    member_count: userInfo[f.id as string]?.count || 0,
    email: userInfo[f.id as string]?.email || '',
    activity_log_count: logCounts[f.id as string] || 0,
  }));
}

export async function getFamilyDetail(familyId: string) {
  const supabase = createAdminClient();

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();

  if (familyError || !family) return null;

  const [
    { data: members },
    { data: children },
    { data: logs },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true }),
    supabase
      .from('children')
      .select('id, name, date_of_birth, school_status, interests, learning_style, sen_flags')
      .eq('family_id', familyId)
      .order('date_of_birth', { ascending: true }),
    supabase
      .from('activity_logs')
      .select('id, date, activity_id, duration_minutes, rating, notes')
      .eq('family_id', familyId)
      .order('date', { ascending: false })
      .limit(20),
  ]);

  // Enrich logs with activity titles
  const activityIds = [...new Set((logs || []).map((l: { activity_id: string | null }) => l.activity_id).filter(Boolean))];
  let activityTitles: Record<string, string> = {};
  if (activityIds.length > 0) {
    const { data: activityData } = await supabase
      .from('activities')
      .select('id, title')
      .in('id', activityIds);
    activityTitles = (activityData || []).reduce(
      (acc: Record<string, string>, a: { id: string; title: string }) => {
        acc[a.id] = a.title;
        return acc;
      },
      {},
    );
  }

  const recentLogs = (logs || []).map((log: { id: string; date: string; activity_id: string | null; duration_minutes: number | null; rating: number | null; notes: string | null }) => ({
    ...log,
    activity_title: log.activity_id ? activityTitles[log.activity_id] || 'Unknown' : 'Custom activity',
  }));

  return {
    family,
    members: members || [],
    children: children || [],
    recentLogs,
  };
}

// ─── Analytics ──────────────────────────────────────────

export async function getAnalytics() {
  const supabase = createAdminClient();

  // Daily log counts for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('date, family_id, activity_id')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

  // Group logs by date
  const logsByDate: Record<string, number> = {};
  (recentLogs || []).forEach((log: { date: string }) => {
    logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
  });

  // Most popular activities (all time)
  const { data: allLogs } = await supabase
    .from('activity_logs')
    .select('activity_id, family_id')
    .not('activity_id', 'is', null);

  const activityCounts: Record<string, number> = {};
  const familyActivityCounts: Record<string, number> = {};
  (allLogs || []).forEach((log: { activity_id: string; family_id: string }) => {
    activityCounts[log.activity_id] = (activityCounts[log.activity_id] || 0) + 1;
    familyActivityCounts[log.family_id] = (familyActivityCounts[log.family_id] || 0) + 1;
  });

  // Get activity titles for top activities
  const topActivityIds = Object.entries(activityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id]) => id);

  let popularActivities: { id: string; title: string; category: string; logs: number }[] = [];
  if (topActivityIds.length > 0) {
    const { data: activityDetails } = await supabase
      .from('activities')
      .select('id, title, category')
      .in('id', topActivityIds);

    popularActivities = topActivityIds.map((id) => {
      const a = (activityDetails || []).find((act: { id: string }) => act.id === id);
      return {
        id,
        title: a?.title || 'Unknown',
        category: a?.category || 'nature',
        logs: activityCounts[id],
      };
    });
  }

  // Most active families
  const topFamilyIds = Object.entries(familyActivityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id]) => id);

  let activeFamilies: { id: string; name: string; tier: string; logs: number }[] = [];
  if (topFamilyIds.length > 0) {
    const { data: familyDetails } = await supabase
      .from('families')
      .select('id, name, subscription_tier')
      .in('id', topFamilyIds);

    activeFamilies = topFamilyIds.map((id) => {
      const f = (familyDetails || []).find((fam: { id: string }) => fam.id === id);
      return {
        id,
        name: f?.name || 'Unknown',
        tier: f?.subscription_tier || 'free',
        logs: familyActivityCounts[id],
      };
    });
  }

  // Tier distribution
  const { data: tierData } = await supabase
    .from('families')
    .select('subscription_tier');

  const tierDistribution: Record<string, number> = { free: 0, family: 0, educator: 0 };
  (tierData || []).forEach((f: { subscription_tier: string }) => {
    tierDistribution[f.subscription_tier || 'free'] = (tierDistribution[f.subscription_tier || 'free'] || 0) + 1;
  });

  // Weekly signup counts (last 10 weeks) — batch query
  const tenWeeksAgo = new Date();
  tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
  tenWeeksAgo.setHours(0, 0, 0, 0);

  const { data: signupDates } = await supabase
    .from('families')
    .select('created_at')
    .gte('created_at', tenWeeksAgo.toISOString());

  const weeklySignups: { week: string; count: number }[] = [];
  for (let i = 9; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = (signupDates || []).filter((f: { created_at: string }) => {
      const d = new Date(f.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;

    const monthDay = weekStart.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });
    weeklySignups.push({ week: monthDay, count });
  }

  return {
    logsByDate,
    popularActivities,
    activeFamilies,
    tierDistribution,
    weeklySignups,
  };
}
