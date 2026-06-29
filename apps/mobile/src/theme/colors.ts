// The Hedge v2 - Modernized color system
// Dual-mode: dark (onboarding/auth) + light (main app)

// ── Brand colors (unchanged identity) ──────────────────────────
export const brand = {
  forest: '#062922',
  moss: '#55753F',
  sage: '#9DB86E',
} as const;

// ── Base palette ───────────────────────────────────────────────
export const colors = {
  // Brand
  forest: '#062922',
  moss: '#55753F',
  sage: '#9DB86E',

  // Modernized neutrals
  parchment: '#F2F5F0',  // was #F5F0E4 - now light sage
  linen: '#FFFFFF',       // was #EDE6D3 - now white (card surfaces)
  stone: '#D8DDD5',       // was #D5C9B0 - now gray-green
  ink: '#062922',         // was #1A1612 - now dark forest

  // Legacy compat (aliased)
  terracotta: '#E8735A',  // modernized coral
  umber: '#6B4F35',
  clay: '#5A6B5E',        // was #9E7B5A - now muted forest
  amber: '#F5A623',
  white: '#FFFFFF',
  transparent: 'transparent',

  // New accent
  accent: '#55753F',      // bright natural green
} as const;

export type ColorName = keyof typeof colors;

// ── Semantic aliases (light mode - default for existing screens) ─
export const semantic = {
  background: colors.parchment,
  surface: colors.linen,
  border: colors.stone,
  text: colors.ink,
  textSecondary: colors.clay,
  textMuted: `${colors.clay}99`,
  primary: colors.forest,
  primaryLight: colors.moss,
  accent: colors.accent,
  success: colors.accent,
  warning: colors.amber,
  error: '#E57373',
} as const;

// ── Dark theme (onboarding + auth) ─────────────────────────────
export const darkTheme = {
  background: '#0D1F12',
  surface: '#162A1B',
  surfaceElevated: '#1E3A24',
  border: '#1E3A24',
  borderLight: '#2A4A30',
  text: '#F2F5F0',
  textSecondary: '#8A9B8E',
  textMuted: '#5A6B5E',
  accent: '#9DB86E',
  accentLight: '#9DB86E20',
  accentHover: '#B6CB8C',
  primary: '#9DB86E',
  error: '#E57373',
  warning: '#F5A623',
  success: '#9DB86E',
} as const;

// ── Light theme (main app) ─────────────────────────────────────
export const lightTheme = {
  background: '#F2F5F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#D8DDD5',
  borderLight: '#E8ECE6',
  text: '#062922',
  textSecondary: '#5A6B5E',
  textMuted: '#8A9B8E',
  accent: '#55753F',
  accentLight: '#55753F15',
  accentHover: '#406130',
  primary: '#062922',
  error: '#E57373',
  warning: '#F5A623',
  success: '#55753F',
} as const;

// Theme type uses string for color values so both dark and light themes are assignable
export type Theme = {
  [K in keyof typeof darkTheme]: string;
};

// ── Activity category colors ───────────────────────────────────
// Keys MUST match the database category enum exactly
export const categoryColors = {
  nature: '#55753F',
  science: '#5B8DEF',
  art: '#E8735A',
  maths: '#9B7BD4',
  literacy: '#5BBDD4',
  movement: '#F5A623',
  kitchen: '#D4845B',
  life_skills: '#698441',
  calm: '#8A9B8E',
  social: '#E85BAD',
  // Fallback
  default: '#8A9B8E',
} as const;

export type CategoryName = keyof typeof categoryColors;
