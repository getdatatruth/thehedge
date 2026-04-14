import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userRow?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch families and activity logs in parallel
    const [familiesRes, logsRes] = await Promise.all([
      supabase
        .from('families')
        .select('id, created_at, onboarding_completed, subscription_tier, subscription_status'),
      supabase
        .from('activity_logs')
        .select('family_id, date')
        .order('date', { ascending: true }),
    ]);

    const families = familiesRes.data || [];
    const logs = logsRes.data || [];

    // Build a map of family_id -> list of log dates
    const logsByFamily = new Map<string, string[]>();
    for (const log of logs) {
      const existing = logsByFamily.get(log.family_id);
      if (existing) {
        existing.push(log.date);
      } else {
        logsByFamily.set(log.family_id, [log.date]);
      }
    }

    // Stage 1: Total Signups
    const totalSignups = families.length;

    // Stage 2: Onboarding Complete
    const onboardingComplete = families.filter(
      (f) => f.onboarding_completed === true
    ).length;

    // Stage 3: First Activity (families with at least 1 activity log)
    const firstActivity = families.filter(
      (f) => logsByFamily.has(f.id)
    ).length;

    // Stage 4: Week 1 Active (families that logged activities within 7 days of signup)
    const week1Active = families.filter((f) => {
      const familyLogs = logsByFamily.get(f.id);
      if (!familyLogs || !f.created_at) return false;
      const createdAt = new Date(f.created_at);
      const sevenDaysLater = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      return familyLogs.some((logDate) => {
        const d = new Date(logDate);
        return d >= createdAt && d <= sevenDaysLater;
      });
    }).length;

    // Stage 5: Paid Conversion (subscription_tier != 'free')
    const paidConversion = families.filter(
      (f) => f.subscription_tier && f.subscription_tier !== 'free'
    ).length;

    const stages = [
      { name: 'Total Signups', count: totalSignups },
      { name: 'Onboarding Complete', count: onboardingComplete },
      { name: 'First Activity', count: firstActivity },
      { name: 'Week 1 Active', count: week1Active },
      { name: 'Paid Conversion', count: paidConversion },
    ];

    return NextResponse.json({ stages });
  } catch (error) {
    console.error('GET /api/admin/funnel error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}
