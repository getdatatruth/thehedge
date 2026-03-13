import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ─── GET: Fetch portfolio entries for a child ───────────

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
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    // Verify child belongs to family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('family_id', profile.family_id)
      .single();

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const { data: entries, error } = await supabase
      .from('portfolio_entries')
      .select('*, activity_logs(id, date, duration_minutes, notes, activities(title, category))')
      .eq('child_id', childId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch portfolio entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ data: entries });
  } catch (err) {
    console.error('Portfolio GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Create a new portfolio entry ─────────────────

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
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const body = await request.json();
    const {
      child_id,
      title,
      description,
      date,
      curriculum_areas,
      outcome_ids,
      photos,
      activity_log_id,
    } = body;

    if (!child_id || !title || !date) {
      return NextResponse.json(
        { error: 'child_id, title, and date are required' },
        { status: 400 }
      );
    }

    // Verify child belongs to family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('family_id', profile.family_id)
      .single();

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const { data: entry, error: insertError } = await supabase
      .from('portfolio_entries')
      .insert({
        child_id,
        title,
        description: description || null,
        date,
        curriculum_areas: curriculum_areas || [],
        outcome_ids: outcome_ids || [],
        photos: photos || [],
        activity_log_id: activity_log_id || null,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Failed to create portfolio entry:', insertError);
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err) {
    console.error('Portfolio POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── DELETE: Delete a portfolio entry ─────────────────────

export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry id is required' }, { status: 400 });
    }

    // Fetch entry and verify child belongs to family
    const { data: entry } = await supabase
      .from('portfolio_entries')
      .select('id, child_id, children(family_id)')
      .eq('id', id)
      .single();

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const childFamily = Array.isArray(entry.children) ? entry.children[0] : entry.children;
    if ((childFamily as { family_id?: string })?.family_id !== profile.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('portfolio_entries')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete portfolio entry:', deleteError);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Portfolio DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
