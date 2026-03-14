import React from 'react';
import { Tabs } from 'expo-router';
import { Sun, Search, CalendarDays, Leaf, Menu, Lock } from 'lucide-react-native';
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
        name="chat"
        options={{
          title: 'HedgeAI',
          tabBarIcon: ({ focused, size }) => (
            <View style={[styles.aiButton, focused && styles.aiButtonActive]}>
              <Leaf size={size - 2} color={focused ? colors.parchment : colors.forest} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: 2,
            color: colors.forest,
          },
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
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Menu size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - accessible via More screen but not shown in tab bar */}
      <Tabs.Screen
        name="progress"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="educator"
        options={{ href: null }}
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
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.forest}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
  },
  aiButtonActive: {
    backgroundColor: colors.forest,
  },
});
