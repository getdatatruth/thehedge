'use client';

import { useState, useEffect } from 'react';

// The "how it works" section as an interactive walkthrough of the real setup
// journey, with a real screen for each step. Shares the tour styling; the icon
// slot holds the step number. Auto-advances, pausing on interaction.
const STEPS = [
  { n: '1', t: 'Pull up a chair', b: 'A warm few questions about your family. A conversation, not a form. Say as much or as little as you like.', img: '/product/kitchentable-mobile.png' },
  { n: '2', t: 'Meet your Family Framework', b: 'The Hedge writes your family its own framework and reads it back to you. The way you do things, respected, not overruled.', img: '/product/framework-mobile.png' },
  { n: '3', t: 'Your days take shape', b: 'Today brings one gentle idea that fits your crew, the weather, and the day. Personalised from the very first morning.', img: '/product/today-mobile.png' },
  { n: '4', t: 'Your week, kept for you', b: 'A plan that bends to your rhythm, and a record that quietly keeps itself, ready for an AEARS assessment if you ever need it.', img: '/product/plan-mobile.png' },
];

export default function OnboardingWalkthrough() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  const select = (i: number) => { setActive(i); setPaused(true); };

  return (
    <div className="tour" onMouseLeave={() => setPaused(false)}>
      <div className="tour-list" role="tablist" aria-label="How The Hedge works">
        {STEPS.map((it, i) => (
          <button
            key={it.n}
            role="tab"
            aria-selected={i === active}
            className={`tour-item ${i === active ? 'on' : ''}`}
            onMouseEnter={() => select(i)}
            onFocus={() => select(i)}
            onClick={() => select(i)}
          >
            <span className="tour-ic tour-num">{it.n}</span>
            <span className="tour-tx">
              <span className="tour-t">{it.t}</span>
              <span className="tour-b">{it.b}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="tour-device" onMouseEnter={() => setPaused(true)}>
        <div className="tour-phone">
          <div className="tour-screen">
            {STEPS.map((it, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={it.n} src={it.img} alt={it.t} className={i === active ? 'on' : ''} aria-hidden={i !== active} loading="lazy" />
            ))}
          </div>
        </div>
        <div className="tour-dots" role="tablist" aria-label="Choose a step">
          {STEPS.map((it, i) => (
            <button key={it.n} className={`tour-dot ${i === active ? 'on' : ''}`} aria-label={`Step ${it.n}: ${it.t}`} onClick={() => select(i)} />
          ))}
        </div>
      </div>

      <p className="tour-active-cap">{STEPS[active].b}</p>
    </div>
  );
}
