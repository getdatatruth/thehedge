import Link from 'next/link';
import { Sun, CalendarDays, Sprout } from 'lucide-react';

// The three zoom levels of the planning spine.
const TABS = [
  { id: 'day', label: 'Day', href: '/dashboard', icon: Sun },
  { id: 'week', label: 'Week', href: '/planner', icon: CalendarDays },
  { id: 'year', label: 'Year', href: '/plan/year', icon: Sprout },
] as const;

export function PlanTabs({ active }: { active: 'day' | 'week' | 'year' }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-white border border-stone/40 shadow-sm p-1 mb-6">
      {TABS.map((t) => {
        const on = t.id === active;
        const Icon = t.icon;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all ${
              on ? 'bg-forest text-parchment' : 'text-clay hover:bg-stone/10'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
