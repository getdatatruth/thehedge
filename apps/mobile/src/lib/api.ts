import { supabase } from './supabase';

const API_BASE = __DEV__
  ? 'http://192.168.68.104:3000/api/v1'
  : 'https://app.thehedge.ie/api/v1';

// Base URL without /v1 for routes outside the versioned API (e.g. /api/onboarding, /api/stripe/*)
const API_ROOT = __DEV__
  ? 'http://192.168.68.104:3000/api'
  : 'https://app.thehedge.ie/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
    [key: string]: unknown;
  };
  error?: {
    message: string;
    code: string;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Paths that support offline queueing for write operations
const QUEUEABLE_PATHS = [
  '/activity-logs',
  '/favourites',
];

function isQueueablePath(path: string): boolean {
  return QUEUEABLE_PATHS.some((p) => path.startsWith(p));
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return true;
  }
  if (error instanceof ApiError && error.status === 0) {
    return true;
  }
  return false;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  { useRoot = false }: { useRoot?: boolean } = {}
): Promise<ApiResponse<T>> {
  const authHeaders = await getAuthHeader();
  const base = useRoot ? API_ROOT : API_BASE;

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.message || 'Something went wrong',
      json.error?.code || 'UNKNOWN',
      res.status
    );
  }

  return json as ApiResponse<T>;
}

/**
 * Wraps a write API call with offline queue support.
 * If the call fails due to a network error and the path is queueable,
 * the action is enqueued for later retry instead of throwing.
 */
async function withOfflineQueue<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  apiCall?: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
  try {
    return await apiCall!();
  } catch (error) {
    if (isNetworkError(error) && isQueueablePath(path)) {
      // Lazy import to avoid circular dependency (offline-queue imports from api.ts)
      const { useOfflineQueue } = require('@/stores/offline-queue');
      useOfflineQueue.getState().enqueue({ method, path, body });
      // Return a synthetic success response so the caller can proceed optimistically
      return {
        success: true,
        data: { queued: true } as unknown as T,
        meta: { offline: true },
      };
    }
    throw error;
  }
}

// Convenience methods
export const apiGet = <T>(path: string) => api<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  withOfflineQueue<T>('POST', path, body, () =>
    api<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

export const apiPut = <T>(path: string, body: unknown) =>
  withOfflineQueue<T>('PUT', path, body, () =>
    api<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  );

export const apiDelete = <T>(path: string, body?: unknown) =>
  withOfflineQueue<T>('DELETE', path, body, () =>
    api<T>(path, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  );

// Non-versioned API routes (e.g. /api/onboarding, /api/stripe/*)
export const apiRootPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) }, { useRoot: true });
