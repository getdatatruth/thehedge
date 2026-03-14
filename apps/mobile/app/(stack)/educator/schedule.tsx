import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Square,
  CheckSquare,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiPut } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface ScheduleBlock {
  id: string;
  day: string;
  time: string;
  subject: string;
  title: string;
  duration_minutes: number;
  completed: boolean;
}

interface ScheduleData {
  blocks: ScheduleBlock[];
  attendance: Record<string, boolean>;
}

interface ToggleBody {
  block_id: string;
  completed: boolean;
}

const DAYS = [
  { key: 'monday', short: 'Mon' },
  { key: 'tuesday', short: 'Tue' },
  { key: 'wednesday', short: 'Wed' },
  { key: 'thursday', short: 'Thu' },
  { key: 'friday', short: 'Fri' },
] as const;

function getCurrentDay(): string {
  const dayIndex = new Date().getDay();
  // Sunday = 0, Saturday = 6
  if (dayIndex === 0 || dayIndex === 6) return 'monday';
  return DAYS[dayIndex - 1].key;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());

  const {
    data: scheduleData,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<ScheduleData>(
    ['educator', 'schedule'],
    '/educator/schedule'
  );

  const toggleBlock = useApiPut<void, ToggleBody>('/educator/schedule', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educator', 'schedule'] });
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  if (isLoading && !scheduleData) return <LoadingScreen />;

  const blocks = (scheduleData?.blocks || []).filter(
    (b) => b.day === selectedDay
  );
  const attendance = scheduleData?.attendance || {};
  const isAttending = attendance[selectedDay] ?? true;

  const handleToggleBlock = (block: ScheduleBlock) => {
    toggleBlock.mutate({
      block_id: block.id,
      completed: !block.completed,
    });
  };

  const handleToggleAttendance = () => {
    toggleBlock.mutate({
      block_id: `attendance_${selectedDay}`,
      completed: !isAttending,
    } as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
      </View>

      {/* Day Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabs}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayTab,
              selectedDay === day.key && styles.dayTabActive,
            ]}
            onPress={() => setSelectedDay(day.key)}
          >
            <Text
              style={[
                styles.dayTabText,
                selectedDay === day.key && styles.dayTabTextActive,
              ]}
            >
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        {blocks.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayTitle}>No blocks scheduled</Text>
            <Text style={styles.emptyDayText}>
              Nothing planned for this day yet.
            </Text>
          </View>
        ) : (
          blocks.map((block) => (
            <TouchableOpacity
              key={block.id}
              onPress={() => handleToggleBlock(block)}
              activeOpacity={0.8}
            >
              <Card variant="elevated" padding="lg">
                <View style={styles.blockRow}>
                  <View style={styles.blockCheck}>
                    {block.completed ? (
                      <CheckSquare size={22} color={colors.moss} />
                    ) : (
                      <Square size={22} color={colors.stone} />
                    )}
                  </View>
                  <View style={styles.blockContent}>
                    <View style={styles.blockTopRow}>
                      <Badge
                        variant={block.completed ? 'moss' : 'stone'}
                        size="sm"
                      >
                        {block.subject}
                      </Badge>
                      <View style={styles.blockTime}>
                        <Clock size={11} color={colors.clay} />
                        <Text style={styles.blockTimeText}>{block.time}</Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.blockTitle,
                        block.completed && styles.blockTitleCompleted,
                      ]}
                    >
                      {block.title}
                    </Text>
                    <Text style={styles.blockDuration}>
                      {block.duration_minutes} min
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {/* Attendance Toggle */}
        <View style={styles.attendanceSection}>
          <TouchableOpacity
            style={styles.attendanceToggle}
            onPress={handleToggleAttendance}
            activeOpacity={0.8}
          >
            {isAttending ? (
              <UserCheck size={18} color={colors.moss} />
            ) : (
              <UserX size={18} color={colors.terracotta} />
            )}
            <Text style={styles.attendanceText}>
              {isAttending ? 'Attending' : 'Not attending'}
            </Text>
            <View
              style={[
                styles.attendanceDot,
                {
                  backgroundColor: isAttending
                    ? colors.moss
                    : colors.terracotta,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  dayTabs: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    marginRight: spacing.sm,
  },
  dayTabActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.clay,
  },
  dayTabTextActive: {
    color: colors.parchment,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  emptyDay: {
    borderWidth: 1,
    borderColor: colors.stone,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyDayTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: colors.ink,
  },
  emptyDayText: {
    fontSize: 13,
    color: colors.clay,
    textAlign: 'center',
  },
  blockRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  blockCheck: {
    paddingTop: 2,
  },
  blockContent: {
    flex: 1,
    gap: 4,
  },
  blockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blockTimeText: {
    fontSize: 11,
    color: colors.clay,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  blockTitleCompleted: {
    textDecorationLine: 'line-through',
    color: `${colors.clay}80`,
  },
  blockDuration: {
    fontSize: 12,
    color: colors.clay,
  },
  attendanceSection: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `${colors.stone}60`,
    paddingTop: spacing.xl,
  },
  attendanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  attendanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    flex: 1,
  },
  attendanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
