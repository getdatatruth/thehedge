'use client';

import { useState, useTransition, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Calendar,
  MessageCircle,
  Search,
  Plus,
  LogOut,
  Loader2,
  X,
  Rss,
  Globe,
  HelpCircle,
  LinkIcon,
  Megaphone,
  Heart,
  Flag,
  Pin,
  Shield,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// -- Types --

interface Group {
  id: string;
  name: string;
  county: string | null;
  type: string;
  member_count: number;
  description?: string | null;
  emoji?: string | null;
  rules?: string | null;
  created_at: string;
}

interface Post {
  id: string;
  family_id: string;
  group_id: string;
  title: string;
  body: string;
  type: string;
  like_count?: number;
  comment_count?: number;
  is_pinned?: boolean;
  is_moderator?: boolean;
  created_at: string;
  group_name: string;
  family_name: string;
}

interface Comment {
  id: string;
  post_id: string;
  family_id: string;
  body: string;
  author_name: string;
  created_at: string;
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

// -- Helpers --

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

const POST_TYPE_COLORS: Record<string, string> = {
  discussion: '#4CAF7C',
  question: '#F5A623',
  resource: '#5BBDD4',
  event: '#E8735A',
};

const POST_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  discussion: { icon: MessageCircle, label: 'Discussion' },
  question: { icon: HelpCircle, label: 'Question' },
  resource: { icon: LinkIcon, label: 'Resource' },
  event: { icon: Megaphone, label: 'Event' },
};

const REPORT_REASONS = [
  'Inappropriate',
  'Spam',
  'Harmful content',
  'Other',
];

type Tab = 'feed' | 'groups' | 'events';

// -- Component --

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

  // Likes state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likingPostId, setLikingPostId] = useState<string | null>(null);

  // Comments state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [localCommentCounts, setLocalCommentCounts] = useState<Record<string, number>>({});

  // Report state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    post_id?: string;
    comment_id?: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportedItems, setReportedItems] = useState<Set<string>>(new Set());

  // Group rules expanded state
  const [rulesExpandedGroupId, setRulesExpandedGroupId] = useState<string | null>(null);

  // Initialize like counts from props
  useEffect(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.id] = p.like_count ?? 0;
    });
    setLikeCounts(counts);
  }, [posts]);

  // Initialize local comment counts from props
  useEffect(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.id] = p.comment_count ?? 0;
    });
    setLocalCommentCounts(counts);
  }, [posts]);

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
    // Sort: pinned posts first, then by created_at
    return [...result].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
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

  // -- Handlers --

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

  async function handleToggleLike(postId: string) {
    if (likingPostId) return;
    setLikingPostId(postId);
    const wasLiked = likedPosts.has(postId);

    // Optimistic update
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? 0) + (wasLiked ? -1 : 1)),
    }));

    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        setLikedPosts((prev) => {
          const next = new Set(prev);
          if (data.liked) {
            next.add(postId);
          } else {
            next.delete(postId);
          }
          return next;
        });
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: data.like_count ?? prev[postId] ?? 0,
        }));
      }
    } catch (err) {
      // Revert optimistic update on error
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] ?? 0) + (wasLiked ? 1 : -1)),
      }));
      console.error('Failed to toggle like:', err);
    } finally {
      setLikingPostId(null);
    }
  }

  const fetchComments = useCallback(async (postId: string) => {
    setLoadingComments(postId);
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/comments`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        setCommentsMap((prev) => ({ ...prev, [postId]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(null);
    }
  }, []);

  function handleExpandPost(postId: string) {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    if (!commentsMap[postId]) {
      fetchComments(postId);
    }
  }

  async function handleSubmitComment(postId: string) {
    const body = commentInputs[postId]?.trim();
    if (!body) return;
    setSubmittingComment(postId);
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        setLocalCommentCounts((prev) => ({
          ...prev,
          [postId]: (prev[postId] ?? 0) + 1,
        }));
        await fetchComments(postId);
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(null);
    }
  }

  function openReportDialog(target: { post_id?: string; comment_id?: string }) {
    const key = target.post_id ? `post:${target.post_id}` : `comment:${target.comment_id}`;
    if (reportedItems.has(key)) return;
    setReportTarget(target);
    setReportReason(null);
    setReportDialogOpen(true);
  }

  async function handleSubmitReport() {
    if (!reportTarget || !reportReason) return;
    setIsReporting(true);
    try {
      const res = await fetch('/api/v1/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportTarget,
          reason: reportReason,
        }),
      });
      if (res.ok) {
        const key = reportTarget.post_id
          ? `post:${reportTarget.post_id}`
          : `comment:${reportTarget.comment_id}`;
        setReportedItems((prev) => new Set(prev).add(key));
        setReportDialogOpen(false);
        setReportTarget(null);
        setReportReason(null);
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsReporting(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'feed', label: 'Feed', icon: Rss, count: posts.length },
    { id: 'groups', label: 'Groups', icon: Users, count: myGroups.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
  ];

  function getPostTypeColor(type: string) {
    return POST_TYPE_COLORS[type] || POST_TYPE_COLORS.discussion;
  }

  function getGroupForPost(post: Post): Group | undefined {
    return groups.find((g) => g.id === post.group_id);
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cat-nature mb-2">Connect</p>
          <h1 className="text-3xl sm:text-4xl font-light text-umber tracking-tight">
            Community
          </h1>
          <p className="text-clay mt-2 text-base">
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
              className="rounded-2xl bg-forest text-parchment text-xs py-2 px-4 flex items-center gap-1.5 font-medium hover:bg-forest/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone/30">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              activeTab === id
                ? 'border-cat-nature text-umber'
                : 'border-transparent text-clay/50 hover:text-clay'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === id
                    ? 'bg-cat-nature/15 text-cat-nature'
                    : 'bg-stone/20 text-clay/50'
                }`}
              >
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
          className="h-11 pl-10 rounded-2xl border-none bg-white shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ====== FEED TAB ====== */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Post type filter chips */}
          {posts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-clay/40 mr-1">
                Filter
              </span>
              <button
                onClick={() => {
                  setPostTypeFilter(null);
                  setSelectedGroupFilter(null);
                }}
                className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all ${
                  !postTypeFilter && !selectedGroupFilter
                    ? 'bg-forest text-parchment'
                    : 'bg-white text-clay shadow-sm hover:shadow'
                }`}
              >
                All
              </button>
              {Object.entries(POST_TYPE_CONFIG).map(([key, { label }]) => {
                const color = POST_TYPE_COLORS[key];
                const isActive = postTypeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPostTypeFilter(postTypeFilter === key ? null : key)}
                    className="rounded-2xl px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? color : `${color}15`,
                      color: isActive ? '#fff' : color,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              {myGroups.length > 1 && (
                <>
                  <span className="text-clay/20 mx-1">|</span>
                  {myGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() =>
                        setSelectedGroupFilter(selectedGroupFilter === g.id ? null : g.id)
                      }
                      className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedGroupFilter === g.id
                          ? 'bg-forest text-parchment'
                          : 'bg-white text-clay shadow-sm hover:shadow'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Group rules (if filtering by a single group that has rules) */}
          {selectedGroupFilter && (() => {
            const group = groups.find((g) => g.id === selectedGroupFilter);
            if (!group?.rules) return null;
            return (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <button
                  onClick={() =>
                    setRulesExpandedGroupId(
                      rulesExpandedGroupId === group.id ? null : group.id
                    )
                  }
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Shield className="h-4 w-4 text-cat-nature" />
                  <span className="text-sm font-medium text-umber flex-1">
                    Group Rules
                  </span>
                  {rulesExpandedGroupId === group.id ? (
                    <ChevronUp className="h-4 w-4 text-clay" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-clay" />
                  )}
                </button>
                {rulesExpandedGroupId === group.id && (
                  <p className="text-sm text-clay mt-3 leading-relaxed whitespace-pre-line">
                    {group.rules}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Create post form */}
          {showCreatePost && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-umber">Create a post</p>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-clay/30 hover:text-clay transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <select
                  value={newPostGroupId}
                  onChange={(e) => setNewPostGroupId(e.target.value)}
                  className="w-full h-10 rounded-2xl border-none bg-stone/10 px-3 text-sm text-umber"
                >
                  <option value="">Select a group</option>
                  {myGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {(['discussion', 'question', 'resource', 'event'] as const).map((t) => {
                    const color = POST_TYPE_COLORS[t];
                    const isActive = newPostType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setNewPostType(t)}
                        className="text-xs px-3 py-1.5 rounded-2xl capitalize transition-colors font-medium"
                        style={{
                          backgroundColor: isActive ? `${color}20` : 'transparent',
                          color: isActive ? color : undefined,
                          border: `1px solid ${isActive ? color : '#e5e2dd'}`,
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <Input
                  placeholder="Title"
                  className="h-10 rounded-2xl border-none bg-stone/10"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                  placeholder="What's on your mind?"
                  className="w-full h-24 rounded-2xl border-none bg-stone/10 px-4 py-3 text-sm text-umber resize-none focus:outline-none focus:ring-2 focus:ring-cat-nature/20"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostGroupId || !newPostTitle || !newPostContent || isCreatingPost}
                  className="rounded-2xl bg-forest text-parchment w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-forest/90 transition-colors"
                >
                  {isCreatingPost && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {filteredPosts.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
              <div className="text-center px-6">
                {myGroups.length === 0 ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cat-nature/10 mx-auto mb-4">
                      <Users className="h-7 w-7 text-cat-nature" />
                    </div>
                    <p className="text-xl font-light text-umber mb-2">
                      Join your first group
                    </p>
                    <p className="text-sm text-clay max-w-xs mx-auto mb-4">
                      Connect with families in your area. Browse the Groups tab to find
                      communities near you.
                    </p>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className="rounded-2xl bg-forest text-parchment text-xs py-2 px-4 font-medium hover:bg-forest/90 transition-colors"
                    >
                      Browse Groups
                    </button>
                  </>
                ) : postTypeFilter || selectedGroupFilter ? (
                  <>
                    <Search className="mx-auto mb-3 h-8 w-8 text-clay/30" />
                    <p className="font-medium text-umber">No posts match your filters</p>
                    <p className="text-sm text-clay mt-1">Try removing some filters.</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cat-nature/10 mx-auto mb-4">
                      <MessageCircle className="h-7 w-7 text-cat-nature" />
                    </div>
                    <p className="text-xl font-light text-umber mb-2">
                      Start the conversation
                    </p>
                    <p className="text-sm text-clay max-w-xs mx-auto mb-4">
                      Your groups are quiet right now. Be the first to share something.
                    </p>
                    <button
                      onClick={() => {
                        setShowCreatePost(true);
                        if (!newPostGroupId && myGroups.length > 0) {
                          setNewPostGroupId(myGroups[0].id);
                        }
                      }}
                      className="rounded-2xl bg-forest text-parchment text-xs py-2 px-4 font-medium hover:bg-forest/90 transition-colors"
                    >
                      Write a Post
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const typeConfig = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.discussion;
                const TypeIcon = typeConfig.icon;
                const typeColor = getPostTypeColor(post.type);
                const isExpanded = expandedPostId === post.id;
                const comments = commentsMap[post.id] || [];
                const isLiked = likedPosts.has(post.id);
                const likeCount = likeCounts[post.id] ?? post.like_count ?? 0;
                const commentCount = localCommentCounts[post.id] ?? post.comment_count ?? 0;
                const isPostReported = reportedItems.has(`post:${post.id}`);

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <div className="p-5">
                      {/* Pinned indicator */}
                      {post.is_pinned && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Pin className="h-3 w-3 text-cat-nature" />
                          <span className="text-[11px] font-semibold text-cat-nature uppercase tracking-wide">
                            Pinned
                          </span>
                        </div>
                      )}

                      {/* Post header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cat-nature/10">
                          <span className="text-[11px] font-bold text-cat-nature">
                            {post.family_name[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium text-umber">
                              {post.family_name}
                            </span>
                            {post.is_moderator && (
                              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-cat-nature/15 text-cat-nature">
                                Mod
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-clay">{post.group_name}</span>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-clay">
                              {timeAgo(post.created_at)}
                            </span>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${typeColor}15`,
                            color: typeColor,
                          }}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </span>
                      </div>

                      {/* Post body */}
                      <h3 className="text-[15px] font-medium text-umber mb-1.5">
                        {post.title}
                      </h3>
                      <p className="text-[13px] text-clay leading-relaxed line-clamp-3">
                        {post.body}
                      </p>

                      {/* Post actions */}
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-stone/20">
                        {/* Like button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          disabled={likingPostId === post.id}
                          className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-xl transition-colors ${
                            isLiked
                              ? 'text-cat-nature bg-cat-nature/10'
                              : 'text-clay hover:text-cat-nature hover:bg-cat-nature/5'
                          }`}
                        >
                          <Heart
                            className="h-3.5 w-3.5"
                            fill={isLiked ? 'currentColor' : 'none'}
                          />
                          {likeCount > 0 && <span>{likeCount}</span>}
                        </button>

                        {/* Comment toggle */}
                        <button
                          onClick={() => handleExpandPost(post.id)}
                          className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-xl transition-colors ${
                            isExpanded
                              ? 'text-cat-nature bg-cat-nature/10'
                              : 'text-clay hover:text-cat-nature hover:bg-cat-nature/5'
                          }`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {commentCount > 0 && <span>{commentCount}</span>}
                          {commentCount === 0 && <span>Reply</span>}
                        </button>

                        <div className="flex-1" />

                        {/* Report button */}
                        {isPostReported ? (
                          <span className="text-[11px] text-clay/40 px-2">Reported</span>
                        ) : (
                          <button
                            onClick={() => openReportDialog({ post_id: post.id })}
                            className="inline-flex items-center gap-1 text-[11px] text-clay/30 hover:text-clay px-2 py-1.5 rounded-xl transition-colors"
                          >
                            <Flag className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments section */}
                    {isExpanded && (
                      <div className="border-t border-stone/20 bg-stone/5 px-5 py-4 space-y-4">
                        {loadingComments === post.id ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-clay" />
                          </div>
                        ) : comments.length === 0 ? (
                          <p className="text-[13px] text-clay text-center py-2">
                            No comments yet. Start the conversation.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => {
                              const isCommentReported = reportedItems.has(
                                `comment:${comment.id}`
                              );
                              return (
                                <div
                                  key={comment.id}
                                  className="flex gap-2.5 group"
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cat-nature/10 mt-0.5">
                                    <span className="text-[9px] font-bold text-cat-nature">
                                      {comment.author_name[0]?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[12px] font-medium text-umber">
                                        {comment.author_name}
                                      </span>
                                      <span className="text-[11px] text-clay">
                                        {timeAgo(comment.created_at)}
                                      </span>
                                      <div className="flex-1" />
                                      {isCommentReported ? (
                                        <span className="text-[10px] text-clay/40">
                                          Reported
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            openReportDialog({
                                              comment_id: comment.id,
                                            })
                                          }
                                          className="opacity-0 group-hover:opacity-100 text-clay/30 hover:text-clay transition-all"
                                        >
                                          <Flag className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[13px] text-clay leading-relaxed mt-0.5">
                                      {comment.body}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Comment input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-1 h-9 rounded-2xl bg-white px-3.5 text-[13px] text-umber border-none focus:outline-none focus:ring-2 focus:ring-cat-nature/20 shadow-sm"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={
                              !commentInputs[post.id]?.trim() ||
                              submittingComment === post.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-forest text-parchment disabled:opacity-40 hover:bg-forest/90 transition-colors shrink-0"
                          >
                            {submittingComment === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====== GROUPS TAB ====== */}
      {activeTab === 'groups' && (
        <div className="space-y-8">
          {/* Your groups */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-clay/50">
              Your groups ({myGroups.length})
            </p>

            {myGroups.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-white shadow-sm">
                <div className="text-center px-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cat-nature/10 mx-auto mb-4">
                    <Users className="h-7 w-7 text-cat-nature" />
                  </div>
                  <p className="text-lg font-light text-umber mb-1">No groups yet</p>
                  <p className="text-sm text-clay max-w-xs mx-auto">
                    Join a group below to start connecting with families.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {group.emoji || GROUP_EMOJI[group.type] || '\uD83C\uDFE0'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-umber">{group.name}</p>
                        {group.description && (
                          <p className="text-[12px] text-clay mt-0.5 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-clay flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.member_count}{' '}
                            {group.member_count === 1 ? 'member' : 'members'}
                          </span>
                          {group.county && (
                            <>
                              <span className="text-clay/20">&middot;</span>
                              <span className="text-[11px] text-clay flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {group.county}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group.id);
                        }}
                        disabled={loadingGroupId === group.id}
                        className="text-clay/30 hover:text-red-500 transition-colors p-1.5 rounded-xl hover:bg-red-50"
                        title="Leave group"
                      >
                        {loadingGroupId === group.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Group rules expandable */}
                    {group.rules && (
                      <div className="mt-3 pt-3 border-t border-stone/20">
                        <button
                          onClick={() =>
                            setRulesExpandedGroupId(
                              rulesExpandedGroupId === group.id ? null : group.id
                            )
                          }
                          className="flex items-center gap-1.5 text-[11px] text-clay hover:text-umber transition-colors w-full text-left"
                        >
                          <Shield className="h-3 w-3" />
                          <span className="font-medium">Group Rules</span>
                          {rulesExpandedGroupId === group.id ? (
                            <ChevronUp className="h-3 w-3 ml-auto" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-auto" />
                          )}
                        </button>
                        {rulesExpandedGroupId === group.id && (
                          <p className="text-[12px] text-clay mt-2 leading-relaxed whitespace-pre-line">
                            {group.rules}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discover groups */}
          {filteredDiscover.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-clay/50">
                Discover groups
                {familyCounty && !searchQuery && (
                  <span className="ml-2 normal-case tracking-normal text-clay/30">
                    - showing {familyCounty} first
                  </span>
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredDiscover.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {group.emoji || GROUP_EMOJI[group.type] || '\uD83C\uDFE0'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-umber">{group.name}</p>
                        {group.description && (
                          <p className="text-[12px] text-clay mt-0.5 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-clay flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.member_count}
                          </span>
                          {group.county && (
                            <>
                              <span className="text-clay/20">&middot;</span>
                              <span className="text-[11px] text-clay flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {group.county}
                              </span>
                            </>
                          )}
                          {group.county === familyCounty && (
                            <>
                              <span className="text-clay/20">&middot;</span>
                              <span className="text-[11px] text-cat-nature font-medium">
                                Your county
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={loadingGroupId === group.id}
                        className="rounded-2xl bg-cat-nature/10 text-cat-nature text-xs py-1.5 px-3 flex items-center gap-1.5 font-medium hover:bg-cat-nature/20 transition-colors shrink-0"
                      >
                        {loadingGroupId === group.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDiscover.length === 0 && searchQuery && (
            <div className="flex min-h-[160px] items-center justify-center rounded-2xl bg-white shadow-sm">
              <div className="text-center px-4">
                <Globe className="mx-auto mb-3 h-8 w-8 text-clay/30" />
                <p className="font-medium text-umber">
                  No groups match &quot;{searchQuery}&quot;
                </p>
                <p className="text-sm text-clay mt-1">Try a different search.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== EVENTS TAB ====== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
              <div className="text-center px-6">
                {myGroups.length === 0 ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cat-nature/10 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-cat-nature" />
                    </div>
                    <p className="text-xl font-light text-umber mb-2">Discover events</p>
                    <p className="text-sm text-clay max-w-xs mx-auto mb-4">
                      Join a group to see upcoming meetups, workshops, and family activities
                      near you.
                    </p>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className="rounded-2xl bg-forest text-parchment text-xs py-2 px-4 font-medium hover:bg-forest/90 transition-colors"
                    >
                      Browse Groups
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-amber-600" />
                    </div>
                    <p className="text-xl font-light text-umber mb-2">No upcoming events</p>
                    <p className="text-sm text-clay max-w-xs mx-auto">
                      Check back soon - events from your groups will show up here.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const { month, day, time, weekday } = formatEventDate(event.date);
                const atCapacity =
                  event.capacity !== null && event.rsvp_count >= event.capacity;
                const hasRsvpd = rsvpdEventIds.has(event.id);

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-cat-nature/8">
                      <span className="text-[9px] font-bold uppercase text-clay">
                        {weekday}
                      </span>
                      <span className="text-lg font-bold text-umber leading-none">
                        {day}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-cat-nature">
                        {month}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-umber">{event.title}</p>
                      {event.description && (
                        <p className="text-[13px] text-clay mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] text-clay flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {time}
                        </span>
                        {event.location && (
                          <>
                            <span className="text-clay/20">&middot;</span>
                            <span className="text-[11px] text-clay flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </>
                        )}
                        <span className="text-clay/20">&middot;</span>
                        <span className="text-[11px] text-clay flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.rsvp_count} going
                          {event.capacity ? ` / ${event.capacity}` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-clay/50 mt-1.5">
                        via {event.group_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRsvp(event.id)}
                      disabled={rsvpingEventId === event.id || atCapacity || hasRsvpd}
                      className={`shrink-0 text-xs py-2 px-4 rounded-2xl font-medium transition-all ${
                        hasRsvpd
                          ? 'bg-cat-nature/10 text-cat-nature'
                          : atCapacity
                            ? 'bg-stone/20 text-clay/40 cursor-not-allowed'
                            : 'bg-forest text-parchment hover:bg-forest/90'
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

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-umber">Report Content</DialogTitle>
            <DialogDescription className="text-clay">
              Why are you reporting this? Your report will be reviewed by a moderator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setReportReason(reason)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-colors ${
                  reportReason === reason
                    ? 'bg-cat-nature/10 text-cat-nature font-medium'
                    : 'bg-stone/5 text-umber hover:bg-stone/10'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setReportDialogOpen(false);
                setReportTarget(null);
                setReportReason(null);
              }}
              className="flex-1 rounded-2xl border border-stone/30 text-clay py-2.5 text-sm font-medium hover:bg-stone/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={!reportReason || isReporting}
              className="flex-1 rounded-2xl bg-forest text-parchment py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-forest/90 transition-colors flex items-center justify-center gap-2"
            >
              {isReporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit Report
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
