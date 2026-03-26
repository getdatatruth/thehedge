import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'offline-queue';

interface QueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  createdAt: number;
}

interface OfflineQueueState {
  queue: QueueItem[];
  isProcessing: boolean;
  enqueue: (item: Omit<QueueItem, 'id' | 'createdAt'>) => void;
  flush: () => Promise<void>;
  clear: () => void;
}

function saveQueue(queue: QueueItem[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue)).catch(() => {});
}

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  enqueue: (item) => {
    const newItem: QueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    const updated = [...get().queue, newItem];
    saveQueue(updated);
    set({ queue: updated });
  },

  flush: async () => {
    const { queue, isProcessing } = get();
    if (isProcessing || queue.length === 0) return;

    set({ isProcessing: true });
    const remaining: QueueItem[] = [];

    // Lazy import to avoid circular dependency with api.ts
    const { api } = require('@/lib/api');

    for (const item of queue) {
      try {
        await api(item.path, {
          method: item.method,
          ...(item.body ? { body: JSON.stringify(item.body) } : {}),
        });
      } catch {
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    set({ queue: remaining, isProcessing: false });
  },

  clear: () => {
    saveQueue([]);
    set({ queue: [] });
  },
}));

// Load persisted queue on first access
AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
  if (raw) {
    try {
      useOfflineQueue.setState({ queue: JSON.parse(raw) });
    } catch {}
  }
}).catch(() => {});
