import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Star, Calendar, Clock } from 'lucide-react';
import { TimelineClient } from './timeline-client';

export const metadata = {
  title: 'Timeline - The Hedge',
};

export default async function TimelinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  const familyId = profile?.family_id;
  if (!familyId) {
    redirect('/login');
  }

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*, activities(title, category, slug)')
    .eq('family_id', familyId)
    .order('date', { ascending: false })
    .limit(50);

  // Fetch children for this family to display names on log entries
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('family_id', familyId);

  const childMap = new Map<string, string>();
  (children || []).forEach((c: { id: string; name: string }) => {
    childMap.set(c.id, c.name);
  });

  const grouped = (logs || []).reduce(
    (acc, log) => {
      const date = log.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, typeof logs>
  );

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-IE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-3">Your Journey</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
            Family <em className="text-moss italic">Timeline</em>
          </h1>
          <p className="text-clay mt-2 font-serif text-lg leading-relaxed">
            Your family&apos;s activities and memories.
          </p>
        </div>
        <TimelineClient />
      </div>

      {dates.length === 0 ? (
        <div className="flex min-h-[350px] items-center justify-center rounded-[14px] border border-dashed border-stone bg-linen/50">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] bg-linen">
              <Clock className="h-7 w-7 text-clay/30" />
            </div>
            <p className="text-lg font-semibold text-clay/40">
              No activities logged yet
            </p>
            <p className="mt-1 text-sm text-clay/30">
              Complete an activity from Today to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/5">
                  <Calendar className="h-4 w-4 text-moss" />
                </div>
                <h2 className="font-display text-base font-light text-ink">
                  {formatDate(date)}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-stone to-transparent" />
              </div>

              <div className="space-y-3 ml-4 border-l-2 border-stone pl-6 stagger-children">
                {grouped[date]!.map((log: {
                  id: string;
                  notes: string | null;
                  rating: number | null;
                  photos: string[];
                  duration_minutes: number | null;
                  child_ids: string[];
                  activities: { title: string; category: string; slug: string } | null;
                }) => (
                  <div key={log.id} className="card-elevated p-6 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[33px] top-6 h-3 w-3 rounded-full border-2 border-moss bg-parchment" />

                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-display font-light text-ink">
                          {log.activities?.slug ? (
                            <Link
                              href={`/activity/${log.activities.slug}`}
                              className="hover:text-moss transition-colors"
                            >
                              {log.activities.title}
                            </Link>
                          ) : (
                            'Activity'
                          )}
                        </h3>
                        {log.notes && (
                          <p className="text-sm text-clay font-serif leading-relaxed">
                            {log.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {log.activities?.category && (
                            <span className="tag tag-sage">
                              {log.activities.category}
                            </span>
                          )}
                          {log.duration_minutes && (
                            <span className="text-[11px] text-clay/40">
                              {log.duration_minutes} min
                            </span>
                          )}
                        </div>
                        {log.child_ids && log.child_ids.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            {log.child_ids.map((childId: string) => {
                              const name = childMap.get(childId);
                              if (!name) return null;
                              return (
                                <span
                                  key={childId}
                                  className="inline-flex items-center rounded-[3px] bg-moss/8 border border-moss/15 px-2 py-0.5 text-[11px] font-medium text-moss"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {log.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < log.rating!
                                  ? 'fill-amber text-amber'
                                  : 'text-linen'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {log.photos && log.photos.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {log.photos.map((url: string, i: number) => (
                          <div
                            key={i}
                            className="relative h-20 w-20 overflow-hidden rounded-[14px] bg-linen shadow-sm"
                          >
                            <img
                              src={url}
                              alt="Activity photo"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
