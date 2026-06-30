import type { Framework } from '../types';

// ─── Scotland framework ─────────────────────────────────────────────────────
// Curriculum for Excellence (CfE). A natural fit for The Hedge: CfE is built
// around achievement evidenced by professional judgement across a wide range of
// evidence - a portfolio model. Value-add territory: no register of the
// England kind, so framing leads with confidence and breadth, never compliance
// pressure. No Tusla/AEARS/Aistear vocabulary.
//
// Levels overlap at boundaries (Early 0-6, First 6-9, Second 9-12). `stage` keys
// match curriculum_outcomes.stage for country='SCO'.

export const SCO_FRAMEWORK: Framework = {
  territory: 'SCO',
  name: 'Curriculum for Excellence',
  officialBody: 'Education Scotland',
  outcomesCountry: 'SCO',

  stages: [
    { key: 'early', name: 'Early Level', ageMin: 0, ageMax: 6, order: 1 },
    { key: 'first', name: 'First Level', ageMin: 6, ageMax: 9, order: 2 },
    { key: 'second', name: 'Second Level', ageMin: 9, ageMax: 12, order: 3 },
  ],

  areas: [
    { key: 'Languages', name: 'Languages', canonical: ['literacy_language'], crossCutting: true },
    { key: 'Mathematics', name: 'Mathematics', canonical: ['numeracy_maths'], crossCutting: true },
    { key: 'Health and wellbeing', name: 'Health and wellbeing', canonical: ['physical_wellbeing', 'social_personal_moral'], crossCutting: true },
    { key: 'Sciences', name: 'Sciences', canonical: ['science_natural_world'] },
    { key: 'Social studies', name: 'Social studies', canonical: ['humanities_environment'] },
    { key: 'Expressive arts', name: 'Expressive arts', canonical: ['arts_creativity'] },
    { key: 'Technologies', name: 'Technologies', canonical: ['technology_digital'] },
    { key: 'Religious and moral education', name: 'Religious and moral education', canonical: ['social_personal_moral', 'humanities_environment'] },
  ],

  terminology: {
    curriculum: 'Curriculum for Excellence',
    areasWord: 'curriculum areas',
    stageWord: 'Level',
    assessmentWord: null,
    evidenceWord: 'portfolio',
    voice:
      'Warm, plain British English. No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.',
    regulatoryNote:
      'Curriculum for Excellence is built around evidence of progress across its areas, which is exactly how this works. Treat the areas as a familiar map for your own confidence, never a requirement, and never invent rules or thresholds.',
  },

  compliance: {
    framing: 'value_add',
    hasRegister: false,
    registerName: null,
    administeredBy: 'your local council',
    lastReviewed: '2026-06-30',
    summary:
      'Scotland gives families real freedom to home-educate. There is no register of the kind being introduced in England. One practical point: if your child is currently enrolled in a council (non-independent) school, you usually need the council\'s consent to withdraw them; if they are not enrolled, or are at an independent school, that consent is not needed. The Hedge keeps a confident record of the broad education your child is getting, mapped to Curriculum for Excellence, for your own peace of mind and ready if you ever choose to share it with your council.',
    facts: [
      { label: 'Register', value: 'None of the England kind', status: 'confirmed' },
      { label: 'Required curriculum', value: 'None - Curriculum for Excellence is a guide, not a mandate for home educators', status: 'confirmed' },
      { label: 'Withdrawing from a council school', value: 'Usually needs the council\'s consent; not needed if the child is not enrolled or is at an independent school', status: 'confirmed' },
    ],
    exclusiveTerms: ['Curriculum for Excellence', 'CfE', 'responsibility of all', 'local council'],
  },
};
