import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
      return NextResponse.json({ unreadCount: 0 });
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', profile.family_id)
      .eq('read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return NextResponse.json({ unreadCount: 0 });
    }

    return NextResponse.json({ unreadCount: count ?? 0 });
  } catch (err) {
    console.error('Notification count error:', err);
    return NextResponse.json({ unreadCount: 0 });
  }
}
