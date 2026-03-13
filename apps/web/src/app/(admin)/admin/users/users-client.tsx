'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronRight,
  Users,
  Crown,
  GraduationCap,
  User,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Ban,
  CheckCircle,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

interface Family {
  id: string;
  name: string;
  county: string | null;
  country: string;
  subscription_tier: string;
  subscription_status: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  child_count: number;
  member_count: number;
  email: string;
  activity_log_count: number;
  [key: string]: unknown;
}

const TIER_BADGES: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  free: { icon: User, bg: 'bg-linen', color: 'text-clay/50', label: 'Free' },
  family: { icon: Crown, bg: 'bg-moss/10', color: 'text-moss', label: 'Family' },
  educator: { icon: GraduationCap, bg: 'bg-gold/10', color: 'text-gold', label: 'Educator' },
};

type QuickFilter = 'all' | 'active' | 'suspended' | 'incomplete';

export function AdminUsersClient({ initialFamilies }: { initialFamilies: Family[] }) {
  const [families, setFamilies] = useState(initialFamilies);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTier, setBulkTier] = useState('');
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = families.filter((f) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !f.name.toLowerCase().includes(q) &&
        !f.email.toLowerCase().includes(q) &&
        !(f.county || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (tierFilter !== 'all' && f.subscription_tier !== tierFilter) return false;

    // Quick filters
    if (quickFilter === 'active' && f.subscription_status !== 'active') return false;
    if (quickFilter === 'suspended' && f.subscription_status !== 'cancelled') return false;
    if (quickFilter === 'incomplete' && f.onboarding_completed) return false;

    return true;
  });

  // Tier summary
  const tierCounts = families.reduce(
    (acc, f) => {
      acc[f.subscription_tier] = (acc[f.subscription_tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const suspendedCount = families.filter((f) => f.subscription_status === 'cancelled').length;
  const incompleteCount = families.filter((f) => !f.onboarding_completed).length;

  const handleUpdateFamily = useCallback(async (id: string, updates: Record<string, unknown>) => {
    setLoading(id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error('Failed to update');

      setFamilies((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } as Family : f)),
      );
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update family');
    } finally {
      setLoading(null);
      setEditingTier(null);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setFamilies((prev) => prev.filter((f) => f.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete family');
    } finally {
      setLoading(null);
    }
  }, []);

  const handleBulkOperation = useCallback(async (operation: string, data?: Record<string, unknown>) => {
    if (selectedIds.size === 0) return;
    setLoading('bulk');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          familyIds: Array.from(selectedIds),
          data,
        }),
      });
      if (!res.ok) throw new Error('Failed');

      // Update local state
      if (operation === 'change_tier' && data?.tier) {
        setFamilies((prev) =>
          prev.map((f) =>
            selectedIds.has(f.id) ? { ...f, subscription_tier: data.tier as string } : f,
          ),
        );
      } else if (operation === 'suspend') {
        setFamilies((prev) =>
          prev.map((f) =>
            selectedIds.has(f.id) ? { ...f, subscription_status: 'cancelled' } : f,
          ),
        );
      } else if (operation === 'unsuspend') {
        setFamilies((prev) =>
          prev.map((f) =>
            selectedIds.has(f.id) ? { ...f, subscription_status: 'active' } : f,
          ),
        );
      }

      setSelectedIds(new Set());
      setBulkTier('');
    } catch (err) {
      console.error('Bulk operation failed:', err);
      alert('Bulk operation failed');
    } finally {
      setLoading(null);
    }
  }, [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  };

  function handleExportCSV() {
    const headers = ['Family Name', 'Email', 'County', 'Country', 'Tier', 'Status', 'Children', 'Activity Logs', 'Onboarded', 'Joined'];
    const rows = filtered.map((f) => [
      `"${f.name.replace(/"/g, '""')}"`,
      f.email,
      f.county || '',
      f.country,
      f.subscription_tier,
      f.subscription_status,
      f.child_count,
      f.activity_log_count,
      f.onboarding_completed ? 'Yes' : 'No',
      new Date(f.created_at).toLocaleDateString('en-IE'),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Users
          </h1>
          <p className="text-clay/70 mt-1 font-serif">
            {families.length} families registered.
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="card-elevated p-4">
          <p className="text-xl font-bold font-display text-forest">{families.length}</p>
          <p className="text-[11px] text-clay/50">Total families</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-xl font-bold font-display text-forest">{tierCounts['free'] || 0}</p>
          <p className="text-[11px] text-clay/50">Free tier</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-xl font-bold font-display text-forest">{tierCounts['family'] || 0}</p>
          <p className="text-[11px] text-clay/50">Family tier</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-xl font-bold font-display text-forest">{tierCounts['educator'] || 0}</p>
          <p className="text-[11px] text-clay/50">Educator tier</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-xl font-bold font-display text-rust">{suspendedCount}</p>
          <p className="text-[11px] text-clay/50">Suspended</p>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'suspended', label: `Suspended (${suspendedCount})` },
          { key: 'incomplete', label: `Onboarding incomplete (${incompleteCount})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setQuickFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              quickFilter === key
                ? 'bg-forest text-parchment'
                : 'bg-parchment text-clay/50 border border-stone hover:border-forest/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
          <Input
            placeholder="Search name, email, county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 rounded-lg border-stone bg-parchment"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'free', 'family', 'educator'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                tierFilter === tier
                  ? 'bg-forest text-parchment'
                  : 'bg-parchment text-clay/50 border border-stone hover:border-forest/20'
              }`}
            >
              {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-clay/40 ml-auto">{filtered.length} results</span>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="card-elevated p-4 flex items-center gap-3 flex-wrap border-moss/30">
          <span className="text-sm font-semibold text-forest">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-stone" />

          <div className="flex items-center gap-2">
            <select
              value={bulkTier}
              onChange={(e) => setBulkTier(e.target.value)}
              className="h-8 rounded-lg border border-stone bg-parchment px-2 text-xs text-forest"
            >
              <option value="">Change tier...</option>
              <option value="free">Free</option>
              <option value="family">Family</option>
              <option value="educator">Educator</option>
            </select>
            {bulkTier && (
              <button
                onClick={() => handleBulkOperation('change_tier', { tier: bulkTier })}
                disabled={loading === 'bulk'}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Apply
              </button>
            )}
          </div>

          <button
            onClick={() => handleBulkOperation('suspend')}
            disabled={loading === 'bulk'}
            className="flex items-center gap-1.5 rounded-lg border border-rust/30 px-3 py-1.5 text-xs font-semibold text-rust hover:bg-rust/5 transition-all"
          >
            <Ban className="h-3 w-3" />
            Suspend
          </button>
          <button
            onClick={() => handleBulkOperation('unsuspend')}
            disabled={loading === 'bulk'}
            className="flex items-center gap-1.5 rounded-lg border border-moss/30 px-3 py-1.5 text-xs font-semibold text-moss hover:bg-moss/5 transition-all"
          >
            <CheckCircle className="h-3 w-3" />
            Unsuspend
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-clay/40 hover:text-clay/70 ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="card-elevated p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rust/10">
                <AlertTriangle className="h-5 w-5 text-rust" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-forest">Delete Family</h3>
                <p className="text-xs text-clay/50">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-clay/70 mb-6">
              Are you sure you want to delete{' '}
              <strong className="text-forest">
                {families.find((f) => f.id === deleteConfirm)?.name}
              </strong>
              ? All associated data (users, children, activity logs) will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading === deleteConfirm}
                className="btn-terra text-sm py-2 px-4"
              >
                {loading === deleteConfirm ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone bg-parchment/30">
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 rounded border-stone accent-forest"
                />
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Family</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">County</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Tier</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Children</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Logs</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Joined</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-clay/40">
                  {families.length === 0
                    ? 'No families registered yet.'
                    : 'No families match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((family) => {
                const tierBadge = TIER_BADGES[family.subscription_tier] || TIER_BADGES.free;
                const TierIcon = tierBadge.icon;
                const isSuspended = family.subscription_status === 'cancelled';
                return (
                  <tr key={family.id} className={`border-b border-stone hover:bg-parchment/30 transition-colors ${isSuspended ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(family.id)}
                        onChange={() => toggleSelect(family.id)}
                        className="h-3.5 w-3.5 rounded border-stone accent-forest"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-forest">{family.name}</p>
                        <p className="text-xs text-clay/40">{family.email || 'No email'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">{family.county || '\u2014'}</td>
                    <td className="px-4 py-3">
                      {editingTier === family.id ? (
                        <select
                          value={family.subscription_tier}
                          onChange={(e) => handleUpdateFamily(family.id, { subscription_tier: e.target.value })}
                          onBlur={() => setEditingTier(null)}
                          autoFocus
                          className="h-7 rounded border border-stone bg-parchment px-1.5 text-xs text-forest"
                        >
                          <option value="free">Free</option>
                          <option value="family">Family</option>
                          <option value="educator">Educator</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingTier(family.id)}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium ${tierBadge.bg} ${tierBadge.color} hover:ring-1 hover:ring-forest/20 transition-all`}
                          title="Click to change tier"
                        >
                          <TierIcon className="h-3 w-3" />
                          {tierBadge.label}
                          <ChevronDown className="h-2.5 w-2.5 opacity-40" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rust">
                          <Ban className="h-3 w-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-moss">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">{family.child_count}</td>
                    <td className="px-4 py-3 text-sm text-clay/60">{family.activity_log_count}</td>
                    <td className="px-4 py-3 text-xs text-clay/40">
                      {new Date(family.created_at).toLocaleDateString('en-IE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() =>
                            handleUpdateFamily(family.id, {
                              subscription_status: isSuspended ? 'active' : 'cancelled',
                            })
                          }
                          disabled={loading === family.id}
                          className={`rounded-lg p-1.5 text-xs transition-all ${
                            isSuspended
                              ? 'text-moss hover:bg-moss/10'
                              : 'text-rust/50 hover:bg-rust/10 hover:text-rust'
                          }`}
                          title={isSuspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {isSuspended ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(family.id)}
                          className="rounded-lg p-1.5 text-xs text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                          title="Delete family"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/users/${family.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-moss hover:bg-moss/10 transition-all"
                        >
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
