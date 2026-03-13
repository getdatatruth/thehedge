'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  county: string | null;
  type: string;
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

type Tab = 'groups' | 'posts' | 'members' | 'events';

export function CommunityClient() {
  const [activeTab, setActiveTab] = useState<Tab>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  const fetchData = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/community?entity=${tab === 'members' ? 'memberships' : tab}`);
      const data = await res.json();
      switch (tab) {
        case 'groups': setGroups(data); break;
        case 'posts': setPosts(data); break;
        case 'members': setMemberships(data); break;
        case 'events': setEvents(data); break;
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleDelete = async (entity: string, id: string, extra?: Record<string, string>) => {
    setActionLoading(id);
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
        body: JSON.stringify({
          entity: 'membership_role',
          id: '',
          family_id: familyId,
          group_id: groupId,
          role,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setMemberships((prev) =>
        prev.map((m) =>
          m.family_id === familyId && m.group_id === groupId ? { ...m, role } : m,
        ),
      );
    } catch (err) {
      console.error('Update role failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'groups', label: 'Groups', icon: Users },
    { key: 'posts', label: 'Posts', icon: MessageSquare },
    { key: 'members', label: 'Members', icon: Shield },
    { key: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Community
          </h1>
          <p className="text-clay/70 mt-1 font-serif">
            Manage groups, posts, members, and events.
          </p>
        </div>
        <button
          onClick={() => fetchData(activeTab)}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone pb-px">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(''); }}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-linen border border-stone border-b-linen text-forest -mb-px'
                : 'text-clay/50 hover:text-clay/70'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-9 rounded-lg border-stone bg-parchment"
        />
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="card-elevated p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rust/10">
                <AlertTriangle className="h-5 w-5 text-rust" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-forest">Confirm Delete</h3>
                <p className="text-xs text-clay/50">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-clay/70 mb-6">
              Delete <strong className="text-forest">{deleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-sm py-2 px-4">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                disabled={actionLoading === deleteConfirm.id}
                className="btn-terra text-sm py-2 px-4"
              >
                {actionLoading === deleteConfirm.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-5 w-5 animate-spin text-clay/30" />
        </div>
      ) : (
        <>
          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone bg-parchment/30">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">County</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Members</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Created</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups
                    .filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()))
                    .map((group) => (
                      <tr key={group.id} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-forest">{group.name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-linen text-clay/60 capitalize">
                            {group.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-clay/60">{group.county || '\u2014'}</td>
                        <td className="px-4 py-3 text-sm text-clay/60">{group.member_count}</td>
                        <td className="px-4 py-3 text-xs text-clay/40">
                          {new Date(group.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ type: 'group', id: group.id, name: group.name })}
                            className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                            title="Delete group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {groups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-clay/40">
                        No community groups yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone bg-parchment/30">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Title</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Group</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Family</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Date</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()))
                    .map((post) => (
                      <tr key={post.id} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-forest truncate max-w-[200px]">{post.title}</p>
                          <p className="text-xs text-clay/40 truncate max-w-[200px]">{post.body}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-linen text-clay/60 capitalize">
                            {post.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-clay/60">{post.group_name}</td>
                        <td className="px-4 py-3 text-sm text-clay/60">{post.family_name}</td>
                        <td className="px-4 py-3 text-xs text-clay/40">
                          {new Date(post.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ type: 'post', id: post.id, name: post.title })}
                            className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                            title="Delete post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-clay/40">
                        No community posts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone bg-parchment/30">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Family</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Group</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Role</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Joined</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships
                    .filter((m) => !search || m.family_name.toLowerCase().includes(search.toLowerCase()) || m.group_name.toLowerCase().includes(search.toLowerCase()))
                    .map((m) => {
                      const key = `${m.family_id}:${m.group_id}`;
                      return (
                        <tr key={key} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-forest">{m.family_name}</td>
                          <td className="px-4 py-3 text-sm text-clay/60">{m.group_name}</td>
                          <td className="px-4 py-3">
                            <select
                              value={m.role}
                              onChange={(e) => handleUpdateRole(m.family_id, m.group_id, e.target.value)}
                              disabled={actionLoading === key}
                              className="h-7 rounded border border-stone bg-parchment px-1.5 text-xs text-forest"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-clay/40">
                            {new Date(m.joined_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete('membership', '', { familyId: m.family_id, groupId: m.group_id })}
                              disabled={actionLoading === key}
                              className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                              title="Remove from group"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {memberships.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-clay/40">
                        No community memberships yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone bg-parchment/30">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Title</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Group</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Location</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Date</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">RSVPs</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()))
                    .map((event) => (
                      <tr key={event.id} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-forest">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-clay/40 truncate max-w-[200px]">{event.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-clay/60">{event.group_name}</td>
                        <td className="px-4 py-3 text-sm text-clay/60">{event.location || '\u2014'}</td>
                        <td className="px-4 py-3 text-xs text-clay/40">
                          {new Date(event.date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-clay/60">
                          {event.rsvp_count}{event.capacity ? `/${event.capacity}` : ''}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ type: 'event', id: event.id, name: event.title })}
                            className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                            title="Delete event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-clay/40">
                        No community events yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
