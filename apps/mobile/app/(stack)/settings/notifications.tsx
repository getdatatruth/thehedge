import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPut } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface NotificationPrefs {
  morning_idea: boolean;
  weekend_plan: boolean;
  weekly_summary: boolean;
  community: boolean;
}

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}[] = [
  {
    key: 'morning_idea',
    label: 'Morning activity idea',
    description: 'Get a daily activity suggestion each morning',
  },
  {
    key: 'weekend_plan',
    label: 'Weekend plan reminder',
    description: 'A reminder to plan your weekend activities',
  },
  {
    key: 'weekly_summary',
    label: 'Weekly summary',
    description: 'A recap of your family activities each week',
  },
  {
    key: 'community',
    label: 'Community updates',
    description: 'New posts and events from your groups',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const defaultPrefs: NotificationPrefs = {
    morning_idea: true,
    weekend_plan: true,
    weekly_summary: true,
    community: true,
  };

  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    const saved = (profile as any)?.notification_prefs;
    if (saved && typeof saved === 'object') {
      return { ...defaultPrefs, ...saved };
    }
    return defaultPrefs;
  });

  const updatePrefs = useApiPut<any, any>('/settings/notifications');

  const handleToggle = (key: keyof NotificationPrefs) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    updatePrefs.mutate(updated);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" padding="sm">
          {NOTIFICATION_OPTIONS.map((option, i) => (
            <View
              key={option.key}
              style={[
                styles.row,
                i < NOTIFICATION_OPTIONS.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{option.label}</Text>
                <Text style={styles.rowDescription}>{option.description}</Text>
              </View>
              <Switch
                value={prefs[option.key]}
                onValueChange={() => handleToggle(option.key)}
                trackColor={{
                  false: colors.stone,
                  true: colors.moss,
                }}
                thumbColor={colors.parchment}
                ios_backgroundColor={colors.stone}
              />
            </View>
          ))}
        </Card>
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
  title: { fontSize: 20, fontWeight: '300', color: colors.ink },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
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
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, color: colors.ink },
  rowDescription: { fontSize: 12, color: colors.clay, lineHeight: 16 },
});
