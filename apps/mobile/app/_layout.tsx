import React, { useEffect, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAuthStore } from '@/stores/auth-store';
import { darkTheme } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { session, profile, isLoading, isInitialized } = useAuthStore();

  const inAuthGroup = segments[0] === '(auth)';

  const onReady = useCallback(async () => {
    if (isInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // The Kitchen Table IS the onboarding flow, so it must count as "in
    // onboarding" - otherwise the router bounces between /onboarding and
    // /kitchen-table forever and the app appears to crash.
    const path = segments.join('/');
    const inOnboarding = path.includes('onboarding') || path.includes('kitchen-table');

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    const notOnboarded = !profile || !profile.onboarding_completed;

    if (inAuthGroup) {
      // In the auth flow. A fresh signup (profile still loading or unset) belongs
      // in onboarding; a returning, onboarded user belongs in the app.
      if (notOnboarded) {
        if (!inOnboarding) router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (notOnboarded && !inOnboarding) {
      // Signed in but not finished onboarding (incl. a 404 /me with no profile
      // row): never leave them on the tabs. isInitialized gating means the
      // profile is settled here, so returning, onboarded users do not flash this.
      router.replace('/(auth)/onboarding');
    }
  }, [session, profile, isInitialized, isLoading, segments, router]);

  if (!isInitialized) return null;

  return (
    <ErrorBoundary>
      <StatusBar style={inAuthGroup ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(stack)"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
