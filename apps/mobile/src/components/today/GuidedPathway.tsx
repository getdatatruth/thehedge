import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

type LearningPath = 'mainstream' | 'homeschool' | 'considering';

interface GuidedPathwayProps {
  learningPath: LearningPath;
  daysActive: number;
  activitiesCompleted: number;
  onNavigate: (route: string) => void;
}

interface Step {
  label: string;
  route: string;
}

function getPathwayConfig(learningPath: LearningPath): { title: string; emoji: string; steps: Step[] } {
  switch (learningPath) {
    case 'mainstream':
      return {
        title: 'Getting Started',
        emoji: '\u{1F331}',
        steps: [
          { label: 'Try your first activity', route: 'activities' },
          { label: 'Try a different category', route: 'activities' },
          { label: 'Log how it went', route: 'activities' },
          { label: 'Check your progress', route: 'progress' },
          { label: 'Explore the weekly planner', route: 'plan' },
        ],
      };
    case 'homeschool':
      return {
        title: 'Your First Week',
        emoji: '\u{1F4DA}',
        steps: [
          { label: 'Generate your first weekly plan', route: 'plan' },
          { label: 'Complete your first planned activity', route: 'activities' },
          { label: 'Log 3 activities across different categories', route: 'activities' },
          { label: 'Check your curriculum coverage', route: 'progress' },
          { label: 'Review your Hedge Score', route: 'progress' },
        ],
      };
    case 'considering':
      return {
        title: 'Is Homeschooling Right for You?',
        emoji: '\u{1F914}',
        steps: [
          { label: 'Try one activity together - just 20 minutes', route: 'activities' },
          { label: 'Try a different category', route: 'activities' },
          { label: 'See what they learned', route: 'progress' },
          { label: 'Explore the weekly planner', route: 'plan' },
          { label: 'Join your local community group', route: 'community' },
        ],
      };
  }
}

function getCompletedCount(
  learningPath: LearningPath,
  daysActive: number,
  activitiesCompleted: number,
): boolean[] {
  switch (learningPath) {
    case 'mainstream':
      return [
        activitiesCompleted >= 1,
        activitiesCompleted >= 2,
        activitiesCompleted >= 3,
        daysActive >= 4,
        daysActive >= 5,
      ];
    case 'homeschool':
      return [
        daysActive >= 1 && activitiesCompleted >= 0,
        activitiesCompleted >= 1,
        activitiesCompleted >= 3,
        daysActive >= 4,
        daysActive >= 5,
      ];
    case 'considering':
      return [
        activitiesCompleted >= 1,
        activitiesCompleted >= 2,
        daysActive >= 3,
        daysActive >= 4,
        daysActive >= 5,
      ];
  }
}

export function GuidedPathway({
  learningPath,
  daysActive,
  activitiesCompleted,
  onNavigate,
}: GuidedPathwayProps) {
  const config = getPathwayConfig(learningPath);
  const completedSteps = getCompletedCount(learningPath, daysActive, activitiesCompleted);
  const completedCount = completedSteps.filter(Boolean).length;

  if (daysActive > 7) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {config.emoji} {config.title}
      </Text>

      <View style={styles.stepList}>
        {config.steps.map((step, index) => {
          const isCompleted = completedSteps[index];
          const isCurrent = !isCompleted && completedSteps.slice(0, index).every(Boolean);

          return (
            <TouchableOpacity
              key={index}
              style={styles.stepRow}
              onPress={() => onNavigate(step.route)}
              activeOpacity={0.7}
            >
              <View style={styles.stepIndicatorColumn}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isCurrent && styles.stepNumberCurrent,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                {index < config.steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isCurrent && styles.stepLabelCurrent,
                ]}
              >
                {step.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / 5) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount}/5 complete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: lightTheme.text,
  },
  stepList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 28,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: lightTheme.accent,
  },
  stepCircleCurrent: {
    backgroundColor: lightTheme.surface,
    borderWidth: 2,
    borderColor: lightTheme.accent,
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: lightTheme.borderLight,
  },
  stepLineCompleted: {
    backgroundColor: lightTheme.accent,
  },
  stepNumber: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    fontWeight: '600',
  },
  stepNumberCurrent: {
    color: lightTheme.accent,
  },
  stepLabel: {
    ...typography.body,
    color: lightTheme.textMuted,
    flex: 1,
    paddingTop: 3,
  },
  stepLabelCompleted: {
    color: lightTheme.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepLabelCurrent: {
    color: lightTheme.text,
    fontWeight: '600',
  },
  progressContainer: {
    gap: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: lightTheme.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: lightTheme.accent,
    borderRadius: 3,
  },
  progressText: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    textAlign: 'right',
  },
});
