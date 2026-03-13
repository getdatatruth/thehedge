import { createClient } from '@/lib/supabase/server';
import { BrowseClient } from './browse-client';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';

export const metadata = {
  title: 'Browse — The Hedge',
};

export default async function BrowsePage() {
  const supabase = await createClient();

  const [{ data: dbActivities }, { data: dbCollections }] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('published', true)
      .order('title'),
    supabase
      .from('collections')
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  // Get user's subscription tier
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier = 'free';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('families(subscription_tier)')
      .eq('id', user.id)
      .single();
    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { subscription_tier: string } | null;
    tier = family?.subscription_tier || 'free';
  }

  // Use DB activities if available, fall back to mock
  const activities = dbActivities && dbActivities.length > 0 ? dbActivities : MOCK_ACTIVITIES;

  // Map DB collections to the shape BrowseClient expects
  const collections = (dbCollections || []).map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description || '',
    emoji: c.emoji || '📚',
    activity_ids: (c.activity_ids as string[]) || [],
    featured: c.featured,
    seasonal: c.seasonal,
    event_date: c.event_date,
  }));

  return (
    <BrowseClient
      activities={activities}
      collections={collections}
      isFreeUser={tier === 'free'}
    />
  );
}
