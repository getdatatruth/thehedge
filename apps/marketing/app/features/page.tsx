import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Features - Learning Built Around Your Family',
  description: 'The Hedge gets to know your family at The Kitchen Table, builds a personalised Family Framework, then adapts everything around it: Today, Plan, Keep, Belong, and Ask, your calm AI companion. AEARS evidence that keeps itself, for home-educating families in Ireland.',
  alternates: { canonical: 'https://thehedge.ie/features' },
};

// The heart of the product: it learns your family first, then adapts.
const hero = {
  framework: {
    id: 'msg',
    title: 'The Kitchen Table',
    body: 'A calm, consultative chat to start, not a form to fill in. We ask about your children, how your days run, and what you want learning to feel like. From that conversation we build your Family Framework: a living picture of your family that The Hedge keeps to itself and learns from.',
  },
  verbs: [
    { id: 'sun', title: 'Today', body: 'A short, doable idea for today, shaped by your Framework, the season, and your local weather. One thing that fits, not a feed to wade through.' },
    { id: 'cal', title: 'Plan', body: 'Look ahead your way. Set a gentle weekly rhythm or a fuller plan, and The Hedge fills it around your children and the days you actually have. It adapts when life moves.' },
    { id: 'book', title: 'Keep', body: 'A record that keeps itself. Every activity you mark done is logged, dated, and tagged to the NCCA strands, so your family\'s story gathers quietly in the background.' },
    { id: 'users', title: 'Belong', body: 'You are not doing this alone. Find other families near you, county groups, and the kind of company that makes home learning lighter.' },
    { id: 'spark', title: 'Ask', body: 'A calm companion you can ask anything: an idea for a rainy afternoon, how an activity maps to the curriculum, what to try next. Honest help, grounded in your Framework. It suggests; you decide.' },
  ],
};

const stanceGroup = {
  title: 'Adapts to your stance',
  sub: 'Timetable or gentle rhythm, the same product',
  features: [
    { id: 'cpu', title: 'Shaped around your children', body: 'Every suggestion is shaped by your children\'s ages, interests, recent activities, and what is coming up. The more you use The Hedge, the better the fit.' },
    { id: 'sun', title: 'Live weather, real seasons', body: 'Pulls live forecasts from Open-Meteo for your county and quietly shifts ideas indoors when rain is coming. No manual adjusting.' },
    { id: 'cal', title: 'Knows the Irish calendar', body: 'Term dates, public and bank holidays, mid-terms. The Hedge eases off in school holidays and leans in during term, without you asking.' },
  ],
};

const aearsGroup = {
  title: 'For home-educating families',
  sub: 'Your AEARS evidence, kept as you go',
  features: [
    { id: 'shield', title: 'Evidence that keeps itself', body: 'As you log everyday learning, The Hedge builds a tidy, date-stamped record tagged to the NCCA strands. Nothing extra to write up the night before an assessment.' },
    { id: 'pen', title: 'A clear record to bring', body: 'Export a formatted report of what your family has done, organised and readable, so the AEARS conversation starts from real evidence, not memory.' },
    { id: 'leaf', title: 'The strands, woven in', body: 'Activities carry their NCCA strand and learning-outcome links, so a normal week of doing quietly covers the ground you need to show.' },
  ],
};

const librarySub = 'Over 500 screen-free ideas, rooted in Ireland';
const supportingGroups = [
  {
    title: 'A library worth keeping',
    sub: librarySub,
    features: [
      { id: 'leaf', title: 'Nature & the outdoors', body: 'A large share of the library lives outside, across all our seasons. Rock pooling in Connemara, bog walks in Roscommon, coastal foraging in Cork.' },
      { id: 'flask', title: 'Science & discovery', body: 'Kitchen chemistry, garden experiments, cloud-watching, citizen science. Learning through curiosity, not worksheets.' },
      { id: 'clover', title: 'Heritage & the Irish language', body: 'Folklore, festivals, traditional crafts, and Gaeilge woven through the week. Rooted in the place you live and the stories your children will carry.' },
    ]
  },
  {
    title: 'Wherever you are',
    sub: 'Quiet, practical, and honest about what is ready',
    features: [
      { id: 'globe', title: 'Works in your browser', body: 'The Hedge runs in any modern browser, on phone, tablet, or laptop. Everything you need is there today, no install required.' },
      { id: 'cpu', title: 'iOS & Android apps (coming soon)', body: 'Native apps are in the works. They will land when they are genuinely ready, not before.' },
      { id: 'heart', title: 'Shared with your family', body: 'Bring in your partner or co-parent. You both see the same plan, the same record, the same page.' },
    ]
  },
];

export default function Features() {
  return (
    <>
      <Nav active="/features" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">How The Hedge works</span></div>
            <h1>It gets to know your family <em>first</em></h1>
            <p className="page-hero-desc">Most apps hand you a generic plan and hope it fits. The Hedge starts the other way around. It learns who your family is, builds learning around them, and keeps the record for you. A breath, not a battle.</p>
          </div>
        </div>

        {/* HERO FEATURE: the personalisation engine */}
        <section className="section" aria-labelledby="fg-engine">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">The heart of it</span></div>
            <h2 className="section-title" id="fg-engine">From a conversation to a <em>plan that adapts</em></h2>

            {/* The Kitchen Table -> Family Framework, given primacy */}
            <div style={{marginTop:32,padding:'40px 36px',background:'var(--forest)',borderRadius:20,color:'var(--parchment)'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
                <div style={{width:52,height:52,borderRadius:14,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon id={hero.framework.id} size={26} color="var(--sage)" />
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,32px)',fontWeight:300,lineHeight:1.1}}>{hero.framework.title}</div>
              </div>
              <div style={{fontSize:16,lineHeight:1.7,color:'rgba(189,212,176,0.92)',maxWidth:640}}>{hero.framework.body}</div>
              <div style={{marginTop:22,display:'inline-flex',alignItems:'center',gap:8,fontSize:13,fontWeight:700,letterSpacing:'0.04em',color:'var(--sage)'}}>
                The Kitchen Table <Icon id="arrow-r" size={14} /> your Family Framework <Icon id="arrow-r" size={14} /> everything below
              </div>
            </div>

            {/* The five verbs that adapt to the Framework */}
            <p style={{margin:'34px 0 4px',fontSize:14,color:'var(--clay)',lineHeight:1.6,maxWidth:620}}>
              Once your Framework is in place, the whole product moves with it. Five plain things you can do, every one shaped by your family.
            </p>
            <div className="feat-trio" style={{marginTop:24}}>
              {hero.verbs.map(f => (
                <div key={f.id+f.title} style={{padding:'28px 24px',background:'var(--linen)',borderRadius:16,border:'1px solid var(--stone)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={f.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:17,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stance: timetable or gentle rhythm */}
        <section className="section section-linen" aria-labelledby="fg-stance">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{stanceGroup.sub}</span></div>
            <h2 className="section-title" id="fg-stance">{stanceGroup.title}</h2>
            <div className="feat-trio" style={{marginTop:32}}>
              {stanceGroup.features.map(f => (
                <div key={f.id+f.title} style={{padding:'28px 24px',background:'var(--parchment)',borderRadius:16,border:'1px solid var(--stone)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={f.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AEARS / home education: the strategic wedge, given its own emphasis */}
        <section className="section" aria-labelledby="fg-aears">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{aearsGroup.sub}</span></div>
            <h2 className="section-title" id="fg-aears">{aearsGroup.title}</h2>
            <div className="feat-trio" style={{marginTop:32}}>
              {aearsGroup.features.map(f => (
                <div key={f.id+f.title} style={{padding:'28px 24px',background:'var(--linen)',borderRadius:16,border:'1px solid var(--stone)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={f.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{f.body}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:24}}>
              <Link href="/homeschool" className="blog-read" style={{display:'inline-flex',alignItems:'center',gap:6}}>
                More for home-educating families <Icon id="arrow-r" size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* Supporting features, demoted to lighter weight */}
        {supportingGroups.map((group, gi) => (
          <section key={gi} className={`section ${gi % 2 === 0 ? 'section-linen' : ''}`} aria-labelledby={`fg-s-${gi}`}>
            <div className="container">
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{group.sub}</span></div>
              <h2 className="section-title" id={`fg-s-${gi}`} style={{fontSize:'clamp(22px,3.4vw,30px)'}}>{group.title}</h2>
              <div className="feat-trio" style={{marginTop:28}}>
                {group.features.map(f => (
                  <div key={f.id+f.title} style={{padding:'24px 22px',background:'var(--parchment)',borderRadius:16,border:'1px solid var(--stone)'}}>
                    <div style={{width:38,height:38,borderRadius:10,background:'rgba(61,97,66,0.06)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                      <Icon id={f.id} size={18} color="var(--moss)" />
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:7}}>{f.title}</div>
                    <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.6}}>{f.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        <div className="cta-band">
          <div className="container">
            <h2>Pull up a <em>chair</em></h2>
            <p>Start at the Kitchen Table. Tell us about your family, and your first ideas are ready the same day. Free to begin, no card needed.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Get started free <Icon id="arrow-r" size={16} /></Link>
              <Link href="/homeschool" className="btn-ghost" style={{color:'var(--mist)'}}>Home education <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
