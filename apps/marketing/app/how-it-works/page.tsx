import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'How The Hedge Works — Setup in 2 Minutes',
  description: 'See how The Hedge creates personalised daily activity plans for your Irish family — powered by your location, weather, and your children\'s ages and interests.',
  alternates: { canonical: 'https://thehedge.ie/how-it-works' },
};

const steps = [
  { num: '01', id: 'users', title: 'Create your family profile', body: 'Tell us your children\'s names, ages, and what they love. Do they go wild for dinosaurs? Obsessed with cooking? Prefer building to drawing? The Hedge uses this to filter and personalise every single suggestion from day one.', detail: 'Takes about 2 minutes. You can edit it any time.' },
  { num: '02', id: 'map', title: 'We pin your county', body: 'The Hedge connects to live weather data for your exact county — not just "Ireland". A sunny morning in Cork is different to a blustery afternoon in Donegal. Your activity feed reflects that, every morning.', detail: 'Covers all 32 counties of Ireland.' },
  { num: '03', id: 'cal', title: 'Your morning brief arrives', body: 'Before 8am every day, your activity feed is ready. Three to five ideas for today: two outdoor (if weather permits), two indoor, and one wild card. Each with full instructions, age notes, and a list of what you need.', detail: 'No prep required. Just open the app.' },
  { num: '04', id: 'spark', title: 'The AI learns your family', body: 'Every time you mark an activity done, rate it, or skip it, The Hedge learns. Over time, suggestions become uncannily accurate — not just age-appropriate, but your-family-appropriate.', detail: 'The longer you use it, the better it gets.' },
  { num: '05', id: 'book', title: 'Log, reflect, remember', body: 'Every completed activity is saved to your family\'s timeline. A beautiful record of what you did, when, and what your children discovered. Homeschoolers can export this as an AEARS-ready learning log.', detail: 'Your family\'s story, beautifully kept.' },
  { num: '06', id: 'leaf', title: 'Plan your week ahead', body: 'Use the weekly planner to map out your days in advance. Drag in activities, block out commitments, and see a full picture of the week ahead — balanced across subjects, energy levels, and weather forecasts.', detail: 'On Family and Educator plans.' },
];

const faqs = [
  { q: 'How long does setup take?', a: 'Most families are up and running in under 3 minutes. We ask about your children\'s ages, what they enjoy, and your county. That\'s it. You can always add more detail later.' },
  { q: 'Does it work for single-child families?', a: 'Absolutely. The Hedge works just as well for one child as for four. Activities are always tailored to the specific age and interests you\'ve set.' },
  { q: 'What if I live in a rural area?', a: 'The Hedge was built in West Cork — rural Ireland is in our DNA. Many of our best activities are designed for families with access to fields, hedgerows, beaches, and bogs.' },
  { q: 'Can I use it for weekend planning only?', a: 'Yes. You can set your planning preferences to weekends only, school holidays only, or every day. It\'s completely flexible.' },
  { q: 'Is The Hedge only for young children?', a: 'We cover ages 2–14. Activities are filtered by age and get more complex as children grow. Teenagers will find The Hedge genuinely interesting, not babyish.' },
];

export default function HowItWorks() {
  return (
    <>
      <Nav active="/how-it-works" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow">
              <div className="page-hero-eyebrow-line" />
              <span className="page-hero-eyebrow-text">Simple by design</span>
            </div>
            <h1>How The Hedge <em>works</em></h1>
            <p className="page-hero-desc">From your first morning cup of tea to a full year of family memories — here&apos;s exactly what happens when you join The Hedge.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="steps-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Step by step</span></div>
            <h2 className="section-title" id="steps-heading">Six steps to your <em>family&apos;s rhythm</em></h2>
            <div className="steps" style={{marginTop:32}}>
              {steps.map(s => (
                <div className="step" key={s.num}>
                  <div className="step-num">{s.num}</div>
                  <div>
                    <div className="step-ic"><Icon id={s.id} size={16} color="var(--moss)" /></div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-body">{s.body}</div>
                    <div style={{fontSize:12,color:'var(--terracotta)',fontWeight:600,marginTop:8,display:'flex',alignItems:'center',gap:5}}>
                      <Icon id="check" size={11} color="var(--terracotta)" />{s.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="faq-heading">
          <div className="container" style={{maxWidth:720}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Questions answered</span></div>
            <h2 className="section-title" id="faq-heading">Frequently asked <em>questions</em></h2>
            <div className="faq" role="list">
              {faqs.map((f, i) => (
                <details key={i} className="faq-item" role="listitem">
                  <summary className="faq-q">
                    <span className="faq-q-text">{f.q}</span>
                    <div className="faq-icon"><Icon id="plus" size={12} color="var(--parchment)" /></div>
                  </summary>
                  <div className="faq-a"><div className="faq-a-inner">{f.a}</div></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Ready to see it <em>in action?</em></h2>
            <p>Start for free — no credit card needed. Your first morning brief will arrive tomorrow.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Create your family profile <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{color:'var(--mist)'}}>See pricing <Icon id="arrow-r" size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
