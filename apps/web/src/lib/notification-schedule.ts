// ─── The notification rhythm ─────────────────────────────────────────────────
// A calm, opt-in, timezone-aware schedule. The cron ticks hourly; for each
// family we work out their LOCAL time and decide whether a touch is due right
// now. Three possible touches, never more than one per slot:
//   - morning brief   (~07:00 local, on by default)
//   - evening recap   (~19:00 local, OFF by default - opt in)
//   - weekend review  (Sunday ~17:00 local, on by default)
// Quiet hours: nothing is ever sent before 07:00 or at/after 21:00 local.

export type DueTouch = 'morning_brief' | 'evening_recap' | 'weekend_review';

export interface NotificationPrefs {
  morning_brief?: boolean;
  evening_recap?: boolean;
  weekend_review?: boolean;
  // legacy keys we still read for back-compat with already-stored prefs
  morning_idea?: boolean;
  weekend_plan?: boolean;
  weekly_summary?: boolean;
}

const MORNING_HOUR = 7;
const EVENING_HOUR = 19;
const WEEKEND_HOUR = 17; // Sunday
const QUIET_START = 21; // 9pm
const QUIET_END = 7; // 7am

// Local hour (0-23) and weekday (0=Sunday) for a timezone at a given instant.
export function localParts(timeZone: string, at: Date): { hour: number; weekday: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-GB', {
      timeZone, hour: '2-digit', hour12: false, weekday: 'long',
    }).formatToParts(at);
  } catch {
    // Unknown timezone: fall back to Dublin.
    parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Dublin', hour: '2-digit', hour12: false, weekday: 'long',
    }).formatToParts(at);
  }
  const rawHour = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const hour = parseInt(rawHour, 10) % 24; // some locales render 24 for midnight
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = Math.max(0, names.indexOf(parts.find((p) => p.type === 'weekday')?.value ?? 'Sunday'));
  return { hour, weekday };
}

// Resolve prefs with defaults + legacy fallbacks. Morning + weekend default ON;
// evening defaults OFF (opt-in), so a family is never doubled up without asking.
function resolved(prefs: NotificationPrefs | null | undefined) {
  const p = prefs || {};
  return {
    morning: p.morning_brief ?? p.morning_idea ?? true,
    evening: p.evening_recap ?? false,
    weekend: p.weekend_review ?? p.weekend_plan ?? p.weekly_summary ?? true,
  };
}

// What touch (if any) is due for this family right now. The hourly cron means
// each slot fires once when the local hour matches.
export function dueTouch(opts: {
  timezone: string | null | undefined;
  prefs: NotificationPrefs | null | undefined;
  now: Date;
}): DueTouch | null {
  const { hour, weekday } = localParts(opts.timezone || 'Europe/Dublin', opts.now);
  if (hour < QUIET_END || hour >= QUIET_START) return null; // quiet hours
  const r = resolved(opts.prefs);
  if (weekday === 0 && hour === WEEKEND_HOUR && r.weekend) return 'weekend_review';
  if (hour === MORNING_HOUR && r.morning) return 'morning_brief';
  if (hour === EVENING_HOUR && r.evening) return 'evening_recap';
  return null;
}

// The slot active right now for a timezone, ignoring prefs (prefs are per-user
// and checked separately so each parent in a family can choose differently).
export function slotNow(timezone: string | null | undefined, now: Date): DueTouch | null {
  const { hour, weekday } = localParts(timezone || 'Europe/Dublin', now);
  if (hour < QUIET_END || hour >= QUIET_START) return null;
  if (weekday === 0 && hour === WEEKEND_HOUR) return 'weekend_review';
  if (hour === MORNING_HOUR) return 'morning_brief';
  if (hour === EVENING_HOUR) return 'evening_recap';
  return null;
}

export function prefAllows(prefs: NotificationPrefs | null | undefined, touch: DueTouch): boolean {
  const r = resolved(prefs);
  return touch === 'morning_brief' ? r.morning : touch === 'evening_recap' ? r.evening : r.weekend;
}

// The notification `type` we persist + the page each touch opens.
export const TOUCH_META: Record<DueTouch, { type: string; actionUrl: string }> = {
  morning_brief: { type: 'morning_brief', actionUrl: '/brief?mode=morning' },
  evening_recap: { type: 'evening_recap', actionUrl: '/brief?mode=evening' },
  weekend_review: { type: 'weekend_review', actionUrl: '/weekly-review' },
};
