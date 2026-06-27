import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { createApiClient } from '@/lib/supabase/api-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { buildFamilyContext, recordAiMemory } from '@/lib/family-context';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Spark is the one premium-ish move families make often, so it gets its own,
// more generous ledger than the broad chat/suggest pool.
const RATE_LIMITS: Record<string, number> = { free: 3, family: 40, educator: 999 };

const CATEGORIES = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
const LOCATIONS = ['indoor', 'outdoor', 'both', 'car', 'anywhere'];
const ENERGY = ['calm', 'moderate', 'active'];
const MESS = ['none', 'low', 'medium', 'high'];

// Which curriculum stages to offer Claude for a given age. Overlaps on purpose
// so a 5-6 year old draws on both Aistear and the junior primary outcomes.
function stagesForAge(age: number | null): string[] {
  const a = age ?? 6;
  const stages: string[] = [];
  if (a <= 6) stages.push('early_childhood');
  if (a >= 5 && a <= 8) stages.push('primary_junior');
  if (a >= 8) stages.push('primary_senior');
  return stages.length ? stages : ['primary_junior'];
}

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

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

const SYSTEM_PROMPT = `You are The Hedge, a warm, calm learning companion for Irish families, inspired by the hedge schools. A parent has told you, in the moment, what their child is curious about right now. Your job is to turn that spark into ONE lovely, doable activity that follows the child, and to quietly tie it back to the curriculum so it genuinely counts.

Principles:
- Child-led first. Honour exactly what the child is curious about. Never redirect them to something "more educational".
- Screen-free, using only ordinary household materials nothing they would need to buy.
- Calm and unhurried. Learning that feels like a breath, not a battle. No pressure, no targets, no scores.
- Warm southern Irish-English ("lovely", "have a go", "no bother"). NEVER use the word "grand" or the word "wee". No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.
- Curriculum is the underpinning, not the point. From the outcomes provided, choose ONLY the ones this activity genuinely touches (usually 2 to 4). Do not stretch. These make it real evidence for a Tusla / AEARS portfolio.
- Be honest about AEARS: it sets no minimum hours and no attendance bar. Never invent thresholds.

Return ONLY strict JSON (no markdown fences) matching this shape:
{
  "title": "short, warm activity name",
  "description": "1-2 inviting sentences a parent reads at a glance",
  "category": one of ${JSON.stringify(CATEGORIES)},
  "location": one of ${JSON.stringify(LOCATIONS)},
  "energyLevel": one of ${JSON.stringify(ENERGY)},
  "messLevel": one of ${JSON.stringify(MESS)},
  "ageMin": integer, "ageMax": integer (a sensible band around the child's age),
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

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    const body = await request.json();
    const { childId, prompt, lean } = body as { childId?: string; prompt?: string; lean?: string };
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return apiError('Tell me what they are curious about.', 400);
    }
    // A balance nudge can ask for a gentle lean toward a quiet area. It is a
    // preference, never an override: the child's curiosity still leads.
    const leanCategory = typeof lean === 'string' && CATEGORIES.includes(lean) ? lean : null;

    // Family + tier
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(subscription_tier)')
      .eq('id', user.id)
      .single();
    const family = (Array.isArray(profile?.families) ? profile.families[0] : profile?.families) as { subscription_tier: string } | null;
    const tier = family?.subscription_tier || 'free';
    const familyId = profile?.family_id;
    if (!familyId) return apiError('Finish setting up your family first.', 400);

    // Weekly rate limit (Monday-start week), against the ai_usage ledger.
    const weeklyLimit = RATE_LIMITS[tier] || 3;
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + (day === 0 ? -6 : 1));
    const { count } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('feature', 'ai_spark')
      .gte('created_at', weekStart.toISOString());
    if ((count || 0) >= weeklyLimit) {
      return apiError(`You have followed all ${weeklyLimit} of this week's sparks on the ${tier} plan. Upgrade to follow more.`, 402);
    }

    // The child this spark is for (their own family's child only).
    let child: { id: string; name: string; date_of_birth: string; interests: string[]; school_status: string } | null = null;
    if (childId) {
      const { data: c } = await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status')
        .eq('id', childId)
        .eq('family_id', familyId)
        .single();
      child = c;
    }
    if (!child) {
      const { data: first } = await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status')
        .eq('family_id', familyId)
        .limit(1)
        .single();
      child = first;
    }
    if (!child) return apiError('Add a child first so I can shape this for them.', 400);

    const age = ageFromDob(child.date_of_birth);

    // The curriculum outcomes Claude may choose from, scoped to the child's stage.
    const { data: outcomes } = await supabase
      .from('curriculum_outcomes')
      .select('id, curriculum_area, strand, outcome_code, outcome_text')
      .eq('country', 'IE')
      .in('stage', stagesForAge(age));
    const outcomeList = (outcomes || []).map(
      (o) => `${o.id} | ${o.curriculum_area} > ${o.strand} | ${o.outcome_code}: ${o.outcome_text}`
    ).join('\n');

    const { text: familyContextText } = await buildFamilyContext(supabase, familyId);

    const userMessage = [
      familyContextText ? `What you know about this family:\n${familyContextText}` : '',
      `The child this is for: ${child.name}, age ${age ?? 'unknown'}, interests: ${(child.interests || []).join(', ') || 'still discovering'}.`,
      `What they are curious about right now (the parent's own words): "${prompt.trim()}"`,
      leanCategory ? `Gentle balance note: this area (${leanCategory}) has been quiet for this family lately. If it fits the child's curiosity naturally, lean the activity that way to help round things out. Never force it against what they are curious about.` : '',
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
    if (!jsonMatch) return apiError('I could not shape that one just now. Have another go in a moment.', 502);

    let gen: Record<string, unknown>;
    try {
      gen = JSON.parse(jsonMatch[0]);
    } catch {
      return apiError('I could not shape that one just now. Have another go in a moment.', 502);
    }

    // Coerce + validate against the enums, falling back to safe defaults.
    const pick = (v: unknown, allowed: string[], dflt: string) =>
      typeof v === 'string' && allowed.includes(v) ? v : dflt;
    const title = String(gen.title || '').trim() || `Following ${child.name}'s curiosity`;
    const validIds = new Set((outcomes || []).map((o) => o.id));
    const chosenIds = Array.isArray(gen.outcomeIds) ? (gen.outcomeIds as unknown[]).filter((id) => typeof id === 'string' && validIds.has(id)) as string[] : [];
    const chosen = (outcomes || []).filter((o) => chosenIds.includes(o.id));
    const aistearThemes = [...new Set(chosen.filter((o) => o.curriculum_area.startsWith('Aistear')).map((o) => o.curriculum_area.replace('Aistear:', '').trim()))];
    const nccaAreas = [...new Set(chosen.filter((o) => !o.curriculum_area.startsWith('Aistear')).map((o) => o.curriculum_area))];

    const admin = createAdminClient();
    // Unique slug (the index is global). Spark slugs get a short random suffix.
    const suffix = Math.random().toString(36).slice(2, 7);
    const slug = `${slugify(title) || 'spark'}-${suffix}`;

    const insertRow = {
      title,
      slug,
      description: String(gen.description || '').trim() || `A little something for ${child.name}.`,
      instructions: gen.instructions && typeof gen.instructions === 'object' ? gen.instructions : { steps: [] },
      parent_guide: gen.parentGuide && typeof gen.parentGuide === 'object' ? gen.parentGuide : null,
      category: pick(gen.category, CATEGORIES, 'science'),
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
      .select('id, slug, title')
      .single();
    if (insertErr || !created) {
      console.error('spark insert error:', insertErr);
      return apiError('I made the activity but could not save it. Have another go in a moment.', 500);
    }

    await supabase.from('ai_usage').insert({ family_id: familyId, feature: 'ai_spark' });
    void recordAiMemory(familyId, `${child.name} was curious about: ${prompt.trim()}`);

    return apiSuccess({
      id: created.id,
      slug: created.slug,
      title: created.title,
      childId: child.id,
      childName: child.name,
      outcomeCount: chosenIds.length,
      tier,
      weeklyLimit,
      used: (count || 0) + 1,
    });
  } catch (err) {
    console.error('spark error:', err);
    return apiError('Something went sideways shaping that. Have another go in a moment.', 500);
  }
}
