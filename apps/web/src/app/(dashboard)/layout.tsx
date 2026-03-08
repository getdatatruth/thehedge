import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEducator = false;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('families(subscription_tier)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { subscription_tier: string } | null | undefined;
    isEducator = family?.subscription_tier === 'educator';
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar isEducator={isEducator} />
      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
