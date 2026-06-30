// ─── Territory model types ──────────────────────────────────────────────────
// A Territory is a regulatory + curricular regime. Differences between
// territories are expressed as DATA (these structures); only genuinely
// divergent behaviour is code. See docs/adr/0001-territory-architecture.md.

import type { CanonicalDimension } from './canonical';

// The five launch territories. Ireland is live; the UK nations are config.
export type TerritoryKey = 'IE' | 'ENG' | 'SCO' | 'WAL' | 'NIR';

export const TERRITORY_KEYS: TerritoryKey[] = ['IE', 'ENG', 'SCO', 'WAL', 'NIR'];

// How prominently to foreground compliance/evidence language (brief §2, §5).
export type Framing = 'compliance_must_have' | 'compliance_soft' | 'value_add';

export interface Stage {
  key: string; // native stage key, also the curriculum_outcomes.stage value
  name: string; // native display name
  ageMin: number;
  ageMax: number;
  order: number;
}

export interface Area {
  key: string; // native area key
  name: string; // native display name
  canonical: CanonicalDimension[]; // mapping onto canonical dimensions
  crossCutting?: boolean; // e.g. literacy/numeracy "responsibility of all"
}

// A dated, sourced compliance picture. `facts[].status` separates settled law
// from pending provisions so the UI never presents unconfirmed detail as
// certain (brief §5, §16).
export interface ComplianceProfile {
  framing: Framing;
  hasRegister: boolean;
  registerName: string | null;
  administeredBy: string | null; // Tusla, the Local Authority, the Education Authority...
  lastReviewed: string; // ISO date
  summary: string; // calm, sourced overview
  facts: { label: string; value: string; status: 'confirmed' | 'expected' }[];
  // Regulatory vocabulary that may ONLY appear in this territory's UI/AI/reports
  // (brief §12 hard rule). For IE: Tusla, AEARS, Aistear, Section 14.
  exclusiveTerms: string[];
}

// Words and voice this territory uses; drives UI copy and AI prompt vocabulary
// so no territory-specific strings are hardcoded in components/prompts (§12).
export interface Terminology {
  curriculum: string; // 'Aistear and the Primary Curriculum' | 'the National Curriculum'...
  areasWord: string; // 'curriculum areas' | 'subjects' | 'Areas of Learning and Experience'...
  stageWord: string; // 'class' | 'Key Stage' | 'Level' | 'progression step'
  assessmentWord: string | null; // 'assessment' (IE) | null (no assessment regime)
  evidenceWord: string; // 'evidence' | 'portfolio'
  voice: string; // the register the AI should write in for this territory
  regulatoryNote: string; // framing the AI may reference (IE: Tusla/AEARS; UK: suitability)
}

export interface Framework {
  territory: TerritoryKey;
  name: string;
  officialBody: string;
  // The DB curriculum_outcomes.country value whose rows belong to this territory.
  outcomesCountry: string;
  stages: Stage[];
  areas: Area[];
  terminology: Terminology;
  compliance: ComplianceProfile;
}
