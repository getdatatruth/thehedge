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
  AlertCircle,
  Info,
  FileText,
  Clock,
  FolderOpen,
  CalendarCheck,
} from 'lucide-react-native';
// Note: AEARS (the Tusla assessment of education in a place other than a
// recognised school) sets NO minimum number of hours or attendance days.
// We show honest record summaries here, never fabricated pass/fail thresholds.
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TierGate } from '@/components/shared/TierGate';
import { lightTheme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface ChildCompliance {
  child_id: string;
  child_name: string;
  academic_year: string;
  approach: string;
  registration_status: 'registered' | 'pending' | 'not_registered';
  education_plan_filed: boolean;
  hours_logged: number;
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

interface RecordRowProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
}

function RecordRow({ icon, label, detail }: RecordRowProps) {
  return (
    <View style={checkStyles.item}>
      <View style={checkStyles.iconWrap}>
        {icon}
      </View>
      <View style={checkStyles.content}>
        <Text style={checkStyles.label}>{label}</Text>
        <Text style={checkStyles.detail}>{detail}</Text>
      </View>
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
    borderBottomColor: `${lightTheme.border}40`,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${lightTheme.primary}10`,
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
    color: lightTheme.text,
  },
  detail: {
    fontSize: 11,
    color: lightTheme.textSecondary,
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
          <ChevronLeft size={20} color={lightTheme.text} />
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
            tintColor={lightTheme.primary}
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
              <RecordRow
                icon={<FileText size={16} color={lightTheme.primary} />}
                label="Education plan"
                detail={
                  child.education_plan_filed
                    ? 'Plan on file'
                    : 'No plan on file yet'
                }
              />
              <RecordRow
                icon={<CalendarCheck size={16} color={lightTheme.primary} />}
                label="Days of learning logged"
                detail={`${child.attendance_records} ${
                  child.attendance_records === 1 ? 'day' : 'days'
                } recorded`}
              />
              <RecordRow
                icon={<Clock size={16} color={lightTheme.primary} />}
                label="Hours noted"
                detail={`${child.hours_logged} ${
                  child.hours_logged === 1 ? 'hour' : 'hours'
                } noted this year`}
              />
              <RecordRow
                icon={<FolderOpen size={16} color={lightTheme.primary} />}
                label="Portfolio entries"
                detail={`${child.portfolio_entries} ${
                  child.portfolio_entries === 1 ? 'entry' : 'entries'
                } recorded`}
              />
            </Card>

            <Text style={styles.recordNote}>
              AEARS assesses whether a certain minimum education is being
              provided. There is no minimum number of hours or attendance days.
            </Text>
          </View>
        ))}

        {children.length === 0 && (
          <View style={styles.emptyState}>
            <AlertCircle size={32} color={`${lightTheme.textSecondary}40`} />
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptyBody}>
              Create an education plan to start keeping a record of your
              learning together.
            </Text>
          </View>
        )}

        {/* Info Card */}
        <Card variant="elevated" padding="lg">
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Info size={18} color={lightTheme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>About Tusla registration</Text>
              <Text style={styles.infoBody}>
                Under Section 14 of the Education (Welfare) Act 2000, parents who
                choose to educate their children outside of a recognised school
                register with Tusla. The assessment (AEARS) looks at whether a
                certain minimum education is being provided. There is no minimum
                number of hours or attendance days. The records here are simply a
                helpful summary you can draw on if an assessment is requested.
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '300', color: lightTheme.text },
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
    color: lightTheme.text,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  childMetaText: {
    fontSize: 13,
    color: lightTheme.textSecondary,
    textTransform: 'capitalize',
  },
  childMetaDot: {
    fontSize: 13,
    color: `${lightTheme.textSecondary}60`,
  },
  recordNote: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: lightTheme.text,
  },
  emptyBody: {
    fontSize: 14,
    color: lightTheme.textSecondary,
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
    backgroundColor: `${lightTheme.primary}10`,
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
    color: lightTheme.text,
  },
  infoBody: {
    fontSize: 12,
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
});
