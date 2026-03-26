import { Stack } from 'expo-router';
import { darkTheme } from '@/theme/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: darkTheme.background },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    />
  );
}
