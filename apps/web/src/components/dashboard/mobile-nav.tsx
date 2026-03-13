'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sun, Search, CalendarDays, Trophy, Sparkles } from 'lucide-react';

const tabs = [
  { href: '/dashboard', icon: Sun, label: 'Today' },
  { href: '/browse', icon: Search, label: 'Browse' },
  { href: '/planner', icon: CalendarDays, label: 'Plan' },
  { href: '/chat', icon: Sparkles, label: 'Ask AI' },
  { href: '/progress', icon: Trophy, label: 'Progress' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
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
