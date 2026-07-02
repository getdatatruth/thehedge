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

// ─── Roles / RBAC ───────────────────────────────────────
// superadmin: full control incl. destructive actions (delete). support: manage
// users (create, reset password, tier, suspend, impersonate) but not delete.
// readonly: view only. Founders are superadmin; anyone added via ADMIN_EMAILS is
// support by default; put them in ADMIN_READONLY_EMAILS or ADMIN_SUPERADMIN_EMAILS
// to change that.
export type AdminRole = 'superadmin' | 'support' | 'readonly';

function envList(name: string): string[] {
  return (process.env[name] || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminRole(email: string | null | undefined): AdminRole | null {
  if (!isAdminEmail(email)) return null;
  const e = email!.toLowerCase();
  if (DEFAULT_ADMIN_EMAILS.includes(e) || envList('ADMIN_SUPERADMIN_EMAILS').includes(e)) return 'superadmin';
  if (envList('ADMIN_READONLY_EMAILS').includes(e)) return 'readonly';
  return 'support';
}

export function canWrite(role: AdminRole | null): boolean {
  return role === 'superadmin' || role === 'support';
}

export function canDelete(role: AdminRole | null): boolean {
  return role === 'superadmin';
}
