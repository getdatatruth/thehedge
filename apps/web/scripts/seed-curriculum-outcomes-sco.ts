/**
 * Seed Scotland (Curriculum for Excellence) outcomes into curriculum_outcomes
 * with country='SCO'. Faithful paraphrases of CfE experiences and outcomes
 * (Early / First / Second level), with The Hedge's own codes - an honest map,
 * not the official Education Scotland wording. Area names match the SCO
 * framework so they project to canonical dimensions. No Tusla/Aistear/NCCA.
 *
 * Idempotent. Run: npx tsx scripts/seed-curriculum-outcomes-sco.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface Outcome { country: string; curriculum_area: string; stage: string; strand: string; outcome_code: string; outcome_text: string; }
const E = (curriculum_area: string, stage: string, strand: string, outcome_code: string, outcome_text: string): Outcome =>
  ({ country: 'SCO', curriculum_area, stage, strand, outcome_code, outcome_text });

const OUTCOMES: Outcome[] = [
  // Languages (literacy across learning)
  E('Languages', 'early', 'Listening and talking', 'LA-E-01', 'Enjoys stories, songs and rhymes and takes turns to talk and listen.'),
  E('Languages', 'early', 'Early reading', 'LA-E-02', 'Recognises some letters and sounds and shows an interest in print.'),
  E('Languages', 'first', 'Reading', 'LA-F-01', 'Reads familiar texts with growing fluency and talks about them.'),
  E('Languages', 'first', 'Writing', 'LA-F-02', 'Writes for different purposes, sharing ideas and information.'),
  E('Languages', 'second', 'Reading', 'LA-S-01', 'Reads a range of texts and finds and uses information from them.'),
  E('Languages', 'second', 'Talking and listening', 'LA-S-02', 'Shares and explains ideas clearly and listens and responds to others.'),
  // Mathematics (numeracy across learning)
  E('Mathematics', 'early', 'Number', 'MA-E-01', 'Counts, compares and shares small quantities through play.'),
  E('Mathematics', 'first', 'Number, money and measure', 'MA-F-01', 'Adds, subtracts and uses money, time and measure in real contexts.'),
  E('Mathematics', 'first', 'Shape, position and movement', 'MA-F-02', 'Describes and sorts 2-D shapes and 3-D objects and gives directions.'),
  E('Mathematics', 'second', 'Number, money and measure', 'MA-S-01', 'Works with fractions, decimals and measurement to solve problems.'),
  E('Mathematics', 'second', 'Information handling', 'MA-S-02', 'Collects, organises and interprets data and discusses what it shows.'),
  // Health and wellbeing (responsibility of all)
  E('Health and wellbeing', 'early', 'Wellbeing', 'HW-E-01', 'Talks about feelings and makes healthy choices in daily routines.'),
  E('Health and wellbeing', 'first', 'Physical wellbeing', 'HW-F-01', 'Is active, develops movement skills and understands healthy living.'),
  E('Health and wellbeing', 'first', 'Relationships', 'HW-F-02', 'Builds friendships and shows respect and care for others.'),
  E('Health and wellbeing', 'second', 'Mental and emotional wellbeing', 'HW-S-01', 'Recognises and manages feelings and knows where to seek support.'),
  // Sciences
  E('Sciences', 'early', 'Exploring the world', 'SC-E-01', 'Explores living things, materials and forces through curiosity and play.'),
  E('Sciences', 'first', 'Planet Earth', 'SC-F-01', 'Investigates plants, animals, materials and weather in the local world.'),
  E('Sciences', 'second', 'Forces, electricity and waves', 'SC-S-01', 'Explores forces, energy, light and sound through simple investigation.'),
  E('Sciences', 'second', 'Topical science', 'SC-S-02', 'Plans and carries out fair tests and draws conclusions from findings.'),
  // Social studies
  E('Social studies', 'early', 'People and place', 'SS-E-01', 'Notices people, places and events in their own life and community.'),
  E('Social studies', 'first', 'People, past events', 'SS-F-01', 'Explores the past in their area and how life has changed over time.'),
  E('Social studies', 'second', 'People, place and environment', 'SS-S-01', 'Uses maps and sources to learn about places, people and the environment.'),
  // Expressive arts
  E('Expressive arts', 'early', 'Art and music', 'EA-E-01', 'Explores colour, sound and movement and shares their own creations.'),
  E('Expressive arts', 'first', 'Visual art and music', 'EA-F-01', 'Uses materials, instruments and movement to express ideas and feelings.'),
  E('Expressive arts', 'second', 'Performing and creating', 'EA-S-01', 'Develops skill in art, music, drama or dance and shares finished work.'),
  // Technologies
  E('Technologies', 'first', 'Making and digital', 'TE-F-01', 'Designs and makes simple products and uses digital tools safely.'),
  E('Technologies', 'second', 'Digital literacy and computing', 'TE-S-01', 'Uses technology purposefully, stays safe online and explores how it works.'),
  // Religious and moral education
  E('Religious and moral education', 'first', 'Beliefs and values', 'RM-F-01', 'Explores beliefs, values and what it means to be fair and kind.'),
  E('Religious and moral education', 'second', 'Beliefs and values', 'RM-S-01', 'Considers different beliefs and how people live by their values.'),
];

async function main() {
  console.log(`Seeding ${OUTCOMES.length} Scotland (CfE) outcomes...`);
  const { error: delErr } = await supabase.from('curriculum_outcomes').delete().eq('country', 'SCO');
  if (delErr) { console.error('delete SCO error:', delErr.message); process.exit(1); }
  const { error: insErr, count } = await supabase.from('curriculum_outcomes').insert(OUTCOMES, { count: 'exact' });
  if (insErr) { console.error('insert error:', insErr.message); process.exit(1); }
  const byStage: Record<string, number> = {};
  for (const o of OUTCOMES) byStage[o.stage] = (byStage[o.stage] || 0) + 1;
  console.log(`Inserted ${count ?? OUTCOMES.length} SCO outcomes. By stage:`, byStage);
}
main().catch((e) => { console.error(e); process.exit(1); });
