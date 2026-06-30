import type { Framework } from '../types';

// ─── Northern Ireland framework ─────────────────────────────────────────────
// The Northern Ireland Curriculum (CCEA). Value-add territory: oversight sits
// with the Education Authority and there is no register of the England kind, so
// framing leads with confidence and breadth. No Tusla/AEARS/Aistear/NCCA/
// National Curriculum vocabulary. Stage keys match curriculum_outcomes.stage
// for country='NIR'.

export const NIR_FRAMEWORK: Framework = {
  territory: 'NIR',
  name: 'the Northern Ireland Curriculum',
  officialBody: 'CCEA',
  outcomesCountry: 'NIR',

  stages: [
    { key: 'foundation', name: 'Foundation Stage', ageMin: 0, ageMax: 6, order: 1 },
    { key: 'ks1', name: 'Key Stage 1', ageMin: 6, ageMax: 8, order: 2 },
    { key: 'ks2', name: 'Key Stage 2', ageMin: 8, ageMax: 11, order: 3 },
  ],

  areas: [
    { key: 'Language and Literacy', name: 'Language and Literacy', canonical: ['literacy_language'] },
    { key: 'Mathematics and Numeracy', name: 'Mathematics and Numeracy', canonical: ['numeracy_maths'] },
    { key: 'The Arts', name: 'The Arts', canonical: ['arts_creativity'] },
    { key: 'The World Around Us', name: 'The World Around Us', canonical: ['science_natural_world', 'humanities_environment'] },
    { key: 'Personal Development and Mutual Understanding', name: 'Personal Development and Mutual Understanding', canonical: ['social_personal_moral', 'physical_wellbeing'] },
    { key: 'Physical Education', name: 'Physical Education', canonical: ['physical_wellbeing'] },
    { key: 'Religious Education', name: 'Religious Education', canonical: ['social_personal_moral', 'humanities_environment'] },
  ],

  terminology: {
    curriculum: 'the Northern Ireland Curriculum',
    areasWord: 'Areas of Learning',
    stageWord: 'Key Stage',
    assessmentWord: null,
    evidenceWord: 'portfolio',
    voice:
      'Warm, plain British English. No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.',
    regulatoryNote:
      'The Northern Ireland Curriculum is a familiar map, not a requirement for home educators. Use the Areas of Learning to show breadth for your own confidence, never as a checklist, and never invent rules or thresholds.',
  },

  compliance: {
    framing: 'value_add',
    hasRegister: false,
    registerName: null,
    administeredBy: 'the Education Authority',
    lastReviewed: '2026-06-30',
    summary:
      'In Northern Ireland the Education Authority must be satisfied that a home-educated child is receiving a suitable education, but there is no register of the kind being introduced in England and Wales. The Hedge keeps a confident record of the broad education your child is getting, mapped to the Northern Ireland Curriculum, for your own peace of mind and ready if the Education Authority ever asks.',
    facts: [
      { label: 'Register', value: 'None of the England/Wales kind', status: 'confirmed' },
      { label: 'Required curriculum', value: 'None - the Northern Ireland Curriculum is a guide, not a mandate for home educators', status: 'confirmed' },
      { label: 'Oversight', value: 'The Education Authority must be satisfied the education is suitable', status: 'confirmed' },
    ],
    exclusiveTerms: ['Areas of Learning', 'Education Authority', 'The World Around Us', 'Thinking Skills and Personal Capabilities', 'CCEA'],
  },
};
