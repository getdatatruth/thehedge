import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApiPut } from '@/hooks/use-api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

const PREFS_STORAGE_KEY = '@thehedge/notification_prefs';

interface NotificationPrefs {
  // Essential
  morning_plan: boolean;
  streak_risk: boolean;
  weekly_plan: boolean;
  achievement: boolean;
  // Helpful
  activity_reminder: boolean;
  day_review: boolean;
  tomorrow_preview: boolean;
  // Weekly digest
  week_review: boolean;
  month_review: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  morning_plan: true,
  streak_risk: true,
  weekly_plan: true,
  achievement: true,
  activity_reminder: true,
  day_review: true,
  tomorrow_preview: true,
  week_review: true,
  month_review: true,
};

interface NotificationOption {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  time: string;
}

interface NotificationSection {
  title: string;
  subtitle: string;
  options: NotificationOption[];
}

const SECTIONS: NotificationSection[] = [
  {
    title: 'Essential',
    subtitle: 'On by default',
    options: [
      {
        key: 'morning_plan',
        label: 'Morning plan reminder',
        description: 'Start your day with a plan overview',
        time: '8:00 AM',
      },
      {
        key: 'streak_risk',
        label: 'Streak at risk',
        description: 'Reminder to log before your streak breaks',
        time: '6:00 PM',
      },
      {
        key: 'weekly_plan',
        label: 'Weekly plan ready',
        description: 'Your new weekly plan is ready to review',
        time: 'Monday 8:00 AM',
      },
      {
        key: 'achievement',
        label: 'Achievement unlocked',
        description: 'Celebrate milestones and badges',
        time: 'Immediate',
      },
    ],
  },
  {
    title: 'Helpful',
    subtitle: 'On by default',
    options: [
      {
        key: 'activity_reminder',
        label: 'Activity reminder',
        description: 'A nudge to try your planned activity',
        time: '2:00 PM',
      },
      {
        key: 'day_review',
        label: 'Day in review',
        description: 'See what you accomplished today',
        time: '7:00 PM',
      },
      {
        key: 'tomorrow_preview',
        label: "Tomorrow's preview",
        description: "A peek at tomorrow's planned activities",
        time: '8:00 PM',
      },
    ],
  },
  {
    title: 'Weekly digest',
    subtitle: 'On by default',
    options: [
      {
        key: 'week_review',
        label: 'Week in review',
        description: 'Your weekly activity summary and stats',
        time: 'Sunday 6:00 PM',
      },
      {
        key: 'month_review',
        label: 'Month in review',
        description: 'Monthly progress report and highlights',
        time: '1st of month',
      },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const updatePrefs = useApiPut<any, any>('/settings/notifications');

  // Load saved preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
        if (stored) {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
        }
      } catch {
        // Use defaults
      }

      // Check notification permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === 'granted');
    })();
  }, []);

  const savePrefs = useCallback(
    async (updated: NotificationPrefs) => {
      // Save locally
      try {
        await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Silently fail local save
      }

      // Sync to backend
      updatePrefs.mutate(updated);
    },
    [updatePrefs]
  );

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      savePrefs(updated);
    },
    [prefs, savePrefs]
  );

  const handleRequestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Notifications disabled',
        'To receive notifications, enable them in your device Settings for The Hedge.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission banner */}
        {permissionGranted === false && (
          <TouchableOpacity
            style={styles.permissionBanner}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionTitle}>Notifications are off</Text>
            <Text style={styles.permissionBody}>
              Tap to enable push notifications for The Hedge.
            </Text>
          </TouchableOpacity>
        )}

        {SECTIONS.map((section, sIdx) => (
          <View key={section.title} style={sIdx > 0 ? styles.sectionGap : undefined}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            </View>

            <View style={styles.card}>
              {section.options.map((option, i) => (
                <View
                  key={option.key}
                  style={[
                    styles.row,
                    i < section.options.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>{option.label}</Text>
                    <Text style={styles.rowDescription}>{option.description}</Text>
                    <Text style={styles.rowTime}>{option.time}</Text>
                  </View>
                  <Switch
                    value={prefs[option.key]}
                    onValueChange={() => handleToggle(option.key)}
                    trackColor={{
                      false: lightTheme.border,
                      true: lightTheme.accent,
                    }}
                    thumbColor={lightTheme.surface}
                    ios_backgroundColor={lightTheme.border}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>
          Notification times are approximate and may vary based on your timezone and
          activity schedule.
        </Text>
      </ScrollView>
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
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h3, color: lightTheme.text },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  permissionBanner: {
    backgroundColor: `${lightTheme.warning}18`,
    borderWidth: 1,
    borderColor: `${lightTheme.warning}40`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  permissionTitle: {
    ...typography.uiBold,
    color: lightTheme.text,
    marginBottom: 4,
  },
  permissionBody: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
  },
  sectionGap: { marginTop: spacing['2xl'] },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: lightTheme.textMuted,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: lightTheme.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.borderLight,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowLabel: {
    ...typography.ui,
    color: lightTheme.text,
    fontWeight: '500',
  },
  rowDescription: {
    ...typography.uiSmall,
    color: lightTheme.textSecondary,
  },
  rowTime: {
    fontSize: 11,
    color: lightTheme.textMuted,
    marginTop: 2,
  },
  footerNote: {
    ...typography.bodySmall,
    color: lightTheme.textMuted,
    textAlign: 'center',
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
});
