// ─── Territory registry + resolution ────────────────────────────────────────
// One generic implementation, driven by per-territory framework DATA. Adding a
// territory means registering its framework, not changing this code. See
// docs/adr/0001-territory-architecture.md and docs/multi-territory-brief.md.

import type { Framework, TerritoryKey, Stage } from './types';
import type { CanonicalDimension } from './canonical';
import { TERRITORY_KEYS } from './types';
import { IE_FRAMEWORK } from './frameworks/ie';
import { ENG_FRAMEWORK } from './frameworks/eng';
import { SCO_FRAMEWORK } from './frameworks/sco';

export * from './types';
export * from './canonical';
export * from './prompts';
export * from './roadmap';

// Registered frameworks. Ireland is live; England is built and verified but
// gated behind onboarding (no UI exposes ENG selection until the legal content
// is human-reviewed). Scotland/Wales/NI land in later phases.
const FRAMEWORKS: Partial<Record<TerritoryKey, Framework>> = {
  IE: IE_FRAMEWORK,
  ENG: ENG_FRAMEWORK,
  SCO: SCO_FRAMEWORK,
};

export const DEFAULT_TERRITORY: TerritoryKey = 'IE';

// Coerce any stored/incoming value to a known territory key, defaulting to IE.
// Children created before the territory column existed resolve to IE.
export function resolveTerritory(value: string | null | undefined): TerritoryKey {
  if (value && (TERRITORY_KEYS as string[]).includes(value)) return value as TerritoryKey;
  return DEFAULT_TERRITORY;
}

// Get a territory's framework. Falls back to Ireland's so the app never breaks
// for a territory whose framework has not shipped yet (UI is IE-only until then).
export function getFramework(territory: string | null | undefined): Framework {
  const key = resolveTerritory(territory);
  return FRAMEWORKS[key] ?? IE_FRAMEWORK;
}

export function isFrameworkLive(territory: string | null | undefined): boolean {
  return Boolean(FRAMEWORKS[resolveTerritory(territory)]);
}

// Which curriculum stages apply to a given age, by age-range containment over
// the framework's stages. For Ireland this reproduces the previous overlapping
// bands exactly (e.g. a 5–6yo draws on both Aistear and junior primary).
export function stagesForAge(framework: Framework, age: number | null): string[] {
  const a = age ?? 6;
  const matched = framework.stages
    .filter((s: Stage) => a >= s.ageMin && a <= s.ageMax)
    .sort((x, y) => x.order - y.order)
    .map((s) => s.key);
  if (matched.length) return matched;
  // Fallback: the lowest stage that starts above the age, else the last stage.
  const sorted = [...framework.stages].sort((x, y) => x.order - y.order);
  const above = sorted.find((s) => a < s.ageMin);
  return [above?.key ?? sorted[sorted.length - 1]?.key ?? 'primary_junior'];
}

// The DB curriculum_outcomes.country value to query for a given territory.
export function outcomesCountryFor(territory: string | null | undefined): string {
  return getFramework(territory).outcomesCountry;
}

// Project a set of native curriculum-area names (as stored on outcomes/entries)
// onto canonical dimensions, via the framework's area mapping. Matches by area
// key or display name; unmatched areas contribute nothing (safe for old data).
export function canonicalForAreas(framework: Framework, areaNames: string[]): CanonicalDimension[] {
  const out = new Set<CanonicalDimension>();
  for (const name of areaNames) {
    const area = framework.areas.find((a) => a.key === name || a.name === name);
    if (area) for (const c of area.canonical) out.add(c);
  }
  return [...out];
}
