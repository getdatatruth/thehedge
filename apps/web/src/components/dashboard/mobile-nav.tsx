'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sun, CalendarDays, FolderOpen, Users, MessageCircle } from 'lucide-react';
import type { SubscriptionTier } from '@/types/database';

// Mirrors the desktop rail: the four verbs in the same order and routes,
// with Ask The Hedge surfaced as a fifth item. No tier locks here, depth is
// revealed inside an area, never as a greyed-out daily reminder.
const tabs: { href: string; icon: React.ElementType; label: string }[] = [
  { href: '/dashboard', icon: Sun, label: 'Today' },
  { href: '/planner', icon: CalendarDays, label: 'Plan' },
  { href: '/keep', icon: FolderOpen, label: 'Keep' },
  { href: '/community', icon: Users, label: 'Belong' },
  { href: '/chat', icon: MessageCircle, label: 'Ask' },
];

export function MobileBottomNav({ subscriptionTier = 'free' }: { subscriptionTier?: SubscriptionTier }) {
  void subscriptionTier;
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden" aria-label="Primary">
      <div className="h-4 bg-gradient-to-t from-parchment to-transparent pointer-events-none" />
      <div className="bg-parchment/96 backdrop-blur-xl border-t border-stone px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {tabs.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
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
