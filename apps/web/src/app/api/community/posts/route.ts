import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');

    let query = supabase
      .from('community_posts')
      .select('*, community_groups(name), families(name)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Normalize joined data (Supabase returns arrays for joins)
    const normalized = (posts || []).map((post) => {
      const groupData = Array.isArray(post.community_groups)
        ? post.community_groups[0]
        : post.community_groups;
      const familyData = Array.isArray(post.families)
        ? post.families[0]
        : post.families;

      return {
        id: post.id,
        family_id: post.family_id,
        group_id: post.group_id,
        title: post.title,
        body: post.body,
        type: post.type,
        created_at: post.created_at,
        group_name: groupData?.name || 'Unknown group',
        family_name: familyData?.name || 'A family',
      };
    });

    return NextResponse.json({ posts: normalized });
  } catch (error) {
    console.error('Posts GET error:', error);
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
    const { group_id, title, content, type } = body;

    if (!group_id || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields (group_id, title, content)' }, { status: 400 });
    }

    // Verify the family is a member of the group
    const { data: membership } = await supabase
      .from('community_memberships')
      .select('group_id')
      .eq('family_id', profile.family_id)
      .eq('group_id', group_id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'You must be a member of this group to post' }, { status: 403 });
    }

    const validTypes = ['discussion', 'question', 'event', 'resource'];
    const postType = validTypes.includes(type) ? type : 'discussion';

    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        family_id: profile.family_id,
        group_id,
        title,
        body: content,
        type: postType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
