'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Download,
  Loader2,
  CheckSquare,
  Square,
  MoreHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  energy_level: string;
  mess_level: string;
  location: string;
  premium: boolean;
  screen_free: boolean;
  published: boolean;
  created_at: string;
}

export function AdminActivitiesClient({ initialActivities }: { initialActivities: Activity[] }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();

  const filtered = initialActivities.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (statusFilter === 'published' && !a.published) return false;
    if (statusFilter === 'draft' && a.published) return false;
    return true;
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }

  async function handleBulkAction(action: 'publish' | 'unpublish' | 'delete') {
    if (selectedIds.size === 0) return;

    if (action === 'delete') {
      if (!confirm(`Delete ${selectedIds.size} activities? This cannot be undone.`)) return;
    }

    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/activities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action }),
      });
      if (!res.ok) throw new Error('Bulk action failed');
      setSelectedIds(new Set());
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      alert('Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleTogglePublished(id: string, currentPublished: boolean) {
    try {
      const res = await fetch('/api/admin/activities/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !currentPublished }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      alert('Failed to toggle publish status');
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/activities?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      alert('Failed to delete activity');
    }
  }

  function handleExportCSV() {
    const headers = ['Title', 'Category', 'Age Min', 'Age Max', 'Duration', 'Location', 'Energy', 'Mess', 'Published', 'Premium', 'Created'];
    const rows = filtered.map((a) => [
      `"${a.title.replace(/"/g, '""')}"`,
      a.category,
      a.age_min,
      a.age_max,
      a.duration_minutes,
      a.location,
      a.energy_level,
      a.mess_level,
      a.published ? 'Yes' : 'No',
      a.premium ? 'Yes' : 'No',
      new Date(a.created_at).toLocaleDateString('en-IE'),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Activities
          </h1>
          <p className="text-clay/70 mt-1">
            {initialActivities.length} total · Manage your activity library.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <Link href="/admin/activities/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-3.5 w-3.5" />
            New activity
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 rounded-lg border-stone bg-parchment"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-stone bg-parchment px-3 text-sm"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-stone bg-parchment px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <span className="text-xs text-clay/40 ml-auto">
          {filtered.length} results
          {isPending && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
        </span>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="card-elevated p-3 flex items-center gap-3 border-l-4 border-l-forest">
          <span className="text-sm font-semibold text-forest">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={bulkLoading}
              className="rounded-lg bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss hover:bg-moss/20 transition-all disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Publish'}
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              disabled={bulkLoading}
              className="rounded-lg bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-all disabled:opacity-50"
            >
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={bulkLoading}
              className="rounded-lg bg-rust/10 px-3 py-1.5 text-xs font-semibold text-rust hover:bg-rust/20 transition-all disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-clay/50 hover:bg-linen transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone bg-parchment/30">
              <th className="px-3 py-3 text-left">
                <button onClick={toggleSelectAll} className="text-clay/30 hover:text-forest transition-colors">
                  {selectedIds.size === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Activity</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Age</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Duration</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-clay/40">
                  {initialActivities.length === 0
                    ? 'No activities in the database yet. Create your first one!'
                    : 'No activities match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((activity) => {
                const config = CATEGORY_CONFIG[activity.category];
                const isSelected = selectedIds.has(activity.id);
                return (
                  <tr
                    key={activity.id}
                    className={`border-b border-stone transition-colors ${
                      isSelected ? 'bg-forest/3' : 'hover:bg-parchment/30'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(activity.id)} className="text-clay/30 hover:text-forest transition-colors">
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-forest" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-forest">{activity.title}</p>
                        <p className="text-xs text-clay/40 truncate max-w-xs">{activity.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-medium ${config?.bg || 'bg-linen'} ${config?.color || 'text-clay/50'}`}>
                        {config?.label || activity.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">
                      {activity.age_min}–{activity.age_max}
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">
                      {activity.duration_minutes}m
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium ${
                        activity.published ? 'bg-moss/10 text-moss' : 'bg-gold/10 text-gold'
                      }`}>
                        {activity.published ? 'Published' : 'Draft'}
                      </span>
                      {activity.premium && (
                        <span className="ml-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold bg-amber/10 text-amber">
                          Premium
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/activities/${activity.id}/edit`}
                          className="rounded-lg p-1.5 hover:bg-linen transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 text-clay/40" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublished(activity.id, activity.published)}
                          className="rounded-lg p-1.5 hover:bg-linen transition-colors"
                          title={activity.published ? 'Unpublish' : 'Publish'}
                        >
                          {activity.published ? (
                            <EyeOff className="h-3.5 w-3.5 text-clay/40" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-clay/40" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id, activity.title)}
                          className="rounded-lg p-1.5 hover:bg-rust/5 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-clay/40 hover:text-rust" />
                        </button>
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
