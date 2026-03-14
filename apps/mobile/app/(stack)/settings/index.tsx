import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Users,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  Crown,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, family, children } = useAuthStore();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());
  const trialDaysLeft = useAuthStore((s) => s.trialDaysLeft());

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          detail: profile?.name || '',
          onPress: () => {},
        },
        {
          icon: Users,
          label: 'Children',
          detail: `${children.length} ${children.length === 1 ? 'child' : 'children'}`,
          onPress: () => {},
        },
        {
          icon: Bell,
          label: 'Notifications',
          detail: '',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Subscription',
      items: [
        {
          icon: CreditCard,
          label: 'Billing & plan',
          detail: effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1),
          onPress: () => router.push('/(stack)/settings/billing' as any),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Card variant="elevated" padding="xl">
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
              <View style={styles.tierRow}>
                <Badge
                  variant={
                    effectiveTier === 'educator'
                      ? 'moss'
                      : effectiveTier === 'family'
                      ? 'sage'
                      : 'stone'
                  }
                  size="sm"
                >
                  {effectiveTier} plan
                </Badge>
                {trialDaysLeft !== null && (
                  <Text style={styles.trialText}>
                    {trialDaysLeft}d left in trial
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Settings sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="elevated" padding="sm">
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  style={[
                    styles.settingsRow,
                    i < section.items.length - 1 && styles.settingsRowBorder,
                  ]}
                >
                  <item.icon size={18} color={colors.clay} />
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <Text style={styles.settingsDetail}>{item.detail}</Text>
                  <ChevronRight size={16} color={colors.stone} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} color={colors.terracotta} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>The Hedge v1.0.0</Text>
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
    gap: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.parchment,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontWeight: '600', color: colors.ink },
  profileEmail: { fontSize: 13, color: colors.clay },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  trialText: { fontSize: 11, color: colors.amber, fontWeight: '600' },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: `${colors.clay}80`,
    paddingLeft: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  settingsLabel: { flex: 1, fontSize: 15, color: colors.ink },
  settingsDetail: { fontSize: 13, color: colors.clay },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.terracotta },
  version: {
    fontSize: 11,
    color: `${colors.clay}40`,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
