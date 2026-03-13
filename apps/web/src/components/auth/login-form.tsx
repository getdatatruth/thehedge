'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="bg-linen border border-stone rounded-[14px] p-8 text-center space-y-4 animate-scale-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-forest to-moss">
          <Mail className="h-7 w-7 text-parchment" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Check your email
        </h2>
        <p className="text-clay font-serif">
          We&apos;ve sent a magic link to <strong className="text-umber">{email}</strong>. Click the
          link to sign in.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-sm text-moss hover:text-forest transition-colors"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="bg-linen border border-stone rounded-[14px] p-8 animate-scale-in">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          Welcome back
        </h2>
        <p className="text-clay font-serif mt-1">
          Sign in to your family account
        </p>
      </div>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-parchment rounded-[14px] p-1 h-10">
          <TabsTrigger value="password" className="rounded text-xs font-semibold">Password</TabsTrigger>
          <TabsTrigger value="magic-link" className="rounded text-xs font-semibold">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-md border-stone bg-parchment/30"
              />
            </div>
            {error && (
              <p className="text-sm text-rust bg-rust/5 rounded px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="btn-primary w-full justify-center h-11"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </TabsContent>

        <TabsContent value="magic-link">
          <form onSubmit={handleMagicLink} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email" className="text-umber text-xs font-semibold">Email</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-md border-stone bg-parchment/30"
              />
            </div>
            <p className="text-xs text-clay/70 font-serif">
              We&apos;ll send you a link to sign in — no password needed.
            </p>
            {error && (
              <p className="text-sm text-rust bg-rust/5 rounded px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="btn-primary w-full justify-center h-11"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send magic link'}
              {!loading && <Mail className="h-4 w-4" />}
            </button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center">
        <p className="text-sm text-clay/70">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-forest hover:text-moss transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
