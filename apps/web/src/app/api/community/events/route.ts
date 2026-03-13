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

    const { data: events, error } = await supabase
      .from('events')
      .select('*, community_groups(name)')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    const normalized = (events || []).map((event) => {
      const groupData = Array.isArray(event.community_groups)
        ? event.community_groups[0]
        : event.community_groups;

      return {
        id: event.id,
        group_id: event.group_id,
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date,
        capacity: event.capacity,
        rsvp_count: event.rsvp_count,
        created_at: event.created_at,
        group_name: groupData?.name || 'Unknown group',
      };
    });

    return NextResponse.json({ events: normalized });
  } catch (error) {
    console.error('Events GET error:', error);
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
    const { event_id } = body;

    if (!event_id || typeof event_id !== 'string') {
      return NextResponse.json({ error: 'Missing event_id' }, { status: 400 });
    }

    // Increment rsvp_count
    const { data: event } = await supabase
      .from('events')
      .select('rsvp_count, capacity')
      .eq('id', event_id)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.capacity && event.rsvp_count >= event.capacity) {
      return NextResponse.json({ error: 'Event is at capacity' }, { status: 409 });
    }

    const { error } = await supabase
      .from('events')
      .update({ rsvp_count: event.rsvp_count + 1 })
      .eq('id', event_id);

    if (error) {
      console.error('Error RSVPing:', error);
      return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 });
    }

    return NextResponse.json({ message: 'RSVP confirmed', rsvp_count: event.rsvp_count + 1 });
  } catch (error) {
    console.error('Events RSVP POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
