import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useApiQuery, useApiPut } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

// Map notification types to the screen they should open
function getRouteForType(type: string, data?: Record<string, unknown>): string | null {
  switch (type) {
    case 'morning_plan':
    case 'weekly_plan':
    case 'tomorrow_preview':
      return '/(tabs)/plan';
    case 'activity_reminder':
      if (data?.activityId) {
        return `/(stack)/activity/${data.activityId}`;
      }
      return '/(tabs)';
    case 'streak_risk':
    case 'day_review':
    case 'week_review':
    case 'month_review':
    case 'achievement':
      return '/(tabs)/progress';
    default:
      return '/(tabs)';
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<Notification[]>(
    ['notifications'],
    '/notifications'
  );

  const markRead = useApiPut<any, any>('/notifications');

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read
      if (!notification.read) {
        markRead.mutate({ ids: [notification.id] });
      }

      // Navigate to the relevant screen
      const route = getRouteForType(notification.type, notification.data as Record<string, unknown>);
      if (route) {
        router.push(route as any);
      }
    },
    [markRead, router]
  );

  const handleMarkAllRead = useCallback(() => {
    markRead.mutate({ mark_all_read: true });
    refetch();
  }, [markRead, refetch]);

  if (isLoading) return <LoadingScreen />;

  const hasUnread = (notifications || []).some((n) => !n.read);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={lightTheme.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
          >
            <Card variant={item.read ? 'flat' : 'elevated'} padding="lg">
              <View style={styles.notifRow}>
                <View style={[styles.dot, !item.read && styles.dotUnread]} />
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <View style={styles.notifMeta}>
                    <Text style={styles.notifTime}>
                      {formatTime(item.created_at)}
                    </Text>
                    {item.type && (
                      <Text style={styles.notifType}>
                        {formatType(item.type)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Bell size={32} color={`${lightTheme.textMuted}40`} />
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyBody}>No new notifications.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function formatType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  title: { ...typography.h3, color: lightTheme.text, flex: 1 },
  markAllBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  markAllText: {
    ...typography.uiSmall,
    color: lightTheme.accent,
    fontWeight: '600',
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  notifRow: { flexDirection: 'row', gap: spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginTop: 6,
  },
  dotUnread: { backgroundColor: lightTheme.accent },
  notifContent: { flex: 1, gap: 4 },
  notifTitle: {
    ...typography.ui,
    fontWeight: '600',
    color: lightTheme.text,
  },
  notifBody: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  notifTime: { fontSize: 11, color: lightTheme.textMuted },
  notifType: {
    fontSize: 10,
    color: lightTheme.textMuted,
    backgroundColor: `${lightTheme.border}60`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyTitle: { ...typography.h3, fontWeight: '300', color: lightTheme.text },
  emptyBody: { ...typography.body, color: lightTheme.textSecondary },
});
