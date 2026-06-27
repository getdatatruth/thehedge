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
  completeOnboarding: boolean;
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
    // Once this bootstrap returns 200 the family and children genuinely exist,
    // so the family IS onboarded and may enter the app. The framework that
    // follows is cosmetic (it falls back to an on-device version if the server
    // call hiccups), so it must never gate entry. If THIS call fails, nothing
    // was created and the user safely stays in onboarding to retry.
    completeOnboarding: true,
  };
}

// ─── On-device fallback framework ────────────────────────────────────────────
//
// The server authors the framework with an LLM pass and its own deterministic
// fallback, so a 2xx always carries one. But a fresh family must NEVER be
// blocked from entering the app by a network blip, a cold function, or a slow
// LLM. If the server call fails for any reason, we build the same warm,
// deterministic framework here, on the device, from the answers we already hold.
// This mirrors buildFallbackFramework in apps/web/src/lib/kitchen-table.ts.

const WHY_LABEL: Record<string, string> = {
  do_more: 'wanting to do more with them',
  considering: 'wondering about home-educating',
  school_not_working: 'because school is not quite working for them',
  homeschool: 'already home-educating',
};
const WORRY_LABEL: Record<string, string> = {
  enough: 'whether you are doing enough',
  social: 'whether they will miss out socially',
  not_teacher: 'not being a teacher',
  tusla: 'the Tusla and legal side',
  none: 'nothing in particular, you just want good days',
};
const RHYTHM_LABEL: Record<string, string> = {
  after_school: 'after school and at weekends',
  mornings: 'mostly in the mornings',
  all_day: 'all day, it is just life',
  grab_it: 'whenever you can grab it',
};

const COMMITMENTS_BY_ENUM: Record<string, string[]> = {
  structured: [
    'I will give you a real, balanced week you can follow, mapped to the curriculum.',
    'I will keep the planning off your plate so you can teach, not assemble timetables.',
    'I will show you, honestly, what is being covered, without inventing a single target.',
  ],
  blended: [
    'I will offer a loose rhythm, never a rigid clock, that you can shape day to day.',
    'I will balance things gently in the background so the week feels rounded.',
    'I will follow your lead on the busy days and pick the thread back up after.',
  ],
  child_led: [
    'I will never hand you a timetable. I will follow your children and keep ideas flowing.',
    'I will notice what is being learned as you live, so coverage takes care of itself.',
    'I will keep the lightest possible eye on the big areas, and only ever whisper.',
  ],
  relaxed: [
    'I will keep it to good ideas when you want them, no schedules and no pressure.',
    'I will quietly remember what you do, so there is a record without any data entry.',
    'I will trust your way, and only nudge if a whole corner has gone quiet for ages.',
  ],
  exploratory: [
    'I will lead with nature and the seasons, the way your family already learns.',
    'I will let one obsession wander into the next rather than break the day into subjects.',
    'I will keep a soft eye on breadth so following their curiosity never costs them.',
  ],
};

const FORYOURWORRY_BY_KEY: Record<string, string> = {
  enough: 'You are almost certainly doing more than you think. I will reflect it back to you in plain sight, the maths in the baking, the science in the garden, so "am I doing enough" turns into "look at all we did".',
  social: 'This is the one I hear most, and it is the most solvable. I will surface real families and gatherings near you, so the friendships are there from the start, not an afterthought.',
  not_teacher: 'You do not need to be a teacher. Your job is to be curious alongside them, and I will carry the curriculum, the structure and the evidence so you never have to be the expert.',
  tusla: 'I will keep the Tusla side calm and honest. AEARS sets no minimum hours and no attendance bar, and I will never pretend it does. When a review comes, the record will already be written.',
  none: 'No worry, just good days, is a lovely place to start. I will keep it simple and let it deepen only if and when you want it to.',
};

export function buildLocalFramework(a: KTAnswers): KTFramework {
  const kids = a.children.map((c) => c.name.trim()).filter(Boolean);
  const kidList =
    kids.length === 0 ? 'your children' :
    kids.length === 1 ? kids[0] :
    `${kids.slice(0, -1).join(', ')} and ${kids[kids.length - 1]}`;
  const approachEnum = APPROACH_KEY_TO_ENUM[a.approachKey] || 'blended';

  return {
    opening: 'Welcome to The Hedge. This is your Family Framework: gentle ideas matched to your children day by day, a record that keeps itself as you live, and your whole year as a calm path rather than a syllabus. Here is how it will work for your family.',
    whatYouToldMe: `You came to The Hedge ${WHY_LABEL[a.whyKey] || 'wanting more for your family'}. The thing on your mind is ${WORRY_LABEL[a.worryKey] || 'doing right by them'}. When learning happens for you, it tends to be ${RHYTHM_LABEL[a.rhythmKey || ''] || 'whenever there is space'}.`,
    commitments: COMMITMENTS_BY_ENUM[approachEnum] || COMMITMENTS_BY_ENUM.blended,
    quietFloor: 'And underneath all of it, I will keep a light eye on the big areas of a rounded childhood, so nothing important goes untouched. No scores, no red marks, just a gentle nudge now and again if a corner has been quiet for a while.',
    forYourWorry: FORYOURWORRY_BY_KEY[a.worryKey] || FORYOURWORRY_BY_KEY.enough,
    thingsToday: [
      kids.length > 0
        ? `Try one lovely thing with ${kidList} today, picked for their age and what they love.`
        : 'Try one lovely thing today, picked for your family.',
      'Tap "we did this" when you are done, and your family\'s record starts keeping itself.',
      'Have a look at your year as a gentle path, not a syllabus.',
    ],
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
