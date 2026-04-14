import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CheckCircle, Leaf, ArrowRight, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

const { width } = Dimensions.get('window');

interface CelebrationOverlayProps {
  visible: boolean;
  isFirstActivity: boolean;
  activityTitle: string;
  hedgeScoreGain?: number;
  nextActivity?: { title: string; category: string; slug?: string };
  onDismiss: () => void;
  onNextActivity?: () => void;
  onEnableNotifications?: () => void;
}

function ConfettiDot({ delay, startX }: { delay: number; startX: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const colors = ['#4CAF7C', '#5B8DEF', '#E8735A', '#F5A623', '#9B7BD4', '#E85BAD'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500 + Math.random() * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 400 + Math.random() * 200] }) },
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, (Math.random() - 0.5) * 150] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() * 720}deg`] }) },
        ],
      }}
    />
  );
}

export function CelebrationOverlay({
  visible,
  isFirstActivity,
  activityTitle,
  hedgeScoreGain = 0,
  nextActivity,
  onDismiss,
  onNextActivity,
  onEnableNotifications,
}: CelebrationOverlayProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      if (hedgeScoreGain > 0) {
        Animated.timing(scoreAnim, { toValue: hedgeScoreGain, duration: 1200, useNativeDriver: false }).start();
      }
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      scoreAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const confettiDots = Array.from({ length: 20 }, (_, i) => (
    <ConfettiDot key={i} delay={i * 50} startX={Math.random() * width} />
  ));

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiDots}
      </View>

      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <CheckCircle size={40} color="#FFFFFF" strokeWidth={2} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isFirstActivity ? 'Your first activity!' : 'Brilliant!'}
        </Text>

        <Text style={styles.subtitle}>
          {isFirstActivity
            ? `You just started your family's learning journey with "${activityTitle}"`
            : `"${activityTitle}" logged to your timeline`
          }
        </Text>

        {/* Score gain */}
        {hedgeScoreGain > 0 && (
          <View style={styles.scoreRow}>
            <Leaf size={18} color={lightTheme.accent} />
            <Text style={styles.scoreText}>+{hedgeScoreGain} Hedge Score</Text>
          </View>
        )}

        {/* Next activity suggestion */}
        {nextActivity && (
          <TouchableOpacity
            onPress={onNextActivity}
            style={styles.nextCard}
            activeOpacity={0.8}
          >
            <Text style={styles.nextLabel}>Try this next</Text>
            <Text style={styles.nextTitle}>{nextActivity.title}</Text>
            <View style={styles.nextArrow}>
              <ArrowRight size={14} color={lightTheme.accent} />
            </View>
          </TouchableOpacity>
        )}

        {/* Notification opt-in (first activity only) */}
        {isFirstActivity && onEnableNotifications && (
          <TouchableOpacity
            onPress={onEnableNotifications}
            style={styles.notifButton}
            activeOpacity={0.8}
          >
            <Bell size={16} color={lightTheme.accent} />
            <Text style={styles.notifText}>Remind me tomorrow</Text>
          </TouchableOpacity>
        )}

        {/* Dismiss */}
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>
            {isFirstActivity ? 'Keep exploring' : 'Done'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: 24,
    padding: spacing['2xl'],
    width: width - 48,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: lightTheme.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${lightTheme.accent}10`,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: lightTheme.accent,
  },
  nextCard: {
    backgroundColor: lightTheme.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: lightTheme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  nextTitle: {
    ...typography.uiBold,
    color: lightTheme.text,
  },
  nextArrow: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
  },
  notifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  notifText: {
    ...typography.uiBold,
    color: lightTheme.accent,
  },
  dismissButton: {
    backgroundColor: lightTheme.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing['3xl'],
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
