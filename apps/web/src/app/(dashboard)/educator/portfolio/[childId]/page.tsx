import { createClient } from '@/lib/supabase/server';
import { PortfolioClient } from './portfolio-client';

export const metadata = {
  title: 'Portfolio - The Hedge',
};

export default async function PortfolioPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <PortfolioClient child={null} entries={[]} activityLogs={[]} allChildren={[]} outcomes={[]} />;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    return <PortfolioClient child={null} entries={[]} activityLogs={[]} allChildren={[]} outcomes={[]} />;
  }

  // Fetch the child (verify belongs to family)
  const { data: child } = await supabase
    .from('children')
    .select('id, name, date_of_birth')
    .eq('id', childId)
    .eq('family_id', profile.family_id)
    .single();

  if (!child) {
    return <PortfolioClient child={null} entries={[]} activityLogs={[]} allChildren={[]} outcomes={[]} />;
  }

  // Fetch all children for tab navigation
  const { data: allChildren } = await supabase
    .from('children')
    .select('id, name')
    .eq('family_id', profile.family_id)
    .order('date_of_birth', { ascending: true });

  // Fetch portfolio entries for this child
  const { data: entries } = await supabase
    .from('portfolio_entries')
    .select('*, activity_logs(id, date, duration_minutes, notes, activities(title, category))')
    .eq('child_id', childId)
    .order('date', { ascending: false });

  // Fetch recent activity logs for add-entry form (last 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const fromDate = sixtyDaysAgo.toISOString().split('T')[0];

  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, notes, activities(title, category)')
    .eq('family_id', profile.family_id)
    .gte('date', fromDate)
    .order('date', { ascending: false });

  // Fetch curriculum outcomes for linking
  const { data: outcomes } = await supabase
    .from('curriculum_outcomes')
    .select('id, curriculum_area, stage, strand, outcome_code, outcome_text')
    .eq('country', 'IE')
    .order('curriculum_area', { ascending: true });

  return (
    <PortfolioClient
      child={child}
      entries={entries || []}
      activityLogs={activityLogs || []}
      allChildren={allChildren || []}
      outcomes={outcomes || []}
    />
  );
}
