import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Simple cache persistence using AsyncStorage
const CACHE_KEY = 'thehedge-query-cache';

export async function persistQueryCache() {
  const cache = queryClient.getQueryCache().getAll();
  const serializable = cache
    .filter((q) => q.state.status === 'success')
    .map((q) => ({
      queryKey: q.queryKey,
      data: q.state.data,
      dataUpdatedAt: q.state.dataUpdatedAt,
    }));
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
}

export async function restoreQueryCache() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return;
    const entries = JSON.parse(cached);
    for (const entry of entries) {
      queryClient.setQueryData(entry.queryKey, entry.data, {
        updatedAt: entry.dataUpdatedAt,
      });
    }
  } catch {
    // Cache restoration is best-effort
  }
}
