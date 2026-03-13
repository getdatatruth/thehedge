import { createClient } from '@/lib/supabase/server';
import { TuslaClient } from './tusla-client';

export const metadata = {
  title: 'Tusla Registration & Compliance — The Hedge',
};

export default async function TuslaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <TuslaClient children={[]} plans={[]} dailyPlans={[]} activityLogs={[]} registrations={[]} />;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    return <TuslaClient children={[]} plans={[]} dailyPlans={[]} activityLogs={[]} registrations={[]} />;
  }

  const familyId = profile.family_id;

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth')
    .eq('family_id', familyId)
    .order('date_of_birth', { ascending: true });

  const childIds = (children || []).map((c) => c.id);

  // Fetch education plans
  const { data: plans } = await supabase
    .from('education_plans')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  // Fetch daily plans for the academic year (Sep 1 to now)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const academicYearStart = month >= 8 ? `${year}-09-01` : `${year - 1}-09-01`;
  const today = now.toISOString().split('T')[0];

  const { data: dailyPlans } = childIds.length > 0
    ? await supabase
        .from('daily_plans')
        .select('id, child_id, date, attendance_logged, status')
        .in('child_id', childIds)
        .gte('date', academicYearStart)
        .lte('date', today)
        .order('date', { ascending: true })
    : { data: [] };

  // Fetch activity logs for the academic year
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, curriculum_areas_covered, child_ids')
    .eq('family_id', familyId)
    .gte('date', academicYearStart)
    .lte('date', today);

  // Fetch Tusla registrations (table may not exist yet)
  let registrations: Record<string, unknown>[] = [];
  try {
    const { data: regData } = await supabase
      .from('tusla_registrations')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (regData) {
      registrations = regData;
    }
  } catch {
    // Table may not exist yet - that's fine
  }

  return (
    <TuslaClient
      children={children || []}
      plans={plans || []}
      dailyPlans={dailyPlans || []}
      activityLogs={activityLogs || []}
      registrations={registrations as any}
    />
  );
}
