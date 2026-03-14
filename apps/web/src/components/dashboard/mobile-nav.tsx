'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sun, Search, CalendarDays, Trophy, Sparkles, Lock } from 'lucide-react';
import type { SubscriptionTier } from '@/types/database';

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  family: 1,
  educator: 2,
};

const tabs: { href: string; icon: React.ElementType; label: string; requiredTier?: SubscriptionTier }[] = [
  { href: '/dashboard', icon: Sun, label: 'Today' },
  { href: '/browse', icon: Search, label: 'Browse' },
  { href: '/planner', icon: CalendarDays, label: 'Plan', requiredTier: 'family' },
  { href: '/chat', icon: Sparkles, label: 'Ask AI' },
  { href: '/progress', icon: Trophy, label: 'Progress' },
];

export function MobileBottomNav({ subscriptionTier = 'free' }: { subscriptionTier?: SubscriptionTier }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="h-4 bg-gradient-to-t from-parchment to-transparent pointer-events-none" />
      <div className="bg-parchment/96 backdrop-blur-xl border-t border-stone px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {tabs.map(({ href, icon: Icon, label, requiredTier }) => {
            const isLocked = requiredTier && TIER_RANK[subscriptionTier] < TIER_RANK[requiredTier];
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);

            if (isLocked) {
              return (
                <Link
                  key={href}
                  href="/settings/billing"
                  className="flex flex-col items-center gap-0.5 px-3 py-2.5 min-w-0 text-clay/25"
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    <Lock className="h-2.5 w-2.5 absolute -bottom-0.5 -right-1" />
                  </div>
                  <span className="text-[9px] font-bold tracking-wide">{label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2.5 min-w-0 transition-all ${
                  isActive
                    ? 'text-forest'
                    : 'text-clay/50 active:text-clay'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-forest' : ''}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="h-0.5 w-4 rounded-full bg-terracotta mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
