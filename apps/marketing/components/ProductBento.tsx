'use client';

import { Icon } from './Icons';

// "The whole product" as a bento grid: five areas at a glance, each cell its own
// size with a designed mini-mockup. Distinct from the rail+window walkthrough
// above. The Ask cell is dark, as a focal point. Cells lift gently on hover.
export default function ProductBento() {
  return (
    <div className="bento">
      {/* TODAY - wide hero cell */}
      <a href="https://app.thehedge.ie/signup" className="bento-cell b-today">
        <div className="b-today-tx">
          <div className="b-label"><span className="b-ic"><Icon id="sun" size={15} color="var(--moss)" /></span> Today</div>
          <div className="b-title">One gentle idea a day</div>
          <p className="b-desc">Shaped to your children, your county and the weather. No feed to wade through, just the next good thing to do together.</p>
        </div>
        <div className="bt-card">
          <div className="bt-weather"><Icon id="sun" size={13} color="var(--amber)" /> Galway &middot; 14°, clear</div>
          <span className="bt-pill">Nature</span>
          <div className="bt-title">Rockpool treasure hunt</div>
          <div className="bt-meta">40 min &middot; Outdoors</div>
          <span className="bt-btn">Let&apos;s do this</span>
        </div>
      </a>

      {/* ASK - tall dark cell */}
      <a href="https://app.thehedge.ie/signup" className="bento-cell b-ask">
        <div className="b-label dark"><span className="b-ic dark"><Icon id="spark" size={15} color="var(--sage)" /></span> Ask</div>
        <div className="b-title dark">A companion that already knows your family</div>
        <div className="ba-chat">
          <div className="ba-bubble me">A rainy Tuesday idea for a 6 year old?</div>
          <div className="ba-bubble hedge">Fionn loves making things, so try a shoebox diorama of the rockpool you visited. I can add it to today if you like.</div>
        </div>
        <div className="ba-chips"><span>Plan our week</span><span>A calm activity</span><span>Tusla help</span></div>
        <div className="ba-foot"><Icon id="lock" size={12} color="var(--sage)" /> Private to you &middot; never used to train AI</div>
      </a>

      {/* PLAN */}
      <a href="https://app.thehedge.ie/signup" className="bento-cell b-plan">
        <div className="b-label"><span className="b-ic"><Icon id="cal" size={15} color="var(--moss)" /></span> Plan</div>
        <p className="b-desc">A timetable, or a gentle rhythm. Your week, shaped your way.</p>
        <div className="bp-week">
          {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
            <div key={i} className={`bp-day ${i === 2 ? 'on' : ''} ${i < 2 ? 'done' : ''}`}><span>{d}</span><i /></div>
          ))}
        </div>
      </a>

      {/* KEEP */}
      <a href="https://app.thehedge.ie/signup" className="bento-cell b-keep">
        <div className="b-label"><span className="b-ic"><Icon id="book" size={15} color="var(--moss)" /></span> Keep</div>
        <p className="b-desc">A record that keeps itself, ready for AEARS.</p>
        <div className="bk-tiles">
          <span className="bk-t t1" /><span className="bk-t t2" /><span className="bk-t t3" />
          <span className="bk-more">+12</span>
        </div>
      </a>

      {/* BELONG - wide cell */}
      <a href="https://app.thehedge.ie/signup" className="bento-cell b-belong">
        <div className="b-belong-tx">
          <div className="b-label"><span className="b-ic"><Icon id="users" size={15} color="var(--moss)" /></span> Belong</div>
          <div className="b-title">Your local home-ed families, close to home</div>
          <p className="b-desc">A county group of families doing the same as you. You are not on your own with this.</p>
        </div>
        <div className="bb-people">
          <div className="bb-avatars">
            {['A', 'M', 'S', 'L', 'C'].map((c, i) => <span key={i} className={`bb-av av${i}`}>{c}</span>)}
          </div>
          <span className="bb-chip"><Icon id="map" size={12} color="var(--moss)" /> Galway &middot; 34 families</span>
        </div>
      </a>
    </div>
  );
}
