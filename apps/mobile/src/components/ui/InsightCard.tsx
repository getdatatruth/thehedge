import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { apiPost } from '@/lib/api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface InsightCardProps {
  type: 'today' | 'plan_week' | 'activity' | 'progress';
  context: Record<string, any>;
  /** Only fetch when this is true (e.g. when parent data is loaded) */
  enabled?: boolean;
}

interface InsightData {
  insight: string;
  suggestion: string | null;
}

// Simple in-memory cache
const insightCache: Record<string, { data: InsightData; timestamp: number }> = {};
const CACHE_TTL = 3600000; // 1 hour

function getCacheKey(type: string, context: Record<string, any>): string {
  // Use type + a hash of key context values for cache key
  const childNames = (context.children || []).map((c: any) => c.name).join(',');
  return `${type}-${childNames}-${context.activityTitle || ''}-${context.hedgeScore || 0}`;
}

export function InsightCard({ type, context, enabled = true }: InsightCardProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = getCacheKey(type, context);
    const cached = insightCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      return;
    }

    setLoading(true);
    apiPost<{ insight: string; suggestion: string | null }>('/ai/insight', { type, context })
      .then((res) => {
        const insightData = { insight: res.data.insight, suggestion: res.data.suggestion };
        setData(insightData);
        insightCache[cacheKey] = { data: insightData, timestamp: Date.now() };
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      })
      .catch(() => {
        // Silently fail - don't show card if AI fails
      })
      .finally(() => setLoading(false));
  }, [enabled, type]);

  // Don't render anything while loading or if failed
  if (!data && !loading) return null;
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Sparkles size={14} color={lightTheme.accent} />
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, { width: 60 }]} />
        </View>
      </View>
    );
  }
  if (!data) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={styles.header}
      >
        <Sparkles size={14} color={lightTheme.accent} />
        <Text style={styles.label}>AI Insight</Text>
        <ChevronDown
          size={14}
          color={lightTheme.textMuted}
          style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.body}>
          <Text style={styles.insightText}>{data.insight}</Text>
          {data.suggestion && (
            <Text style={styles.suggestionText}>{data.suggestion}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${lightTheme.accent}08`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${lightTheme.accent}20`,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: lightTheme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: lightTheme.text,
    lineHeight: 22,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: lightTheme.accent,
    fontWeight: '500',
    lineHeight: 20,
  },
  loadingDot: {
    width: 40,
    height: 10,
    borderRadius: 5,
    backgroundColor: `${lightTheme.accent}15`,
  },
});
