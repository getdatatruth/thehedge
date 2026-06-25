/**
 * Family context for the AI.
 *
 * Every AI reply on The Hedge should feel like it knows THIS family and no
 * other. This module assembles a compact, token-efficient picture of a single
 * family from their own real data:
 *   - their Family Framework (the beliefs they recognise as their own)
 *   - their children (names, ages, interests, school status)
 *   - what they have actually been doing lately (recent activity logs)
 *   - their favourites
 *   - their county and learning approach
 *   - an accumulated AI memory that grows, gently, over time
 *
 * It returns both a structured object (for code) and a short, ready-to-paste
 * text block for a system prompt. Everything is summarised and capped so it
 * stays cheap to send on every turn.
 *
 * Privacy: this only ever reads one family's own rows. The memory is written
 * through the service-role (admin) client so it always records, but it is read
 * back through whichever client the route already holds, which is scoped to the
 * family by row-level security.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// A minimal shape that both the anon-key and service-role Supabase clients
// satisfy, so callers can pass whichever they already have.
type SupabaseLike = {
  from: (table: string) => any;
};

export interface FamilyChildContext {
  name: string;
  age: number | null;
  interests: string[];
  schoolStatus: string;
}

export interface FamilyContext {
  familyId: string;
  county: string | null;
  approach: string | null;
  doorway: string | null;
  framework: string | null;
  children: FamilyChildContext[];
  recentActivities: string[];
  recentCategories: string[];
  favourites: string[];
  memory: string[];
  memorySummary: string | null;
}

const MAX_FRAMEWORK_CHARS = 900;
const MAX_RECENT_ACTIVITIES = 8;
const MAX_FAVOURITES = 6;
const MAX_MEMORY_NOTES = 12;
const MAX_NOTE_CHARS = 160;

function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age < 0 ? 0 : age;
}

function clamp(text: string, max: number): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/**
 * Pull a short, readable framework summary from either the rendered markdown
 * the parent recognises, or the structured profile if that is all we have.
 */
function summariseFramework(row: {
  rendered_markdown?: string | null;
  profile?: Record<string, unknown> | null;
} | null): string | null {
  if (!row) return null;

  if (row.rendered_markdown && row.rendered_markdown.trim().length > 0) {
    // Strip markdown furniture so it reads as plain prose in the prompt.
    const plain = row.rendered_markdown
      .replace(/[#>*_`-]/g, ' ')
      .replace(/\s+/g, ' ');
    return clamp(plain, MAX_FRAMEWORK_CHARS);
  }

  if (row.profile && typeof row.profile === 'object') {
    const p = row.profile as Record<string, unknown>;
    const pick = (k: string) =>
      typeof p[k] === 'string' && (p[k] as string).trim().length > 0
        ? (p[k] as string).trim()
        : null;
    const parts = [
      pick('value') && `What they care about: ${pick('value')}`,
      pick('worry') && `What is on their mind: ${pick('worry')}`,
      pick('rhythm') && `Their rhythm: ${pick('rhythm')}`,
    ].filter(Boolean) as string[];
    if (parts.length === 0) return null;
    return clamp(parts.join('. '), MAX_FRAMEWORK_CHARS);
  }

  return null;
}

/**
 * Assemble a family's AI context from their own real data. Resilient: every
 * read is wrapped so a missing table or a slow query degrades gracefully rather
 * than breaking the AI reply.
 */
export async function buildFamilyContext(
  supabase: SupabaseLike,
  familyId: string | null | undefined
): Promise<{ context: FamilyContext | null; text: string }> {
  if (!familyId) return { context: null, text: '' };

  const empty: FamilyContext = {
    familyId,
    county: null,
    approach: null,
    doorway: null,
    framework: null,
    children: [],
    recentActivities: [],
    recentCategories: [],
    favourites: [],
    memory: [],
    memorySummary: null,
  };

  const [familyRes, frameworkRes, childrenRes, logsRes, favouritesRes, memoryRes] =
    await Promise.allSettled([
      supabase
        .from('families')
        .select('county, approach, doorway')
        .eq('id', familyId)
        .maybeSingle(),
      supabase
        .from('family_frameworks')
        .select('rendered_markdown, profile')
        .eq('family_id', familyId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('children')
        .select('name, date_of_birth, interests, school_status')
        .eq('family_id', familyId),
      supabase
        .from('activity_logs')
        .select('date, notes, activities(title, category)')
        .eq('family_id', familyId)
        .order('date', { ascending: false })
        .limit(MAX_RECENT_ACTIVITIES),
      supabase
        .from('activity_favourites')
        .select('activities(title)')
        .eq('family_id', familyId)
        .limit(MAX_FAVOURITES),
      supabase
        .from('family_ai_memory')
        .select('notes, summary')
        .eq('family_id', familyId)
        .maybeSingle(),
    ]);

  const ctx: FamilyContext = { ...empty };

  // Family basics
  if (familyRes.status === 'fulfilled' && familyRes.value?.data) {
    const f = familyRes.value.data;
    ctx.county = f.county ?? null;
    ctx.approach = f.approach ?? null;
    ctx.doorway = f.doorway ?? null;
  }

  // Framework
  if (frameworkRes.status === 'fulfilled') {
    ctx.framework = summariseFramework(frameworkRes.value?.data ?? null);
  }

  // Children
  if (childrenRes.status === 'fulfilled' && Array.isArray(childrenRes.value?.data)) {
    ctx.children = childrenRes.value.data.map((c: any) => ({
      name: c.name,
      age: ageFromDob(c.date_of_birth),
      interests: Array.isArray(c.interests) ? c.interests.slice(0, 5) : [],
      schoolStatus: c.school_status ?? 'mainstream',
    }));
  }

  // Recent activity logs (what they've actually done lately)
  if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value?.data)) {
    const categories = new Set<string>();
    for (const log of logsRes.value.data) {
      const act = Array.isArray(log.activities) ? log.activities[0] : log.activities;
      if (act?.title) ctx.recentActivities.push(act.title);
      if (act?.category) categories.add(act.category);
    }
    ctx.recentCategories = [...categories];
  }

  // Favourites
  if (favouritesRes.status === 'fulfilled' && Array.isArray(favouritesRes.value?.data)) {
    for (const fav of favouritesRes.value.data) {
      const act = Array.isArray(fav.activities) ? fav.activities[0] : fav.activities;
      if (act?.title) ctx.favourites.push(act.title);
    }
  }

  // Accumulated AI memory
  if (memoryRes.status === 'fulfilled' && memoryRes.value?.data) {
    const m = memoryRes.value.data;
    if (Array.isArray(m.notes)) {
      ctx.memory = m.notes
        .map((n: any) => (typeof n === 'string' ? n : n?.note))
        .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
        .slice(-MAX_MEMORY_NOTES);
    }
    ctx.memorySummary = typeof m.summary === 'string' ? m.summary : null;
  }

  return { context: ctx, text: renderFamilyContextText(ctx) };
}

/**
 * Render a context object into a short, system-prompt-ready text block. Designed
 * to be folded into a system prompt with a "use this naturally, do not read it
 * back as a list" instruction. Returns '' when there is nothing worth saying.
 */
export function renderFamilyContextText(ctx: FamilyContext | null): string {
  if (!ctx) return '';

  const lines: string[] = [];

  if (ctx.children.length > 0) {
    const kids = ctx.children
      .map((c) => {
        const age = c.age != null ? `${c.age}` : 'age unknown';
        const interests = c.interests.length ? `, into ${c.interests.join(', ')}` : '';
        const school =
          c.schoolStatus && c.schoolStatus !== 'mainstream'
            ? `, ${c.schoolStatus.replace('_', ' ')}`
            : '';
        return `${c.name} (${age}${interests}${school})`;
      })
      .join('; ');
    lines.push(`Children: ${kids}.`);
  }

  if (ctx.county) lines.push(`They live in ${ctx.county}.`);
  if (ctx.approach) lines.push(`Their learning approach leans ${ctx.approach.replace('_', ' ')}.`);

  if (ctx.framework) lines.push(`Their family framework, in their own words: ${ctx.framework}`);

  if (ctx.recentActivities.length > 0) {
    lines.push(`Lately they have done: ${ctx.recentActivities.slice(0, MAX_RECENT_ACTIVITIES).join(', ')}.`);
  }
  if (ctx.recentCategories.length > 0) {
    lines.push(`Recent areas: ${ctx.recentCategories.join(', ')}.`);
  }
  if (ctx.favourites.length > 0) {
    lines.push(`Saved favourites: ${ctx.favourites.join(', ')}.`);
  }

  if (ctx.memorySummary) lines.push(`What you remember about them: ${ctx.memorySummary}`);
  if (ctx.memory.length > 0) {
    lines.push(`Things they have asked about before: ${ctx.memory.join('; ')}.`);
  }

  return lines.join('\n');
}

/**
 * Append a short note to a family's accumulated AI memory, so the assistant
 * learns this family over time. Uses the service-role (admin) client so it
 * always writes regardless of the calling context, and never throws: a failed
 * memory write must never break the request that triggered it.
 *
 * The note is kept short and the list capped, so the memory stays a light,
 * useful jotting rather than a transcript.
 */
export async function recordAiMemory(
  familyId: string | null | undefined,
  note: string | null | undefined
): Promise<void> {
  if (!familyId || !note || !note.trim()) return;

  const trimmed = clamp(note, MAX_NOTE_CHARS);

  try {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from('family_ai_memory')
      .select('notes')
      .eq('family_id', familyId)
      .maybeSingle();

    const prior: { at: string; note: string }[] = Array.isArray(existing?.notes)
      ? (existing!.notes as any[])
          .map((n) =>
            typeof n === 'string'
              ? { at: '', note: n }
              : n && typeof n.note === 'string'
                ? { at: typeof n.at === 'string' ? n.at : '', note: n.note }
                : null
          )
          .filter((n): n is { at: string; note: string } => n !== null)
      : [];

    const next = [...prior, { at: new Date().toISOString(), note: trimmed }].slice(
      -MAX_MEMORY_NOTES
    );

    await admin
      .from('family_ai_memory')
      .upsert(
        { family_id: familyId, notes: next, updated_at: new Date().toISOString() },
        { onConflict: 'family_id' }
      );
  } catch (err) {
    // Memory is a nice-to-have; never let it break the reply it came from.
    console.error('recordAiMemory failed (non-fatal):', err);
  }
}
