import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, restoreQueryCache, persistQueryCache } from '@/lib/query-client';
import { AppState, AppStateStatus } from 'react-native';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restore cache on mount
    restoreQueryCache();

    // Persist cache when app goes to background
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'background') {
        persistQueryCache();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
