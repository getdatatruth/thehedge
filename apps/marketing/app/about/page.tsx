import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'About The Hedge — Built in West Cork, Ireland',
  description: "The Hedge is a family learning platform built in West Cork, Ireland. We're inspired by Ireland's hedge school tradition and the belief that children learn best through doing.",
  alternates: { canonical: 'https://thehedge.ie/about' },
};

const values = [
  { id:'leaf', title:'Rooted in Ireland', body:"The Hedge is built in Ireland, for Ireland. We know what Irish weather is actually like, what Irish hedgerows look like in October, what Irish parents are balancing. This isn't a US app with an Irish flag appended." },
  { id:'sun', title:'Screen-free by design', body:"Every activity we suggest is something to do, not something to watch. We believe children learn best through making, moving, exploring, and being in the real world." },
  { id:'book', title:'Learning is everywhere', body:"The hedge school tradition understood that learning doesn't need four walls and a bell. It happens in kitchens, gardens, fields, and beaches. We help families find it everywhere." },
  { id:'shield', title:'Privacy first', body:"We will never sell your family's data, serve you ads, or use your children's information to train AI models. EU data storage, GDPR compliant, always." },
  { id:'users', title:'For every family', body:"Whether you homeschool, use mainstream school, live in a city apartment, or on a farm in Connaught — The Hedge works for you. Irish family life is diverse, and we reflect that." },
  { id:'spark', title:'Honest about what we are', body:"We're a small team building something we genuinely believe in. We're not venture-backed, not chasing virality, and not optimising for engagement. We're optimising for families having better days." },
];

export default function About() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About The Hedge',
    url: 'https://thehedge.ie/about',
    description: "The Hedge is a family learning platform built in West Cork, Ireland. Inspired by Ireland's hedge school tradition.",
    mainEntity: {
      '@type': 'Organization',
      name: 'The Hedge',
      foundingLocation: { '@type': 'Place', name: 'West Cork, Ireland' },
      description: "Family learning platform for Irish families.",
      url: 'https://thehedge.ie',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav active="/about" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Our story</span></div>
            <h1>Built in West Cork, <em>for Ireland</em></h1>
            <p className="page-hero-desc">We started The Hedge because we couldn&apos;t find a single family app that understood Irish weather, Irish seasons, or Irish schools. So we built one.</p>
          </div>
        </div>

        {/* STORY */}
        <section className="section" aria-labelledby="story-title">
          <div className="container" style={{maxWidth:760}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">The idea</span></div>
            <h2 className="section-title" id="story-title">The hedge school <em>tradition</em></h2>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {[
                "In 18th-century Ireland, when formal education was suppressed under the Penal Laws, Irish communities created their own — holding lessons outdoors, beneath hedgerows and in ditches, with whatever teacher was available and whatever materials they had to hand. Education, stubbornly happening despite everything.",
                "These hedge schools weren't perfect. But they were real. They were community-driven, they worked with the landscape, and they understood that learning happens wherever you decide it does.",
                "That spirit is what The Hedge is built on. Not the idea that children need a building, a curriculum, or a screen to learn — but that curiosity, guided gently, flowers in the most ordinary places. A kitchen. A garden. A walk along a lane in Kerry in November.",
                "We built The Hedge in West Cork because that's where we live, and because West Cork felt like the right kind of place to build something like this — somewhere with a long memory of learning the hard way, in the real world, outside.",
              ].map((para, i) => (
                <p key={i} style={{fontFamily:'var(--font-serif)',fontSize:'clamp(16px,2.5vw,19px)',color:'var(--clay)',lineHeight:1.75}}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="section section-linen" aria-labelledby="values-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">What we believe</span></div>
            <h2 className="section-title" id="values-title">Our values &amp; <em>principles</em></h2>
            <div style={{display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',marginTop:32}}>
              {values.map(v => (
                <div key={v.title} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid var(--stone)'}}>
                  <div style={{width:38,height:38,borderRadius:9,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                    <Icon id={v.id} size={18} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:7}}>{v.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{v.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BUILT IN IRELAND */}
        <section className="section section-forest" aria-labelledby="made-title">
          <div className="container" style={{maxWidth:700,textAlign:'center'}}>
            <div className="eyebrow eyebrow-sage" style={{justifyContent:'center'}}><div className="eyebrow-line" /><span className="eyebrow-text">Made in Ireland</span></div>
            <h2 className="section-title section-title-light" id="made-title">West Cork to <em>all 32 counties</em></h2>
            <p style={{fontFamily:'var(--font-serif)',fontSize:'clamp(15px,2.5vw,18px)',color:'rgba(189,212,176,0.8)',lineHeight:1.75,marginBottom:32}}>The Hedge is built, hosted, and supported entirely within the EU. Our data never leaves Frankfurt. Our team is based in West Cork. And our test families live in Donegal, Tipperary, Galway, and everywhere in between.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,maxWidth:440,margin:'0 auto'}}>
              {[
                { n:'West Cork', l:'Where we build' },
                { n:'Frankfurt', l:'Where data lives (EU)' },
                { n:'32', l:'Counties covered' },
                { n:'2026', l:'Founded' },
              ].map(s => (
                <div key={s.l} className="stat stat-dark">
                  <div className="stat-n">{s.n}</div>
                  <div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section" aria-labelledby="contact-title">
          <div className="container" style={{maxWidth:640}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Get in touch</span></div>
            <h2 className="section-title" id="contact-title">We love hearing <em>from families</em></h2>
            <p className="section-body">Questions, feedback, stories about what your children made last Tuesday — we want to hear it all. We&apos;re a small team and we read every email.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[
                { id:'msg', label:'General enquiries', email:'hello@thehedge.ie' },
                { id:'shield', label:'Privacy & data', email:'privacy@thehedge.ie' },
                { id:'book', label:'Press & media', email:'press@thehedge.ie' },
              ].map(c => (
                <div key={c.email} style={{display:'flex',alignItems:'center',gap:14,padding:'16px 20px',background:'var(--linen)',borderRadius:12,border:'1px solid var(--stone)'}}>
                  <div style={{width:36,height:36,borderRadius:8,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon id={c.id} size={16} color="var(--moss)" />
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--clay)',marginBottom:2}}>{c.label}</div>
                    <a href={`mailto:${c.email}`} style={{fontSize:15,fontWeight:600,color:'var(--forest)'}}>{c.email}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Ready to try it <em>for your family?</em></h2>
            <p>Free to start. Built in Ireland. Ready for your children tomorrow morning.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Start free today <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
