import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/notifications';
import { capture, AnalyticsEvent } from '@/lib/analytics';

// Pull the curriculum areas + outcome ids an activity carries, so a saved
// portfolio entry becomes honest Tusla/AEARS evidence (mirrors the v1 route).
function curriculumFromActivity(tags: unknown): { areas: string[]; outcomeIds: string[] } {
  const t = (tags || {}) as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') as string[] : []);
  const areas = [
    ...arr(t.aistear_themes).map((a) => (a.startsWith('Aistear') ? a : `Aistear: ${a}`)),
    ...arr(t.ncca_areas),
  ];
  return { areas: [...new Set(areas)], outcomeIds: arr(t.outcome_ids) };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json(
        { error: 'No family found for user' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { activity_id, child_ids, date, duration_minutes, notes, rating, diary_entry, save_to_portfolio } =
      body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const { data: log, error: insertError } = await supabase
      .from('activity_logs')
      .insert({
        family_id: profile.family_id,
        activity_id: activity_id || null,
        child_ids: child_ids || [],
        date,
        duration_minutes: duration_minutes || null,
        notes: notes || null,
        rating: rating || null,
        photos: [],
        curriculum_areas_covered: [],
      })
      .select('*, activities(title, category, slug, curriculum_tags)')
      .single();

    if (insertError) {
      console.error('Failed to insert activity log:', insertError);
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      );
    }

    // Save to the child's portfolio when asked, carrying the activity's
    // curriculum outcomes through as evidence. Best-effort; never fails the log.
    if (save_to_portfolio && Array.isArray(child_ids) && child_ids.length > 0) {
      try {
        const act = (log as { activities?: { title?: string; curriculum_tags?: unknown } }).activities;
        const { areas, outcomeIds } = curriculumFromActivity(act?.curriculum_tags);
        const { data: ownChildren } = await supabase
          .from('children')
          .select('id')
          .eq('family_id', profile.family_id)
          .in('id', child_ids);
        const validChildIds = (ownChildren || []).map((c) => c.id);
        if (validChildIds.length > 0) {
          const admin = createAdminClient();
          await admin.from('portfolio_entries').insert(
            validChildIds.map((childId) => ({
              child_id: childId,
              date,
              title: act?.title || 'A learning moment',
              description: (diary_entry || notes || '').trim() || null,
              curriculum_areas: areas,
              outcome_ids: outcomeIds,
              photos: [],
              activity_log_id: (log as { id: string }).id,
            }))
          );
        }
      } catch (e) {
        console.error('portfolio save threw:', e);
      }
    }

    // ── Analytics: activity logged (fire-and-forget) ──
    await capture(AnalyticsEvent.ACTIVITY_LOGGED, user.id, {
      family_id: profile.family_id,
      activity_id: activity_id || null,
      has_rating: rating != null,
    });

    // ── Notification triggers (fire-and-forget) ──
    try {
      // Count total logs for this family
      const { count: totalLogs } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', profile.family_id);

      // First activity ever - a gentle, one-off welcome (no streaks, no points)
      if (totalLogs === 1) {
        await createNotification(supabase, profile.family_id, {
          type: 'achievement',
          title: 'Welcome! You logged your first activity',
          body: 'This is the start of something wonderful. Keep exploring and learning together!',
          actionUrl: '/timeline',
        });
      }
    } catch (notifErr) {
      // Don't fail the main request if notification creation fails
      console.error('Notification trigger error:', notifErr);
    }

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (err) {
    console.error('Activity log POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json(
        { error: 'No family found for user' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('activity_logs')
      .select('*, activities(title, category, slug)')
      .eq('family_id', profile.family_id)
      .order('date', { ascending: false })
      .limit(limit);

    if (from) {
      query = query.gte('date', from);
    }
    if (to) {
      query = query.lte('date', to);
    }

    const { data: logs, error: queryError } = await query;

    if (queryError) {
      console.error('Failed to fetch activity logs:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: logs });
  } catch (err) {
    console.error('Activity log GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
