// Curriculum-driven content gap filler
// Generates activities to ensure 52 weeks of unique content per age group
// with balanced curriculum coverage across all 10 categories.
//
// Run: cd apps/web && NODE_PATH=./node_modules npx tsx ../../scripts/fill-content-gaps.ts

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk').default;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Target: 52 activities per category (1/week/year) ────────
// With 10 categories, that's 520 total for full year coverage
const TARGET_PER_CATEGORY = 52;

// Age groups for Irish education system
const AGE_GROUPS = [
  { label: 'toddler', min: 2, max: 4, description: 'Toddlers (2-4 years) - simple, sensory-rich, parent-led activities' },
  { label: 'preschool', min: 3, max: 6, description: 'Preschool/Early Years (3-6) - Aistear framework, play-based learning' },
  { label: 'junior_primary', min: 5, max: 8, description: 'Junior Primary (5-8) - Junior/Senior Infants + 1st/2nd class' },
  { label: 'senior_primary', min: 7, max: 12, description: 'Senior Primary (7-12) - 3rd to 6th class, more independent' },
];

// Category-specific generation prompts for Irish context
const CATEGORY_PROMPTS: Record<string, string> = {
  nature: 'Outdoor exploration, Irish wildlife (hedgehogs, foxes, red squirrels, badgers), native plants (bluebells, primroses, hawthorn, oak), pond dipping, bird watching, bug hunts, rock collecting, weather observation, seasonal nature walks, den building, gardening, foraging (blackberries, elderflower), tree identification, mini-beast safaris, cloud watching, nature journals',
  science: 'Kitchen experiments, volcano baking soda, magnets, floating/sinking, colour mixing, plant growing, shadow tracking, ice melting, magnifying glass investigation, weather stations, simple circuits, water cycle, States of matter, sound experiments, light experiments, lifecycle observation (tadpoles, butterflies), soil investigation',
  art: 'Painting (finger, watercolour, splatter), drawing, collage, printmaking (potato prints, leaf prints), clay/playdough sculpting, weaving, textile art, junk modelling, mask making, natural art (Andy Goldsworthy style), tie-dye, marbling, charcoal drawing, papier-mache, stained glass (tissue paper), puppet making',
  maths: 'Counting games, number lines, sorting/classifying, patterns (bead patterns, clapping patterns), shapes (2D and 3D), measuring (length, weight, capacity), time concepts, money play (using euro coins), graphing, symmetry, estimation, number bonds, dice games, dominoes, tangrams, cooking measurements, map distances',
  literacy: 'Storytelling, phonics games, letter formation, rhyming, reading together, story sequencing, puppet shows, word hunts, sight words, Irish language (greetings, colours, numbers, animals in Irish), poetry, letter writing, comic strips, retelling stories, oral language games, show and tell, news time, book making',
  movement: 'Obstacle courses, yoga for kids, dance (Irish dancing, free dance), ball games, parachute games, relay races, balancing, climbing, swimming prep, GAA skills (hurling/football basics), athletics (running, jumping, throwing), gymnastics basics, orienteering, playground games (tig, stuck in the mud), skipping',
  kitchen: 'Baking (scones, brown bread, fairy cakes), no-bake treats, fruit salad, smoothies, sandwich making, soup making, pizza from scratch, porridge with toppings, healthy snacks, measuring ingredients, following recipes, food from different cultures, seasonal cooking (Halloween barm brack, Christmas mince pies), picnic preparation, garden-to-table',
  life_skills: 'Getting dressed independently, tying shoelaces, brushing teeth routine, setting the table, tidying room, watering plants, pet care basics, road safety, stranger safety, basic first aid, telling time, using a phone for emergencies, packing school bag, making the bed, folding clothes, personal hygiene, money basics',
  calm: 'Breathing exercises, guided visualisation, progressive muscle relaxation, sensory bottles, sensory bins (rice, water beads), mindful colouring, nature mindfulness walks, yoga nidra for kids, gratitude journals, worry dolls, calm-down jars, listening to classical music, gentle stretching, cloud gazing, rain stick making, aromatherapy play',
  social: 'Turn-taking games, sharing activities, cooperative building (Lego, blocks), role play (shop, doctor, school), emotion recognition, conflict resolution practice, compliment circles, pen pals, community helpers, random acts of kindness, group art projects, team challenges, cultural celebration activities, buddy reading, circle time discussions',
};

// Aistear + NCCA curriculum mapping by category
const CURRICULUM_BY_CATEGORY: Record<string, { aistear: string[]; ncca: string[] }> = {
  nature: { aistear: ['Exploring & Thinking', 'Well-being'], ncca: ['SESE'] },
  science: { aistear: ['Exploring & Thinking', 'Communicating'], ncca: ['SESE', 'Mathematics'] },
  art: { aistear: ['Communicating', 'Identity & Belonging'], ncca: ['Arts Education'] },
  maths: { aistear: ['Exploring & Thinking', 'Communicating'], ncca: ['Mathematics'] },
  literacy: { aistear: ['Communicating', 'Identity & Belonging'], ncca: ['Language'] },
  movement: { aistear: ['Well-being', 'Exploring & Thinking'], ncca: ['Physical Education', 'SPHE'] },
  kitchen: { aistear: ['Exploring & Thinking', 'Well-being', 'Communicating'], ncca: ['Mathematics', 'SESE'] },
  life_skills: { aistear: ['Well-being', 'Identity & Belonging'], ncca: ['SPHE'] },
  calm: { aistear: ['Well-being', 'Identity & Belonging'], ncca: ['SPHE', 'Arts Education'] },
  social: { aistear: ['Identity & Belonging', 'Communicating'], ncca: ['SPHE'] },
};

interface Activity {
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[] };
  materials: { name: string; household_common: boolean }[];
  learning_outcomes: string[];
  parent_guide: {
    knowledge: { topic: string; content: string }[];
    conversation_starters: string[];
    watch_for: string[];
  };
  curriculum_tags: {
    aistear_themes: string[];
    ncca_areas: string[];
    outcome_codes: string[];
    educator_quality: string;
    quality_notes: string;
  };
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  location: string;
  energy_level: string;
  mess_level: string;
  weather: string[];
  season: string[];
  screen_free: boolean;
  premium: boolean;
  published: boolean;
  created_by: string;
}

async function generateBatch(
  category: string,
  ageGroup: typeof AGE_GROUPS[number],
  count: number,
  existingTitles: string[]
): Promise<Activity[]> {
  const curriculum = CURRICULUM_BY_CATEGORY[category];
  const prompt = `Generate ${count} unique family learning activities for the category "${category}".

TARGET AGE GROUP: ${ageGroup.description}
age_min: ${ageGroup.min}, age_max: ${ageGroup.max}

CATEGORY IDEAS: ${CATEGORY_PROMPTS[category]}

AVOID DUPLICATES - these titles already exist: ${existingTitles.slice(-30).join(', ')}

IRISH CONTEXT: These activities are for families in Ireland. Reference:
- Irish wildlife, plants, geography where relevant
- Irish language words/phrases in literacy activities
- GAA, Irish dancing, Irish culture where relevant
- Euro currency for money activities
- Irish weather (rain is common - include rainy day alternatives)
- Seasons as experienced in Ireland

CURRICULUM ALIGNMENT:
- Aistear Framework themes: ${curriculum.aistear.join(', ')}
- NCCA Primary Curriculum areas: ${curriculum.ncca.join(', ')}

Return a JSON array of ${count} activities. Each activity MUST have ALL these fields:
{
  "title": "Engaging title (max 50 chars)",
  "slug": "url-safe-slug",
  "description": "2-3 sentences describing the activity in Irish English. What the child will do and why it's valuable.",
  "instructions": { "steps": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."] },
  "materials": [{ "name": "item name", "household_common": true/false }],
  "learning_outcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "parent_guide": {
    "knowledge": [{ "topic": "Key concept", "content": "Brief explanation for parents" }],
    "conversation_starters": ["Question 1?", "Question 2?", "Question 3?"],
    "watch_for": ["Sign of learning 1", "Sign of learning 2"]
  },
  "curriculum_tags": {
    "aistear_themes": ${JSON.stringify(curriculum.aistear)},
    "ncca_areas": ${JSON.stringify(curriculum.ncca)},
    "outcome_codes": [],
    "educator_quality": "good",
    "quality_notes": ""
  },
  "duration_minutes": 15-60 (age-appropriate),
  "location": "indoor" | "outdoor" | "both",
  "energy_level": "calm" | "moderate" | "active",
  "mess_level": "none" | "low" | "medium" | "high",
  "weather": ["sunny", "cloudy", "rainy"] (which weather suits),
  "season": ["spring", "summer", "autumn", "winter"] (which seasons suit)
}

Return ONLY the JSON array, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (response.content[0] as any).text;

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in response');

  const activities: any[] = JSON.parse(jsonMatch[0]);

  return activities.map((a: any) => ({
    ...a,
    category,
    age_min: ageGroup.min,
    age_max: ageGroup.max,
    slug: a.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') || a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    screen_free: true,
    premium: false,
    published: true,
    created_by: 'ai-generator',
    weather: a.weather || ['sunny', 'cloudy'],
    season: a.season || ['spring', 'summer', 'autumn', 'winter'],
    location: ['indoor', 'outdoor', 'both'].includes(a.location) ? a.location : 'both',
    energy_level: ['calm', 'moderate', 'active'].includes(a.energy_level) ? a.energy_level : 'moderate',
    mess_level: ['none', 'low', 'medium', 'high'].includes(a.mess_level) ? a.mess_level : 'low',
    duration_minutes: Math.max(10, Math.min(60, a.duration_minutes || 25)),
  }));
}

async function main() {
  console.log('============================================================');
  console.log('The Hedge - Curriculum-Driven Content Gap Filler');
  console.log('============================================================\n');

  // Get current counts per category
  const { data: existing } = await supabase
    .from('activities')
    .select('category, title, slug')
    .eq('published', true);

  const countByCategory: Record<string, number> = {};
  const titlesByCategory: Record<string, string[]> = {};
  const allSlugs = new Set<string>();

  for (const a of existing || []) {
    countByCategory[a.category] = (countByCategory[a.category] || 0) + 1;
    if (!titlesByCategory[a.category]) titlesByCategory[a.category] = [];
    titlesByCategory[a.category].push(a.title);
    allSlugs.add(a.slug);
  }

  console.log('Current activity counts:');
  const categories = Object.keys(CATEGORY_PROMPTS);
  let totalToGenerate = 0;
  const gaps: { category: string; needed: number }[] = [];

  for (const cat of categories) {
    const current = countByCategory[cat] || 0;
    const needed = Math.max(0, TARGET_PER_CATEGORY - current);
    console.log(`  ${cat}: ${current}/${TARGET_PER_CATEGORY} (need ${needed} more)`);
    if (needed > 0) {
      gaps.push({ category: cat, needed });
      totalToGenerate += needed;
    }
  }

  console.log(`\nTotal to generate: ${totalToGenerate}\n`);

  if (totalToGenerate === 0) {
    console.log('All categories have sufficient content!');
    return;
  }

  let totalGenerated = 0;
  let totalInserted = 0;
  let totalErrors = 0;

  for (const gap of gaps) {
    console.log(`\n--- ${gap.category.toUpperCase()} (need ${gap.needed}) ---`);

    // Distribute across age groups evenly
    const perAgeGroup = Math.ceil(gap.needed / AGE_GROUPS.length);
    let remaining = gap.needed;

    for (const ageGroup of AGE_GROUPS) {
      if (remaining <= 0) break;
      const batchSize = Math.min(perAgeGroup, remaining, 10);

      console.log(`  [${gap.category}] ${ageGroup.label} - generating ${batchSize}...`);

      try {
        const activities = await generateBatch(
          gap.category,
          ageGroup,
          batchSize,
          titlesByCategory[gap.category] || []
        );

        // Deduplicate slugs
        const toInsert = [];
        for (const a of activities) {
          let slug = a.slug;
          let suffix = 1;
          while (allSlugs.has(slug)) {
            slug = `${a.slug}-${suffix}`;
            suffix++;
          }
          a.slug = slug;
          allSlugs.add(slug);
          titlesByCategory[gap.category] = titlesByCategory[gap.category] || [];
          titlesByCategory[gap.category].push(a.title);
          toInsert.push(a);
        }

        // Insert into DB
        const { data, error } = await supabase
          .from('activities')
          .upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true })
          .select('id');

        const inserted = data?.length || 0;
        totalGenerated += activities.length;
        totalInserted += inserted;
        remaining -= activities.length;

        console.log(`    Generated ${activities.length}, inserted ${inserted}`);
      } catch (err: any) {
        console.error(`    ERROR: ${err.message}`);
        totalErrors++;
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log('\n============================================================');
  console.log(`DONE: Generated ${totalGenerated}, Inserted ${totalInserted}, Errors ${totalErrors}`);

  // Final count check
  const { count } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('published', true);
  console.log(`Total published activities in DB: ${count}`);
  console.log('============================================================');
}

main().catch(console.error);
