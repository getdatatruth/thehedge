// ─── AEARS / Irish home-education timeline helpers ───────────────────────
//
// The Assessment of Education in a Place other than a Recognised School
// (AEARS) process runs under Section 14 of the Education (Welfare) Act 2000.
// These helpers turn a family's registration status and dates into a calm,
// computed set of guidance milestones - so the dates shown are real and
// move with the calendar, not hardcoded blanks.
//
// IMPORTANT: everything here is framed as GUIDANCE to help a family organise
// the evidence an AEARS assessment tends to look for. It is not legal advice
// and it is not an official Tusla product. Tusla sets no minimum hours or
// attendance rate, so we never invent thresholds. Timings (windows, typical
// assessment cadence) are the generally-published norms and are clearly
// labelled as guidance, with the family always able to override real dates.

export type AearsStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved';

export type MilestoneKind = 'notification' | 'assessment' | 'review' | 'evidence';

export type MilestoneTone = 'overdue' | 'soon' | 'upcoming' | 'done' | 'guidance';

export interface AearsMilestone {
  id: string;
  title: string;
  /** ISO yyyy-mm-dd date the milestone falls on, or null if not datable yet. */
  date: string | null;
  /** Whole days from today until the date. Negative = in the past. */
  daysAway: number | null;
  kind: MilestoneKind;
  /** Calm, plain-language note on what this milestone is for. */
  description: string;
  /** A gentle, non-legal framing of why now. */
  guidance: string;
  tone: MilestoneTone;
  /** True when the milestone is a fixed step the family has already passed. */
  done: boolean;
}

export interface AearsTimelineInput {
  status: AearsStatus;
  /** When the family started (or intends to start) home educating. */
  educationStartDate?: string | null;
  /** When the application for registration was submitted to Tusla (registration record). */
  submittedAt?: string | null;
  /** When Tusla confirmed the child on the register. */
  approvedAt?: string | null;
  /** Reference point for "today" - injectable for testing. */
  today?: Date;
}

// ─── Date helpers ─────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Parse a yyyy-mm-dd (or ISO) string into a midday-anchored Date, or null. */
function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const datePart = value.split('T')[0];
  const d = new Date(`${datePart}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a Date back to yyyy-mm-dd. */
function toIso(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Whole days from `from` until `to` (positive = future). */
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(`${toIso(from)}T12:00:00`).getTime();
  const b = new Date(`${toIso(to)}T12:00:00`).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

function addMonths(d: Date, months: number): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Turn a number of days-away into a calm tone bucket. */
function toneFor(daysAway: number | null, done: boolean): MilestoneTone {
  if (done) return 'done';
  if (daysAway === null) return 'guidance';
  if (daysAway < 0) return 'overdue';
  if (daysAway <= 30) return 'soon';
  return 'upcoming';
}

// ─── Timeline computation ─────────────────────────────────────────────────

/**
 * Build the AEARS guidance timeline for one child's registration.
 *
 * The shape of the timeline depends on where the family is:
 *  - Before submitting: the focus is the Application for Registration and
 *    giving Tusla reasonable notice before starting at home.
 *  - After submitting: the focus shifts to the preliminary assessment.
 *  - Once approved: a steady annual review cadence with a gentle
 *    "start gathering evidence" nudge ahead of it.
 */
export function buildAearsTimeline(input: AearsTimelineInput): AearsMilestone[] {
  const today = input.today ? new Date(input.today) : new Date();
  const startDate = parseDate(input.educationStartDate);
  const submittedAt = parseDate(input.submittedAt);
  const approvedAt = parseDate(input.approvedAt);

  const milestones: AearsMilestone[] = [];

  const push = (
    partial: Omit<AearsMilestone, 'daysAway' | 'tone'> & { date: string | null }
  ) => {
    const date = parseDate(partial.date);
    const daysAway = date ? daysBetween(today, date) : null;
    milestones.push({
      ...partial,
      daysAway,
      tone: toneFor(daysAway, partial.done),
    });
  };

  // ── 1. Application for Registration (Section 14) ──
  // Guidance: families are advised to apply in good time - giving around a
  // month before beginning at home is a sensible, unhurried window.
  if (submittedAt) {
    push({
      id: 'm-notification',
      title: 'Application for Registration submitted',
      date: toIso(submittedAt),
      kind: 'notification',
      description: 'You applied to Tusla (AEARS), under Section 14, to register your child as educated at home.',
      guidance: 'This is the step that opens your AEARS file. Keep a copy of what you sent.',
      done: true,
    });
  } else {
    // Target an application date around a month before the intended start.
    const target = startDate ? addDays(startDate, -30) : null;
    push({
      id: 'm-notification',
      title: 'Submit your Application for Registration',
      date: target ? toIso(target) : null,
      kind: 'notification',
      description: 'Apply to Tusla (AEARS) under Section 14 to register your child as educated at home, using Tusla\'s official form and a certified copy of the birth certificate or passport.',
      guidance: startDate
        ? 'Applying around a month before you start keeps everything unhurried. Once your application is acknowledged as valid, you may begin while the assessment proceeds.'
        : 'Add your intended start date in the Application Form and this date will fill itself in.',
      done: false,
    });
  }

  // ── 2. Preliminary assessment window ──
  // Guidance: after an application is acknowledged as valid, a preliminary assessment
  // is typically arranged within a couple of months. We anchor to the
  // submission date when we have it.
  if (submittedAt && !approvedAt) {
    const windowOpen = addDays(submittedAt, 28);
    const windowClose = addMonths(submittedAt, 3);
    const openPassed = daysBetween(today, windowOpen) < 0;
    push({
      id: 'm-preliminary',
      title: 'Preliminary assessment likely',
      date: toIso(openPassed ? windowClose : windowOpen),
      kind: 'assessment',
      description: 'A questionnaire and a meeting with you (the parent or guardian) about your provision. A comprehensive assessment, a home visit by an assessor, follows later.',
      guidance: 'The preliminary assessment tends to fall in the weeks after you apply. Have your plan and a few work samples to hand if you like.',
      done: false,
    });
  }

  // ── 3. On the register ──
  if (approvedAt) {
    push({
      id: 'm-approved',
      title: 'On the Section 14 register',
      date: toIso(approvedAt),
      kind: 'review',
      description: 'Tusla confirmed your child on the Section 14 register of children educated at home.',
      guidance: 'From here, registration is subject to periodic review, with the timing set by Tusla. Nothing sudden.',
      done: true,
    });
  }

  // ── 4. Periodic review guideline + evidence nudge ──
  // Once approved, project a guideline review point (roughly a year on from
  // approval) and a "start gathering evidence" reminder about six weeks ahead.
  // This is only a gentle guideline: registration is subject to periodic
  // review with the timing set by Tusla, not a fixed mandatory annual
  // assessment. Before approval we still surface a first guideline review off
  // the start date so a family can see the shape of the year.
  const anchor = approvedAt ?? startDate;
  if (anchor) {
    // Find the next anniversary of the anchor that is in the future.
    let nextReview = new Date(anchor);
    let guard = 0;
    while (daysBetween(today, nextReview) < 0 && guard < 25) {
      nextReview = addMonths(nextReview, 12);
      guard += 1;
    }

    const evidenceDate = addDays(nextReview, -42);

    push({
      id: 'm-evidence',
      title: 'Start gathering this year\'s evidence',
      date: toIso(evidenceDate),
      kind: 'evidence',
      description: 'A calm window to pull together portfolio samples and tidy your records.',
      guidance: 'Around six weeks out is plenty of time to gather evidence without it ever feeling like a scramble.',
      done: false,
    });

    push({
      id: 'm-annual-review',
      title: approvedAt ? 'Periodic review (guideline)' : 'First review (guideline)',
      date: toIso(nextReview),
      kind: 'review',
      description: approvedAt
        ? 'A guideline for a periodic AEARS review, where an assessor revisits your provision. The actual timing is set by Tusla.'
        : 'A guideline for when a first review tends to land, once registered. Registration is subject to periodic review set by Tusla.',
      guidance: 'Reviews are a conversation about how learning is going, not an exam. Your everyday records carry most of it.',
      done: false,
    });
  }

  // Sort: undated guidance last, otherwise by date ascending.
  return milestones.sort((a, b) => {
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

/**
 * The most relevant upcoming milestone: the soonest not-done, not-past one,
 * falling back to the soonest overdue, then the first undated guidance item.
 */
export function nextAearsMilestone(milestones: AearsMilestone[]): AearsMilestone | null {
  const dated = milestones.filter((m) => !m.done && m.daysAway !== null);
  const future = dated
    .filter((m) => (m.daysAway ?? 0) >= 0)
    .sort((a, b) => (a.daysAway ?? 0) - (b.daysAway ?? 0));
  if (future.length) return future[0];

  const overdue = dated
    .filter((m) => (m.daysAway ?? 0) < 0)
    .sort((a, b) => (b.daysAway ?? 0) - (a.daysAway ?? 0));
  if (overdue.length) return overdue[0];

  const guidance = milestones.filter((m) => !m.done && m.daysAway === null);
  return guidance[0] ?? null;
}

// ─── Human-friendly "days away" phrasing ──────────────────────────────────

export function describeDaysAway(daysAway: number | null): string {
  if (daysAway === null) return 'Date not set yet';
  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  if (daysAway === -1) return 'Yesterday';
  if (daysAway < 0) return `${Math.abs(daysAway)} days ago`;
  if (daysAway < 30) return `In ${daysAway} days`;
  if (daysAway < 60) return 'In about a month';
  const months = Math.round(daysAway / 30);
  return `In about ${months} months`;
}

// ─── Assessment readiness ─────────────────────────────────────────────────

export interface ReadinessItem {
  completed: boolean;
}

export interface AearsReadiness {
  total: number;
  ready: number;
  percent: number;
  /** A calm one-line readout for the family. */
  label: string;
}

/**
 * Summarise how ready a family's assessment checklist is. Pure and tolerant
 * of an empty list. The label is deliberately reassuring, never a guarantee.
 */
export function assessmentReadiness(items: ReadinessItem[]): AearsReadiness {
  const total = items.length;
  const ready = items.filter((i) => i.completed).length;
  const percent = total > 0 ? Math.round((ready / total) * 100) : 0;

  let label: string;
  if (total === 0) label = 'Nothing to tick yet';
  else if (ready === 0) label = 'A calm place to start';
  else if (ready === total) label = 'Everything you wanted to have ready is ready';
  else if (percent >= 75) label = 'Nearly there - a few items left';
  else if (percent >= 40) label = 'Coming together nicely';
  else label = 'Gently underway';

  return { total, ready, percent, label };
}
