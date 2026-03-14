import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';

export const metadata = {
  title: 'Settings - The Hedge',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile with family data
  const { data: profile } = await supabase
    .from('users')
    .select('id, name, email, role, notification_prefs, family_id, families(id, name, county, family_style, subscription_tier, subscription_status)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Handle Supabase join returning array or object
  const family = Array.isArray(profile.families)
    ? profile.families[0]
    : profile.families;

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests, school_status, sen_flags, learning_style, curriculum_stage, avatar_url')
    .eq('family_id', profile.family_id)
    .order('date_of_birth', { ascending: true });

  // Build notification prefs with defaults
  const defaultNotifs = {
    morning_idea: true,
    weekend_plan: true,
    weekly_summary: true,
    community: false,
  };
  const notificationPrefs = profile.notification_prefs
    ? { ...defaultNotifs, ...(profile.notification_prefs as Record<string, boolean>) }
    : defaultNotifs;

  return (
    <SettingsClient
      user={{
        id: profile.id,
        name: profile.name || '',
        email: profile.email || user.email || '',
        role: profile.role || 'parent',
      }}
      family={{
        id: family?.id || '',
        name: family?.name || '',
        county: family?.county || '',
        familyStyle: family?.family_style || 'balanced',
        subscriptionTier: family?.subscription_tier || 'free',
        subscriptionStatus: family?.subscription_status || 'active',
      }}
      children={
        (children || []).map((c) => ({
          id: c.id,
          name: c.name,
          dateOfBirth: c.date_of_birth,
          interests: c.interests || [],
          schoolStatus: c.school_status || 'mainstream',
          senFlags: c.sen_flags || [],
          learningStyle: c.learning_style || '',
          curriculumStage: c.curriculum_stage || '',
        }))
      }
      notificationPrefs={notificationPrefs}
    />
  );
}
