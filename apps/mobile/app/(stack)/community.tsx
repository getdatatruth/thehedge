import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  Clock,
  UserPlus,
  UserMinus,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

type TabKey = 'feed' | 'groups' | 'events';

interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author?: { name: string };
  group?: { name: string };
}

interface Group {
  id: string;
  name: string;
  county: string | null;
  type: string;
  member_count: number;
  is_member?: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string | null;
  group?: { name: string };
  rsvp_count: number;
  capacity: number | null;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'feed', label: 'Feed' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
];

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
  });
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommunityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('feed');

  // Queries
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useApiQuery<{ posts: Post[] }>(
    ['community-posts'],
    '/community/posts',
    { enabled: activeTab === 'feed' }
  );

  const {
    data: groupsData,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useApiQuery<{ groups: Group[] }>(
    ['community-groups'],
    '/community/groups',
    { enabled: activeTab === 'groups' }
  );

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useApiQuery<{ events: CommunityEvent[] }>(
    ['community-events'],
    '/community/events',
    { enabled: activeTab === 'events' }
  );

  // Join/leave mutations use dynamic paths, so we use useMutation directly
  const joinGroup = {
    isPending: false,
    mutate: async (groupId: string) => {
      try {
        const { apiPost } = await import('@/lib/api');
        await apiPost(`/community/groups/${groupId}/join`, {});
        queryClient.invalidateQueries({ queryKey: ['community-groups'] });
        queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      } catch {}
    },
  };

  const leaveGroup = {
    isPending: false,
    mutate: async (groupId: string) => {
      try {
        const { apiDelete } = await import('@/lib/api');
        await apiDelete(`/community/groups/${groupId}/join`);
        queryClient.invalidateQueries({ queryKey: ['community-groups'] });
      } catch {}
    },
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'feed') await refetchPosts();
    else if (activeTab === 'groups') await refetchGroups();
    else await refetchEvents();
    setRefreshing(false);
  }, [activeTab, refetchPosts, refetchGroups, refetchEvents]);

  const posts = postsData?.posts || [];
  const groups = groupsData?.groups || [];
  const events = eventsData?.events || [];

  const isLoading =
    (activeTab === 'feed' && postsLoading) ||
    (activeTab === 'groups' && groupsLoading) ||
    (activeTab === 'events' && eventsLoading);

  const renderPost = ({ item }: { item: Post }) => (
    <Card variant="interactive" padding="lg">
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.author?.name || 'Member'}</Text>
        {item.group && (
          <Badge variant="sage" size="sm">
            {item.group.name}
          </Badge>
        )}
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postBody} numberOfLines={3}>
        {item.body}
      </Text>
      <Text style={styles.postTime}>{formatRelativeTime(item.created_at)}</Text>
    </Card>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <Card variant="interactive" padding="lg">
      <View style={styles.groupRow}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.groupMeta}>
            {item.county && (
              <Badge variant="stone" size="sm">
                {item.county}
              </Badge>
            )}
            <Badge variant="sage" size="sm">
              {item.type}
            </Badge>
            <Text style={styles.memberCount}>
              <Users size={11} color={colors.clay} /> {item.member_count}{' '}
              {item.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
        <Button
          variant={item.is_member ? 'ghost' : 'primary'}
          size="sm"
          loading={joinGroup.isPending || leaveGroup.isPending}
          icon={
            item.is_member ? (
              <UserMinus size={14} color={colors.clay} />
            ) : (
              <UserPlus size={14} color={colors.parchment} />
            )
          }
          onPress={() => {
            if (item.is_member) {
              leaveGroup.mutate(item.id);
            } else {
              joinGroup.mutate(item.id);
            }
          }}
        >
          {item.is_member ? 'Leave' : 'Join'}
        </Button>
      </View>
    </Card>
  );

  const renderEvent = ({ item }: { item: CommunityEvent }) => (
    <Card variant="interactive" padding="lg">
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.eventMeta}>
        <View style={styles.eventMetaRow}>
          <Calendar size={13} color={colors.clay} />
          <Text style={styles.eventMetaText}>{formatEventDate(item.date)}</Text>
        </View>
        {item.location && (
          <View style={styles.eventMetaRow}>
            <MapPin size={13} color={colors.clay} />
            <Text style={styles.eventMetaText}>{item.location}</Text>
          </View>
        )}
        {item.group && (
          <View style={styles.eventMetaRow}>
            <Users size={13} color={colors.clay} />
            <Text style={styles.eventMetaText}>{item.group.name}</Text>
          </View>
        )}
      </View>
      <View style={styles.rsvpRow}>
        <Badge variant="moss" size="sm">
          {item.rsvp_count}
          {item.capacity ? ` / ${item.capacity}` : ''} attending
        </Badge>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Community</Text>
      </View>

      {/* Segment tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {activeTab === 'feed' && (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderPost}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.moss}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<MessageSquare size={32} color={`${colors.clay}40`} />}
                  title="No posts yet"
                  message="Join a group to see posts here"
                  actionLabel="Browse groups"
                  onAction={() => setActiveTab('groups')}
                />
              )}
            />
          )}

          {activeTab === 'groups' && (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroup}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.moss}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<Users size={32} color={`${colors.clay}40`} />}
                  title="No groups yet"
                  message="Community groups will appear here soon"
                />
              )}
            />
          )}

          {activeTab === 'events' && (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={renderEvent}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.moss}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<Calendar size={32} color={`${colors.clay}40`} />}
                  title="No upcoming events"
                  message="Events from your groups will show up here"
                />
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '300', color: colors.ink },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  tabActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  tabTextActive: {
    color: colors.parchment,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  // Post styles
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  postAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: 4,
  },
  postBody: {
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  postTime: {
    fontSize: 11,
    color: `${colors.clay}80`,
  },
  // Group styles
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupInfo: { flex: 1, gap: spacing.sm, marginRight: spacing.md },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  memberCount: {
    fontSize: 11,
    color: colors.clay,
  },
  // Event styles
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    gap: 6,
    marginBottom: spacing.md,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: colors.clay,
  },
  rsvpRow: {
    flexDirection: 'row',
  },
});
