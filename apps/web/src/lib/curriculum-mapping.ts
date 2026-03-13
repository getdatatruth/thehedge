// ─────────────────────────────────────────────────────────
// NCCA Curriculum Outcomes → Activity Mapping System
// Maps activities to Ireland's Aistear framework and
// primary curriculum areas for Tusla compliance tracking.
// ─────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'nature' | 'kitchen' | 'science' | 'art' | 'movement'
  | 'literacy' | 'maths' | 'life_skills' | 'calm' | 'social';

export type AistearTheme =
  | 'Well-being'
  | 'Identity & Belonging'
  | 'Communicating'
  | 'Exploring & Thinking';

export type NCCACurriculumArea =
  | 'Language'
  | 'Mathematics'
  | 'SESE'
  | 'Arts Education'
  | 'Physical Education'
  | 'SPHE';

// ─── Aistear Theme Mapping ───────────────────────────────

const AISTEAR_MAP: Record<ActivityCategory, AistearTheme[]> = {
  nature:      ['Exploring & Thinking', 'Well-being'],
  kitchen:     ['Exploring & Thinking', 'Well-being', 'Communicating'],
  science:     ['Exploring & Thinking', 'Communicating'],
  art:         ['Communicating', 'Identity & Belonging'],
  movement:    ['Well-being', 'Exploring & Thinking'],
  literacy:    ['Communicating', 'Identity & Belonging'],
  maths:       ['Exploring & Thinking', 'Communicating'],
  life_skills: ['Well-being', 'Identity & Belonging'],
  calm:        ['Well-being', 'Identity & Belonging'],
  social:      ['Identity & Belonging', 'Communicating'],
};

// ─── NCCA Curriculum Area Mapping ────────────────────────

const CURRICULUM_AREA_MAP: Record<ActivityCategory, NCCACurriculumArea[]> = {
  nature:      ['SESE'],
  kitchen:     ['Mathematics', 'SESE'],
  science:     ['SESE', 'Mathematics'],
  art:         ['Arts Education'],
  movement:    ['Physical Education', 'SPHE'],
  literacy:    ['Language'],
  maths:       ['Mathematics'],
  life_skills: ['SPHE'],
  calm:        ['SPHE', 'Arts Education'],
  social:      ['SPHE'],
};

// ─── Outcome Code Prefix Mapping ─────────────────────────
// Maps categories + curriculum tags to specific outcome code prefixes
// so we can match activities to specific curriculum_outcomes rows.

const CATEGORY_TO_OUTCOME_PREFIXES: Record<ActivityCategory, string[]> = {
  nature:      ['ET-', 'WB-', 'SC-LT', 'SC-EA', 'GE-NE', 'GE-HE', 'PE-OA'],
  kitchen:     ['ET-', 'WB-', 'CO-', 'MA-ME', 'MA-NU', 'SC-MA'],
  science:     ['ET-', 'CO-', 'SC-LT', 'SC-MA', 'SC-EF', 'SC-EA', 'MA-DA'],
  art:         ['CO-01', 'CO-02', 'ET-04', 'VA-', 'MU-', 'DR-'],
  movement:    ['WB-04', 'WB-05', 'PE-', 'SP-MY'],
  literacy:    ['CO-03', 'CO-04', 'CO-05', 'CO-06', 'EN-', 'GA-'],
  maths:       ['ET-06', 'MA-', 'CO-07'],
  life_skills: ['WB-02', 'WB-03', 'IB-', 'SP-MY', 'SP-MW'],
  calm:        ['WB-01', 'WB-06', 'WB-07', 'IB-01', 'IB-02', 'SP-MY', 'MU-LR'],
  social:      ['IB-03', 'IB-04', 'IB-05', 'IB-06', 'SP-MO', 'SP-MW', 'CO-02'],
};

// Additional tag-based refinements: curriculum tags from activities
// can narrow or broaden the outcome matches.
const TAG_TO_OUTCOME_PREFIXES: Record<string, string[]> = {
  // Aistear tags
  'aistear:wellbeing':    ['WB-'],
  'aistear:identity':     ['IB-'],
  'aistear:communicating': ['CO-'],
  'aistear:exploring':    ['ET-'],

  // Subject tags
  'science':       ['SC-'],
  'maths':         ['MA-'],
  'literacy':      ['EN-', 'GA-'],
  'language':      ['EN-', 'GA-', 'CO-03', 'CO-04'],
  'irish':         ['GA-'],
  'english':       ['EN-'],
  'history':       ['HI-'],
  'geography':     ['GE-'],
  'visual_arts':   ['VA-'],
  'music':         ['MU-'],
  'drama':         ['DR-'],
  'pe':            ['PE-'],
  'sphe':          ['SP-'],
  'art':           ['VA-', 'MU-', 'DR-'],

  // Skill tags
  'observation':   ['ET-01', 'ET-02', 'SC-LT', 'GE-NE'],
  'counting':      ['MA-NU', 'ET-06'],
  'measuring':     ['MA-ME'],
  'patterns':      ['MA-AL'],
  'shapes':        ['MA-SS'],
  'reading':       ['EN-RD', 'CO-05'],
  'writing':       ['EN-WR', 'CO-06'],
  'oral_language':  ['EN-OL', 'GA-OL', 'CO-03', 'CO-04'],
  'storytelling':  ['EN-OL', 'CO-02', 'DR-'],
  'fine_motor':    ['WB-05', 'VA-DR', 'EN-WR'],
  'gross_motor':   ['WB-04', 'PE-'],
  'creativity':    ['WB-06', 'ET-04', 'VA-', 'MU-', 'DR-'],
  'problem_solving': ['ET-05', 'MA-'],
  'teamwork':      ['IB-06', 'SP-MO', 'PE-GA'],
  'empathy':       ['SP-MO-02', 'IB-05'],
  'self_care':     ['WB-02', 'WB-03', 'SP-MY'],
  'environment':   ['SC-EA', 'GE-EA'],
  'life_cycles':   ['SC-LT-02'],
  'materials':     ['SC-MA'],
  'forces':        ['SC-EF'],
  'data':          ['MA-DA'],
  'cooking':       ['WB-03', 'MA-ME', 'SC-MA', 'ET-01'],
  'nature':        ['SC-LT', 'GE-NE', 'SC-EA', 'ET-01', 'WB-07'],
  'seasons':       ['GE-NE-01', 'SC-LT'],
  'weather':       ['GE-NE-01'],
  'local_area':    ['HI-LS', 'GE-HE'],
  'cultural':      ['IB-04', 'IB-05', 'HI-'],
  'mindfulness':   ['WB-01', 'SP-MY-01'],
  'dance':         ['PE-DA'],
  'swimming':      ['PE-AQ'],
  'gymnastics':    ['PE-GY'],
};

// ─── All 4 Aistear themes for validation ─────────────────

const ALL_AISTEAR_THEMES: AistearTheme[] = [
  'Well-being',
  'Identity & Belonging',
  'Communicating',
  'Exploring & Thinking',
];

const ALL_CURRICULUM_AREAS: NCCACurriculumArea[] = [
  'Language',
  'Mathematics',
  'SESE',
  'Arts Education',
  'Physical Education',
  'SPHE',
];

// ─── Exported Functions ──────────────────────────────────

/**
 * Returns the Aistear themes associated with an activity category.
 */
export function getAistearThemes(category: string): AistearTheme[] {
  return AISTEAR_MAP[category as ActivityCategory] || [];
}

/**
 * Returns the NCCA primary curriculum areas associated with an activity category.
 */
export function getCurriculumAreas(category: string): NCCACurriculumArea[] {
  return CURRICULUM_AREA_MAP[category as ActivityCategory] || [];
}

/**
 * Maps an activity (by category and optional curriculumTags) to matching
 * curriculum outcome code prefixes. These can be used to query the
 * curriculum_outcomes table for specific outcome IDs.
 *
 * Returns an array of outcome_code prefixes that match.
 */
export function getMatchingOutcomePrefixes(
  category: string,
  curriculumTags?: unknown
): string[] {
  const prefixes = new Set<string>();

  // Base prefixes from category
  const categoryPrefixes = CATEGORY_TO_OUTCOME_PREFIXES[category as ActivityCategory] || [];
  for (const p of categoryPrefixes) {
    prefixes.add(p);
  }

  // Additional prefixes from curriculum tags
  if (Array.isArray(curriculumTags)) {
    for (const tag of curriculumTags) {
      const tagStr = typeof tag === 'string' ? tag : String(tag);
      const tagPrefixes = TAG_TO_OUTCOME_PREFIXES[tagStr.toLowerCase()] || [];
      for (const p of tagPrefixes) {
        prefixes.add(p);
      }
    }
  }

  return Array.from(prefixes);
}

/**
 * Given a list of curriculum outcomes (from the DB) and an activity,
 * returns the IDs of outcomes that match this activity.
 *
 * @param outcomes - All curriculum outcomes (or a filtered subset)
 * @param category - The activity's category
 * @param curriculumTags - The activity's curriculumTags (jsonb field)
 * @returns Array of matching outcome IDs
 */
export function mapActivityToCurriculum(
  outcomes: { id: string; outcome_code: string }[],
  category: string,
  curriculumTags?: unknown
): string[] {
  const prefixes = getMatchingOutcomePrefixes(category, curriculumTags);

  if (prefixes.length === 0) return [];

  return outcomes
    .filter((outcome) =>
      prefixes.some((prefix) => outcome.outcome_code.startsWith(prefix))
    )
    .map((outcome) => outcome.id);
}

// ─── Coverage Calculation ────────────────────────────────

export interface ActivityLogForCoverage {
  id: string;
  date: string;
  duration_minutes: number | null;
  activity_category: string | null;
  curriculum_areas_covered: string[] | null;
  curriculum_tags?: unknown;
}

export interface CurriculumCoverageSummary {
  /** Aistear theme name → { count, percentage } */
  aistearThemes: Record<string, { count: number; percentage: number }>;
  /** NCCA curriculum area → { count, percentage } */
  curriculumAreas: Record<string, { count: number; percentage: number }>;
  /** Total number of activity logs analysed */
  totalActivities: number;
  /** Total hours logged */
  totalHours: number;
  /** How many of the 4 Aistear themes have been touched */
  aistearCoveredCount: number;
  /** How many of the 6 NCCA areas have been touched */
  nccaCoveredCount: number;
  /** Overall Aistear coverage percentage (themes touched / 4) */
  aistearCoveragePercent: number;
  /** Overall NCCA coverage percentage (areas touched / 6) */
  nccaCoveragePercent: number;
}

/**
 * Calculates curriculum coverage from a list of activity logs.
 * Returns both Aistear theme coverage and NCCA curriculum area coverage
 * with counts and percentages, suitable for Tusla compliance reporting.
 */
export function calculateCurriculumCoverage(
  activityLogs: ActivityLogForCoverage[]
): CurriculumCoverageSummary {
  const aistearCounts: Record<string, number> = {};
  const nccaCounts: Record<string, number> = {};
  let totalMinutes = 0;

  // Initialize all themes/areas to 0
  for (const theme of ALL_AISTEAR_THEMES) {
    aistearCounts[theme] = 0;
  }
  for (const area of ALL_CURRICULUM_AREAS) {
    nccaCounts[area] = 0;
  }

  for (const log of activityLogs) {
    totalMinutes += log.duration_minutes || 0;

    const category = log.activity_category;
    if (!category) continue;

    // Map to Aistear themes
    const themes = getAistearThemes(category);
    for (const theme of themes) {
      aistearCounts[theme] = (aistearCounts[theme] || 0) + 1;
    }

    // Map to NCCA curriculum areas
    const areas = getCurriculumAreas(category);
    for (const area of areas) {
      nccaCounts[area] = (nccaCounts[area] || 0) + 1;
    }

    // Also include any explicitly logged curriculum_areas_covered
    if (log.curriculum_areas_covered) {
      for (const area of log.curriculum_areas_covered) {
        // Try to match to known NCCA areas
        const normalised = normaliseAreaName(area);
        if (normalised && ALL_CURRICULUM_AREAS.includes(normalised as NCCACurriculumArea)) {
          nccaCounts[normalised] = (nccaCounts[normalised] || 0) + 1;
        }
      }
    }
  }

  const totalActivities = activityLogs.length;

  // Build percentage summaries
  const aistearThemes: Record<string, { count: number; percentage: number }> = {};
  for (const theme of ALL_AISTEAR_THEMES) {
    const count = aistearCounts[theme] || 0;
    aistearThemes[theme] = {
      count,
      percentage: totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0,
    };
  }

  const curriculumAreas: Record<string, { count: number; percentage: number }> = {};
  for (const area of ALL_CURRICULUM_AREAS) {
    const count = nccaCounts[area] || 0;
    curriculumAreas[area] = {
      count,
      percentage: totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0,
    };
  }

  const aistearCoveredCount = ALL_AISTEAR_THEMES.filter(t => (aistearCounts[t] || 0) > 0).length;
  const nccaCoveredCount = ALL_CURRICULUM_AREAS.filter(a => (nccaCounts[a] || 0) > 0).length;

  return {
    aistearThemes,
    curriculumAreas,
    totalActivities,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    aistearCoveredCount,
    nccaCoveredCount,
    aistearCoveragePercent: Math.round((aistearCoveredCount / ALL_AISTEAR_THEMES.length) * 100),
    nccaCoveragePercent: Math.round((nccaCoveredCount / ALL_CURRICULUM_AREAS.length) * 100),
  };
}

// ─── Helpers ─────────────────────────────────────────────

/**
 * Normalise various area name formats to standard NCCA area names.
 * Handles values that come from the curriculum_areas_covered field
 * on activity_logs, which may use different naming conventions.
 */
function normaliseAreaName(area: string): string | null {
  const lower = area.toLowerCase().trim();

  // Direct matches
  const mapping: Record<string, NCCACurriculumArea> = {
    'language': 'Language',
    'english': 'Language',
    'irish': 'Language',
    'gaeilge': 'Language',
    'literacy': 'Language',
    'mathematics': 'Mathematics',
    'maths': 'Mathematics',
    'math': 'Mathematics',
    'numeracy': 'Mathematics',
    'sese': 'SESE',
    'science': 'SESE',
    'history': 'SESE',
    'geography': 'SESE',
    'arts education': 'Arts Education',
    'arts': 'Arts Education',
    'art': 'Arts Education',
    'visual arts': 'Arts Education',
    'music': 'Arts Education',
    'drama': 'Arts Education',
    'physical education': 'Physical Education',
    'pe': 'Physical Education',
    'movement': 'Physical Education',
    'sphe': 'SPHE',
    'social': 'SPHE',
    'well-being': 'SPHE',
    'wellbeing': 'SPHE',
    'life skills': 'SPHE',
    'life_skills': 'SPHE',
  };

  return mapping[lower] || null;
}

// ─── Constants for external use ──────────────────────────

export { ALL_AISTEAR_THEMES, ALL_CURRICULUM_AREAS };
