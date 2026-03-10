import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Features — 1,200+ Screen-Free Activities for Irish Families',
  description: 'Explore The Hedge\'s full feature set: AI-powered activity suggestions, weather-aware planning, NCCA curriculum mapping, AEARS logging, and a library of 1,200+ Irish activities.',
  alternates: { canonical: 'https://thehedge.ie/features' },
};

const featureGroups = [
  {
    title: 'Activity Library',
    sub: '1,200+ screen-free ideas',
    features: [
      { id: 'leaf', title: 'Nature & Outdoor Activities', body: '240+ outdoor activities across all Irish seasons. Rock pooling in Connemara, bog walks in Roscommon, coastal foraging in Cork. Every activity designed for real Irish environments.' },
      { id: 'flask', title: 'Science & Discovery', body: 'Kitchen chemistry, garden experiments, cloud identification, and citizen science projects. Learning through curiosity, not worksheets.' },
      { id: 'palette', title: 'Arts & Creativity', body: 'Painting, printmaking, weaving, pottery, nature journalling, seasonal crafts. Activities that produce something real — and beautiful — to keep.' },
      { id: 'calc', title: 'Maths in the Wild', body: 'Measurement, patterns, data collection, shapes in nature. Maths happens everywhere — The Hedge shows children where to find it.' },
      { id: 'book', title: 'Language & Literacy', body: 'Storytelling, letter writing, poetry, read-alouds, oral tradition. English and Irish language activities woven through the weekly plan.' },
      { id: 'clover', title: 'Irish Heritage & Culture', body: 'Folklore, mythology, festivals, traditional crafts, and the Irish language. Rooted in the place you live and the stories your children will carry forever.' },
    ]
  },
  {
    title: 'Intelligence',
    sub: 'Powered by AI that knows Ireland',
    features: [
      { id: 'sun', title: 'Live Weather Integration', body: 'Pulls real-time forecasts from Met Éireann for your exact county. Activities automatically shift indoors when rain is forecast. No manual adjusting needed.' },
      { id: 'cpu', title: 'AI Personalisation Engine', body: 'Every suggestion is shaped by your children\'s ages, interests, recent activities, and upcoming events. The longer you use The Hedge, the smarter it gets.' },
      { id: 'cal', title: 'School Calendar Awareness', body: 'Knows Irish school term dates, public holidays, and bank holidays. Adjusts activity intensity for term time vs school holidays automatically.' },
    ]
  },
  {
    title: 'Planning & Logging',
    sub: 'Your family\'s record, beautifully kept',
    features: [
      { id: 'cal', title: 'Weekly Planner', body: 'Drag and drop activities into your week. See a balanced view across subjects, energy levels, and outdoor vs indoor. Share with your partner or co-parent.' },
      { id: 'leaf', title: 'Activity Timeline', body: 'A rolling record of everything your family has done. Scrollable, searchable, beautiful. The kind of thing you\'ll want to show your children when they\'re older.' },
      { id: 'book', title: 'Learning Log (Educator)', body: 'Auto-generated, date-stamped, NCCA-tagged records of every activity. Export as a formatted PDF report — exactly what AEARS assessors want to see.' },
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
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Everything you need</span></div>
            <h1>Features built for <em>Irish families</em></h1>
            <p className="page-hero-desc">Not a generic app with an Irish flag slapped on it. The Hedge was designed from the ground up for Irish weather, Irish seasons, Irish schools, and Irish family life.</p>
          </div>
        </div>

        {featureGroups.map((group, gi) => (
          <section key={gi} className={`section ${gi % 2 === 1 ? 'section-linen' : ''}`} aria-labelledby={`fg-${gi}`}>
            <div className="container">
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{group.sub}</span></div>
              <h2 className="section-title" id={`fg-${gi}`}>{group.title}</h2>
              <div className="feat-trio" style={{marginTop:32}}>
                {group.features.map(f => (
                  <div key={f.id+f.title} style={{padding:'28px 24px',background:'var(--linen)',borderRadius:16,border:'1px solid var(--stone)'}}>
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
        ))}

        <div className="cta-band">
          <div className="container">
            <h2>Start exploring <em>today</em></h2>
            <p>Free plan available. No credit card. Just create your family profile and your first brief arrives tomorrow morning.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Get started free <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>View pricing <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
