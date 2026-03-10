export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
<!-- INLINE SVG ICONS -->
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12C12 7 7 4 7 4s-1 4 2 6c-3 0-5 3-5 3s3 1 5-1c0 2 1 4 3 5z"/><path d="M12 12c0-5 5-8 5-8s1 4-2 6c3 0 5 3 5 3s-3 1-5-1"/></symbol>
  <symbol id="ic-cloudsun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="3"/><path d="M12 3v1M18.36 5.64l-.7.7M21 12h-1M18.36 18.36l-.7-.7M12 21v-1M5.34 18.36l.7-.7M3 12h1M5.34 5.64l.7.7"/><path d="M6.5 17A3.5 3.5 0 0 1 6.5 10H7a5 5 0 0 1 9.9 1H18a2.5 2.5 0 0 1 0 5H6.5z"/></symbol>
  <symbol id="ic-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06"/></symbol>
  <symbol id="ic-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></symbol>
  <symbol id="ic-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
  <symbol id="ic-offline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M12 20h.01"/></symbol>
  <symbol id="ic-cpu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></symbol>
  <symbol id="ic-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></symbol>
  <symbol id="ic-calc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10v.01M8 14h2M12 14h2M16 14v.01M8 18h2M12 18h2M16 18v.01"/></symbol>
  <symbol id="ic-tree" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14l-5-9-5 9h4v6h2v-6z"/></symbol>
  <symbol id="ic-science" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></symbol>
  <symbol id="ic-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8a4 4 0 1 0 4 4"/></symbol>
  <symbol id="ic-food" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></symbol>
  <symbol id="ic-pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></symbol>
  <symbol id="ic-zap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
  <symbol id="ic-clover" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="8" cy="16" r="3"/><circle cx="16" cy="16" r="3"/><path d="M12 12v8"/></symbol>
  <symbol id="ic-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></symbol>
  <symbol id="ic-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></symbol>
  <symbol id="ic-bar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></symbol>
  <symbol id="ic-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></symbol>
  <symbol id="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></symbol>
  <symbol id="ic-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></symbol>
  <symbol id="ic-arr-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></symbol>
  <symbol id="ic-arr-d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></symbol>
  <symbol id="ic-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
  <symbol id="ic-msg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></symbol>
  <symbol id="ic-star" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
  <symbol id="ic-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></symbol>
  <symbol id="ic-ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></symbol>
  <symbol id="ic-fb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
  <symbol id="ic-tw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M4 20L20 4"/></symbol>
  <symbol id="ic-person" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></symbol>
</svg>

<!-- NAV -->
<nav>
  <a class="nav-logo" href="#">
    <div class="logo-mark">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(200,223,200,0.9)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12C12 7 7 4 7 4s-1 4 2 6c-3 0-5 3-5 3s3 1 5-1c0 2 1 4 3 5z"/><path d="M12 12c0-5 5-8 5-8s1 4-2 6c3 0 5 3 5 3s-3 1-5-1"/></svg>
    </div>
    <div><div class="nav-name">The Hedge</div><div class="nav-domain">thehedge.ie</div></div>
  </a>
  <ul class="nav-links">
    <li><a href="#">How it works</a></li><li><a href="#">Features</a></li><li><a href="#">Homeschool</a></li><li><a href="#">Pricing</a></li><li><a href="#">Community</a></li>
  </ul>
  <div style="display:flex;align-items:center;gap:20px">
    <a style="font-size:13px;font-weight:500;color:var(--umber);text-decoration:none" href="#">Sign in</a>
    <a class="nav-cta" href="#">Start free today</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <div class="eyebrow"><div class="eyebrow-line"></div><span class="eyebrow-text">Inspired by Ireland's hedge schools</span></div>
    <h1 class="hero-headline">What will<br>your family<br>do <em>today</em>?</h1>
    <p class="hero-body">Personalised activities for Irish families — shaped by your children, your weather, and your world.</p>
    <p class="hero-sub">For homeschool families, it's the complete education system Ireland has been missing. <strong>Tusla-ready. NCCA-mapped. Built with love.</strong></p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Start free today <svg width="16" height="16"><use href="#ic-arr-r"/></svg></a>
      <a class="btn-ghost" href="#">See how it works <svg width="14" height="14"><use href="#ic-arr-d"/></svg></a>
    </div>
    <div class="proof">
      <div class="avatars">
        <div class="av"><svg width="16" height="16" stroke="var(--clay)"><use href="#ic-person"/></svg></div>
        <div class="av"><svg width="16" height="16" stroke="var(--clay)"><use href="#ic-person"/></svg></div>
        <div class="av"><svg width="16" height="16" stroke="var(--clay)"><use href="#ic-person"/></svg></div>
        <div class="av"><svg width="16" height="16" stroke="var(--clay)"><use href="#ic-person"/></svg></div>
        <div class="av"><svg width="16" height="16" stroke="var(--clay)"><use href="#ic-person"/></svg></div>
      </div>
      <div>
        <div class="stars" style="margin-left:8px">★★★★★</div>
        <div class="proof-label"><strong>2,000+ Irish families</strong> already learning together</div>
      </div>
    </div>
  </div>
  <div class="hero-right">
    <div class="hvc">
      <div class="app-card">
        <div class="ach">
          <div class="chip"><svg width="10" height="10"><use href="#ic-cloudsun"/></svg> Cork · Tuesday</div>
          <div class="greeting">Good morning,<br><em>Sarah's family</em></div>
        </div>
        <div class="weather-row"><span class="w-loc">14°C · Dry afternoon ahead</span><span class="w-val">Go outside</span></div>
        <div class="acts">
          <div class="act-lbl">Today's spraoi</div>
          <div class="act-row ar-green"><div class="act-ic aic-g"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-leaf"/></svg></div><div style="flex:1"><div class="act-name">Fairy house in the garden</div><div class="act-meta"><span class="tag tag-g">30 min</span><span class="tag tag-t">Age 3–7</span></div></div><svg width="14" height="14" stroke="rgba(245,240,228,0.25)"><use href="#ic-arr-r"/></svg></div>
          <div class="act-row ar-stone"><div class="act-ic aic-s"><svg width="18" height="18" stroke="var(--mist)"><use href="#ic-calc"/></svg></div><div style="flex:1"><div class="act-name">Kitchen measurement challenge</div><div class="act-meta"><span class="tag tag-g">20 min</span><span class="tag tag-t">Age 7+</span></div></div><svg width="14" height="14" stroke="rgba(245,240,228,0.25)"><use href="#ic-arr-r"/></svg></div>
          <div class="act-row ar-terra"><div class="act-ic aic-t"><svg width="18" height="18" stroke="#E8A88A"><use href="#ic-science"/></svg></div><div style="flex:1"><div class="act-name">Shadow tracking science</div><div class="act-meta"><span class="tag tag-g">45 min</span><span class="tag tag-t">All ages</span></div></div><svg width="14" height="14" stroke="rgba(245,240,228,0.25)"><use href="#ic-arr-r"/></svg></div>
        </div>
      </div>
      <div class="fl1">
        <div class="fl1-lbl">Suggested</div>
        <div class="fl1-ic"><svg width="16" height="16" stroke="var(--forest)"><use href="#ic-tree"/></svg></div>
        <div class="fl1-ttl">Rock pool science expedition</div>
        <div class="fl1-tags"><span class="fl1-tag">1 hr</span><span class="fl1-tag">5–12</span></div>
      </div>
      <div class="fl2">
        <div class="fl2-hd"><svg width="14" height="14" stroke="var(--sage)"><use href="#ic-shield"/></svg><div class="fl2-ttl">Tusla portfolio coverage</div></div>
        <div class="fl2-bar"><div class="fl2-fill"></div></div>
        <div class="fl2-stat">73% complete this month</div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section style="background:var(--parchment)"><div class="hiw">
  <div>
    <div class="sec-lbl"><div class="sec-lbl-line"></div><span class="sec-lbl-text">As easy as it gets</span></div>
    <h2 class="sec-title">How The Hedge<br><em>works</em></h2>
    <p class="sec-body">From your first morning to your hundredth adventure — it gets better the more you use it.</p>
    <div class="steps">
      <div class="step"><div class="step-num">01</div><div><div class="step-ic"><svg width="20" height="20" stroke="var(--moss)"><use href="#ic-users"/></svg></div><div class="step-title">Tell us about your family</div><div class="step-body">A quick 2-minute setup. Children's ages, what they love, your outdoor space. The Hedge does the rest.</div></div></div>
      <div class="step"><div class="step-num">02</div><div><div class="step-ic"><svg width="20" height="20" stroke="var(--moss)"><use href="#ic-cloudsun"/></svg></div><div class="step-title">We check the weather for you</div><div class="step-body">Every morning, The Hedge looks at your local forecast and picks activities that actually make sense.</div></div></div>
      <div class="step"><div class="step-num">03</div><div><div class="step-ic"><svg width="20" height="20" stroke="var(--moss)"><use href="#ic-sparkle"/></svg></div><div class="step-title">Get your today's spraoi</div><div class="step-body">Three to five personalised activity cards, ready before you've had your tea.</div></div></div>
      <div class="step"><div class="step-num">04</div><div><div class="step-ic"><svg width="20" height="20" stroke="var(--moss)"><use href="#ic-camera"/></svg></div><div class="step-title">Log it, treasure it</div><div class="step-body">One tap when done. Add a photo. Builds your family timeline and Tusla portfolio automatically.</div></div></div>
    </div>
  </div>
  <div class="hiw-vis">
    <div class="hiw-vis-title">This week for your family</div>
    <div class="hiw-vis-sub">Cork · October · Mixed weather</div>
    <div class="week">
      <div class="wd wd-past"><span class="wd-day">Mon</span><div class="wd-acts"><span class="wd-act"><svg width="10" height="10" stroke="var(--umber)"><use href="#ic-tree"/></svg> Nature walk</span><span class="wd-act"><svg width="10" height="10" stroke="var(--umber)"><use href="#ic-food"/></svg> Baking</span></div><svg width="14" height="14" stroke="var(--moss)"><use href="#ic-check"/></svg></div>
      <div class="wd wd-past"><span class="wd-day">Tue</span><div class="wd-acts"><span class="wd-act"><svg width="10" height="10" stroke="var(--umber)"><use href="#ic-science"/></svg> Science</span><span class="wd-act"><svg width="10" height="10" stroke="var(--umber)"><use href="#ic-art"/></svg> Art</span></div><svg width="14" height="14" stroke="var(--moss)"><use href="#ic-check"/></svg></div>
      <div class="wd wd-today"><span class="wd-day">Wed</span><div class="wd-acts"><span class="wd-act"><svg width="10" height="10" stroke="var(--mist)"><use href="#ic-leaf"/></svg> Fairy house</span><span class="wd-act"><svg width="10" height="10" stroke="var(--mist)"><use href="#ic-science"/></svg> Science</span></div><svg width="14" height="14" stroke="var(--mist)"><use href="#ic-arr-r"/></svg></div>
      <div class="wd wd-future"><span class="wd-day">Thu</span><div class="wd-acts"><span class="wd-act"><svg width="10" height="10" stroke="var(--clay)"><use href="#ic-map"/></svg> Rock pool</span><span class="wd-act"><svg width="10" height="10" stroke="var(--clay)"><use href="#ic-book"/></svg> Reading</span></div><svg width="14" height="14" stroke="var(--clay)" style="opacity:0.25"><use href="#ic-check"/></svg></div>
      <div class="wd wd-future"><span class="wd-day">Fri</span><div class="wd-acts"><span class="wd-act"><svg width="10" height="10" stroke="var(--clay)"><use href="#ic-zap"/></svg> Active</span><span class="wd-act"><svg width="10" height="10" stroke="var(--clay)"><use href="#ic-pen"/></svg> Writing</span></div><svg width="14" height="14" stroke="var(--clay)" style="opacity:0.25"><use href="#ic-check"/></svg></div>
    </div>
    <div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--stone);text-align:center"><a class="btn-primary" href="#" style="display:inline-flex;font-size:13px;padding:12px 24px">Get started — it's free <svg width="14" height="14"><use href="#ic-arr-r"/></svg></a></div>
  </div>
</div></section>

<!-- FEATURES -->
<section class="features"><div class="feat-inner">
  <div class="feat-top">
    <div><div style="display:flex;align-items:center;gap:14px;margin-bottom:20px"><div style="width:32px;height:1px;background:var(--terracotta)"></div><span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--sage)">200+ activities</span></div><h2 class="feat-stl">Something for every<br>mood, <em>every weather</em></h2></div>
    <p class="feat-body">Every activity tagged by age, duration, energy level, mess level, indoor/outdoor, and season. Filtered to what actually works today.</p>
  </div>
  <div class="cat-list">
    <div class="cat-item"><span class="cat-num">01</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-tree"/></svg></div><div><div class="cat-name">Nature & Outdoor</div><div class="cat-count">48 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">02</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-science"/></svg></div><div><div class="cat-name">Science & Discovery</div><div class="cat-count">36 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">03</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-art"/></svg></div><div><div class="cat-name">Art & Creativity</div><div class="cat-count">42 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">04</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-food"/></svg></div><div><div class="cat-name">Kitchen & Food</div><div class="cat-count">29 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">05</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-pen"/></svg></div><div><div class="cat-name">Literacy & Language</div><div class="cat-count">33 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">06</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-calc"/></svg></div><div><div class="cat-name">Maths in Real Life</div><div class="cat-count">27 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">07</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-zap"/></svg></div><div><div class="cat-name">Movement & Play</div><div class="cat-count">31 activities</div></div></div>
    <div class="cat-item"><span class="cat-num">08</span><div class="cat-ic"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-clover"/></svg></div><div><div class="cat-name">Irish Heritage</div><div class="cat-count">24 activities</div></div></div>
  </div>
  <div class="feat-trio">
    <div class="feat-card"><div class="feat-ic"><svg width="24" height="24" stroke="var(--sage)"><use href="#ic-calendar"/></svg></div><h3 class="feat-title">Weekend Planner</h3><p class="feat-body2">Every Thursday, weather-based plan for Saturday and Sunday. Editable, shareable, grand.</p></div>
    <div class="feat-card"><div class="feat-ic"><svg width="24" height="24" stroke="var(--sage)"><use href="#ic-offline"/></svg></div><h3 class="feat-title">Works Offline</h3><p class="feat-body2">Today's activities are cached. No signal at the beach? You've still got your ideas. Go.</p></div>
    <div class="feat-card"><div class="feat-ic"><svg width="24" height="24" stroke="var(--sage)"><use href="#ic-cpu"/></svg></div><h3 class="feat-title">AI Chat Built In</h3><p class="feat-body2">"We're stuck in Dublin airport with a 4-year-old." Instant ideas. Powered by Claude.</p></div>
  </div>
</div></section>

<!-- HOMESCHOOL -->
<section class="hs"><div class="hs-inner">
  <div class="hs-hdr">
    <div><div class="sec-lbl"><div class="sec-lbl-line"></div><span class="sec-lbl-text">For homeschool families</span></div><h2 class="hs-title">The complete education system <em>Ireland's been missing</em></h2></div>
    <p class="hs-intro">Ireland has <strong>3,500+ registered homeschool families</strong> — growing 20% every year. Until now, there's been no dedicated tool. The Hedge changes that.</p>
  </div>
  <div class="hs-grid">
    <div class="sched-card">
      <div class="sched-hd"><div><h3>Monday's Plan</h3><p>Oisín (9) · Aoife (6)</p></div><svg width="20" height="20" stroke="var(--sage)"><use href="#ic-calendar"/></svg></div>
      <div class="sched-body">
        <div class="sched-lbl">Oisín — age 9</div>
        <div class="sched-blk sb-g"><div class="subj-ic si-math"><svg width="14" height="14" stroke="var(--forest)"><use href="#ic-calc"/></svg></div><div style="flex:1"><div class="subj">Maths</div><div class="sched-act">Fractions with pizza slices</div></div><div class="sched-right"><span class="outcome">N3.2</span><span class="sched-time">30 min</span><div class="sched-circ"></div></div></div>
        <div class="sched-blk sb-l"><div class="subj-ic si-eng"><svg width="14" height="14" stroke="var(--terracotta)"><use href="#ic-pen"/></svg></div><div style="flex:1"><div class="subj">English</div><div class="sched-act">Creative writing — a day in a castle</div></div><div class="sched-right"><span class="outcome">L2.4</span><span class="sched-time">30 min</span><div class="sched-circ"></div></div></div>
        <div class="sched-blk sb-g"><div class="subj-ic si-nat"><svg width="14" height="14" stroke="var(--forest)"><use href="#ic-tree"/></svg></div><div style="flex:1"><div class="subj">Nature</div><div class="sched-act">Bird identification walk</div></div><div class="sched-right"><span class="outcome">S1.3</span><span class="sched-time">45 min</span><div class="sched-circ"></div></div></div>
        <div class="sched-lbl" style="margin-top:14px">Together</div>
        <div class="sched-blk" style="background:rgba(28,53,32,0.04)"><div class="subj-ic si-irish"><svg width="14" height="14" stroke="var(--amber)"><use href="#ic-clover"/></svg></div><div style="flex:1"><div class="subj">Irish</div><div class="sched-act">Vocabulary game — colours and animals</div></div><div class="sched-right"><span class="sched-time">15 min</span><div class="sched-circ"></div></div></div>
      </div>
      <div class="tusla-ft"><div><div class="tusla-lbl">Tusla coverage today</div><div class="tusla-sub">All 5 curriculum areas ✓</div></div><div class="tusla-badge">87%</div></div>
    </div>
    <div>
      <h3 style="font-family:var(--font-display);font-size:26px;font-weight:400;color:var(--ink);margin-bottom:12px">Tusla AEARS compliance — <em>handled</em></h3>
      <p style="font-family:var(--font-serif);color:var(--clay);line-height:1.7;margin-bottom:28px;font-size:15px">Three weeks before your assessment, tap "Prepare for Assessment." The Hedge generates your complete portfolio. Walk in confident.</p>
      <div class="hs-feats">
        <div class="hs-feat"><div class="hf-ic"><svg width="20" height="20" stroke="var(--forest)"><use href="#ic-shield"/></svg></div><div><div class="hf-title">Application Guidance</div><div class="hf-body">Step-by-step AEARS walkthrough. No more guessing what to write.</div></div></div>
        <div class="hs-feat"><div class="hf-ic"><svg width="20" height="20" stroke="var(--forest)"><use href="#ic-file"/></svg></div><div><div class="hf-title">Education Plan PDF</div><div class="hf-body">Auto-generated, curriculum-mapped, professionally formatted.</div></div></div>
        <div class="hs-feat"><div class="hf-ic"><svg width="20" height="20" stroke="var(--forest)"><use href="#ic-folder"/></svg></div><div><div class="hf-title">Portfolio Builder</div><div class="hf-body">Photos and work samples collected automatically as you go.</div></div></div>
        <div class="hs-feat"><div class="hf-ic"><svg width="20" height="20" stroke="var(--forest)"><use href="#ic-bar"/></svg></div><div><div class="hf-title">Coverage Dashboard</div><div class="hf-body">Traffic-light view of every curriculum area.</div></div></div>
      </div>
      <div class="hs-quote"><div class="hs-quote-text">"I walked into our Tusla assessment with a 47-page portfolio from The Hedge. The assessor said it was the most thorough she'd seen."</div><div class="hs-quote-by">— Emma, homeschooling mam of 2, County Clare</div></div>
    </div>
  </div>
  <div class="ncca"><div><h3>Mapped to the NCCA Primary Curriculum</h3><p>Language · Mathematics · Science & Technology · Social & Environmental Education · Arts · PE · SPHE/Wellbeing</p><div class="stages"><span class="stage">Stage 1 — Junior/Senior Infants</span><span class="stage">Stage 2 — 1st & 2nd Class</span><span class="stage">Stage 3 — 3rd & 4th Class</span><span class="stage">Stage 4 — 5th & 6th Class</span></div></div><a class="btn-primary" href="#" style="white-space:nowrap;flex-shrink:0">Start Educator plan <svg width="14" height="14"><use href="#ic-arr-r"/></svg></a></div>
</div></section>

<!-- TESTIMONIALS -->
<section class="testi"><div class="testi-inner">
  <div class="testi-hdr">
    <div><div class="sec-lbl"><div class="sec-lbl-line"></div><span class="sec-lbl-text">What families say</span></div><h2 class="sec-title">They said it better<br><em>than we could</em></h2></div>
    <p class="sec-body" style="align-self:end">Over 2,000 Irish families using The Hedge every day, from Donegal to Cork.</p>
  </div>
  <div class="testi-grid">
    <div class="tc tc-l"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"I used to spend 20 minutes every Saturday on Pinterest looking for ideas. Now The Hedge just tells me what to do and I actually enjoy the weekend."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--clay)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Sarah M.</div><div class="tc-role">Mam of two, Cork</div></div></div><span class="tc-plan">Family</span></div></div>
    <div class="tc tc-f"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"We've been homeschooling 3 years and this is the first tool that actually understands what we need. The Tusla portfolio alone is worth every cent."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Fionnuala O'B.</div><div class="tc-role">Homeschooling mam, Galway</div></div></div><span class="tc-plan">Educator</span></div></div>
    <div class="tc tc-l"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"My 7-year-old now asks me every morning what The Hedge has for us today. That's the best review I can give."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--clay)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Declan F.</div><div class="tc-role">Dad of one, Dublin</div></div></div><span class="tc-plan">Family</span></div></div>
    <div class="tc tc-f"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"The Irish language games are brilliant. My kids think they're playing. I know they're actually learning Irish. Grand."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--sage)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Áine C.</div><div class="tc-role">Mam of two, Waterford</div></div></div><span class="tc-plan">Free</span></div></div>
    <div class="tc tc-l"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"I pulled my son from school in January. By March, The Hedge had us on a proper rhythm. I can't imagine doing this without it."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--clay)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Orla K.</div><div class="tc-role">Homeschooling mam, Limerick</div></div></div><span class="tc-plan">Educator</span></div></div>
    <div class="tc tc-l"><div class="tc-stars"><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg><svg width="13" height="13" fill="var(--amber)"><use href="#ic-star"/></svg></div><p class="tc-quote">"The weekend planner is class. Thursday evening I know exactly what we're doing Saturday and Sunday. Weather already factored in."</p><div class="tc-author"><div style="display:flex;align-items:center;gap:10px"><div class="tc-av"><svg width="18" height="18" stroke="var(--clay)"><use href="#ic-person"/></svg></div><div><div class="tc-name">Páraic B.</div><div class="tc-role">Dad of three, Tipperary</div></div></div><span class="tc-plan">Family</span></div></div>
  </div>
</div></section>

<!-- PRICING -->
<section class="pricing"><div class="pricing-inner">
  <div class="pricing-hdr">
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:20px"><div style="width:32px;height:1px;background:var(--terracotta)"></div><span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--terracotta)">Simple pricing</span><div style="width:32px;height:1px;background:var(--terracotta)"></div></div>
    <h2 style="font-family:var(--font-display);font-size:48px;font-weight:300;color:var(--ink);line-height:1.02;letter-spacing:-0.02em">Start free.<br><em style="color:var(--moss)">Upgrade when you're ready.</em></h2>
    <p style="font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--clay);margin-top:8px">All plans cover unlimited children. No hidden fees. Cancel any time.</p>
  </div>
  <div class="toggle-wrap"><div class="toggle"><button class="on" id="tm">Monthly</button><button id="ta">Annual <span class="save-badge">Save 30%</span></button></div></div>
  <div class="price-grid">
    <div class="pc pc-paper"><div class="pc-name">Free</div><div class="pc-tag">Get started today</div><div class="pc-price"><sup>€</sup>0</div><a class="pc-btn pcb-outline" href="#">Get started free</a><ul class="pc-feats"><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">1–2 activity ideas per day</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Limited content library</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">AI suggestions (5/week)</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Community — read only</span></li><li class="ft-faded"><svg width="12" height="12" stroke="var(--stone)" style="flex-shrink:0;margin-top:2px"><use href="#ic-x"/></svg><span class="ft-d">Weekend & holiday planner</span></li><li class="ft-faded"><svg width="12" height="12" stroke="var(--stone)" style="flex-shrink:0;margin-top:2px"><use href="#ic-x"/></svg><span class="ft-d">Curriculum engine</span></li><li class="ft-faded"><svg width="12" height="12" stroke="var(--stone)" style="flex-shrink:0;margin-top:2px"><use href="#ic-x"/></svg><span class="ft-d">Tusla compliance tools</span></li></ul></div>
    <div class="pc pc-forest"><div class="pc-pop">Most popular</div><div class="pc-name">Family</div><div class="pc-tag">For everyday family life</div><div class="pc-price"><sup>€</sup>6.99<small>/mo</small></div><a class="pc-btn pcb-terra" href="#">Start Family plan</a><ul class="pc-feats"><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">5+ personalised ideas per day</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">Full library (200+ activities)</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">Weekend & holiday planner</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">AI assistant (30/week)</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">iPad child app</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">Full community access</span></li><li><svg width="14" height="14" stroke="var(--sage)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-l">Family photo timeline</span></li><li class="ft-faded"><svg width="12" height="12" stroke="rgba(143,175,126,0.5)" style="flex-shrink:0;margin-top:2px"><use href="#ic-x"/></svg><span class="ft-l">Curriculum engine</span></li><li class="ft-faded"><svg width="12" height="12" stroke="rgba(143,175,126,0.5)" style="flex-shrink:0;margin-top:2px"><use href="#ic-x"/></svg><span class="ft-l">Tusla compliance tools</span></li></ul></div>
    <div class="pc pc-paper"><div class="pc-name">Educator</div><div class="pc-tag">The complete homeschool system</div><div class="pc-price"><sup>€</sup>14.99<small>/mo</small></div><a class="pc-btn pcb-sage" href="#">Start Educator plan</a><ul class="pc-feats"><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Everything in Family</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">NCCA curriculum engine</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Tusla AEARS compliance suite</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Portfolio auto-builder</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Coverage dashboard</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Progress & attendance reports</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Full SEN support + IEP tools</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Unlimited AI assistant</span></li><li><svg width="14" height="14" stroke="var(--moss)" style="flex-shrink:0;margin-top:1px"><use href="#ic-check"/></svg><span class="ft-d">Assessment prep kit</span></li></ul></div>
  </div>
  <p style="text-align:center;font-size:12px;color:var(--clay);margin-top:8px;display:flex;align-items:center;justify-content:center;gap:6px"><svg width="13" height="13" stroke="var(--clay)"><use href="#ic-lock"/></svg> Secure payments via Stripe · GDPR compliant · EU data residency · Cancel any time</p>
</div></section>

<!-- COMMUNITY -->
<section class="comm"><div class="comm-inner">
  <div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px"><div style="width:32px;height:1px;background:var(--sage)"></div><span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--sage)">You're not alone</span></div>
    <h2 class="comm-title">A community of<br><em>curious Irish families</em></h2>
    <p class="comm-body">County groups, local events, curriculum swaps, co-ops, and mentors. Where families find each other.</p>
    <div class="counties"><span class="ctag">Dublin</span><span class="ctag">Cork</span><span class="ctag">Galway</span><span class="ctag">Limerick</span><span class="ctag">Waterford</span><span class="ctag">Clare</span><span class="ctag">Kerry</span><span class="ctag">Tipperary</span><span class="ctag">Kilkenny</span><span class="ctag">Wexford</span><span class="ctag">Wicklow</span><span class="ctag">Kildare</span><span class="ctag ctag-a">+ all 32 counties</span></div>
    <div class="comm-stats"><div><div class="cs-n">32</div><div class="cs-l">County groups</div></div><div><div class="cs-n">2k+</div><div class="cs-l">Families</div></div><div><div class="cs-n">Monthly</div><div class="cs-l">Local events</div></div></div>
  </div>
  <div class="post-feed">
    <div class="post"><div class="post-hd"><div class="post-au"><div class="post-av"><svg width="16" height="16" stroke="var(--sage)"><use href="#ic-person"/></svg></div><div><div class="post-name">Máire, Dublin</div><div class="post-when">2h ago</div></div></div><span class="post-topic">Nature</span></div><p class="post-body">Does anyone know of a good foraging walk near Dublin 15 this weekend? Kids are 5 &amp; 8.</p><div class="post-rep"><svg width="12" height="12" stroke="var(--sage)"><use href="#ic-msg"/></svg> 7 replies</div></div>
    <div class="post"><div class="post-hd"><div class="post-au"><div class="post-av"><svg width="16" height="16" stroke="var(--sage)"><use href="#ic-person"/></svg></div><div><div class="post-name">Sinéad, Galway</div><div class="post-when">4h ago</div></div></div><span class="post-topic">Homeschool</span></div><p class="post-body">Just finished our first Tusla assessment using The Hedge portfolio. Highly recommend the 3-week prep kit.</p><div class="post-rep"><svg width="12" height="12" stroke="var(--sage)"><use href="#ic-msg"/></svg> 12 replies</div></div>
    <div class="post"><div class="post-hd"><div class="post-au"><div class="post-av"><svg width="16" height="16" stroke="var(--sage)"><use href="#ic-person"/></svg></div><div><div class="post-name">Ciarán, Cork</div><div class="post-when">Yesterday</div></div></div><span class="post-topic">Activities</span></div><p class="post-body">Fairy house build was a massive hit. Three hours, no screens, no complaints. Only The Hedge gets it.</p><div class="post-rep"><svg width="12" height="12" stroke="var(--sage)"><use href="#ic-msg"/></svg> 4 replies</div></div>
  </div>
</div></section>

<!-- FOOTER -->
<footer><div class="ft-inner">
  <div class="ft-grid">
    <div><div class="ft-brand">The Hedge</div><div class="ft-tagline">Where curious families learn.<br>Inspired by Ireland's hedge schools.</div><div class="ft-socials"><div class="ft-soc"><svg width="16" height="16" stroke="rgba(143,175,126,0.6)"><use href="#ic-ig"/></svg></div><div class="ft-soc"><svg width="16" height="16" stroke="rgba(143,175,126,0.6)"><use href="#ic-fb"/></svg></div><div class="ft-soc"><svg width="16" height="16" stroke="rgba(143,175,126,0.6)"><use href="#ic-tw"/></svg></div></div></div>
    <div class="ft-col"><h4>Product</h4><ul><li><a href="#">How it works</a></li><li><a href="#">Features</a></li><li><a href="#">Homeschool</a></li><li><a href="#">Pricing</a></li><li><a href="#">Download app</a></li></ul></div>
    <div class="ft-col"><h4>Families</h4><ul><li><a href="#">Activity ideas</a></li><li><a href="#">Weekend planner</a></li><li><a href="#">Holiday planner</a></li><li><a href="#">Community</a></li><li><a href="#">Blog</a></li></ul></div>
    <div class="ft-col"><h4>Homeschool</h4><ul><li><a href="#">Tusla guide</a></li><li><a href="#">Curriculum map</a></li><li><a href="#">Portfolio builder</a></li><li><a href="#">Assessment prep</a></li><li><a href="#">SEN support</a></li></ul></div>
    <div class="ft-col"><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Our story</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of use</a></li><li><a href="#">Contact</a></li></ul></div>
  </div>
  <div class="ft-nl"><div><div class="ft-nl-title">Get weekly family ideas, free</div><div class="ft-nl-body">Seasonal activities, Irish heritage moments, and Hedge updates. No spam. Ever.</div></div><div class="ft-nl-form"><input class="ft-nl-input" type="email" placeholder="your@email.ie"/><button class="ft-nl-btn">Subscribe</button></div></div>
  <div class="ft-bot"><p>© 2025 The Hedge. Made with love in Ireland.</p><p>GDPR compliant · EU data residency · Children First Act aligned</p></div>
</div></footer>
<script>document.getElementById('tm').addEventListener('click',function(){this.classList.add('on');document.getElementById('ta').classList.remove('on')});document.getElementById('ta').addEventListener('click',function(){this.classList.add('on');document.getElementById('tm').classList.remove('on')});</script>
` }} />
  );
}
