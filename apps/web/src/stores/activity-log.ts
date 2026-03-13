import { create } from 'zustand';

export interface ActivityLog {
  id: string;
  family_id: string;
  activity_id: string | null;
  child_ids: string[];
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  photos: string[];
  rating: number | null;
  curriculum_areas_covered: string[] | null;
  created_at: string;
  activities?: {
    title: string;
    category: string;
    slug: string;
  } | null;
}

interface LogActivityData {
  activity_id?: string | null;
  child_ids: string[];
  date: string;
  duration_minutes?: number | null;
  notes?: string | null;
  rating?: number | null;
}

interface ActivityLogState {
  recentLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
  logActivity: (data: LogActivityData) => Promise<ActivityLog | null>;
  loadRecentLogs: () => Promise<void>;
}

export const useActivityLogStore = create<ActivityLogState>((set, get) => ({
  recentLogs: [],
  loading: false,
  error: null,

  logActivity: async (data: LogActivityData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to log activity');
      }

      const { data: log } = await res.json();
      set((state) => ({
        recentLogs: [log, ...state.recentLogs],
        loading: false,
      }));
      return log;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      set({ error: message, loading: false });
      return null;
    }
  },

  loadRecentLogs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/activity-logs?limit=20');

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load logs');
      }

      const { data: logs } = await res.json();
      set({ recentLogs: logs || [], loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      set({ error: message, loading: false });
    }
  },
}));
