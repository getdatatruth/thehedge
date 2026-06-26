import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../components/Nav';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { Icon } from '../components/Icons';
import KitchenTableDemo from '../components/KitchenTableDemo';

export const metadata: Metadata = {
  title: 'The Hedge - Learning that fits your family',
  description: "The Hedge sits down with you at the Kitchen Table, learns your children, your values and your rhythm, then writes your family its own plan - daily ideas that fit, a plan that adapts, and an AEARS-ready record that keeps itself. Screen-free. Irish.",
  alternates: { canonical: 'https://thehedge.ie' },
  openGraph: { title: 'The Hedge - Learning that fits your family', description: "It gets to know your family first, then builds learning around them. Screen-free, Irish, calm." }
};

const faqs = [
  { q: "What age children is The Hedge designed for?", a: "The Hedge is built for early years and primary, roughly ages 2 to 12 (Aistear and the NCCA primary curriculum). When you set up your family profile, you tell us your children's ages and the platform adjusts every suggestion accordingly - simpler sensory play for toddlers, more involved projects for older children. Multi-age families are very much catered for." },
  { q: "Do I need a subscription to use it?", a: "No - we have a free plan that gives you 1–2 activity ideas per day from a curated library. The Family plan (€6.99/month) unlocks suggestions tailored to your children and your county, weather integration, the weekly planner, and unlimited activity history. The Educator plan adds homeschool-specific tools." },
  { q: "How does the weather integration work?", a: "The Hedge pulls live weather data from Open-Meteo for your specific county every morning. If rain is forecast, it automatically surfaces indoor activities. If there's a rare sunny spell, it prioritises outdoor and nature activities. You never have to manually adjust for the weather." },
  { q: "Is The Hedge for homeschoolers or for mainstream families?", a: "Both, and you choose your doorway when you join. Mainstream families use The Hedge for after-school, weekends, school holidays and summer. Home-educating families use the Educator plan for NCCA curriculum mapping, learning logs and records designed to help you organise the evidence an AEARS assessment looks for. Either way, it starts at the Kitchen Table and shapes itself around your family." },
  { q: "Is my data stored in Ireland / the EU?", a: "Yes. All data is stored in the EU - specifically in Frankfurt, Germany - and we are fully GDPR compliant. We do not sell data to third parties or use it for advertising." },
  { q: "Can I use The Hedge on my phone?", a: "Yes. The Hedge works beautifully on your phone - in any browser, and with our iOS and Android apps - so a good idea is always to hand, wherever the day takes you." },
];

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'The Hedge',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web',
    description: "Personalised, screen-free activity ideas for Irish families, shaped by your weather, your county and your children.",
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Free Plan' },
      { '@type': 'Offer', price: '6.99', priceCurrency: 'EUR', name: 'Family Plan', billingPeriod: 'P1M' },
      { '@type': 'Offer', price: '14.99', priceCurrency: 'EUR', name: 'Educator Plan', billingPeriod: 'P1M' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav active="/" />
      <main>
        {/* ── HERO ── */}
        <section className="hero" aria-label="Hero">
          <div className="hero-content fade-up">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Inspired by Ireland&apos;s hedge schools</span>
            </div>
            <h1 className="hero-headline">
              Learning that fits<br />your <em>family.</em>
            </h1>
            <p className="hero-body">Most apps hand every family the same list. The Hedge sits down with you at the Kitchen Table, learns your children, your values and your rhythm, then writes your family its own plan. Learning that feels like a breath, not a battle.</p>

            <div className="doorways fade-up-2" role="navigation" aria-label="Choose your path">
              <Link href="#kitchen-table" className="doorway">
                <span className="doorway-eyebrow"><Icon id="sun" size={11} color="currentColor" /> Everyday family life</span>
                <span className="doorway-title">Ideas that fit your day</span>
                <span className="doorway-body">Screen-free things to do, shaped by your children, your county and the weather. See what we&apos;d write for you.</span>
              </Link>
              <Link href="/homeschool" className="doorway">
                <span className="doorway-eyebrow"><Icon id="book" size={11} color="currentColor" /> Home education</span>
                <span className="doorway-title">Organised for AEARS</span>
                <span className="doorway-body">A plan that bends to your approach and a record that keeps itself, ready for your assessment.</span>
              </Link>
            </div>

            <div className="proof fade-up-3">
              <div style={{marginLeft:6}}>
                <div className="proof-label">Screen-free · Irish · over 500 activities · live weather in all 32 counties</div>
              </div>
            </div>
          </div>

          <div className="hero-panel" id="kitchen-table">
            <KitchenTableDemo />
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="trust-bar" role="complementary" aria-label="Trust signals">
          <div className="trust-inner">
            {[
              { id:'shield', text:'GDPR · EU data storage' },
              { id:'leaf', text:'Over 500 activities' },
              { id:'map', text:'Live weather, all 32 counties' },
              { id:'check', text:'NCCA curriculum mapped' },
              { id:'lock', text:'No ads, ever' },
            ].map(t => (
              <div key={t.text} className="trust-item">
                <Icon id={t.id} size={14} color="var(--moss)" />
                {t.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS (teaser) ── */}
        <section className="section" aria-labelledby="hiw-title">
          <div className="container" style={{display:'grid',gap:48}}>
            <div style={{maxWidth:540}}>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">As easy as it gets</span></div>
              <h2 className="section-title" id="hiw-title">How The Hedge <em>works</em></h2>
              <p className="section-body">It begins with a conversation, not a form. Then everything is shaped around what you tell it.</p>
              <div className="steps">
                {[
                  { n:'01', id:'leaf', title:'Sit down at the Kitchen Table', body:'A warm few questions about your children, your values and the shape of your days. A conversation, not a setup form.' },
                  { n:'02', id:'spark', title:'Read back your Family Framework', body:'The Hedge writes your family its own framework and reflects it to you. The way you do things, respected, not overruled.' },
                  { n:'03', id:'sun', title:'Your days, shaped to fit', body:'Today brings ideas that suit your crew and the weather. Plan gives you a timetable or a gentle rhythm. Keep quietly builds your record. Belong finds your local families.' },
                  { n:'04', id:'users', title:'Ask, any time', body:'A calm companion that knows your framework. Honest about being an AI, never pretending to be a person.' },
                ].map(s => (
                  <div key={s.n} className="step">
                    <div className="step-num">{s.n}</div>
                    <div>
                      <div className="step-ic"><Icon id={s.id} size={18} color="var(--moss)" /></div>
                      <div className="step-title">{s.title}</div>
                      <div className="step-body">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:28}}>
                <Link href="/how-it-works" className="btn-ghost">See full walkthrough <Icon id="arrow-r" size={14} /></Link>
              </div>
            </div>

            <div>
              <div className="week-card">
                <div className="week-card-title">This week for your family</div>
                <div className="week-card-sub" style={{fontFamily:'var(--font-serif)',fontStyle:'italic'}}>Cork · October · Mixed weather</div>
                <div className="week">
                  {[
                    { d:'MON', acts:['Nature walk','Baking'], cls:'wd-past' },
                    { d:'TUE', acts:['Science','Art'], cls:'wd-past' },
                    { d:'WED', acts:['Fairy house','Science'], cls:'wd-today' },
                    { d:'THU', acts:['Rock pool','Reading'], cls:'wd-future' },
                    { d:'FRI', acts:['Active','Writing'], cls:'wd-future' },
                  ].map(row => (
                    <div key={row.d} className={`wd ${row.cls}`}>
                      <span className="wd-day">{row.d}</span>
                      <div className="wd-acts">
                        {row.acts.map(a => <span key={a} className="wd-act">{a}</span>)}
                      </div>
                      {row.cls === 'wd-today' && <Icon id="arrow-r" size={12} color="var(--sage)" />}
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16,padding:'12px 14px',background:'rgba(61,97,66,0.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,color:'var(--clay)'}}>Get started - it&apos;s free</span>
                  <Link href="https://app.thehedge.ie/signup" style={{fontSize:12,fontWeight:700,color:'var(--forest)',display:'flex',alignItems:'center',gap:4}}>
                    Try it now <Icon id="arrow-r" size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCT SHOWCASE ── */}
        <section className="section" aria-labelledby="showcase-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">See it for yourself</span></div>
            <h2 className="section-title" id="showcase-title">The whole product, <em>shaped around your family</em></h2>
            <p className="section-body" style={{ maxWidth: 560 }}>One calm home for your days, your plan, your record, and your questions. On your laptop, and in your pocket.</p>

            <div className="showcase-stage">
              <div className="app-window">
                <div className="app-window-bar">
                  <span className="awd" style={{ background: '#E8927C' }} />
                  <span className="awd" style={{ background: '#E8C46A' }} />
                  <span className="awd" style={{ background: 'var(--sage)' }} />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/product/today-desktop.png" alt="The Hedge Today screen, a day shaped around your family" />
              </div>
              <div className="device-iphone device-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/product/today-mobile.png" alt="The Hedge on a phone" />
              </div>
            </div>

            <div className="phone-trio">
              {[
                { src: '/product/plan-mobile.png', t: 'Plan', b: 'A timetable, or a gentle rhythm. Your week, your way.' },
                { src: '/product/keep-mobile.png', t: 'Keep', b: 'Your record, kept for you. Journal, portfolio, and the story of your year.' },
                { src: '/product/belong-mobile.png', t: 'Belong', b: 'Your local county group of home-educating families, near you.' },
                { src: '/product/ask-mobile.png', t: 'Ask', b: 'A calm companion that knows your family. Private, never used to train AI.' },
                { src: '/product/aears-mobile.png', t: 'AEARS ready', b: 'The dated, curriculum-tagged record an assessment looks for, built as you go.' },
              ].map((p) => (
                <div key={p.t} className="phone-item">
                  <div className="device-iphone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={`The Hedge ${p.t} on a phone`} />
                  </div>
                  <div className="phone-cap-t">{p.t}</div>
                  <div className="phone-cap-b">{p.b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR WHOM ── */}
        <section className="section section-linen" aria-labelledby="forwhom-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Who it&apos;s for</span></div>
            <h2 className="section-title" id="forwhom-title">Built for <em>every</em> Irish family</h2>
            <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',marginTop:32}}>
              {[
                { icon:'users', title:'Mainstream families', body:'After school, weekends, school holidays, summer. The Hedge gives you an endless supply of ideas that are better than the TV and more interesting than "go play outside".' },
                { icon:'book', title:'Homeschooling families', body:'NCCA primary curriculum mapping, weekly planners, and learning logs designed to help you organise the evidence an AEARS assessment looks for. Everything you need to run a rich, evidenced home education.' },
                { icon:'leaf', title:'Nature & outdoor families', body:'Half your activities are outdoors by default. Foraging, nature journalling, garden science, bog walks, beach explorations - all tailored to your county and season.' },
              ].map(c => (
                <div key={c.title} style={{background:'white',borderRadius:16,padding:'28px 24px',border:'1px solid var(--stone)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={c.icon} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{c.title}</div>
                  <div style={{fontSize:14,color:'var(--clay)',lineHeight:1.65}}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDER / EARLY ACCESS ── */}
        <section className="section" aria-labelledby="early-title">
          <div className="container" style={{maxWidth:720}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">A note from the founder</span></div>
            <h2 className="section-title" id="early-title">For Irish families, <em>by one of them</em></h2>
            <p className="section-body">I&apos;m Adam, and I&apos;m building The Hedge on my own, in Ireland. It is early, and I am building it alongside the families who use it. So you have my word on a few things: I read every email, I will not invent testimonials or claim features The Hedge does not have, and your data is never sold or used for ads. Join now and you are one of our founding families - your feedback shapes what comes next.</p>
            <div className="actions" style={{marginTop:8}}>
              <Link href="https://app.thehedge.ie/signup" className="btn-primary">Become a founding family <Icon id="arrow-r" size={16} /></Link>
              <Link href="/about" className="btn-secondary">Read our story</Link>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="section section-forest" aria-labelledby="stats-title">
          <div className="container">
            <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">What&apos;s inside</span></div>
            <h2 className="section-title section-title-light" id="stats-title">Built for <em>Irish family life</em></h2>
            <div className="stats" style={{marginTop:32}}>
              {[
                { n:'520', l:'Screen-free activities' },
                { n:'32', l:'Counties of live weather' },
                { n:'365', l:'Mornings a year sorted' },
                { n:'2–12', l:'Ages catered for' },
              ].map(s => (
                <div key={s.l} className="stat stat-dark">
                  <div className="stat-n">{s.n}</div>
                  <div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOMESCHOOL TEASER ── */}
        <section className="section section-linen" aria-labelledby="hs-teaser-title">
          <div className="container" style={{display:'grid',gap:40}}>
            <div style={{maxWidth:520}}>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">For homeschoolers</span></div>
              <h2 className="section-title" id="hs-teaser-title">Ireland&apos;s homeschool <em>companion</em></h2>
              <p className="section-body">NCCA primary curriculum mapping, learning logs designed to help you keep the records an AEARS assessment looks for, and a weekly planner that actually knows the Irish school calendar.</p>
              <div className="actions">
                <Link href="/homeschool" className="btn-primary">Homeschool features <Icon id="arrow-r" size={16} /></Link>
              </div>
            </div>
            <div className="sched-card">
              <div className="sched-hd">
                <div><h3>This week&apos;s plan</h3><p>Éabha · 9 yrs · 3rd class equiv.</p></div>
                <span style={{fontSize:9,fontWeight:700,background:'rgba(143,175,126,0.2)',color:'var(--sage)',padding:'4px 10px',borderRadius:3,letterSpacing:'0.1em',textTransform:'uppercase'}}>For AEARS</span>
              </div>
              <div className="sched-body">
                <div className="sched-lbl">Wednesday - curriculum blocks</div>
                {[
                  { s:'Mathematics', a:"Measuring the garden - area & perimeter in the real world", cls:'sb-g', ic:'si-math', o:'Measures strand' },
                  { s:'English', a:"Write a letter to a hedgehog who needs a home", cls:'sb-l', ic:'si-eng', o:'Writing strand' },
                  { s:'Science', a:"Plant a winter container garden - life cycles", cls:'sb-g', ic:'si-nat', o:'Living things' },
                  { s:'Irish', a:"Ainmhithe an ghairdín - garden animals in Irish", cls:'sb-l', ic:'si-irish', o:'Labhairt' },
                ].map(b => (
                  <div key={b.s} className={`sched-blk ${b.cls}`}>
                    <div className={`subj-ic ${b.ic}`}><Icon id={b.ic === 'si-math' ? 'calc' : b.ic === 'si-eng' ? 'pen' : b.ic === 'si-nat' ? 'leaf' : 'clover'} size={12} color="var(--forest)" /></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="subj">{b.s}</div>
                      <div className="sched-act" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.a}</div>
                    </div>
                    <span className="outcome">{b.o}</span>
                  </div>
                ))}
              </div>
              <div className="tusla-ft">
                <div><div className="tusla-lbl">Tusla AEARS</div><div className="tusla-sub">Auto-generating learning record</div></div>
                <div className="tusla-badge">✓</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING TEASER ── */}
        <section className="section" aria-labelledby="pricing-teaser-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Simple pricing</span></div>
            <h2 className="section-title" id="pricing-teaser-title">Fair pricing for <em>Irish families</em></h2>
            <p className="section-body" style={{maxWidth:540}}>Start free. Upgrade when you&apos;re ready. No contracts, no surprises. Cancel any time.</p>
            <div className="price-grid" style={{marginTop:32}}>
              {[
                { name:'Free', tag:'Just get started', price:'€0', sub:'forever', btn:'pcb-outline', btnTxt:'Get started free', btnHref:'https://app.thehedge.ie/signup', feats:['1–2 ideas per day','Activity library (limited)','5 personalised ideas per week','Basic weekly view'], dark:false },
                { name:'Family', tag:'For families who want more', price:'€6.99', sub:'/month', btn:'pcb-terra', btnTxt:'Start free trial', btnHref:'https://app.thehedge.ie/signup?plan=family', feats:['Unlimited personalised ideas','Full activity library (over 500)','Live weather integration','Weekly planner & calendar','Activity timeline & logging','iOS and Android apps'], dark:false, pop:'Most popular' },
                { name:'Educator', tag:'Built for homeschoolers', price:'€14.99', sub:'/month', btn:'pcb-sage', btnTxt:'Start free trial', btnHref:'https://app.thehedge.ie/signup?plan=educator', feats:['Everything in Family','NCCA primary curriculum mapping','Learning logs for AEARS evidence','PDF report export','IEP support tools','Priority support'], dark:true },
              ].map(p => (
                <div key={p.name} className={`pc ${p.dark ? 'pc-forest' : 'pc-paper'}`} style={{position:'relative'}}>
                  {p.pop && <div className="pc-pop">{p.pop}</div>}
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-tag">{p.tag}</div>
                  <div className="pc-price">{p.price}<small>{p.sub}</small></div>
                  <a href={p.btnHref} className={`pc-btn ${p.btn}`}>{p.btnTxt}</a>
                  <ul className="pc-feats">
                    {p.feats.map(f => (
                      <li key={f} className={p.dark ? 'ft-l' : 'ft-d'}>
                        <Icon id="check" size={13} color={p.dark ? 'var(--sage)' : 'var(--moss)'} style={{flexShrink:0,marginTop:2}} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:8}}>
              <Link href="/pricing" className="btn-ghost">See full pricing comparison <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section section-linen" aria-labelledby="faq-title">
          <div className="container" style={{maxWidth:800}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Common questions</span></div>
            <h2 className="section-title" id="faq-title">Everything you need <em>to know</em></h2>
            <FAQ items={faqs} />
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <div className="cta-band">
          <div className="container">
            <h2>Pull up a chair.<br /><em>Let The Hedge get to know your family.</em></h2>
            <p>A few warm questions, and you will see what it writes for you. No card needed.</p>
            <div className="actions">
              <Link href="#kitchen-table" className="btn-light">
                Start at the Kitchen Table <Icon id="arrow-r" size={16} />
              </Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
