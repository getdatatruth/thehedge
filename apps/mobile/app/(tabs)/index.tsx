import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Sun,
  Cloud,
  CloudRain,
  Shuffle,
  Clock,
  Zap,
  Calendar,
  ArrowRight,
  Leaf,
  Feather,
  Sprout,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { hasSeenWalkthrough } from '@/lib/walkthrough';
import { TodaySkeleton } from '@/components/ui/ScreenSkeletons';
import { WeekStrip } from '@/components/today/WeekStrip';
import { ActivityCard } from '@/components/today/ActivityCard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { GuidedPathway } from '@/components/today/GuidedPathway';
import { MilestoneCard } from '@/components/today/MilestoneCard';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

// ---- Types ----

interface DashboardData {
  greeting: string;
  firstName: string;
  weather: { temperature: number; condition: string; isRaining: boolean } | null;
  daysOfLearning: number;
  activitiesThisWeek: number;
  todayActivities: Array<{
    id: string;
    title: string;
    category: string;
    slug: string;
    duration_minutes: number;
    description?: string;
    location?: string;
    energy_level?: string;
    age_min?: number;
    age_max?: number;
  }>;
  familyName: string;
  quietFloor: {
    areas: { category: string; label: string; hint: string }[];
    message: string;
  } | null;
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

function WeatherIcon({ condition, size = 16 }: { condition: string; size?: number }) {
  if (condition?.toLowerCase().includes('rain')) return <CloudRain size={size} color={lightTheme.textMuted} />;
  if (condition?.toLowerCase().includes('cloud')) return <Cloud size={size} color={lightTheme.textMuted} />;
  return <Sun size={size} color="#F5A623" />;
}

function getCategoryColor(category: string): string {
  return (categoryColors as Record<string, string>)[category] || lightTheme.accent;
}

// Reframe chips re-pick the single hero, they do not open a list.
// Each one quietly filters the candidate pool and the hero re-picks.
const REFRAMES = [
  { id: 'calm', label: 'Something calmer', Icon: Feather },
  { id: 'quick', label: "We've ten minutes", Icon: Clock },
  { id: 'outdoor', label: 'Out of doors', Icon: Sprout },
  { id: 'rain', label: "It's lashing", Icon: CloudRain },
] as const;

type ReframeId = (typeof REFRAMES)[number]['id'];

// How many leaves we show before spilling into a "+N" tail.
const SEASON_LEAF_SLOTS = 12;

function seasonForMonth(month: number): string {
  if (month <= 1 || month === 11) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

// ---- Component ----

export default function TodayScreen() {
  const router = useRouter();
  const { profile, children, family } = useAuthStore();
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const familyStyle = (family as any)?.family_style;
  const learningPath = (family as any)?.learning_path || 'mainstream';
  const educationApproach = (family as any)?.education_approach || 'blended';

  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7;
  const monday = getMonday(now);

  const [selectedDay, setSelectedDay] = useState<number>(todayDow);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // First-run: the guided walkthrough auto-starts once, the first time a family
  // lands on Today. Exitable any time; replayable from Settings.
  const walkthroughChecked = useRef(false);
  useEffect(() => {
    if (walkthroughChecked.current) return;
    walkthroughChecked.current = true;
    hasSeenWalkthrough().then((seen) => {
      if (!seen) router.push('/(stack)/walkthrough' as any);
    });
  }, [router]);
  const [heroShuffle, setHeroShuffle] = useState(0);
  const [reframe, setReframe] = useState<ReframeId | null>(null);

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

  // Milestones data
  const { data: milestoneData } = useApiQuery<{
    milestones: Array<{ id: string; name: string; emoji: string; achieved: boolean; achievedDate?: string; progress?: number; target?: number }>;
  }>(['milestones'], '/milestones', { staleTime: 600000 });

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
          time: b.time,
        }))
      );
    }
    if (selectedDay === todayDow && dashboard?.todayActivities) {
      return dashboard.todayActivities.map(a => ({
        ...a, child_name: '', completed: false, time: '',
      }));
    }
    return [];
  }, [plannerWeek, dashboard?.todayActivities, selectedDay, todayDow]);

  // Interest-to-category mapping for recommendation scoring
  const interestCategoryMap: Record<string, string[]> = {
    nature: ['nature'], art: ['art'], science: ['science'], cooking: ['kitchen'],
    sport: ['movement'], music: ['art'], stories: ['literacy'], numbers: ['maths'],
    building: ['life_skills', 'science'], animals: ['nature', 'science'],
    sensory: ['science', 'art', 'calm'], imaginative: ['social', 'literacy'],
  };
  const familyInterests = children.flatMap(c => c.interests || []);
  const preferredCategories = new Set(familyInterests.flatMap(i => interestCategoryMap[i] || []));

  // ─── The Thread: one context-aware hero, re-pickable by reframe chips ───
  // Each chip filters the candidate pool; the hero re-picks from what is left.
  const reframeMatches = (a: { duration_minutes?: number; location?: string; energy_level?: string; category?: string }): boolean => {
    if (!reframe) return true;
    const location = a.location || 'anywhere';
    if (reframe === 'calm') return a.energy_level === 'calm' || a.category === 'calm';
    if (reframe === 'quick') return (a.duration_minutes ?? 99) <= 15;
    if (reframe === 'outdoor') return ['outdoor', 'both', 'anywhere'].includes(location);
    if (reframe === 'rain') return ['indoor', 'both', 'anywhere'].includes(location);
    return true;
  };

  // Weather + interest-aware hero activity, picked from the reframed pool.
  const { heroActivity, reframeEmpty } = useMemo(() => {
    const isRaining = dashboard?.weather?.isRaining || false;

    function scoreActivity(a: { category?: string; location?: string }): number {
      let score = 0;
      // Boost activities matching family interests
      if (a.category && preferredCategories.has(a.category)) score += 2;
      // Boost weather-appropriate activities
      if (isRaining && (!a.location || a.location === 'indoor' || a.location === 'both' || a.location === 'anywhere')) score += 1;
      if (!isRaining && (a.location === 'outdoor' || a.location === 'both')) score += 1;
      return score;
    }

    // Build the base pool: today's plan if there is one, otherwise the
    // dashboard suggestions (normalised to the same shape).
    const planPool = selectedDayActivities.filter(a => !a.completed);
    const base = planPool.length > 0
      ? planPool
      : (dashboard?.todayActivities || []).map(a => ({ ...a, completed: false, child_name: '', time: '' }));

    if (base.length === 0) return { heroActivity: null, reframeEmpty: false };

    // Apply the reframe filter. If nothing matches, gently fall back to the
    // whole pool so the hero never vanishes, but flag it for a soft note.
    const filtered = base.filter(reframeMatches);
    const empty = !!reframe && filtered.length === 0;
    const pool = filtered.length > 0 ? filtered : base;

    const scored = [...pool].sort((a, b) => scoreActivity(b as any) - scoreActivity(a as any));
    const idx = heroShuffle % scored.length;
    return { heroActivity: scored[idx], reframeEmpty: empty };
  }, [selectedDayActivities, dashboard?.todayActivities, dashboard?.weather, heroShuffle, preferredCategories, reframe]);

  const hasMultipleChildren = children.length > 1;
  const isSelectedToday = selectedDay === todayDow;
  const hasPlan = selectedDayActivities.length > 0;
  const isFirstTime = (dashboard?.activitiesThisWeek || 0) === 0 && (dashboard?.daysOfLearning || 0) === 0;

  // ─── Your season so far: accumulating leaves, not a score ───
  const season = seasonForMonth(now.getMonth());
  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);
  const moments = dashboard?.daysOfLearning || 0;
  const leavesFilled = Math.min(moments, SEASON_LEAF_SLOTS);

  // Day header
  const selectedDate = getDateForDayIndex(monday, selectedDay);
  const dayHeader = isSelectedToday
    ? `Today, ${DAY_NAMES_SHORT[selectedDay]} ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}`
    : `${DAY_NAMES_FULL[selectedDay]}, ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]}`;

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Weather context for hero
  const weatherContext = dashboard?.weather
    ? `${Math.round(dashboard.weather.temperature)} degrees and ${dashboard.weather.condition?.toLowerCase()}`
    : '';

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
        {/* ─── SPARK: follow the child's curiosity in the moment ─── */}
        <AnimatedCard delay={0}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(stack)/spark' as any);
            }}
            style={styles.sparkCard}
          >
            <View style={styles.sparkDecor} pointerEvents="none">
              <Sparkles size={150} color="rgba(76,175,124,0.10)" strokeWidth={1} />
            </View>
            <View style={styles.sparkIcon}>
              <Sparkles size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.sparkKicker}>FOLLOW A SPARK</Text>
            <Text style={styles.sparkTitle}>What are they curious about today?</Text>
            <Text style={styles.sparkSubtitle}>
              Tell me in your own words and I'll shape one lovely activity around it, tied quietly to the curriculum.
            </Text>
            <View style={styles.sparkCtaBtn}>
              <Text style={styles.sparkCtaText}>Shape an activity</Text>
              <ArrowRight size={16} color={lightTheme.primary} />
            </View>
          </TouchableOpacity>
        </AnimatedCard>

        {/* ─── QUIET FLOOR: gentle nudge toward an area that has gone quiet ─── */}
        {dashboard?.quietFloor && (
          <AnimatedCard delay={50}>
            <View style={styles.quietCard}>
              <View style={styles.quietHeader}>
                <Feather size={15} color={lightTheme.accent} />
                <Text style={styles.quietTitle}>A gentle nudge</Text>
              </View>
              <Text style={styles.quietMessage}>{dashboard.quietFloor.message}</Text>
              <TouchableOpacity
                style={styles.quietCta}
                activeOpacity={0.85}
                onPress={() => {
                  const a = dashboard.quietFloor!.areas[0];
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(
                    `/(stack)/spark?lean=${a.category}&leanLabel=${encodeURIComponent(a.label)}&leanHint=${encodeURIComponent(a.hint)}` as any,
                  );
                }}
              >
                <Text style={styles.quietCtaText}>Shape a spark that leans that way</Text>
                <ArrowRight size={16} color={lightTheme.accent} />
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}

        {/* ─── REFRAME CHIPS: re-pick the one hero, not open a list ─── */}
        {isSelectedToday && heroActivity && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reframeRow}
            style={{ flexGrow: 0 }}
          >
            {REFRAMES.map(({ id, label, Icon }) => {
              const active = reframe === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReframe(active ? null : id);
                    setHeroShuffle(0);
                  }}
                  style={[styles.reframeChip, active && styles.reframeChipActive]}
                >
                  <Icon size={13} color={active ? '#FFFFFF' : lightTheme.textSecondary} />
                  <Text style={[styles.reframeChipText, active && styles.reframeChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ─── HERO RECOMMENDATION ─── */}
        {isSelectedToday && heroActivity && (
          <AnimatedCard delay={0}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                const slug = (heroActivity as any).slug;
                if (slug) router.push(`/(tabs)/browse/${slug}` as any);
              }}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <View style={styles.heroLabelRow}>
                  <Leaf size={14} color={lightTheme.accent} />
                  <Text style={styles.heroLabel}>
                    {reframe === 'calm' ? 'Something gentler'
                      : reframe === 'quick' ? 'A quick one'
                      : reframe === 'outdoor' ? 'Out in the fresh air'
                      : reframe === 'rain' ? 'Cosy and indoors'
                      : isFirstTime ? 'Start here'
                      : hasPlan ? (educationApproach === 'structured' ? "Today's schedule" : 'Up next')
                      : dashboard?.weather?.isRaining ? 'Perfect for a rainy day'
                      : educationApproach === 'child_led' ? 'Inspiration for today'
                      : educationApproach === 'exploratory' ? 'Seasonal activity'
                      : educationApproach === 'relaxed' ? 'If you fancy it...'
                      : 'Try this today'}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{heroActivity.title}</Text>

              <View style={styles.heroMeta}>
                <View style={[styles.heroCategoryBadge, { backgroundColor: getCategoryColor(heroActivity.category) + '20' }]}>
                  <Text style={[styles.heroCategoryText, { color: getCategoryColor(heroActivity.category) }]}>
                    {heroActivity.category.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Clock size={12} color={lightTheme.textMuted} />
                  <Text style={styles.heroMetaText}>{heroActivity.duration_minutes} min</Text>
                </View>
                {heroActivity.time && (
                  <View style={styles.heroMetaItem}>
                    <Calendar size={12} color={lightTheme.textMuted} />
                    <Text style={styles.heroMetaText}>{heroActivity.time}</Text>
                  </View>
                )}
              </View>

              {reframeEmpty && (
                <Text style={styles.reframeNote}>
                  Nothing matched that just now, so here is another gentle idea.
                </Text>
              )}

              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Let's do this</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHeroShuffle(s => s + 1);
                }}
                style={styles.heroAnother}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Shuffle size={13} color={lightTheme.textMuted} />
                <Text style={styles.heroAnotherText}>Show me another</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </AnimatedCard>
        )}

        {/* ─── FIRST TIME GUIDANCE ─── */}
        {isFirstTime && isSelectedToday && !hasPlan && (
          <AnimatedCard delay={100}>
            <View style={styles.guidanceCard}>
              <Text style={styles.guidanceTitle}>Welcome to The Hedge</Text>
              <Text style={styles.guidanceBody}>
                {educationApproach === 'structured'
                  ? "Generate your first weekly plan - we'll balance curriculum areas and match activities to each child's age and stage."
                  : educationApproach === 'child_led'
                    ? "Browse activities that match your children's interests. Log what you do and we'll track their learning journey."
                  : educationApproach === 'exploratory'
                    ? "Explore seasonal, nature-led activities. We'll suggest what's right for this time of year."
                  : educationApproach === 'relaxed'
                    ? "Browse whenever you need inspiration. No schedules, no pressure - just ideas for when you want them."
                  : learningPath === 'homeschool'
                    ? "Generate your first weekly plan - we'll balance curriculum areas and match activities to each child's age and interests."
                  : learningPath === 'considering'
                    ? "Try a few activities this week to see how homeschooling feels. No pressure - just explore."
                    : "Pick an activity above and try it with your kids. Log it when you're done and we'll suggest what to try next."
                }
              </Text>
              <View style={styles.guidanceActions}>
                {educationApproach !== 'relaxed' && (learningPath === 'homeschool' || learningPath === 'considering') ? (
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/plan' as any)}
                    style={styles.guidancePrimaryBtn}
                  >
                    <Calendar size={14} color="#FFFFFF" />
                    <Text style={styles.guidancePrimaryText}>
                      {educationApproach === 'child_led' ? 'Browse ideas' : educationApproach === 'exploratory' ? 'Seasonal activities' : 'Generate your plan'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/browse')}
                  style={styles.guidanceSecondaryBtn}
                >
                  <Text style={styles.guidanceSecondaryText}>Browse activities</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* ─── WEEK STRIP ─── */}
        <WeekStrip
          activitiesByDay={activitiesByDay}
          selectedDay={selectedDay}
          onDayPress={(i) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(i); }}
          weekLabel={`Week ${getWeekNumber(now)}`}
          weekStart={monday}
        />

        {/* Child filter */}
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
            daysOfLearning: dashboard?.daysOfLearning,
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
            <Text style={styles.dayCount}>
              {selectedDayActivities.filter(a => a.completed).length}/{selectedDayActivities.length} done
            </Text>
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
          !isFirstTime && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No activities for {DAY_NAMES_FULL[selectedDay]}</Text>
              <Text style={styles.emptyBody}>
                {learningPath === 'homeschool'
                  ? 'Generate a plan to fill your week with balanced learning activities.'
                  : 'Browse activities or generate a plan for the week.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/plan' as any)}
                  style={styles.emptyPrimaryBtn}
                >
                  <Zap size={14} color="#FFFFFF" />
                  <Text style={styles.emptyPrimaryText}>Generate plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/browse')}
                  style={styles.emptySecondaryBtn}
                >
                  <Text style={styles.emptySecondaryText}>Browse</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* ─── GUIDED PATHWAY (new users, first 7 days) ─── */}
        {isFirstTime && isSelectedToday && (
          <GuidedPathway
            learningPath={learningPath}
            daysActive={0}
            activitiesCompleted={dashboard?.activitiesThisWeek || 0}
            onNavigate={(route) => router.push(route as any)}
          />
        )}

        {/* ─── MILESTONE CARD (near achievement) ─── */}
        {milestoneData?.milestones?.map(m => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            onPress={() => router.push('/(tabs)/progress' as any)}
          />
        ))}

        {/* ─── YOUR SEASON SO FAR: accumulating leaves, not a score ─── */}
        <TouchableOpacity
          style={styles.seasonCard}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/progress' as any)}
        >
          <Text style={styles.seasonLabel}>Your {seasonLabel.toLowerCase()} so far</Text>
          <View style={styles.seasonLeaves}>
            {Array.from({ length: SEASON_LEAF_SLOTS }).map((_, i) => (
              <Leaf
                key={i}
                size={18}
                color={i < leavesFilled ? lightTheme.accent : lightTheme.border}
                fill={i < leavesFilled ? lightTheme.accent : 'none'}
              />
            ))}
            {moments > SEASON_LEAF_SLOTS && (
              <Text style={styles.seasonOverflow}>+{moments - SEASON_LEAF_SLOTS}</Text>
            )}
          </View>
          <Text style={styles.seasonNote}>
            {moments === 0
              ? 'Nothing kept yet this season. Your first one is waiting just above.'
              : `You have kept ${moments} ${moments === 1 ? 'moment' : 'moments'} together this ${seasonLabel.toLowerCase()}. Lovely.`}
          </Text>
        </TouchableOpacity>

        {/* ─── Browse all ideas (gentle) ─── */}
        <TouchableOpacity
          style={styles.browseLink}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/browse')}
        >
          <Text style={styles.browseLinkText}>Browse all ideas</Text>
          <ArrowRight size={15} color={lightTheme.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  greeting: { ...typography.uiBold, color: lightTheme.text },
  familyName: { ...typography.uiSmall, color: lightTheme.textMuted },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: lightTheme.surface, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6,
  },
  weatherText: { fontSize: 13, fontWeight: '600', color: lightTheme.textSecondary },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: lightTheme.surface, alignItems: 'center', justifyContent: 'center',
  },
  // Scroll
  scroll: {
    paddingHorizontal: spacing.xl, paddingBottom: spacing['6xl'], gap: spacing.lg,
  },
  // Spark card (follow the child's curiosity) - the hero of Today
  sparkCard: {
    backgroundColor: lightTheme.primary,
    borderRadius: 24,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  sparkDecor: { position: 'absolute', top: -30, right: -30 },
  sparkIcon: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: lightTheme.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sparkKicker: {
    ...typography.uiSmall,
    color: lightTheme.accent,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  sparkTitle: { ...typography.h2, color: '#FFFFFF', marginBottom: spacing.sm },
  sparkSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.72)', lineHeight: 20, marginBottom: spacing.lg },
  sparkCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  sparkCtaText: { ...typography.uiBold, color: lightTheme.primary },
  // Quiet Floor nudge (calm, never shaming)
  quietCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: lightTheme.borderLight,
  },
  quietHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  quietTitle: { ...typography.uiSmall, color: lightTheme.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  quietMessage: { ...typography.body, color: lightTheme.textSecondary, lineHeight: 22 },
  quietCta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  quietCtaText: { ...typography.uiBold, color: lightTheme.accent },
  // Hero card
  heroCard: {
    backgroundColor: lightTheme.surface, borderRadius: 20, padding: spacing.xl,
    borderLeftWidth: 4, borderLeftColor: lightTheme.accent,
  },
  heroHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLabel: {
    fontSize: 12, fontWeight: '700', color: lightTheme.accent,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: lightTheme.text, lineHeight: 28, marginBottom: spacing.md },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  heroCategoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  heroCategoryText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { fontSize: 12, color: lightTheme.textMuted },
  reframeNote: {
    fontSize: 13, color: lightTheme.textSecondary, lineHeight: 19,
    fontStyle: 'italic', marginBottom: spacing.md,
  },
  heroCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: lightTheme.accent, borderRadius: radius.lg, paddingVertical: 12,
  },
  heroCtaText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  heroAnother: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingTop: spacing.md,
  },
  heroAnotherText: { fontSize: 13, fontWeight: '500', color: lightTheme.textMuted },
  // Reframe chips
  reframeRow: { gap: 8, paddingVertical: 2 },
  reframeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 34, paddingHorizontal: 14, borderRadius: 17,
    backgroundColor: lightTheme.surface,
  },
  reframeChipActive: { backgroundColor: lightTheme.primary },
  reframeChipText: { fontSize: 13, fontWeight: '500', color: lightTheme.textSecondary },
  reframeChipTextActive: { color: '#FFFFFF' },
  // First time guidance
  guidanceCard: {
    backgroundColor: `${lightTheme.accent}08`, borderRadius: 16,
    padding: spacing.xl, borderWidth: 1, borderColor: `${lightTheme.accent}20`,
  },
  guidanceTitle: { ...typography.h3, color: lightTheme.text, marginBottom: spacing.xs },
  guidanceBody: { ...typography.body, color: lightTheme.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  guidanceActions: { flexDirection: 'row', gap: spacing.sm },
  guidancePrimaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: lightTheme.primary, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  guidancePrimaryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  guidanceSecondaryBtn: {
    backgroundColor: lightTheme.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  guidanceSecondaryText: { fontSize: 14, fontWeight: '600', color: lightTheme.textSecondary },
  // Child pills
  childPills: { gap: 8 },
  childPill: {
    height: 32, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: lightTheme.surface, justifyContent: 'center', alignItems: 'center',
  },
  childPillActive: { backgroundColor: lightTheme.primary },
  childPillText: { fontSize: 13, fontWeight: '600', color: lightTheme.textSecondary },
  childPillTextActive: { color: '#FFFFFF' },
  // Day header
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dayHeaderText: { ...typography.h3, color: lightTheme.text },
  dayCount: { ...typography.uiSmall, color: lightTheme.accent, fontWeight: '600' },
  // Activities
  activityList: { gap: spacing.md },
  emptyCard: {
    backgroundColor: lightTheme.surface, borderRadius: 16,
    padding: spacing['2xl'], alignItems: 'center', gap: spacing.sm,
  },
  emptyTitle: { ...typography.uiBold, color: lightTheme.text },
  emptyBody: { ...typography.bodySmall, color: lightTheme.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  emptyPrimaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: lightTheme.accent, borderRadius: 14,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  emptyPrimaryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  emptySecondaryBtn: {
    backgroundColor: lightTheme.background, borderRadius: 14,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderWidth: 1, borderColor: lightTheme.border,
  },
  emptySecondaryText: { fontSize: 14, fontWeight: '600', color: lightTheme.textSecondary },
  // Your season so far (accumulating leaves)
  seasonCard: {
    backgroundColor: lightTheme.surface, borderRadius: 16,
    padding: spacing.xl,
  },
  seasonLabel: {
    fontSize: 12, fontWeight: '700', color: lightTheme.accent,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },
  seasonLeaves: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: spacing.md },
  seasonOverflow: { fontSize: 13, fontWeight: '600', color: lightTheme.accent, marginLeft: 4 },
  seasonNote: { fontSize: 14, color: lightTheme.textSecondary, lineHeight: 21 },
  // Browse all ideas
  browseLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: spacing.sm,
  },
  browseLinkText: { fontSize: 14, fontWeight: '500', color: lightTheme.textSecondary },
});
