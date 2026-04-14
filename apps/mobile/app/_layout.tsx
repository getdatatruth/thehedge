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

    const inOnboarding = segments.join('/').includes('onboarding');

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      if (!profile || !profile.onboarding_completed) {
        // Only redirect to onboarding index if not already in the onboarding flow
        if (!inOnboarding) {
          router.replace('/(auth)/onboarding');
        }
      } else {
        router.replace('/(tabs)');
      }
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
