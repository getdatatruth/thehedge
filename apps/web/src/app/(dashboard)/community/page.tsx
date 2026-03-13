import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CommunityClient } from './community-client';

export const metadata = {
  title: 'Community — The Hedge',
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile and family info
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    redirect('/onboarding');
  }

  const familyId = profile.family_id;

  // Get family county
  const { data: family } = await supabase
    .from('families')
    .select('county')
    .eq('id', familyId)
    .single();

  const county = family?.county || null;

  // Fetch all groups
  const { data: groups } = await supabase
    .from('community_groups')
    .select('*')
    .order('member_count', { ascending: false });

  // Fetch user's memberships
  const { data: memberships } = await supabase
    .from('community_memberships')
    .select('group_id, role')
    .eq('family_id', familyId);

  const memberGroupIds = (memberships || []).map(
    (m: { group_id: string }) => m.group_id
  );

  // Fetch recent posts from groups the family belongs to
  let posts: Array<{
    id: string;
    family_id: string;
    group_id: string;
    title: string;
    body: string;
    type: string;
    created_at: string;
    community_groups: { name: string } | { name: string }[] | null;
    families: { name: string } | { name: string }[] | null;
  }> = [];

  if (memberGroupIds.length > 0) {
    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*, community_groups(name), families(name)')
      .in('group_id', memberGroupIds)
      .order('created_at', { ascending: false })
      .limit(20);
    posts = postsData || [];
  }

  // Normalize posts
  const normalizedPosts = posts.map((post) => {
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

  // Fetch upcoming events from member groups
  let events: Array<{
    id: string;
    group_id: string;
    title: string;
    description: string | null;
    location: string | null;
    date: string;
    capacity: number | null;
    rsvp_count: number;
    created_at: string;
    community_groups: { name: string } | { name: string }[] | null;
  }> = [];

  if (memberGroupIds.length > 0) {
    const { data: eventsData } = await supabase
      .from('events')
      .select('*, community_groups(name)')
      .in('group_id', memberGroupIds)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(10);
    events = eventsData || [];
  }

  const normalizedEvents = events.map((event) => {
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

  return (
    <CommunityClient
      groups={groups || []}
      posts={normalizedPosts}
      events={normalizedEvents}
      memberGroupIds={memberGroupIds}
      familyCounty={county}
      familyId={familyId}
    />
  );
}
