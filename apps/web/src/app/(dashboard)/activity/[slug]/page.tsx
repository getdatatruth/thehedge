import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';
import { ActivityDetailClient } from './activity-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('activities')
    .select('title, description')
    .eq('slug', slug)
    .single();

  // Fall back to mock data for metadata
  if (!data) {
    const mock = MOCK_ACTIVITIES.find((a) => a.slug === slug);
    return {
      title: mock ? `${mock.title} - The Hedge` : 'Activity - The Hedge',
      description: mock?.description,
    };
  }

  return {
    title: `${data.title} - The Hedge`,
    description: data.description,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let activity = null;
  let isFromDb = false;

  // Try DB first
  const { data: dbActivity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (dbActivity) {
    activity = dbActivity;
    isFromDb = true;
  } else {
    // Fall back to mock data
    const mockActivity = MOCK_ACTIVITIES.find((a) => a.slug === slug);
    if (mockActivity) {
      activity = {
        ...mockActivity,
        instructions: { steps: mockActivity.instructions },
        published: true,
      };
    }
  }

  if (!activity) notFound();

  // Check if activity is premium and user is on free tier
  let isPremiumLocked = false;
  if (activity.premium) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('families(subscription_tier, subscription_status, trial_ends_at)')
        .eq('id', user.id)
        .single();
      const fam = (
        Array.isArray(profile?.families) ? profile.families[0] : profile?.families
      ) as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
      let effectiveTier = fam?.subscription_tier || 'free';
      if (fam?.subscription_status === 'trialing' && fam?.trial_ends_at) {
        if (new Date() > new Date(fam.trial_ends_at)) effectiveTier = 'free';
      } else if (fam?.subscription_status === 'cancelled' || fam?.subscription_status === 'past_due') {
        effectiveTier = 'free';
      }
      isPremiumLocked = effectiveTier === 'free';
    }
  }

  const instructions = isFromDb
    ? (activity.instructions as { steps: string[] })
    : (activity.instructions as { steps: string[] });
  const materials = isFromDb
    ? (activity.materials as { name: string; household_common: boolean }[])
    : (activity.materials as { name: string; household_common: boolean }[]);

  // Find variations (activities with same parent or that are parent of this one)
  const variations = MOCK_ACTIVITIES.filter(
    (a) =>
      a.id !== activity.id &&
      a.slug !== activity.slug &&
      (a.parent_activity_id === activity.id ||
        activity.parent_activity_id === a.id ||
        (activity.parent_activity_id &&
          a.parent_activity_id === activity.parent_activity_id))
  );

  // Find "try next" suggestions - same category, different activity
  const tryNext = MOCK_ACTIVITIES.filter(
    (a) =>
      a.slug !== activity.slug &&
      a.category === activity.category &&
      !variations.some((v) => v.id === a.id)
  ).slice(0, 3);

  // Only pass serializable data to the client component.
  // CATEGORY_CONFIG contains React component references (icons) which cannot
  // be serialized across the server/client boundary. The client component
  // imports CATEGORY_CONFIG directly and looks up the config by category key.
  return (
    <ActivityDetailClient
      activity={activity}
      category={activity.category as string}
      instructions={instructions}
      materials={materials}
      variations={variations}
      tryNext={tryNext}
      isPremiumLocked={isPremiumLocked}
    />
  );
}
