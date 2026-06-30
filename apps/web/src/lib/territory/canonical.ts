// ─── Canonical learning dimensions ──────────────────────────────────────────
// The Hedge's internal lingua franca. Every territory's native curriculum areas
// map onto these eight dimensions, so a single logged activity can be projected
// into any territory's vocabulary (Aistear, the National Curriculum, CfE, AoLEs,
// CCEA). Generated/logged once against canonical dimensions; rendered in native
// terms per territory. See docs/adr/0001-territory-architecture.md.

export const CANONICAL_DIMENSIONS = [
  'literacy_language',
  'numeracy_maths',
  'science_natural_world',
  'arts_creativity',
  'physical_wellbeing',
  'social_personal_moral',
  'technology_digital',
  'humanities_environment',
] as const;

export type CanonicalDimension = (typeof CANONICAL_DIMENSIONS)[number];

// Territory-neutral fallback labels. Territories may relabel in their copy.
export const CANONICAL_LABELS: Record<CanonicalDimension, string> = {
  literacy_language: 'Literacy and language',
  numeracy_maths: 'Numeracy and maths',
  science_natural_world: 'Science and the natural world',
  arts_creativity: 'Arts and creativity',
  physical_wellbeing: 'Physical and wellbeing',
  social_personal_moral: 'Social, personal and moral',
  technology_digital: 'Technology and digital',
  humanities_environment: 'Humanities and environment',
};

export function isCanonicalDimension(x: string): x is CanonicalDimension {
  return (CANONICAL_DIMENSIONS as readonly string[]).includes(x);
}

// ─── Activity category → canonical dimensions ───────────────────────────────
// Activity categories (the DB activity_category enum) describe the KIND of
// activity and are territory-neutral. This maps each to the canonical learning
// dimension(s) it typically evidences, so any activity (library or bespoke
// Spark) can carry canonical_dimensions derived from its category. Used at
// generation time and by the migration backfill.

export const CATEGORY_TO_CANONICAL: Record<string, CanonicalDimension[]> = {
  nature: ['science_natural_world', 'humanities_environment'],
  science: ['science_natural_world'],
  kitchen: ['numeracy_maths', 'science_natural_world'],
  maths: ['numeracy_maths'],
  literacy: ['literacy_language'],
  art: ['arts_creativity'],
  movement: ['physical_wellbeing'],
  calm: ['physical_wellbeing'],
  life_skills: ['social_personal_moral'],
  social: ['social_personal_moral'],
};

export function canonicalForCategory(category: string | null | undefined): CanonicalDimension[] {
  if (!category) return [];
  return CATEGORY_TO_CANONICAL[category] ?? [];
}
