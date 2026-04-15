'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';

interface NewActivity {
  title: string;
  category: string;
  slug: string;
  durationMinutes: number;
}

const CATEGORY_DOTS: Record<string, string> = {
  nature: 'bg-cat-nature',
  science: 'bg-cat-science',
  art: 'bg-cat-art',
  maths: 'bg-cat-maths',
  literacy: 'bg-cat-literacy',
  movement: 'bg-cat-movement',
  kitchen: 'bg-cat-kitchen',
  life_skills: 'bg-cat-life-skills',
  calm: 'bg-cat-calm',
  social: 'bg-cat-social',
};

const CATEGORY_LABELS: Record<string, string> = {
  nature: 'Nature',
  science: 'Science',
  art: 'Art',
  maths: 'Maths',
  literacy: 'Literacy',
  movement: 'Movement',
  kitchen: 'Kitchen',
  life_skills: 'Life Skills',
  calm: 'Calm',
  social: 'Social',
};

export function NewThisWeek() {
  const [activities, setActivities] = useState<NewActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewActivities() {
      try {
        const res = await fetch('/api/v1/milestones');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const data = json.data?.newThisWeek?.activities || [];
        setActivities(data);
      } catch {
        // Silently fail - section just won't show
      } finally {
        setLoading(false);
      }
    }

    fetchNewActivities();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3 w-3 text-terracotta" />
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-terracotta">
            New this week
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[200px] h-[100px] rounded-xl bg-white/60 animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3 w-3 text-terracotta" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-terracotta">
          New this week
        </span>
        <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-terracotta/15 text-[10px] font-bold text-terracotta">
          {activities.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {activities.map((activity) => (
          <Link
            key={activity.slug}
            href={`/activity/${activity.slug}`}
            className="group min-w-[200px] max-w-[220px] shrink-0"
          >
            <div className="h-full rounded-xl bg-white p-4 shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
              {/* Category dot + label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${CATEGORY_DOTS[activity.category] || 'bg-stone'}`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-clay truncate">
                  {CATEGORY_LABELS[activity.category] || activity.category}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-[13px] font-semibold text-ink leading-snug line-clamp-2 mb-2 group-hover:text-moss transition-colors">
                {activity.title}
              </h4>

              {/* Duration */}
              <div className="flex items-center gap-1 text-stone">
                <Clock className="h-3 w-3" />
                <span className="text-[11px]">{activity.durationMinutes}m</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
