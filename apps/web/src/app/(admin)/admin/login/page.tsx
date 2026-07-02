'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Middleware enforces admin-only access to /admin; a non-admin who signs in
    // here is bounced to the member app. Send admins to their panel.
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1F12] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4CAF7C]/15 ring-1 ring-[#4CAF7C]/30">
            <ShieldCheck className="h-7 w-7 text-[#4CAF7C]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">The Hedge Admin</h1>
          <p className="text-white/40 text-sm mt-1">Staff access only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="admin@thehedge.ie"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 focus:border-[#4CAF7C]/50 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#4CAF7C]/50 focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4CAF7C] text-sm font-semibold text-[#0D1F12] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-[11px] text-white/25 mt-6">
          This is the staff admin console, separate from member accounts.
        </p>
      </div>
    </div>
  );
}
