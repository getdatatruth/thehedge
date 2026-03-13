import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PortfolioRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) redirect('/dashboard');

  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', profile.family_id)
    .order('date_of_birth', { ascending: true })
    .limit(1);

  if (children && children.length > 0) {
    redirect(`/educator/portfolio/${children[0].id}`);
  }

  redirect('/educator');
}
