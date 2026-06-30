import type { SupabaseClient } from '@supabase/supabase-js';
import { computeAreaWarmth, buildQuietFloor, type QuietFloorNudge } from '@/lib/personalisation';

// ─── The reassurance surface ────────────────────────────────────────────────
// The single biggest unmet need home-educating parents voice is reassurance:
// "Am I doing enough? Is my child okay?" This answers it calmly, WITHOUT a
// score, a benchmark, or any sense of pass/fail (gap analysis #1; wellbeing
// §14). It composes the existing warmth engine + Quiet Floor:
//
//  - Cold start (a new family, < 10 logs): never implies "behind". Settling tone.
//  - Nicely rounded lately: a plain, warm "you're doing plenty".
//  - A quiet corner: the same affirmation + ONE gentle, opt-in next step.
//
// Territory-safe by construction: it speaks in friendly everyday-activity
// language ("nature and the outdoors"), never curriculum/compliance jargon, so
// no Tusla/AEARS/Aistear or nation-specific vocabulary ever appears here.

export type ReassuranceTone = 'settling' | 'rounded' | 'gentle';

export interface Reassurance {
  tone: ReassuranceTone;
  headline: string;
  body: string;
  // The one gentle next step, when there is genuinely a quiet corner. Reuses the
  // Quiet Floor so it carries the spark "lean" the rest of the app understands.
  nextStep: QuietFloorNudge | null;
  recentCount: number;
}

interface LogRow {
  date: string;
  activities?: { category?: string | null } | { category?: string | null }[] | null;
}

function categoryOf(row: LogRow): string | null {
  const a = row.activities;
  if (!a) return null;
  const obj = Array.isArray(a) ? a[0] : a;
  return obj?.category ?? null;
}

/**
 * Build the reassurance state for a family from their own recent activity.
 * Reads the last ~120 days of logs so "established" means a genuine rhythm.
 */
export async function buildReassurance(
  supabase: SupabaseClient,
  opts: { familyId: string },
): Promise<Reassurance> {
  const now = new Date();
  const since = new Date(now.getTime() - 120 * 86_400_000).toISOString().split('T')[0];

  const { data } = await supabase
    .from('activity_logs')
    .select('date, activities(category)')
    .eq('family_id', opts.familyId)
    .gte('date', since)
    .order('date', { ascending: false });

  const rows = (data || []) as LogRow[];
  const logs = rows.map((r) => ({ date: r.date, category: categoryOf(r) }));
  const recentCount = logs.length;

  const warmth = computeAreaWarmth(logs, now);

  // Cold start: warmth is empty. Never imply "behind".
  if (Object.keys(warmth).length === 0) {
    return {
      tone: 'settling',
      headline: 'You are just getting started, and that is exactly right.',
      body:
        'There is no behind here. Log a moment whenever something happens, big or small, and your picture will quietly build itself. No rush at all.',
      nextStep: null,
      recentCount,
    };
  }

  const quiet = buildQuietFloor(warmth);

  if (!quiet) {
    // Genuinely rounded lately.
    return {
      tone: 'rounded',
      headline: 'You are doing plenty.',
      body:
        'Lately the days have been nicely rounded across the areas that matter. Nothing to chase, nothing to fix. Keep following your child.',
      nextStep: null,
      recentCount,
    };
  }

  // Doing well, with one gentle corner to lean into if they fancy it. The card
  // stays a brief affirmation; the actionable nudge (nextStep) is surfaced by
  // the Spark launcher, so we do not repeat the full message here.
  return {
    tone: 'gentle',
    headline: 'You are doing plenty.',
    body:
      'You have had a lovely run lately. There is a quiet corner or two you could lean into if you fancy it, but there is no pressure at all.',
    nextStep: quiet,
    recentCount,
  };
}
