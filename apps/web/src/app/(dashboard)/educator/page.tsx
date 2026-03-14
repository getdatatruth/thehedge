import { createClient } from '@/lib/supabase/server';
import { EducatorDashboardClient } from './educator-dashboard-client';

export const metadata = {
  title: 'Educator - The Hedge',
};

function getWeekBounds(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return {
    start: monday.toISOString().split('T')[0],
    end: friday.toISOString().split('T')[0],
  };
}

export default async function EducatorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <EducatorDashboardClient children={[]} plans={[]} dailyPlans={[]} activityLogs={[]} portfolioEntries={[]} />;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    return <EducatorDashboardClient children={[]} plans={[]} dailyPlans={[]} activityLogs={[]} portfolioEntries={[]} />;
  }

  const familyId = profile.family_id;
  const { start, end } = getWeekBounds();

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth, school_status')
    .eq('family_id', familyId)
    .order('date_of_birth', { ascending: true });

  const childIds = (children || []).map((c) => c.id);

  // Fetch education plans
  const { data: plans } = await supabase
    .from('education_plans')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  // Fetch recent daily plans (this week)
  const { data: dailyPlans } = childIds.length > 0
    ? await supabase
        .from('daily_plans')
        .select('*')
        .in('child_id', childIds)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })
    : { data: [] };

  // Fetch activity logs for this week (with activity titles)
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, curriculum_areas_covered, child_ids, notes, activities(title, category)')
    .eq('family_id', familyId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  // Fetch portfolio entries for all children
  const { data: portfolioEntries } = childIds.length > 0
    ? await supabase
        .from('portfolio_entries')
        .select('id, child_id, title, date, curriculum_areas')
        .in('child_id', childIds)
        .order('date', { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <EducatorDashboardClient
      children={children || []}
      plans={plans || []}
      dailyPlans={dailyPlans || []}
      activityLogs={activityLogs || []}
      portfolioEntries={portfolioEntries || []}
    />
  );
}
