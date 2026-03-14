import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.parchment },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="favourites" />
      <Stack.Screen name="timeline" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="collections" />
      <Stack.Screen name="community" />
      <Stack.Screen name="educator/plans" />
      <Stack.Screen name="educator/portfolio" />
      <Stack.Screen name="educator/schedule" />
      <Stack.Screen name="educator/tusla" />
    </Stack>
  );
}
