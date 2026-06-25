'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icons';

// The Kitchen Table, on the marketing site. A no-signup taste of the real
// onboarding: a few warm questions, then we write the family a sample Family
// Framework and a day shaped by it - the differentiator, demonstrated instead
// of asserted. Generation is deterministic (instant, never fails, no account).

type Vibe = 'outdoors' | 'calm' | 'handson' | 'books' | 'mix';
type Stance = 'structured' | 'childled' | 'gentle';

interface Answers {
  ages: string;
  county: string;
  vibe: Vibe | '';
  stance: Stance | '';
}

const VIBES: { key: Vibe; label: string }[] = [
  { key: 'outdoors', label: 'Outdoors and active' },
  { key: 'calm', label: 'Calm and cosy' },
  { key: 'handson', label: 'Hands-on and messy' },
  { key: 'books', label: 'Books and stories' },
  { key: 'mix', label: 'A bit of everything' },
];

const STANCES: { key: Stance; label: string; note: string }[] = [
  { key: 'structured', label: 'A shape to the week', note: 'I like a plan to lean on' },
  { key: 'childled', label: 'Led by the child', note: 'We follow their curiosity' },
  { key: 'gentle', label: 'A gentle mix', note: 'Some anchors, lots of room' },
];

const VALUES: Record<Vibe, string> = {
  outdoors: 'Time outside, whatever the weather. Muck, fresh air, and room to roam.',
  calm: 'A calm, unhurried pace. Cosy corners, slow mornings, and no rush.',
  handson: 'Hands busy and a bit of mess. Making, mixing, building, doing.',
  books: 'Stories at the heart of the day. Books, words, and big imaginations.',
  mix: 'A bit of everything. Some days busy, some days still, all of them yours.',
};

const RHYTHM: Record<Stance, string> = {
  structured:
    'You like a shape to the week, so The Hedge gives you a gentle timetable to lean on - anchor points, never a rigid clock.',
  childled:
    'You follow the child, so The Hedge gives you a rhythm, not a timetable - ideas that meet them where they are, day by day.',
  gentle:
    'A gentle mix, so The Hedge keeps a few anchors in the week and leaves plenty of room to follow a tangent when one opens up.',
};

// Three sample ideas, shaped by the family's vibe (and a nod to their county).
function ideasFor(vibe: Vibe, county: string): { name: string; tag: string; cat: string }[] {
  const place = county.trim() || 'your county';
  const pools: Record<Vibe, { name: string; tag: string; cat: string }[]> = {
    outdoors: [
      { name: `A nature hunt down your nearest ${place} lane`, tag: 'Outdoors', cat: 'g' },
      { name: 'Build a fairy house from what you find in the garden', tag: 'Make', cat: 'g' },
      { name: 'Puddle science: where does the rain go?', tag: 'Curious', cat: 't' },
    ],
    calm: [
      { name: 'A slow morning: porridge, a story, and a window watch', tag: 'Cosy', cat: 's' },
      { name: 'Press autumn leaves into a quiet little book', tag: 'Make', cat: 'g' },
      { name: 'Five calm minutes listening for every sound you can hear', tag: 'Still', cat: 's' },
    ],
    handson: [
      { name: 'Kitchen chemistry: a fizzing volcano in the sink', tag: 'Science', cat: 't' },
      { name: 'Build the tallest tower the recycling can manage', tag: 'Make', cat: 'g' },
      { name: 'Salt-dough shapes to bake and paint tomorrow', tag: 'Make', cat: 't' },
    ],
    books: [
      { name: 'Write and post a letter to a hedgehog who needs a home', tag: 'Writing', cat: 's' },
      { name: 'Draw the map of a story you make up together', tag: 'Imagine', cat: 'g' },
      { name: 'A library trip, then a den to read the spoils in', tag: 'Stories', cat: 's' },
    ],
    mix: [
      { name: `A nature hunt down your nearest ${place} lane`, tag: 'Outdoors', cat: 'g' },
      { name: 'Kitchen chemistry: a fizzing volcano in the sink', tag: 'Science', cat: 't' },
      { name: 'A den, a story, and a slow afternoon', tag: 'Cosy', cat: 's' },
    ],
  };
  return pools[vibe];
}

export default function KitchenTableDemo() {
  const [step, setStep] = useState(0); // 0 intro, 1 ages, 2 county, 3 vibe, 4 stance, 5 framework
  const [a, setA] = useState<Answers>({ ages: '', county: '', vibe: '', stance: '' });

  const canAdvance =
    (step === 1 && a.ages.trim().length > 0) ||
    (step === 2 && a.county.trim().length > 0) ||
    (step === 3 && a.vibe !== '') ||
    (step === 4 && a.stance !== '');

  const total = 4;
  const progress = Math.min(step, total);

  return (
    <div className="kt-demo">
      <div className="kt-head">
        <div className="kt-eyebrow">
          <Icon id="leaf" size={12} color="var(--sage)" /> The Kitchen Table
        </div>
        {step > 0 && step < 5 && (
          <div className="kt-progress" aria-hidden>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`kt-dot ${i < progress ? 'on' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* Intro */}
      {step === 0 && (
        <div className="kt-body kt-intro">
          <h3 className="kt-title">Pull up a chair</h3>
          <p className="kt-lead">
            Most apps hand every family the same list. The Hedge sits down with you first. Answer
            four small questions and watch it write your family its own framework - and a day shaped
            around it. No account, no email.
          </p>
          <button className="kt-primary" onClick={() => setStep(1)}>
            Start the conversation <Icon id="arrow-r" size={15} color="currentColor" />
          </button>
          <p className="kt-fineprint">Takes about thirty seconds.</p>
        </div>
      )}

      {/* Q1 ages */}
      {step === 1 && (
        <div className="kt-body">
          <label className="kt-q" htmlFor="kt-ages">Who are we learning with?</label>
          <p className="kt-hint">Their ages are grand - a name or two if you like.</p>
          <input
            id="kt-ages"
            className="kt-input"
            placeholder="e.g. Niamh (7) and Fionn (4)"
            value={a.ages}
            onChange={(e) => setA({ ...a, ages: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && canAdvance && setStep(2)}
            autoFocus
          />
          <div className="kt-actions">
            <button className="kt-primary" disabled={!canAdvance} onClick={() => setStep(2)}>
              Next <Icon id="arrow-r" size={15} color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Q2 county */}
      {step === 2 && (
        <div className="kt-body">
          <label className="kt-q" htmlFor="kt-county">What county are you in?</label>
          <p className="kt-hint">So the weather and the local feel are right.</p>
          <input
            id="kt-county"
            className="kt-input"
            placeholder="e.g. Galway"
            value={a.county}
            onChange={(e) => setA({ ...a, county: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && canAdvance && setStep(3)}
            autoFocus
          />
          <div className="kt-actions">
            <button className="kt-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="kt-primary" disabled={!canAdvance} onClick={() => setStep(3)}>
              Next <Icon id="arrow-r" size={15} color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Q3 vibe */}
      {step === 3 && (
        <div className="kt-body">
          <span className="kt-q">A good day for your family feels like...</span>
          <div className="kt-chips">
            {VIBES.map((v) => (
              <button
                key={v.key}
                className={`kt-chip ${a.vibe === v.key ? 'sel' : ''}`}
                onClick={() => setA({ ...a, vibe: v.key })}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="kt-actions">
            <button className="kt-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="kt-primary" disabled={!canAdvance} onClick={() => setStep(4)}>
              Next <Icon id="arrow-r" size={15} color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Q4 stance */}
      {step === 4 && (
        <div className="kt-body">
          <span className="kt-q">And the way you like to learn leans...</span>
          <div className="kt-chips kt-chips-col">
            {STANCES.map((s) => (
              <button
                key={s.key}
                className={`kt-chip kt-chip-wide ${a.stance === s.key ? 'sel' : ''}`}
                onClick={() => setA({ ...a, stance: s.key })}
              >
                <span className="kt-chip-label">{s.label}</span>
                <span className="kt-chip-note">{s.note}</span>
              </button>
            ))}
          </div>
          <div className="kt-actions">
            <button className="kt-ghost" onClick={() => setStep(3)}>Back</button>
            <button className="kt-primary" disabled={!canAdvance} onClick={() => setStep(5)}>
              Write our framework <Icon id="arrow-r" size={15} color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Framework reveal */}
      {step === 5 && a.vibe !== '' && a.stance !== '' && (
        <div className="kt-body kt-reveal">
          <div className="kt-fw-eyebrow">Your Family Framework</div>
          <h3 className="kt-title">
            {a.ages.trim() ? `Written for ${a.ages.trim()}` : 'Written for your family'}
          </h3>

          <div className="kt-fw-block">
            <div className="kt-fw-label">What matters to you</div>
            <p>{VALUES[a.vibe]}</p>
          </div>
          <div className="kt-fw-block">
            <div className="kt-fw-label">Your rhythm</div>
            <p>{RHYTHM[a.stance]}</p>
          </div>

          <div className="kt-fw-block">
            <div className="kt-fw-label">
              Today, for your family {a.county.trim() ? `in ${a.county.trim()}` : ''}
            </div>
            <div className="kt-ideas">
              {ideasFor(a.vibe, a.county).map((idea) => (
                <div key={idea.name} className={`kt-idea kt-idea-${idea.cat}`}>
                  <span className={`kt-idea-ic kt-ic-${idea.cat}`}>
                    <Icon id={idea.cat === 'g' ? 'leaf' : idea.cat === 't' ? 'flask' : 'book'} size={14} color="currentColor" />
                  </span>
                  <span className="kt-idea-name">{idea.name}</span>
                  <span className={`kt-idea-tag tag-${idea.cat === 's' ? 'g' : idea.cat}`}>{idea.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="kt-save">
            <Link href="https://app.thehedge.ie/signup?from=kitchen-table" className="kt-primary kt-save-btn">
              Save your framework - it&apos;s free <Icon id="arrow-r" size={15} color="currentColor" />
            </Link>
            <p className="kt-fineprint">
              This is a taste. Inside, The Hedge keeps learning your family and shapes every day, your plan,
              and your records around them. No card needed.
            </p>
            <button className="kt-restart" onClick={() => { setStep(0); setA({ ages: '', county: '', vibe: '', stance: '' }); }}>
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
