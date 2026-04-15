/**
 * Batch Activity Generation Script
 *
 * Run via: npx tsx scripts/generate-batch.ts
 *
 * Generates ~500 activities across targeted gaps:
 * - 80 baby (0-1) activities
 * - 100 toddler (1-3) activities
 * - 150 active/high-energy activities across all ages
 * - 100 seasonal activities (25 per season)
 * - 70 messy/sensory activities
 *
 * Each batch generates 10 activities via the local API.
 * Activities are created as drafts (unpublished) - review and publish from admin.
 */

const API_BASE = 'http://localhost:3000/api/cron/generate-activities';

// We'll call the cron endpoint which doesn't require auth (or set CRON_SECRET)
// For targeted generation, we'll use the admin endpoint with auth

interface BatchConfig {
  label: string;
  count: number;
  batchSize: number;
  focusCategory?: string;
  focusAgeRange?: { min: number; max: number };
  focusEnergy?: string;
  focusSeason?: string;
}

const BATCHES: BatchConfig[] = [
  // Baby activities (0-1) - 8 batches of 10
  { label: 'Baby sensory (0-1)', count: 20, batchSize: 10, focusAgeRange: { min: 0, max: 1 } },
  { label: 'Baby nature (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 1 }, focusCategory: 'nature' },
  { label: 'Baby calm (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 1 }, focusCategory: 'calm' },
  { label: 'Baby movement (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 1 }, focusCategory: 'movement' },
  { label: 'Baby social (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 1 }, focusCategory: 'social' },
  { label: 'Baby music (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 2 }, focusCategory: 'art' },
  { label: 'Baby kitchen (0-1)', count: 10, batchSize: 10, focusAgeRange: { min: 0, max: 2 }, focusCategory: 'kitchen' },

  // Toddler activities (1-3) - 10 batches of 10
  { label: 'Toddler active (1-3)', count: 20, batchSize: 10, focusAgeRange: { min: 1, max: 3 }, focusEnergy: 'active' },
  { label: 'Toddler sensory (1-3)', count: 20, batchSize: 10, focusAgeRange: { min: 1, max: 3 }, focusCategory: 'science' },
  { label: 'Toddler nature (1-3)', count: 20, batchSize: 10, focusAgeRange: { min: 1, max: 3 }, focusCategory: 'nature' },
  { label: 'Toddler art (1-3)', count: 20, batchSize: 10, focusAgeRange: { min: 1, max: 3 }, focusCategory: 'art' },
  { label: 'Toddler kitchen (1-3)', count: 20, batchSize: 10, focusAgeRange: { min: 1, max: 3 }, focusCategory: 'kitchen' },

  // Active/high-energy across all ages - 15 batches of 10
  { label: 'Active nature (3-8)', count: 30, batchSize: 10, focusEnergy: 'active', focusCategory: 'nature' },
  { label: 'Active movement (3-8)', count: 30, batchSize: 10, focusEnergy: 'active', focusCategory: 'movement' },
  { label: 'Active social (3-10)', count: 30, batchSize: 10, focusEnergy: 'active', focusCategory: 'social' },
  { label: 'Active science (3-10)', count: 30, batchSize: 10, focusEnergy: 'active', focusCategory: 'science' },
  { label: 'Active life skills (3-10)', count: 30, batchSize: 10, focusEnergy: 'active', focusCategory: 'life_skills' },

  // Seasonal activities - 25 per season
  { label: 'Spring activities', count: 30, batchSize: 10, focusSeason: 'spring' },
  { label: 'Summer activities', count: 30, batchSize: 10, focusSeason: 'summer' },
  { label: 'Autumn activities', count: 30, batchSize: 10, focusSeason: 'autumn' },
  { label: 'Winter activities', count: 30, batchSize: 10, focusSeason: 'winter' },

  // Messy/sensory play
  { label: 'Messy art (2-6)', count: 20, batchSize: 10, focusCategory: 'art', focusAgeRange: { min: 2, max: 6 } },
  { label: 'Messy science (2-8)', count: 20, batchSize: 10, focusCategory: 'science', focusAgeRange: { min: 2, max: 8 } },
  { label: 'Messy kitchen (2-8)', count: 20, batchSize: 10, focusCategory: 'kitchen', focusAgeRange: { min: 2, max: 8 } },
];

async function runBatch(config: BatchConfig): Promise<{ generated: number; errors: number }> {
  let totalGenerated = 0;
  let totalErrors = 0;
  const numBatches = Math.ceil(config.count / config.batchSize);

  for (let i = 0; i < numBatches; i++) {
    const size = Math.min(config.batchSize, config.count - totalGenerated);
    try {
      // Use the cron endpoint (simpler, no auth needed locally)
      // The generation function now accepts options
      const res = await fetch(`http://localhost:3000/api/admin/generate-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: size,
          focusCategory: config.focusCategory,
          focusAgeRange: config.focusAgeRange,
          focusEnergy: config.focusEnergy,
          focusSeason: config.focusSeason,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`  Batch ${i + 1} failed: ${res.status} ${text.substring(0, 100)}`);
        totalErrors++;
        continue;
      }

      const data = await res.json();
      totalGenerated += data.generated || 0;
      if (data.errors?.length) {
        totalErrors += data.errors.length;
      }
      console.log(`  Batch ${i + 1}/${numBatches}: +${data.generated || 0} activities`);

      // Rate limit - wait between batches to not overwhelm Claude API
      if (i < numBatches - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error(`  Batch ${i + 1} error:`, err);
      totalErrors++;
    }
  }

  return { generated: totalGenerated, errors: totalErrors };
}

async function main() {
  console.log('=== The Hedge Activity Generation ===\n');
  console.log(`Planning ${BATCHES.length} batch groups, ~${BATCHES.reduce((s, b) => s + b.count, 0)} total activities\n`);

  let grandTotal = 0;
  let grandErrors = 0;

  for (const batch of BATCHES) {
    console.log(`\n[${batch.label}] Target: ${batch.count} activities`);
    const result = await runBatch(batch);
    grandTotal += result.generated;
    grandErrors += result.errors;
    console.log(`  Result: ${result.generated} generated, ${result.errors} errors`);

    // Pause between batch groups
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n=== COMPLETE ===');
  console.log(`Total generated: ${grandTotal}`);
  console.log(`Total errors: ${grandErrors}`);
  console.log('\nActivities created as UNPUBLISHED drafts.');
  console.log('Go to /admin/activities to review and publish them.');
}

main().catch(console.error);
