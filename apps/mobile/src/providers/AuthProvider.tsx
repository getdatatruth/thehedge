import React, { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthStore, type UserProfile, type Family, type Child } from '@/stores/auth-store';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerPushToken() {
  // Push notifications only work on physical devices, skip gracefully on simulator
  if (Platform.OS === 'web') return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: projectId || undefined,
  });

  // Send token to backend for storage
  try {
    await apiPost('/me/push-token', {
      token: tokenData.data,
      platform: Platform.OS,
    });
  } catch {
    // Silently fail - push registration is not critical
  }
}

// Set to true to bypass Supabase auth and use mock data for UI testing
const DEV_BYPASS_AUTH = false;

const MOCK_PROFILE: UserProfile = {
  id: 'dev-user-1',
  name: 'Adam',
  email: 'adam@thehedge.ie',
  role: 'parent',
  family_id: 'dev-family-1',
  onboarding_completed: true,
};

const MOCK_FAMILY: Family = {
  id: 'dev-family-1',
  name: "O'Flynn Family",
  county: 'Dublin',
  country: 'IE',
  latitude: 53.3498,
  longitude: -6.2603,
  family_style: 'outdoor',
  subscription_tier: 'family',
  subscription_status: 'active',
  trial_ends_at: null,
  stripe_customer_id: null,
  onboarding_completed: true,
};

const MOCK_CHILDREN: Child[] = [
  {
    id: 'dev-child-1',
    name: 'Fiadh',
    date_of_birth: '2020-06-15',
    interests: ['nature', 'arts', 'music'],
    school_status: 'preschool',
    age: 5,
  },
  {
    id: 'dev-child-2',
    name: 'Oisin',
    date_of_birth: '2022-11-03',
    interests: ['physical', 'science'],
    school_status: 'home',
    age: 3,
  },
];

interface MeResponse {
  user: UserProfile;
  family: Family;
  children: Array<{
    id: string;
    name: string;
    date_of_birth: string;
    interests: string[];
    school_status: string;
  }>;
}

export function AuthProvider({ children: childrenProp }: { children: React.ReactNode }) {
  const { setSession, setProfile, setFamily, setChildren, setLoading, setInitialized, reset } =
    useAuthStore();
  const router = useRouter();
  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const { data } = await apiGet<MeResponse>('/me');
      // onboarding_completed lives on family in the API, merge onto profile for routing
      setProfile({
        ...data.user,
        onboarding_completed: (data.family as any).onboarding_completed ?? true,
      });
      setFamily(data.family);

      // Calculate ages
      const childrenWithAges: Child[] = data.children.map((c) => {
        const dob = new Date(c.date_of_birth);
        const age = Math.floor(
          (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        return { ...c, age };
      });
      setChildren(childrenWithAges);
    } catch {
      // User data load failed - might be a new user without profile
    }
  }, [setProfile, setFamily, setChildren]);

  useEffect(() => {
    // Dev bypass: skip Supabase, seed mock data, go straight to tabs
    if (DEV_BYPASS_AUTH) {
      setSession({ access_token: 'dev-token', user: { id: 'dev-user-1' } } as any);
      setProfile(MOCK_PROFILE);
      setFamily(MOCK_FAMILY);
      setChildren(MOCK_CHILDREN);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData()
          .then(() => {
            registerPushToken();
          })
          .finally(() => {
            setLoading(false);
            setInitialized(true);
          });
      } else {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        await loadUserData();
        registerPushToken();
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        reset();
        setInitialized(true);
      }
    });

    // Listen for notification taps to handle deep linking
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          type?: string;
          activityId?: string;
          screen?: string;
        };

        if (!data?.type) return;

        switch (data.type) {
          case 'morning_plan':
          case 'weekly_plan':
          case 'tomorrow_preview':
            router.push('/(tabs)/plan');
            break;
          case 'activity_reminder':
            if (data.activityId) {
              router.push(`/(stack)/activity/${data.activityId}` as any);
            } else {
              router.push('/(tabs)');
            }
            break;
          case 'streak_risk':
          case 'day_review':
          case 'week_review':
          case 'month_review':
          case 'achievement':
            router.push('/(tabs)/progress');
            break;
          default:
            router.push('/(tabs)');
            break;
        }
      });

    return () => {
      subscription.unsubscribe();
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, [setSession, setLoading, setInitialized, loadUserData, reset, router]);

  return <>{childrenProp}</>;
}
