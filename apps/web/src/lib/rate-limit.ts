import { NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const ipStore = new Map<string, RateLimitEntry>();
const userStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(store: Map<string, RateLimitEntry>, windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

function checkLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  cleanup(store, config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetMs: config.windowMs,
  };
}

/**
 * Default rate limit configurations per route pattern.
 * Override by passing a custom config to `rateLimit()`.
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth endpoints: stricter limits
  '/api/auth': { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  // AI endpoints: moderate limits
  '/api/v1/ai': { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  // Admin endpoints
  '/api/admin': { limit: 60, windowMs: 60 * 1000 }, // 60 per minute
  // General API
  default: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
};

/**
 * Get the rate limit config for a given pathname.
 */
function getConfigForPath(pathname: string): RateLimitConfig {
  for (const [prefix, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (prefix !== 'default' && pathname.startsWith(prefix)) {
      return config;
    }
  }
  return RATE_LIMIT_CONFIGS.default;
}

/**
 * Extract client IP from request headers.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export interface RateLimitResult {
  success: boolean;
  response?: NextResponse;
  remaining: number;
}

/**
 * Rate-limit a request by IP and optionally by user ID.
 *
 * Usage in an API route:
 * ```ts
 * const rl = rateLimit(request, { userId: user?.id });
 * if (!rl.success) return rl.response;
 * ```
 */
export function rateLimit(
  request: Request,
  options?: {
    userId?: string;
    config?: RateLimitConfig;
    pathname?: string;
  }
): RateLimitResult {
  const pathname =
    options?.pathname ?? new URL(request.url).pathname;
  const config = options?.config ?? getConfigForPath(pathname);
  const ip = getClientIp(request);

  // Check IP-based limit
  const ipResult = checkLimit(ipStore, `ip:${ip}:${pathname}`, config);
  if (!ipResult.allowed) {
    const retryAfterSeconds = Math.ceil(ipResult.resetMs / 1000);
    return {
      success: false,
      remaining: 0,
      response: NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(
              Math.ceil((Date.now() + ipResult.resetMs) / 1000)
            ),
          },
        }
      ),
    };
  }

  // Check user-based limit (stricter: 2x the per-IP limit for authenticated users)
  if (options?.userId) {
    const userConfig = { ...config, limit: config.limit * 2 };
    const userResult = checkLimit(
      userStore,
      `user:${options.userId}:${pathname}`,
      userConfig
    );
    if (!userResult.allowed) {
      const retryAfterSeconds = Math.ceil(userResult.resetMs / 1000);
      return {
        success: false,
        remaining: 0,
        response: NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSeconds),
              'X-RateLimit-Limit': String(userConfig.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(
                Math.ceil((Date.now() + userResult.resetMs) / 1000)
              ),
            },
          }
        ),
      };
    }
    return { success: true, remaining: userResult.remaining };
  }

  return { success: true, remaining: ipResult.remaining };
}
