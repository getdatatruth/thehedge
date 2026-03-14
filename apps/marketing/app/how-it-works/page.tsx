import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'How The Hedge Works - Setup in 2 Minutes',
  description: 'See exactly how The Hedge works: tell us about your family, we check the weather, your daily brief arrives every morning. Free to start.',
  alternates: { canonical: 'https://thehedge.ie/how-it-works' },
};

const steps = [
  {
    n:'01', id:'users',
    title:'Create your family profile',
    time:'Takes 2 minutes',
    body:"Tell us your children's names and ages, what they love (nature, art, science, sport), and what space you have - garden, apartment, access to the countryside. That's it. The Hedge handles everything else.",
    details:["Children's ages 2–16 supported","Multi-child households handled gracefully","Update anytime as interests change","Optional: dietary, learning, and accessibility notes"],
  },
  {
    n:'02', id:'sun',
    title:'We check your weather every morning',
    time:'Automatic, every day',
    body:"Each morning, The Hedge pulls live weather data from Open-Meteo for your specific county. 16°C and sunny in Wicklow? Outdoor adventure it is. 8°C and horizontal rain in Mayo? We&apos;ve got a full day of indoor magic ready.",
    details:["Live forecast data for all 32 counties","Adjusts for morning vs afternoon changes","Season-aware: activities shift as the year progresses","Met Éireann data integration"],
  },
  {
    n:'03', id:'spark',
    title:'Your daily brief lands every morning',
    time:'Ready when you wake up',
    body:"Open The Hedge and see three perfectly matched activity ideas - one outdoor, one creative, one learning-focused. Each with a clear description, age guidance, and everything you&apos;ll need from around the house.",
    details:["3 tailored suggestions every morning","Outdoor, creative, and learning categories","Step-by-step instructions included","What you&apos;ll need, sourced from home"],
  },
  {
    n:'04', id:'cal',
    title:'Plan your week ahead',
    time:'Optional but powerful',
    body:"The weekly planner lets you drag activities into specific days, see a balanced view across all subjects and energy types, and share the week with a partner. Homeschool families can align to the NCCA curriculum automatically.",
    details:["Drag-and-drop weekly calendar","Balance across subjects and energy levels","Share with co-parents","NCCA curriculum alignment (Educator plan)"],
  },
  {
    n:'05', id:'leaf',
    title:'Log it. Keep it forever.',
    time:'One tap, done',
    body:"Tap to mark an activity done and it joins your family&apos;s timeline - a rolling, searchable record of everything you&apos;ve made, explored, and learned together. The kind of thing you&apos;ll want to show your children when they&apos;re older.",
    details:["One-tap activity logging","Photo attachment supported","Searchable timeline","AEARS-compliant reports (Educator plan)"],
  },
];

const faqs = [
  { q:"How long does setup take?", a:"Most families are set up and receiving their first brief within 2–3 minutes. We ask for the essentials only - children's ages, a few interest categories, your county. You can fill in more detail later." },
  { q:"What if I don't have a garden?", a:"No problem at all. The Hedge knows whether you have outdoor space and adjusts accordingly. Apartment families get a completely different mix - community parks, indoor projects, sensory play, and urban exploration activities." },
  { q:"Can I use it for multiple children of different ages?", a:"Absolutely - this is one of The Hedge's strengths. You tell us each child's age and interests separately, and we suggest activities that work across the age range, as well as age-specific suggestions for one-on-one time." },
  { q:"What if I want to skip a suggestion?", a:"Just swipe it away. The Hedge will generate a replacement. The more you skip and select, the better our suggestions get - the AI learns your family's preferences over time." },
];

export default function HowItWorks() {
  return (
    <>
      <Nav active="/how-it-works" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Getting started</span></div>
            <h1>Up and running in <em>2 minutes</em></h1>
            <p className="page-hero-desc">No lengthy onboarding, no complicated setup. Tell us about your family and your first activity brief arrives tomorrow morning.</p>
          </div>
        </div>

        {/* STEPS */}
        <section className="section" aria-labelledby="steps-title">
          <div className="container">
            <h2 className="section-title" id="steps-title" style={{marginBottom:48}}>Five steps to <em>a richer family life</em></h2>
            <div style={{display:'grid',gap:0}}>
              {steps.map((s, i) => (
                <div key={s.n} style={{display:'grid',gap:24,padding:'48px 0',borderBottom:'1px solid var(--stone)',gridTemplateColumns:'1fr'}} aria-label={`Step ${s.n}: ${s.title}`}>
                  <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(48px,8vw,80px)',fontWeight:300,color:'var(--stone)',lineHeight:1,flexShrink:0,minWidth:'1ch'}}>{s.n}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(61,97,66,0.08)',borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--terracotta)',marginBottom:12}}>{s.time}</div>
                      <h3 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,36px)',fontWeight:400,color:'var(--ink)',marginBottom:12,lineHeight:1.1}}>{s.title}</h3>
                      <p style={{fontFamily:'var(--font-serif)',fontSize:'clamp(15px,2vw,17px)',color:'var(--clay)',lineHeight:1.7,marginBottom:20}} dangerouslySetInnerHTML={{__html:s.body}} />
                      <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8}}>
                        {s.details.map(d => (
                          <li key={d} style={{display:'flex',gap:8,alignItems:'center',fontSize:14,color:'var(--umber)'}}>
                            <Icon id="check" size={14} color="var(--moss)" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="section section-linen" aria-labelledby="wug-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">What&apos;s in every brief</span></div>
            <h2 className="section-title" id="wug-title">Everything you need, <em>nothing you don&apos;t</em></h2>
            <div style={{display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',marginTop:32}}>
              {[
                { id:'spark', title:'Personalised for your family', body:"Not generic. Every suggestion uses your children's ages, interests, what you've done recently, and what the weather is doing." },
                { id:'sun', title:'Weather-matched daily', body:"Automatically adjusts between outdoor and indoor based on your local forecast - without you having to touch a setting." },
                { id:'leaf', title:'Rooted in Irish nature', body:"Seasonal activities that match what's actually happening in Ireland right now - berries in autumn, lambs in spring, winter stargazing." },
                { id:'book', title:'Curriculum-connected', body:"Every activity links to at least one NCCA strand. Perfect for homeschoolers, but visible for all families who want to know the learning behind the fun." },
                { id:'cal', title:'Ready to use immediately', body:"Step-by-step instructions, suggested timing, and a list of what you'll need - nearly always things already in your home." },
                { id:'users', title:'Scales as they grow', body:"Update your children's ages and interests any time. The Hedge adapts every suggestion accordingly - no manual reconfiguration." },
              ].map(c => (
                <div key={c.title} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid var(--stone)'}}>
                  <div style={{width:38,height:38,borderRadius:9,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                    <Icon id={c.id} size={18} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:7}}>{c.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" aria-labelledby="hiw-faq-title">
          <div className="container" style={{maxWidth:760}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Questions</span></div>
            <h2 className="section-title" id="hiw-faq-title">A few more <em>answers</em></h2>
            <FAQ items={faqs} />
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Ready to get <em>started?</em></h2>
            <p>Create your family profile and your first activity brief arrives tomorrow morning. Free, always.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Start free - 2 minutes <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>See pricing</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
