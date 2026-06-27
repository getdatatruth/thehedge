'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Moon, Sparkles, BookHeart, ArrowRight, Check, Sprout } from 'lucide-react';

interface Block { title: string; subject?: string; time?: string; duration?: number; completed?: boolean }
interface BriefChild {
  id: string; name: string; age: number | null;
  todayPlan: Block[]; tomorrowPlan: Block[];
  doneToday: { title: string; category: string | null }[];
  idea: { slug: string; title: string; category: string; duration_minutes: number } | null;
}
interface BriefData { mode: 'morning' | 'evening'; greeting: string; firstName: string; children: BriefChild[] }

export default function BriefPage() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get('mode') === 'evening' ? 'evening' : 'morning';
  const [data, setData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/me/brief?mode=${mode}`)
      .then((r) => r.json())
      .then((j) => { if (active) setData(j?.data || null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode]);

  if (loading) return <div className="py-20 text-center text-clay">Loading your brief...</div>;

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-moss">
        {mode === 'evening' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {mode === 'evening' ? 'This evening' : 'Today'}
      </div>
      <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
        {data?.greeting}, <em className="text-moss italic">{data?.firstName}</em>.
      </h1>
      <p className="mb-8 mt-2 text-[14px] leading-relaxed text-clay">
        {mode === 'evening'
          ? 'A gentle look back at the day, and a peek at tomorrow.'
          : "Here's the shape of the day with your crew. Nothing you have to do, just a calm place to start."}
      </p>

      <div className="space-y-4">
        {(data?.children || []).map((child) => (
          <div key={child.id} className="card-elevated p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              {child.name}{child.age != null ? `, ${child.age}` : ''}
            </h2>

            {mode === 'morning' ? (
              child.todayPlan.length > 0 ? (
                <>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-clay/60">On the plan today</p>
                  <ul className="space-y-1.5">
                    {child.todayPlan.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-[14px] text-ink">
                        <span className="h-2 w-2 rounded-full bg-moss" />
                        {b.time ? <span className="text-clay">{b.time}</span> : null} {b.title}
                        {b.duration ? <span className="ml-auto text-[12px] text-clay/60">{b.duration}m</span> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : child.idea ? (
                <>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-clay/60">An idea for today</p>
                  <Link href={`/activity/${child.idea.slug}`} className="flex items-center gap-3 rounded-2xl bg-parchment p-3 transition-colors hover:bg-moss/5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss/10"><Sprout className="h-5 w-5 text-moss" /></span>
                    <span className="flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{child.idea.title}</span>
                      <span className="block text-[12.5px] text-clay">{child.idea.category} · {child.idea.duration_minutes} min</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-clay/50" />
                  </Link>
                </>
              ) : (
                <p className="text-[14px] italic text-clay">A blank page today. Follow whatever they are curious about.</p>
              )
            ) : (
              <>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-clay/60">What {child.name} did today</p>
                {child.doneToday.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {child.doneToday.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-xl bg-moss/10 px-3 py-1.5 text-[12.5px] font-medium text-moss">
                        <Check className="h-3.5 w-3.5" /> {d.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] italic text-clay">Nothing logged today, and that is no bother at all. Tomorrow is a fresh page.</p>
                )}
                {child.tomorrowPlan.length > 0 && (
                  <>
                    <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-clay/60">A peek at tomorrow</p>
                    <ul className="space-y-1.5">
                      {child.tomorrowPlan.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-[14px] text-ink"><span className="h-2 w-2 rounded-full bg-moss" /> {b.title}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90">
          <Sparkles className="h-4 w-4" /> Into the day
        </button>
        <Link href="/keep" className="inline-flex items-center gap-2 rounded-2xl border border-moss bg-white px-5 py-3 text-sm font-semibold text-moss transition-colors hover:bg-moss/5">
          <BookHeart className="h-4 w-4" /> Log a moment
        </Link>
      </div>
    </div>
  );
}
