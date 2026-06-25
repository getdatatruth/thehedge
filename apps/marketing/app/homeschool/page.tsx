import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Homeschool in Ireland - NCCA Curriculum & AEARS Support | The Hedge',
  description: 'Ireland\'s home education companion. NCCA primary curriculum mapping, learning logs to help organise your AEARS evidence, weekly planners, and PDF reports. Built for Irish home educators of under-12s.',
  alternates: { canonical: 'https://thehedge.ie/homeschool' },
  keywords: ['homeschool Ireland','AEARS Ireland','Tusla homeschool','NCCA homeschool','home education Ireland'],
};

const feats = [
  { id:'book', title:'NCCA Curriculum Mapping', body:'Every activity is tagged to the NCCA primary curriculum strands. Your children learn through doing - The Hedge tracks the curriculum automatically in the background.' },
  { id:'file', title:'Learning Logs for AEARS', body:"The Tusla Assessment of Education in Places other than Recognised Schools (AEARS) process looks for evidence of learning. The Hedge auto-generates date-stamped, curriculum-tagged records of everything your child does, designed to help you organise that evidence." },
  { id:'folder', title:'PDF Report Export', body:'Generate a formatted PDF learning report at any time - covering any date range, any subject areas, any children. A clear, organised record to bring to your AEARS assessment, with one click.' },
  { id:'cal', title:'Weekly Curriculum Planner', body:"Plan your week across the NCCA primary subject areas. The Hedge suggests activities that fit your plan, balances subjects automatically, and flags any areas that haven't been covered recently." },
  { id:'users', title:'Multi-Child Management', body:"Running a household school? Manage each child's curriculum, interests, and learning records completely separately - or together, for activities that work across ages." },
  { id:'spark', title:'IEP Support Tools', body:'For children with additional learning needs, The Hedge supports Individual Education Plan (IEP) goal setting, tracking, and evidence gathering alongside the main curriculum.' },
];

const stages = [
  'Junior Infants – 2nd Class', '3rd – 4th Class', '5th – 6th Class',
];

const subjects = [
  'Mathematics','English Language','Irish Language','Science (SESE)','Geography (SESE)','History (SESE)',
  'Arts Education','Drama','Music','Physical Education','SPHE','Religious Education',
];

const faqs = [
  { q:"Is The Hedge officially approved by Tusla?", a:"The Hedge is not an official Tusla product. The learning logs it generates are designed to help you organise the kind of evidence an AEARS assessment looks for, so you can walk in with a clear, dated record of what you have covered." },
  { q:"What curriculum does The Hedge map to?", a:"The primary NCCA curriculum (Junior Infants to 6th Class) and the Aistear early childhood framework. The Hedge is focused on early years and primary, so it is built around the under-12 stages of Irish education." },
  { q:"Do I need to be formally registered with Tusla?", a:"The Hedge works for all home-educating families. Our tools support both AEARS assessment preparation and everyday learning record keeping, whatever stage of registration you are at." },
  { q:"Can The Hedge replace a formal curriculum?", a:"The Hedge is a supplement and planning tool, not a standalone curriculum provider. It works beautifully alongside structured programmes like Classical Conversations, Charlotte Mason, or your own bespoke approach." },
];

export default function Homeschool() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'The Hedge Educator Plan - Irish Homeschool Companion',
    description: "NCCA primary curriculum mapping, learning logs to help organise your AEARS evidence, and weekly planners for Irish home-educating families.",
    provider: { '@type': 'Organization', name: 'The Hedge', sameAs: 'https://thehedge.ie' },
    educationalLevel: 'Early years and primary (Aistear, NCCA primary)',
    inLanguage: ['en-IE', 'ga'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav active="/homeschool" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">For home educators</span></div>
            <h1>Ireland&apos;s homeschool <em>companion</em></h1>
            <p className="page-hero-desc">NCCA primary curriculum mapping, learning logs designed to help you organise the evidence an AEARS assessment looks for, and a weekly planner that actually knows the Irish school calendar. Everything you need to run a rich, evidenced home education for your under-12s.</p>
            <p style={{fontSize:13,color:'var(--clay)',marginTop:14,maxWidth:560,lineHeight:1.6}}>The Hedge is not an official Tusla product and is not affiliated with Tusla. It is a planning and record-keeping tool built to help you prepare for your AEARS assessment.</p>
          </div>
        </div>

        {/* FEATURES */}
        <section className="section" aria-labelledby="hs-feats-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Educator plan features</span></div>
            <h2 className="section-title" id="hs-feats-title">Built for <em>Irish home educators</em></h2>
            <div className="feat-trio" style={{marginTop:32}}>
              {feats.map(f => (
                <div key={f.title} style={{padding:'26px 22px',background:'var(--linen)',borderRadius:14,border:'1px solid var(--stone)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'rgba(61,97,66,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={f.id} size={19} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NCCA */}
        <section className="section section-forest" aria-labelledby="ncca-title">
          <div className="container">
            <div style={{display:'grid',gap:40}}>
              <div style={{maxWidth:560}}>
                <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">Curriculum coverage</span></div>
                <h2 className="section-title section-title-light" id="ncca-title">Full NCCA <em>curriculum mapping</em></h2>
                <p className="section-body section-body-light">Every activity in The Hedge is tagged to at least one NCCA strand. Over time, the platform helps you see where your children are thriving - and which areas could use more attention.</p>
                <div className="ncca-band" style={{marginTop:0}}>
                  <h3>Curriculum stages covered</h3>
                  <p>From early childhood through the end of primary, The Hedge grows with your children.</p>
                  <div className="stages">
                    {stages.map(s => <span key={s} className="stage">{s}</span>)}
                  </div>
                  <h3 style={{marginTop:24,marginBottom:12,fontSize:18}}>Subjects mapped</h3>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {subjects.map(s => (
                      <span key={s} style={{fontSize:11,background:'rgba(143,175,126,0.12)',color:'var(--sage)',padding:'5px 10px',borderRadius:3,border:'1px solid rgba(143,175,126,0.2)'}}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AEARS EXPLAINER */}
        <section className="section section-linen" aria-labelledby="aears-title">
          <div className="container" style={{maxWidth:800}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">AEARS &amp; Tusla</span></div>
            <h2 className="section-title" id="aears-title">The AEARS process, <em>simplified</em></h2>
            <p className="section-body">The Tusla AEARS assessment can feel daunting. The Hedge takes the administrative burden away entirely, so you can focus on the actual education.</p>
            <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',marginTop:32}}>
              {[
                { step:'Step 1', title:'Teach normally', body:'Go about your home education as usual. Every activity you log in The Hedge is automatically tagged, dated, and linked to the relevant curriculum strands.' },
                { step:'Step 2', title:'Review your log', body:"At any time, open the Learning Log to see a chronological record of everything you've covered - searchable by subject, strand, or date range." },
                { step:'Step 3', title:'Generate your report', body:"When assessment time comes, generate a learning report. Choose your date range and the system produces a formatted PDF in under 10 seconds." },
                { step:'Step 4', title:'Walk in prepared', body:'Your report shows dated evidence of curriculum-aligned learning across the subject areas you have covered - a clear, organised record to bring to your AEARS assessment.' },
              ].map(s => (
                <div key={s.step} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid var(--stone)'}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--terracotta)',marginBottom:8}}>{s.step}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{s.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EARLY ACCESS */}
        <section className="section" aria-labelledby="hs-early-title">
          <div className="container" style={{maxWidth:720}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Early access</span></div>
            <h2 className="section-title" id="hs-early-title">Built with Irish <em>home educators</em></h2>
            <p className="section-body">The Hedge is new, and we are building the home education tools alongside the families who use them. We will not put words in other parents&apos; mouths here. If the AEARS season fills you with dread, come and help us make the tool you wish you had - and shape it as we go.</p>
            <div className="actions" style={{marginTop:8}}>
              <Link href="https://app.thehedge.ie/signup?plan=educator" className="btn-primary">Try the Educator plan <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-linen" aria-labelledby="hs-faq-title">
          <div className="container" style={{maxWidth:760}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Homeschool questions</span></div>
            <h2 className="section-title" id="hs-faq-title">Answers for <em>home educators</em></h2>
            <FAQ items={faqs} />
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Start your home education <em>journey</em></h2>
            <p>Become one of our founding home education families. 14-day free trial on the Educator plan - no card needed.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup?plan=educator" className="btn-light">Try Educator free - 14 days <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>Compare plans</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
