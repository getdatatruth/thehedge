'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './Icons';

// The original "How it works" steps, kept exactly as they looked, now made
// interactive: hover or tap a step and it lifts with a soft shadow while the
// right side swaps to a clean, frameless mockup of that screen.
const STEPS = [
  { n: '01', id: 'leaf',  title: 'Sit down at the Kitchen Table', body: 'A warm few questions about your children, your values and the shape of your days. A conversation, not a setup form.', img: '/product/kitchentable-mobile.png' },
  { n: '02', id: 'spark', title: 'Read back your Family Framework', body: 'The Hedge writes your family its own framework and reflects it to you. The way you do things, respected, not overruled.', img: '/product/framework-mobile.png' },
  { n: '03', id: 'sun',   title: 'Your days, shaped to fit', body: 'Today brings ideas that suit your crew and the weather. Plan gives you a timetable or a gentle rhythm. Keep quietly builds your record. Belong finds your local families.', img: '/product/today-mobile.png' },
  { n: '04', id: 'users', title: 'Ask, any time', body: 'A calm companion that knows your framework. Honest about being an AI, never pretending to be a person.', img: '/product/ask-mobile.png' },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4500);
    return () => clearInterval(id);
  }, [paused]);

  const select = (i: number) => { setActive(i); setPaused(true); };

  return (
    <div className="hiw" onMouseLeave={() => setPaused(false)}>
      <div className="hiw-left">
        <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">As easy as it gets</span></div>
        <h2 className="section-title" id="hiw-title">How The Hedge <em>works</em></h2>
        <p className="section-body" style={{ maxWidth: 520 }}>It begins with a conversation, not a form. Then everything is shaped around what you tell it.</p>

        <div className="hiw-steps">
          {STEPS.map((s, i) => (
            <button
              key={s.n}
              className={`hiw-step ${i === active ? 'on' : ''}`}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              aria-pressed={i === active}
            >
              <div className="step-num">{s.n}</div>
              <div>
                <div className="step-ic"><Icon id={s.id} size={18} color="var(--moss)" /></div>
                <div className="step-title">{s.title}</div>
                <div className="step-body">{s.body}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <Link href="/how-it-works" className="btn-ghost">See full walkthrough <Icon id="arrow-r" size={14} /></Link>
        </div>
      </div>

      <div className="hiw-media-wrap" onMouseEnter={() => setPaused(true)}>
        <div className="hiw-media">
          {STEPS.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.n} src={s.img} alt={s.title} className={i === active ? 'on' : ''} aria-hidden={i !== active} loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}
