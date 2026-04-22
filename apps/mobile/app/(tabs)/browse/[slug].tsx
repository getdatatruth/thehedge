import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  MapPin,
  Users,
  Heart,
  Check,
  Sparkles,
  Lightbulb,
  BookOpen,
  Zap,
  Droplets,
  MessageCircle,
  Eye,
  GraduationCap,
  Layers,
  Play,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { InsightCard } from '@/components/ui/InsightCard';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery, useApiPost, useApiDelete } from '@/hooks/use-api';
import { ActivityDetailSkeleton } from '@/components/ui/ScreenSkeletons';
import { LogActivityModal } from '@/components/shared/LogActivityModal';
import { CelebrationOverlay } from '@/components/shared/CelebrationOverlay';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface MaterialItem {
  name: string;
  household_common: boolean;
}

interface ActivityDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[]; variations?: string[]; tips?: string[] } | null;
  category: string;
  duration_minutes: number;
  location: string;
  age_min: number | null;
  age_max: number | null;
  materials: MaterialItem[];
  learning_outcomes: string[];
  energy_level: string;
  mess_level: string;
  screen_free: boolean;
  premium: boolean;
  parent_guide: {
    knowledge: { topic: string; content: string }[];
    conversation_starters: string[];
    watch_for: string[];
  } | null;
  curriculum_tags: {
    outcome_codes: string[];
    aistear_themes: string[];
    ncca_areas: string[];
    educator_quality: string;
    quality_notes: string;
  } | null;
}

function getCategoryColor(category: string): string {
  const key = category?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useAuthStore();
  const bottomSheetRef = useRef<SimpleBottomSheetRef>(null);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [checkedMaterials, setCheckedMaterials] = useState<Set<number>>(new Set());
  const [logged, setLogged] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: activity, isLoading } = useApiQuery<ActivityDetail>(
    ['activity', slug],
    `/activities/${slug}`
  );

  const { data: favIds } = useApiQuery<{ activity_ids: string[] }>(
    ['favourites-ids'],
    '/favourites'
  );
  const isFavourited = favIds?.activity_ids?.includes(activity?.id || '') || false;

  const addFav = useApiPost('/favourites', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['favourites-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const removeFav = useApiDelete<unknown, { activity_id: string }>('/favourites', {
    onSuccess: () => {
      hapticLight();
      queryClient.invalidateQueries({ queryKey: ['favourites-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const handleFavourite = () => {
    if (!activity) return;
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    if (isFavourited) {
      removeFav.mutate({ activity_id: activity.id });
    } else {
      addFav.mutate({ activity_id: activity.id });
    }
  };

  const toggleMaterial = (index: number) => {
    hapticLight();
    const next = new Set(checkedMaterials);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedMaterials(next);
  };

  const handleLog = () => {
    bottomSheetRef.current?.expand();
  };

  if (isLoading || !activity) return <ActivityDetailSkeleton />;

  const catColor = getCategoryColor(activity.category);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ChevronLeft size={24} color={lightTheme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={handleFavourite}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={20}
              color={isFavourited ? '#E8735A' : lightTheme.textMuted}
              fill={isFavourited ? '#E8735A' : 'transparent'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Category badge + Title */}
        <View style={styles.titleSection}>
          <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>
              {activity.category}
            </Text>
          </View>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.description}>{activity.description}</Text>

          {/* Meta tags row */}
          <View style={styles.metaRow}>
            <View style={styles.metaTag}>
              <Clock size={14} color={lightTheme.textMuted} />
              <Text style={styles.metaText}>{activity.duration_minutes} min</Text>
            </View>
            <View style={styles.metaTag}>
              <MapPin size={14} color={lightTheme.textMuted} />
              <Text style={styles.metaText}>{activity.location}</Text>
            </View>
            {(activity.age_min || activity.age_max) && (
              <View style={styles.metaTag}>
                <Users size={14} color={lightTheme.textMuted} />
                <Text style={styles.metaText}>
                  {activity.age_min || '?'}-{activity.age_max || '?'} yrs
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info badges */}
        <View style={styles.infoBadgesRow}>
          {activity.energy_level && (
            <View style={styles.infoBadge}>
              <Zap size={16} color="#E8735A" />
              <Text style={styles.infoBadgeLabel}>{activity.energy_level}</Text>
            </View>
          )}
          {activity.mess_level && (
            <View style={styles.infoBadge}>
              <Droplets size={16} color="#5B8DEF" />
              <Text style={styles.infoBadgeLabel}>{activity.mess_level}</Text>
            </View>
          )}
          {activity.screen_free && (
            <View style={styles.infoBadge}>
              <BookOpen size={16} color={lightTheme.accent} />
              <Text style={styles.infoBadgeLabel}>Screen-free</Text>
            </View>
          )}
        </View>

        {/* AI Insight */}
        <View style={{ marginBottom: spacing.xl }}>
          <InsightCard
            type="activity"
            context={{
              children,
              activityTitle: activity.title,
              activityCategory: activity.category,
              learningOutcomes: activity.learning_outcomes,
              aistearThemes: activity.curriculum_tags?.aistear_themes,
              nccaAreas: activity.curriculum_tags?.ncca_areas,
            }}
            enabled={!!activity}
          />
        </View>

        {/* Materials */}
        {activity.materials?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you'll need</Text>
            <View style={styles.card}>
              {activity.materials.map((material, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleMaterial(i)}
                  style={styles.materialRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checkedMaterials.has(i) && styles.checkboxChecked,
                    ]}
                  >
                    {checkedMaterials.has(i) && (
                      <Check size={12} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.materialText,
                      checkedMaterials.has(i) && styles.materialChecked,
                    ]}
                  >
                    {typeof material === 'string' ? material : material.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        {(activity.instructions?.steps?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to do it</Text>
            <View style={styles.card}>
              {activity.instructions!.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Outcomes */}
        {activity.learning_outcomes?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What they'll learn</Text>
            <View style={styles.card}>
              {activity.learning_outcomes.map((outcome, i) => (
                <View key={i} style={styles.outcomeRow}>
                  <Sparkles size={14} color={lightTheme.accent} />
                  <Text style={styles.outcomeText}>{outcome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Curriculum Links */}
        {activity.curriculum_tags && (activity.curriculum_tags.aistear_themes?.length > 0 || activity.curriculum_tags.ncca_areas?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Curriculum links</Text>
            <View style={styles.card}>
              {activity.curriculum_tags.aistear_themes?.length > 0 && (
                <View style={styles.curriculumGroup}>
                  <View style={styles.curriculumLabelRow}>
                    <Layers size={14} color={lightTheme.accent} />
                    <Text style={styles.curriculumLabel}>Aistear</Text>
                  </View>
                  <View style={styles.tagRow}>
                    {activity.curriculum_tags.aistear_themes.map((theme, i) => (
                      <View key={i} style={[styles.tag, { backgroundColor: `${lightTheme.accent}15` }]}>
                        <Text style={[styles.tagText, { color: lightTheme.accent }]}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {activity.curriculum_tags.ncca_areas?.length > 0 && (
                <View style={styles.curriculumGroup}>
                  <View style={styles.curriculumLabelRow}>
                    <GraduationCap size={14} color={lightTheme.primary} />
                    <Text style={styles.curriculumLabel}>Primary Curriculum</Text>
                  </View>
                  <View style={styles.tagRow}>
                    {activity.curriculum_tags.ncca_areas.map((area, i) => (
                      <View key={i} style={[styles.tag, { backgroundColor: `${lightTheme.primary}10` }]}>
                        <Text style={[styles.tagText, { color: lightTheme.primary }]}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Parent Guide */}
        {activity.parent_guide ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent guide</Text>
            {activity.parent_guide.knowledge.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.guideHeader}>
                  <BookOpen size={16} color={lightTheme.accent} />
                  <Text style={styles.guideTopic}>{item.topic}</Text>
                </View>
                <Text style={styles.guideContent}>{item.content}</Text>
              </View>
            ))}
            {activity.parent_guide.conversation_starters.length > 0 && (
              <View style={styles.card}>
                <View style={styles.guideHeader}>
                  <MessageCircle size={16} color="#9B7BD4" />
                  <Text style={styles.guideTopic}>Questions to ask</Text>
                </View>
                {activity.parent_guide.conversation_starters.map((q, i) => (
                  <Text key={i} style={styles.starterText}>"{q}"</Text>
                ))}
              </View>
            )}
            {activity.parent_guide.watch_for.length > 0 && (
              <View style={styles.card}>
                <View style={styles.guideHeader}>
                  <Eye size={16} color={lightTheme.accent} />
                  <Text style={styles.guideTopic}>Signs of learning</Text>
                </View>
                {activity.parent_guide.watch_for.map((item, i) => (
                  <View key={i} style={styles.watchRow}>
                    <Sparkles size={12} color={lightTheme.accent} />
                    <Text style={styles.watchText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent tips</Text>
            <View style={styles.card}>
              {[
                'Let your child lead the pace. Curiosity-driven learning sticks better.',
                'Ask open-ended questions like "What do you notice?" to deepen understanding.',
                "Don't worry about perfection. The goal is engagement and exploration.",
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Lightbulb size={14} color="#F5A623" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Variations */}
        {(activity.instructions?.variations?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Try it differently</Text>
            {activity.instructions!.variations!.map((variation, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.variationText}>{variation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Log Button - Runna "Record workout" pattern */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          onPress={handleLog}
          activeOpacity={0.8}
          style={[styles.logButton, logged && styles.logButtonDone]}
        >
          {logged ? (
            <Check size={20} color="#FFFFFF" />
          ) : (
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          )}
          <Text style={styles.logText}>
            {logged ? 'Logged!' : 'Log this activity'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Log Activity Bottom Sheet */}
      <LogActivityModal
        activityId={activity.id}
        activityTitle={activity.title}
        bottomSheetRef={bottomSheetRef}
        onLogged={() => { setLogged(true); setShowCelebration(true); }}
      />

      {/* Celebration overlay after logging */}
      <CelebrationOverlay
        visible={showCelebration}
        isFirstActivity={false}
        activityTitle={activity?.title || ''}
        hedgeScoreGain={1}
        onDismiss={() => setShowCelebration(false)}
        onNextActivity={() => {
          setShowCelebration(false);
          router.push('/(tabs)/browse');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  // Title
  titleSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    ...typography.h2,
    color: lightTheme.text,
    lineHeight: 30,
  },
  description: {
    ...typography.body,
    color: lightTheme.textSecondary,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    textTransform: 'capitalize',
  },
  // Info badges
  infoBadgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoBadgeLabel: {
    ...typography.uiSmall,
    color: lightTheme.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  // Sections
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  // Materials
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: lightTheme.accent,
    borderColor: lightTheme.accent,
  },
  materialText: {
    ...typography.ui,
    color: lightTheme.text,
    flex: 1,
  },
  materialChecked: {
    textDecorationLine: 'line-through',
    color: lightTheme.textMuted,
  },
  // Steps
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${lightTheme.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: lightTheme.accent,
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: lightTheme.text,
    lineHeight: 22,
  },
  // Outcomes
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 6,
  },
  outcomeText: {
    flex: 1,
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 20,
  },
  // Curriculum
  curriculumGroup: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  curriculumLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  curriculumLabel: {
    ...typography.uiBold,
    color: lightTheme.text,
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 22,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Parent guide
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  guideTopic: {
    ...typography.uiBold,
    color: lightTheme.text,
    flex: 1,
  },
  guideContent: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 21,
    paddingLeft: 30,
  },
  starterText: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    paddingLeft: 30,
    paddingVertical: 3,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: 30,
    paddingVertical: 3,
  },
  watchText: {
    flex: 1,
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
  // Tips
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  tipText: {
    flex: 1,
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 20,
  },
  variationText: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 20,
  },
  // Floating log button (Runna "Record workout" pattern)
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    backgroundColor: lightTheme.background,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#1A2E1E',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logButtonDone: {
    backgroundColor: lightTheme.accent,
  },
  logText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
