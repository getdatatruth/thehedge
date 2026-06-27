'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Sparkles, Feather, ArrowRight, Leaf } from 'lucide-react';

interface WeeklyReview {
  firstName: string;
  activityCount: number; daysOfLearning: number; totalMinutes: number; areasTouched: number;
  lovelyAreas: string[];
  quietFloor: { areas: { category: string; label: string; hint: string }[]; message: string } | null;
  nextWeekPlanned: number;
}

export default function WeeklyReviewPage() {
  const [data, setData] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/me/weekly-review').then((r) => r.json()).then((j) => setData(j?.data || null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-clay">Loading your week...</div>;

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-moss">
        <CalendarDays className="h-4 w-4" /> Your week
      </div>
      <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
        The week with <em className="text-moss italic">{data?.firstName}&apos;s family</em>.
      </h1>
      <p className="mb-8 mt-2 text-[14px] leading-relaxed text-clay">
        A gentle look at how the week went, and the one ahead. No scores, just the shape of it.
      </p>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { n: data?.activityCount ?? 0, l: 'moments kept' },
          { n: data?.daysOfLearning ?? 0, l: 'days of learning' },
          { n: data?.areasTouched ?? 0, l: 'areas touched' },
        ].map((s, i) => (
          <div key={i} className="card-elevated p-4 text-center">
            <div className="font-display text-3xl text-moss">{s.n}</div>
            <div className="text-[11px] text-clay">{s.l}</div>
          </div>
        ))}
      </div>

      {(data?.lovelyAreas?.length ?? 0) > 0 && (
        <div className="card-elevated mb-4 p-6">
          <div className="mb-1.5 flex items-center gap-1.5"><Leaf className="h-4 w-4 text-moss" /><p className="text-[13px] font-bold text-ink">What was lovely</p></div>
          <p className="text-[14px] leading-relaxed text-clay">You had a good run on {data!.lovelyAreas.join(', ')}. That is a rounded, curious week.</p>
        </div>
      )}

      {data?.quietFloor && (
        <div className="card-elevated mb-4 p-6">
          <div className="mb-1.5 flex items-center gap-1.5"><Feather className="h-4 w-4 text-moss" /><p className="text-[13px] font-bold text-ink">A gentle nudge for next week</p></div>
          <p className="text-[14px] leading-relaxed text-clay">{data.quietFloor.message}</p>
        </div>
      )}

      <div className="card-elevated mb-6 p-6">
        <div className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-forest" /><p className="text-[13px] font-bold text-ink">The week ahead</p></div>
        <p className="mb-3 text-[14px] leading-relaxed text-clay">
          {(data?.nextWeekPlanned ?? 0) > 0
            ? `You have ${data!.nextWeekPlanned} things gently sketched in for next week.`
            : 'Nothing locked in for next week yet, which is a lovely blank page.'}
        </p>
        <Link href="/planner" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-forest hover:text-forest/80">
          Look at next week <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90">
        <Sparkles className="h-4 w-4" /> Into the week
      </Link>
    </div>
  );
}
