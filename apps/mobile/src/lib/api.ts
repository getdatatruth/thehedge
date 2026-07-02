import { supabase, getCachedAccessToken } from './supabase';

// API base URL. In dev, override via EXPO_PUBLIC_API_URL (e.g. http://192.168.x.x:3000)
// so it is not machine-specific. Production always uses the hosted platform.
const PROD_API_ORIGIN = 'https://app.thehedge.ie';
const API_ORIGIN = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
  : PROD_API_ORIGIN;

const API_BASE = `${API_ORIGIN}/api/v1`;

// Base URL without /v1 for routes outside the versioned API (e.g. /api/onboarding, /api/stripe/*)
const API_ROOT = `${API_ORIGIN}/api`;

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

async function getAuthHeader(): Promise<Record<string, string>> {
  // Fast path: the live token is held in memory (kept current by the auth
  // listener in ./supabase) so the common case adds no latency at all.
  const cached = getCachedAccessToken();
  if (cached) return { Authorization: `Bearer ${cached}` };

  // Cold path only (very first call before the auth listener has fired, or a
  // sign-out/in edge). Fall back to getSession(), but never let it hang the
  // request: on iOS this call reads the keychain and can trigger a blocking
  // token refresh, which was making the first tap after opening the app spin
  // forever. Cap it so a slow/stuck refresh degrades to an unauthed attempt
  // (which fails fast and cleanly) rather than an endless skeleton.
  try {
    const token = await Promise.race([
      supabase.auth.getSession().then(({ data }) => data.session?.access_token ?? null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // fall through to no auth header
  }
  return {};
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  { useRoot = false }: { useRoot?: boolean } = {}
): Promise<ApiResponse<T>> {
  const authHeaders = await getAuthHeader();
  const base = useRoot ? API_ROOT : API_BASE;

  // Never let a stalled request spin forever behind a loading skeleton. Abort
  // after 20s so React Query surfaces an error (and can retry) instead of the
  // screen hanging indefinitely with no way out.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError('The connection timed out. Please try again.', 'TIMEOUT', 0);
    }
    throw new ApiError('Could not reach The Hedge. Check your connection.', 'NETWORK', 0);
  }
  clearTimeout(timeout);

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

// Convenience methods
export const apiGet = <T>(path: string) => api<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPut = <T>(path: string, body: unknown) =>
  api<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(path: string, body?: unknown) =>
  api<T>(path, {
    method: 'DELETE',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

// Non-versioned API routes (e.g. /api/onboarding, /api/stripe/*)
export const apiRootPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) }, { useRoot: true });

// Frictionless signup: create a ready-to-use, pre-confirmed account server-side
// (mirrors the web) so there is no email-confirmation round-trip. The caller then
// signs in with the same password. This route returns { ok } / { error } rather
// than the { success, data } envelope, so we call it with a plain fetch.
export async function signUpAccount(email: string, password: string, name: string): Promise<void> {
  const res = await fetch(`${API_ROOT}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json?.error || 'Could not create your account');
  }
}

// Upload one local image to private portfolio storage; returns the durable path
// to attach to a portfolio entry. Multipart, so it cannot use the JSON api()
// wrapper. Do NOT set Content-Type; the runtime sets the multipart boundary.
export async function uploadPortfolioPhoto(uri: string): Promise<string> {
  const authHeaders = await getAuthHeader();
  const name = uri.split('/').pop() || 'photo.jpg';
  const ext = (name.split('.').pop() || 'jpg').toLowerCase();
  const form = new FormData();
  form.append('file', { uri, name, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` } as unknown as Blob);
  const res = await fetch(`${API_BASE}/portfolio/photo`, {
    method: 'POST',
    headers: { ...authHeaders },
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.path) {
    throw new Error(json?.error?.message || 'Could not upload that photo.');
  }
  return json.data.path as string;
}
