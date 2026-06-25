import React from 'react';
import { Tabs } from 'expo-router';
import {
  Sun,
  CalendarDays,
  BookHeart,
  Users,
  Home,
} from 'lucide-react-native';
import { Platform, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { lightTheme } from '@/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: lightTheme.textMuted,
        tabBarStyle: {
          backgroundColor: lightTheme.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 88 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarButton: (props: any) => (
          <TouchableOpacity
            {...props}
            onPress={(e: any) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.(e);
            }}
          />
        ),
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
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="keep"
        options={{
          title: 'Keep',
          tabBarIcon: ({ color, size }) => (
            <BookHeart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="belong"
        options={{
          title: 'Belong',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Our Hedge',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens - reachable via navigation, not the tab bar.
          Ask (chat) is surfaced as a prominent header action on Keep/Belong
          and from Today; Browse and Progress are reachable from Keep. */}
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="browse" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="educator" options={{ href: null }} />
    </Tabs>
  );
}
