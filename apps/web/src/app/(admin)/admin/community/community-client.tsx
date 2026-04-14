'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  MessageSquare,
  Calendar,
  Trash2,
  Shield,
  UserMinus,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Pin,
  PinOff,
  Star,
  StarOff,
  BarChart3,
  Flag,
  Eye,
  Ban,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────

interface Group {
  id: string;
  name: string;
  county: string | null;
  type: string;
  emoji: string | null;
  description: string | null;
  rules: string | null;
  featured: boolean;
  member_count: number;
  created_at: string;
}

interface Post {
  id: string;
  family_id: string;
  group_id: string;
  title: string;
  body: string;
  type: string;
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  group_name: string;
  family_name: string;
}

interface Membership {
  family_id: string;
  group_id: string;
  role: string;
  joined_at: string;
  group_name: string;
  family_name: string;
}

interface EventItem {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  capacity: number | null;
  rsvp_count: number;
  created_at: string;
  group_name: string;
}

interface Report {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reporter_family_id: string;
  reporter_name: string;
  reason: string;
  status: string;
  created_at: string;
  post: { title: string; body: string; type: string; group_id: string } | null;
  comment: { body: string } | null;
}

interface Analytics {
  totalGroups: number;
  totalPosts: number;
  totalMembers: number;
  postsThisWeek: number;
  activeGroupsThisWeek: number;
  postsPerDay: { date: string; count: number }[];
}

type Tab = 'groups' | 'moderation' | 'members' | 'posts' | 'events' | 'analytics';

const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford',
  'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon',
  'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath',
  'Wexford', 'Wicklow',
];

// ─── Helper Components ───────────────────────────────

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const colors = {
    default: 'bg-[#F2F5F0] text-[#5A6B5E]',
    success: 'bg-[#E8F5E9] text-[#4CAF7C]',
    warning: 'bg-[#FFF8E1] text-[#F59E0B]',
    danger: 'bg-[#FDE8E8] text-[#EF4444]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[variant]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5E9]">
          <Icon className="h-4 w-4 text-[#4CAF7C]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A9B8E]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#1A2E1E]">{value}</p>
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#1A2E1E]">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#F2F5F0] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, loading, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE8E8]">
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A2E1E]">{title}</h3>
            <p className="text-xs text-[#8A9B8E]">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-[#5A6B5E] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#5A6B5E] bg-[#F2F5F0] rounded-xl hover:bg-[#E8F0E8] transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#EF4444] rounded-xl hover:bg-[#DC2626] transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Table header cell
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A9B8E] ${className}`}>
      {children}
    </th>
  );
}

// Table data cell
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

// ─── Main Component ──────────────────────────────────

export function CommunityAdminClient() {
  const [activeTab, setActiveTab] = useState<Tab>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingReportCount, setPendingReportCount] = useState(0);

  // Modals
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string; extra?: Record<string, string> } | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Group form
  const [groupForm, setGroupForm] = useState({
    name: '', type: 'county' as string, county: '', emoji: '', description: '', rules: '', featured: false,
  });

  // Event form
  const [eventForm, setEventForm] = useState({
    title: '', description: '', group_id: '', location: '', date: '', capacity: '',
  });

  // ─── Data Fetching ─────────────────────────────────

  const fetchData = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'analytics') {
        const res = await fetch('/api/admin/community?entity=analytics');
        const data = await res.json();
        setAnalytics(data);
      } else if (tab === 'moderation') {
        const res = await fetch('/api/admin/community?entity=reports&status=pending');
        const data = await res.json();
        setReports(data);
      } else {
        const entity = tab === 'members' ? 'memberships' : tab;
        const res = await fetch(`/api/admin/community?entity=${entity}`);
        const data = await res.json();
        switch (tab) {
          case 'groups': setGroups(data); break;
          case 'posts': setPosts(data); break;
          case 'members': setMemberships(data); break;
          case 'events': setEvents(data); break;
        }
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending report count on mount and when switching tabs
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/community?entity=reports&status=pending');
      const data = await res.json();
      setPendingReportCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  // ─── Actions ───────────────────────────────────────

  const handleDelete = async (entity: string, id: string, extra?: Record<string, string>) => {
    setActionLoading(id || 'delete');
    try {
      const params = new URLSearchParams({ entity, id, ...extra });
      const res = await fetch(`/api/admin/community?${params}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      fetchData(activeTab);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (familyId: string, groupId: string, role: string) => {
    setActionLoading(`${familyId}:${groupId}`);
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'membership_role', id: '', family_id: familyId, group_id: groupId, role }),
      });
      if (!res.ok) throw new Error('Failed');
      setMemberships((prev) =>
        prev.map((m) => m.family_id === familyId && m.group_id === groupId ? { ...m, role } : m),
      );
    } catch (err) {
      console.error('Update role failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (group: Group) => {
    setActionLoading(group.id);
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'group', id: group.id, featured: !group.featured }),
      });
      if (!res.ok) throw new Error('Failed');
      setGroups((prev) => prev.map((g) => g.id === group.id ? { ...g, featured: !g.featured } : g));
    } catch (err) {
      console.error('Toggle featured failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePin = async (post: Post) => {
    setActionLoading(post.id);
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'post', id: post.id, pinned: !post.pinned }),
      });
      if (!res.ok) throw new Error('Failed');
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, pinned: !p.pinned } : p));
    } catch (err) {
      console.error('Toggle pin failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGroup = async () => {
    setActionLoading('create-group');
    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'group', ...groupForm }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowGroupForm(false);
      setGroupForm({ name: '', type: 'county', county: '', emoji: '', description: '', rules: '', featured: false });
      fetchData('groups');
    } catch (err) {
      console.error('Create group failed:', err);
      alert('Failed to create group');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup) return;
    setActionLoading('edit-group');
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'group',
          id: editingGroup.id,
          name: groupForm.name,
          type: groupForm.type,
          county: groupForm.county || null,
          emoji: groupForm.emoji || null,
          description: groupForm.description || null,
          rules: groupForm.rules || null,
          featured: groupForm.featured,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setEditingGroup(null);
      setGroupForm({ name: '', type: 'county', county: '', emoji: '', description: '', rules: '', featured: false });
      fetchData('groups');
    } catch (err) {
      console.error('Edit group failed:', err);
      alert('Failed to update group');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateEvent = async () => {
    setActionLoading('create-event');
    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'event', ...eventForm }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowEventForm(false);
      setEventForm({ title: '', description: '', group_id: '', location: '', date: '', capacity: '' });
      fetchData('events');
    } catch (err) {
      console.error('Create event failed:', err);
      alert('Failed to create event');
    } finally {
      setActionLoading(null);
    }
  };

  // Report actions
  const handleDismissReport = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'report', id: reportId, status: 'dismissed' }),
      });
      if (!res.ok) throw new Error('Failed');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setPendingReportCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Dismiss report failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContent = async (report: Report) => {
    setActionLoading(report.id);
    try {
      // Delete the content
      if (report.post_id) {
        await fetch(`/api/admin/community?entity=post&id=${report.post_id}`, { method: 'DELETE' });
      } else if (report.comment_id) {
        await fetch(`/api/admin/community?entity=comment&id=${report.comment_id}`, { method: 'DELETE' });
      }
      // Mark report as actioned
      await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'report', id: report.id, status: 'actioned' }),
      });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setPendingReportCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Remove content failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanAndRemove = async (report: Report) => {
    setActionLoading(report.id);
    try {
      // Delete the content
      if (report.post_id) {
        await fetch(`/api/admin/community?entity=post&id=${report.post_id}`, { method: 'DELETE' });
      } else if (report.comment_id) {
        await fetch(`/api/admin/community?entity=comment&id=${report.comment_id}`, { method: 'DELETE' });
      }
      // Mark report as actioned
      await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'report', id: report.id, status: 'actioned' }),
      });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setPendingReportCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Ban and remove failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditGroup = (group: Group) => {
    setGroupForm({
      name: group.name,
      type: group.type,
      county: group.county || '',
      emoji: group.emoji || '',
      description: group.description || '',
      rules: group.rules || '',
      featured: group.featured || false,
    });
    setEditingGroup(group);
  };

  // ─── Tab Config ────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = useMemo(() => [
    { key: 'groups', label: 'Groups', icon: Users },
    { key: 'moderation', label: 'Moderation', icon: Flag, badge: pendingReportCount },
    { key: 'members', label: 'Members', icon: Shield },
    { key: 'posts', label: 'Posts', icon: MessageSquare },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ], [pendingReportCount]);

  // ─── Filtered Data ─────────────────────────────────

  const filteredGroups = groups.filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPosts = posts.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));
  const filteredMembers = memberships.filter((m) =>
    !search || m.family_name.toLowerCase().includes(search.toLowerCase()) || m.group_name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredEvents = events.filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()));

  // ─── Render ────────────────────────────────────────

  const inputClass = 'h-9 w-full rounded-xl border border-[#E0E5DD] bg-[#F8FAF7] px-3 text-sm text-[#1A2E1E] placeholder:text-[#8A9B8E] focus:border-[#4CAF7C] focus:outline-none focus:ring-1 focus:ring-[#4CAF7C]';
  const labelClass = 'block text-xs font-semibold text-[#5A6B5E] mb-1.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E1E] tracking-tight">Community</h1>
          <p className="text-[#5A6B5E] mt-1 text-sm">Manage groups, moderation, members, posts, events, and analytics.</p>
        </div>
        <button
          onClick={() => fetchData(activeTab)}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-[#5A6B5E] bg-white rounded-xl px-4 py-2 shadow-sm hover:bg-[#F2F5F0] transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E0E5DD] pb-px overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(''); }}
            className={`relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-white border border-[#E0E5DD] border-b-white text-[#1A2E1E] -mb-px shadow-sm'
                : 'text-[#8A9B8E] hover:text-[#5A6B5E]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-bold text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search (not shown on analytics or moderation tabs) */}
      {activeTab !== 'analytics' && activeTab !== 'moderation' && (
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9B8E]" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 rounded-xl border-[#E0E5DD] bg-white shadow-sm"
            />
          </div>
          {activeTab === 'groups' && (
            <button
              onClick={() => {
                setGroupForm({ name: '', type: 'county', county: '', emoji: '', description: '', rules: '', featured: false });
                setShowGroupForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#4CAF7C] rounded-xl hover:bg-[#3D9B6A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </button>
          )}
          {activeTab === 'events' && (
            <button
              onClick={() => {
                setEventForm({ title: '', description: '', group_id: '', location: '', date: '', capacity: '' });
                setShowEventForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#4CAF7C] rounded-xl hover:bg-[#3D9B6A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDelete(deleteConfirm.type, deleteConfirm.id, deleteConfirm.extra);
        }}
        loading={actionLoading === (deleteConfirm?.id || 'delete')}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
      />

      {/* Create Group Modal */}
      <Modal
        open={showGroupForm}
        onClose={() => setShowGroupForm(false)}
        title="Create Group"
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={groupForm.name} onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))} placeholder="Group name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={groupForm.type} onChange={(e) => setGroupForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="county">County</option>
                <option value="interest">Interest</option>
                <option value="coop">Co-op</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Emoji</label>
              <input className={inputClass} value={groupForm.emoji} onChange={(e) => setGroupForm((f) => ({ ...f, emoji: e.target.value }))} placeholder="e.g. &#127793;" />
            </div>
          </div>
          <div>
            <label className={labelClass}>County</label>
            <select className={inputClass} value={groupForm.county} onChange={(e) => setGroupForm((f) => ({ ...f, county: e.target.value }))}>
              <option value="">-- Select --</option>
              {IRISH_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={groupForm.description} onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          </div>
          <div>
            <label className={labelClass}>Rules</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={groupForm.rules} onChange={(e) => setGroupForm((f) => ({ ...f, rules: e.target.value }))} placeholder="Community rules" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={groupForm.featured} onChange={(e) => setGroupForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 rounded border-[#E0E5DD] text-[#4CAF7C] focus:ring-[#4CAF7C]" />
            <span className="text-sm text-[#5A6B5E]">Featured group</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowGroupForm(false)} className="px-4 py-2 text-sm font-medium text-[#5A6B5E] bg-[#F2F5F0] rounded-xl hover:bg-[#E8F0E8] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={!groupForm.name || actionLoading === 'create-group'}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#4CAF7C] rounded-xl hover:bg-[#3D9B6A] transition-colors disabled:opacity-50"
            >
              {actionLoading === 'create-group' ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        open={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title="Edit Group"
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={groupForm.name} onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={groupForm.type} onChange={(e) => setGroupForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="county">County</option>
                <option value="interest">Interest</option>
                <option value="coop">Co-op</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Emoji</label>
              <input className={inputClass} value={groupForm.emoji} onChange={(e) => setGroupForm((f) => ({ ...f, emoji: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>County</label>
            <select className={inputClass} value={groupForm.county} onChange={(e) => setGroupForm((f) => ({ ...f, county: e.target.value }))}>
              <option value="">-- Select --</option>
              {IRISH_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={groupForm.description} onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Rules</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={groupForm.rules} onChange={(e) => setGroupForm((f) => ({ ...f, rules: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={groupForm.featured} onChange={(e) => setGroupForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 rounded border-[#E0E5DD] text-[#4CAF7C] focus:ring-[#4CAF7C]" />
            <span className="text-sm text-[#5A6B5E]">Featured group</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditingGroup(null)} className="px-4 py-2 text-sm font-medium text-[#5A6B5E] bg-[#F2F5F0] rounded-xl hover:bg-[#E8F0E8] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleEditGroup}
              disabled={!groupForm.name || actionLoading === 'edit-group'}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#4CAF7C] rounded-xl hover:bg-[#3D9B6A] transition-colors disabled:opacity-50"
            >
              {actionLoading === 'edit-group' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        title="Create Event"
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event title" />
          </div>
          <div>
            <label className={labelClass}>Group *</label>
            <select className={inputClass} value={eventForm.group_id} onChange={(e) => setEventForm((f) => ({ ...f, group_id: e.target.value }))}>
              <option value="">-- Select group --</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.emoji ? `${g.emoji} ` : ''}{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} placeholder="Event description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={eventForm.location} onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location" />
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input className={inputClass} type="number" value={eventForm.capacity} onChange={(e) => setEventForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="e.g. 30" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Date *</label>
            <input className={inputClass} type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowEventForm(false)} className="px-4 py-2 text-sm font-medium text-[#5A6B5E] bg-[#F2F5F0] rounded-xl hover:bg-[#E8F0E8] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={!eventForm.title || !eventForm.group_id || !eventForm.date || actionLoading === 'create-event'}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#4CAF7C] rounded-xl hover:bg-[#3D9B6A] transition-colors disabled:opacity-50"
            >
              {actionLoading === 'create-event' ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-5 w-5 animate-spin text-[#8A9B8E]" />
        </div>
      ) : (
        <>
          {/* ═══ Groups Tab ═══ */}
          {activeTab === 'groups' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E5DD] bg-[#F8FAF7]">
                    <Th>Group</Th>
                    <Th>Type</Th>
                    <Th>County</Th>
                    <Th>Members</Th>
                    <Th>Featured</Th>
                    <Th>Created</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="border-b border-[#F2F5F0] hover:bg-[#F8FAF7] transition-colors">
                      <Td>
                        <div className="flex items-center gap-2">
                          {group.emoji && <span className="text-base">{group.emoji}</span>}
                          <span className="text-sm font-semibold text-[#1A2E1E]">{group.name}</span>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant={group.type === 'coop' ? 'success' : group.type === 'interest' ? 'warning' : 'default'}>
                          {group.type}
                        </Badge>
                      </Td>
                      <Td className="text-sm text-[#5A6B5E]">{group.county || '-'}</Td>
                      <Td className="text-sm text-[#5A6B5E]">{group.member_count}</Td>
                      <Td>
                        {group.featured ? (
                          <Badge variant="success">Featured</Badge>
                        ) : (
                          <span className="text-xs text-[#8A9B8E]">-</span>
                        )}
                      </Td>
                      <Td className="text-xs text-[#8A9B8E]">
                        {new Date(group.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleFeatured(group)}
                            disabled={actionLoading === group.id}
                            className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#E8F5E9] hover:text-[#4CAF7C] transition-all"
                            title={group.featured ? 'Remove featured' : 'Set featured'}
                          >
                            {group.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => openEditGroup(group)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-[#5A6B5E] hover:bg-[#F2F5F0] transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'group', id: group.id, name: group.name })}
                            className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#FDE8E8] hover:text-[#EF4444] transition-all"
                            title="Delete group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {filteredGroups.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#8A9B8E]">
                        No community groups found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ Moderation Queue Tab ═══ */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                  <CheckCircle className="h-10 w-10 text-[#4CAF7C] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#1A2E1E]">All clear</p>
                  <p className="text-xs text-[#8A9B8E] mt-1">No pending reports to review.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Content preview */}
                        <div className="mb-3">
                          {report.post ? (
                            <div className="rounded-xl bg-[#F8FAF7] p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge>{report.post.type}</Badge>
                                <span className="text-xs text-[#8A9B8E]">Post</span>
                              </div>
                              <p className="text-sm font-semibold text-[#1A2E1E] truncate">{report.post.title}</p>
                              <p className="text-xs text-[#5A6B5E] mt-0.5 line-clamp-2">{report.post.body}</p>
                            </div>
                          ) : report.comment ? (
                            <div className="rounded-xl bg-[#F8FAF7] p-3">
                              <span className="text-xs text-[#8A9B8E]">Comment</span>
                              <p className="text-sm text-[#1A2E1E] mt-0.5 line-clamp-2">{report.comment.body}</p>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-[#F8FAF7] p-3">
                              <span className="text-xs text-[#8A9B8E]">Content removed or unavailable</span>
                            </div>
                          )}
                        </div>
                        {/* Report metadata */}
                        <div className="flex items-center gap-3 text-xs text-[#8A9B8E]">
                          <span>Reported by <span className="font-medium text-[#5A6B5E]">{report.reporter_name}</span></span>
                          <span>-</span>
                          <span>{new Date(report.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-xs text-[#5A6B5E]"><span className="font-semibold">Reason:</span> {report.reason}</p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleDismissReport(report.id)}
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5A6B5E] bg-[#F2F5F0] rounded-lg hover:bg-[#E8F0E8] transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleRemoveContent(report)}
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#EF4444] rounded-lg hover:bg-[#DC2626] transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                        <button
                          onClick={() => handleBanAndRemove(report)}
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors"
                        >
                          <Ban className="h-3 w-3" />
                          Ban + Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ═══ Members Tab ═══ */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E5DD] bg-[#F8FAF7]">
                    <Th>Family</Th>
                    <Th>Group</Th>
                    <Th>Role</Th>
                    <Th>Joined</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => {
                    const key = `${m.family_id}:${m.group_id}`;
                    return (
                      <tr key={key} className="border-b border-[#F2F5F0] hover:bg-[#F8FAF7] transition-colors">
                        <Td className="text-sm font-semibold text-[#1A2E1E]">{m.family_name}</Td>
                        <Td className="text-sm text-[#5A6B5E]">{m.group_name}</Td>
                        <Td>
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.family_id, m.group_id, e.target.value)}
                            disabled={actionLoading === key}
                            className="h-7 rounded-lg border border-[#E0E5DD] bg-[#F8FAF7] px-2 text-xs font-medium text-[#1A2E1E] focus:border-[#4CAF7C] focus:outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </Td>
                        <Td className="text-xs text-[#8A9B8E]">
                          {new Date(m.joined_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Td>
                        <Td className="text-right">
                          <button
                            onClick={() => setDeleteConfirm({
                              type: 'membership',
                              id: '',
                              name: `${m.family_name} from ${m.group_name}`,
                              extra: { familyId: m.family_id, groupId: m.group_id },
                            })}
                            disabled={actionLoading === key}
                            className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#FDE8E8] hover:text-[#EF4444] transition-all"
                            title="Remove from group"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#8A9B8E]">
                        No memberships found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ Posts Tab ═══ */}
          {activeTab === 'posts' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E5DD] bg-[#F8FAF7]">
                    <Th>Title</Th>
                    <Th>Type</Th>
                    <Th>Group</Th>
                    <Th>Author</Th>
                    <Th>Date</Th>
                    <Th>Likes</Th>
                    <Th>Comments</Th>
                    <Th>Pinned</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b border-[#F2F5F0] hover:bg-[#F8FAF7] transition-colors">
                      <Td>
                        <p className="text-sm font-semibold text-[#1A2E1E] truncate max-w-[200px]">{post.title}</p>
                        <p className="text-xs text-[#8A9B8E] truncate max-w-[200px]">{post.body}</p>
                      </Td>
                      <Td>
                        <Badge variant={post.type === 'question' ? 'warning' : post.type === 'resource' ? 'success' : 'default'}>
                          {post.type}
                        </Badge>
                      </Td>
                      <Td className="text-sm text-[#5A6B5E]">{post.group_name}</Td>
                      <Td className="text-sm text-[#5A6B5E]">{post.family_name}</Td>
                      <Td className="text-xs text-[#8A9B8E]">
                        {new Date(post.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                      </Td>
                      <Td className="text-sm text-[#5A6B5E]">{post.likes_count || 0}</Td>
                      <Td className="text-sm text-[#5A6B5E]">{post.comments_count || 0}</Td>
                      <Td>
                        {post.pinned ? (
                          <Badge variant="success">Pinned</Badge>
                        ) : (
                          <span className="text-xs text-[#8A9B8E]">-</span>
                        )}
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePin(post)}
                            disabled={actionLoading === post.id}
                            className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#E8F5E9] hover:text-[#4CAF7C] transition-all"
                            title={post.pinned ? 'Unpin' : 'Pin'}
                          >
                            {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'post', id: post.id, name: post.title })}
                            className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#FDE8E8] hover:text-[#EF4444] transition-all"
                            title="Delete post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {filteredPosts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#8A9B8E]">
                        No community posts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ Events Tab ═══ */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E5DD] bg-[#F8FAF7]">
                    <Th>Title</Th>
                    <Th>Group</Th>
                    <Th>Location</Th>
                    <Th>Date</Th>
                    <Th>RSVPs</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-[#F2F5F0] hover:bg-[#F8FAF7] transition-colors">
                      <Td>
                        <p className="text-sm font-semibold text-[#1A2E1E]">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-[#8A9B8E] truncate max-w-[200px]">{event.description}</p>
                        )}
                      </Td>
                      <Td className="text-sm text-[#5A6B5E]">{event.group_name}</Td>
                      <Td>
                        <div className="flex items-center gap-1 text-sm text-[#5A6B5E]">
                          <MapPin className="h-3 w-3 text-[#8A9B8E]" />
                          {event.location || '-'}
                        </div>
                      </Td>
                      <Td className="text-xs text-[#8A9B8E]">
                        {new Date(event.date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Td>
                      <Td className="text-sm text-[#5A6B5E]">
                        {event.rsvp_count}{event.capacity ? `/${event.capacity}` : ''}
                      </Td>
                      <Td className="text-right">
                        <button
                          onClick={() => setDeleteConfirm({ type: 'event', id: event.id, name: event.title })}
                          className="rounded-lg p-1.5 text-[#8A9B8E] hover:bg-[#FDE8E8] hover:text-[#EF4444] transition-all"
                          title="Delete event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#8A9B8E]">
                        No community events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ Analytics Tab ═══ */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total Groups" value={analytics.totalGroups} icon={Users} />
                <StatCard label="Total Posts" value={analytics.totalPosts} icon={MessageSquare} />
                <StatCard label="Total Members" value={analytics.totalMembers} icon={Shield} />
                <StatCard label="Posts This Week" value={analytics.postsThisWeek} icon={BarChart3} />
                <StatCard label="Active Groups (7d)" value={analytics.activeGroupsThisWeek} icon={Calendar} />
              </div>

              {/* Posts Per Day Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Posts Per Day (Last 30 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.postsPerDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4CAF7C" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#4CAF7C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5DD" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#8A9B8E' }}
                        tickFormatter={(val: string) => {
                          const d = new Date(val);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#8A9B8E' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: '#1C3520',
                          border: 'none',
                          borderRadius: 12,
                          color: '#F2F5F0',
                          fontSize: 12,
                        }}
                        labelFormatter={(val) => { try { return new Date(String(val)).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' }); } catch { return String(val); } }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4CAF7C"
                        strokeWidth={2}
                        fill="url(#postsGradient)"
                        name="Posts"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
