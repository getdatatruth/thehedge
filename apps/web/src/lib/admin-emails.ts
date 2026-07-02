// Single source of truth for who is an admin. Used by BOTH the middleware
// (which gates the /admin PAGES) and requireAdmin (which gates the admin API
// routes), so the two can never drift apart and lock the owner out of one while
// allowing the other.

/**
 * Founder emails that always have admin access, even if ADMIN_EMAILS is unset in
 * the environment. Extend for a deployment via the ADMIN_EMAILS env var
 * (comma-separated), e.g. ADMIN_EMAILS=teammate@thehedge.ie,ops@thehedge.ie
 */
export const DEFAULT_ADMIN_EMAILS = [
  'adam@thehedge.ie',
  'adam@ofmm.ie',
  'info@ofmm.ie',
  'adam@getdatatruth.com',
  'admin@thehedge.ie',
];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
