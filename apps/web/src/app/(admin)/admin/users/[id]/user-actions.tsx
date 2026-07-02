'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Eye, Ban, CheckCircle, Trash2, Copy, AlertTriangle, ChevronDown } from 'lucide-react';

interface Props {
  familyId: string;
  tier: string;
  suspended: boolean;
}

export function UserActions({ familyId, tier, suspended }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [tierValue, setTierValue] = useState(tier);
  const [reset, setReset] = useState<{ email: string; password: string } | null>(null);
  const [loginLink, setLoginLink] = useState<{ email: string; link: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, options: RequestInit): Promise<Record<string, unknown> | null> {
    setError(null);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError((json as { error?: string }).error || 'Something went wrong'); return null; }
    return json as Record<string, unknown>;
  }

  async function changeTier(next: string) {
    setBusy('tier'); setTierValue(next);
    await call('/api/admin/users', { method: 'PUT', body: JSON.stringify({ id: familyId, subscription_tier: next }) });
    setBusy(null); router.refresh();
  }

  async function toggleSuspend() {
    setBusy('suspend');
    await call('/api/admin/users', { method: 'PUT', body: JSON.stringify({ id: familyId, subscription_status: suspended ? 'active' : 'cancelled' }) });
    setBusy(null); router.refresh();
  }

  async function resetPassword() {
    setBusy('reset');
    const json = await call('/api/admin/users/reset-password', { method: 'POST', body: JSON.stringify({ familyId }) });
    if (json) setReset({ email: json.email as string, password: json.password as string });
    setBusy(null);
  }

  async function impersonate() {
    setBusy('view');
    const json = await call('/api/admin/users/impersonate', { method: 'POST', body: JSON.stringify({ familyId }) });
    if (json) setLoginLink({ email: json.email as string, link: json.link as string });
    setBusy(null);
  }

  async function del() {
    setBusy('delete');
    const res = await fetch(`/api/admin/users?id=${familyId}`, { method: 'DELETE' });
    if (res.ok) { router.push('/admin/users'); return; }
    setError('Failed to delete'); setBusy(null); setConfirmDelete(false);
  }

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tier */}
        <div className="relative">
          <select
            value={tierValue}
            onChange={(e) => changeTier(e.target.value)}
            disabled={busy === 'tier'}
            className="h-9 appearance-none rounded-lg border border-stone bg-parchment pl-3 pr-8 text-sm font-semibold text-forest"
          >
            <option value="free">Free</option>
            <option value="family">Family</option>
            <option value="educator">Educator</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-clay/40" />
        </div>

        <button onClick={resetPassword} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-stone px-3 py-2 text-sm font-semibold text-forest hover:bg-parchment transition-all">
          <KeyRound className="h-3.5 w-3.5" /> Reset password
        </button>

        <button onClick={impersonate} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-stone px-3 py-2 text-sm font-semibold text-forest hover:bg-parchment transition-all">
          <Eye className="h-3.5 w-3.5" /> View as user
        </button>

        <button onClick={toggleSuspend} disabled={!!busy} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${suspended ? 'border-moss/30 text-moss hover:bg-moss/5' : 'border-rust/30 text-rust hover:bg-rust/5'}`}>
          {suspended ? <><CheckCircle className="h-3.5 w-3.5" /> Unsuspend</> : <><Ban className="h-3.5 w-3.5" /> Suspend</>}
        </button>

        <button onClick={() => setConfirmDelete(true)} disabled={!!busy} className="ml-auto flex items-center gap-1.5 rounded-lg border border-rust/30 px-3 py-2 text-sm font-semibold text-rust hover:bg-rust/5 transition-all">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-rust flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" />{error}</p>}

      {/* Reset password result */}
      {reset && (
        <Modal onClose={() => setReset(null)} title="Password reset" tone="forest">
          <CredBox label={reset.email} value={reset.password} />
        </Modal>
      )}

      {/* Login link (impersonate) */}
      {loginLink && (
        <Modal onClose={() => setLoginLink(null)} title="One-time login link" tone="forest">
          <p className="text-xs text-clay/50 mb-3">Open this in a private/incognito window to view the app as <strong className="text-forest">{loginLink.email}</strong>. It expires shortly and signs you in as them.</p>
          <CredBox label="Login link" value={loginLink.link} mono={false} />
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)} title="Delete this family?" tone="rust">
          <p className="text-sm text-clay/70 mb-6">All data (members, children, logs) and the login(s) will be permanently removed. This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
            <button onClick={del} disabled={busy === 'delete'} className="btn-terra text-sm py-2 px-4">{busy === 'delete' ? 'Deleting...' : 'Delete permanently'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title, tone }: { children: React.ReactNode; onClose: () => void; title: string; tone: 'forest' | 'rust' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40" onClick={onClose}>
      <div className="card-elevated p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className={`font-display text-lg font-bold mb-4 ${tone === 'rust' ? 'text-rust' : 'text-forest'}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function CredBox({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-stone bg-parchment/50 p-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-clay/40 truncate">{label}</p>
        <p className={`text-sm font-semibold text-forest truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button onClick={() => navigator.clipboard?.writeText(value)} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-2.5 shrink-0">
        <Copy className="h-3 w-3" /> Copy
      </button>
    </div>
  );
}
