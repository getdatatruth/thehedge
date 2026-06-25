import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KitchenTableClient } from '@/app/(dashboard)/kitchen-table/kitchen-table-client';

export const metadata = {
  title: 'Pull up a chair - The Hedge',
};

// The Kitchen Table as the first-run onboarding. A brand-new family lands here
// instead of a form; finishing their Framework completes onboarding.
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="pt-4">
      <KitchenTableClient />
    </div>
  );
}
