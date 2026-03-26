import React from 'react';
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
  Clock,
  BookOpen,
  Users,
  Flame,
  FileText,
  FolderOpen,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TierGate } from '@/components/shared/TierGate';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface DashboardData {
  hours_this_week: number;
  areas_covered: number;
  children_count: number;
  streak: number;
  aistear_coverage: Record<string, number>;
}

const QUICK_LINKS = [
  {
    key: 'plans',
    label: 'Plans',
    description: 'Education plans',
    icon: FileText,
    color: colors.moss,
    route: '/(stack)/educator/plans',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    description: 'Learning records',
    icon: FolderOpen,
    color: colors.terracotta,
    route: '/(stack)/educator/portfolio',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    description: 'Weekly timetable',
    icon: Calendar,
    color: colors.amber,
    route: '/(stack)/educator/schedule',
  },
  {
    key: 'tusla',
    label: 'Tusla',
    description: 'Compliance',
    icon: ShieldCheck,
    color: colors.sage,
    route: '/(stack)/educator/tusla',
  },
] as const;

function EducatorDashboardContent() {
  const router = useRouter();

  const {
    data: dashboard,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<DashboardData>(
    ['educator', 'dashboard'],
    '/educator/dashboard'
  );

  if (isLoading && !dashboard) return <LoadingScreen />;

  const coverage = dashboard?.aistear_coverage || {};
  const maxCoverage = Math.max(...Object.values(coverage), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>EDUCATOR</Text>
        <Text style={styles.title}>Your classroom</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
      >
        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={18} color={colors.moss} />
            <Text style={styles.statNumber}>
              {dashboard?.hours_this_week ?? 0}
            </Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={18} color={colors.terracotta} />
            <Text style={styles.statNumber}>
              {dashboard?.areas_covered ?? 0}
            </Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={18} color={colors.amber} />
            <Text style={styles.statNumber}>
              {dashboard?.children_count ?? 0}
            </Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={18} color={colors.sage} />
            <Text style={styles.statNumber}>
              {dashboard?.streak ?? 0}
            </Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Aistear Theme Coverage */}
        {Object.keys(coverage).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aistear theme coverage</Text>
            <Card variant="elevated" padding="lg">
              {Object.entries(coverage)
                .sort(([, a], [, b]) => b - a)
                .map(([theme, count]) => (
                  <View key={theme} style={styles.breakdownRow}>
                    <View style={styles.breakdownLabel}>
                      <Text style={styles.breakdownCategory}>{theme}</Text>
                      <Text style={styles.breakdownCount}>{count}</Text>
                    </View>
                    <View style={styles.breakdownBar}>
                      <View
                        style={[
                          styles.breakdownFill,
                          {
                            width: `${(count / maxCoverage) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
            </Card>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick links</Text>
          <View style={styles.quickLinksGrid}>
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <TouchableOpacity
                  key={link.key}
                  style={styles.quickLinkCard}
                  onPress={() => router.push(link.route as any)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.quickLinkIcon,
                      { backgroundColor: `${link.color}15` },
                    ]}
                  >
                    <Icon size={22} color={link.color} />
                  </View>
                  <Text style={styles.quickLinkLabel}>{link.label}</Text>
                  <Text style={styles.quickLinkDesc}>{link.description}</Text>
                  <ChevronRight
                    size={14}
                    color={colors.stone}
                    style={styles.quickLinkArrow}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function EducatorScreen() {
  return (
    <TierGate requiredTier="educator" featureName="Educator tools">
      <EducatorDashboardContent />
    </TierGate>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: lightTheme.textMuted,
    marginBottom: 4,
  },
  title: {
    ...typography.h2,
    color: lightTheme.text,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '300',
    color: lightTheme.text,
  },
  statLabel: {
    ...typography.eyebrow,
    color: lightTheme.textMuted,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  breakdownRow: {
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  breakdownLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: lightTheme.text,
    textTransform: 'capitalize',
  },
  breakdownCount: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textSecondary,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: `${colors.stone}30`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: colors.moss,
    borderRadius: 3,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickLinkCard: {
    width: '47%',
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: 6,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickLinkLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: lightTheme.text,
  },
  quickLinkDesc: {
    fontSize: 11,
    color: lightTheme.textSecondary,
  },
  quickLinkArrow: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
});
