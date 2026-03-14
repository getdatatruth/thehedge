/**
 * Backfill parent_guide for all activities using Claude AI.
 * Run: node scripts/backfill-parent-guides.js
 */
require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert early childhood educator creating parent teaching guides for The Hedge, an Irish family learning platform. Your job is to give parents ALL the knowledge they need to confidently teach their children during an activity - even if the parent knows nothing about the topic.

Rules:
- Write for Irish parents, use Irish English
- Be specific and factual - real knowledge, not vague encouragement
- If an activity involves clouds, teach cloud types. If it involves bugs, teach bug identification. If cooking, teach the science.
- Keep language warm and accessible - no jargon without explanation
- Age-appropriate depth based on the activity's age range
- Never use em dashes, use regular dashes instead

Return ONLY valid JSON with this exact structure:
{
  "knowledge": [
    {
      "topic": "Short topic heading (e.g. 'Types of clouds')",
      "content": "2-4 sentences of actual knowledge the parent needs. Be specific and factual."
    }
  ],
  "conversation_starters": [
    "Open-ended questions parents can ask during the activity to deepen learning"
  ],
  "watch_for": [
    "Signs of learning or engagement to notice and celebrate"
  ]
}

Include 3-5 knowledge topics, 4-6 conversation starters, and 3-4 watch_for items.`;

async function generateGuide(activity) {
  const prompt = `Generate a parent teaching guide for this activity:

Title: ${activity.title}
Category: ${activity.category}
Description: ${activity.description}
Age range: ${activity.age_min}-${activity.age_max} years
Location: ${activity.location}
Materials: ${(activity.materials || []).map(m => typeof m === 'string' ? m : m.name).join(', ') || 'None'}
Steps: ${(activity.instructions?.steps || []).join(' | ')}
Learning outcomes: ${(activity.learning_outcomes || []).join(', ')}

Remember: give parents REAL knowledge they need to teach this activity confidently. If this is about nature, teach the science. If it's about art, teach the technique. If it's about maths, explain the concepts. Make every parent an instant expert.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const activities = await sql`
    SELECT id, title, slug, description, category, instructions,
           learning_outcomes, materials, age_min, age_max, location
    FROM activities
    WHERE published = true AND parent_guide IS NULL
    ORDER BY title
  `;

  console.log(`Found ${activities.length} activities needing parent guides\n`);

  let success = 0;
  let failed = 0;

  for (const activity of activities) {
    try {
      process.stdout.write(`[${success + failed + 1}/${activities.length}] ${activity.title}... `);
      const guide = await generateGuide(activity);

      await sql`
        UPDATE activities
        SET parent_guide = ${JSON.stringify(guide)}::jsonb,
            updated_at = now()
        WHERE id = ${activity.id}
      `;

      console.log(`done (${guide.knowledge.length} topics)`);
      success++;

      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
      // Longer delay after failure (likely rate limit)
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\nComplete: ${success} success, ${failed} failed`);
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
