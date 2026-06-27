// aears.ts
// Shared logic for the home-education registration helper screen. In Ireland you
// register WITH Tusla, VIA AEARS (the Alternative Education Assessment and
// Registration Service, a service within Tusla). This is NOT an official Tusla
// product and not legal advice. It exists to help a family organise the kind of
// evidence an assessment tends to look at, and to keep gentle track of where they
// are in the registration process.
//
// There is no required curriculum, no minimum number of hours and no attendance
// requirement. Nothing here should imply a pass/fail threshold. Everything is
// framed as guidance, not a guarantee. Use Tusla's official forms for anything
// official.

// ─── Registration status ───────────────────────────────────────────────

export type RegistrationStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'approved';

export const REGISTRATION_STEPS: {
  status: RegistrationStatus;
  label: string;
  blurb: string;
}[] = [
  {
    status: 'not_started',
    label: 'Not started',
    blurb: 'When you are ready, you can begin gathering things together.',
  },
  {
    status: 'in_progress',
    label: 'Getting ready',
    blurb: 'Pulling together notes and evidence at your own pace.',
  },
  {
    status: 'submitted',
    label: 'Application sent',
    blurb: 'Your application to register is with Tusla (via AEARS) and you are awaiting a response. Once it is acknowledged, you may carry on while the assessment proceeds.',
  },
  {
    status: 'approved',
    label: 'On the register',
    blurb: 'Your child is entered on the register. Nothing more to do for now.',
  },
];

export function statusIndex(status: RegistrationStatus): number {
  const i = REGISTRATION_STEPS.findIndex((s) => s.status === status);
  return i === -1 ? 0 : i;
}

export function nextStatus(
  status: RegistrationStatus
): RegistrationStatus | null {
  const i = statusIndex(status);
  return i < REGISTRATION_STEPS.length - 1
    ? REGISTRATION_STEPS[i + 1].status
    : null;
}

export function statusMeta(status: RegistrationStatus) {
  return REGISTRATION_STEPS[statusIndex(status)];
}

// ─── Checklists ─────────────────────────────────────────────────────────

export interface ChecklistItem {
  key: string;
  label: string;
  hint: string;
  done: boolean;
}

// Documents / evidence a family tends to want gathered before an assessment.
export const DEFAULT_DOCUMENT_CHECKLIST: Omit<ChecklistItem, 'done'>[] = [
  {
    key: 'notification',
    label: 'Application for Registration (Section 14)',
    hint: 'Tusla’s official application form (currently the R1), used to apply to be entered on the Section 14 Register.',
  },
  {
    key: 'birth_cert',
    label: 'Certified copy of birth certificate or passport',
    hint: 'A certified copy of your child’s birth certificate or passport goes with the application.',
  },
  {
    key: 'plan',
    label: 'A sense of your approach',
    hint: 'A short description of how learning happens in your home. No rigid plan needed.',
  },
  {
    key: 'samples',
    label: 'Examples of your child’s work',
    hint: 'A handful of things that show learning over time. Photos are perfect.',
  },
  {
    key: 'reading',
    label: 'Reading and literacy',
    hint: 'Anything that shows how your child engages with words, stories or writing.',
  },
  {
    key: 'numeracy',
    label: 'Numbers and problem-solving',
    hint: 'Everyday maths counts: cooking, money, building, games.',
  },
  {
    key: 'wider',
    label: 'The wider world',
    hint: 'Nature, science, art, history, music, movement. The rounded picture.',
  },
];

// What an assessor (an authorised person appointed by Tusla) tends to look at
// during a meeting or home visit.
export const DEFAULT_ASSESSMENT_CHECKLIST: Omit<ChecklistItem, 'done'>[] = [
  {
    key: 'minimum_education',
    label: 'A certain minimum education',
    hint: 'A broad experience suited to your child’s age, ability and aptitude. You do not have to follow the national curriculum.',
  },
  {
    key: 'literacy_numeracy',
    label: 'Literacy and numeracy growing',
    hint: 'Evidence that reading, writing and numbers are developing over time.',
  },
  {
    key: 'breadth',
    label: 'Breadth across areas',
    hint: 'A spread of experiences rather than one narrow focus.',
  },
  {
    key: 'progression',
    label: 'A sense of progression',
    hint: 'Things moving forward in a way that suits your child, at their pace.',
  },
  {
    key: 'child_voice',
    label: 'Your child can talk about it',
    hint: 'Assessors often simply chat with the child about what they have been doing.',
  },
  {
    key: 'environment',
    label: 'A supportive environment',
    hint: 'Space, materials and time for learning, in whatever shape fits your home.',
  },
];

// Merge stored state (array of { key, done }) onto the default definitions, so
// new default items appear and removed ones drop away gracefully.
export function mergeChecklist(
  defaults: Omit<ChecklistItem, 'done'>[],
  stored: { key: string; done?: boolean }[] | undefined
): ChecklistItem[] {
  const map = new Map((stored ?? []).map((s) => [s.key, !!s.done]));
  return defaults.map((d) => ({ ...d, done: map.get(d.key) ?? false }));
}

// Compact form to persist (only key + done, never the copy).
export function serialiseChecklist(
  items: ChecklistItem[]
): { key: string; done: boolean }[] {
  return items.map((i) => ({ key: i.key, done: i.done }));
}

export interface Readiness {
  done: number;
  total: number;
  fraction: number;
  // Calm, non-scoring phrasing. Never a pass/fail.
  phrase: string;
}

export function readiness(items: ChecklistItem[]): Readiness {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const fraction = total === 0 ? 0 : done / total;

  let phrase: string;
  if (done === 0) phrase = 'Nothing ticked yet, and that is perfectly fine.';
  else if (fraction < 0.5) phrase = 'A good start. Gather the rest in your own time.';
  else if (fraction < 1) phrase = 'Coming together nicely.';
  else phrase = 'You have everything you wanted gathered.';

  return { done, total, fraction, phrase };
}

// ─── Deadlines / timeline milestones ────────────────────────────────────

export interface Milestone {
  key: string;
  title: string;
  detail: string;
  date: Date;
  daysAway: number; // negative = in the past
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

// Irish school year tends to run September to June, so we anchor the yearly
// cadence to 1 September. Once a family is registered, Tusla reviews periodically;
// the timing is set by Tusla, so this is guidance, not a fixed legal date.
function schoolYearStart(ref: Date): Date {
  // If we are before September, the current school year started last September.
  const year = ref.getMonth() >= 8 ? ref.getFullYear() : ref.getFullYear() - 1;
  return new Date(year, 8, 1); // 1 September
}

/**
 * Build the registration timeline relative to today. `status` shapes which
 * milestones are relevant (e.g. once approved, we shift to the periodic-review
 * rhythm).
 *
 * Returns upcoming milestones (and the most recent just-passed one) sorted by
 * date, each with a friendly daysAway count.
 */
export function buildMilestones(
  status: RegistrationStatus,
  now: Date = new Date()
): Milestone[] {
  const start = schoolYearStart(now);
  const nextStart = new Date(start.getFullYear() + 1, 8, 1);

  const raw: Omit<Milestone, 'daysAway'>[] = [];

  if (status === 'approved') {
    // Periodic rhythm: gentle reminder to gather evidence, then the rough window
    // when a periodic review tends to come around again.
    raw.push({
      key: 'gather_evidence',
      title: 'Gather this year’s evidence',
      detail:
        'A calm reminder to keep adding the odd photo or note as the year goes on.',
      date: new Date(nextStart.getFullYear(), 4, 1), // 1 May
    });
    raw.push({
      key: 'review_window',
      title: 'Periodic review window',
      detail:
        'Tusla reviews registrations periodically, with the timing set by Tusla. A rough guide, not a fixed date.',
      date: nextStart,
    });
  } else {
    // Pre-registration rhythm: a nudge to apply, then to have evidence ready
    // for a first assessment.
    raw.push({
      key: 'registration_window',
      title: 'Apply to Tusla (AEARS) to register',
      detail:
        'There is no single deadline. Families often apply before or near the start of the school year, using Tusla’s official application form.',
      date: nextStart,
    });
    raw.push({
      key: 'prepare_evidence',
      title: 'Have your evidence to hand',
      detail:
        'A gentle target to have a few work samples gathered before a first assessment.',
      date: new Date(nextStart.getFullYear(), 9, 1), // 1 October
    });
  }

  return raw
    .map((m) => ({ ...m, daysAway: daysBetween(now, m.date) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Friendly "x days away" / "today" / "passed" phrasing.
export function daysAwayLabel(daysAway: number): string {
  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  if (daysAway > 1) return `In ${daysAway} days`;
  if (daysAway === -1) return 'Yesterday';
  return `${Math.abs(daysAway)} days ago`;
}
