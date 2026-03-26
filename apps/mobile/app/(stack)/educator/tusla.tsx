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
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Clock,
  FolderOpen,
  CalendarCheck,
} from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TierGate } from '@/components/shared/TierGate';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface ChildCompliance {
  child_id: string;
  child_name: string;
  academic_year: string;
  approach: string;
  registration_status: 'registered' | 'pending' | 'not_registered';
  education_plan_filed: boolean;
  hours_logged: number;
  hours_required: number;
  portfolio_entries: number;
  attendance_records: number;
}

interface TuslaData {
  children: ChildCompliance[];
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'registered'
      ? 'moss'
      : status === 'pending'
      ? 'amber'
      : 'terra';
  return (
    <Badge variant={variant} size="sm">
      {status.replace('_', ' ')}
    </Badge>
  );
}

interface ChecklistItemProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
  passed: boolean;
}

function ChecklistItem({ icon, label, detail, passed }: ChecklistItemProps) {
  return (
    <View style={checkStyles.item}>
      <View style={checkStyles.iconWrap}>
        {icon}
      </View>
      <View style={checkStyles.content}>
        <Text style={checkStyles.label}>{label}</Text>
        <Text style={checkStyles.detail}>{detail}</Text>
      </View>
      {passed ? (
        <CheckCircle size={20} color={colors.moss} />
      ) : (
        <AlertCircle size={20} color={colors.amber} />
      )}
    </View>
  );
}

const checkStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${colors.moss}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  detail: {
    fontSize: 11,
    color: colors.clay,
  },
});

export default function TuslaScreen() {
  const router = useRouter();

  const {
    data: tuslaData,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<TuslaData>(['educator', 'tusla'], '/educator/tusla');

  if (isLoading && !tuslaData) return <LoadingScreen />;

  const children = tuslaData?.children || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tusla Compliance</Text>
      </View>

      <TierGate requiredTier="educator" featureName="Educator Dashboard">
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
        {children.map((child) => (
          <View key={child.child_id} style={styles.childSection}>
            <View style={styles.childHeader}>
              <Text style={styles.childName}>{child.child_name}</Text>
              <StatusBadge status={child.registration_status} />
            </View>

            <View style={styles.childMeta}>
              <Text style={styles.childMetaText}>
                {child.academic_year}
              </Text>
              <Text style={styles.childMetaDot}>-</Text>
              <Text style={styles.childMetaText}>
                {child.approach.replace('_', ' ')}
              </Text>
            </View>

            <Card variant="elevated" padding="lg">
              <ChecklistItem
                icon={<FileText size={16} color={colors.moss} />}
                label="Education plan filed"
                detail={
                  child.education_plan_filed
                    ? 'Plan submitted'
                    : 'No plan on file'
                }
                passed={child.education_plan_filed}
              />
              <ChecklistItem
                icon={<Clock size={16} color={colors.moss} />}
                label="Hours logged"
                detail={`${child.hours_logged} of ${child.hours_required} hours`}
                passed={child.hours_logged >= child.hours_required}
              />
              <ChecklistItem
                icon={<FolderOpen size={16} color={colors.moss} />}
                label="Portfolio entries"
                detail={`${child.portfolio_entries} entries recorded`}
                passed={child.portfolio_entries >= 5}
              />
              <ChecklistItem
                icon={<CalendarCheck size={16} color={colors.moss} />}
                label="Attendance records"
                detail={`${child.attendance_records} days logged`}
                passed={child.attendance_records >= 20}
              />
            </Card>
          </View>
        ))}

        {children.length === 0 && (
          <View style={styles.emptyState}>
            <AlertCircle size={32} color={`${colors.clay}40`} />
            <Text style={styles.emptyTitle}>No compliance data</Text>
            <Text style={styles.emptyBody}>
              Create education plans to start tracking Tusla compliance.
            </Text>
          </View>
        )}

        {/* Info Card */}
        <Card variant="elevated" padding="lg">
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Info size={18} color={colors.moss} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>About Tusla requirements</Text>
              <Text style={styles.infoBody}>
                Under Section 14 of the Education (Welfare) Act 2000, parents
                who choose to educate their children outside of a recognised
                school must register with Tusla. You are required to provide an
                education that meets certain minimum standards, keep records of
                educational activity, and make these available for assessment if
                requested.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
      </TierGate>
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
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '300', color: colors.ink },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  childSection: {
    gap: spacing.md,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  childMetaText: {
    fontSize: 13,
    color: colors.clay,
    textTransform: 'capitalize',
  },
  childMetaDot: {
    fontSize: 13,
    color: `${colors.clay}60`,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.clay,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.moss}10`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  infoBody: {
    fontSize: 12,
    color: colors.clay,
    lineHeight: 18,
  },
});
