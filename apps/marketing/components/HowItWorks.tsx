'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Icon } from './Icons';

// "How it works" - a refined numbered rail on the left where the active step
// quietly expands, paired with a landscape, frameless product mockup on the
// right that crossfades per step. Mockups are designed (not screenshots) so
// they stay pixel sharp at any size and on-brand. Auto-advances, pausing on
// interaction.
const STEPS = [
  { n: '1', title: 'Sit down at the Kitchen Table', body: 'A warm few questions about your children, your values and the shape of your days. A conversation, not a setup form.' },
  { n: '2', title: 'Read back your Family Framework', body: 'The Hedge writes your family its own framework and reflects it to you. The way you do things, respected, not overruled.' },
  { n: '3', title: 'Your days, shaped to fit', body: 'Today brings ideas that suit your crew and the weather. Plan gives a gentle rhythm, Keep builds your record, Belong finds your local families.' },
  { n: '4', title: 'Ask, any time', body: 'A calm companion that already knows your framework. Honest about being an AI, never pretending to be a person.' },
];

function Win({ title, tone, children }: { title: string; tone?: string; children: ReactNode }) {
  return (
    <div className={`hiw-win ${tone || ''}`}>
      <div className="hiw-winbar">
        <span className="hiw-dots"><i /><i /><i /></span>
        <span className="hiw-wintitle">{title}</span>
      </div>
      <div className="hiw-winbody">{children}</div>
    </div>
  );
}

const SCREENS = [
  // 1 - Kitchen Table
  <Win key="s1" title="The Kitchen Table">
    <div className="kt-grid">
      <div className="kt-aside">
        <span className="kt-leaf"><Icon id="leaf" size={20} color="var(--parchment)" /></span>
        <div className="kt-aside-t">Pull up a chair</div>
        <div className="kt-aside-b">A warm conversation, not a form.</div>
      </div>
      <div className="kt-main">
        <div className="kt-meta">Niamh, 9 &middot; Fionn, 6</div>
        <div className="kt-q">What made you go looking for something like this?</div>
        <div className="kt-chips">
          <span>I want to do more with them</span>
          <span>We&apos;re wondering about home-ed</span>
          <span className="on">School isn&apos;t quite working</span>
          <span>We already home-educate</span>
        </div>
        <div className="kt-input">or say it your own way<span className="kt-caret" /></div>
      </div>
    </div>
  </Win>,
  // 2 - Family Framework
  <Win key="s2" title="Your Family Framework">
    <div className="fw-grid">
      <div className="fw-main">
        <div className="fw-eyebrow">What we heard</div>
        <div className="fw-h">Written for your family</div>
        <p className="fw-p">You came because you want more of those good moments, the ones where something clicks and you are both in it together.</p>
        <p className="fw-p dim">A gentle structure is what lets you both relax into the learning, so we will always bring you a clear shape for the week.</p>
        <div className="fw-tags"><span>Hands-on</span><span>Outdoors</span><span>Calm pace</span><span>Curious</span></div>
      </div>
      <div className="fw-side">
        <div className="fw-side-h">Your shape</div>
        {['Lots of nature & making', 'A steady weekly rhythm', 'Record that keeps itself'].map((t) => (
          <div key={t} className="fw-side-row"><Icon id="check" size={13} color="var(--moss)" /> {t}</div>
        ))}
      </div>
    </div>
  </Win>,
  // 3 - Today / days
  <Win key="s3" title="Today">
    <div className="td-wrap">
      <div className="td-head">
        <div>
          <div className="td-h">Today with the Ó Briain family</div>
          <div className="td-sub">Galway &middot; Friday &middot; 14°, clear sky</div>
        </div>
        <span className="td-weather"><Icon id="sun" size={16} color="var(--amber)" /></span>
      </div>
      <div className="td-card">
        <span className="td-pill">Movement</span>
        <div className="td-title">Gratitude Scavenger Hunt</div>
        <div className="td-meta">45 min &middot; Outdoors &middot; Ages 5–10</div>
        <div className="td-actions"><span className="td-btn">Let&apos;s do this</span><span className="td-link">Show me another</span></div>
      </div>
      <div className="td-week">
        {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
          <div key={i} className={`td-day ${i === 2 ? 'on' : ''} ${i < 2 ? 'done' : ''}`}><span>{d}</span><i /></div>
        ))}
      </div>
    </div>
  </Win>,
  // 4 - Ask
  <Win key="s4" title="Ask">
    <div className="ask-wrap">
      <div className="ask-row right"><div className="ask-bubble me">How does Tusla home-ed registration actually work?</div></div>
      <div className="ask-row"><div className="ask-bubble hedge">You apply to be entered on the Section 14 Register through Tusla&apos;s AEARS service. There is no required curriculum or set hours, just a certain minimum education. I can help you gather what the assessment looks for, whenever you are ready.</div></div>
      <div className="ask-foot"><Icon id="lock" size={12} color="var(--moss)" /> Private to your family &middot; never used to train AI</div>
    </div>
  </Win>,
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 5200);
    return () => clearInterval(id);
  }, [paused]);

  const select = (i: number) => { setActive(i); setPaused(true); };

  return (
    <div className="hiw" onMouseLeave={() => setPaused(false)}>
      <div className="hiw-rail">
        <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">As easy as it gets</span></div>
        <h2 className="section-title" id="hiw-title">How The Hedge <em>works</em></h2>

        <div className="hiw-steps" role="tablist" aria-label="How The Hedge works">
          {STEPS.map((s, i) => (
            <button
              key={s.n}
              role="tab"
              aria-selected={i === active}
              className={`hiw-step ${i === active ? 'on' : ''}`}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
            >
              <span className="hiw-num">{s.n}</span>
              <span className="hiw-step-tx">
                <span className="hiw-step-title">{s.title}</span>
                <span className="hiw-step-body">{s.body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hiw-stage-wrap" onMouseEnter={() => setPaused(true)}>
        <div className="hiw-stage">
          {SCREENS.map((screen, i) => (
            <div key={i} className={`hiw-screen ${i === active ? 'on' : ''}`} aria-hidden={i !== active}>
              {screen}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
