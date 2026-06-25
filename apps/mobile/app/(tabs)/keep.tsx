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
  Clock,
  FolderOpen,
  Heart,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

/**
 * Keep - the family's record. A calm consolidation hub that gathers
 * everything worth holding onto: the journal of what you've done, saved
 * ideas, collections, the portfolio of learning, and the wider library of
 * activities to draw from. Mirrors the web "Keep" surface.
 */
export default function KeepScreen() {
  const router = useRouter();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Keep</Text>
          <Text style={styles.subtitle}>
            Everything your family is gathering and holding onto.
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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR RECORD</Text>
          <View style={styles.card}>
            <KeepItem
              icon={<Clock size={22} color="#9B7BD4" />}
              label="Journal"
              description="A timeline of what you've done together"
              onPress={() => router.push('/(stack)/timeline' as any)}
            />
            <KeepItem
              icon={<BookOpen size={22} color={lightTheme.accent} />}
              label="Portfolio"
              description="Learning evidence, ready when you need it"
              onPress={() =>
                router.push(
                  (effectiveTier === 'educator'
                    ? '/(stack)/educator/portfolio'
                    : '/(stack)/timeline') as any
                )
              }
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SAVED FOR LATER</Text>
          <View style={styles.card}>
            <KeepItem
              icon={<Heart size={22} color="#E8735A" />}
              label="Saved"
              description="Activities you've favourited"
              onPress={() => router.push('/(stack)/favourites' as any)}
            />
            <KeepItem
              icon={<FolderOpen size={22} color="#5B8DEF" />}
              label="Collections"
              description="Your own grouped sets of ideas"
              onPress={() => router.push('/(stack)/collections' as any)}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FIND MORE</Text>
          <View style={styles.card}>
            <KeepItem
              icon={<Compass size={22} color={lightTheme.primary} />}
              label="Browse activities"
              description="Explore the full library of ideas"
              onPress={() => router.push('/(tabs)/browse' as any)}
              last
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KeepItem({
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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
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
    paddingBottom: spacing['6xl'],
  },
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
