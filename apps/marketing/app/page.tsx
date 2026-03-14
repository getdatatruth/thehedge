import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../components/Nav';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { Icon } from '../components/Icons';

export const metadata: Metadata = {
  title: 'The Hedge - Personalised Family Activities for Irish Families',
  description: "Ireland's family learning platform. AI-powered, weather-aware activity ideas for your children every morning. Screen-free. Irish. Built for real family life.",
  alternates: { canonical: 'https://thehedge.ie' },
  openGraph: { title: 'The Hedge - Family Learning Platform for Irish Families', description: "Personalised daily activities for Irish families, shaped by your weather, your children, and your world." }
};

const testimonials = [
  { quote: "It knows when it's wet and cold in Donegal and suggests indoor activities automatically. No other app even knows what county we're in.", name: 'Sinéad McGuinness', role: 'Mam of 2, Donegal', plan: 'Family', initials: 'SM' },
  { quote: "We've done things this year I'd never have thought of - a fairy door trail in our garden, pressing autumn leaves, making Irish butter. The kids ask for it every morning.", name: 'Ciarán Ó Briain', role: 'Dad of 3, Galway', plan: 'Family', initials: 'CÓ', forest: true },
  { quote: "As a homeschooler, the AEARS logging alone is worth the subscription. It would have taken me hours each week to do manually.", name: 'Laura Hennessy', role: 'Homeschool parent, Tipperary', plan: 'Educator', initials: 'LH' },
];

const faqs = [
  { q: "What age children is The Hedge designed for?", a: "The Hedge works for children aged 2–16. When you set up your family profile, you tell us your children's ages and the platform adjusts every suggestion accordingly - simpler sensory play for toddlers, more complex projects for older children. Multi-age families are very much catered for." },
  { q: "Do I need a subscription to use it?", a: "No - we have a free plan that gives you 1–2 activity ideas per day from a curated library. The Family plan (€6.99/month) unlocks the full AI personalisation engine, weather integration, the weekly planner, and unlimited activity history. The Educator plan adds homeschool-specific tools." },
  { q: "How does the weather integration work?", a: "The Hedge pulls live weather data from Open-Meteo for your specific county every morning. If rain is forecast, it automatically surfaces indoor activities. If there's a rare sunny spell, it prioritises outdoor and nature activities. You never have to manually adjust for the weather." },
  { q: "Is The Hedge only for homeschooling families?", a: "Not at all. The majority of our families use mainstream schools. The Hedge helps with after-school activities, weekends, school holidays, and summer. For homeschooling families, we have a dedicated Educator plan with curriculum mapping and AEARS-compliant logging." },
  { q: "Is my data stored in Ireland / the EU?", a: "Yes. All data is stored in the EU - specifically in Frankfurt, Germany - and we are fully GDPR compliant. We do not sell data to third parties or use it for advertising." },
  { q: "Can I use The Hedge on my phone?", a: "Yes. The web app works beautifully on all mobile devices. A dedicated iOS app is in development and coming soon for Family and Educator subscribers." },
];

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'The Hedge',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web, iOS',
    description: "Personalised, screen-free activity ideas for Irish families, powered by AI and live weather data.",
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Free Plan' },
      { '@type': 'Offer', price: '6.99', priceCurrency: 'EUR', name: 'Family Plan', billingPeriod: 'P1M' },
      { '@type': 'Offer', price: '14.99', priceCurrency: 'EUR', name: 'Educator Plan', billingPeriod: 'P1M' },
    ],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '2400', bestRating: '5' },
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
              What will your<br />family do<br /><em>today?</em>
            </h1>
            <p className="hero-body">Personalised activities for Irish families - shaped by your children, your weather, and your world.</p>
            <p className="hero-sub">For homeschooling families and mainstream families who want something <strong>richer than a screen</strong> for their children every day.</p>
            <div className="actions fade-up-2">
              <Link href="https://app.thehedge.ie/signup" className="btn-primary">
                Start free today <Icon id="arrow-r" size={16} color="currentColor" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary">
                See how it works
              </Link>
            </div>
            <div className="proof fade-up-3">
              <div className="avatars">
                {['SM','CÓ','LH','PB','AO'].map(i => <div key={i} className="av" style={{fontSize:8,fontWeight:700,color:'var(--forest)'}}>{i}</div>)}
              </div>
              <div style={{marginLeft:6}}>
                <div className="stars">★★★★★</div>
                <div className="proof-label"><strong>2,400+ Irish families</strong> · 4.9 rating</div>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="app-card fade-up-2">
              <div className="ach">
                <div className="chip"><Icon id="sun" size={10} color="currentColor" /> Good morning</div>
                <div className="greeting">Today for<br /><em>Sarah&apos;s family</em></div>
              </div>
              <div className="weather-row">
                <span className="w-loc">Cork · Tuesday</span>
                <span className="w-val">🌦 14°C · Mixed</span>
              </div>
              <div className="acts">
                <div className="act-lbl">Today&apos;s ideas</div>
                <div className="act-row ar-green">
                  <div className="act-ic aic-g"><Icon id="leaf" size={16} color="var(--sage)" /></div>
                  <div>
                    <div className="act-name">Fairy house in the garden</div>
                    <div className="act-meta"><span className="tag tag-g">Outdoor</span><span className="tag tag-g">Ages 4–8</span></div>
                  </div>
                </div>
                <div className="act-row ar-terra">
                  <div className="act-ic aic-t"><Icon id="flask" size={16} color="#E8A88A" /></div>
                  <div>
                    <div className="act-name">Kitchen chemistry: volcanoes</div>
                    <div className="act-meta"><span className="tag tag-t">Science</span><span className="tag tag-t">Ages 6–12</span></div>
                  </div>
                </div>
                <div className="act-row ar-stone">
                  <div className="act-ic aic-s"><Icon id="book" size={16} color="var(--mist)" /></div>
                  <div>
                    <div className="act-name">Shadow tracking science</div>
                    <div className="act-meta"><span className="tag tag-g">Curriculum</span><span className="tag tag-g">5th class</span></div>
                  </div>
                </div>
              </div>
              <div style={{padding:'12px 20px',borderTop:'1px solid rgba(245,240,228,0.08)'}}>
                <div style={{background:'var(--terracotta)',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,color:'white',fontWeight:600}}>Get started - it&apos;s free</span>
                  <Icon id="arrow-r" size={14} color="white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="trust-bar" role="complementary" aria-label="Trust signals">
          <div className="trust-inner">
            {[
              { id:'shield', text:'GDPR · EU data storage' },
              { id:'leaf', text:'1,200+ activities' },
              { id:'map', text:'All 32 counties' },
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
              <p className="section-body">From your first morning to your hundredth adventure - it gets better the more you use it.</p>
              <div className="steps">
                {[
                  { n:'01', id:'users', title:'Tell us about your family', body:'A quick 2-minute setup. Children\'s ages, what they love, your outdoor space. The Hedge does the rest.' },
                  { n:'02', id:'sun', title:'We check the weather for you', body:'Every morning, The Hedge looks at your local forecast and plans accordingly. Rain means indoor ideas. Sun means go outside.' },
                  { n:'03', id:'spark', title:'Your brief arrives each morning', body:'Open the app and see today\'s 3 personalised activity ideas, ready to go. No planning. No googling. Just do.' },
                  { n:'04', id:'leaf', title:'Log it, remember it forever', body:'One tap to mark it done. Your family builds a beautiful timeline of everything you\'ve made, explored, and learned together.' },
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

        {/* ── FOR WHOM ── */}
        <section className="section section-linen" aria-labelledby="forwhom-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Who it&apos;s for</span></div>
            <h2 className="section-title" id="forwhom-title">Built for <em>every</em> Irish family</h2>
            <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',marginTop:32}}>
              {[
                { icon:'users', title:'Mainstream families', body:'After school, weekends, school holidays, summer. The Hedge gives you an endless supply of ideas that are better than the TV and more interesting than "go play outside".' },
                { icon:'book', title:'Homeschooling families', body:'Full NCCA curriculum mapping, weekly planners, and AEARS-compliant learning logs. Everything you need to run a rich, evidenced home education.' },
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

        {/* ── TESTIMONIALS ── */}
        <section className="section" aria-labelledby="testi-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Real Irish families</span></div>
            <h2 className="section-title" id="testi-title">What families <em>say</em></h2>
            <div className="testi-grid" style={{marginTop:32}}>
              {testimonials.map((t,i) => (
                <article key={t.name} className={`tc ${t.forest ? 'tc-f' : 'tc-l'}`} itemScope itemType="https://schema.org/Review">
                  <div className="tc-stars">{[1,2,3,4,5].map(s=><span key={s} style={{color:t.forest?'var(--amber)':'var(--amber)',fontSize:13}}>★</span>)}</div>
                  <blockquote className="tc-quote" itemProp="reviewBody">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="tc-author">
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="tc-av" style={{fontSize:9,fontWeight:700,color:t.forest?'var(--sage)':'var(--forest)'}}>{t.initials}</div>
                      <div>
                        <div className="tc-name" itemProp="author">{t.name}</div>
                        <div className="tc-role">{t.role}</div>
                      </div>
                    </div>
                    <span className="tc-plan">{t.plan}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="section section-forest" aria-labelledby="stats-title">
          <div className="container">
            <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">The numbers</span></div>
            <h2 className="section-title section-title-light" id="stats-title">Growing every <em>month</em></h2>
            <div className="stats" style={{marginTop:32}}>
              {[
                { n:'2,400+', l:'Irish families' },
                { n:'1,200+', l:'Activities' },
                { n:'4.9★', l:'App Store rating' },
                { n:'32', l:'Counties covered' },
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
              <p className="section-body">NCCA curriculum mapping, AEARS-compliant learning logs, and a weekly planner that actually knows the Irish school calendar.</p>
              <div className="actions">
                <Link href="/homeschool" className="btn-primary">Homeschool features <Icon id="arrow-r" size={16} /></Link>
              </div>
            </div>
            <div className="sched-card">
              <div className="sched-hd">
                <div><h3>This week&apos;s plan</h3><p>Éabha · 9 yrs · 3rd class equiv.</p></div>
                <span style={{fontSize:9,fontWeight:700,background:'rgba(143,175,126,0.2)',color:'var(--sage)',padding:'4px 10px',borderRadius:3,letterSpacing:'0.1em',textTransform:'uppercase'}}>AEARS Ready</span>
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
                { name:'Free', tag:'Just get started', price:'€0', sub:'forever', btn:'pcb-outline', btnTxt:'Get started free', btnHref:'https://app.thehedge.ie/signup', feats:['1–2 ideas per day','Activity library (limited)','5 AI suggestions per week','Basic weekly view'], dark:false },
                { name:'Family', tag:'For families who want more', price:'€6.99', sub:'/month', btn:'pcb-terra', btnTxt:'Start free trial', btnHref:'https://app.thehedge.ie/signup?plan=family', feats:['Unlimited personalised ideas','Full 1,200+ activity library','Live weather integration','Weekly planner & calendar','Activity timeline & logging','iOS & Android app'], dark:false, pop:'Most popular' },
                { name:'Educator', tag:'Built for homeschoolers', price:'€14.99', sub:'/month', btn:'pcb-sage', btnTxt:'Start free trial', btnHref:'https://app.thehedge.ie/signup?plan=educator', feats:['Everything in Family','NCCA curriculum mapping','AEARS-compliant learning logs','PDF report export','IEP support tools','Priority support'], dark:true },
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
            <h2>Your family&apos;s next adventure<br /><em>starts tomorrow morning.</em></h2>
            <p>Join 2,400+ Irish families who wake up knowing exactly what to do with their children today.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">
                Start free - no card needed <Icon id="arrow-r" size={16} />
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
