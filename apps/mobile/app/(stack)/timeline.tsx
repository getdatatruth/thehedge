import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Check } from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface LogEntry {
  id: string;
  date: string;
  activity_title: string;
  activity_slug: string;
  category: string;
  duration_minutes: number;
  notes: string | null;
}

export default function TimelineScreen() {
  const router = useRouter();
  const {
    data: logs,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<LogEntry[]>(
    ['timeline'],
    '/activity-logs?limit=100'
  );

  if (isLoading) return <LoadingScreen />;

  // Group by date
  const grouped = (logs || []).reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      title: formatDate(date),
      data,
    }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Timeline</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.dateHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/(tabs)/browse/${item.activity_slug}` as any)
            }
          >
            <Card variant="interactive" padding="md">
              <View style={styles.logRow}>
                <View style={styles.checkCircle}>
                  <Check size={12} color={colors.parchment} />
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logTitle}>{item.activity_title}</Text>
                  <View style={styles.logMeta}>
                    <Badge variant="sage" size="sm">{item.category}</Badge>
                    <Text style={styles.logDuration}>
                      {item.duration_minutes} min
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activities logged yet</Text>
            <Text style={styles.emptyBody}>
              Start logging activities and your timeline will build up here.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-IE', { weekday: 'long' });
  return date.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: { flex: 1, gap: 4 },
  logTitle: { fontSize: 14, fontWeight: '500', color: colors.ink },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logDuration: { fontSize: 11, color: colors.clay },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '300', color: colors.ink },
  emptyBody: { fontSize: 14, color: colors.clay, textAlign: 'center', maxWidth: 260 },
});
