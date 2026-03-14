/**
 * Generate a large, diverse activity database using Claude AI.
 *
 * Run: node scripts/generate-activities.js
 *
 * Generates activities in batches across all categories, age ranges,
 * locations, energy levels, and seasons to create a rich, non-repetitive library.
 */
require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');
const postgres = require('postgres');
const crypto = require('crypto');

const sql = postgres(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All valid enum values from schema
const CATEGORIES = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
const LOCATIONS = ['indoor', 'outdoor', 'both'];
const ENERGY_LEVELS = ['calm', 'moderate', 'active'];
const MESS_LEVELS = ['none', 'low', 'medium', 'high'];

// Curriculum areas mapped to Aistear + primary school
const CURRICULUM_THEMES = [
  'Well-being',
  'Identity & Belonging',
  'Communicating',
  'Exploring & Thinking',
  'SPHE (Social, Personal & Health Education)',
  'Physical Education',
  'Visual Arts',
  'Music',
  'Drama',
  'Mathematics',
  'Science & Technology',
  'Language (English)',
  'Gaeilge (Irish Language)',
  'Geography',
  'History',
  'Environmental awareness',
  'Creative expression',
  'Fine motor skills',
  'Gross motor skills',
  'Emotional regulation',
  'Problem solving',
  'Teamwork & cooperation',
  'Independence & self-care',
  'Nature & biodiversity',
  'Sensory development',
];

// Generation batches - each batch targets specific gaps
const GENERATION_BATCHES = [
  // Age 0-2 (toddlers) - currently almost empty
  { label: 'Toddlers (0-2) - Sensory & Movement', count: 8, ageMin: 0, ageMax: 2, categories: ['calm', 'movement', 'art'], energy: ['calm', 'moderate'], focus: 'Simple sensory play, cause and effect, first words, textures, colours, water play, sand play, stacking, posting, peek-a-boo variations. Irish toddler-friendly.' },
  { label: 'Toddlers (0-2) - Nature & Discovery', count: 6, ageMin: 0, ageMax: 3, categories: ['nature', 'science'], locations: ['outdoor', 'both'], focus: 'Garden exploration, puddle splashing, leaf collecting, bug watching, flower smelling, bird listening. Simple outdoor wonder for tiny ones.' },
  { label: 'Toddlers (0-2) - Kitchen & Life Skills', count: 6, ageMin: 1, ageMax: 3, categories: ['kitchen', 'life_skills'], focus: 'Mixing, pouring, washing fruit, tearing lettuce, matching socks, wiping tables, watering plants. Building independence through everyday tasks.' },

  // Age 3-5 (preschool) - expand variety
  { label: 'Preschool (3-5) - STEM Deep Dives', count: 10, ageMin: 3, ageMax: 5, categories: ['science', 'maths'], focus: 'Magnifying glass investigations, simple experiments, counting in nature, pattern making, sorting and classifying, building bridges, ramps and balls, colour mixing science, ice experiments, growing seeds.' },
  { label: 'Preschool (3-5) - Creative Arts', count: 10, ageMin: 3, ageMax: 5, categories: ['art'], mess: ['medium', 'high'], focus: 'Painting techniques (sponge, fork, marble rolling), collage, clay/playdough sculpture, weaving, printing, junk modelling, nature art installations, collaborative murals, self-portraits, colour theory.' },
  { label: 'Preschool (3-5) - Active Outdoor', count: 10, ageMin: 3, ageMax: 6, categories: ['movement', 'nature'], locations: ['outdoor'], energy: ['active', 'moderate'], focus: 'Obstacle courses, nature scavenger hunts, den building, climbing, balancing, throwing games, relay races, parachute games, hide and seek variations, water play outdoors.' },
  { label: 'Preschool (3-5) - Irish Language & Culture', count: 8, ageMin: 3, ageMax: 6, categories: ['literacy', 'social'], focus: 'Irish language games, counting as Gaeilge, colours in Irish, Irish songs and rhymes, St Brigid cross making, Celtic patterns, Irish mythology stories for small ones, Irish dancing basics.' },
  { label: 'Preschool (3-5) - Social & Emotional', count: 8, ageMin: 3, ageMax: 5, categories: ['social', 'calm'], focus: 'Emotion identification, friendship activities, sharing games, kindness missions, worry dolls, calm corners, mindful colouring, feelings check-in activities, cooperative building, turn-taking games.' },
  { label: 'Preschool (3-5) - Kitchen Adventures', count: 8, ageMin: 3, ageMax: 6, categories: ['kitchen'], mess: ['medium', 'high'], focus: 'Baking scones, making smoothies, fruit salad art, pizza faces, rice krispie treats, pancake shapes, soup making, sandwich art. Irish recipes where possible.' },
  { label: 'Preschool (3-5) - Literacy & Storytelling', count: 8, ageMin: 3, ageMax: 5, categories: ['literacy'], focus: 'Story acting, puppet shows, letter formation with playdough, rhyming games, picture book discussions, making books, name writing, sound hunts, story sequencing, comic strip creation.' },

  // Age 6-8 (early primary) - currently very thin
  { label: 'Primary (6-8) - Science Investigations', count: 10, ageMin: 6, ageMax: 8, categories: ['science'], focus: 'Real experiments: growing crystals, making sundials, weather stations, simple circuits, plant biology, rock classification, water cycle models, sound experiments, light and shadow investigations, microscope explorations.' },
  { label: 'Primary (6-8) - Maths in Real Life', count: 10, ageMin: 6, ageMax: 8, categories: ['maths'], focus: 'Multiplication through games, fractions with food, geometry treasure hunts, money and budgeting, measurement challenges, data collection and graphs, time problems, symmetry art, estimation games, coding with blocks.' },
  { label: 'Primary (6-8) - Creative Writing & Drama', count: 8, ageMin: 6, ageMax: 9, categories: ['literacy', 'social'], focus: 'Story writing workshops, diary keeping, poetry forms (haiku, limerick, acrostic), play writing, debate practice, book club discussions, newspaper creation, interview skills, persuasive writing, comic creation.' },
  { label: 'Primary (6-8) - Art & Design', count: 8, ageMin: 6, ageMax: 9, categories: ['art'], focus: 'Perspective drawing, watercolour techniques, lino printing, clay pottery, textile design, architecture models, stop-motion animation, photography basics, graphic design, art history appreciation (Irish artists).' },
  { label: 'Primary (6-8) - Active & Sport', count: 8, ageMin: 6, ageMax: 9, categories: ['movement'], energy: ['active'], focus: 'Circuit training games, orienteering, capture the flag, rounders, athletics basics, gymnastics at home, yoga sequences, martial arts basics, dance choreography, swimming prep exercises.' },
  { label: 'Primary (6-8) - Irish Heritage & Geography', count: 8, ageMin: 6, ageMax: 9, categories: ['social', 'nature'], focus: 'Map reading and making, Irish history projects, local area studies, county exploration, Irish mythology deep dives, archaeology dig simulation, Irish wildlife identification, bog ecology, coastal geography, Irish music instruments.' },
  { label: 'Primary (6-8) - Life Skills & Independence', count: 8, ageMin: 6, ageMax: 9, categories: ['life_skills', 'kitchen'], focus: 'Basic cooking full meals, money management, first aid refresher, bike maintenance, garden planning, sewing projects, tool safety, meal planning, cleaning routines, time management.' },

  // Age 9-12 (upper primary) - currently empty
  { label: 'Upper Primary (9-12) - Advanced STEM', count: 10, ageMin: 9, ageMax: 12, categories: ['science', 'maths'], focus: 'Robotics basics, coding projects, advanced chemistry experiments, physics challenges, engineering design, statistics projects, algebra through puzzles, geometry constructions, environmental science, astronomy.' },
  { label: 'Upper Primary (9-12) - Advanced Creative', count: 8, ageMin: 9, ageMax: 12, categories: ['art', 'literacy'], focus: 'Portfolio building, novel writing, film making basics, advanced painting, sculpture, music composition, podcast creation, journalism, photography projects, creative coding.' },
  { label: 'Upper Primary (9-12) - Active Challenges', count: 6, ageMin: 9, ageMax: 12, categories: ['movement'], energy: ['active'], focus: 'Fitness challenges, team sport tactics, adventure skills, navigation with compass, survival skills basics, parkour basics, dance styles, martial arts forms, sports science experiments.' },
  { label: 'Upper Primary (9-12) - Life & World', count: 8, ageMin: 9, ageMax: 12, categories: ['life_skills', 'social'], focus: 'Budgeting projects, cooking full meals independently, debating, community service, entrepreneurship basics, environmental campaigns, cultural exchange, current affairs discussions, interview practice, presentation skills.' },

  // Seasonal specials
  { label: 'Winter Specials', count: 8, ageMin: 3, ageMax: 10, categories: ['nature', 'science', 'art', 'kitchen'], seasons: ['winter'], focus: 'Frost experiments, bird feeding stations, winter solstice activities, Christmas crafts (non-religious), snow science, warm drink making, indoor camping, star gazing in early dark, cosy reading dens, candle safety and science.' },
  { label: 'Summer Specials', count: 8, ageMin: 3, ageMax: 10, categories: ['nature', 'science', 'movement'], locations: ['outdoor'], seasons: ['summer'], focus: 'Rock pool exploration, beach science, sandcastle engineering, outdoor cinema, garden camping, water balloon experiments, ice cream making, butterfly garden, long evening adventures, sun safety and UV experiments.' },
  { label: 'Rainy Day Specials', count: 10, ageMin: 3, ageMax: 10, categories: ['art', 'science', 'kitchen', 'calm'], locations: ['indoor'], focus: 'Irish weather-proof activities for when it lashes. Indoor treasure hunts, blanket fort building, rainy day baking marathon, window rain art, paper plane engineering, board game creation, indoor camping, sock puppet theatre, dance party, science lab in the kitchen.' },

  // Wellness & Mindfulness
  { label: 'Wellness & Mindfulness', count: 10, ageMin: 3, ageMax: 12, categories: ['calm', 'movement'], focus: 'Body scan meditation for kids, progressive muscle relaxation, gratitude practices, nature mindfulness walks, journaling for wellbeing, yoga stories, breathing techniques, sensory grounding exercises, positive affirmations, sleep hygiene activities.' },
];

const SYSTEM_PROMPT = `You are an expert Irish early childhood and primary educator creating activities for The Hedge, a family learning platform. Generate exactly the number of activities requested.

CRITICAL RULES:
- Every activity MUST be unique and distinct - never duplicate concepts
- Use Irish English throughout (grand, mam, jumper, biscuit, etc.)
- Activities must be doable with common household items - nothing to buy
- Be SPECIFIC in instructions - exact steps, not vague guidance
- Include real educational content in learning outcomes
- Never use em dashes, use regular dashes instead
- Include Irish cultural elements where natural (not forced)
- Activities should feel premium, creative, and genuinely useful
- Each activity should teach something real and meaningful

Return ONLY a valid JSON array. Each activity object must have:
{
  "title": "Unique, engaging title",
  "description": "2-3 sentence description that sells the activity to parents",
  "category": "one of: nature, kitchen, science, art, movement, literacy, maths, life_skills, calm, social",
  "location": "one of: indoor, outdoor, both",
  "age_min": number,
  "age_max": number,
  "duration_minutes": number (15-90),
  "energy_level": "one of: calm, moderate, active",
  "mess_level": "one of: none, low, medium, high",
  "screen_free": true/false,
  "season": ["array of: spring, summer, autumn, winter"],
  "materials": [{"name": "item name", "household_common": true/false}],
  "instructions": {
    "steps": ["Detailed step 1", "Detailed step 2", "...at least 5-8 steps"],
    "variations": ["Age/ability variation 1", "Extension idea"],
    "tips": ["Practical parent tip"]
  },
  "learning_outcomes": ["Specific outcome 1", "Specific outcome 2", "at least 3-4"],
  "parent_guide": {
    "knowledge": [
      {"topic": "Key concept heading", "content": "2-4 sentences of REAL knowledge the parent needs to teach this confidently"}
    ],
    "conversation_starters": ["Open-ended questions to ask during the activity"],
    "watch_for": ["Signs of learning to notice and celebrate"]
  }
}

IMPORTANT: parent_guide.knowledge must contain REAL, SPECIFIC facts - not generic encouragement. If the activity is about plants, teach photosynthesis. If about shapes, teach geometry terms. Make every parent an instant expert.`;

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function generateBatch(batch, existingSlugs) {
  const categoryConstraint = batch.categories
    ? `Categories to use: ${batch.categories.join(', ')}`
    : '';
  const locationConstraint = batch.locations
    ? `Locations: ${batch.locations.join(', ')}`
    : '';
  const energyConstraint = batch.energy
    ? `Energy levels: ${batch.energy.join(', ')}`
    : '';
  const messConstraint = batch.mess
    ? `Mess levels: ${batch.mess.join(', ')}`
    : '';
  const seasonConstraint = batch.seasons
    ? `Seasons: ${batch.seasons.join(', ')}`
    : '';

  const prompt = `Generate exactly ${batch.count} activities for: ${batch.label}

Age range: ${batch.ageMin}-${batch.ageMax} years
${categoryConstraint}
${locationConstraint}
${energyConstraint}
${messConstraint}
${seasonConstraint}

Focus: ${batch.focus}

IMPORTANT: These slugs already exist, do NOT create duplicates or similar concepts:
${existingSlugs.join(', ')}

Make each activity genuinely unique, creative, and educationally valuable. Mix up durations, energy levels, and mess levels within the batch.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in response');
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  // Get existing slugs to avoid duplicates
  const existing = await sql`SELECT slug FROM activities`;
  const existingSlugs = existing.map(r => r.slug);
  console.log(`Existing activities: ${existingSlugs.length}\n`);

  let totalInserted = 0;
  let totalFailed = 0;

  // Split large batches into sub-batches of max 6
  const expandedBatches = [];
  for (const batch of GENERATION_BATCHES) {
    if (batch.count <= 6) {
      expandedBatches.push(batch);
    } else {
      const numSubs = Math.ceil(batch.count / 5);
      for (let i = 0; i < numSubs; i++) {
        const remaining = batch.count - i * 5;
        expandedBatches.push({
          ...batch,
          label: `${batch.label} (part ${i + 1}/${numSubs})`,
          count: Math.min(5, remaining),
        });
      }
    }
  }

  for (let batchIdx = 0; batchIdx < expandedBatches.length; batchIdx++) {
    const batch = expandedBatches[batchIdx];
    console.log(`\n[Batch ${batchIdx + 1}/${expandedBatches.length}] ${batch.label} (${batch.count} activities)`);

    try {
      const activities = await generateBatch(batch, existingSlugs);
      console.log(`  Generated ${activities.length} activities`);

      for (const activity of activities) {
        try {
          const slug = slugify(activity.title);

          // Skip if slug already exists
          if (existingSlugs.includes(slug)) {
            console.log(`  SKIP (duplicate): ${activity.title}`);
            continue;
          }

          // Validate enums
          if (!CATEGORIES.includes(activity.category)) activity.category = batch.categories?.[0] || 'nature';
          if (!LOCATIONS.includes(activity.location)) activity.location = 'both';
          if (!ENERGY_LEVELS.includes(activity.energy_level)) activity.energy_level = 'moderate';
          if (!MESS_LEVELS.includes(activity.mess_level)) activity.mess_level = 'low';

          await sql`
            INSERT INTO activities (
              title, slug, description, category, location,
              age_min, age_max, duration_minutes,
              energy_level, mess_level, screen_free,
              season, materials, instructions,
              learning_outcomes, parent_guide,
              published, created_by, created_at, updated_at
            ) VALUES (
              ${activity.title},
              ${slug},
              ${activity.description},
              ${activity.category},
              ${activity.location},
              ${activity.age_min || batch.ageMin},
              ${activity.age_max || batch.ageMax},
              ${activity.duration_minutes || 30},
              ${activity.energy_level},
              ${activity.mess_level},
              ${activity.screen_free !== false},
              ${activity.season || ['spring', 'summer', 'autumn', 'winter']},
              ${sql.json(activity.materials || [])},
              ${sql.json(activity.instructions || { steps: [] })},
              ${activity.learning_outcomes || []},
              ${sql.json(activity.parent_guide || null)},
              true,
              'ai-generated',
              now(),
              now()
            )
          `;

          existingSlugs.push(slug);
          totalInserted++;
          console.log(`  + ${activity.title}`);
        } catch (err) {
          console.log(`  FAIL: ${activity.title} - ${err.message}`);
          totalFailed++;
        }
      }

      // Delay between batches to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(`  BATCH FAILED: ${err.message}`);
      totalFailed += batch.count;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`COMPLETE: ${totalInserted} inserted, ${totalFailed} failed`);
  console.log(`Total activities now: ${existingSlugs.length}`);
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
