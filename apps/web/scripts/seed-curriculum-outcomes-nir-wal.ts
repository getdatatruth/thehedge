/**
 * Seed Northern Ireland (CCEA) and Wales (Curriculum for Wales) outcomes into
 * curriculum_outcomes. Faithful paraphrases with The Hedge's own codes - honest
 * maps, not official wording. Area names match the NIR/WAL frameworks so they
 * project to canonical dimensions. No Tusla/Aistear/NCCA/National Curriculum.
 *
 * Idempotent. Run: npx tsx scripts/seed-curriculum-outcomes-nir-wal.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface Outcome { country: string; curriculum_area: string; stage: string; strand: string; outcome_code: string; outcome_text: string; }
const O = (country: string) => (curriculum_area: string, stage: string, strand: string, outcome_code: string, outcome_text: string): Outcome =>
  ({ country, curriculum_area, stage, strand, outcome_code, outcome_text });

const N = O('NIR');
const NIR: Outcome[] = [
  N('Language and Literacy', 'foundation', 'Talking and listening', 'NLL-F-01', 'Listens to stories and talks about experiences with growing confidence.'),
  N('Language and Literacy', 'ks1', 'Reading and writing', 'NLL-1-01', 'Reads familiar texts and writes for simple purposes.'),
  N('Language and Literacy', 'ks2', 'Reading and writing', 'NLL-2-01', 'Reads a range of texts for meaning and writes clearly for a purpose.'),
  N('Mathematics and Numeracy', 'foundation', 'Number', 'NMN-F-01', 'Counts, sorts and compares quantities through play.'),
  N('Mathematics and Numeracy', 'ks1', 'Number and measures', 'NMN-1-01', 'Adds, subtracts and measures in everyday contexts.'),
  N('Mathematics and Numeracy', 'ks2', 'Number, shape and data', 'NMN-2-01', 'Solves problems with number, shape, measures and data.'),
  N('The Arts', 'foundation', 'Art, music, drama', 'NAR-F-01', 'Explores colour, sound and role-play and shares creations.'),
  N('The Arts', 'ks1', 'Creating and performing', 'NAR-1-01', 'Uses materials, music and movement to express ideas.'),
  N('The Arts', 'ks2', 'Developing skills', 'NAR-2-01', 'Develops skill in an art form and shares finished work.'),
  N('The World Around Us', 'foundation', 'Exploring', 'NWA-F-01', 'Notices and explores the natural and built world around them.'),
  N('The World Around Us', 'ks1', 'Place, movement, change', 'NWA-1-01', 'Explores living things, places and how things change over time.'),
  N('The World Around Us', 'ks2', 'Interdependence', 'NWA-2-01', 'Investigates the world, asking questions and using evidence.'),
  N('Personal Development and Mutual Understanding', 'ks1', 'Self and others', 'NPD-1-01', 'Talks about feelings and builds caring, respectful relationships.'),
  N('Personal Development and Mutual Understanding', 'ks2', 'Wellbeing and community', 'NPD-2-01', 'Understands wellbeing, responsibility and living together well.'),
  N('Physical Education', 'foundation', 'Movement', 'NPE-F-01', 'Moves with growing control and enjoys being active.'),
  N('Physical Education', 'ks2', 'Games and health', 'NPE-2-01', 'Develops games and athletic skills and understands healthy activity.'),
  N('Religious Education', 'ks2', 'Beliefs and values', 'NRE-2-01', 'Explores beliefs and values and what it means to live by them.'),
];

const W = O('WAL');
const WAL: Outcome[] = [
  W('Languages, Literacy and Communication', 'ps5', 'Communication', 'WLL-5-01', 'Enjoys stories and talk and begins to read and write simple words.'),
  W('Languages, Literacy and Communication', 'ps8', 'Reading and writing', 'WLL-8-01', 'Reads for meaning and writes for different purposes.'),
  W('Languages, Literacy and Communication', 'ps11', 'Reading and writing', 'WLL-11-01', 'Reads and writes a range of texts with growing skill and care.'),
  W('Mathematics and Numeracy', 'ps5', 'Number', 'WMN-5-01', 'Counts, compares and explores number through play.'),
  W('Mathematics and Numeracy', 'ps8', 'Number and measure', 'WMN-8-01', 'Calculates and uses measure, money and time in real contexts.'),
  W('Mathematics and Numeracy', 'ps11', 'Number and data', 'WMN-11-01', 'Solves problems with fractions, measure and data.'),
  W('Science and Technology', 'ps5', 'Exploring', 'WST-5-01', 'Explores materials, living things and simple making.'),
  W('Science and Technology', 'ps8', 'Investigating and designing', 'WST-8-01', 'Investigates the world and designs and makes simple products.'),
  W('Science and Technology', 'ps11', 'Science and computing', 'WST-11-01', 'Plans investigations and uses digital tools safely and purposefully.'),
  W('Humanities', 'ps8', 'People and place', 'WHU-8-01', 'Explores the local area, the past and the wider world.'),
  W('Humanities', 'ps11', 'Enquiry', 'WHU-11-01', 'Uses sources and maps to enquire about people, places and the past.'),
  W('Health and Well-being', 'ps5', 'Wellbeing', 'WHW-5-01', 'Talks about feelings and makes healthy choices in daily life.'),
  W('Health and Well-being', 'ps8', 'Physical and emotional', 'WHW-8-01', 'Is active and develops self-awareness and caring relationships.'),
  W('Health and Well-being', 'ps11', 'Wellbeing', 'WHW-11-01', 'Manages feelings, stays healthy and knows where to seek support.'),
  W('Expressive Arts', 'ps5', 'Creating', 'WEA-5-01', 'Explores colour, sound and movement and shares creations.'),
  W('Expressive Arts', 'ps11', 'Performing and creating', 'WEA-11-01', 'Develops skill in an art form and shares finished work.'),
];

async function seed(country: string, rows: Outcome[]) {
  const { error: delErr } = await supabase.from('curriculum_outcomes').delete().eq('country', country);
  if (delErr) { console.error(`delete ${country} error:`, delErr.message); process.exit(1); }
  const { error, count } = await supabase.from('curriculum_outcomes').insert(rows, { count: 'exact' });
  if (error) { console.error(`insert ${country} error:`, error.message); process.exit(1); }
  console.log(`${country}: inserted ${count ?? rows.length} outcomes`);
}

async function main() {
  console.log('Seeding Northern Ireland (CCEA) and Wales (Curriculum for Wales)...');
  await seed('NIR', NIR);
  await seed('WAL', WAL);
  console.log('Done.');
}
main().catch((e) => { console.error(e); process.exit(1); });
