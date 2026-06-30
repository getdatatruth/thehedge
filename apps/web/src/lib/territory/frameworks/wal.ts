import type { Framework } from '../types';

// ─── Wales framework ────────────────────────────────────────────────────────
// Curriculum for Wales (2022). Six Areas of Learning and Experience (AoLEs),
// with progression described against reference points at ages 5, 8, 11. Soft-
// compliance territory: the Children's Wellbeing and Schools Act 2026 extends to
// Wales, but the timing and detail are set by the Welsh Government and are not
// yet in force - so the compliance profile is versioned, dated and flagged
// (brief §9, §16). No Tusla/AEARS/Aistear/NCCA vocabulary.
//
// Welsh-language readiness (brief §9): area names are held as data; a Welsh
// display layer can be added later as a parallel terminology map without
// re-architecting. English copy ships first; full Welsh localisation is phased.
// Stage keys match curriculum_outcomes.stage for country='WAL'.

export const WAL_FRAMEWORK: Framework = {
  territory: 'WAL',
  name: 'Curriculum for Wales',
  officialBody: 'Welsh Government',
  outcomesCountry: 'WAL',

  stages: [
    { key: 'ps5', name: 'Progression step (around age 5)', ageMin: 0, ageMax: 5, order: 1 },
    { key: 'ps8', name: 'Progression step (around age 8)', ageMin: 5, ageMax: 8, order: 2 },
    { key: 'ps11', name: 'Progression step (around age 11)', ageMin: 8, ageMax: 11, order: 3 },
  ],

  areas: [
    { key: 'Languages, Literacy and Communication', name: 'Languages, Literacy and Communication', canonical: ['literacy_language'], crossCutting: true },
    { key: 'Mathematics and Numeracy', name: 'Mathematics and Numeracy', canonical: ['numeracy_maths'], crossCutting: true },
    { key: 'Science and Technology', name: 'Science and Technology', canonical: ['science_natural_world', 'technology_digital'] },
    { key: 'Humanities', name: 'Humanities', canonical: ['humanities_environment', 'social_personal_moral'] },
    { key: 'Health and Well-being', name: 'Health and Well-being', canonical: ['physical_wellbeing', 'social_personal_moral'] },
    { key: 'Expressive Arts', name: 'Expressive Arts', canonical: ['arts_creativity'] },
  ],

  terminology: {
    curriculum: 'Curriculum for Wales',
    areasWord: 'Areas of Learning and Experience',
    stageWord: 'progression step',
    assessmentWord: null,
    evidenceWord: 'portfolio',
    voice:
      'Warm, plain British English (Welsh-language support to follow). No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.',
    regulatoryNote:
      'Curriculum for Wales is a familiar map, not a requirement. Use the Areas of Learning and Experience to show breadth for your own records, never as a checklist, and never invent rules or thresholds.',
  },

  compliance: {
    framing: 'compliance_soft',
    hasRegister: true,
    registerName: 'the Children Not in School register (Wales)',
    administeredBy: 'your local authority',
    lastReviewed: '2026-06-30',
    summary:
      'In Wales you are free to home-educate without following Curriculum for Wales or recreating school. The Children\'s Wellbeing and Schools Act 2026 extends to Wales and is expected to introduce a Children Not in School register, but the timing and detail are set by the Welsh Government and are not yet in force. The Hedge keeps a calm record of the broad education your child is getting, mapped to the Areas of Learning and Experience, for your own peace of mind and ready if your local authority ever asks. We will tell you what is confirmed as the Welsh rules land.',
    facts: [
      { label: 'Required curriculum', value: 'None - Curriculum for Wales is optional for home educators', status: 'confirmed' },
      { label: 'Children Not in School register (Wales)', value: 'Provided for by the 2026 Act; timing and detail set by the Welsh Government, not yet in force', status: 'expected' },
      { label: 'Information to your local authority', value: 'Expected once the Welsh provisions commence; specifics to be confirmed', status: 'expected' },
    ],
    exclusiveTerms: ['Areas of Learning and Experience', 'AoLE', 'Curriculum for Wales', 'progression step'],
  },
};
