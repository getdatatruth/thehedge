'use client';

import { useState, useEffect } from 'react';
import { Icon } from './Icons';

// An interactive tour of the product. One consistent phone, one consistent set
// of screens (all real, all the same dimensions). Hover or tap an area on the
// left and the phone switches to it, with a gentle auto-advance that pauses on
// interaction. Same component, same behaviour on desktop and mobile.
const AREAS = [
  { key: 'today', icon: 'sun', t: 'Today', b: 'One gentle idea that fits your children, the weather, and the day. No feed to wade through.', img: '/product/today-mobile.png' },
  { key: 'plan', icon: 'cal', t: 'Plan', b: 'A timetable, or a gentle rhythm. Your week, shaped your way, adapting when life moves.', img: '/product/plan-mobile.png' },
  { key: 'keep', icon: 'book', t: 'Keep', b: 'Your record, kept for you. A journal, a portfolio, and the quiet story of your year.', img: '/product/keep-mobile.png' },
  { key: 'belong', icon: 'users', t: 'Belong', b: 'Your local county group of home-educating families, close to home. You are not doing this alone.', img: '/product/belong-mobile.png' },
  { key: 'ask', icon: 'spark', t: 'Ask', b: 'A calm companion that already knows your family. Private to you, and never used to train AI.', img: '/product/ask-mobile.png' },
];

export default function ProductTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % AREAS.length), 3800);
    return () => clearInterval(id);
  }, [paused]);

  const select = (i: number) => { setActive(i); setPaused(true); };

  return (
    <div className="tour" onMouseLeave={() => setPaused(false)}>
      <div className="tour-list" role="tablist" aria-label="Explore The Hedge">
        {AREAS.map((it, i) => (
          <button
            key={it.key}
            role="tab"
            aria-selected={i === active}
            className={`tour-item ${i === active ? 'on' : ''}`}
            onMouseEnter={() => select(i)}
            onFocus={() => select(i)}
            onClick={() => select(i)}
          >
            <span className="tour-ic"><Icon id={it.icon} size={17} color="currentColor" /></span>
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
            {AREAS.map((it, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={it.key}
                src={it.img}
                alt={`The Hedge - ${it.t}`}
                className={i === active ? 'on' : ''}
                aria-hidden={i !== active}
                loading="lazy"
              />
            ))}
          </div>
        </div>
        <div className="tour-dots" role="tablist" aria-label="Choose a screen">
          {AREAS.map((it, i) => (
            <button
              key={it.key}
              className={`tour-dot ${i === active ? 'on' : ''}`}
              aria-label={it.t}
              aria-selected={i === active}
              onClick={() => select(i)}
            />
          ))}
        </div>
      </div>

      <p className="tour-active-cap">{AREAS[active].b}</p>
    </div>
  );
}
