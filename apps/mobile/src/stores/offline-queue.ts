import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { apiPost, apiPut, apiDelete } from '@/lib/api';

const storage = new MMKV({ id: 'offline-queue' });

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

function loadQueue(): QueueItem[] {
  const raw = storage.getString('queue');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQueue(queue: QueueItem[]) {
  storage.set('queue', JSON.stringify(queue));
}

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  queue: loadQueue(),
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

    for (const item of queue) {
      try {
        switch (item.method) {
          case 'POST':
            await apiPost(item.path, item.body);
            break;
          case 'PUT':
            await apiPut(item.path, item.body);
            break;
          case 'DELETE':
            await apiDelete(item.path, item.body);
            break;
        }
      } catch {
        // Keep failed items for retry
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
