import { ChatInterface } from './chat-client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWeather, getSeason } from '@/lib/weather';

export const metadata = {
  title: 'Ask The Hedge — HedgeAI',
};

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get family context
  const { data: profile } = await supabase
    .from('users')
    .select('family_id, families(county, latitude, longitude, family_style, subscription_tier, subscription_status, trial_ends_at)')
    .eq('id', user.id)
    .single();

  const familyId = profile?.family_id;
  if (!familyId) {
    redirect('/login');
  }

  const family = (
    Array.isArray(profile?.families) ? profile.families[0] : profile?.families
  ) as {
    county: string | null;
    latitude: number | null;
    longitude: number | null;
    family_style: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
  } | null;

  // Determine if free user
  let effectiveTier = family?.subscription_tier || 'free';
  if (family?.subscription_status === 'trialing' && family?.trial_ends_at) {
    if (new Date() > new Date(family.trial_ends_at)) effectiveTier = 'free';
  } else if (family?.subscription_status === 'cancelled' || family?.subscription_status === 'past_due') {
    effectiveTier = 'free';
  }
  const isFreeUser = effectiveTier === 'free';

  // Get children
  const { data: children } = await supabase
    .from('children')
    .select('name, date_of_birth, interests, school_status')
    .eq('family_id', familyId);

  // Get weather
  const weather = await getWeather(family?.latitude, family?.longitude);
  const season = getSeason();

  // Calculate ages
  const childrenWithAges = (children || []).map((child) => {
    const dob = new Date(child.date_of_birth);
    const age = Math.floor(
      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return { ...child, age };
  });

  const context = {
    children: childrenWithAges.map((c) => ({
      name: c.name,
      age: c.age,
      interests: c.interests,
    })),
    weather: weather
      ? {
          temperature: weather.temperature,
          condition: weather.weatherLabel,
          isRaining: weather.isRaining,
        }
      : null,
    season,
    county: family?.county ?? null,
    familyStyle: family?.family_style ?? null,
  };

  return <ChatInterface context={context} isFreeUser={isFreeUser} />;
}
