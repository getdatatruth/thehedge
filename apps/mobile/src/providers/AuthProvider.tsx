import React, { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { apiGet, apiPost, ApiError } from '@/lib/api';
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
  // Push notifications only work on physical devices with proper entitlements
  if (Platform.OS === 'web') return;

  try {
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

    await apiPost('/me/push-token', {
      token: tokenData.data,
      platform: Platform.OS,
    });
  } catch {
    // Silently fail - push registration requires proper APS entitlements
    // which are only available in EAS builds, not local dev builds
  }
}

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
      // onboarding_completed lives on family in the API, merge onto profile for
      // routing. Default to false so a brand-new family (no family yet, or the
      // flag unset) is sent to the Kitchen Table rather than skipped past it.
      setProfile({
        ...data.user,
        onboarding_completed: (data.family as { onboarding_completed?: boolean } | null)?.onboarding_completed ?? false,
      });
      setFamily(data.family);

      // Calculate ages
      const childrenWithAges: Child[] = (data.children || []).map((c) => {
        const dob = new Date(c.date_of_birth);
        const age = Math.floor(
          (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        return { ...c, age };
      });
      setChildren(childrenWithAges);
    } catch (e) {
      // A 404 means a brand-new user with no profile row yet: that is expected
      // right after signup, so we leave them in onboarding. But a 401/403 means
      // the stored session is dead (e.g. the account was removed server-side):
      // sign out so the router lands them on a clean login instead of trapping
      // them in onboarding with a token every authed call will reject.
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        await supabase.auth.signOut();
      }
      // Any other failure (offline, 404) is non-fatal here.
    }
  }, [setProfile, setFamily, setChildren]);

  useEffect(() => {
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
