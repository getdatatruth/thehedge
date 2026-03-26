import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  UserPlus,
  UserMinus,
  Plus,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiPost } from '@/hooks/use-api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

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

  // Create post sheet
  const createPostRef = useRef<SimpleBottomSheetRef>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Always fetch groups so we can populate the create post form
  // (reuses the same query key as the groups tab)

  const createPostMutation = useApiPost('/community/posts', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      createPostRef.current?.close();
      resetPostForm();
      // Switch to feed tab so user sees their new post
      setActiveTab('feed');
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Failed to create post');
    },
  });

  const resetPostForm = () => {
    setPostTitle('');
    setPostBody('');
    setSelectedGroupId(null);
  };

  const handleCreatePost = () => {
    if (!postTitle.trim()) {
      Alert.alert('Title required', 'Please enter a title for your post.');
      return;
    }
    if (!postBody.trim()) {
      Alert.alert('Body required', 'Please write something for your post.');
      return;
    }
    if (!selectedGroupId) {
      Alert.alert('Select a group', 'Please choose a group to post in.');
      return;
    }
    createPostMutation.mutate({
      group_id: selectedGroupId,
      title: postTitle.trim(),
      body: postBody.trim(),
    });
  };

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
  const myGroups = groups.filter((g) => g.is_member);
  const events = eventsData?.events || [];

  const openCreatePost = () => {
    hapticLight();
    if (myGroups.length === 0) {
      Alert.alert(
        'Join a group first',
        'You need to be a member of at least one group to create a post.',
        [{ text: 'Browse groups', onPress: () => setActiveTab('groups') }, { text: 'OK' }]
      );
      return;
    }
    // Auto-select if only one group
    if (myGroups.length === 1) {
      setSelectedGroupId(myGroups[0].id);
    }
    createPostRef.current?.expand();
  };

  const isLoading =
    (activeTab === 'feed' && postsLoading) ||
    (activeTab === 'groups' && groupsLoading) ||
    (activeTab === 'events' && eventsLoading);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.card}>
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
    </View>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <View style={styles.card}>
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
              <Users size={11} color={lightTheme.textSecondary} /> {item.member_count}{' '}
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
              <UserMinus size={14} color={lightTheme.textSecondary} />
            ) : (
              <UserPlus size={14} color={lightTheme.surface} />
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
    </View>
  );

  const renderEvent = ({ item }: { item: CommunityEvent }) => (
    <View style={styles.card}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.eventMeta}>
        <View style={styles.eventMetaRow}>
          <Calendar size={13} color={lightTheme.textSecondary} />
          <Text style={styles.eventMetaText}>{formatEventDate(item.date)}</Text>
        </View>
        {item.location && (
          <View style={styles.eventMetaRow}>
            <MapPin size={13} color={lightTheme.textSecondary} />
            <Text style={styles.eventMetaText}>{item.location}</Text>
          </View>
        )}
        {item.group && (
          <View style={styles.eventMetaRow}>
            <Users size={13} color={lightTheme.textSecondary} />
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Community</Text>
      </View>

      {/* Pill-style tab chips */}
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
                  tintColor={lightTheme.accent}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<MessageSquare size={32} color={`${lightTheme.textMuted}40`} />}
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
                  tintColor={lightTheme.accent}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<Users size={32} color={`${lightTheme.textMuted}40`} />}
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
                  tintColor={lightTheme.accent}
                />
              }
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<Calendar size={32} color={`${lightTheme.textMuted}40`} />}
                  title="No upcoming events"
                  message="Events from your groups will show up here"
                />
              )}
            />
          )}
        </>
      )}

      {/* Floating POST FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={openCreatePost}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Post Bottom Sheet */}
      <SimpleBottomSheet ref={createPostRef} snapPoint="80%" scrollable onClose={resetPostForm}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>New Post</Text>

          {/* Group selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Post to</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groupPills}
            >
              {myGroups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.groupPill,
                    selectedGroupId === g.id && styles.groupPillActive,
                  ]}
                  onPress={() => {
                    hapticLight();
                    setSelectedGroupId(g.id);
                  }}
                >
                  <Text
                    style={[
                      styles.groupPillText,
                      selectedGroupId === g.id && styles.groupPillTextActive,
                    ]}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Title input */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What's this about?"
              placeholderTextColor={lightTheme.textMuted}
              value={postTitle}
              onChangeText={setPostTitle}
              maxLength={200}
            />
          </View>

          {/* Body input */}
          <View style={styles.section}>
            <Text style={styles.label}>Body</Text>
            <TextInput
              style={[styles.input, styles.bodyInput]}
              placeholder="Share your thoughts, questions, or ideas..."
              placeholderTextColor={lightTheme.textMuted}
              value={postBody}
              onChangeText={setPostBody}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Post button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreatePost}
            loading={createPostMutation.isPending}
          >
            Post
          </Button>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
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
    borderRadius: 20,
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: lightTheme.text,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: lightTheme.surface,
  },
  tabActive: {
    backgroundColor: lightTheme.primary,
  },
  tabText: {
    ...typography.uiSmall,
    fontWeight: '600',
    color: lightTheme.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  // Post styles
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  postAuthor: {
    ...typography.uiSmall,
    fontWeight: '600',
    color: lightTheme.text,
  },
  postTitle: {
    ...typography.body,
    fontWeight: '500',
    color: lightTheme.text,
    marginBottom: 4,
  },
  postBody: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    marginBottom: spacing.sm,
  },
  postTime: {
    fontSize: 11,
    color: lightTheme.textMuted,
  },
  // Group styles
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupInfo: { flex: 1, gap: spacing.sm, marginRight: spacing.md },
  groupName: {
    ...typography.body,
    fontWeight: '600',
    color: lightTheme.text,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  memberCount: {
    fontSize: 11,
    color: lightTheme.textSecondary,
  },
  // Event styles
  eventTitle: {
    ...typography.body,
    fontWeight: '500',
    color: lightTheme.text,
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
    ...typography.uiSmall,
    color: lightTheme.textSecondary,
  },
  rsvpRow: {
    flexDirection: 'row',
  },
  // Create post sheet styles
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: lightTheme.text,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.text,
    letterSpacing: 0.3,
  },
  groupPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  groupPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  groupPillActive: {
    backgroundColor: lightTheme.accent,
    borderColor: lightTheme.accent,
  },
  groupPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: lightTheme.textSecondary,
  },
  groupPillTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: lightTheme.background,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: lightTheme.text,
  },
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
