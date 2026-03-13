import { EducatorClient } from './educator-client';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function getEducatorData() {
  const supabase = createAdminClient();

  // Get all education plans with family and child info
  const { data: plans } = await supabase
    .from('education_plans')
    .select('*')
    .order('created_at', { ascending: false });

  // Enrich with family and child names
  const familyIds = [...new Set((plans || []).map((p: { family_id: string }) => p.family_id))];
  const childIds = [...new Set((plans || []).map((p: { child_id: string }) => p.child_id))];

  const [{ data: families }, { data: children }] = await Promise.all([
    familyIds.length > 0
      ? supabase.from('families').select('id, name, county').in('id', familyIds)
      : { data: [] },
    childIds.length > 0
      ? supabase.from('children').select('id, name, date_of_birth').in('id', childIds)
      : { data: [] },
  ]);

  const familyMap = (families || []).reduce((acc: Record<string, { name: string; county: string | null }>, f: { id: string; name: string; county: string | null }) => {
    acc[f.id] = { name: f.name, county: f.county };
    return acc;
  }, {});

  const childMap = (children || []).reduce((acc: Record<string, { name: string; dob: string }>, c: { id: string; name: string; date_of_birth: string }) => {
    acc[c.id] = { name: c.name, dob: c.date_of_birth };
    return acc;
  }, {});

  const enrichedPlans = (plans || []).map((p: Record<string, unknown>) => ({
    ...p,
    family_name: (familyMap[p.family_id as string] || {}).name || 'Unknown',
    family_county: (familyMap[p.family_id as string] || {}).county || null,
    child_name: (childMap[p.child_id as string] || {}).name || 'Unknown',
    child_dob: (childMap[p.child_id as string] || {}).dob || null,
  })) as Array<Record<string, unknown>>;

  // Tusla status summary
  const tuslaStats: Record<string, number> = {
    not_applied: 0,
    applied: 0,
    awaiting: 0,
    registered: 0,
    review_due: 0,
  };
  (plans || []).forEach((p: { tusla_status: string }) => {
    tuslaStats[p.tusla_status] = (tuslaStats[p.tusla_status] || 0) + 1;
  });

  return {
    plans: enrichedPlans,
    tuslaStats,
    totalPlans: (plans || []).length,
  };
}

export default async function AdminEducatorPage() {
  const data = await getEducatorData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EducatorClient initialData={data as any} />;
}
