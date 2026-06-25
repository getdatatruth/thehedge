import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

  if (!data) {
    return { title: 'Activity - The Hedge' };
  }

  return {
    title: `${data.title} - The Hedge`,
    description: data.description,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Look up the activity in the DB only. If it does not exist, 404.
  const { data: dbActivity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!dbActivity) notFound();

  const activity = dbActivity;

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

  const instructions = activity.instructions as { steps: string[] };
  const materials = activity.materials as {
    name: string;
    household_common: boolean;
  }[];

  // Find variations from the DB: activities that share this activity's parent,
  // are this activity's parent, or are children of this activity.
  const variationFilters: string[] = [`parent_activity_id.eq.${activity.id}`];
  if (activity.parent_activity_id) {
    variationFilters.push(`id.eq.${activity.parent_activity_id}`);
    variationFilters.push(
      `parent_activity_id.eq.${activity.parent_activity_id}`
    );
  }

  const { data: variationRows } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .neq('id', activity.id)
    .or(variationFilters.join(','));

  const variations = variationRows || [];
  const variationIds = new Set(variations.map((v) => v.id));

  // "Try next" suggestions: same category, different activity, not a variation.
  const { data: tryNextRows } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .eq('category', activity.category)
    .neq('id', activity.id)
    .limit(10);

  const tryNext = (tryNextRows || [])
    .filter((a) => !variationIds.has(a.id))
    .slice(0, 3);

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
