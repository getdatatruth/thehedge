import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Icon } from '../components/Icons';

export const metadata: Metadata = {
  title: 'The Hedge — Family Learning Platform for Irish Families',
  description: "Personalised, screen-free activities for Irish families — shaped by your children's ages, today's weather, and your world. Inspired by Ireland's hedge schools.",
  alternates: { canonical: 'https://thehedge.ie' },
};

const testimonials = [
  { quote: "We used to spend Sunday evenings frantically searching Pinterest for ideas. The Hedge sends us a full week of plans every morning. It's transformed our family time.", name: 'Aoife Ní Bhriain', role: 'Mam of 3, Galway', plan: 'Family', forest: true },
  { quote: "The AEARS compliance tracker alone is worth every cent. I used to dread the annual assessment — now I just export the log and it's done.", name: 'Seán Ó Murchú', role: 'Homeschool Dad, Kerry', plan: 'Educator', forest: false },
  { quote: "It knows when it's wet and cold in Donegal and suggests indoor activities automatically. No other app even knows what county we're in.", name: 'Sinéad McGuinness', role: 'Mam of 2, Donegal', plan: 'Family', forest: false },
];

const categories = [
  { num: '01', id: 'leaf', name: 'Nature & Outdoors', count: '240+ activities' },
  { num: '02', id: 'flask', name: 'Science & Discovery', count: '180+ activities' },
  { num: '03', id: 'palette', name: 'Art & Creativity', count: '160+ activities' },
  { num: '04', id: 'calc', name: 'Maths in the Wild', count: '120+ activities' },
  { num: '05', id: 'book', name: 'Language & Literacy', count: '200+ activities' },
  { num: '06', id: 'clover', name: 'Irish Heritage', count: '90+ activities' },
  { num: '07', id: 'globe', name: 'Geography & Maps', count: '70+ activities' },
  { num: '08', id: 'music', name: 'Music & Movement', count: '110+ activities' },
];

export default function Home() {
  return (
    <>
      <Nav active="/" />

      {/* ── HERO ── */}
      <main>
        <section className="hero" aria-label="Hero">
          <div className="hero-content fade-up">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Inspired by Ireland&apos;s hedge schools</span>
            </div>
            <h1 className="hero-headline">
              What will your<br />family do<br /><em>today?</em>
            </h1>
            <p className="hero-body">
              Personalised activities for Irish families — shaped by your children, your weather, and your world.
            </p>
            <p className="hero-sub">
              <strong>No more Sunday-evening panic.</strong> The Hedge plans your week, checks the forecast for your county, and suggests exactly the right things to do — indoors and out.
            </p>
            <div className="actions fade-up-2">
              <Link href="https://app.thehedge.ie/signup" className="btn-primary">
                Start free today <Icon id="arrow-r" size={16} />
              </Link>
              <Link href="/how-it-works" className="btn-secondary">
                See how it works
              </Link>
            </div>
            <div className="proof fade-up-3">
              <div className="avatars" aria-label="Happy families using The Hedge">
                {['A','S','M','R','C'].map(l => <div key={l} className="av" aria-hidden="true"><span style={{fontSize:10,fontWeight:700,color:'var(--clay)'}}>{l}</span></div>)}
              </div>
              <div>
                <div className="stars" aria-label="5 star rating">★★★★★</div>
                <div className="proof-label"><strong>2,400+ Irish families</strong> planning with The Hedge</div>
              </div>
            </div>
          </div>

          <div className="hero-panel" aria-hidden="true">
            <div className="app-card">
              <div className="ach">
                <div className="chip"><Icon id="sun" size={10} />Wednesday · Cork</div>
                <div className="greeting">Good morning,<br /><em>Sarah&apos;s family</em></div>
              </div>
              <div className="weather-row">
                <span className="w-loc">West Cork · Today</span>
                <span className="w-val">14° Partly cloudy</span>
              </div>
              <div className="acts">
                <div className="act-lbl">Today&apos;s suggestions</div>
                {[
                  { name: 'Rock pool exploration', meta: ['Ages 4–9','Outdoors'], cls: 'ar-green aic-g', id: 'leaf' },
                  { name: 'Make sourdough bread', meta: ['Ages 5+','Kitchen'], cls: 'ar-stone aic-s', id: 'spark' },
                  { name: 'Shadow science experiment', meta: ['Ages 6–10','15 min'], cls: 'ar-terra aic-t', id: 'flask' },
                ].map(act => (
                  <div key={act.name} className={`act-row ${act.cls.split(' ')[0]}`}>
                    <div className={`act-ic ${act.cls.split(' ')[1]}`}><Icon id={act.id} size={14} color="var(--sage)" /></div>
                    <div>
                      <div className="act-name">{act.name}</div>
                      <div className="act-meta">
                        {act.meta.map(m => <span key={m} className="tag tag-g">{m}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="trust-bar" role="complementary" aria-label="Trust signals">
          <div className="trust-inner">
            {[
              { id: 'shield', text: 'GDPR compliant · EU data' },
              { id: 'clover', text: 'Built for Irish families' },
              { id: 'leaf', text: '1,200+ screen-free activities' },
              { id: 'cal', text: 'Weather-aware planning' },
              { id: 'book', text: 'NCCA curriculum aligned' },
            ].map(t => (
              <div className="trust-item" key={t.text}>
                <Icon id={t.id} size={14} color="var(--moss)" />
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="section section-linen" id="how-it-works" aria-labelledby="how-heading">
          <div className="container" style={{display:'grid',gap:'48px'}}>
            <div style={{maxWidth:540}}>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">As easy as it gets</span></div>
              <h2 className="section-title" id="how-heading">How The Hedge <em>works</em></h2>
              <p className="section-body">From your first morning to your hundredth adventure — it gets better the more you use it.</p>
              <Link href="/how-it-works" className="btn-ghost">Full walkthrough <Icon id="arrow-r" size={14} /></Link>
            </div>
            <div style={{display:'grid',gap:'32px'}}>
              <div className="steps">
                {[
                  { num:'01', id:'users', title:'Tell us about your family', body:'A quick 2-minute setup. Children\'s ages, what they love, your outdoor space. The Hedge does the rest.' },
                  { num:'02', id:'sun', title:'We check the weather for you', body:'Every morning, The Hedge looks at your local forecast and adjusts suggestions — so rainy days always have a plan.' },
                  { num:'03', id:'cal', title:'Get your week\'s activities', body:'A curated list lands each morning. Full instructions, age notes, materials needed. No prep required from you.' },
                  { num:'04', id:'leaf', title:'Log it, celebrate it', body:'Tick off activities and watch your family\'s learning timeline grow. A record you\'ll treasure, and that AEARS will accept.' },
                ].map(s => (
                  <div className="step" key={s.num}>
                    <div className="step-num">{s.num}</div>
                    <div>
                      <div className="step-ic"><Icon id={s.id} size={16} color="var(--moss)" /></div>
                      <div className="step-title">{s.title}</div>
                      <div className="step-body">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="week-card">
                <div className="week-card-title">This week for your family</div>
                <div className="week-card-sub">Cork · October · Mixed weather</div>
                <div className="week">
                  {[
                    { d:'MON', acts:['Nature walk','Baking'], cls:'wd-past' },
                    { d:'TUE', acts:['Science','Art'], cls:'wd-past' },
                    { d:'WED', acts:['Rock pools','Bread'], cls:'wd-today' },
                    { d:'THU', acts:['Story time','Drawing'], cls:'wd-future' },
                    { d:'FRI', acts:['Active play','Writing'], cls:'wd-future' },
                  ].map(w => (
                    <div key={w.d} className={`wd ${w.cls}`}>
                      <span className="wd-day">{w.d}</span>
                      <div className="wd-acts">
                        {w.acts.map(a => <span key={a} className="wd-act">{a}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="section section-forest" id="features" aria-labelledby="feat-heading">
          <div className="container">
            <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">1,200+ activities</span></div>
            <h2 className="section-title section-title-light" id="feat-heading" style={{marginBottom:12}}>Every kind of <em>learning</em></h2>
            <p className="section-body section-body-light" style={{maxWidth:540,marginBottom:36}}>The Hedge covers the full range of childhood curiosity — from muddy wellies to kitchen chemistry.</p>
            <div className="cat-grid">
              {categories.map(c => (
                <div className="cat-item" key={c.num}>
                  <div className="cat-num">{c.num}</div>
                  <div className="cat-ic"><Icon id={c.id} size={16} color="var(--sage)" /></div>
                  <div>
                    <div className="cat-name">{c.name}</div>
                    <div className="cat-count">{c.count}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="feat-trio">
              {[
                { id:'cpu', title:'AI that knows Ireland', body:'Activities shaped by Irish seasons, school holidays, and cultural moments — Bealltainn, Samhain, Imbolc. Not American templates.' },
                { id:'sun', title:'Weather-first planning', body:'Pulls live forecasts for your exact county. Wet Tuesday in Sligo? You\'ll get a shortlist of brilliant indoor ideas before breakfast.' },
                { id:'leaf', title:'Grows with your family', body:'As your children get older, the suggestions evolve. The Hedge learns what your family loves and builds on it, year after year.' },
              ].map(f => (
                <div className="feat-card" key={f.id}>
                  <div className="feat-ic"><Icon id={f.id} size={22} color="var(--sage)" /></div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-body2">{f.body}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:40}}>
              <Link href="/features" className="btn-light">Explore all features <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </section>

        {/* ── FOR HOMESCHOOLERS ── */}
        <section className="section" id="homeschool" aria-labelledby="hs-heading">
          <div className="container" style={{display:'grid',gap:'48px'}}>
            <div>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">For homeschooling families</span></div>
              <h2 className="section-title" id="hs-heading">Built for the <em>Tusla path</em></h2>
              <p className="section-body">The Hedge is the only family platform in Ireland that understands what AEARS assessors need to see — and builds it into your daily routine automatically.</p>
              <Link href="/homeschool" className="btn-secondary" style={{marginBottom:32}}>The full homeschool suite <Icon id="arrow-r" size={14} /></Link>
              <div className="hs-feats">
                {[
                  { id:'shield', title:'AEARS-Ready Learning Log', body:'Every activity you complete is automatically logged with date, duration, subject area, and age appropriateness. Export as a PDF report for your annual assessment.' },
                  { id:'book', title:'NCCA Curriculum Mapping', body:'All activities are tagged to the Primary Curriculum (Aistear + NCCA strands). Know exactly which learning goals each activity addresses.' },
                  { id:'cal', title:'Daily Plan Builder', body:'Create legally defensible daily schedules with a drag-and-drop planner. Shows time allocations by subject area, matching AEARS expectations.' },
                ].map(f => (
                  <div className="hs-feat" key={f.id}>
                    <div className="hf-ic"><Icon id={f.id} size={16} color="var(--moss)" /></div>
                    <div>
                      <div className="hf-title">{f.title}</div>
                      <div className="hf-body">{f.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hs-quote">
                <div className="hs-quote-text">&ldquo;The log feature alone saved me about 6 hours of paperwork before our AEARS assessment. The inspector was genuinely impressed with the detail.&rdquo;</div>
                <div className="hs-quote-by">— Máire Breathnach, homeschooling Mam of 4, Tipperary · Educator plan</div>
              </div>
            </div>
            <div>
              <div className="sched-card">
                <div className="sched-hd">
                  <div><h3>Tuesday — Aoife (age 8)</h3><p>NCCA Primary · Week 14</p></div>
                  <div style={{background:'rgba(245,240,228,0.1)',borderRadius:6,padding:'6px 10px',textAlign:'center'}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--mist)'}}>Logged</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:300,color:'var(--parchment)'}}>4/4</div>
                  </div>
                </div>
                <div className="sched-body">
                  <div className="sched-lbl">Morning Session</div>
                  {[
                    { sub:'Maths', act:'Measuring rainfall in the garden', cls:'sb-g', ic:'si-math', time:'45 min', outcome:'Data' },
                    { sub:'English', act:'Write a weather poem', cls:'sb-g', ic:'si-eng', time:'30 min', outcome:'Writing' },
                  ].map(b => (
                    <div key={b.sub} className={`sched-blk ${b.cls}`}>
                      <div className={`subj-ic ${b.ic}`}><Icon id={b.sub==='Maths'?'calc':'pen'} size={11} color="var(--forest)" /></div>
                      <div><div className="subj">{b.sub}</div><div className="sched-act">{b.act}</div></div>
                      <div className="sched-right"><span className="outcome">{b.outcome}</span><span className="sched-time">{b.time}</span></div>
                    </div>
                  ))}
                  <div className="sched-lbl" style={{marginTop:12}}>Afternoon Session</div>
                  {[
                    { sub:'Nature', act:'Identify 5 garden birds', cls:'sb-l', ic:'si-nat', time:'60 min', outcome:'SESE' },
                    { sub:'Irish', act:'Léigh leabhar — An Fómhar', cls:'sb-l', ic:'si-irish', time:'20 min', outcome:'Léamh' },
                  ].map(b => (
                    <div key={b.sub} className={`sched-blk ${b.cls}`}>
                      <div className={`subj-ic ${b.ic}`}><Icon id={b.sub==='Irish'?'book':'leaf'} size={11} color="var(--forest)" /></div>
                      <div><div className="subj">{b.sub}</div><div className="sched-act">{b.act}</div></div>
                      <div className="sched-right"><span className="outcome">{b.outcome}</span><span className="sched-time">{b.time}</span></div>
                    </div>
                  ))}
                </div>
                <div className="tusla-ft">
                  <div>
                    <div className="tusla-lbl">AEARS Assessment Ready</div>
                    <div className="tusla-sub">Auto-logged · PDF export available</div>
                  </div>
                  <div className="tusla-badge">✓</div>
                </div>
              </div>
              <div className="ncca-band">
                <h3>NCCA Curriculum Aligned</h3>
                <p>Every activity is mapped to Ireland&apos;s Primary Curriculum strands so homeschooling families have full confidence in their programme.</p>
                <div className="stages">
                  {['Aistear (ECCE)','Junior Infants–2nd','3rd–6th Class','Transition Year','SESE','Gaeilge Strand'].map(s => (
                    <span className="stage" key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="section section-linen" aria-labelledby="testi-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Real Irish families</span></div>
            <h2 className="section-title" id="testi-heading">Trusted by families <em>across Ireland</em></h2>
            <div className="testi-grid" style={{marginTop:36}}>
              {testimonials.map(t => (
                <div key={t.name} className={`tc ${t.forest ? 'tc-f' : 'tc-l'}`}>
                  <div className="tc-stars">
                    {[1,2,3,4,5].map(i => <Icon key={i} id="star" size={12} color="var(--amber)" />)}
                  </div>
                  <p className="tc-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="tc-author">
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="tc-av"><span style={{fontSize:11,fontWeight:700}}>{t.name[0]}</span></div>
                      <div>
                        <div className="tc-name">{t.name}</div>
                        <div className="tc-role">{t.role}</div>
                      </div>
                    </div>
                    <span className="tc-plan">{t.plan}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:40,display:'grid',gap:16}}>
              <div className="stats">
                {[
                  { n:'2,400+', l:'Irish families' },
                  { n:'1,200+', l:'Activities' },
                  { n:'4.9★', l:'App Store rating' },
                  { n:'32', l:'Counties covered' },
                ].map(s => (
                  <div className="stat" key={s.l}>
                    <div className="stat-n">{s.n}</div>
                    <div className="stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING PREVIEW ── */}
        <section className="section" id="pricing" aria-labelledby="price-heading">
          <div className="container">
            <div style={{textAlign:'center',marginBottom:40}}>
              <div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line" /><span className="eyebrow-text">Transparent pricing</span></div>
              <h2 className="section-title" id="price-heading" style={{marginBottom:10}}>Fair pricing for <em>Irish families</em></h2>
              <p className="section-body" style={{maxWidth:480,margin:'0 auto 0'}}>Start free, upgrade when you&apos;re ready. No hidden fees, no annual lock-in.</p>
            </div>
            <div className="price-grid">
              {[
                { name:'Free', tag:'Perfect to get started', price:'0', btn:'pcb-outline', btnLabel:'Start for free', btnHref:'https://app.thehedge.ie/signup', feats:[
                  '3 activity ideas per day','Local weather integration','Basic activity library','5 AI suggestions / week','Email support',
                ]},
                { name:'Family', tag:'Most popular for families', price:'6.99', btn:'pcb-terra', btnLabel:'Try Family free', btnHref:'https://app.thehedge.ie/signup?plan=family', popular:true, feats:[
                  'Unlimited daily activities','Full activity library (1,200+)','Weather-smart weekly planner','Unlimited AI suggestions','Activity logging & timeline','iPad app included','Priority support',
                ]},
                { name:'Educator', tag:'Built for homeschoolers', price:'14.99', btn:'pcb-sage', btnLabel:'Start Educator trial', btnHref:'https://app.thehedge.ie/signup?plan=educator', feats:[
                  'Everything in Family','AEARS compliance log','NCCA curriculum mapping','Daily plan builder','PDF assessment export','IEP / learning profile','Dedicated onboarding call',
                ]},
              ].map(p => (
                <div key={p.name} className={`pc ${p.popular ? 'pc-forest' : 'pc-paper'}`}>
                  {p.popular && <div className="pc-pop">Most popular</div>}
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-tag">{p.tag}</div>
                  <div className="pc-price">{p.price === '0' ? 'Free' : <><sup>€</sup>{p.price}<small>/mo</small></>}</div>
                  <Link href={p.btnHref} className={`pc-btn ${p.btn}`}>{p.btnLabel}</Link>
                  <ul className="pc-feats">
                    {p.feats.map(f => (
                      <li key={f}>
                        <Icon id="check" size={12} color={p.popular ? 'var(--sage)' : 'var(--moss)'} />
                        <span className={p.popular ? 'ft-l' : 'ft-d'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{textAlign:'center',fontSize:12,color:'var(--clay)',marginTop:16}}>All plans include a 14-day free trial · No credit card required · Cancel anytime</p>
            <div style={{textAlign:'center',marginTop:16}}>
              <Link href="/pricing" className="btn-ghost">Full pricing comparison <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="cta-band" role="complementary">
          <div className="container">
            <h2>Ready to bring <em>the hedge school</em> home?</h2>
            <p>Join 2,400+ Irish families who&apos;ve already made screen-free learning part of their daily rhythm.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Start free today <Icon id="arrow-r" size={16} /></Link>
              <Link href="/about" className="btn-ghost" style={{color:'var(--mist)'}}>Our story <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
