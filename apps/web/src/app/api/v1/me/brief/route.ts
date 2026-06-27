import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { ageInYears } from '@/lib/personalisation';

export const maxDuration = 30;

export async function OPTIONS() {
  return apiOptions();
}

// GET /api/v1/me/brief?mode=morning|evening
// The data behind the Daily Brief page. Morning: today's plan + one idea per
// child. Evening: what each child did today + a peek at tomorrow.
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const mode = request.nextUrl.searchParams.get('mode') === 'evening' ? 'evening' : 'morning';

  const { data: profile } = await supabase.from('users').select('name, family_id').eq('id', user.id).single();
  if (!profile?.family_id) return apiError('No family found', 400);

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  const hour = now.getHours();
  const greeting = mode === 'evening' ? 'This evening' : hour < 12 ? 'Good morning' : 'Today';

  const { data: dbChildren } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests')
    .eq('family_id', profile.family_id);
  const children = dbChildren || [];
  const childIds = children.map((c) => c.id);

  // Today's + tomorrow's plan blocks per child.
  const { data: plans } = childIds.length
    ? await supabase.from('daily_plans').select('child_id, date, blocks').in('child_id', childIds).in('date', [today, tomorrow])
    : { data: [] as { child_id: string; date: string; blocks: unknown }[] };

  // What was logged today (evening recap).
  const { data: todayLogs } = await supabase
    .from('activity_logs')
    .select('child_ids, notes, activities(title, category)')
    .eq('family_id', profile.family_id)
    .eq('date', today);

  const blocksFor = (childId: string, date: string) => {
    const row = (plans || []).find((p) => p.child_id === childId && p.date === date);
    const b = (row?.blocks as { title?: string; subject?: string; time?: string; duration?: number; completed?: boolean }[] | undefined) || [];
    return b.map((x) => ({ title: x.title || x.subject || 'Activity', subject: x.subject, time: x.time, duration: x.duration, completed: !!x.completed }));
  };

  const out = await Promise.all(children.map(async (c) => {
    const age = ageInYears(c.date_of_birth as string, now);
    const todayPlan = blocksFor(c.id, today);
    const tomorrowPlan = blocksFor(c.id, tomorrow);
    const doneToday = (todayLogs || [])
      .filter((l) => Array.isArray(l.child_ids) && l.child_ids.includes(c.id))
      .map((l) => {
        const a = Array.isArray(l.activities) ? l.activities[0] : l.activities;
        return { title: a?.title || 'A learning moment', category: a?.category || null };
      });

    // One gentle idea, age-matched and interest-bridged, only when there is no
    // plan to lead with (so we never crowd the page).
    let idea: { slug: string; title: string; category: string; duration_minutes: number } | null = null;
    if (todayPlan.length === 0 && age != null) {
      const { data: pool } = await supabase.from('activities')
        .select('slug, title, category, duration_minutes')
        .eq('published', true).is('family_id', null)
        .lte('age_min', age).gte('age_max', age).limit(8);
      const interests = (c.interests as string[] | null) || [];
      const liked = (pool || []).find((a) => interests.includes(a.category)) || (pool || [])[0] || null;
      idea = liked;
    }

    return { id: c.id, name: c.name, age, todayPlan, tomorrowPlan, doneToday, idea };
  }));

  return apiSuccess({ mode, greeting, firstName: profile.name?.split(' ')[0] || 'there', date: today, children: out });
}
