/**
 * Seed England (National Curriculum) outcomes into curriculum_outcomes with
 * country='ENG'. Outcomes are FAITHFUL PARAPHRASES of the statutory programmes
 * of study (EYFS / KS1 / KS2), with The Hedge's own codes - they are an honest
 * evidence map, NOT the official DfE wording and not presented as official.
 * Areas use National Curriculum subject names so they project to canonical
 * dimensions via the ENG framework. No Tusla/AEARS/Aistear vocabulary.
 *
 * Idempotent: clears existing ENG rows, then inserts. Run:
 *   npx tsx scripts/seed-curriculum-outcomes-eng.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface Outcome {
  country: string;
  curriculum_area: string;
  stage: string;
  strand: string;
  outcome_code: string;
  outcome_text: string;
}

const E = (curriculum_area: string, stage: string, strand: string, outcome_code: string, outcome_text: string): Outcome =>
  ({ country: 'ENG', curriculum_area, stage, strand, outcome_code, outcome_text });

const OUTCOMES: Outcome[] = [
  // ── English ──────────────────────────────────────────────
  E('English', 'eyfs', 'Communication and language', 'EN-EYFS-01', 'Listens to and talks about stories, building familiarity and understanding.'),
  E('English', 'eyfs', 'Early reading', 'EN-EYFS-02', 'Hears and says the sounds in simple words and begins to blend them to read.'),
  E('English', 'eyfs', 'Early writing', 'EN-EYFS-03', 'Forms recognisable letters and writes simple words and labels.'),
  E('English', 'eyfs', 'Vocabulary', 'EN-EYFS-04', 'Uses new vocabulary through the day and in different contexts.'),
  E('English', 'ks1', 'Reading - word reading', 'EN-KS1-01', 'Applies phonic knowledge to decode words and reads common exception words.'),
  E('English', 'ks1', 'Reading - comprehension', 'EN-KS1-02', 'Talks about events, characters and meaning in a range of stories and poems.'),
  E('English', 'ks1', 'Writing - transcription', 'EN-KS1-03', 'Spells common words and forms letters correctly with growing accuracy.'),
  E('English', 'ks1', 'Writing - composition', 'EN-KS1-04', 'Writes sentences to narrate or inform, and rereads to check they make sense.'),
  E('English', 'ks1', 'Spoken language', 'EN-KS1-05', 'Asks and answers questions and takes turns in conversation.'),
  E('English', 'ks2', 'Reading - comprehension', 'EN-KS2-01', 'Reads a range of fiction and non-fiction and draws inferences with evidence.'),
  E('English', 'ks2', 'Writing - composition', 'EN-KS2-02', 'Plans, drafts and edits writing for a clear purpose and audience.'),
  E('English', 'ks2', 'Grammar and punctuation', 'EN-KS2-03', 'Uses a widening range of punctuation and sentence structures accurately.'),
  E('English', 'ks2', 'Spelling and vocabulary', 'EN-KS2-04', 'Spells more complex words and chooses precise, varied vocabulary.'),
  E('English', 'ks2', 'Spoken language', 'EN-KS2-05', 'Explains ideas and reasons clearly, and listens and responds to others.'),

  // ── Mathematics ──────────────────────────────────────────
  E('Mathematics', 'eyfs', 'Number', 'MA-EYFS-01', 'Counts confidently and develops a deep understanding of numbers to ten.'),
  E('Mathematics', 'eyfs', 'Numerical patterns', 'MA-EYFS-02', 'Compares quantities and recognises patterns, including odd and even.'),
  E('Mathematics', 'eyfs', 'Shape and space', 'MA-EYFS-03', 'Explores shapes and spatial reasoning through play and building.'),
  E('Mathematics', 'ks1', 'Number and place value', 'MA-KS1-01', 'Counts, reads, writes and orders numbers and understands place value.'),
  E('Mathematics', 'ks1', 'Addition and subtraction', 'MA-KS1-02', 'Adds and subtracts within 100 and solves simple problems.'),
  E('Mathematics', 'ks1', 'Multiplication and division', 'MA-KS1-03', 'Begins to use grouping and sharing and simple multiplication facts.'),
  E('Mathematics', 'ks1', 'Measurement', 'MA-KS1-04', 'Measures and compares length, mass, capacity, time and money.'),
  E('Mathematics', 'ks1', 'Geometry', 'MA-KS1-05', 'Recognises and describes common 2-D and 3-D shapes and their properties.'),
  E('Mathematics', 'ks2', 'Number and place value', 'MA-KS2-01', 'Works with larger numbers, negative numbers and rounding.'),
  E('Mathematics', 'ks2', 'Calculation', 'MA-KS2-02', 'Uses efficient written and mental methods for all four operations.'),
  E('Mathematics', 'ks2', 'Fractions, decimals and percentages', 'MA-KS2-03', 'Understands and calculates with fractions, decimals and percentages.'),
  E('Mathematics', 'ks2', 'Measurement and geometry', 'MA-KS2-04', 'Solves problems involving measure, area, angles and coordinates.'),
  E('Mathematics', 'ks2', 'Statistics', 'MA-KS2-05', 'Reads, interprets and presents data in tables and graphs.'),

  // ── Science ──────────────────────────────────────────────
  E('Science', 'eyfs', 'Understanding the world', 'SC-EYFS-01', 'Explores the natural world, observing and talking about what they notice.'),
  E('Science', 'eyfs', 'Living things', 'SC-EYFS-02', 'Notices similarities, differences and changes in plants, animals and seasons.'),
  E('Science', 'ks1', 'Plants and animals', 'SC-KS1-01', 'Identifies and describes common plants, animals and their basic needs.'),
  E('Science', 'ks1', 'Everyday materials', 'SC-KS1-02', 'Names and compares everyday materials and their simple properties.'),
  E('Science', 'ks1', 'Seasonal change', 'SC-KS1-03', 'Observes and describes weather and seasonal change across the year.'),
  E('Science', 'ks1', 'Working scientifically', 'SC-KS1-04', 'Asks simple questions and observes closely to find things out.'),
  E('Science', 'ks2', 'Living things and habitats', 'SC-KS2-01', 'Groups living things and explains how they suit their habitats.'),
  E('Science', 'ks2', 'States and materials', 'SC-KS2-02', 'Investigates states of matter, changes and properties of materials.'),
  E('Science', 'ks2', 'Forces and energy', 'SC-KS2-03', 'Explores forces, magnets, light, sound and simple electrical circuits.'),
  E('Science', 'ks2', 'Earth and space', 'SC-KS2-04', 'Describes the Earth, Moon and Sun and day and night.'),
  E('Science', 'ks2', 'Working scientifically', 'SC-KS2-05', 'Plans fair tests, takes measurements and draws conclusions from results.'),

  // ── History ──────────────────────────────────────────────
  E('History', 'ks1', 'Changes in living memory', 'HI-KS1-01', 'Talks about changes within and beyond living memory and why they matter.'),
  E('History', 'ks1', 'Significant people and events', 'HI-KS1-02', 'Learns about significant people, places and events in the past.'),
  E('History', 'ks2', 'Chronology', 'HI-KS2-01', 'Places periods and events on a timeline and uses dates and terms.'),
  E('History', 'ks2', 'Historical enquiry', 'HI-KS2-02', 'Asks questions and uses sources to find out about the past.'),
  E('History', 'ks2', 'Britain and the wider world', 'HI-KS2-03', 'Studies aspects of British, local and ancient world history.'),

  // ── Geography ────────────────────────────────────────────
  E('Geography', 'ks1', 'Place knowledge', 'GE-KS1-01', 'Describes their local area and compares it with a contrasting place.'),
  E('Geography', 'ks1', 'Geographical skills', 'GE-KS1-02', 'Uses maps, simple directions and fieldwork around the local area.'),
  E('Geography', 'ks2', 'Locational knowledge', 'GE-KS2-01', 'Locates countries, cities and key physical and human features on maps.'),
  E('Geography', 'ks2', 'Human and physical geography', 'GE-KS2-02', 'Explains physical and human features such as rivers, weather and settlements.'),
  E('Geography', 'ks2', 'Fieldwork and maps', 'GE-KS2-03', 'Gathers and presents geographical information through fieldwork and maps.'),

  // ── Art and design ───────────────────────────────────────
  E('Art and design', 'eyfs', 'Creating with materials', 'AR-EYFS-01', 'Explores colour, texture and form and makes and talks about their own art.'),
  E('Art and design', 'ks1', 'Making and techniques', 'AR-KS1-01', 'Uses drawing, painting and sculpture to share ideas and experiences.'),
  E('Art and design', 'ks1', 'Artists and craft', 'AR-KS1-02', 'Looks at the work of artists and makers and describes what they notice.'),
  E('Art and design', 'ks2', 'Developing techniques', 'AR-KS2-01', 'Develops skill and control in a range of materials and a sketchbook.'),
  E('Art and design', 'ks2', 'Knowledge of art', 'AR-KS2-02', 'Learns about great artists and movements and takes inspiration from them.'),

  // ── Music ────────────────────────────────────────────────
  E('Music', 'ks1', 'Performing', 'MU-KS1-01', 'Sings songs and plays simple tuned and untuned instruments.'),
  E('Music', 'ks1', 'Listening', 'MU-KS1-02', 'Listens to and responds to a range of music with attention.'),
  E('Music', 'ks2', 'Performing and composing', 'MU-KS2-01', 'Plays, improvises and composes music with increasing control.'),
  E('Music', 'ks2', 'Musical understanding', 'MU-KS2-02', 'Uses and understands the basics of staff and other notation.'),

  // ── Design and technology ────────────────────────────────
  E('Design and technology', 'ks1', 'Design and make', 'DT-KS1-01', 'Designs and makes simple products for a purpose using a range of materials.'),
  E('Design and technology', 'ks1', 'Cooking and nutrition', 'DT-KS1-02', 'Prepares simple, healthy food and learns where food comes from.'),
  E('Design and technology', 'ks2', 'Design, make, evaluate', 'DT-KS2-01', 'Designs, makes and evaluates functional products against a brief.'),
  E('Design and technology', 'ks2', 'Cooking and nutrition', 'DT-KS2-02', 'Prepares a range of dishes and understands a healthy, varied diet.'),

  // ── Computing ────────────────────────────────────────────
  E('Computing', 'ks1', 'Algorithms', 'CO-KS1-01', 'Understands that programs follow precise, step-by-step instructions.'),
  E('Computing', 'ks1', 'Using technology safely', 'CO-KS1-02', 'Uses technology purposefully and knows how to stay safe online.'),
  E('Computing', 'ks2', 'Programming', 'CO-KS2-01', 'Writes and debugs simple programs using sequence, selection and repetition.'),
  E('Computing', 'ks2', 'Online safety and information', 'CO-KS2-02', 'Uses the internet responsibly and evaluates digital content critically.'),

  // ── Physical education ───────────────────────────────────
  E('Physical education', 'eyfs', 'Moving and handling', 'PE-EYFS-01', 'Moves with growing control, coordination and confidence.'),
  E('Physical education', 'ks1', 'Fundamental movement', 'PE-KS1-01', 'Develops running, jumping, throwing, catching and balance.'),
  E('Physical education', 'ks1', 'Games and dance', 'PE-KS1-02', 'Takes part in simple games and movement and dance activities.'),
  E('Physical education', 'ks2', 'Games and athletics', 'PE-KS2-01', 'Plays competitive and team games and develops athletic skills.'),
  E('Physical education', 'ks2', 'Healthy active life', 'PE-KS2-02', 'Understands how exercise and activity support a healthy life.'),

  // ── PSHE and wellbeing ───────────────────────────────────
  E('PSHE', 'eyfs', 'Self-regulation', 'PS-EYFS-01', 'Manages feelings and behaviour and shows care for themselves and others.'),
  E('PSHE', 'eyfs', 'Relationships', 'PS-EYFS-02', 'Plays and works alongside others, sharing and taking turns.'),
  E('PSHE', 'ks1', 'Health and wellbeing', 'PS-KS1-01', 'Talks about feelings, healthy choices and keeping safe.'),
  E('PSHE', 'ks1', 'Relationships', 'PS-KS1-02', 'Builds kind, respectful relationships and recognises others\' feelings.'),
  E('PSHE', 'ks2', 'Health and wellbeing', 'PS-KS2-01', 'Understands physical and emotional health and how to seek help.'),
  E('PSHE', 'ks2', 'Living in the wider world', 'PS-KS2-02', 'Explores responsibility, community and managing money and choices.'),
];

async function main() {
  console.log(`Seeding ${OUTCOMES.length} England (National Curriculum) outcomes...`);
  const { error: delErr } = await supabase.from('curriculum_outcomes').delete().eq('country', 'ENG');
  if (delErr) { console.error('delete ENG error:', delErr.message); process.exit(1); }

  const { error: insErr, count } = await supabase
    .from('curriculum_outcomes')
    .insert(OUTCOMES, { count: 'exact' });
  if (insErr) { console.error('insert error:', insErr.message); process.exit(1); }

  console.log(`Inserted ${count ?? OUTCOMES.length} ENG outcomes.`);
  const byStage: Record<string, number> = {};
  for (const o of OUTCOMES) byStage[o.stage] = (byStage[o.stage] || 0) + 1;
  console.log('By stage:', byStage);
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
