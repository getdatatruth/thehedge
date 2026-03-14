/**
 * Map all activities to Irish curriculum outcomes using Claude AI.
 *
 * What it does:
 * 1. Loads all 104 curriculum outcomes (Aistear + NCCA)
 * 2. Loads all published activities
 * 3. Uses Claude to map each activity to specific outcome codes
 * 4. Rates educational quality (strong/moderate/weak)
 * 5. Updates curriculum_tags JSONB on each activity
 * 6. Reports curriculum gaps (outcomes with no activities)
 *
 * Run from apps/web/:
 *   node scripts/map-curriculum.js
 */
require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All 104 outcome codes with their text (loaded from DB at runtime)
let OUTCOMES = [];

const SYSTEM_PROMPT = `You are an expert Irish education assessor who maps learning activities to the Irish curriculum frameworks. You have deep knowledge of:

1. AISTEAR (Early Childhood Curriculum Framework, ages 0-6)
   - Well-being (WB-01 to WB-07)
   - Identity & Belonging (IB-01 to IB-06)
   - Communicating (CO-01 to CO-07)
   - Exploring & Thinking (ET-01 to ET-06)

2. NCCA Primary Curriculum - Junior (ages 4-8)
   - Language: English (EN-OL, EN-RD, EN-WR), Irish (GA-OL)
   - Mathematics (MA-NU, MA-AL, MA-SS, MA-ME, MA-DA)
   - SESE: Science (SC-LT, SC-MA, SC-EF, SC-EA), History (HI-MF, HI-LS), Geography (GE-NE, GE-HE)
   - Arts Education: Visual Arts (VA-DR, VA-PC, VA-CO, VA-PR), Music (MU-PE, MU-LR), Drama (DR-01)
   - Physical Education (PE-GA, PE-GY, PE-DA, PE-OA, PE-AT)
   - SPHE (SP-MY, SP-MO, SP-MW)

3. NCCA Primary Curriculum - Senior (ages 8-12)
   - Same areas with -S01 suffixes for senior-level outcomes

Your job is to:
- Map each activity to the SPECIFIC outcome codes it genuinely addresses
- Be rigorous - only map outcomes the activity actually develops, not tangentially related ones
- Consider the age range: activities for 0-3 should map to Aistear, 4-8 to Aistear + junior NCCA, 8-12 to senior NCCA
- Rate the educational quality for a homeschool educator's plan

Rules:
- Be STRICT about mappings - a cloud watching activity maps to SC-EA (environmental awareness) and GE-NE (weather patterns), not to mathematics
- An activity must DIRECTLY develop the skill described in the outcome, not just vaguely relate to it
- Most activities should map to 3-8 outcomes. Very few should have more than 10
- Quality rating must be honest: "weak" activities are filler with no real learning depth`;

async function mapBatch(activities, outcomes) {
  const outcomesRef = outcomes.map(o => `${o.outcome_code}: ${o.outcome_text} [${o.stage}]`).join('\n');

  const activitiesText = activities.map((a, i) => `
ACTIVITY ${i + 1}:
- ID: ${a.id}
- Title: ${a.title}
- Category: ${a.category}
- Description: ${a.description}
- Age range: ${a.age_min}-${a.age_max} years
- Location: ${a.location}
- Learning outcomes: ${(a.learning_outcomes || []).join(', ')}
- Steps: ${(a.instructions?.steps || []).slice(0, 5).join(' | ')}
`).join('\n');

  const prompt = `Map these ${activities.length} activities to the Irish curriculum outcomes below.

CURRICULUM OUTCOMES:
${outcomesRef}

ACTIVITIES TO MAP:
${activitiesText}

For each activity, return:
- outcome_codes: array of outcome codes this activity genuinely develops
- aistear_themes: array of Aistear themes addressed (from: "Well-being", "Identity & Belonging", "Communicating", "Exploring & Thinking")
- ncca_areas: array of NCCA curriculum areas addressed (from: "Language", "Mathematics", "SESE", "Arts Education", "Physical Education", "SPHE")
- educator_quality: "strong" (rich, structured learning), "moderate" (decent learning but could be deeper), or "weak" (mostly entertainment, little educational depth)
- quality_notes: one sentence explaining the rating

Return ONLY valid JSON array:
[
  {
    "id": "activity-uuid",
    "outcome_codes": ["WB-04", "ET-01", "SC-LT-01"],
    "aistear_themes": ["Well-being", "Exploring & Thinking"],
    "ncca_areas": ["SESE", "Physical Education"],
    "educator_quality": "strong",
    "quality_notes": "Rich sensory exploration with clear science learning outcomes."
  }
]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in response');
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  // 1. Load curriculum outcomes
  const outcomes = await sql`
    SELECT id, curriculum_area, stage, strand, outcome_code, outcome_text
    FROM curriculum_outcomes
    WHERE country = 'IE'
    ORDER BY outcome_code
  `;
  OUTCOMES = outcomes;
  console.log(`Loaded ${outcomes.length} curriculum outcomes\n`);

  // 2. Load all published activities
  const activities = await sql`
    SELECT id, title, slug, description, category, instructions,
           learning_outcomes, materials, age_min, age_max, location,
           curriculum_tags
    FROM activities
    WHERE published = true
    ORDER BY category, title
  `;
  console.log(`Found ${activities.length} published activities\n`);

  // 3. Process in batches of 5 (to keep Claude's context manageable)
  const BATCH_SIZE = 5;
  let success = 0;
  let failed = 0;
  const allMappings = [];
  const qualityCounts = { strong: 0, moderate: 0, weak: 0 };

  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    const batch = activities.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(activities.length / BATCH_SIZE);

    try {
      process.stdout.write(`[Batch ${batchNum}/${totalBatches}] ${batch.map(a => a.title).join(', ')}... `);

      const mappings = await mapBatch(batch, outcomes);

      // Update each activity's curriculum_tags
      for (const mapping of mappings) {
        const activity = batch.find(a => a.id === mapping.id);
        if (!activity) {
          console.log(`  WARNING: No activity found for id ${mapping.id}`);
          continue;
        }

        const curriculumTags = {
          outcome_codes: mapping.outcome_codes || [],
          aistear_themes: mapping.aistear_themes || [],
          ncca_areas: mapping.ncca_areas || [],
          educator_quality: mapping.educator_quality || 'moderate',
          quality_notes: mapping.quality_notes || '',
        };

        await sql`
          UPDATE activities
          SET curriculum_tags = ${sql.json(curriculumTags)},
              updated_at = now()
          WHERE id = ${mapping.id}
        `;

        qualityCounts[mapping.educator_quality] = (qualityCounts[mapping.educator_quality] || 0) + 1;
        allMappings.push({ ...mapping, title: activity.title, category: activity.category });
        success++;
      }

      console.log(`done (${mappings.length} mapped)`);

      // Rate limit delay
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed += batch.length;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // 4. Report results
  console.log('\n' + '='.repeat(60));
  console.log('CURRICULUM MAPPING COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nActivities mapped: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nQuality breakdown:`);
  console.log(`  Strong:   ${qualityCounts.strong} activities`);
  console.log(`  Moderate: ${qualityCounts.moderate} activities`);
  console.log(`  Weak:     ${qualityCounts.weak} activities`);

  // 5. Find curriculum gaps
  console.log('\n' + '-'.repeat(60));
  console.log('CURRICULUM GAPS (outcomes with NO activities):');
  console.log('-'.repeat(60));

  const coveredCodes = new Set();
  for (const m of allMappings) {
    for (const code of (m.outcome_codes || [])) {
      coveredCodes.add(code);
    }
  }

  const gaps = outcomes.filter(o => !coveredCodes.has(o.outcome_code));
  if (gaps.length === 0) {
    console.log('None! Full curriculum coverage achieved.');
  } else {
    console.log(`${gaps.length} outcomes have no activities:\n`);
    for (const gap of gaps) {
      console.log(`  ${gap.outcome_code}: ${gap.outcome_text} [${gap.stage}]`);
    }
  }

  // 6. Weak activities report
  const weakActivities = allMappings.filter(m => m.educator_quality === 'weak');
  if (weakActivities.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log(`WEAK ACTIVITIES (${weakActivities.length} - consider removing from educator plans):`);
    console.log('-'.repeat(60));
    for (const a of weakActivities) {
      console.log(`  [${a.category}] ${a.title} - ${a.quality_notes}`);
    }
  }

  // 7. Coverage per outcome code
  console.log('\n' + '-'.repeat(60));
  console.log('COVERAGE DEPTH (activities per outcome):');
  console.log('-'.repeat(60));

  const codeCounts = {};
  for (const m of allMappings) {
    for (const code of (m.outcome_codes || [])) {
      codeCounts[code] = (codeCounts[code] || 0) + 1;
    }
  }

  // Sort by count ascending to show thin coverage first
  const sortedCodes = Object.entries(codeCounts).sort((a, b) => a[1] - b[1]);
  for (const [code, count] of sortedCodes) {
    const outcome = outcomes.find(o => o.outcome_code === code);
    const bar = '#'.repeat(Math.min(count, 30));
    console.log(`  ${code.padEnd(12)} ${String(count).padStart(3)} ${bar} ${outcome ? outcome.outcome_text.substring(0, 60) : ''}`);
  }

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
