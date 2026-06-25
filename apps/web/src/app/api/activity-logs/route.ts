import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/notifications';

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
    const { activity_id, child_ids, date, duration_minutes, notes, rating } =
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
      .select('*, activities(title, category, slug)')
      .single();

    if (insertError) {
      console.error('Failed to insert activity log:', insertError);
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      );
    }

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
