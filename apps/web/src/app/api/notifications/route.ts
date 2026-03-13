import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: notifications });
  } catch (err) {
    console.error('Notifications GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { ids, markAllRead } = body as {
      ids?: string[];
      markAllRead?: boolean;
    };

    if (markAllRead) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('family_id', profile.family_id)
        .eq('read', false);

      if (error) {
        console.error('Failed to mark all notifications read:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (ids && ids.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('family_id', profile.family_id)
        .in('id', ids);

      if (error) {
        console.error('Failed to mark notifications read:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Provide ids or markAllRead' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Notifications PUT error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
