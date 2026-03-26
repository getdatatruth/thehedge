import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Star,
  Calendar,
  Edit3,
  TrendingUp,
  Flame,
  Layers,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { EditLogModal } from '@/components/shared/EditLogModal';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// The API returns activity_logs with joined activities data
interface LogEntry {
  id: string;
  date: string;
  activity_id: string | null;
  child_ids: string[];
  duration_minutes: number | null;
  notes: string | null;
  rating: number | null;
  // Supabase join returns nested object (not flat)
  activities: {
    title: string;
    slug: string;
    category: string;
  } | null;
}

interface EditLogData {
  id: string;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  rating: number | null;
  child_ids: string[];
  activityTitle: string;
}

interface MonthData {
  key: string; // "2026-03"
  label: string; // "March 2026"
  isCurrent: boolean;
  logs: LogEntry[];
  days: { date: string; label: string; shortDate: string; logs: LogEntry[] }[];
  stats: {
    totalActivities: number;
    totalMinutes: number;
    categories: Record<string, number>;
    bestStreak: number;
  };
}

function getCategoryColor(cat: string): string {
  const key = cat?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
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
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'long' });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7); // "2026-03"
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
}

function isCurrentMonth(monthKey: string): boolean {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return monthKey === currentKey;
}

function calculateStreak(logs: LogEntry[]): number {
  if (logs.length === 0) return 0;
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort();
  let maxStreak = 1;
  let current = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const curr = new Date(uniqueDates[i] + 'T00:00:00');
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  return maxStreak;
}

// Horizontal stacked category bar
function CategoryBar({ categories }: { categories: Record<string, number> }) {
  const total = Object.values(categories).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const entries = Object.entries(categories).sort(([, a], [, b]) => b - a);

  return (
    <View style={barStyles.container}>
      {entries.map(([cat, count]) => {
        const pct = (count / total) * 100;
        if (pct < 2) return null;
        return (
          <View
            key={cat}
            style={[
              barStyles.segment,
              {
                backgroundColor: getCategoryColor(cat),
                flex: count,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: lightTheme.background,
  },
  segment: {
    height: 6,
  },
});

// Month-in-Review card
function MonthReviewCard({ stats, isCurrent }: { stats: MonthData['stats']; isCurrent: boolean }) {
  const categoryCount = Object.keys(stats.categories).length;
  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = stats.totalMinutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View style={reviewStyles.card}>
      <Text style={reviewStyles.label}>
        {isCurrent ? 'Your month so far' : 'Month in review'}
      </Text>

      <View style={reviewStyles.statsRow}>
        <View style={reviewStyles.stat}>
          <View style={reviewStyles.statIcon}>
            <TrendingUp size={14} color={lightTheme.accent} />
          </View>
          <Text style={reviewStyles.statValue}>{stats.totalActivities}</Text>
          <Text style={reviewStyles.statLabel}>activities</Text>
        </View>

        <View style={reviewStyles.stat}>
          <View style={reviewStyles.statIcon}>
            <Clock size={14} color={lightTheme.accent} />
          </View>
          <Text style={reviewStyles.statValue}>{timeLabel}</Text>
          <Text style={reviewStyles.statLabel}>total time</Text>
        </View>

        <View style={reviewStyles.stat}>
          <View style={reviewStyles.statIcon}>
            <Layers size={14} color={lightTheme.accent} />
          </View>
          <Text style={reviewStyles.statValue}>{categoryCount}</Text>
          <Text style={reviewStyles.statLabel}>categories</Text>
        </View>

        <View style={reviewStyles.stat}>
          <View style={reviewStyles.statIcon}>
            <Flame size={14} color={lightTheme.accent} />
          </View>
          <Text style={reviewStyles.statValue}>{stats.bestStreak}</Text>
          <Text style={reviewStyles.statLabel}>day streak</Text>
        </View>
      </View>

      <CategoryBar categories={stats.categories} />
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: lightTheme.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: lightTheme.text,
  },
  statLabel: {
    fontSize: 10,
    color: lightTheme.textMuted,
  },
});

export default function TimelineScreen() {
  const router = useRouter();
  const { children } = useAuthStore();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [editingLog, setEditingLog] = useState<EditLogData | null>(null);
  const editSheetRef = useRef<SimpleBottomSheetRef>(null);

  // Build query path with optional child filter
  const queryPath = selectedChild
    ? `/activity-logs?per_page=200&child_id=${selectedChild}`
    : '/activity-logs?per_page=200';

  const {
    data: logs,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<LogEntry[]>(
    ['timeline', selectedChild || 'all'],
    queryPath
  );

  // Get child name map for displaying
  const childMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of children) map[c.id] = c.name;
    return map;
  }, [children]);

  // Group by month, then by day within each month
  const months: MonthData[] = useMemo(() => {
    const allLogs = logs || [];
    const monthMap: Record<string, LogEntry[]> = {};

    for (const log of allLogs) {
      const mk = getMonthKey(log.date);
      if (!monthMap[mk]) monthMap[mk] = [];
      monthMap[mk].push(log);
    }

    return Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, monthLogs]) => {
        // Group by day
        const dayMap: Record<string, LogEntry[]> = {};
        for (const log of monthLogs) {
          if (!dayMap[log.date]) dayMap[log.date] = [];
          dayMap[log.date].push(log);
        }

        const days = Object.entries(dayMap)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, dayLogs]) => ({
            date,
            label: formatDate(date),
            shortDate: formatShortDate(date),
            logs: dayLogs,
          }));

        // Compute stats
        const categories: Record<string, number> = {};
        let totalMinutes = 0;
        for (const log of monthLogs) {
          totalMinutes += log.duration_minutes || 0;
          const cat = log.activities?.category || 'other';
          categories[cat] = (categories[cat] || 0) + 1;
        }

        return {
          key: monthKey,
          label: getMonthLabel(monthKey),
          isCurrent: isCurrentMonth(monthKey),
          logs: monthLogs,
          days,
          stats: {
            totalActivities: monthLogs.length,
            totalMinutes,
            categories,
            bestStreak: calculateStreak(monthLogs),
          },
        };
      });
  }, [logs]);

  // Current month is always expanded; toggle for others
  const isMonthExpanded = useCallback(
    (monthKey: string) => {
      if (isCurrentMonth(monthKey)) return true;
      return expandedMonths.has(monthKey);
    },
    [expandedMonths]
  );

  const toggleMonth = useCallback((monthKey: string) => {
    if (isCurrentMonth(monthKey)) return; // always expanded
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  }, []);

  const handleEditLog = useCallback((log: LogEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingLog({
      id: log.id,
      date: log.date,
      duration_minutes: log.duration_minutes,
      notes: log.notes,
      rating: log.rating,
      child_ids: log.child_ids,
      activityTitle: log.activities?.title || 'Activity',
    });
    editSheetRef.current?.expand();
  }, []);

  const totalLogged = logs?.length || 0;

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={lightTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Timeline</Text>
          <Text style={styles.subtitle}>{totalLogged} activit{totalLogged === 1 ? 'y' : 'ies'} logged</Text>
        </View>
      </View>

      {/* Child filter */}
      {children.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.childPills}
          style={styles.childPillsContainer}
        >
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedChild(null); }}
            style={[styles.childPill, !selectedChild && styles.childPillActive]}
          >
            <Text style={[styles.childPillText, !selectedChild && styles.childPillTextActive]}>All</Text>
          </TouchableOpacity>
          {children.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedChild(c.id); }}
              style={[styles.childPill, selectedChild === c.id && styles.childPillActive]}
            >
              <Text style={[styles.childPillText, selectedChild === c.id && styles.childPillTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Timeline - month sections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={lightTheme.accent} />
        }
      >
        {months.length === 0 && (
          <View style={styles.empty}>
            <Check size={40} color={`${lightTheme.accent}40`} />
            <Text style={styles.emptyTitle}>No activities logged yet</Text>
            <Text style={styles.emptyBody}>
              Browse activities and tap "Log this activity" to start building your timeline.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/browse')}
              style={styles.browseBtn}
            >
              <Text style={styles.browseBtnText}>Browse activities</Text>
            </TouchableOpacity>
          </View>
        )}

        {months.map((month) => {
          const expanded = isMonthExpanded(month.key);

          return (
            <View key={month.key} style={styles.monthSection}>
              {/* Month header */}
              <TouchableOpacity
                onPress={() => toggleMonth(month.key)}
                style={styles.monthHeader}
                activeOpacity={month.isCurrent ? 1 : 0.7}
              >
                <Calendar size={16} color={lightTheme.accent} />
                <Text style={styles.monthTitle}>{month.label}</Text>
                <Text style={styles.monthCount}>{month.stats.totalActivities}</Text>
                {!month.isCurrent && (
                  expanded
                    ? <ChevronUp size={18} color={lightTheme.textMuted} />
                    : <ChevronDown size={18} color={lightTheme.textMuted} />
                )}
              </TouchableOpacity>

              {expanded && (
                <View style={styles.monthContent}>
                  {/* Month-in-Review card */}
                  <MonthReviewCard stats={month.stats} isCurrent={month.isCurrent} />

                  {/* Day groups */}
                  {month.days.map((day) => (
                    <View key={day.date} style={styles.dayGroup}>
                      {/* Day header */}
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayLabel}>{day.label}</Text>
                        <Text style={styles.dayShort}>{day.shortDate}</Text>
                      </View>

                      {/* Log cards */}
                      {day.logs.map((item, index) => {
                        const activityTitle = item.activities?.title || 'Activity';
                        const activitySlug = item.activities?.slug;
                        const category = item.activities?.category || '';
                        const catColor = getCategoryColor(category);
                        const childNames = item.child_ids
                          .map((id) => childMap[id])
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <AnimatedCard key={item.id} delay={index * 30}>
                            <View style={styles.logCard}>
                              {/* Color bar */}
                              <View style={[styles.colorBar, { backgroundColor: catColor }]} />

                              {/* Card body - navigates to activity */}
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                  if (activitySlug) {
                                    router.push(`/(tabs)/browse/${activitySlug}` as any);
                                  }
                                }}
                                style={styles.logContent}
                              >
                                {/* Top: category + rating */}
                                <View style={styles.logTopRow}>
                                  <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                                    <Text style={[styles.categoryText, { color: catColor }]}>{category}</Text>
                                  </View>
                                  {item.rating && item.rating > 0 && (
                                    <View style={styles.ratingBadge}>
                                      <Star size={10} color="#F5A623" fill="#F5A623" />
                                      <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                  )}
                                </View>

                                {/* Title */}
                                <Text style={styles.logTitle} numberOfLines={1}>{activityTitle}</Text>

                                {/* Meta row: duration + children */}
                                <View style={styles.logMetaRow}>
                                  <View style={styles.metaItem}>
                                    <Clock size={11} color={lightTheme.textMuted} />
                                    <Text style={styles.metaText}>{item.duration_minutes || 30} min</Text>
                                  </View>
                                  {childNames.length > 0 && (
                                    <Text style={styles.childTag}>{childNames}</Text>
                                  )}
                                </View>

                                {/* Notes preview */}
                                {item.notes && (
                                  <Text style={styles.notesPreview} numberOfLines={1}>"{item.notes}"</Text>
                                )}
                              </TouchableOpacity>

                              {/* Edit button */}
                              <TouchableOpacity
                                onPress={() => handleEditLog(item)}
                                style={styles.editBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Edit3 size={16} color={lightTheme.textMuted} />
                              </TouchableOpacity>
                            </View>
                          </AnimatedCard>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Edit Log Bottom Sheet */}
      <EditLogModal
        log={editingLog}
        bottomSheetRef={editSheetRef}
        onSaved={() => {
          setEditingLog(null);
          refetch();
        }}
      />
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  title: { ...typography.h3, color: lightTheme.text },
  subtitle: { ...typography.uiSmall, color: lightTheme.textMuted },
  // Child pills
  childPillsContainer: { flexGrow: 0, marginBottom: spacing.md },
  childPills: { paddingHorizontal: spacing.xl, gap: 8 },
  childPill: {
    height: 32, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: lightTheme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  childPillActive: { backgroundColor: lightTheme.primary },
  childPillText: { fontSize: 13, fontWeight: '600', color: lightTheme.textSecondary },
  childPillTextActive: { color: '#FFFFFF' },
  // Scroll / List
  scrollView: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['6xl'] },
  // Month section
  monthSection: {
    marginBottom: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  monthTitle: {
    ...typography.h3,
    color: lightTheme.text,
    flex: 1,
    fontSize: 18,
  },
  monthCount: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textMuted,
    backgroundColor: lightTheme.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  monthContent: {
    gap: spacing.sm,
  },
  // Day group
  dayGroup: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  dayLabel: {
    ...typography.uiBold,
    color: lightTheme.text,
    fontSize: 14,
  },
  dayShort: {
    fontSize: 12,
    color: lightTheme.textMuted,
  },
  // Log card
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  logContent: {
    flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: 4,
  },
  logTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#F5A623' },
  logTitle: { ...typography.uiBold, color: lightTheme.text, fontSize: 15 },
  logMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: lightTheme.textMuted },
  childTag: { fontSize: 11, color: lightTheme.accent, fontWeight: '500' },
  notesPreview: { fontSize: 12, color: lightTheme.textMuted, fontStyle: 'italic' },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty
  empty: {
    alignItems: 'center', paddingTop: spacing['6xl'], gap: spacing.md,
  },
  emptyTitle: { ...typography.h3, color: lightTheme.text },
  emptyBody: { ...typography.body, color: lightTheme.textSecondary, textAlign: 'center', maxWidth: 280 },
  browseBtn: {
    backgroundColor: lightTheme.accent, borderRadius: 14,
    paddingHorizontal: spacing.xl, paddingVertical: 12, marginTop: spacing.sm,
  },
  browseBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
