'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Calendar,
  MessageCircle,
  ChevronRight,
  Search,
  Plus,
  BookOpen,
  LogOut,
  Loader2,
  X,
  Rss,
  Globe,
  HelpCircle,
  LinkIcon,
  Megaphone,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// ─── Types ──────────────────────────────────────────────

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

interface CommunityEvent {
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

interface CommunityClientProps {
  groups: Group[];
  posts: Post[];
  events: CommunityEvent[];
  memberGroupIds: string[];
  familyCounty: string | null;
  familyId: string;
}

// ─── Helpers ────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString('en-IE', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-IE', { hour: 'numeric', minute: '2-digit' });
  const weekday = date.toLocaleDateString('en-IE', { weekday: 'short' });
  return { month, day: String(day), time, weekday };
}

const GROUP_EMOJI: Record<string, string> = {
  county: '\uD83C\uDFE0',
  interest: '\uD83C\uDF3F',
  coop: '\uD83D\uDC76',
};

const POST_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  discussion: { icon: MessageCircle, label: 'Discussion', color: 'text-moss bg-sage/10' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-amber bg-amber/10' },
  resource: { icon: LinkIcon, label: 'Resource', color: 'text-sky bg-sky/10' },
  event: { icon: Megaphone, label: 'Event', color: 'text-terracotta bg-terracotta/10' },
};

type Tab = 'feed' | 'groups' | 'events';

// ─── Component ──────────────────────────────────────────

export function CommunityClient({
  groups,
  posts,
  events,
  memberGroupIds: initialMemberGroupIds,
  familyCounty,
  familyId,
}: CommunityClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [memberGroupIds, setMemberGroupIds] = useState<string[]>(initialMemberGroupIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);
  const [rsvpingEventId, setRsvpingEventId] = useState<string | null>(null);
  const [rsvpdEventIds, setRsvpdEventIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [postTypeFilter, setPostTypeFilter] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(null);

  // Create post state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostGroupId, setNewPostGroupId] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('discussion');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Create group state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCounty, setNewGroupCounty] = useState(familyCounty || '');
  const [newGroupType, setNewGroupType] = useState('county');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const myGroups = groups.filter((g) => memberGroupIds.includes(g.id));
  const discoverGroups = groups.filter((g) => !memberGroupIds.includes(g.id));

  const filteredDiscover = useMemo(() => {
    const filtered = searchQuery
      ? discoverGroups.filter(
          (g) =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.county && g.county.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : discoverGroups.sort((a, b) => {
          const aMatch = a.county === familyCounty ? 0 : 1;
          const bMatch = b.county === familyCounty ? 0 : 1;
          return aMatch - bMatch;
        });
    return filtered;
  }, [discoverGroups, searchQuery, familyCounty]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (postTypeFilter) {
      result = result.filter((p) => p.type === postTypeFilter);
    }
    if (selectedGroupFilter) {
      result = result.filter((p) => p.group_id === selectedGroupFilter);
    }
    if (searchQuery && activeTab === 'feed') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.family_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, postTypeFilter, selectedGroupFilter, searchQuery, activeTab]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery || activeTab !== 'events') return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.group_name.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q))
    );
  }, [events, searchQuery, activeTab]);

  async function handleJoinGroup(groupId: string) {
    setLoadingGroupId(groupId);
    try {
      const res = await fetch('/api/community/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId }),
      });
      if (res.ok) {
        setMemberGroupIds((prev) => [...prev, groupId]);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Failed to join group:', err);
    } finally {
      setLoadingGroupId(null);
    }
  }

  async function handleLeaveGroup(groupId: string) {
    setLoadingGroupId(groupId);
    try {
      const res = await fetch('/api/community/groups/join', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId }),
      });
      if (res.ok) {
        setMemberGroupIds((prev) => prev.filter((id) => id !== groupId));
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
    } finally {
      setLoadingGroupId(null);
    }
  }

  async function handleRsvp(eventId: string) {
    if (rsvpdEventIds.has(eventId)) return;
    setRsvpingEventId(eventId);
    try {
      const res = await fetch('/api/community/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      if (res.ok) {
        setRsvpdEventIds((prev) => new Set(prev).add(eventId));
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Failed to RSVP:', err);
    } finally {
      setRsvpingEventId(null);
    }
  }

  async function handleCreatePost() {
    if (!newPostGroupId || !newPostTitle || !newPostContent) return;
    setIsCreatingPost(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: newPostGroupId,
          title: newPostTitle,
          content: newPostContent,
          type: newPostType,
        }),
      });
      if (res.ok) {
        setShowCreatePost(false);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostType('discussion');
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsCreatingPost(false);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName) return;
    setIsCreatingGroup(true);
    try {
      const res = await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          county: newGroupCounty || null,
          type: newGroupType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.group?.id) {
          setMemberGroupIds((prev) => [...prev, data.group.id]);
        }
        setShowCreateGroup(false);
        setNewGroupName('');
        setNewGroupCounty(familyCounty || '');
        setNewGroupType('county');
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setIsCreatingGroup(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'feed', label: 'Feed', icon: Rss, count: posts.length },
    { id: 'groups', label: 'Groups', icon: Users, count: myGroups.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-3">Connect</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
            <em className="text-moss italic">Community</em>
          </h1>
          <p className="text-clay mt-2 font-serif text-base">
            Connect with local families and share your journey.
          </p>
        </div>
        <div className="flex gap-2">
          {myGroups.length > 0 && (
            <button
              onClick={() => {
                setShowCreatePost(true);
                setActiveTab('feed');
                if (!newPostGroupId && myGroups.length > 0) {
                  setNewPostGroupId(myGroups[0].id);
                }
              }}
              className="btn-terra text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              activeTab === id
                ? 'border-terracotta text-ink'
                : 'border-transparent text-clay/50 hover:text-clay'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span className={`tag ${activeTab === id ? 'tag-terra' : 'bg-stone/30 text-clay'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
        <Input
          placeholder={
            activeTab === 'feed'
              ? 'Search posts...'
              : activeTab === 'groups'
                ? 'Search groups...'
                : 'Search events...'
          }
          className="h-11 pl-10 rounded-[4px] border-stone bg-linen shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          FEED TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Post type filter chips */}
          {posts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mr-1">Filter:</span>
              <button
                onClick={() => { setPostTypeFilter(null); setSelectedGroupFilter(null); }}
                className={`rounded-[3px] px-3 py-1.5 text-[11px] font-bold transition-all ${
                  !postTypeFilter && !selectedGroupFilter
                    ? 'bg-forest text-parchment'
                    : 'bg-linen text-clay border border-stone hover:border-moss/30'
                }`}
              >
                All
              </button>
              {Object.entries(POST_TYPE_CONFIG).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setPostTypeFilter(postTypeFilter === key ? null : key)}
                  className={`rounded-[3px] px-3 py-1.5 text-[11px] font-bold transition-all ${
                    postTypeFilter === key
                      ? 'bg-forest text-parchment'
                      : 'bg-linen text-clay border border-stone hover:border-moss/30'
                  }`}
                >
                  {label}
                </button>
              ))}
              {myGroups.length > 1 && (
                <>
                  <span className="text-stone mx-1">|</span>
                  {myGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroupFilter(selectedGroupFilter === g.id ? null : g.id)}
                      className={`rounded-[3px] px-3 py-1.5 text-[11px] font-bold transition-all ${
                        selectedGroupFilter === g.id
                          ? 'bg-forest text-parchment'
                          : 'bg-linen text-clay border border-stone hover:border-moss/30'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Create post form */}
          {showCreatePost && (
            <div className="card-elevated p-6 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Create a post</p>
                <button onClick={() => setShowCreatePost(false)} className="text-clay/30 hover:text-clay transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <select
                  value={newPostGroupId}
                  onChange={(e) => setNewPostGroupId(e.target.value)}
                  className="w-full h-10 rounded-[4px] border border-stone bg-linen px-3 text-sm text-ink"
                >
                  <option value="">Select a group</option>
                  {myGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {['discussion', 'question', 'resource', 'event'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewPostType(t)}
                      className={`text-xs px-3 py-1.5 rounded-[4px] border capitalize transition-colors ${
                        newPostType === t
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-stone text-clay/50 hover:border-clay/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Title"
                  className="h-10 rounded-[4px] border-stone bg-linen"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                  placeholder="What's on your mind?"
                  className="w-full h-24 rounded-[4px] border border-stone bg-linen px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-forest/20"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostGroupId || !newPostTitle || !newPostContent || isCreatingPost}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingPost && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {filteredPosts.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-stone bg-linen/50">
              <div className="text-center px-6">
                {myGroups.length === 0 ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10 mx-auto mb-4">
                      <Users className="h-7 w-7 text-sage" />
                    </div>
                    <p className="font-display text-xl font-light text-ink mb-2">Join your first group</p>
                    <p className="text-sm text-clay font-serif max-w-xs mx-auto mb-4">
                      Connect with families in your area. Browse the Groups tab to find communities near you.
                    </p>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      Browse Groups
                    </button>
                  </>
                ) : postTypeFilter || selectedGroupFilter ? (
                  <>
                    <Search className="mx-auto mb-3 h-8 w-8 text-stone" />
                    <p className="font-medium text-umber">No posts match your filters</p>
                    <p className="text-sm text-clay/50 mt-1 font-serif">Try removing some filters.</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 mx-auto mb-4">
                      <MessageCircle className="h-7 w-7 text-terracotta" />
                    </div>
                    <p className="font-display text-xl font-light text-ink mb-2">Start the conversation</p>
                    <p className="text-sm text-clay font-serif max-w-xs mx-auto mb-4">
                      Your groups are quiet right now. Be the first to share something.
                    </p>
                    <button
                      onClick={() => {
                        setShowCreatePost(true);
                        if (!newPostGroupId && myGroups.length > 0) {
                          setNewPostGroupId(myGroups[0].id);
                        }
                      }}
                      className="btn-terra text-xs py-2 px-4"
                    >
                      Write a Post
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {filteredPosts.map((post) => {
                const typeConfig = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.discussion;
                const TypeIcon = typeConfig.icon;

                return (
                  <div key={post.id} className="card-elevated p-5 hover:border-moss/25 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/8">
                        <span className="text-[11px] font-bold text-forest">
                          {post.family_name[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-ink">{post.family_name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-clay/40">{post.group_name}</span>
                          <span className="text-clay/20">&middot;</span>
                          <span className="text-[11px] text-clay/40">{timeAgo(post.created_at)}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 tag ${typeConfig.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.label}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-medium text-ink mb-1.5">{post.title}</h3>
                    <p className="text-[13px] text-umber font-serif leading-relaxed line-clamp-3">{post.body}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone/50">
                      <button className="inline-flex items-center gap-1.5 text-[11px] text-clay/40 hover:text-moss transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Reply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          GROUPS TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'groups' && (
        <div className="space-y-8">
          {/* Your groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                Your groups ({myGroups.length})
              </p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                Create group
              </button>
            </div>

            {myGroups.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-[14px] border border-dashed border-stone bg-linen/50">
                <div className="text-center px-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10 mx-auto mb-4">
                    <Users className="h-7 w-7 text-sage" />
                  </div>
                  <p className="font-display text-lg font-light text-ink mb-1">No groups yet</p>
                  <p className="text-sm text-clay font-serif max-w-xs mx-auto">
                    Join a group below or create your own to start connecting with families.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                {myGroups.map((group) => (
                  <div key={group.id} className="card-interactive p-4 flex items-center gap-3">
                    <span className="text-2xl">{GROUP_EMOJI[group.type] || '\uD83C\uDFE0'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{group.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-clay/50 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                        </span>
                        {group.county && (
                          <>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-clay/50 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {group.county}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLeaveGroup(group.id); }}
                      disabled={loadingGroupId === group.id}
                      className="text-clay/30 hover:text-terracotta transition-colors p-1.5 rounded-md hover:bg-terracotta/5"
                      title="Leave group"
                    >
                      {loadingGroupId === group.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create group form */}
          {showCreateGroup && (
            <div className="card-elevated p-6 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Create a new group</p>
                <button onClick={() => setShowCreateGroup(false)} className="text-clay/30 hover:text-clay transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Group name"
                  className="h-10 rounded-[4px] border-stone bg-linen"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Input
                  placeholder="County (optional)"
                  className="h-10 rounded-[4px] border-stone bg-linen"
                  value={newGroupCounty}
                  onChange={(e) => setNewGroupCounty(e.target.value)}
                />
                <div className="flex gap-2">
                  {[
                    { value: 'county', label: 'County' },
                    { value: 'interest', label: 'Interest' },
                    { value: 'coop', label: 'Co-op' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setNewGroupType(value)}
                      className={`text-xs px-3 py-1.5 rounded-[4px] border transition-colors ${
                        newGroupType === value
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-stone text-clay/50 hover:border-clay/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName || isCreatingGroup}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingGroup && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create group
                </button>
              </div>
            </div>
          )}

          {/* Discover groups */}
          {filteredDiscover.length > 0 && (
            <div className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                Discover groups
                {familyCounty && !searchQuery && (
                  <span className="ml-2 normal-case tracking-normal text-clay/30">
                    &middot; showing {familyCounty} first
                  </span>
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                {filteredDiscover.map((group) => (
                  <div key={group.id} className="card-elevated p-4 flex items-center gap-3">
                    <span className="text-2xl">{GROUP_EMOJI[group.type] || '\uD83C\uDFE0'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{group.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-clay/50 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.member_count}
                        </span>
                        {group.county && (
                          <>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-clay/50 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {group.county}
                            </span>
                          </>
                        )}
                        {group.county === familyCounty && (
                          <>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-moss font-medium">Your county</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={loadingGroupId === group.id}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      {loadingGroupId === group.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDiscover.length === 0 && searchQuery && (
            <div className="flex min-h-[160px] items-center justify-center rounded-[14px] border border-dashed border-stone bg-linen/50">
              <div className="text-center px-4">
                <Globe className="mx-auto mb-3 h-8 w-8 text-stone" />
                <p className="font-medium text-umber">No groups match &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-clay/50 mt-1 font-serif">
                  Try a different search or{' '}
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="text-terracotta hover:text-forest transition-colors underline"
                  >
                    create a group
                  </button>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          EVENTS TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-stone bg-linen/50">
              <div className="text-center px-6">
                {myGroups.length === 0 ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-terracotta" />
                    </div>
                    <p className="font-display text-xl font-light text-ink mb-2">Discover events</p>
                    <p className="text-sm text-clay font-serif max-w-xs mx-auto mb-4">
                      Join a group to see upcoming meetups, workshops, and family activities near you.
                    </p>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      Browse Groups
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-amber" />
                    </div>
                    <p className="font-display text-xl font-light text-ink mb-2">No upcoming events</p>
                    <p className="text-sm text-clay font-serif max-w-xs mx-auto">
                      Check back soon &mdash; events from your groups will show up here.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {filteredEvents.map((event) => {
                const { month, day, time, weekday } = formatEventDate(event.date);
                const atCapacity = event.capacity !== null && event.rsvp_count >= event.capacity;
                const hasRsvpd = rsvpdEventIds.has(event.id);

                return (
                  <div key={event.id} className="card-elevated p-5 flex items-start gap-4 hover:border-moss/25 transition-colors">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[14px] bg-forest/5">
                      <span className="text-[9px] font-bold uppercase text-clay/50">{weekday}</span>
                      <span className="text-lg font-bold font-display text-ink leading-none">{day}</span>
                      <span className="text-[10px] font-bold uppercase text-moss">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-ink">{event.title}</p>
                      {event.description && (
                        <p className="text-[13px] text-clay font-serif mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] text-clay/50 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {time}
                        </span>
                        {event.location && (
                          <>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-clay/50 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </>
                        )}
                        <span className="text-clay/20">&middot;</span>
                        <span className="text-[11px] text-clay/50 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.rsvp_count} going{event.capacity ? ` / ${event.capacity}` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-clay/40 mt-1.5 font-serif">via {event.group_name}</p>
                    </div>
                    <button
                      onClick={() => handleRsvp(event.id)}
                      disabled={rsvpingEventId === event.id || atCapacity || hasRsvpd}
                      className={`shrink-0 text-xs py-2 px-4 rounded-[4px] font-bold transition-all ${
                        hasRsvpd
                          ? 'bg-sage/15 text-moss border border-moss/20'
                          : atCapacity
                            ? 'bg-stone/20 text-clay/40 cursor-not-allowed'
                            : 'btn-terra'
                      }`}
                    >
                      {rsvpingEventId === event.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : hasRsvpd ? (
                        "RSVP'd"
                      ) : atCapacity ? (
                        'Full'
                      ) : (
                        'RSVP'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
