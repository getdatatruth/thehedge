import { createClient } from '@/lib/supabase/server';
import { PlansClient } from './plans-client';

export const metadata = {
  title: 'Education Plans — The Hedge',
};

export default async function PlansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <PlansClient plans={[]} children={[]} activityLogs={[]} />;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    return <PlansClient plans={[]} children={[]} activityLogs={[]} />;
  }

  const familyId = profile.family_id;

  // Fetch education plans joined with children
  const { data: plans } = await supabase
    .from('education_plans')
    .select('*, children(id, name, date_of_birth)')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  // Fetch all children for the create form
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth')
    .eq('family_id', familyId)
    .order('date_of_birth', { ascending: true });

  // Fetch activity logs for coverage stats (academic year)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const academicYearStart = month >= 8 ? `${year}-09-01` : `${year - 1}-09-01`;
  const today = now.toISOString().split('T')[0];

  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, curriculum_areas_covered, child_ids')
    .eq('family_id', familyId)
    .gte('date', academicYearStart)
    .lte('date', today);

  return (
    <PlansClient
      plans={plans || []}
      children={children || []}
      activityLogs={activityLogs || []}
    />
  );
}
