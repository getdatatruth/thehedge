/**
 * Territory regression guard. Locks in the multi-territory guarantees so a
 * future change cannot silently break them (brief §16). No DB or network needed.
 * Run: npx tsx scripts/check-territory-isolation.ts  (exit 1 on any failure)
 *
 * Checks:
 *   1. stagesForAge (Ireland) reproduces the original overlapping bands exactly.
 *   2. No territory's vocabulary leaks into another's prompts/roadmap/compliance.
 *   3. Reports: England carries no Tusla/AEARS/Aistear/NCCA; Ireland keeps its
 *      framing (incl. the Aistear section).
 */
import {
  getFramework,
  stagesForAge,
  sparkSystemPrompt,
  momentSystemPrompt,
  getRoadmap,
  TERRITORY_KEYS,
} from '../src/lib/territory';
import { renderAnnualHtml } from '../src/lib/reports';

let failures = 0;
const fail = (msg: string) => { failures++; console.log('  FAIL:', msg); };
const ok = (msg: string) => console.log('  ok:', msg);

// ── 1. Ireland stagesForAge parity ──────────────────────────────────────────
function originalStages(age: number | null): string[] {
  const a = age ?? 6;
  const s: string[] = [];
  if (a <= 6) s.push('early_childhood');
  if (a >= 5 && a <= 8) s.push('primary_junior');
  if (a >= 8) s.push('primary_senior');
  return s.length ? s : ['primary_junior'];
}
console.log('1. Ireland stagesForAge parity');
{
  const fw = getFramework('IE');
  let allMatch = true;
  for (let age = 0; age <= 15; age++) {
    const got = [...stagesForAge(fw, age)].sort();
    const want = [...originalStages(age)].sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) { allMatch = false; fail(`age ${age}: ${JSON.stringify(got)} != ${JSON.stringify(want)}`); }
  }
  if (allMatch) ok('all ages 0-15 match the original logic');
}

// ── 2. Cross-territory terminology isolation ────────────────────────────────
console.log('2. Cross-territory terminology isolation');
{
  const shape = { categories: ['nature'], locations: ['indoor'], energy: ['calm'], mess: ['low'] };
  const surfaces = (t: string) => {
    const fw = getFramework(t);
    return [
      sparkSystemPrompt(fw, shape),
      momentSystemPrompt(fw),
      getRoadmap(t).map((s) => `${s.title} ${s.body}`).join('\n'),
      fw.compliance.summary,
      fw.compliance.facts.map((f) => `${f.label} ${f.value}`).join('\n'),
    ].join('\n');
  };
  const ALLOWED: Record<string, string[]> = {
    Tusla: ['IE'], AEARS: ['IE'], Aistear: ['IE'], 'Section 14': ['IE'], NCCA: ['IE'],
    'National Curriculum': ['ENG'],
    'Curriculum for Excellence': ['SCO'],
    'Curriculum for Wales': ['WAL'],
    'Areas of Learning and Experience': ['WAL'],
    'Northern Ireland Curriculum': ['NIR'],
    'Education Authority': ['NIR'],
    'Children Not in School': ['ENG', 'WAL'],
  };
  const cache: Record<string, string> = {};
  for (const t of TERRITORY_KEYS) cache[t] = surfaces(t);
  let clean = true;
  for (const [term, allowed] of Object.entries(ALLOWED)) {
    for (const t of TERRITORY_KEYS) {
      if (cache[t].includes(term) && !allowed.includes(t)) { clean = false; fail(`"${term}" leaked into ${t}`); }
    }
  }
  if (clean) ok('no vocabulary leaks across IE/ENG/SCO/WAL/NIR');
}

// ── 3. Report isolation (England vs Ireland) ────────────────────────────────
console.log('3. Report isolation (annual pack)');
{
  const mock = (territory: string): Parameters<typeof renderAnnualHtml>[0] => {
    const child = { id: 'c', name: 'River', dateOfBirth: '2019-05-01', age: 6, interests: ['volcanoes'], schoolStatus: 'home_educated', learningStyle: null, territory } as never;
    const family = { name: 'Test Family', county: 'X', country: territory } as never;
    const assessment = { type: 'assessment', family, child, educationPlan: null, dateRange: { start: '2025-09-01', end: '2026-06-30' }, generatedAt: '2026-06-30T10:00:00Z', activitySummary: { totalActivities: 12, totalHours: 20, categoryCounts: { science: 5 }, aistearThemes: { 'Well-being': 2 } }, recentActivities: [], curriculumCoverage: [] } as never;
    return { type: 'annual', assessment, attendance: { totals: { totalDaysAttended: 40 } } as never, portfolio: { totalEntries: 1, entries: [] } as never, narrative: 'A lovely year.', nccaCoverage: [{ area: 'Mathematics', activityCount: 2, covered: true }], portfolioWithPhotos: [], academicYear: '2025/2026' } as never;
  };
  const eng = renderAnnualHtml(mock('ENG'), getFramework('ENG'));
  const ie = renderAnnualHtml(mock('IE'), getFramework('IE'));
  let clean = true;
  for (const t of ['Tusla', 'AEARS', 'Aistear', 'NCCA', 'Section 14']) if (eng.includes(t)) { clean = false; fail(`England report contains "${t}"`); }
  for (const t of ['Tusla', 'AEARS', 'NCCA', 'Aistear Themes']) if (!ie.includes(t)) { clean = false; fail(`Ireland report missing "${t}"`); }
  if (!eng.includes('Evidence of a Suitable Education')) { clean = false; fail('England report missing its evidence-pack title'); }
  if (clean) ok('England has no Irish vocabulary; Ireland keeps its framing');
}

console.log('');
if (failures > 0) { console.log(`TERRITORY CHECK FAILED (${failures} failure${failures === 1 ? '' : 's'})`); process.exit(1); }
console.log('TERRITORY CHECK PASSED');
