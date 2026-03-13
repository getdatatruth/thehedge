/**
 * CORS configuration for mobile app and web access.
 *
 * Allowed origins are determined by environment:
 * - NEXT_PUBLIC_APP_URL: the deployed web app domain
 * - CORS_ALLOWED_ORIGINS: comma-separated additional origins (mobile apps, etc.)
 * - localhost origins are allowed in development
 */

function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Primary web app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) origins.push(appUrl);

  // Additional origins (mobile apps, staging, etc.)
  const extra = process.env.CORS_ALLOWED_ORIGINS || '';
  extra
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.push(o));

  // Development localhost origins
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081', // Expo
      'http://127.0.0.1:3000'
    );
  }

  // Mobile app custom schemes
  origins.push(
    'capacitor://localhost',  // Capacitor iOS/Android
    'ionic://localhost',      // Ionic
    'thehedge://',            // Custom deep link scheme
  );

  return origins;
}

const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
const ALLOWED_HEADERS = 'Authorization, Content-Type, X-API-Key, X-Requested-With';
const MAX_AGE = '86400'; // 24 hours

/**
 * Returns standard CORS headers. Optionally pass an origin to match
 * against the allowlist.
 */
export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  let allowedOrigin = '';

  if (origin && allowed.includes(origin)) {
    allowedOrigin = origin;
  } else if (allowed.length > 0) {
    // Default to first allowed origin if no specific match
    allowedOrigin = allowed[0];
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': MAX_AGE,
  };
}

/**
 * Produce CORS headers from a Request, automatically extracting the Origin header.
 */
export function corsHeadersFromRequest(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return corsHeaders(origin);
}
