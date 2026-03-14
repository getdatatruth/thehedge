import React from 'react';
import { Tabs } from 'expo-router';
import { Sun, Search, CalendarDays, Sparkles, Trophy, GraduationCap, Lock } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/stores/auth-store';

export default function TabLayout() {
  const effectiveTier = useAuthStore((s) => s.effectiveTier());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: `${colors.clay}80`,
        tabBarStyle: {
          backgroundColor: colors.parchment,
          borderTopColor: colors.stone,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Sun size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <View>
              <CalendarDays size={size} color={effectiveTier === 'free' ? `${colors.clay}40` : color} />
              {effectiveTier === 'free' && (
                <View style={styles.lockBadge}>
                  <Lock size={8} color={colors.clay} />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Ask AI',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="educator"
        options={{
          title: 'Educator',
          href: effectiveTier === 'educator' ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
