import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Settings,
  Bell,
  Heart,
  Users,
  Clock,
  FolderOpen,
  GraduationCap,
  CreditCard,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, family, children } = useAuthStore();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          <Text style={styles.familyLabel}>
            {family?.name || 'Family'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(stack)/settings/profile' as any)}
            style={styles.editButton}
          >
            <Text style={styles.editText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Children section */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHILDREN</Text>
            <View style={styles.card}>
              {children.map((child, i) => (
                <View
                  key={child.id}
                  style={[
                    styles.childRow,
                    i < children.length - 1 && styles.childRowBorder,
                  ]}
                >
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {child.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>
                      {child.age} years old
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Main menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MY STUFF</Text>
          <View style={styles.card}>
            <MenuItem
              icon={<Heart size={20} color="#E8735A" />}
              label="Favourites"
              onPress={() => router.push('/(stack)/favourites' as any)}
            />
            <MenuItem
              icon={<Clock size={20} color="#9B7BD4" />}
              label="Timeline"
              onPress={() => router.push('/(stack)/timeline' as any)}
            />
            <MenuItem
              icon={<FolderOpen size={20} color={lightTheme.accent} />}
              label="Collections"
              onPress={() => router.push('/(stack)/collections' as any)}
            />
            <MenuItem
              icon={<Users size={20} color="#5B8DEF" />}
              label="Community"
              onPress={() => router.push('/(stack)/community' as any)}
              last
            />
          </View>
        </View>

        {/* Settings menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.card}>
            <MenuItem
              icon={<Settings size={20} color={lightTheme.textSecondary} />}
              label="Account Settings"
              onPress={() => router.push('/(stack)/settings' as any)}
            />
            <MenuItem
              icon={<Bell size={20} color={lightTheme.textSecondary} />}
              label="Notifications"
              onPress={() => router.push('/(stack)/notifications' as any)}
            />
            <MenuItem
              icon={<CreditCard size={20} color={lightTheme.textSecondary} />}
              label="Subscription"
              subtitle={
                effectiveTier === 'educator'
                  ? 'Educator'
                  : effectiveTier === 'family'
                  ? 'Family Plan'
                  : 'Free Plan'
              }
              onPress={() => router.push('/(stack)/settings/billing' as any)}
            />
            {effectiveTier === 'educator' && (
              <MenuItem
                icon={<GraduationCap size={20} color={lightTheme.accent} />}
                label="Educator Dashboard"
                onPress={() => router.push('/(tabs)/educator' as any)}
              />
            )}
            <MenuItem
              icon={<HelpCircle size={20} color={lightTheme.textSecondary} />}
              label="Help & Support"
              onPress={() => {}}
              last
            />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <LogOut size={20} color={lightTheme.textSecondary} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>The Hedge v2.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      activeOpacity={0.6}
      style={[styles.menuItem, !last && styles.menuItemBorder]}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <View>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {subtitle && (
            <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={16} color={lightTheme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  scroll: {
    paddingBottom: spacing['6xl'],
  },
  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    ...typography.h2,
    color: lightTheme.text,
  },
  familyLabel: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    marginTop: 2,
  },
  editButton: {
    marginTop: spacing.lg,
    backgroundColor: lightTheme.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  editText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Children
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  childRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${lightTheme.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTheme.accent,
  },
  childInfo: { flex: 1 },
  childName: {
    ...typography.uiBold,
    color: lightTheme.text,
  },
  childAge: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: lightTheme.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    ...typography.ui,
    color: lightTheme.text,
  },
  menuItemSubtitle: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    marginTop: 1,
  },
  // Sign out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: spacing.lg,
  },
  signOutText: {
    ...typography.button,
    color: lightTheme.text,
  },
  version: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    textAlign: 'center',
  },
});
