import type { Framework } from '../types';

// ─── Ireland framework ──────────────────────────────────────────────────────
// Aistear (birth–6) + the Primary Curriculum. The stage age-ranges are set to
// reproduce the exact overlapping bands the engine used before the territory
// refactor (≤6 → early_childhood; 5–8 → primary_junior; ≥8 → primary_senior),
// so a 5–6yo still draws on both Aistear and junior primary outcomes. The
// `stage` keys match the curriculum_outcomes.stage values in the IE seed.

export const IE_FRAMEWORK: Framework = {
  territory: 'IE',
  name: 'Aistear and the Primary Curriculum',
  officialBody: 'NCCA',
  outcomesCountry: 'IE',

  stages: [
    { key: 'early_childhood', name: 'Early childhood (Aistear)', ageMin: 0, ageMax: 6, order: 1 },
    { key: 'primary_junior', name: 'Junior primary', ageMin: 5, ageMax: 8, order: 2 },
    { key: 'primary_senior', name: 'Senior primary', ageMin: 8, ageMax: 14, order: 3 },
  ],

  areas: [
    // Aistear themes (early childhood)
    { key: 'Aistear: Well-being', name: 'Well-being', canonical: ['physical_wellbeing'] },
    { key: 'Aistear: Identity and Belonging', name: 'Identity and Belonging', canonical: ['social_personal_moral'] },
    { key: 'Aistear: Communicating', name: 'Communicating', canonical: ['literacy_language'] },
    { key: 'Aistear: Exploring and Thinking', name: 'Exploring and Thinking', canonical: ['science_natural_world', 'numeracy_maths'] },
    // Primary curriculum areas
    { key: 'Language', name: 'Language', canonical: ['literacy_language'] },
    { key: 'Mathematics', name: 'Mathematics', canonical: ['numeracy_maths'] },
    { key: 'SESE', name: 'Social, Environmental and Scientific Education', canonical: ['science_natural_world', 'humanities_environment'] },
    { key: 'Arts Education', name: 'Arts Education', canonical: ['arts_creativity'] },
    { key: 'Physical Education', name: 'Physical Education', canonical: ['physical_wellbeing'], crossCutting: false },
    { key: 'SPHE', name: 'Social, Personal and Health Education', canonical: ['social_personal_moral', 'physical_wellbeing'] },
  ],

  terminology: {
    curriculum: 'Aistear and the Primary Curriculum',
    areasWord: 'curriculum areas',
    stageWord: 'class',
    assessmentWord: 'assessment',
    evidenceWord: 'portfolio',
    voice:
      'Warm southern Irish-English ("lovely", "have a go", "no bother"). NEVER use the word "grand" or the word "wee". No em dashes (use ordinary hyphens or commas). No emojis. Never mention AI.',
    regulatoryNote:
      'Curriculum is the underpinning, not the point. These make it real evidence for a Tusla / AEARS portfolio. Be honest about AEARS: it sets no minimum hours and no attendance bar. Never invent thresholds.',
  },

  compliance: {
    framing: 'compliance_must_have',
    hasRegister: true,
    registerName: 'the Section 14 register',
    administeredBy: 'Tusla',
    lastReviewed: '2026-06-30',
    summary:
      'In Ireland a parent applies to Tusla, via the Alternative Education Assessment and Registration Service (AEARS), to register a child on the Section 14 register under the Education (Welfare) Act 2000. An authorised person assesses whether the child is receiving a certain minimum education suitable to their age, ability and aptitude. There is no required curriculum, no minimum hours and no attendance requirement. Registration is subject to periodic review.',
    facts: [
      { label: 'Register', value: 'Section 14 register, administered by Tusla', status: 'confirmed' },
      { label: 'Standard', value: 'A "certain minimum education" suitable to age, ability and aptitude', status: 'confirmed' },
      { label: 'Required curriculum', value: 'None', status: 'confirmed' },
      { label: 'Minimum hours / attendance', value: 'None', status: 'confirmed' },
    ],
    exclusiveTerms: ['Tusla', 'AEARS', 'Aistear', 'Section 14', 'authorised person', 'INHSA'],
  },
};
