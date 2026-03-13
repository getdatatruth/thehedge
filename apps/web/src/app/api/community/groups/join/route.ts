import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const body = await request.json();
    const { group_id } = body;

    if (!group_id || typeof group_id !== 'string') {
      return NextResponse.json({ error: 'Missing group_id' }, { status: 400 });
    }

    // Insert membership
    const { error: joinError } = await supabase
      .from('community_memberships')
      .insert({
        family_id: profile.family_id,
        group_id,
        role: 'member',
      });

    if (joinError) {
      if (joinError.code === '23505') {
        return NextResponse.json({ message: 'Already a member' }, { status: 200 });
      }
      console.error('Error joining group:', joinError);
      return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
    }

    // Update member_count based on actual membership count (race-condition safe)
    const { count } = await supabase
      .from('community_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group_id);

    if (count !== null) {
      await supabase
        .from('community_groups')
        .update({ member_count: count })
        .eq('id', group_id);
    }

    return NextResponse.json({ message: 'Joined group' }, { status: 201 });
  } catch (error) {
    console.error('Join group POST error:', error);
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

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const body = await request.json();
    const { group_id } = body;

    if (!group_id || typeof group_id !== 'string') {
      return NextResponse.json({ error: 'Missing group_id' }, { status: 400 });
    }

    const { error: leaveError } = await supabase
      .from('community_memberships')
      .delete()
      .eq('family_id', profile.family_id)
      .eq('group_id', group_id);

    if (leaveError) {
      console.error('Error leaving group:', leaveError);
      return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
    }

    // Update member_count based on actual membership count (race-condition safe)
    const { count } = await supabase
      .from('community_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group_id);

    if (count !== null) {
      await supabase
        .from('community_groups')
        .update({ member_count: count })
        .eq('id', group_id);
    }

    return NextResponse.json({ message: 'Left group' });
  } catch (error) {
    console.error('Leave group DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
