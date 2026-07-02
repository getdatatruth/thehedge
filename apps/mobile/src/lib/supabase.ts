import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const supabaseUrl = 'https://hekwkhvalcuckznelqdp.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhla3draHZhbGN1Y2t6bmVscWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Njg5NDIsImV4cCI6MjA4ODU0NDk0Mn0.bWXVfYr1cDkcf98tbGHLH6N_5bmk3XAqYkwbP0uI0eM';

// Auth session persistence uses AsyncStorage, which is Supabase's recommended
// React Native store. It was previously expo-secure-store, whose ~2KB keychain
// value limit (a Supabase session with the user object runs right up against
// it) and slow/blocking cold-start reads meant the session sometimes failed to
// load, leaving the app with no access token and every authed request 401ing.
// AsyncStorage has no such limit and reads reliably. (On web, AsyncStorage
// falls back to localStorage, so this stays cross-platform.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// The current access token, held in memory and kept fresh by the auth listener
// below. Every API call needs a Bearer token; reading it from here is instant,
// whereas awaiting supabase.auth.getSession() on the request path pays a
// SecureStore (keychain) read and can trigger a blocking token refresh, which
// was making the first tap after opening the app hang for many seconds.
let currentAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return currentAccessToken;
}

// Keep the in-memory token in step with the real session. Fires on the initial
// session, sign-in, every silent token refresh, and sign-out, so the cached
// token is always the live one without any per-request work.
supabase.auth.onAuthStateChange((_event, session) => {
  currentAccessToken = session?.access_token ?? null;
});

// Supabase's auto-refresh timer must be started/stopped with the app's
// foreground state (this is the documented React Native setup, and was
// missing). Without it a token that lapses while the app is backgrounded is
// only refreshed lazily on the next request, blocking that request. Tying it to
// AppState refreshes proactively in the foreground instead.
if (Platform.OS !== 'web') {
  supabase.auth.startAutoRefresh();
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
