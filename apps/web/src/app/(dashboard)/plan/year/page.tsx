import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { PlanTabs } from '@/components/dashboard/plan-tabs';

export const metadata = { title: 'Your Year - The Hedge' };

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default async function PlanYearPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('family_id').eq('id', user.id).single();
  const familyId = profile?.family_id;

  const now = new Date();
  // Irish academic year runs Sept -> Aug.
  const ayStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const ayStart = new Date(ayStartYear, 8, 1); // 1 Sept

  // Per-month buckets across the 12-month academic year.
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(ayStartYear, 8 + i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, name: MONTH_NAMES[d.getMonth()], date: d, count: 0, areas: new Set<string>() };
  });
  const byKey = new Map(months.map((m) => [m.key, m]));

  if (familyId) {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('date, activity:activity_id(category)')
      .eq('family_id', familyId)
      .gte('date', ayStart.toISOString().split('T')[0])
      .limit(2000);
    for (const l of logs || []) {
      const key = (l.date as string).slice(0, 7);
      const m = byKey.get(key);
      if (!m) continue;
      m.count++;
      const cat = Array.isArray(l.activity) ? l.activity[0]?.category : (l.activity as { category?: string } | null)?.category;
      if (cat) m.areas.add(cat);
    }
  }

  const total = months.reduce((s, m) => s + m.count, 0);
  const activeMonths = months.filter((m) => m.count > 0).length;
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-16">
      <PlanTabs active="year" />

      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">Your year, growing</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2 tracking-tight">
          {ayStartYear}–{ayStartYear + 1}
        </h1>
        <p className="text-[14px] text-clay mt-2">
          {total === 0
            ? 'This fills in as you live and log. Nothing to chase, it just grows.'
            : `${total} ${total === 1 ? 'moment' : 'moments'} kept across ${activeMonths} ${activeMonths === 1 ? 'month' : 'months'}. A year taking shape, your way.`}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((m) => {
          const future = m.date > now && m.key !== thisMonthKey;
          const isThis = m.key === thisMonthKey;
          const leaves = Math.min(m.count, 8);
          return (
            <div
              key={m.key}
              className={`rounded-2xl border p-4 shadow-sm ${
                isThis ? 'bg-white border-moss/40' : future ? 'bg-white/50 border-stone/30' : 'bg-white border-stone/40'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <p className={`text-[14px] font-semibold ${future ? 'text-clay/50' : 'text-ink'}`}>{m.name}</p>
                {isThis && <span className="text-[10px] font-bold uppercase tracking-wider text-moss">now</span>}
              </div>
              {future ? (
                <p className="text-[12px] text-clay/40 mt-3 italic">still to come</p>
              ) : m.count > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1 mt-3 mb-2">
                    {Array.from({ length: leaves }).map((_, i) => (
                      <Leaf key={i} className="h-3.5 w-3.5 text-moss" fill="currentColor" />
                    ))}
                    {m.count > 8 && <span className="text-[11px] text-moss font-medium ml-0.5">+{m.count - 8}</span>}
                  </div>
                  <p className="text-[12px] text-clay">
                    {m.count} {m.count === 1 ? 'moment' : 'moments'} · {m.areas.size} {m.areas.size === 1 ? 'area' : 'areas'}
                  </p>
                </>
              ) : (
                <p className="text-[12px] text-clay/40 mt-3 italic">a quiet month</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
