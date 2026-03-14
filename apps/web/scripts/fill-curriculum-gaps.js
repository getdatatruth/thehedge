/**
 * Generate targeted activities to fill curriculum gaps.
 * Run from apps/web/:
 *   node scripts/fill-curriculum-gaps.js
 */
require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Gap-filling activity specs - each targets specific weak/missing outcome codes
const GAP_ACTIVITIES = [
  // ─── FULL GAPS (0 activities) ───────────────────────────
  {
    target_codes: ['GA-OL-S01'],
    brief: 'Senior Irish conversation activity for ages 9-12. Must involve sustained conversational Irish practice on familiar topics. Think: Irish-language interview game, debate, or role-play scenario. Must be genuinely engaging, not a worksheet.',
    category: 'literacy',
    age_min: 9, age_max: 12,
  },
  {
    target_codes: ['MU-CO-S01'],
    brief: 'Music composition activity for ages 9-12. Children compose and perform their own short musical piece using instruments (homemade or real) and/or voice. Think: songwriting workshop, soundscape composition, or percussion ensemble piece.',
    category: 'art',
    age_min: 9, age_max: 12,
  },
  {
    target_codes: ['PE-AQ-S01'],
    brief: 'Water confidence and basic swimming activity for ages 8-12. Since this is a home learning platform, focus on water safety knowledge, breathing exercises for swimming, and dryland swimming drills that build technique. NOT actual pool swimming (parents handle that), but the knowledge and preparation side.',
    category: 'movement',
    age_min: 8, age_max: 12,
  },

  // ─── THIN COVERAGE (1-2 activities) ─────────────────────
  {
    target_codes: ['PE-OA-01', 'PE-OA-S01'],
    brief: 'Outdoor orienteering/navigation activity. Use map reading, compass skills, or landmark navigation in a garden, park, or neighbourhood setting. Ages 6-10.',
    category: 'movement',
    age_min: 6, age_max: 10,
  },
  {
    target_codes: ['VA-PR-01'],
    brief: 'Printmaking activity for ages 4-8. Children make prints using found objects, vegetables, leaves, or simple techniques like monoprinting. Focus on pattern, repetition, and creative exploration.',
    category: 'art',
    age_min: 4, age_max: 8,
  },
  {
    target_codes: ['VA-DR-S01'],
    brief: 'Senior drawing skills activity for ages 9-12. Focus on observational drawing with perspective, tone, shading, or texture. Think: still life, architectural sketching, or nature journaling with scientific illustration.',
    category: 'art',
    age_min: 9, age_max: 12,
  },
  {
    target_codes: ['EN-RD-02', 'EN-RD-S01'],
    brief: 'Reading fluency activity that works across ages 5-11. Book club style, reader\'s theatre, paired reading, or literature circle. Must involve actual reading of texts with comprehension and discussion.',
    category: 'literacy',
    age_min: 5, age_max: 11,
  },
  {
    target_codes: ['MA-SS-S01'],
    brief: 'Senior shape and space maths for ages 9-12. Symmetry, angles, transformations, or 3D geometry. Hands-on with real objects, not abstract. Think: architectural model building, tessellation art, or angle measurement treasure hunt.',
    category: 'maths',
    age_min: 9, age_max: 12,
  },
  {
    target_codes: ['GA-OL-01', 'GA-OL-02'],
    brief: 'Irish language activity for ages 4-8. Must be genuinely fun and involve real Irish phrases, greetings, or vocabulary. Think: Irish-language scavenger hunt, colour/number game in Irish, or daily routine in Irish.',
    category: 'literacy',
    age_min: 4, age_max: 8,
  },
  {
    target_codes: ['MU-PE-01', 'MU-LR-01'],
    brief: 'Music performance and listening activity for ages 4-8. Singing, rhythm games, or instrument exploration. Must involve active music-making, not just listening. Think: kitchen percussion band, action song workshop, or sound exploration walk.',
    category: 'art',
    age_min: 4, age_max: 8,
  },
];

const SYSTEM_PROMPT = `You are an expert curriculum designer for The Hedge, an Irish family learning platform. You create activities that are genuinely educational, engaging, and suitable for home learning.

You must generate activities that are CREDIBLE for Tusla/AEARS homeschool assessment - meaning a registered home educator could point to these as evidence of curriculum coverage.

Rules:
- Write for Irish families, use Irish English
- Activities must be practical and achievable at home or locally
- Include real educational content, not vague encouragement
- Materials should be commonly available in Irish homes
- Never use em dashes, use regular dashes instead
- Each activity needs a parent_guide with real knowledge

Return ONLY valid JSON with this exact structure:
{
  "title": "Activity Title",
  "slug": "activity-title-kebab-case",
  "description": "2-3 sentence description of what children will do and learn",
  "category": "the_category",
  "age_min": 4,
  "age_max": 8,
  "duration_minutes": 30,
  "location": "indoor|outdoor|both",
  "energy_level": "calm|moderate|active",
  "mess_level": "none|low|medium|high",
  "screen_free": true,
  "materials": [{"name": "Material name", "household_common": true}],
  "instructions": {
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "variations": ["Variation 1", "Variation 2"],
    "tips": ["Tip 1", "Tip 2"]
  },
  "learning_outcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "parent_guide": {
    "knowledge": [
      {"topic": "Topic heading", "content": "2-4 sentences of real knowledge the parent needs."}
    ],
    "conversation_starters": ["Question 1", "Question 2", "Question 3", "Question 4"],
    "watch_for": ["Sign of learning 1", "Sign of learning 2", "Sign of learning 3"]
  },
  "curriculum_tags": {
    "outcome_codes": ["CODE-01", "CODE-02"],
    "aistear_themes": ["Theme 1"],
    "ncca_areas": ["Area 1"],
    "educator_quality": "strong",
    "quality_notes": "One sentence."
  }
}`;

async function generateActivity(gap) {
  const prompt = `Generate ONE high-quality activity for The Hedge platform.

TARGET CURRICULUM CODES: ${gap.target_codes.join(', ')}
CATEGORY: ${gap.category}
AGE RANGE: ${gap.age_min}-${gap.age_max} years
BRIEF: ${gap.brief}

The activity MUST strongly address the target curriculum codes. Include 3-5 knowledge topics in the parent_guide. Make this activity genuinely excellent - something a Tusla assessor would be impressed by.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  console.log(`Generating ${GAP_ACTIVITIES.length} gap-filling activities...\n`);

  let success = 0;
  let failed = 0;

  for (const gap of GAP_ACTIVITIES) {
    try {
      process.stdout.write(`[${success + failed + 1}/${GAP_ACTIVITIES.length}] Targeting ${gap.target_codes.join(', ')}... `);

      const activity = await generateActivity(gap);

      // Check for duplicate slug
      const existing = await sql`SELECT id FROM activities WHERE slug = ${activity.slug}`;
      if (existing.length > 0) {
        activity.slug = activity.slug + '-gap-fill';
      }

      // Extract curriculum_tags and parent_guide
      const curriculumTags = activity.curriculum_tags || {
        outcome_codes: gap.target_codes,
        aistear_themes: [],
        ncca_areas: [],
        educator_quality: 'strong',
        quality_notes: 'Generated to fill curriculum gap.',
      };
      const parentGuide = activity.parent_guide || null;

      await sql`
        INSERT INTO activities (
          title, slug, description, category, age_min, age_max,
          duration_minutes, location, energy_level, mess_level, screen_free,
          materials, instructions, learning_outcomes,
          parent_guide, curriculum_tags,
          published, created_by
        ) VALUES (
          ${activity.title},
          ${activity.slug},
          ${activity.description},
          ${activity.category || gap.category},
          ${activity.age_min || gap.age_min},
          ${activity.age_max || gap.age_max},
          ${activity.duration_minutes || 30},
          ${activity.location || 'indoor'},
          ${activity.energy_level || 'moderate'},
          ${activity.mess_level || 'low'},
          ${activity.screen_free !== false},
          ${sql.json(activity.materials || [])},
          ${sql.json(activity.instructions || { steps: [] })},
          ${activity.learning_outcomes || []},
          ${sql.json(parentGuide)},
          ${sql.json(curriculumTags)},
          true,
          'gap-fill'
        )
      `;

      console.log(`done - "${activity.title}"`);
      success++;

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\nComplete: ${success} generated, ${failed} failed`);

  // Show new total
  const total = await sql`SELECT count(*) as count FROM activities WHERE published = true`;
  console.log(`Total published activities: ${total[0].count}`);

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
