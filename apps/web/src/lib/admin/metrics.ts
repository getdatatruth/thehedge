// ─── Admin Metrics Calculation Functions ─────────────────
// Pure functions that compute KPIs from raw database data.
// These are called by the analytics API route.

export interface FamilyRow {
  id: string;
  created_at: string;
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
}

export interface ActivityLogRow {
  id: string;
  family_id: string;
  date: string;
  duration_minutes: number;
  activity_id: string;
}

export interface ActivityRow {
  id: string;
  title: string;
  category: string;
}

// ─── KPI Calculations ────────────────────────────────────

export function calcTotalFamilies(families: FamilyRow[]): number {
  return families.length;
}

export function calcWeeklySignupTrend(families: FamilyRow[]): { current: number; previous: number; change: number } {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const current = families.filter(f => new Date(f.created_at) >= thisWeekStart).length;
  const previous = families.filter(f => {
    const d = new Date(f.created_at);
    return d >= lastWeekStart && d < thisWeekStart;
  }).length;

  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  return { current, previous, change };
}

export function calcMAU(logs: ActivityLogRow[]): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
  const activeFamilies = new Set(logs.filter(l => l.date >= dateStr).map(l => l.family_id));
  return activeFamilies.size;
}

export function calcWAU(logs: ActivityLogRow[]): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];
  const activeFamilies = new Set(logs.filter(l => l.date >= dateStr).map(l => l.family_id));
  return activeFamilies.size;
}

export function calcDAU(logs: ActivityLogRow[]): number {
  const today = new Date().toISOString().split('T')[0];
  const activeFamilies = new Set(logs.filter(l => l.date === today).map(l => l.family_id));
  return activeFamilies.size;
}

export function calcChurnRate(families: FamilyRow[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const payingAtStartOfMonth = families.filter(f => {
    const created = new Date(f.created_at);
    return created < monthStart && (f.subscription_tier === 'family' || f.subscription_tier === 'educator');
  }).length;

  const cancelledThisMonth = families.filter(f => {
    return f.subscription_status === 'cancelled' &&
      (f.subscription_tier === 'family' || f.subscription_tier === 'educator');
  }).length;

  if (payingAtStartOfMonth === 0) return 0;
  return Math.round((cancelledThisMonth / payingAtStartOfMonth) * 100 * 10) / 10;
}

export function calcTrialConversion(families: FamilyRow[]): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Families whose trial ended in last 30 days
  const trialEnded = families.filter(f => {
    if (!f.trial_ends_at) return false;
    const trialEnd = new Date(f.trial_ends_at);
    return trialEnd >= thirtyDaysAgo && trialEnd <= new Date();
  });

  if (trialEnded.length === 0) return 0;

  const converted = trialEnded.filter(f =>
    f.subscription_status === 'active' && f.subscription_tier !== 'free'
  ).length;

  return Math.round((converted / trialEnded.length) * 100);
}

export function calcAvgActivitiesPerFamily(logs: ActivityLogRow[], totalFamilies: number): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];
  const weekLogs = logs.filter(l => l.date >= dateStr);
  if (totalFamilies === 0) return 0;
  return Math.round((weekLogs.length / totalFamilies) * 10) / 10;
}

// ─── Growth Data ─────────────────────────────────────────

export function calcWeeklySignups(families: FamilyRow[], weeks: number = 12): { week: string; count: number }[] {
  const result: { week: string; count: number }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1 - (i * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = families.filter(f => {
      const d = new Date(f.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;

    const label = weekStart.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
    result.push({ week: label, count });
  }
  return result;
}

export function calcCumulativeFamilies(families: FamilyRow[], months: number = 12): { month: string; total: number }[] {
  const result: { month: string; total: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const total = families.filter(f => new Date(f.created_at) <= endOfMonth).length;
    const label = d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' });
    result.push({ month: label, total });
  }
  return result;
}

export function calcTierDistribution(families: FamilyRow[]): Record<string, number> {
  const dist: Record<string, number> = { free: 0, family: 0, educator: 0 };
  for (const f of families) {
    const tier = f.subscription_tier || 'free';
    dist[tier] = (dist[tier] || 0) + 1;
  }
  return dist;
}

export function calcStatusDistribution(families: FamilyRow[]): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const f of families) {
    const status = f.subscription_status || 'active';
    dist[status] = (dist[status] || 0) + 1;
  }
  return dist;
}

// ─── Engagement Data ─────────────────────────────────────

export function calcDailyLogs(logs: ActivityLogRow[], days: number = 30): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = logs.filter(l => l.date === dateStr).length;
    const label = d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
    result.push({ date: label, count });
  }
  return result;
}

export function calcTopActivities(
  logs: ActivityLogRow[],
  activities: ActivityRow[],
  limit: number = 10
): { title: string; category: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const l of logs) {
    counts[l.activity_id] = (counts[l.activity_id] || 0) + 1;
  }

  const activityMap = new Map(activities.map(a => [a.id, a]));

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => {
      const activity = activityMap.get(id);
      return {
        title: activity?.title || 'Unknown',
        category: activity?.category || 'unknown',
        count,
      };
    });
}

export function calcCategoryBreakdown(
  logs: ActivityLogRow[],
  activities: ActivityRow[]
): Record<string, number> {
  const activityMap = new Map(activities.map(a => [a.id, a.category]));
  const counts: Record<string, number> = {};
  for (const l of logs) {
    const cat = activityMap.get(l.activity_id) || 'unknown';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

// ─── Retention Cohorts ───────────────────────────────────

export interface CohortRow {
  cohort: string; // "Jan 2026"
  size: number;
  retention: number[]; // [100, 85, 72, ...] percentages for month 0, 1, 2...
}

export function calcRetentionCohorts(
  families: FamilyRow[],
  logs: ActivityLogRow[],
  months: number = 6
): CohortRow[] {
  const now = new Date();
  const result: CohortRow[] = [];

  // Build a set of active family IDs per month
  const familyActiveMonths: Record<string, Set<string>> = {};
  for (const log of logs) {
    const monthKey = log.date.substring(0, 7); // "2026-03"
    if (!familyActiveMonths[monthKey]) familyActiveMonths[monthKey] = new Set();
    familyActiveMonths[monthKey].add(log.family_id);
  }

  for (let i = months - 1; i >= 0; i--) {
    const cohortDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortEnd = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + 1, 0, 23, 59, 59);
    const cohortKey = `${cohortDate.getFullYear()}-${String(cohortDate.getMonth() + 1).padStart(2, '0')}`;

    // Families that signed up in this month
    const cohortFamilies = families.filter(f => {
      const created = new Date(f.created_at);
      return created >= cohortDate && created <= cohortEnd;
    });

    if (cohortFamilies.length === 0) {
      const label = cohortDate.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
      result.push({ cohort: label, size: 0, retention: [] });
      continue;
    }

    const cohortIds = new Set(cohortFamilies.map(f => f.id));
    const retention: number[] = [];

    // For each subsequent month, calculate what % of the cohort was active
    const maxMonths = Math.min(i + 1, 6); // Up to 6 months forward or until now
    for (let m = 0; m < maxMonths; m++) {
      const checkDate = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + m, 1);
      const checkKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;

      const activeInMonth = familyActiveMonths[checkKey] || new Set();
      const retained = [...cohortIds].filter(id => activeInMonth.has(id)).length;
      const pct = Math.round((retained / cohortFamilies.length) * 100);
      retention.push(pct);
    }

    const label = cohortDate.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
    result.push({ cohort: label, size: cohortFamilies.length, retention });
  }

  return result;
}

// ─── Recent Events ───────────────────────────────────────

export interface RecentEvent {
  type: 'signup' | 'upgrade' | 'cancel' | 'activity';
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export function buildRecentEvents(
  families: FamilyRow[],
  logs: ActivityLogRow[],
  activities: ActivityRow[],
  limit: number = 20
): RecentEvent[] {
  const events: RecentEvent[] = [];
  const activityMap = new Map(activities.map(a => [a.id, a.title]));

  // Recent signups
  for (const f of families.slice(0, 10)) {
    events.push({
      type: 'signup',
      description: `New family signed up (${f.subscription_tier})`,
      timestamp: f.created_at,
    });
  }

  // Recent activity logs
  for (const l of logs.slice(0, 10)) {
    events.push({
      type: 'activity',
      description: `Activity logged: ${activityMap.get(l.activity_id) || 'Unknown'}`,
      timestamp: l.date + 'T12:00:00Z',
    });
  }

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events.slice(0, limit);
}
