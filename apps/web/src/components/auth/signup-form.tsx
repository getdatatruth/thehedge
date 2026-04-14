'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight } from 'lucide-react';

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  family: 'Family',
  educator: 'Educator',
};

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || undefined;
  const planName = selectedPlan ? PLAN_NAMES[selectedPlan] || selectedPlan : undefined;
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          ...(selectedPlan ? { plan: selectedPlan } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setConfirmationSent(true);
    setLoading(false);
  }

  if (confirmationSent) {
    return (
      <div className="bg-linen border border-stone rounded-2xl p-8 text-center space-y-4 animate-scale-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss">
          <Mail className="h-7 w-7 text-parchment" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Check your email
        </h2>
        <p className="text-clay">
          We&apos;ve sent a confirmation link to <strong className="text-umber">{email}</strong>.
          Click the link to activate your account, then you&apos;ll set up
          your family.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-moss hover:text-forest transition-colors"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-linen border border-stone rounded-2xl p-8 animate-scale-in">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          Join The Hedge
        </h2>
        <p className="text-clay mt-1">
          Where curious families learn. Create your account to get started.
        </p>
        {planName && (
          <p className="mt-2 text-sm font-semibold text-forest bg-forest/5 inline-block px-3 py-1 rounded-full">
            {planName} plan selected
          </p>
        )}
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-umber text-xs font-semibold">Your name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 rounded-md border-stone bg-parchment/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-umber text-xs font-semibold">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-md border-stone bg-parchment/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-umber text-xs font-semibold">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-11 rounded-md border-stone bg-parchment/30"
          />
        </div>
        {error && <p className="text-sm text-rust bg-rust/5 rounded px-3 py-2">{error}</p>}
        <button
          type="submit"
          className="btn-primary w-full justify-center h-11"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-clay/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-forest hover:text-moss transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
