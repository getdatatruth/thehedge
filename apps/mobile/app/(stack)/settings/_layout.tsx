import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.parchment },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="children" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="password" />
      <Stack.Screen name="data" />
    </Stack>
  );
}
