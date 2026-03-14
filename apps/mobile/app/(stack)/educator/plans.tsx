import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  FileText,
  Minus,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { useApiQuery, useApiPost } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface EducationPlan {
  id: string;
  child_id: string;
  child_name: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
  curriculum_areas: string[];
}

interface CreatePlanBody {
  child_id: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
}

const APPROACHES = [
  { key: 'structured', label: 'Structured' },
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'child_led', label: 'Child-led' },
  { key: 'blended', label: 'Blended' },
  { key: 'exploratory', label: 'Exploratory' },
] as const;

export default function PlansScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useAuthStore();
  const bottomSheetRef = useRef<SimpleBottomSheetRef>(null);

  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? '');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [approach, setApproach] = useState('blended');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const {
    data: plans,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<EducationPlan[]>(['educator', 'plans'], '/educator/plans');

  const createPlan = useApiPost<EducationPlan, CreatePlanBody>(
    '/educator/plans',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['educator'] });
        bottomSheetRef.current?.close();
        resetForm();
      },
      onError: (err) => Alert.alert('Error', err.message),
    }
  );

  const resetForm = () => {
    setSelectedChildId(children[0]?.id ?? '');
    setAcademicYear('2025-2026');
    setApproach('blended');
    setHoursPerDay(3);
    setDaysPerWeek(5);
  };

  const handleSubmit = () => {
    if (!selectedChildId) {
      Alert.alert('Error', 'Please select a child');
      return;
    }
    createPlan.mutate({
      child_id: selectedChildId,
      academic_year: academicYear,
      approach,
      hours_per_day: hoursPerDay,
      days_per_week: daysPerWeek,
    });
  };

  const plansList = plans || [];
  const grouped = plansList.reduce<Record<string, EducationPlan[]>>((acc, plan) => {
    const name = plan.child_name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(plan);
    return acc;
  }, {});

  if (isLoading && !plans) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education Plans</Text>
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
        {plansList.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} color={`${colors.clay}40`} />}
            title="No education plans"
            message="Create an education plan for each child to track their learning approach and hours."
            actionLabel="Add plan"
            onAction={() => bottomSheetRef.current?.expand()}
          />
        ) : (
          Object.entries(grouped).map(([childName, childPlans]) => (
            <View key={childName} style={styles.childGroup}>
              <Text style={styles.childGroupTitle}>{childName}</Text>
              {childPlans.map((plan) => (
                <Card key={plan.id} variant="elevated" padding="lg">
                  <View style={styles.planHeader}>
                    <Text style={styles.planYear}>{plan.academic_year}</Text>
                    <Badge variant="sage" size="sm">
                      {plan.approach.replace('_', '-')}
                    </Badge>
                  </View>
                  <View style={styles.planMeta}>
                    <Text style={styles.planMetaText}>
                      {plan.hours_per_day}h/day
                    </Text>
                    <Text style={styles.planMetaDot}>-</Text>
                    <Text style={styles.planMetaText}>
                      {plan.days_per_week} days/week
                    </Text>
                  </View>
                  {plan.curriculum_areas && plan.curriculum_areas.length > 0 && (
                    <View style={styles.areaBadges}>
                      {plan.curriculum_areas.map((area) => (
                        <Badge key={area} variant="stone" size="sm">
                          {area}
                        </Badge>
                      ))}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => bottomSheetRef.current?.expand()}
          activeOpacity={0.8}
        >
          <Plus size={22} color={colors.parchment} />
        </TouchableOpacity>
      </View>

      <SimpleBottomSheet ref={bottomSheetRef} snapPoint="75%" scrollable>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Add education plan</Text>

          <Text style={styles.fieldLabel}>Child</Text>
          <View style={styles.chipRow}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.chip,
                  selectedChildId === child.id && styles.chipActive,
                ]}
                onPress={() => setSelectedChildId(child.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedChildId === child.id && styles.chipTextActive,
                  ]}
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Academic year</Text>
          <TextInput
            style={styles.textInput}
            value={academicYear}
            onChangeText={setAcademicYear}
            placeholder="e.g. 2025-2026"
            placeholderTextColor={`${colors.clay}60`}
          />

          <Text style={styles.fieldLabel}>Approach</Text>
          <View style={styles.chipRow}>
            {APPROACHES.map((a) => (
              <TouchableOpacity
                key={a.key}
                style={[
                  styles.chip,
                  approach === a.key && styles.chipActive,
                ]}
                onPress={() => setApproach(a.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    approach === a.key && styles.chipTextActive,
                  ]}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Hours per day</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))}
            >
              <Minus size={16} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{hoursPerDay}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setHoursPerDay(Math.min(10, hoursPerDay + 1))}
            >
              <Plus size={16} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Days per week</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setDaysPerWeek(Math.max(1, daysPerWeek - 1))}
            >
              <Minus size={16} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{daysPerWeek}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setDaysPerWeek(Math.min(7, daysPerWeek + 1))}
            >
              <Plus size={16} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={createPlan.isPending}
            onPress={handleSubmit}
          >
            Create plan
          </Button>
        </View>
      </SimpleBottomSheet>
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
  headerTitle: { fontSize: 20, fontWeight: '300', color: colors.ink },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
    gap: spacing.xl,
  },
  childGroup: {
    gap: spacing.md,
  },
  childGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planYear: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  planMetaText: {
    fontSize: 13,
    color: colors.clay,
  },
  planMetaDot: {
    fontSize: 13,
    color: `${colors.clay}60`,
  },
  areaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: `${colors.clay}80`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  chipTextActive: {
    color: colors.parchment,
  },
  textInput: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.ink,
    minWidth: 30,
    textAlign: 'center',
  },
});
