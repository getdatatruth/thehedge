/**
 * Generate 300 high-quality family learning activities using Claude AI
 * and seed them into the Supabase database.
 *
 * Run from apps/web/:
 *   NODE_PATH=./node_modules npx tsx ../../scripts/generate-activities.ts
 *
 * Requires ANTHROPIC_API_KEY and SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const webPath = new URL('../apps/web/', import.meta.url).pathname;
const Anthropic = require(webPath + 'node_modules/@anthropic-ai/sdk').default;
const { createClient } = require(webPath + 'node_modules/@supabase/supabase-js');
const dotenv = require(webPath + 'node_modules/dotenv');

dotenv.config({ path: webPath + '.env.local' });

// ─── Validate environment ───────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Types ──────────────────────────────────────────────

interface GeneratedActivity {
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[]; variations?: string[]; tips?: string[] };
  materials: { name: string; household_common: boolean }[];
  learning_outcomes: string[];
  parent_guide: {
    knowledge: { topic: string; content: string }[];
    conversation_starters: string[];
    watch_for: string[];
  };
  curriculum_tags: {
    outcome_codes: string[];
    aistear_themes: string[];
    ncca_areas: string[];
    educator_quality: 'excellent' | 'good';
    quality_notes: string;
  };
  age_min: number;
  age_max: number;
  duration_minutes: number;
  location: 'indoor' | 'outdoor' | 'both';
  energy_level: 'calm' | 'moderate' | 'active';
  mess_level: 'none' | 'low' | 'medium' | 'high';
  weather: string[];
  season: string[];
}

// ─── Constants ──────────────────────────────────────────

const CATEGORIES = [
  'nature', 'science', 'art', 'maths', 'literacy',
  'movement', 'kitchen', 'life_skills', 'calm', 'social',
] as const;

type Category = typeof CATEGORIES[number];

const AGE_GROUPS = [
  { label: 'toddler (2-4)', min: 2, max: 4, count: 8 },
  { label: 'preschool (3-6)', min: 3, max: 6, count: 8 },
  { label: 'junior primary (5-8)', min: 5, max: 8, count: 7 },
  { label: 'senior primary (7-12)', min: 7, max: 12, count: 7 },
];

const CATEGORY_HINTS: Record<Category, string> = {
  nature: 'Outdoor exploration, wildlife observation, gardening, nature journalling, weather studies, habitat investigation. Irish wildlife: hedgehogs, foxes, red squirrels, puffins, badgers, pine martens. Irish plants: shamrocks, hawthorn, bluebells, oak trees, wild garlic, fuchsia hedgerows. Irish landscapes: boglands, coastline, rivers, limestone karst.',
  science: 'Simple experiments, STEM challenges, observation and hypothesis, kitchen science, physics concepts, biology basics. Reference Irish weather patterns, local geology, bog ecology, coastal science.',
  art: 'Drawing, painting, sculpture, collage, printmaking, textile arts, nature art, crafts. Reference Irish art traditions: Celtic knots, Ogham, illuminated manuscripts, Sheela-na-gigs, round towers, high crosses.',
  maths: 'Counting, measuring, patterns, shapes, sorting, estimation, early algebra concepts, spatial reasoning. Use Irish contexts: counting sheep, measuring ingredients for soda bread, patterns in Celtic designs.',
  literacy: 'Storytelling, phonics, writing, poetry, reading activities, word games, drama. Integrate simple Irish language (cupla focal): colours (dearg, glas, ban), animals (madra, cat, capall), greetings (Dia duit, slan). Reference Irish myths: Cu Chulainn, Children of Lir, Fionn Mac Cumhaill.',
  movement: 'Gross motor skills, dance, sports, yoga, obstacle courses, balance activities. Reference GAA skills (solo, hand-pass, puck), Irish dancing (reels, jigs), playground games.',
  kitchen: 'Cooking, baking, food preparation, taste exploration, food science. Irish foods: soda bread, colcannon, boxty, apple tart, stew, porridge, scones, brown bread.',
  life_skills: 'Practical skills: tying laces, telling time, money skills, tidying, pet care, tool use, sewing. Irish contexts: euro coins, farming skills, weather-appropriate dressing.',
  calm: 'Mindfulness, relaxation, sensory play, quiet activities, breathing exercises, gentle crafts. Nature-based calm: listening to rain, watching clouds, feeling moss, walking in woods.',
  social: 'Cooperation games, sharing activities, emotion recognition, role play, team challenges, community connection. Irish social traditions: ceili, meitheal (community help), visiting neighbours, Oiche Shamhna.',
};

// ─── Prompt ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert early childhood and primary educator creating activities for The Hedge, an Irish family learning platform inspired by Ireland's hedge schools. You generate high-quality, practical, screen-free family learning activities.

Rules:
- Write in Irish English (e.g. "colour" not "color", "maths" not "math", "favourite" not "favorite")
- Activities must be genuinely doable with common household items
- Be specific and practical - real steps a parent can follow
- Never use em dashes - use regular dashes instead
- Each activity must be unique and distinct from others in the batch
- Descriptions should be 2-3 engaging sentences
- Instructions should have 5-7 detailed, actionable steps
- Learning outcomes should be specific and measurable (3-5 per activity)
- Materials should be items most Irish households would have
- Parent guide knowledge should give parents real, factual content they need to teach confidently
- Curriculum tags should reference real Irish curriculum frameworks (Aistear, NCCA Primary Curriculum)
- Slugs must be lowercase, hyphenated, URL-safe, and unique

Aistear themes: Well-being, Identity & Belonging, Communicating, Exploring & Thinking
NCCA areas: Language, Mathematics, SESE (Science, History, Geography), Arts Education, Physical Education, SPHE

Return ONLY a valid JSON array of activity objects. No markdown, no explanation - just the JSON array.`;

function buildBatchPrompt(
  category: Category,
  ageGroup: { label: string; min: number; max: number },
  batchSize: number,
  batchIndex: number,
  existingSlugs: string[],
): string {
  const hints = CATEGORY_HINTS[category];
  const recentSlugs = existingSlugs.length > 0
    ? `\n\nAlready generated slugs (do NOT duplicate these): ${existingSlugs.join(', ')}`
    : '';

  return `Generate exactly ${batchSize} unique "${category}" activities for children aged ${ageGroup.min}-${ageGroup.max} (${ageGroup.label}).

Category guidance: ${hints}

Irish cultural context to weave in naturally where relevant:
- Irish wildlife: hedgehogs, foxes, red squirrels, puffins, badgers
- Irish plants: shamrocks, hawthorn, bluebells, oak trees, wild garlic
- Irish culture: GAA, Irish dancing, Sean-nos singing, Oiche Shamhna, St Brigid's crosses
- Irish language: simple phrases and vocabulary (cupla focal)
- Irish geography: rivers (Shannon, Liffey), mountains (Croagh Patrick, Carrauntoohil), coastline
- Irish weather: lots of rain-friendly activities, wind, changeable conditions
${recentSlugs}

This is batch ${batchIndex + 1} for this category. Make each activity creative and distinct.

Return a JSON array of ${batchSize} objects, each with this exact structure:
{
  "title": "Engaging descriptive title",
  "slug": "url-safe-hyphenated-slug",
  "description": "2-3 engaging sentences in Irish English describing the activity.",
  "instructions": {
    "steps": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."],
    "variations": ["Optional variation 1"],
    "tips": ["Optional tip 1"]
  },
  "materials": [
    { "name": "Material name", "household_common": true }
  ],
  "learning_outcomes": ["Specific outcome 1", "Specific outcome 2", "Specific outcome 3"],
  "parent_guide": {
    "knowledge": [
      { "topic": "Topic heading", "content": "2-4 sentences of real knowledge the parent needs to teach this." }
    ],
    "conversation_starters": ["Open-ended question 1", "Open-ended question 2"],
    "watch_for": ["Sign of learning 1", "Sign of engagement 2"]
  },
  "curriculum_tags": {
    "outcome_codes": ["Relevant curriculum outcome codes"],
    "aistear_themes": ["Well-being", "Communicating"],
    "ncca_areas": ["SESE", "Language"],
    "educator_quality": "excellent",
    "quality_notes": ""
  },
  "age_min": ${ageGroup.min},
  "age_max": ${ageGroup.max},
  "duration_minutes": 30,
  "location": "indoor",
  "energy_level": "moderate",
  "mess_level": "low",
  "weather": ["any"],
  "season": ["spring", "summer", "autumn", "winter"]
}

Important:
- duration_minutes should vary realistically (15-60 minutes)
- location should be "indoor", "outdoor", or "both" as appropriate
- energy_level should be "calm", "moderate", or "active"
- mess_level should be "none", "low", "medium", or "high"
- weather should list appropriate conditions from: sunny, cloudy, rainy, windy, cold, mild, any
- season should list appropriate seasons
- parent_guide.knowledge should have 3-5 topics with real factual content
- parent_guide.conversation_starters should have 4-6 items
- parent_guide.watch_for should have 3-4 items
- curriculum_tags.aistear_themes must use: Well-being, Identity & Belonging, Communicating, Exploring & Thinking
- curriculum_tags.ncca_areas must use: Language, Mathematics, SESE, Arts Education, Physical Education, SPHE`;
}

// ─── Generation logic ───────────────────────────────────

async function generateBatch(
  category: Category,
  ageGroup: { label: string; min: number; max: number },
  batchSize: number,
  batchIndex: number,
  existingSlugs: string[],
): Promise<GeneratedActivity[]> {
  const prompt = buildBatchPrompt(category, ageGroup, batchSize, batchIndex, existingSlugs);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in Claude response');
  }

  const activities = JSON.parse(jsonMatch[0]) as GeneratedActivity[];

  if (!Array.isArray(activities) || activities.length === 0) {
    throw new Error('Parsed result is not a non-empty array');
  }

  return activities;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Database operations ────────────────────────────────

async function getExistingSlugs(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('activities')
    .select('slug');

  if (error) {
    console.error('Error fetching existing slugs:', error.message);
    return new Set();
  }

  return new Set((data || []).map((r: { slug: string }) => r.slug));
}

async function upsertActivities(
  activities: GeneratedActivity[],
  category: Category,
  existingSlugs: Set<string>,
): Promise<{ inserted: number; skipped: number; failed: number }> {
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  const rows = activities.map(a => ({
    title: a.title,
    slug: a.slug,
    description: a.description,
    instructions: a.instructions,
    materials: a.materials,
    learning_outcomes: a.learning_outcomes,
    parent_guide: a.parent_guide,
    curriculum_tags: a.curriculum_tags,
    category,
    age_min: a.age_min,
    age_max: a.age_max,
    duration_minutes: a.duration_minutes,
    location: a.location,
    energy_level: a.energy_level,
    mess_level: a.mess_level,
    weather: a.weather,
    season: a.season,
    screen_free: true,
    premium: false,
    published: true,
    created_by: 'ai-generated',
    country_specific: ['IE'],
  }));

  // Filter out activities with slugs that already exist
  const newRows = rows.filter(r => {
    if (existingSlugs.has(r.slug)) {
      console.log(`    Skipping duplicate slug: ${r.slug}`);
      skipped++;
      return false;
    }
    return true;
  });

  if (newRows.length === 0) {
    return { inserted: 0, skipped, failed: 0 };
  }

  // Upsert with slug as conflict key
  const { data, error } = await supabase
    .from('activities')
    .upsert(newRows, { onConflict: 'slug', ignoreDuplicates: true })
    .select('slug');

  if (error) {
    console.error(`    Database error: ${error.message}`);
    failed = newRows.length;
  } else {
    inserted = data?.length ?? newRows.length;
    // Add new slugs to the set
    for (const row of newRows) {
      existingSlugs.add(row.slug);
    }
  }

  return { inserted, skipped, failed };
}

// ─── Main ───────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('The Hedge - AI Activity Generator');
  console.log('Generating 300 activities across 10 categories');
  console.log('='.repeat(60));
  console.log();

  const existingSlugs = await getExistingSlugs();
  console.log(`Found ${existingSlugs.size} existing activities in database\n`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalGenerated = 0;
  let batchErrors = 0;

  const startTime = Date.now();

  for (const category of CATEGORIES) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Category: ${category.toUpperCase()}`);
    console.log(`${'─'.repeat(50)}`);

    const allSlugsForCategory: string[] = [];
    let categoryGenerated = 0;

    for (const ageGroup of AGE_GROUPS) {
      const batchSize = ageGroup.count;
      // We may need to split large batches, but 8 activities per call is fine
      const batchIndex = AGE_GROUPS.indexOf(ageGroup);

      console.log(`\n  [${category}] Age ${ageGroup.min}-${ageGroup.max} (${ageGroup.label}) - generating ${batchSize} activities...`);

      try {
        const activities = await generateBatch(
          category,
          ageGroup,
          batchSize,
          batchIndex,
          allSlugsForCategory,
        );

        console.log(`  Generated ${activities.length} activities from Claude`);
        totalGenerated += activities.length;
        categoryGenerated += activities.length;

        // Validate and fix slugs
        for (const activity of activities) {
          // Ensure slug is URL-safe
          activity.slug = activity.slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          // Ensure slug uniqueness within this generation run
          let baseSlug = activity.slug;
          let suffix = 1;
          while (allSlugsForCategory.includes(activity.slug) || existingSlugs.has(activity.slug)) {
            activity.slug = `${baseSlug}-${suffix}`;
            suffix++;
          }
          allSlugsForCategory.push(activity.slug);

          // Validate required fields
          if (!activity.title || !activity.description || !activity.instructions?.steps?.length) {
            console.warn(`    Warning: Activity "${activity.title || 'untitled'}" has missing fields`);
          }

          // Clamp values to valid ranges
          activity.age_min = Math.max(2, Math.min(12, activity.age_min));
          activity.age_max = Math.max(activity.age_min, Math.min(12, activity.age_max));
          activity.duration_minutes = Math.max(10, Math.min(90, activity.duration_minutes));

          // Validate enum values
          if (!['indoor', 'outdoor', 'both'].includes(activity.location)) {
            activity.location = 'both';
          }
          if (!['calm', 'moderate', 'active'].includes(activity.energy_level)) {
            activity.energy_level = 'moderate';
          }
          if (!['none', 'low', 'medium', 'high'].includes(activity.mess_level)) {
            activity.mess_level = 'low';
          }
        }

        // Insert into database
        const result = await upsertActivities(activities, category, existingSlugs);
        totalInserted += result.inserted;
        totalSkipped += result.skipped;
        totalFailed += result.failed;

        console.log(`  DB result: ${result.inserted} inserted, ${result.skipped} skipped, ${result.failed} failed`);

        // Rate limit delay between API calls
        console.log('  Waiting 1s for rate limiting...');
        await delay(1000);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  BATCH FAILED: ${msg}`);
        batchErrors++;

        // Wait a bit longer after an error in case it was rate limiting
        await delay(3000);
      }
    }

    console.log(`\n  ${category} summary: ${categoryGenerated} generated for this category`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Time elapsed:      ${elapsed}s`);
  console.log(`Total generated:   ${totalGenerated}`);
  console.log(`Total inserted:    ${totalInserted}`);
  console.log(`Total skipped:     ${totalSkipped} (duplicate slugs)`);
  console.log(`Total failed:      ${totalFailed} (DB errors)`);
  console.log(`Batch errors:      ${batchErrors} (Claude API errors)`);
  console.log(`Existing before:   ${existingSlugs.size - totalInserted} activities`);
  console.log(`Total in DB now:   ~${existingSlugs.size} activities`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
