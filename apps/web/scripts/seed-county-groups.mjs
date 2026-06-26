/**
 * Seed one community_group per Irish county ("The Townland" - local-first community).
 *
 * These are REAL, NEW, EMPTY groups that families can join. We do NOT fabricate
 * member counts or posts. member_count starts at 0 and the UI shows "New group".
 *
 * Idempotent: skips any county that already has a group of type 'county'.
 *
 * Run: node scripts/seed-county-groups.mjs
 *
 * Reads DATABASE_URL from .env.local (a direct Postgres connection bypasses RLS,
 * which is what we need for seeding).
 */
import { config } from 'dotenv';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

// The 32 counties of Ireland, canonical casing. Names mirror the keys in
// src/lib/ie-counties.ts (Derry and Londonderry share coords; we seed a single
// "Derry" group to avoid a duplicate).
const COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork',
  'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway',
  'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
  'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
  'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford',
  'Westmeath', 'Wexford', 'Wicklow',
];

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  let created = 0;
  let skipped = 0;

  for (const county of COUNTIES) {
    // Idempotency check: a 'county' type group already present for this county?
    const existing = await sql`
      select id from community_groups
      where type = 'county' and lower(county) = ${county.toLowerCase()}
      limit 1
    `;

    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    await sql`
      insert into community_groups (name, county, type, member_count)
      values (${`${county} Home Educators`}, ${county}, 'county', 0)
    `;
    created += 1;
    console.log(`  + Created ${county} Home Educators`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (already present).`);
  await sql.end();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await sql.end();
  process.exit(1);
});
