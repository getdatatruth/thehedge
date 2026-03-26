import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { darkTheme } from '@/theme/colors';

interface ProgressBarProps {
  /** Current step (0-based) */
  current: number;
  /** Total number of steps */
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progress = (current + 1) / total;
    Animated.spring(animatedWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 10,
    }).start();
  }, [current, total]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    paddingTop: 8,
    paddingBottom: 4,
  },
  track: {
    height: 4,
    backgroundColor: darkTheme.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: darkTheme.accent,
    borderRadius: 2,
  },
});
