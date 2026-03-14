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
    </Stack>
  );
}
