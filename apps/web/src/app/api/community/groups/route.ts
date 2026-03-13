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

    const { data: groups, error } = await supabase
      .from('community_groups')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }

    return NextResponse.json({ groups: groups || [] });
  } catch (error) {
    console.error('Groups GET error:', error);
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

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, county, type } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing group name' }, { status: 400 });
    }

    const validTypes = ['county', 'interest', 'coop'];
    const groupType = validTypes.includes(type) ? type : 'county';

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .insert({
        name,
        county: county || null,
        type: groupType,
        member_count: 1,
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }

    // Auto-join the creator as admin
    const { error: memberError } = await supabase
      .from('community_memberships')
      .insert({
        family_id: profile.family_id,
        group_id: group.id,
        role: 'admin',
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Groups POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
