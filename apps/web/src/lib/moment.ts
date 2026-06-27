import type { SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { ageFromDob, stagesForAge } from '@/lib/spark';

// ─── Log a moment: analyse what a family already did ─────────────────────────
// The inverse of Spark. A parent describes (in their own words, by text or
// dictation) something their child already did. We read it back honestly against
// the Irish curriculum and hand them a tidy, editable portfolio draft.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MomentChild {
  id: string;
  name: string;
  date_of_birth: string;
}

export interface MomentDraft {
  title: string;
  summary: string;
  areas: string[];          // human area names (Aistear: X, or NCCA area)
  outcomeIds: string[];     // real curriculum_outcomes ids genuinely evidenced
  outcomeCodes: string[];
  rationale: string;        // warm, parent-voice: what this evidenced
}

const SYSTEM = `You are The Hedge, a warm, calm companion for Irish home-educating families. A parent has described, in their own words, something their child or children already did. Your job is to read it back honestly and map it to the Irish curriculum so it becomes good portfolio evidence, never to inflate it.

Rules:
- Be honest and specific. Only claim what the description genuinely shows. Do not stretch or invent learning that is not there.
- Warm southern Irish-English. NEVER use the word "grand" or "wee". No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.
- From the curriculum outcomes provided, choose ONLY the ids this genuinely evidences (usually 1 to 4). If it evidences none well, return an empty list rather than reaching.
- Be honest about Tusla/AEARS: no minimum hours, no invented thresholds.

Return ONLY strict JSON (no fences):
{
  "title": "a short, warm title for this portfolio entry",
  "summary": "1-2 tidy sentences describing what they did, in the parent's register",
  "outcomeIds": ["ids from the provided list that this genuinely evidences"],
  "rationale": "2-3 warm sentences naming what this quietly evidenced across the curriculum, honest and specific"
}`;

export async function analyseMoment(
  supabase: SupabaseClient,
  opts: { children: MomentChild[]; description: string },
): Promise<MomentDraft | null> {
  const { children, description } = opts;
  const ages = children.map((c) => ageFromDob(c.date_of_birth));
  const stages = [...new Set(ages.flatMap((a) => stagesForAge(a)))];

  const { data: outcomes } = await supabase
    .from('curriculum_outcomes')
    .select('id, curriculum_area, strand, outcome_code, outcome_text')
    .eq('country', 'IE')
    .in('stage', stages.length ? stages : ['primary_junior']);

  const outcomeList = (outcomes || [])
    .map((o) => `${o.id} | ${o.curriculum_area} > ${o.strand} | ${o.outcome_code}: ${o.outcome_text}`)
    .join('\n');

  const who = children.map((c) => `${c.name} (age ${ageFromDob(c.date_of_birth) ?? '?'})`).join(', ');
  const userMessage = [
    `The child(ren): ${who || 'a child'}.`,
    `What the parent said they did (their own words): "${description.trim()}"`,
    `Curriculum outcomes you may choose from (id | area > strand | code: text). Pick ONLY the ids this genuinely evidences:\n${outcomeList || '(none available)'}`,
  ].join('\n\n');

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 900,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });
  const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let gen: Record<string, unknown>;
  try { gen = JSON.parse(m[0]); } catch { return null; }

  const validIds = new Set((outcomes || []).map((o) => o.id));
  const outcomeIds = Array.isArray(gen.outcomeIds)
    ? (gen.outcomeIds as unknown[]).filter((id) => typeof id === 'string' && validIds.has(id)) as string[]
    : [];
  const chosen = (outcomes || []).filter((o) => outcomeIds.includes(o.id));
  const areas = [...new Set(chosen.map((o) => o.curriculum_area))];

  return {
    title: String(gen.title || '').trim() || 'A learning moment',
    summary: String(gen.summary || '').trim() || description.trim().slice(0, 200),
    areas,
    outcomeIds,
    outcomeCodes: chosen.map((o) => o.outcome_code),
    rationale: String(gen.rationale || '').trim(),
  };
}
