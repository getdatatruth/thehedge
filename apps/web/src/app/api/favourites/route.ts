import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's family_id
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const { data: favourites, error } = await supabase
      .from('activity_favourites')
      .select('activity_id, activities(id, title, slug, description, category, age_min, age_max, duration_minutes, energy_level, mess_level, location, premium, screen_free, season, weather, learning_outcomes, materials, instructions, created_at)')
      .eq('family_id', profile.family_id);

    if (error) {
      // Handle missing table gracefully (e.g. table not yet created)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('activity_favourites table does not exist yet');
        return NextResponse.json({ activityIds: [], activities: [] });
      }
      console.error('Error fetching favourites:', error);
      return NextResponse.json({ error: 'Failed to fetch favourites' }, { status: 500 });
    }

    const activityIds = (favourites || []).map((f: { activity_id: string }) => f.activity_id);
    const activities = (favourites || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((f: any) => f.activities)
      .filter(Boolean)
      // Supabase joined queries may return arrays; unwrap single items
      .map((a: unknown) => (Array.isArray(a) ? a[0] : a))
      .filter(Boolean);
    return NextResponse.json({ activityIds, activities });
  } catch (error) {
    console.error('Favourites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    const body = await request.json();
    const { activity_id } = body;

    if (!activity_id || typeof activity_id !== 'string') {
      return NextResponse.json({ error: 'Missing activity_id' }, { status: 400 });
    }

    // Get user's family_id
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('activity_favourites')
      .insert({ family_id: profile.family_id, activity_id });

    if (error) {
      // Handle missing table gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('activity_favourites table does not exist yet');
        return NextResponse.json({ error: 'Favourites not available yet' }, { status: 503 });
      }
      // Unique constraint violation means it's already favourited
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already favourited' }, { status: 200 });
      }
      console.error('Error adding favourite:', error);
      return NextResponse.json({ error: 'Failed to add favourite' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Favourite added' }, { status: 201 });
  } catch (error) {
    console.error('Favourites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { activity_id } = body;

    if (!activity_id || typeof activity_id !== 'string') {
      return NextResponse.json({ error: 'Missing activity_id' }, { status: 400 });
    }

    // Get user's family_id
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('activity_favourites')
      .delete()
      .eq('family_id', profile.family_id)
      .eq('activity_id', activity_id);

    if (error) {
      // Handle missing table gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('activity_favourites table does not exist yet');
        return NextResponse.json({ error: 'Favourites not available yet' }, { status: 503 });
      }
      console.error('Error removing favourite:', error);
      return NextResponse.json({ error: 'Failed to remove favourite' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Favourite removed' });
  } catch (error) {
    console.error('Favourites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
