import { Platform, TextStyle } from 'react-native';

// Font families - loaded via expo-font
export const fonts = {
  display: 'CormorantGaramond-Light',
  displayItalic: 'CormorantGaramond-LightItalic',
  displayMedium: 'CormorantGaramond-Medium',
  ui: Platform.select({ ios: 'System', android: 'sans-serif' }) ?? 'System',
  uiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }) ?? 'System',
  body: 'InstrumentSerif-Regular',
  bodyItalic: 'InstrumentSerif-Italic',
} as const;

// Type scale
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
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
  } as TextStyle,
  h3: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
  } as TextStyle,
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
  } as TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodySmall: {
    fontFamily: fonts.body,
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
