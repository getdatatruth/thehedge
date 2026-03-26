import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  subtitle?: string;
}

export function ScoreRing({
  score,
  maxScore = 1000,
  size = 120,
  label,
  subtitle,
}: ScoreRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = Math.min(score / maxScore, 1);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: progress,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeWidth = size * 0.06;
  const ringSize = size;
  const innerSize = ringSize - strokeWidth * 2;

  // We'll use a view-based ring since react-native-svg might not be available
  const circumference = Math.PI * (ringSize - strokeWidth);

  return (
    <View style={styles.container}>
      <View style={[styles.ringOuter, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}>
        {/* Background ring */}
        <View
          style={[
            styles.ringTrack,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />
        {/* Progress ring - approximated with border */}
        <Animated.View
          style={[
            styles.ringFill,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: strokeWidth + 1,
              borderColor: lightTheme.accent,
              // Clip to show progress
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Inner content */}
        <View
          style={[
            styles.ringInner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Leaf size={24} color={lightTheme.accent} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    borderColor: lightTheme.borderLight,
  },
  ringFill: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringInner: {
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: lightTheme.text,
    letterSpacing: -1,
  },
  label: {
    ...typography.uiBold,
    color: lightTheme.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
});
