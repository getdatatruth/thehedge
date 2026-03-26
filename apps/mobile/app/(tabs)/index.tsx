import React, { useState, useMemo } from 'react';
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
  Bell,
  Sparkles,
  Plus,
  Flame,
  Activity,
  Leaf,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { TodaySkeleton } from '@/components/ui/ScreenSkeletons';
import { WeekStrip } from '@/components/today/WeekStrip';
import { ActivityCard } from '@/components/today/ActivityCard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// ---- Types ----

interface DashboardData {
  greeting: string;
  firstName: string;
  weather: { temperature: number; condition: string; isRaining: boolean } | null;
  streak: number;
  activitiesThisWeek: number;
  todayActivities: Array<{
    id: string;
    title: string;
    category: string;
    slug: string;
    duration_minutes: number;
  }>;
  familyName: string;
}

interface PlanDayBlock {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface PlanDay {
  id: string;
  date: string;
  child_id: string;
  child_name: string;
  blocks: PlanDayBlock[];
}

interface PlannerWeekData {
  week_start: string;
  week_end: string;
  days: PlanDay[];
}

// ---- Helpers ----

const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + 1) / 7);
}

function dateToDayIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return (d.getDay() + 6) % 7;
}

function getDateForDayIndex(monday: Date, dayIndex: number): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

function WeatherIcon({ condition }: { condition: string }) {
  if (condition?.toLowerCase().includes('rain')) return <CloudRain size={16} color={lightTheme.textMuted} />;
  if (condition?.toLowerCase().includes('cloud')) return <Cloud size={16} color={lightTheme.textMuted} />;
  return <Sun size={16} color="#F5A623" />;
}

// ---- Component ----

export default function TodayScreen() {
  const router = useRouter();
  const { profile, children, family } = useAuthStore();
  const firstName = profile?.name?.split(' ')[0] || 'there';

  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7;
  const monday = getMonday(now);

  const [selectedDay, setSelectedDay] = useState<number>(todayDow);
  const [selectedChild, setSelectedChild] = useState<string | null>(null); // null = all

  // Dashboard data
  const {
    data: dashboard,
    isLoading: dashLoading,
    refetch: refetchDash,
    isRefetching: dashRefetching,
  } = useApiQuery<DashboardData>(['dashboard'], '/me/dashboard', { staleTime: 300000 });

  // Planner week data
  const plannerPath = selectedChild ? `/planner?child_id=${selectedChild}` : '/planner';
  const {
    data: plannerWeek,
    isLoading: planLoading,
    refetch: refetchPlan,
    isRefetching: planRefetching,
  } = useApiQuery<PlannerWeekData>(
    ['planner-week', selectedChild || 'all'],
    plannerPath,
    { staleTime: 300000 }
  );

  const isLoading = dashLoading || planLoading;
  const isRefetching = dashRefetching || planRefetching;
  const handleRefresh = () => { refetchDash(); refetchPlan(); };

  // Build week dots from planner data
  const activitiesByDay = useMemo(() => {
    const byDay: Record<number, { category: string }[]> = {};
    if (plannerWeek?.days?.length) {
      for (const day of plannerWeek.days) {
        const idx = dateToDayIndex(day.date);
        if (!byDay[idx]) byDay[idx] = [];
        for (const b of day.blocks) byDay[idx].push({ category: b.subject });
      }
    } else if (dashboard?.todayActivities) {
      byDay[todayDow] = dashboard.todayActivities.map(a => ({ category: a.category }));
    }
    return byDay;
  }, [plannerWeek, dashboard?.todayActivities, todayDow]);

  // Get activities for selected day
  const selectedDayActivities = useMemo(() => {
    if (plannerWeek?.days?.length) {
      const matching = plannerWeek.days.filter(d => dateToDayIndex(d.date) === selectedDay);
      return matching.flatMap(day =>
        day.blocks.map(b => ({
          id: `${day.id}-${b.time}-${b.title}`,
          title: b.title,
          category: b.subject,
          slug: b.activity_id,
          duration_minutes: b.duration,
          child_name: day.child_name,
          completed: b.completed,
        }))
      );
    }
    if (selectedDay === todayDow && dashboard?.todayActivities) {
      return dashboard.todayActivities.map(a => ({
        ...a, child_name: '', completed: false, duration_minutes: a.duration_minutes,
      }));
    }
    return [];
  }, [plannerWeek, dashboard?.todayActivities, selectedDay, todayDow]);

  const hasMultipleChildren = children.length > 1;
  const isSelectedToday = selectedDay === todayDow;

  // Day header
  const selectedDate = getDateForDayIndex(monday, selectedDay);
  const dayHeader = isSelectedToday
    ? `Today, ${DAY_NAMES_SHORT[selectedDay]} ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}`
    : `${DAY_NAMES_FULL[selectedDay]}, ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}`;

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading && !dashboard) return <TodaySkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(firstName || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>{greeting}, {firstName}</Text>
            <Text style={styles.familyName}>{family?.name || 'Your family'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Compact weather */}
          {dashboard?.weather && (
            <View style={styles.weatherPill}>
              <WeatherIcon condition={dashboard.weather.condition} />
              <Text style={styles.weatherText}>{Math.round(dashboard.weather.temperature)}{'\u00B0'}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push('/(stack)/notifications' as any)}
            style={styles.headerButton}
          >
            <Bell size={20} color={lightTheme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={lightTheme.accent} />
        }
      >
        {/* Week Strip */}
        <WeekStrip
          activitiesByDay={activitiesByDay}
          selectedDay={selectedDay}
          onDayPress={(i) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(i); }}
          weekLabel={`Week ${getWeekNumber(now)}`}
          weekStart={monday}
        />

        {/* Child filter (if multiple children) */}
        {hasMultipleChildren && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childPills} style={{ flexGrow: 0 }}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedChild(null); }}
              style={[styles.childPill, !selectedChild && styles.childPillActive]}
            >
              <Text style={[styles.childPillText, !selectedChild && styles.childPillTextActive]}>All</Text>
            </TouchableOpacity>
            {children.map(c => (
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

        {/* AI Insight */}
        <InsightCard
          type="today"
          context={{
            children,
            weather: dashboard?.weather,
            streak: dashboard?.streak,
            activitiesThisWeek: dashboard?.activitiesThisWeek,
            todayActivities: selectedDayActivities,
            categoryBreakdown: activitiesByDay,
          }}
          enabled={!!dashboard}
        />

        {/* Day header */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{dayHeader}</Text>
          {selectedDayActivities.length > 0 && (
            <Text style={styles.dayCount}>{selectedDayActivities.length} activit{selectedDayActivities.length === 1 ? 'y' : 'ies'}</Text>
          )}
        </View>

        {/* Activities for selected day */}
        {selectedDayActivities.length > 0 ? (
          <View style={styles.activityList}>
            {selectedDayActivities.map((activity, index) => (
              <AnimatedCard key={activity.id} delay={index * 50}>
                <ActivityCard
                  title={activity.title}
                  category={activity.category}
                  durationMinutes={activity.duration_minutes}
                  childName={hasMultipleChildren && !selectedChild ? activity.child_name : undefined}
                  completed={activity.completed}
                  onPress={() => {
                    const slug = (activity as any).slug;
                    if (slug) router.push(`/(tabs)/browse/${slug}` as any);
                  }}
                />
              </AnimatedCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Sparkles size={24} color={lightTheme.accent} />
            <Text style={styles.emptyTitle}>No activities for {DAY_NAMES_FULL[selectedDay]}</Text>
            <Text style={styles.emptyBody}>Add activities or generate a plan from the Plan tab.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/browse')}
              style={styles.addButton}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Browse activities</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compact stats row - inline, not big cards */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Flame size={14} color="#E8735A" />
            <Text style={styles.statValue}>{dashboard?.streak || 0}</Text>
            <Text style={styles.statLabel}>streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Activity size={14} color={lightTheme.accent} />
            <Text style={styles.statValue}>{dashboard?.activitiesThisWeek || 0}</Text>
            <Text style={styles.statLabel}>this week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Leaf size={14} color={lightTheme.accent} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>score</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  greeting: { ...typography.uiBold, color: lightTheme.text },
  familyName: { ...typography.uiSmall, color: lightTheme.textMuted },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: lightTheme.surface,
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6,
  },
  weatherText: { fontSize: 13, fontWeight: '600', color: lightTheme.textSecondary },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  // Scroll
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
    gap: spacing.lg,
  },
  // Child pills
  childPills: { gap: 8 },
  childPill: {
    height: 32, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: lightTheme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  childPillActive: { backgroundColor: lightTheme.primary },
  childPillText: { fontSize: 13, fontWeight: '600', color: lightTheme.textSecondary },
  childPillTextActive: { color: '#FFFFFF' },
  // Day header
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dayHeaderText: { ...typography.h3, color: lightTheme.text },
  dayCount: { ...typography.uiSmall, color: lightTheme.textMuted },
  // Activities
  activityList: { gap: spacing.md },
  emptyCard: {
    backgroundColor: lightTheme.surface, borderRadius: 16,
    padding: spacing['2xl'], alignItems: 'center', gap: spacing.sm,
  },
  emptyTitle: { ...typography.uiBold, color: lightTheme.text },
  emptyBody: { ...typography.bodySmall, color: lightTheme.textSecondary, textAlign: 'center' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: lightTheme.accent, borderRadius: 14,
    paddingHorizontal: spacing.lg, paddingVertical: 10, marginTop: spacing.xs,
  },
  addButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  // Compact stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: lightTheme.surface, borderRadius: 16,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xl,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: lightTheme.text },
  statLabel: { fontSize: 11, color: lightTheme.textMuted },
  statDivider: { width: 1, height: 20, backgroundColor: lightTheme.borderLight },
});
