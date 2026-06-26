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
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

/**
 * Belong - the community hearth. A calm doorway into the existing community
 * experience (feed, groups, events). We do not rebuild community here; each
 * entry opens the full community screen under (stack)/community.
 */
export default function BelongScreen() {
  const router = useRouter();

  const openCommunity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(stack)/community' as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Belong</Text>
          <Text style={styles.subtitle}>
            Other families walking the same road, never far from home.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.askButton}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/chat' as any);
          }}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.askButtonText}>Ask</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.hero}
          activeOpacity={0.85}
          onPress={openCommunity}
        >
          <View style={styles.heroIcon}>
            <Users size={28} color={lightTheme.primary} />
          </View>
          <Text style={styles.heroTitle}>Pull up a chair</Text>
          <Text style={styles.heroBody}>
            Share what's been working, ask when you're stuck, and find families
            close by. No one here is doing it perfectly.
          </Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Join the conversation</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WAYS IN, WHENEVER YOU'RE READY</Text>
          <View style={styles.card}>
            <BelongItem
              icon={<MessageSquare size={22} color="#5B8DEF" />}
              label="Feed"
              description="The day-to-day of families like yours"
              onPress={openCommunity}
            />
            <BelongItem
              icon={<Users size={22} color={lightTheme.accent} />}
              label="Groups"
              description="Find a circle that feels like your own"
              onPress={openCommunity}
            />
            <BelongItem
              icon={<Calendar size={22} color="#9B7BD4" />}
              label="Events"
              description="Gatherings and meet-ups a short journey away"
              onPress={openCommunity}
              last
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BelongItem({
  icon,
  label,
  description,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.item, !last && styles.itemBorder]}
    >
      <View style={styles.itemIcon}>{icon}</View>
      <View style={styles.itemBody}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <ChevronRight size={18} color={lightTheme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: { flex: 1 },
  title: {
    ...typography.h1,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: lightTheme.textMuted,
    marginTop: 4,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightTheme.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: 4,
  },
  askButtonText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
  },
  scroll: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },
  hero: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: lightTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  heroBody: {
    ...typography.body,
    color: lightTheme.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: lightTheme.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroCtaText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
  },
  section: {
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: lightTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1 },
  itemLabel: {
    ...typography.uiBold,
    color: lightTheme.text,
  },
  itemDescription: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    marginTop: 2,
  },
});
