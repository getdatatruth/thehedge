export const colors = {
  forest: '#1C3520',
  parchment: '#F5F0E4',
  linen: '#EDE6D3',
  stone: '#D5C9B0',
  sage: '#8FAF7E',
  moss: '#3D6142',
  terracotta: '#C4623A',
  ink: '#1A1612',
  umber: '#6B4F35',
  clay: '#9E7B5A',
  amber: '#D4A017',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

// Semantic aliases
export const semantic = {
  background: colors.parchment,
  surface: colors.linen,
  border: colors.stone,
  text: colors.ink,
  textSecondary: colors.clay,
  textMuted: `${colors.clay}99`,
  primary: colors.forest,
  primaryLight: colors.moss,
  accent: colors.terracotta,
  success: colors.sage,
  warning: colors.amber,
  error: colors.terracotta,
} as const;
