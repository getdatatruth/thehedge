'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-clay hover:text-terracotta transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
