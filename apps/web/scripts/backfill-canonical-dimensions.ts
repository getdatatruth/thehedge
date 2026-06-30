/**
 * Backfill canonical_dimensions for existing Ireland data so old activities and
 * portfolio evidence stay valid under the territory-aware engine (brief §4.4).
 *
 *  - activities: derived from the activity category (territory-neutral).
 *  - portfolio_entries: derived from the recorded curriculum_areas via the IE
 *    framework's area -> canonical mapping.
 *
 * Idempotent: only fills rows whose canonical_dimensions is still null.
 * Run: npx tsx scripts/backfill-canonical-dimensions.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { CATEGORY_TO_CANONICAL, canonicalForCategory } from '../src/lib/territory/canonical';
import { canonicalForAreas } from '../src/lib/territory';
import { IE_FRAMEWORK } from '../src/lib/territory/frameworks/ie';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function backfillActivities() {
  let total = 0;
  // One bulk update per category (only ten categories).
  for (const category of Object.keys(CATEGORY_TO_CANONICAL)) {
    const dims = canonicalForCategory(category);
    if (!dims.length) continue;
    const { data, error } = await supabase
      .from('activities')
      .update({ canonical_dimensions: dims })
      .eq('category', category)
      .is('canonical_dimensions', null)
      .select('id');
    if (error) {
      console.error(`  activities[${category}] error:`, error.message);
      continue;
    }
    const n = data?.length ?? 0;
    total += n;
    console.log(`  activities ${category}: ${n} -> [${dims.join(', ')}]`);
  }
  console.log(`activities backfilled: ${total}`);
}

async function backfillPortfolio() {
  const { data: rows, error } = await supabase
    .from('portfolio_entries')
    .select('id, curriculum_areas')
    .is('canonical_dimensions', null);
  if (error) {
    console.error('portfolio fetch error:', error.message);
    return;
  }
  let filled = 0;
  for (const row of rows || []) {
    const areas = (row.curriculum_areas as string[] | null) || [];
    const dims = canonicalForAreas(IE_FRAMEWORK, areas);
    if (!dims.length) continue; // leave null when nothing maps (safe)
    const { error: upErr } = await supabase
      .from('portfolio_entries')
      .update({ canonical_dimensions: dims })
      .eq('id', row.id);
    if (upErr) {
      console.error(`  portfolio ${row.id} error:`, upErr.message);
      continue;
    }
    filled++;
  }
  console.log(`portfolio entries backfilled: ${filled} / ${(rows || []).length} scanned`);
}

async function main() {
  console.log('Backfilling canonical_dimensions (IE)...');
  await backfillActivities();
  await backfillPortfolio();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
