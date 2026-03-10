import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Homeschool Ireland — AEARS Compliance & NCCA Curriculum Planning',
  description: 'The only Irish family platform built for homeschoolers. AEARS-ready learning logs, NCCA curriculum mapping, daily plan builder, and PDF assessment export. Built for Tusla AEARS assessments.',
  keywords: ['homeschool Ireland','AEARS compliance','NCCA curriculum','Tusla assessment','homeschool Cork','Irish homeschool log','home education Ireland'],
  alternates: { canonical: 'https://thehedge.ie/homeschool' },
};

const tools = [
  { id: 'shield', title: 'AEARS Learning Log', body: 'Every activity you complete is automatically recorded with date, duration, NCCA subject strand, and age-appropriateness rating. The log is formatted exactly as AEARS assessors expect. Export any time as a multi-page PDF report — no editing required.', highlight: 'Accepted by AEARS assessors' },
  { id: 'book', title: 'NCCA Curriculum Mapper', body: 'Every activity in The Hedge is tagged to the relevant Primary Curriculum strand. The mapper shows you which learning goals you\'ve covered this week, month, and year — and gently flags any gaps. Covers Aistear (ECCE), Junior Infants to 6th Class.', highlight: 'Full strand coverage' },
  { id: 'cal', title: 'Daily Plan Builder', body: 'A drag-and-drop weekly planner that creates legally defensible daily schedules. Set time allocations by subject, include free play, meals, and outdoor time. Print or share as a PDF — exactly what assessors want to see alongside your learning log.', highlight: 'Drag & drop simplicity' },
  { id: 'users', title: 'Child Profiles & IEPs', body: 'Create individual learning profiles for each child. Note strengths, challenges, learning style, and any special educational needs. The Hedge uses these profiles to tailor activity suggestions — and they form the backbone of an Individual Education Plan if needed.', highlight: 'Educator plan feature' },
  { id: 'spark', title: 'Assessment Export', body: 'With one click, generate a formatted, printable portfolio: cover page, learning goals summary, weekly schedule samples, and activity log. Sent directly to your email as a PDF. Many AEARS assessors now accept this format as a primary record.', highlight: 'One-click PDF portfolio' },
  { id: 'leaf', title: 'Seasonal Curriculum Planning', body: 'Irish homeschooling thrives when it follows the seasons. The Hedge builds your curriculum around Samhain, Imbolc, Bealtaine, and Lúnasa — weaving Irish language, folklore, and nature study into each season naturally.', highlight: 'Distinctly Irish' },
];

const quotes = [
  { text: '"I dreaded the AEARS assessment every year. Last year I just printed the PDF from The Hedge and handed it over. The assessor said it was the most thorough log she\'d seen."', by: 'Máire Breathnach, homeschooling Mam of 4', location: 'Tipperary' },
  { text: '"The NCCA mapper made me realise I\'d been accidentally skipping Maths in the Wild all term. Within a week I\'d filled the gap without my kids even knowing we were \'doing maths\'."', by: 'Rónán Ó Briain, homeschool Dad', location: 'Clare' },
];

export default function Homeschool() {
  return (
    <>
      <Nav active="/homeschool" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">For homeschooling families in Ireland</span></div>
            <h1>The only platform built for<br />the <em>Tusla path</em></h1>
            <p className="page-hero-desc">AEARS-ready learning logs, NCCA curriculum mapping, and a daily plan builder — designed by Irish homeschool families, for Irish homeschool families.</p>
          </div>
        </div>

        <section className="section section-linen" aria-labelledby="tools-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">The full homeschool suite</span></div>
            <h2 className="section-title" id="tools-heading">Every tool you need for <em>confident homeschooling</em></h2>
            <div className="feat-trio" style={{marginTop:36}}>
              {tools.map(t => (
                <div key={t.id+t.title} style={{padding:'28px 24px',background:'white',borderRadius:16,border:'1px solid var(--stone)',boxShadow:'0 2px 12px rgba(28,53,32,0.06)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={t.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:6}}>{t.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65,marginBottom:12}}>{t.body}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--terracotta)',display:'flex',alignItems:'center',gap:5}}>
                    <Icon id="check" size={10} color="var(--terracotta)" />{t.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="ncca-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Curriculum alignment</span></div>
            <h2 className="section-title" id="ncca-heading">Fully aligned with the <em>Irish National Curriculum</em></h2>
            <p className="section-body" style={{maxWidth:600}}>Every activity in The Hedge is tagged to the relevant NCCA curriculum strand. The platform covers the full primary school journey from Aistear to 6th Class, plus supplementary Gaeilge activities at every level.</p>
            <div style={{display:'grid',gap:12,marginTop:12}}>
              {[
                { stage: 'Aistear (ECCE)', ages: 'Ages 0–6', strands: ['Wellbeing','Identity & Belonging','Communicating','Exploring & Thinking'] },
                { stage: 'Junior Infants – 2nd Class', ages: 'Ages 4–8', strands: ['English','Gaeilge','Maths','SESE','Arts','PE','SPHE'] },
                { stage: '3rd – 6th Class', ages: 'Ages 8–12', strands: ['English','Gaeilge','Maths','SESE','History','Geography','Science','Arts'] },
              ].map(s => (
                <div key={s.stage} style={{background:'var(--linen)',borderRadius:12,padding:'20px 22px',border:'1px solid var(--stone)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--ink)'}}>{s.stage}</div>
                    <div style={{fontSize:11,background:'rgba(61,97,66,0.08)',color:'var(--moss)',padding:'3px 10px',borderRadius:3,fontWeight:600}}>{s.ages}</div>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {s.strands.map(st => <span key={st} style={{fontSize:11,background:'white',color:'var(--umber)',padding:'4px 10px',borderRadius:3,border:'1px solid var(--stone)'}}>{st}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="quotes-heading">
          <div className="container" style={{maxWidth:800}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">From our homeschool community</span></div>
            <h2 className="section-title" id="quotes-heading">Families who&apos;ve <em>been through AEARS</em></h2>
            <div style={{display:'grid',gap:20,marginTop:32}}>
              {quotes.map((q, i) => (
                <blockquote key={i} style={{background:i===0?'var(--forest)':'white',borderRadius:16,padding:'28px 28px',border:'1px solid var(--stone)'}}>
                  <p style={{fontFamily:'var(--font-display)',fontSize:'clamp(17px,2.5vw,21px)',fontStyle:'italic',fontWeight:300,color:i===0?'var(--parchment)':'var(--ink)',lineHeight:1.6,marginBottom:14}}>{q.text}</p>
                  <footer style={{fontSize:12,color:i===0?'var(--sage)':'var(--clay)',fontWeight:600}}>{q.by} · {q.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Start your <em>homeschool journey</em> today</h2>
            <p>The Educator plan includes everything you need for confident, compliant, joyful homeschooling.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup?plan=educator" className="btn-light">Start Educator trial <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>Compare plans <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
