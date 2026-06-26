// ─── The Hedge personalisation engine ──────────────────────────────────────
//
// One engine, two dials, one invisible floor. Every surface that picks or ranks
// an activity (Today's hero, Plan slots, Find-ideas ordering, nudges) runs this
// same weight() so the experience feels made-for-this-family without any of it
// being announced.
//
//   weight = baseInterest x ageFit x floorBoost x contextFit
//
// - ageFit          keeps a 2-year-old away from an 8-year-old's activity
// - baseInterest    bridges through the child's current loves
// - floorBoost      gently floats "resting/cool" learning areas up (the quiet
//                   Rounded-Childhood floor) WITHOUT ever naming a deficit, and
//                   is suppressed during cold-start so a new family is never told
//                   it is failing at ten things
// - contextFit      weather + season nudges
//
// The "structure" dial (emergent <-> planned) is derived from the family's
// approach and only decides whether coverage is read FORWARD (it plans) or
// BACKWARD (it notices) - the selection maths is identical either way.

export const LEARNING_AREAS = [
  'nature', 'science', 'art', 'maths', 'literacy',
  'movement', 'kitchen', 'life_skills', 'calm', 'social',
] as const;
export type LearningArea = (typeof LEARNING_AREAS)[number];

export type Approach = 'structured' | 'blended' | 'child_led' | 'relaxed' | 'exploratory';

// How "planned" this family is, 0 (emergent) -> 1 (structured). Stored long term
// as a drifting float; derived here from the captured approach as a sensible seed.
export function structureFromApproach(approach?: string | null): number {
  switch (approach) {
    case 'structured': return 0.9;
    case 'blended': return 0.55;
    case 'exploratory': return 0.4;
    case 'relaxed': return 0.2;
    case 'child_led': return 0.1;
    default: return 0.5;
  }
}

export function ageInYears(dob: string | Date | null | undefined, now: Date): number | null {
  if (!dob) return null;
  const d = typeof dob === 'string' ? new Date(dob) : dob;
  if (isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return Math.max(0, age);
}

export type WarmthClass = 'warm' | 'resting' | 'cool';
export interface AreaWarmth { score: number; klass: WarmthClass }

// Recency-weighted count of logged activities per area (decay ~0.97/day), then
// classified. Cold-start: fewer than COLD_START_LOGS total logs => no floor
// signal at all (returns an empty map), so a new family is never nudged.
export const COLD_START_LOGS = 10;
const DECAY_PER_DAY = 0.97;

export function computeAreaWarmth(
  logs: { date: string | Date; category?: string | null }[],
  now: Date,
): Record<string, AreaWarmth> {
  if (logs.length < COLD_START_LOGS) return {};
  const scores: Record<string, number> = {};
  for (const log of logs) {
    const cat = log.category;
    if (!cat) continue;
    const d = typeof log.date === 'string' ? new Date(log.date) : log.date;
    if (isNaN(d.getTime())) continue;
    const days = Math.max(0, (now.getTime() - d.getTime()) / 86_400_000);
    scores[cat] = (scores[cat] || 0) + Math.pow(DECAY_PER_DAY, days);
  }
  const values = LEARNING_AREAS.map((a) => scores[a] || 0);
  const max = Math.max(1, ...values);
  const out: Record<string, AreaWarmth> = {};
  for (const area of LEARNING_AREAS) {
    const score = scores[area] || 0;
    const ratio = score / max;
    const klass: WarmthClass = ratio >= 0.4 ? 'warm' : ratio > 0 ? 'resting' : 'cool';
    out[area] = { score, klass };
  }
  return out;
}

// 1.0 in-band; soft, steep penalty as the child's age falls outside the band.
export function ageFit(age: number | null, ageMin: number, ageMax: number): number {
  if (age == null) return 1; // unknown age: do not penalise
  if (age >= ageMin && age <= ageMax) return 1;
  const gap = age < ageMin ? ageMin - age : age - ageMax;
  return Math.max(0.05, 1 - 0.28 * gap);
}

export function interestScore(
  childInterests: string[] | null | undefined,
  activity: { interests?: string[] | null; category?: string | null },
): number {
  const loves = (childInterests || []).map((s) => s.toLowerCase());
  if (loves.length === 0) return 1;
  const tags = [...(activity.interests || []), activity.category || '']
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  const hits = tags.filter((t) => loves.includes(t)).length;
  return 1 + Math.min(2, hits * 0.6); // bridge through what they love, capped
}

export function floorBoost(
  warmth: Record<string, AreaWarmth>,
  category?: string | null,
): number {
  if (!category) return 1;
  const w = warmth[category];
  if (!w) return 1; // cold-start or unknown: no nudge
  if (w.klass === 'cool') return 3;
  if (w.klass === 'resting') return 1.6;
  return 1;
}

export interface ActivityForWeight {
  category?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  interests?: string[] | null;
  location?: string | null;
  season?: string[] | null;
  energyLevel?: string | null;
}

export interface WeightContext {
  age: number | null;
  childInterests?: string[] | null;
  warmth: Record<string, AreaWarmth>;
  isRaining?: boolean;
  season?: string | null;
}

export function weightActivity(activity: ActivityForWeight, ctx: WeightContext): number {
  const fit = ageFit(ctx.age, activity.ageMin ?? 0, activity.ageMax ?? 99);
  const interest = interestScore(ctx.childInterests, activity);
  const floor = floorBoost(ctx.warmth, activity.category);

  let context = 1;
  if (ctx.isRaining) {
    const indoorish = ['indoor', 'both', 'anywhere'].includes(activity.location || '');
    context *= indoorish ? 1.3 : 0.4;
  }
  if (ctx.season && (activity.season || []).includes(ctx.season)) context *= 1.2;

  return fit * interest * floor * context;
}

// Rank a candidate pool for one child, best first. Best fit floats to the top;
// we never hard-empty the pool (a less-good fit beats a blank day).
export function rankForChild<T extends ActivityForWeight>(
  activities: T[],
  ctx: WeightContext,
): T[] {
  return activities
    .map((a) => ({ a, w: weightActivity(a, ctx) }))
    .sort((x, y) => y.w - x.w)
    .map((x) => x.a);
}
