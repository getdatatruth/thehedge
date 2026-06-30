import type { SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { ageFromDob } from '@/lib/spark';
import { getFramework, stagesForAge as stagesForFramework, canonicalForAreas, momentSystemPrompt } from '@/lib/territory';

// ─── Log a moment: analyse what a family already did ─────────────────────────
// The inverse of Spark. A parent describes (in their own words, by text or
// dictation) something their child already did. We read it back honestly against
// the Irish curriculum and hand them a tidy, editable portfolio draft.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MomentChild {
  id: string;
  name: string;
  date_of_birth: string;
  territory?: string | null;
}

export interface MomentDraft {
  title: string;
  summary: string;
  areas: string[];          // human area names (Aistear: X, or NCCA area)
  outcomeIds: string[];     // real curriculum_outcomes ids genuinely evidenced
  outcomeCodes: string[];
  canonicalDimensions: string[]; // territory-neutral dimensions this evidences
  rationale: string;        // warm, parent-voice: what this evidenced
}

export async function analyseMoment(
  supabase: SupabaseClient,
  opts: { children: MomentChild[]; description: string },
): Promise<MomentDraft | null> {
  const { children, description } = opts;
  // Resolve the family's territory from the children (one family, one territory
  // today; defaults to IE). Query that framework's outcomes for their stages.
  const framework = getFramework(children[0]?.territory);
  const ages = children.map((c) => ageFromDob(c.date_of_birth));
  const stages = [...new Set(ages.flatMap((a) => stagesForFramework(framework, a)))];

  const { data: outcomes } = await supabase
    .from('curriculum_outcomes')
    .select('id, curriculum_area, strand, outcome_code, outcome_text')
    .eq('country', framework.outcomesCountry)
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
    system: momentSystemPrompt(framework),
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
    canonicalDimensions: canonicalForAreas(framework, areas),
    rationale: String(gen.rationale || '').trim(),
  };
}
