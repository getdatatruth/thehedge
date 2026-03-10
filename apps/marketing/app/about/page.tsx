import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'About — Built in West Cork for Irish Families',
  description: 'The story behind The Hedge — why we built it, who we are, and why Ireland\'s hedge school tradition still matters for families today.',
  alternates: { canonical: 'https://thehedge.ie/about' },
};

export default function About() {
  return (
    <>
      <Nav active="/about" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Our story</span></div>
            <h1>Built in West Cork,<br /><em>for Irish families</em></h1>
            <p className="page-hero-desc">We built The Hedge because we couldn&apos;t find what we needed — and because Ireland&apos;s hedge school tradition is too good to leave in history books.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="story-heading">
          <div className="container" style={{maxWidth:740}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Why we built it</span></div>
            <h2 className="section-title" id="story-heading">The idea behind <em>The Hedge</em></h2>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {[
                "The Hedge started with a simple frustration: we were homeschooling our own children in West Cork and couldn't find a single tool that understood Ireland. Every app we tried assumed we were American, every activity assumed maples not ash trees, every curriculum guide assumed a suburban house with a garden shed.",
                "We wanted something that knew the difference between a Connemara beach and a Wicklow forest. Something that checked the weather before suggesting an outdoor activity. Something that actually understood the NCCA curriculum and Tusla's AEARS assessment process.",
                "So we built it. The Hedge is named for Ireland's hedge schools — the clandestine outdoor classrooms where, during the Penal Laws, Irish children gathered under hedgerows to learn. The hedge was the schoolroom. The outdoors was the curriculum. The community was the teacher.",
                "We think that spirit is more relevant than ever. In a world of screens and structured schedules, there's something profound about learning that happens outside — in fields, on beaches, in kitchens, in bogs. Learning that belongs to the family, not to an institution.",
              ].map((p, i) => (
                <p key={i} style={{fontFamily:'var(--font-serif)',fontSize:'clamp(16px,2.5vw,19px)',color:'var(--clay)',lineHeight:1.75}}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="values-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">What we believe</span></div>
            <h2 className="section-title" id="values-heading">Our <em>values</em></h2>
            <div className="feat-trio" style={{marginTop:32}}>
              {[
                { id:'leaf', title:'Place matters', body:'A child who knows the name of every plant in their hedgerow has something no screen can give them. The Hedge builds activities around where you actually live — your county, your coastline, your seasons.' },
                { id:'clover', title:'Ireland is specific', body:'Irish family life has its own rhythms, traditions, and landscape. We don\'t translate American content. We create from scratch, for here, for this.' },
                { id:'shield', title:'Privacy is not optional', body:'Your children\'s data, their interests, their learning journeys — these belong to your family. We store data in the EU, we never sell it, and you can delete everything at any time.' },
                { id:'book', title:'Screen-free has value', body:'We\'re an app that genuinely believes you should put the phone down more. The Hedge exists to get families offline and into the world — not to grab more attention.' },
                { id:'users', title:'Community over content', body:'The best ideas come from other families. The Hedge community shares what works, what surprised them, and what they\'d do differently. No algorithm, no viral content — just neighbours.' },
                { id:'spark', title:'Learning is already happening', body:'Your child doesn\'t need a curriculum. They need permission, materials, and a parent who trusts the process. The Hedge is designed to support what\'s already happening in your family.' },
              ].map(v => (
                <div key={v.id} style={{padding:'28px 24px',background:'var(--parchment)',borderRadius:16,border:'1px solid var(--stone)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={v.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{v.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{v.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="hedge-schools-heading">
          <div className="container" style={{maxWidth:740}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Our namesake</span></div>
            <h2 className="section-title" id="hedge-schools-heading">The original <em>hedge schools</em></h2>
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <p style={{fontFamily:'var(--font-serif)',fontSize:'clamp(16px,2.5vw,18px)',color:'var(--clay)',lineHeight:1.75}}>
                Ireland&apos;s hedge schools (scoileanna scairte) flourished in the 17th and 18th centuries, when the Penal Laws made Catholic education illegal. Teachers held lessons in fields, under hedgerows, and in barns — anywhere they could gather children and avoid detection.
              </p>
              <p style={{fontFamily:'var(--font-serif)',fontSize:'clamp(16px,2.5vw,18px)',color:'var(--clay)',lineHeight:1.75}}>
                What strikes us about the hedge schools isn&apos;t just their defiance — it&apos;s their pedagogy. Learning happened in the world, not in spite of it. Children learned by doing, by observing, by talking. The community was the curriculum.
              </p>
              <blockquote style={{background:'var(--forest)',borderRadius:16,padding:'28px 28px',margin:'8px 0'}}>
                <p style={{fontFamily:'var(--font-display)',fontSize:'clamp(18px,3vw,24px)',fontStyle:'italic',fontWeight:300,color:'var(--parchment)',lineHeight:1.6,marginBottom:12}}>
                  &ldquo;In the hedge schools, the children didn&apos;t just learn — they learned together, from the place they lived, through the language they loved.&rdquo;
                </p>
                <footer style={{fontSize:12,color:'var(--sage)'}}>— Adapted from Brian Friel, Translations (1980)</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Bring the <em>hedge school home</em></h2>
            <p>Start for free — and discover what Irish family learning can feel like.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Join The Hedge <Icon id="arrow-r" size={16} /></Link>
              <Link href="/blog" className="btn-ghost" style={{color:'var(--mist)'}}>Read our journal <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
