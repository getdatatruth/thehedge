import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KitchenTableClient } from './kitchen-table-client';

export const metadata = {
  title: 'The Kitchen Table - The Hedge',
};

export default async function KitchenTablePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="pt-6">
      <KitchenTableClient />
    </div>
  );
}
