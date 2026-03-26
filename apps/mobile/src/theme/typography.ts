import { Platform, TextStyle } from 'react-native';

// Font families
// Display: Cormorant Garamond (brand identity, elegant headers)
// UI/Body: System font (clean, modern - Runna pattern)
export const fonts = {
  display: 'CormorantGaramond-Light',
  displayItalic: 'CormorantGaramond-LightItalic',
  displayMedium: 'CormorantGaramond-Medium',
  ui: Platform.select({ ios: 'System', android: 'sans-serif' }) ?? 'System',
  uiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }) ?? 'System',
  // Keep body aliases pointing to system font for v2
  body: Platform.select({ ios: 'System', android: 'sans-serif' }) ?? 'System',
  bodyItalic: Platform.select({ ios: 'System', android: 'sans-serif' }) ?? 'System',
} as const;

// Type scale - modernized with tighter spacing and bolder weights
export const typography = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,
  h1: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
  } as TextStyle,
  h2: {
    fontFamily: fonts.ui,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
  } as TextStyle,
  h3: {
    fontFamily: fonts.ui,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  } as TextStyle,
  // Onboarding-specific: large bold header (Runna pattern)
  onboardingTitle: {
    fontFamily: fonts.ui,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  } as TextStyle,
  bodyLarge: {
    fontFamily: fonts.ui,
    fontSize: 17,
    lineHeight: 26,
  } as TextStyle,
  body: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodySmall: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 20,
  } as TextStyle,
  ui: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 20,
  } as TextStyle,
  uiSmall: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  uiBold: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  } as TextStyle,
  // Button text
  button: {
    fontFamily: fonts.ui,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  } as TextStyle,
  buttonSmall: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  } as TextStyle,
  caption: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    fontWeight: '700' as const,
  } as TextStyle,
  eyebrow: {
    fontFamily: fonts.ui,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    fontWeight: '700' as const,
  } as TextStyle,
} as const;
