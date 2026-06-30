// ─── Territory roadmaps (content-driven) ────────────────────────────────────
// The territory-specific journey a family is walked through after onboarding
// (brief §13). Steps are DATA so a step can be added/edited without code. The
// framing leads with what's appropriate for the territory: compliance-readiness
// where a register looms (IE; ENG/WAL as commencement nears), confidence and
// breadth where it does not (SCO/NIR). No Irish vocabulary outside IE.

import type { TerritoryKey } from './types';
import { TERRITORY_KEYS } from './types';

export interface RoadmapStep {
  key: string;
  title: string;
  body: string;
  // 'now' = applies today; 'pending' = tied to a future/■changing rule (shows a
  // "rules may change" affordance); 'optional' = nice-to-have.
  status: 'now' | 'pending' | 'optional';
}

const IE_ROADMAP: RoadmapStep[] = [
  {
    key: 'register',
    title: 'Know where you stand with Tusla',
    body: 'Home education in Ireland is registered with Tusla under Section 14. If you have not applied yet, that is no bother - we will help you understand the steps in your own time.',
    status: 'now',
  },
  {
    key: 'prepare_assessment',
    title: 'Quietly prepare for assessment',
    body: 'An authorised person assesses whether your child is getting a certain minimum education. There is no required curriculum, no minimum hours and no attendance. Logging real moments builds your evidence as you go.',
    status: 'now',
  },
  {
    key: 'build_portfolio',
    title: 'Build your portfolio as you live',
    body: 'Every activity you log and moment you capture becomes portfolio evidence, tied to Aistear and the Primary Curriculum behind the scenes. Nothing extra to write up.',
    status: 'now',
  },
  {
    key: 'report',
    title: 'Generate your report when you need it',
    body: 'When assessment time comes, produce a tidy report from everything you have recorded. It is your record, designed to help you prepare - never an official Tusla document.',
    status: 'optional',
  },
];

const ENG_ROADMAP: RoadmapStep[] = [
  {
    key: 'free_to_homeed',
    title: 'You are free to home-educate your way',
    body: 'In England you do not have to follow the National Curriculum or recreate school. The only legal test is that your child gets a suitable, efficient education. The Hedge simply helps you see and show that.',
    status: 'now',
  },
  {
    key: 'keep_record',
    title: 'Keep a calm record as you go',
    body: 'Log real activities and moments. We quietly map them to the National Curriculum so you build a broad, balanced picture of your child\'s learning, entirely for your own peace of mind.',
    status: 'now',
  },
  {
    key: 'register_readiness',
    title: 'Be ready if the register arrives',
    body: 'A Children Not in School register is coming under the 2026 Act but is not yet in force (expected from 2027). When it starts, your local authority will ask for some information. We keep what you would need ready, with no fuss. We will tell you what is confirmed as the rules land.',
    status: 'pending',
  },
  {
    key: 'evidence_pack',
    title: 'Produce an evidence pack on demand',
    body: 'If your local authority ever asks about your child\'s education, generate a clear pack from what you have recorded - evidence of a suitable education, in your own words. Never a mandated return.',
    status: 'optional',
  },
];

const SCO_ROADMAP: RoadmapStep[] = [
  {
    key: 'confidence',
    title: 'Home-educate with confidence',
    body: 'Scotland gives you freedom to follow your child. If your child is enrolled in a school you usually need the council\'s consent to withdraw; otherwise you are free to begin. The Hedge helps you keep things rich and balanced.',
    status: 'now',
  },
  {
    key: 'breadth',
    title: 'Keep learning broad and balanced',
    body: 'Curriculum for Excellence is built around evidence of progress across its areas, which is exactly how The Hedge works. Log real moments and watch the breadth build, gently.',
    status: 'now',
  },
  {
    key: 'portfolio',
    title: 'Hold a portfolio you are proud of',
    body: 'Your logged learning becomes a portfolio mapped to Curriculum for Excellence - a confident record for your family, and ready if you ever choose to share it with your council.',
    status: 'optional',
  },
];

const NIR_ROADMAP: RoadmapStep[] = [
  {
    key: 'confidence',
    title: 'Home-educate with confidence',
    body: 'In Northern Ireland the Education Authority must be satisfied your child gets a suitable education, but there is no register of the England kind. The Hedge helps you keep things rich and well-rounded.',
    status: 'now',
  },
  {
    key: 'breadth',
    title: 'Keep learning broad and balanced',
    body: 'Log real moments and we map them to the Northern Ireland Curriculum\'s Areas of Learning, so breadth builds as you live, with no school-at-home pressure.',
    status: 'now',
  },
  {
    key: 'portfolio',
    title: 'Hold a portfolio you are proud of',
    body: 'Your learning becomes a tidy portfolio - a confident family record, and ready if the Education Authority ever asks.',
    status: 'optional',
  },
];

const WAL_ROADMAP: RoadmapStep[] = [
  {
    key: 'free_to_homeed',
    title: 'Home-educate your way',
    body: 'In Wales you are free to home-educate without recreating school. The Hedge helps you see and show a broad, suitable education for your child.',
    status: 'now',
  },
  {
    key: 'keep_record',
    title: 'Keep a calm record as you go',
    body: 'Log real moments and we quietly map them to the six Areas of Learning and Experience in Curriculum for Wales, building breadth without fuss.',
    status: 'now',
  },
  {
    key: 'register_readiness',
    title: 'Be ready for Welsh requirements',
    body: 'The 2026 Act extends to Wales, but the timing and detail are set by the Welsh Government and are not yet in force. We keep what you would need ready and will tell you what is confirmed as the rules land.',
    status: 'pending',
  },
];

const ROADMAPS: Record<TerritoryKey, RoadmapStep[]> = {
  IE: IE_ROADMAP,
  ENG: ENG_ROADMAP,
  SCO: SCO_ROADMAP,
  WAL: WAL_ROADMAP,
  NIR: NIR_ROADMAP,
};

export function getRoadmap(territory: string | null | undefined): RoadmapStep[] {
  const key: TerritoryKey =
    territory && (TERRITORY_KEYS as string[]).includes(territory) ? (territory as TerritoryKey) : 'IE';
  return ROADMAPS[key];
}
