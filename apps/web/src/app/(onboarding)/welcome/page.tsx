import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WelcomeFlow } from '@/components/onboarding/welcome-flow';

export const metadata = {
  title: 'Welcome - The Hedge',
};

// The first moment after signing up: a calm welcome that sets the scene, then
// leads into the Kitchen Table (rendered inline once they pull up a chair).
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name =
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    null;

  return (
    <div className="pt-4">
      <WelcomeFlow name={name} />
    </div>
  );
}
