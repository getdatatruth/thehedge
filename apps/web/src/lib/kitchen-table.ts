// ─── The Kitchen Table ──────────────────────────────────────────────────────
//
// The consultative onboarding conversation and the Family Framework it produces.
// Chips carry deterministic structured meaning (so we always get a clean profile
// even if the LLM pass fails); free text is the colour the LLM reads back. The
// payoff is WRITING: a one-page Framework in the parent's own register.

export type Approach = 'structured' | 'blended' | 'child_led' | 'relaxed' | 'exploratory';
export type Doorway = 'do_more' | 'considering' | 'early_window' | 'homeschool';

export interface KTChild {
  name: string;
  age: number | null;
  interests: string[];
}

export interface KTAnswers {
  children: KTChild[];
  whyKey: string;
  whyText?: string;
  worryKey: string;
  worryText?: string;
  approachKey: string;
  approachText?: string;
  rhythmKey?: string;
  rhythmText?: string;
  county?: string;
  outdoor?: string;
  tuslaKey?: string;
  // The territory (regulatory + curricular regime) the family home-educates in.
  // Optional; defaults to Ireland. Only live territories are accepted server-side.
  territory?: string | null;
  // The administrative sub-territory (England/Wales LA, Scotland council, NI EA
  // region). Informational for Ireland (county).
  adminArea?: string | null;
  // Free-text the family adds when refining a framework that was not quite right.
  notes?: string;
}

export interface KTProfile {
  approach: Approach;
  doorway: Doorway;
  why: string;
  worry: string;
  rhythm: string;
  county?: string;
  outdoor?: string;
  tusla?: string;
  notes?: string;
  children: KTChild[];
}

export interface KTFramework {
  // A one-page framework, rendered in the parent's own register.
  opening: string;
  whatYouToldMe: string;
  commitments: string[];
  quietFloor: string;
  forYourWorry: string;
  thingsToday: string[];
}

const APPROACH_BY_KEY: Record<string, Approach> = {
  structured: 'structured',
  blended: 'blended',
  child_led: 'child_led',
  nature: 'exploratory',
  no_school: 'relaxed',
};

const DOORWAY_BY_WHY: Record<string, Doorway> = {
  do_more: 'do_more',
  considering: 'considering',
  school_not_working: 'considering',
  homeschool: 'homeschool',
};

export function deriveProfile(a: KTAnswers): KTProfile {
  let doorway: Doorway = DOORWAY_BY_WHY[a.whyKey] || 'do_more';
  // Any child under 5 with a considering/do-more lean is really the early window.
  const youngest = a.children.reduce<number | null>((min, c) => {
    if (c.age == null) return min;
    return min == null ? c.age : Math.min(min, c.age);
  }, null);
  if (youngest != null && youngest < 5 && (doorway === 'do_more' || doorway === 'considering')) {
    doorway = 'early_window';
  }
  return {
    approach: APPROACH_BY_KEY[a.approachKey] || 'blended',
    doorway,
    why: a.whyText?.trim() || labelForWhy(a.whyKey),
    worry: a.worryText?.trim() || labelForWorry(a.worryKey),
    rhythm: a.rhythmText?.trim() || labelForRhythm(a.rhythmKey),
    county: a.county?.trim() || undefined,
    outdoor: a.outdoor || undefined,
    tusla: a.tuslaKey || undefined,
    notes: a.notes?.trim() || undefined,
    children: a.children,
  };
}

function labelForWhy(key: string): string {
  return {
    do_more: 'wanting to do more with them',
    considering: 'wondering about home education',
    school_not_working: 'school not quite working for them',
    homeschool: 'already home-educating',
  }[key] || 'wanting more for your family';
}
function labelForWorry(key: string): string {
  return {
    enough: 'whether you are doing enough',
    social: 'whether they will miss out socially',
    not_teacher: "not being a teacher",
    tusla: 'the Tusla and legal side',
    none: 'nothing in particular, you just want good days',
  }[key] || 'doing right by them';
}
function labelForRhythm(key?: string): string {
  return {
    after_school: 'after school and at weekends',
    mornings: 'mostly in the mornings',
    all_day: 'all day, it is just life',
    grab_it: 'whenever you can grab it',
  }[key || ''] || 'when there is space';
}

const COMMITMENTS_BY_APPROACH: Record<Approach, string[]> = {
  structured: [
    'I will give you a real, balanced week you can follow, mapped to the curriculum.',
    'I will keep the planning off your plate so you can teach, not assemble timetables.',
    'I will show you, honestly, what is being covered, without inventing a single target.',
  ],
  blended: [
    'I will offer a loose rhythm, never a rigid clock, that you can shape day to day.',
    'I will balance things gently in the background so the week feels rounded.',
    'I will follow your lead on the busy days and pick the thread back up after.',
  ],
  child_led: [
    'I will never hand you a timetable. I will follow your children and keep ideas flowing.',
    'I will notice what is being learned as you live, so coverage takes care of itself.',
    'I will keep the lightest possible eye on the big areas, and only ever whisper.',
  ],
  relaxed: [
    'I will keep it to good ideas when you want them, no schedules and no pressure.',
    'I will quietly remember what you do, so there is a record without any data entry.',
    'I will trust your way, and only nudge if a whole corner has gone quiet for ages.',
  ],
  exploratory: [
    'I will lead with nature and the seasons, the way your family already learns.',
    'I will let one obsession wander into the next rather than break the day into subjects.',
    'I will keep a soft eye on breadth so following their curiosity never costs them.',
  ],
};

const FORYOURWORRY_BY_KEY: Record<string, string> = {
  enough: 'You are almost certainly doing more than you think. I will reflect it back to you in plain sight, the maths in the baking, the science in the garden, so "am I doing enough" turns into "look at all we did".',
  social: 'This is the one I hear most, and it is the most solvable. I will surface real families and gatherings near you, so the friendships are there from the start, not an afterthought.',
  not_teacher: 'You do not need to be a teacher. Your job is to be curious alongside them, and I will carry the curriculum, the structure and the evidence so you never have to be the expert.',
  tusla: 'I will keep the Tusla side calm and honest. AEARS sets no minimum hours and no attendance bar, and I will never pretend it does. When a review comes, the record will already be written.',
  none: 'No worry, just good days, is a lovely place to start. I will keep it simple and let it deepen only if and when you want it to.',
};

export function buildFallbackFramework(p: KTProfile): KTFramework {
  const kids = p.children.map((c) => c.name).filter(Boolean);
  const kidList =
    kids.length === 0 ? 'your children' :
    kids.length === 1 ? kids[0] :
    `${kids.slice(0, -1).join(', ')} and ${kids[kids.length - 1]}`;

  return {
    opening: `Welcome to The Hedge. This is your Family Framework: gentle ideas matched to your children day by day, a record that keeps itself as you live, and your whole year as a calm path rather than a syllabus. Here is how it will work for your family.`,
    whatYouToldMe: `You came to The Hedge ${p.why}. The thing on your mind is ${p.worry}. When learning happens for you, it tends to be ${p.rhythm}.`,
    commitments: COMMITMENTS_BY_APPROACH[p.approach],
    quietFloor: `And underneath all of it, I will keep a light eye on the big areas of a rounded childhood, so nothing important goes untouched. No scores, no red marks, just a gentle nudge now and again if a corner has been quiet for a while.`,
    forYourWorry: FORYOURWORRY_BY_KEY[answerKeyForWorry(p)] || FORYOURWORRY_BY_KEY.enough,
    thingsToday: [
      kids.length > 0
        ? `Try one lovely thing with ${kidList} today, picked for their age and what they love.`
        : 'Try one lovely thing today, picked for your family.',
      'Tap "we did this" when you are done, and your family\'s record starts keeping itself.',
      'Have a look at your year as a gentle path, not a syllabus.',
    ],
  };
}

// We only kept the worry as prose in the profile; recover the key for the map.
function answerKeyForWorry(p: KTProfile): string {
  const w = p.worry.toLowerCase();
  if (w.includes('social') || w.includes('miss out') || w.includes('friend')) return 'social';
  if (w.includes('teacher') || w.includes('qualif')) return 'not_teacher';
  if (w.includes('tusla') || w.includes('legal') || w.includes('assess')) return 'tusla';
  if (w.includes('nothing') || w.includes('good days')) return 'none';
  return 'enough';
}

// The single invisible extraction/authoring pass: turn the answers into a warm
// Framework in the parent's register. Returns a strict JSON shape.
// Render a framework to the markdown we store in `rendered_markdown`, which is
// what the AI (Ask, insights) reads as its knowledge of the family. Editing the
// framework must re-render this so the AI stays in sync with what the parent set.
export function frameworkToMarkdown(f: KTFramework): string {
  return [
    `# Your Family Framework`,
    f.opening || '',
    `## What you told me`,
    f.whatYouToldMe || '',
    `## How The Hedge will work for you`,
    ...(f.commitments || []).map((c) => `- ${c}`),
    `## The quiet floor`,
    f.quietFloor || '',
    `## For your worry`,
    f.forYourWorry || '',
    `## Three things you can do today`,
    ...(f.thingsToday || []).map((t) => `- ${t}`),
  ].join('\n\n');
}

export function frameworkPrompt(p: KTProfile): string {
  return `You are The Hedge, a warm, wise, calm companion that helps Irish families run their children's learning their own way. A parent has just had a short kitchen-table chat with you. Write their one-page "Family Framework" back to them, second person, like handwritten notes from a friend who already runs a hedge school.

Voice: warm, southern Irish-English (lovely, a gentle nudge, no bother). NEVER use "wee" (that is Ulster/Scots, off-brand). NEVER use the word "grand" (the founder has ruled it out). The overriding tone is CALM and reassuring, the headspace of home education: this is about protecting a child's love of learning and a parent's peace of mind, lifting pressure rather than adding it. Never corporate or LMS language, never mention AI, no em dashes (use regular hyphens), no emojis.

Their answers:
- Children: ${JSON.stringify(p.children)}
- Why they came: ${p.why}
- The worry on their mind: ${p.worry}
- Their approach: ${p.approach}
- Their rhythm: ${p.rhythm}
- County: ${p.county || 'unknown'}; outdoor space: ${p.outdoor || 'unknown'}${p.notes ? `

The family read a first version of this back and added more in their own words. Take this to heart, let it genuinely reshape what you write (not just append it), and reflect that you have heard it: "${p.notes}"` : ''}

Return ONLY strict JSON matching this shape (no markdown fences):
{
  "opening": "a short, warm, welcoming paragraph (2-3 sentences) that orients the parent on what The Hedge is and what to expect from it: gentle ideas matched to their children day by day, a record that quietly keeps itself as they live, and their whole year as a calm path rather than a syllabus. Educational and reassuring, leading with the benefit to them. Do NOT start with 'grand' or any filler",
  "whatYouToldMe": "2-3 sentences mirroring their why and worry back in their own register, naming the children if given",
  "commitments": ["three short first-person promises that fit their approach (e.g. an unschooler must be told 'I will never hand you a timetable')"],
  "quietFloor": "the one magic line: that you keep a light, never-shaming eye on the big areas of a rounded childhood so nothing important is missed, just a gentle nudge if a corner goes quiet. Make clear there are no scores or targets.",
  "forYourWorry": "2-3 sentences answering their specific worry directly and reassuringly, with no false promises and no invented Tusla thresholds",
  "thingsToday": ["three concrete, gentle things they can do today, one of which is a real activity for their child by age/interest, one is one-tap logging, one is seeing their year as a path"]
}`;
}
