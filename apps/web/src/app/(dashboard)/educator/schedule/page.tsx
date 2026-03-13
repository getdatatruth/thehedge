import { createClient } from '@/lib/supabase/server';
import { ScheduleClient } from './schedule-client';

export const metadata = {
  title: 'Schedule — The Hedge',
};

function getWeekDates(weekOffset = 0): { start: string; end: string; dates: string[] } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  return { start: dates[0], end: dates[4], dates };
}

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ScheduleClient children={[]} dailyPlans={[]} weekDates={[]} educationPlans={[]} />;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    return <ScheduleClient children={[]} dailyPlans={[]} weekDates={[]} educationPlans={[]} />;
  }

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth')
    .eq('family_id', profile.family_id)
    .order('date_of_birth', { ascending: true });

  const childIds = (children || []).map((c) => c.id);
  const { dates } = getWeekDates(0);

  // Fetch daily plans for this week
  const { data: dailyPlans } = childIds.length > 0
    ? await supabase
        .from('daily_plans')
        .select('*')
        .in('child_id', childIds)
        .gte('date', dates[0])
        .lte('date', dates[4])
        .order('date', { ascending: true })
    : { data: [] };

  // Fetch education plans for curriculum area context
  const { data: educationPlans } = await supabase
    .from('education_plans')
    .select('id, child_id, curriculum_areas')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: false });

  return (
    <ScheduleClient
      children={children || []}
      dailyPlans={dailyPlans || []}
      weekDates={dates}
      educationPlans={educationPlans || []}
    />
  );
}
