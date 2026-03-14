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
  Trophy,
  Heart,
  Users,
  Clock,
  FolderOpen,
  Bell,
  Settings,
  GraduationCap,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  educatorOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'progress',
    label: 'Progress',
    icon: <Trophy size={20} color={colors.forest} />,
    route: '/(tabs)/progress',
  },
  {
    key: 'favourites',
    label: 'Favourites',
    icon: <Heart size={20} color={colors.terracotta} />,
    route: '/(stack)/favourites',
  },
  {
    key: 'community',
    label: 'Community',
    icon: <Users size={20} color={colors.moss} />,
    route: '/(stack)/community',
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: <Clock size={20} color={colors.umber} />,
    route: '/(stack)/timeline',
  },
  {
    key: 'collections',
    label: 'Collections',
    icon: <FolderOpen size={20} color={colors.sage} />,
    route: '/(stack)/collections',
  },
  {
    key: 'educator',
    label: 'Educator Dashboard',
    icon: <GraduationCap size={20} color={colors.forest} />,
    route: '/(tabs)/educator',
    educatorOnly: true,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <Bell size={20} color={colors.clay} />,
    route: '/(stack)/notifications',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings size={20} color={colors.clay} />,
    route: '/(stack)/settings',
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());
  const { profile } = useAuthStore();

  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.educatorOnly || effectiveTier === 'educator'
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* User info card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
            <Text style={styles.userTier}>
              {effectiveTier === 'educator'
                ? 'Educator'
                : effectiveTier === 'family'
                ? 'Family Plan'
                : 'Free Plan'}
            </Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuCard}>
          {visibleItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index < visibleItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconWrap}>{item.icon}</View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color={`${colors.clay}60`} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
    gap: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.parchment,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  userTier: {
    fontSize: 13,
    color: colors.clay,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}60`,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.stone}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    color: colors.ink,
    fontWeight: '400',
  },
});
