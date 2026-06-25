// ─── The Kitchen Table (mobile) ─────────────────────────────────────────────
//
// Mobile-local copy of the web contract in apps/web/src/lib/kitchen-table.ts.
// Types here MUST stay in lockstep with the web KTAnswers/KTFramework shapes,
// because the same POST /api/kitchen-table endpoint reads and returns them.
//
// The chips carry deterministic structured meaning (so the server always gets a
// clean profile even if the LLM pass fails); free text is the colour the model
// reads back. The payoff is a one-page Family Framework in the parent's register.

import { supabase } from './supabase';

export interface KTChild {
  name: string;
  age: number | null;
  interests: string[];
}

// Mirrors apps/web/src/lib/kitchen-table.ts KTAnswers exactly.
export interface KTAnswers {
  children: KTChild[];
  whyKey: string;
  whyText?: string;
  worryKey: string;
  worryText?: string;
  approachKey: string;
  approachText?: string;
  rhythmKey?: string;
  rhythmText?: string;
  county?: string;
  outdoor?: string;
  tuslaKey?: string;
}

// Mirrors apps/web/src/lib/kitchen-table.ts KTFramework exactly. The one-page
// framework, rendered back in the parent's own register.
export interface KTFramework {
  opening: string;
  whatYouToldMe: string;
  commitments: string[];
  quietFloor: string;
  forYourWorry: string;
  thingsToday: string[];
}

// ─── Conversation content (warm, southern-Irish, calm) ───────────────────────
// These chip sets and copy mirror the web kitchen-table-client so the two
// platforms feel like the same conversation. Keep the chip `key`s identical to
// web so the server's deterministic mapping (whyKey/approachKey/...) lines up.

export const INTEREST_OPTIONS = [
  'animals', 'nature', 'art', 'building', 'stories', 'numbers',
  'music', 'sports', 'science', 'cooking', 'dinosaurs', 'space',
] as const;

export interface Chip {
  key: string;
  label: string;
}

export const WHY_CHIPS: Chip[] = [
  { key: 'do_more', label: 'I just want to do more with them' },
  { key: 'considering', label: "We're wondering about home-ed" },
  { key: 'school_not_working', label: "School isn't quite working for us" },
  { key: 'homeschool', label: 'We already home-educate' },
];

export const WORRY_CHIPS: Chip[] = [
  { key: 'enough', label: 'Am I doing enough?' },
  { key: 'social', label: 'Will they miss out socially?' },
  { key: 'not_teacher', label: "I'm not a teacher" },
  { key: 'tusla', label: 'The Tusla / legal side' },
  { key: 'none', label: 'No real worry, just want good days' },
];

export const APPROACH_CHIPS: Chip[] = [
  { key: 'structured', label: 'A plan we follow, a bit of structure' },
  { key: 'blended', label: 'A loose rhythm, some structure some freedom' },
  { key: 'child_led', label: "Following whatever they're obsessed with" },
  { key: 'nature', label: 'Out in nature, led by the seasons' },
  { key: 'no_school', label: "We don't really 'do school'" },
];

export const RHYTHM_CHIPS: Chip[] = [
  { key: 'after_school', label: 'After school and weekends' },
  { key: 'mornings', label: 'Mostly mornings' },
  { key: 'all_day', label: "All day, it's just life" },
  { key: 'grab_it', label: 'Whenever we can grab it' },
];

export const OUTDOOR_CHIPS: Chip[] = [
  { key: 'garden', label: 'A garden' },
  { key: 'nearby', label: 'Green space nearby' },
  { key: 'none', label: 'Not really' },
];

export const TUSLA_CHIPS: Chip[] = [
  { key: 'not_registered', label: "Not registered / not sure I need to" },
  { key: 'registered', label: 'Registered' },
  { key: 'awaiting', label: 'Awaiting assessment' },
  { key: 'curious', label: 'Just curious about it' },
];

// The four leanings that mean a family is on a home-education path. Used to
// decide whether to ask the gentle Tusla question (matches web).
export const HOME_ED_WHY_KEYS = ['considering', 'school_not_working', 'homeschool'];

export function chipLabel(chips: Chip[], key?: string): string {
  return chips.find((c) => c.key === key)?.label ?? '';
}

// ─── Mapping KTAnswers -> the existing /api/onboarding bootstrap payload ──────
//
// The kitchen-table route requires the user to already belong to a family. A
// fresh mobile signup has no family yet, so before authoring the framework we
// bootstrap the family + children through the existing /api/onboarding endpoint
// (which the old wizard also used). These mappers keep the KT keys honest
// against the DB enums the onboarding route expects.

// KT approach key -> education_approach DB enum (same table the web flow writes).
const APPROACH_KEY_TO_ENUM: Record<string, string> = {
  structured: 'structured',
  blended: 'blended',
  child_led: 'child_led',
  nature: 'exploratory',
  no_school: 'relaxed',
};

// KT why key -> learningPath the onboarding route understands.
const WHY_KEY_TO_PATH: Record<string, string> = {
  do_more: 'mainstream',
  considering: 'considering',
  school_not_working: 'considering',
  homeschool: 'homeschool',
};

export interface OnboardingBootstrapPayload {
  familyName: string;
  county: string;
  children: { name: string; dateOfBirth: string; interests: string[]; schoolStatus: string }[];
  learningPath: string;
  educationApproach: string;
  familyStyle: string;
  outdoorSpace: string;
  learningGoals: string[];
  activitiesPerWeek: string;
}

// Build the bootstrap payload for /api/onboarding from the warm KT answers.
export function answersToOnboardingPayload(
  a: KTAnswers,
  familyName: string,
): OnboardingBootstrapPayload {
  const thisYear = new Date().getFullYear();
  const path = WHY_KEY_TO_PATH[a.whyKey] || 'mainstream';
  const schoolStatus = path === 'homeschool' ? 'homeschool'
    : path === 'considering' ? 'considering'
    : 'mainstream';

  return {
    familyName: familyName.trim() || 'My family',
    county: a.county?.trim() || '',
    children: a.children
      .filter((c) => c.name.trim())
      .map((c) => ({
        name: c.name.trim(),
        // The onboarding route only needs a valid DOB; age -> 1 Jan of birth year.
        dateOfBirth: `${c.age != null ? thisYear - c.age : thisYear - 6}-01-01`,
        interests: c.interests || [],
        schoolStatus,
      })),
    learningPath: path,
    educationApproach: APPROACH_KEY_TO_ENUM[a.approachKey] || 'blended',
    familyStyle: 'balanced',
    outdoorSpace: a.outdoor || '',
    learningGoals: [],
    activitiesPerWeek: '',
  };
}

// ─── Calling POST /api/kitchen-table directly ────────────────────────────────
//
// This is a ROOT api route (NOT under /api/v1) and it returns { framework,
// profile } with no { success, data } envelope, so the shared api() helper in
// src/lib/api.ts would reject it. We call it directly here, mirroring api.ts's
// origin logic and bearer-token auth. The endpoint has a deterministic fallback
// server-side, so a 2xx always carries a usable framework.

const PROD_API_ORIGIN = 'https://app.thehedge.ie';
const API_ORIGIN = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
  : PROD_API_ORIGIN;

export interface KTResult {
  framework: KTFramework;
}

// Transcript is what the web flow sends for the LLM to read back; the server
// stores it but it is not part of the typed KTAnswers contract.
export type KTTranscript = { q: string; a: string }[];

export async function postKitchenTable(
  answers: KTAnswers,
  transcript: KTTranscript,
): Promise<KTResult> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_ORIGIN}/api/kitchen-table`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ answers: { ...answers, transcript } }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.framework) {
    throw new Error(json?.error || 'Could not write your framework just now.');
  }
  return { framework: json.framework as KTFramework };
}
