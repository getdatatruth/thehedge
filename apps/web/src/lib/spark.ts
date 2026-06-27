import type { SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildFamilyContext, recordAiMemory } from '@/lib/family-context';
import { getAistearThemes, getCurriculumAreas } from '@/lib/curriculum-mapping';

// ─── Spark: the shared bespoke-activity generator ────────────────────────────
// Used by POST /api/v1/spark (the Today "Follow a spark" flow) and by Ask Hedge
// (when a parent asks the chat to build them an activity). Both produce the same
// curriculum-grounded, family-private activity, so the logic lives here once.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const SPARK_CATEGORIES = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
const LOCATIONS = ['indoor', 'outdoor', 'both', 'car', 'anywhere'];
const ENERGY = ['calm', 'moderate', 'active'];
const MESS = ['none', 'low', 'medium', 'high'];

// Which curriculum stages to offer for a given age. Overlaps on purpose so a
// 5-6 year old draws on both Aistear and the junior primary outcomes.
function stagesForAge(age: number | null): string[] {
  const a = age ?? 6;
  const stages: string[] = [];
  if (a <= 6) stages.push('early_childhood');
  if (a >= 5 && a <= 8) stages.push('primary_junior');
  if (a >= 8) stages.push('primary_senior');
  return stages.length ? stages : ['primary_junior'];
}

export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age < 0 ? 0 : age;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

const SYSTEM_PROMPT = `You are The Hedge, a warm, calm learning companion for Irish families, inspired by the hedge schools. A parent has told you, in the moment, what their child is curious about right now. Your job is to turn that spark into ONE lovely, doable activity that follows the child, and to quietly tie it back to the curriculum so it genuinely counts.

Principles:
- Child-led first. Honour exactly what the child is curious about. Never redirect them to something "more educational".
- Age-appropriate by default. The activity, its steps, language and expectations MUST be developmentally right for this child's exact age. A 4 year old and a 9 year old curious about the same thing get very different activities. Do NOT pitch above or below their age. The ONE exception: if the parent's own words clearly say the child is ahead, advanced, or keen to go beyond their years on this, you may gently stretch it (it is all child-led). Otherwise stay squarely at their age.
- Screen-free, using only ordinary household materials nothing they would need to buy.
- Calm and unhurried. Learning that feels like a breath, not a battle. No pressure, no targets, no scores.
- Warm southern Irish-English ("lovely", "have a go", "no bother"). NEVER use the word "grand" or the word "wee". No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.
- Curriculum is the underpinning, not the point. From the outcomes provided, choose ONLY the ones this activity genuinely touches (usually 2 to 4). Do not stretch. These make it real evidence for a Tusla / AEARS portfolio.
- Be honest about AEARS: it sets no minimum hours and no attendance bar. Never invent thresholds.

Return ONLY strict JSON (no markdown fences) matching this shape:
{
  "title": "short, warm activity name",
  "description": "1-2 inviting sentences a parent reads at a glance",
  "category": one of ${JSON.stringify(SPARK_CATEGORIES)},
  "location": one of ${JSON.stringify(LOCATIONS)},
  "energyLevel": one of ${JSON.stringify(ENERGY)},
  "messLevel": one of ${JSON.stringify(MESS)},
  "ageMin": integer, "ageMax": integer (a tight band centred on the child's actual age, e.g. age 5 -> 4 to 6; widen only if the parent said the child is working beyond their years),
  "durationMinutes": integer 10-60,
  "materials": [{"name": "household item", "household_common": true}],
  "instructions": {"steps": ["3-6 clear, gentle steps"], "variations": ["1-2 ways to stretch or simplify"], "tips": ["1-2 calm tips"]},
  "parentGuide": {
    "knowledge": [{"topic": "a thing the parent can know", "content": "a sentence or two so they can follow the child's questions"}],
    "conversation_starters": ["2-3 open questions to wonder aloud together"],
    "watch_for": ["2-3 signs that real learning is happening"]
  },
  "learningOutcomes": ["2-4 plain-language things the child is practising"],
  "outcomeIds": ["the id values of the curriculum outcomes this genuinely touches, chosen from the list provided"],
  "curriculumRationale": "2-3 warm sentences, parent voice, naming how this ties to the curriculum and what it quietly evidences for their portfolio. No false promises, no invented Tusla rules."
}`;

// A parent asking to BUILD an activity (vs just chatting / asking for ideas).
// Kept deliberately specific so ordinary questions ("what activity suits a rainy
// day?") still get the normal conversational / suggestions reply.
export const BUILD_INTENT = /\b(build|make|create|design|generate|put together|come up with|set up|give me|cook up|spark)\b[\s\S]{0,60}\b(activity|activities|lesson|project|something to do)\b/i;

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pick the child a build request is about: the one named in the text, else the
// first child. Returns null only if there are no children.
export function pickChildFromText<T extends { name: string }>(children: T[], text: string): T | null {
  return children.find((c) => new RegExp(`\\b${escapeRegExp(c.name)}\\b`, 'i').test(text)) || children[0] || null;
}

export interface SparkChild {
  id: string;
  name: string;
  date_of_birth: string;
  interests: string[] | null;
  school_status?: string;
}

export interface SparkActivityResult {
  id: string;
  slug: string;
  title: string;
  description: string;
  childId: string;
  childName: string;
  outcomeCount: number;
}

// Generate, validate, and persist one bespoke activity. Returns null on any
// failure (the caller decides how to surface it). Does NOT do auth or rate
// limiting - the caller owns those and the usage ledger.
export async function generateSparkActivity(
  supabase: SupabaseClient,
  opts: { familyId: string; child: SparkChild; prompt: string; lean?: string | null },
): Promise<SparkActivityResult | null> {
  const { familyId, child, prompt } = opts;
  const leanCategory = opts.lean && SPARK_CATEGORIES.includes(opts.lean) ? opts.lean : null;
  const age = ageFromDob(child.date_of_birth);

  const { data: outcomes } = await supabase
    .from('curriculum_outcomes')
    .select('id, curriculum_area, strand, outcome_code, outcome_text')
    .eq('country', 'IE')
    .in('stage', stagesForAge(age));
  const outcomeList = (outcomes || [])
    .map((o) => `${o.id} | ${o.curriculum_area} > ${o.strand} | ${o.outcome_code}: ${o.outcome_text}`)
    .join('\n');

  const { text: familyContextText } = await buildFamilyContext(supabase, familyId);

  const userMessage = [
    familyContextText ? `What you know about this family:\n${familyContextText}` : '',
    `The child this is for: ${child.name}, exactly ${age ?? 'unknown'} years old. Pitch the whole activity for a ${age ?? 'young'}-year-old unless the parent's words below say they are working beyond their years. Interests: ${(child.interests || []).join(', ') || 'still discovering'}.`,
    `What they are curious about right now (the parent's own words): "${prompt.trim()}"`,
    leanCategory ? `Gentle balance note: this area (${leanCategory}) has been quiet for this family lately. If it fits the child's curiosity naturally, lean the activity that way to help round things out. Never force it.` : '',
    `Curriculum outcomes you may choose from (id | area > strand | code: text). Pick ONLY the ids this activity genuinely touches:\n${outcomeList || '(none available for this age)'}`,
  ].filter(Boolean).join('\n\n');

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });
  const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let gen: Record<string, unknown>;
  try {
    gen = JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }

  const pick = (v: unknown, allowed: string[], dflt: string) =>
    typeof v === 'string' && allowed.includes(v) ? v : dflt;
  const title = String(gen.title || '').trim() || `Following ${child.name}'s curiosity`;
  const category = pick(gen.category, SPARK_CATEGORIES, 'science');
  const validIds = new Set((outcomes || []).map((o) => o.id));
  const chosenIds = Array.isArray(gen.outcomeIds)
    ? (gen.outcomeIds as unknown[]).filter((id) => typeof id === 'string' && validIds.has(id)) as string[]
    : [];
  const chosen = (outcomes || []).filter((o) => chosenIds.includes(o.id));
  let aistearThemes = [...new Set(chosen.filter((o) => o.curriculum_area.startsWith('Aistear')).map((o) => o.curriculum_area.replace('Aistear:', '').trim()))];
  let nccaAreas = [...new Set(chosen.filter((o) => !o.curriculum_area.startsWith('Aistear')).map((o) => o.curriculum_area))];

  const childAge = age ?? 6;
  if (aistearThemes.length === 0) aistearThemes = getAistearThemes(category) as string[];
  if (nccaAreas.length === 0 && childAge >= 5) nccaAreas = getCurriculumAreas(category) as string[];

  const admin = createAdminClient();
  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = `${slugify(title) || 'spark'}-${suffix}`;
  const description = String(gen.description || '').trim() || `A little something for ${child.name}.`;

  const insertRow = {
    title,
    slug,
    description,
    instructions: gen.instructions && typeof gen.instructions === 'object' ? gen.instructions : { steps: [] },
    parent_guide: gen.parentGuide && typeof gen.parentGuide === 'object' ? gen.parentGuide : null,
    category,
    age_min: typeof gen.ageMin === 'number' ? Math.max(0, Math.min(14, gen.ageMin)) : Math.max(0, (age ?? 5) - 1),
    age_max: typeof gen.ageMax === 'number' ? Math.max(0, Math.min(14, gen.ageMax)) : Math.min(14, (age ?? 5) + 1),
    duration_minutes: typeof gen.durationMinutes === 'number' ? Math.max(5, Math.min(120, gen.durationMinutes)) : 25,
    location: pick(gen.location, LOCATIONS, 'anywhere'),
    materials: Array.isArray(gen.materials) ? gen.materials : [],
    learning_outcomes: Array.isArray(gen.learningOutcomes) ? gen.learningOutcomes : [],
    curriculum_tags: {
      spark: true,
      outcome_ids: chosenIds,
      outcome_codes: chosen.map((o) => o.outcome_code),
      aistear_themes: aistearThemes,
      ncca_areas: nccaAreas,
      rationale: String(gen.curriculumRationale || '').trim(),
    },
    energy_level: pick(gen.energyLevel, ENERGY, 'moderate'),
    mess_level: pick(gen.messLevel, MESS, 'low'),
    screen_free: true,
    premium: false,
    created_by: 'ai-spark',
    published: true,
    family_id: familyId,
    child_id: child.id,
    source_prompt: prompt.trim(),
  };

  const { data: created, error: insertErr } = await admin
    .from('activities')
    .insert(insertRow)
    .select('id, slug, title, description')
    .single();
  if (insertErr || !created) {
    console.error('spark insert error:', insertErr);
    return null;
  }

  void recordAiMemory(familyId, `${child.name} was curious about: ${prompt.trim()}`);

  return {
    id: created.id,
    slug: created.slug,
    title: created.title,
    description: created.description,
    childId: child.id,
    childName: child.name,
    outcomeCount: chosenIds.length,
  };
}
