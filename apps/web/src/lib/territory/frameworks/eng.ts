import type { Framework } from '../types';

// ─── England framework ──────────────────────────────────────────────────────
// The National Curriculum, by Key Stage. CRITICAL: home-educating families in
// England are NOT required to follow the National Curriculum or replicate
// school - the legal test is a "suitable and efficient" education. So the
// curriculum here is a reassurance/evidence MAP, never a mandate (brief §7).
// No Tusla / AEARS / Aistear vocabulary anywhere in this territory.
//
// Stage age-ranges overlap at the boundaries (EYFS 0-5, KS1 5-7, KS2 7-11) so a
// child on a boundary draws on both. `stage` keys match curriculum_outcomes.stage
// for country='ENG'.

export const ENG_FRAMEWORK: Framework = {
  territory: 'ENG',
  name: 'the National Curriculum',
  officialBody: 'Department for Education',
  outcomesCountry: 'ENG',

  stages: [
    { key: 'eyfs', name: 'Early Years (EYFS)', ageMin: 0, ageMax: 5, order: 1 },
    { key: 'ks1', name: 'Key Stage 1', ageMin: 5, ageMax: 7, order: 2 },
    { key: 'ks2', name: 'Key Stage 2', ageMin: 7, ageMax: 11, order: 3 },
  ],

  areas: [
    { key: 'English', name: 'English', canonical: ['literacy_language'] },
    { key: 'Mathematics', name: 'Mathematics', canonical: ['numeracy_maths'] },
    { key: 'Science', name: 'Science', canonical: ['science_natural_world'] },
    { key: 'History', name: 'History', canonical: ['humanities_environment'] },
    { key: 'Geography', name: 'Geography', canonical: ['humanities_environment', 'science_natural_world'] },
    { key: 'Art and design', name: 'Art and design', canonical: ['arts_creativity'] },
    { key: 'Music', name: 'Music', canonical: ['arts_creativity'] },
    { key: 'Design and technology', name: 'Design and technology', canonical: ['technology_digital', 'arts_creativity'] },
    { key: 'Computing', name: 'Computing', canonical: ['technology_digital'] },
    { key: 'Physical education', name: 'Physical education', canonical: ['physical_wellbeing'] },
    { key: 'PSHE', name: 'PSHE and wellbeing', canonical: ['social_personal_moral', 'physical_wellbeing'] },
    { key: 'Languages', name: 'Languages', canonical: ['literacy_language'], crossCutting: false },
    { key: 'Religious education', name: 'Religious education', canonical: ['social_personal_moral', 'humanities_environment'] },
  ],

  terminology: {
    curriculum: 'the National Curriculum',
    areasWord: 'subjects',
    stageWord: 'Key Stage',
    assessmentWord: null,
    evidenceWord: 'records',
    voice:
      'Warm, plain British English. No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.',
    regulatoryNote:
      'Home education in England does not require following the National Curriculum or replicating school. The legal test is simply that the education is suitable and efficient for the child. Treat the curriculum as a helpful map for your own records, never a requirement, and never invent rules or thresholds.',
  },

  compliance: {
    framing: 'compliance_soft',
    hasRegister: true,
    registerName: 'the Children Not in School register',
    administeredBy: 'your local authority',
    lastReviewed: '2026-06-30',
    summary:
      'In England you are free to home-educate without following the National Curriculum. The only legal test is that the education is suitable and efficient for your child. The Children\'s Wellbeing and Schools Act 2026 introduces a Children Not in School register held by local authorities; the home-education provisions are not yet in force (expected from 2027). When they commence, families will be asked to give their local authority some information and to keep it up to date. The Hedge helps you keep a calm record of the broad, suitable education your child is getting - entirely for your own peace of mind and to have ready if your local authority ever asks.',
    facts: [
      { label: 'Required curriculum', value: 'None - the National Curriculum is optional for home educators', status: 'confirmed' },
      { label: 'Legal test', value: 'A "suitable and efficient" education for the child\'s age, ability and aptitude', status: 'confirmed' },
      { label: 'Children Not in School register', value: 'Statutory under the Children\'s Wellbeing and Schools Act 2026; home-ed provisions not yet commenced (expected from 2027)', status: 'expected' },
      { label: 'Information to your local authority', value: 'Expected within 15 days of becoming eligible and of relevant changes', status: 'expected' },
      { label: 'If information is incomplete', value: 'The local authority may issue a notice (around 10 days) to show the education is suitable', status: 'expected' },
    ],
    // ENG-specific terms that must not leak into other territories' copy.
    exclusiveTerms: ['Children Not in School', 'CNIS', 'local authority', 'Key Stage', 'suitable and efficient'],
  },
};
