import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Cloud, CloudRain, Sparkles, ChevronRight } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface ContextCardProps {
  weather?: {
    temperature: number;
    condition: string;
    isRaining: boolean;
  } | null;
  childNames?: string[];
  onAskAI?: () => void;
}

function WeatherIcon({ condition }: { condition: string }) {
  const iconColor = lightTheme.textSecondary;
  if (condition?.toLowerCase().includes('rain'))
    return <CloudRain size={24} color={iconColor} />;
  if (condition?.toLowerCase().includes('cloud'))
    return <Cloud size={24} color={iconColor} />;
  return <Sun size={24} color="#F5A623" />;
}

function getSuggestion(weather?: { isRaining: boolean } | null, childNames?: string[]): string {
  const names = childNames?.length ? childNames.join(' & ') : 'the family';
  if (weather?.isRaining) {
    return `Rainy day - perfect for indoor crafts and cosy activities with ${names}.`;
  }
  return `Great day for outdoor activities with ${names}. Check out today's suggestions below.`;
}

export function ContextCard({ weather, childNames, onAskAI }: ContextCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {weather && (
          <View style={styles.weatherRow}>
            <WeatherIcon condition={weather.condition} />
            <View>
              <Text style={styles.temp}>{Math.round(weather.temperature)}{'\u00B0'}C</Text>
              <Text style={styles.condition}>{weather.condition}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.suggestion}>
        {getSuggestion(weather, childNames)}
      </Text>

      {onAskAI && (
        <TouchableOpacity onPress={onAskAI} style={styles.aiButton}>
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.aiText}>Ask AI for ideas</Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  temp: {
    ...typography.h3,
    color: lightTheme.text,
  },
  condition: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  suggestion: {
    ...typography.body,
    color: lightTheme.textSecondary,
    lineHeight: 22,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  aiText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
  },
});
