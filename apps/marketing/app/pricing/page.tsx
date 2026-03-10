'use client';
import { useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

const plans = [
  {
    name: 'Free', tag: 'Get started', monthly: 0, annual: 0, btn: 'pcb-outline', btnLabel: 'Start for free', href: 'https://app.thehedge.ie/signup',
    feats: [
      { label: '3 activity ideas per day', inc: true },
      { label: 'Local weather integration', inc: true },
      { label: 'Basic activity library (100 activities)', inc: true },
      { label: '5 AI suggestions per week', inc: true },
      { label: 'Activity logging (last 7 days)', inc: true },
      { label: 'Email support', inc: true },
      { label: 'Full activity library (1,200+)', inc: false },
      { label: 'Weekly planner', inc: false },
      { label: 'Unlimited AI suggestions', inc: false },
      { label: 'AEARS learning log', inc: false },
      { label: 'PDF assessment export', inc: false },
    ]
  },
  {
    name: 'Family', tag: 'Most popular', monthly: 6.99, annual: 59.99, popular: true, btn: 'pcb-terra', btnLabel: 'Start free trial', href: 'https://app.thehedge.ie/signup?plan=family',
    feats: [
      { label: 'Unlimited daily activities', inc: true },
      { label: 'Full activity library (1,200+)', inc: true },
      { label: 'Live weather planning', inc: true },
      { label: 'Unlimited AI suggestions', inc: true },
      { label: 'Weekly planner', inc: true },
      { label: 'Activity timeline (full history)', inc: true },
      { label: 'Up to 5 child profiles', inc: true },
      { label: 'iOS & Android app', inc: true },
      { label: 'Priority email support', inc: true },
      { label: 'AEARS learning log', inc: false },
      { label: 'PDF assessment export', inc: false },
    ]
  },
  {
    name: 'Educator', tag: 'For homeschoolers', monthly: 14.99, annual: 134.99, btn: 'pcb-sage', btnLabel: 'Start free trial', href: 'https://app.thehedge.ie/signup?plan=educator',
    feats: [
      { label: 'Everything in Family', inc: true },
      { label: 'AEARS learning log', inc: true },
      { label: 'NCCA curriculum mapper', inc: true },
      { label: 'Daily plan builder', inc: true },
      { label: 'PDF assessment portfolio export', inc: true },
      { label: 'Individual learning profiles (IEPs)', inc: true },
      { label: 'Unlimited child profiles', inc: true },
      { label: 'Seasonal curriculum planner', inc: true },
      { label: 'Dedicated onboarding call', inc: true },
      { label: 'WhatsApp support line', inc: true },
      { label: 'Early access to new features', inc: true },
    ]
  },
];

const faqs = [
  { q: 'Is there really a free plan?', a: 'Yes — genuinely free, no credit card needed. You get 3 activity ideas per day and limited library access. It\'s a real taste of The Hedge, not a crippled trial.' },
  { q: 'What happens after the 14-day trial?', a: 'If you don\'t cancel, you\'ll be charged the monthly or annual rate you chose at sign-up. We\'ll send a reminder email 3 days before your trial ends. Cancel any time from your account settings.' },
  { q: 'Can I switch plans?', a: 'Yes, any time. Upgrade and the new features are available immediately. Downgrade and you\'ll stay on the higher plan until the end of your billing period.' },
  { q: 'Is my data safe?', a: 'Your data is stored on EU servers (Frankfurt). We\'re GDPR compliant and never sell data to third parties. You can export or delete your data at any time from your account.' },
  { q: 'Do you offer a discount for large families?', a: 'The Family and Educator plans already cover unlimited children. If you have a very specific need — multiple families, school groups, or a community — get in touch at hello@thehedge.ie.' },
  { q: 'How does annual billing work?', a: 'Annual plans are billed once per year at a discounted rate. Family annual is €59.99 (saves ~€24 vs monthly). Educator annual is €134.99 (saves ~€45 vs monthly).' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <Nav active="/pricing" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Transparent pricing</span></div>
            <h1>Fair pricing for <em>Irish families</em></h1>
            <p className="page-hero-desc">Start free. Upgrade when you&apos;re ready. No hidden fees, no dark patterns, no annual lock-in.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="plans-heading">
          <div className="container">
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,marginBottom:40}}>
              <h2 className="section-title" id="plans-heading" style={{textAlign:'center',marginBottom:8}}>Choose your <em>plan</em></h2>
              <div className="toggle" role="group" aria-label="Billing period">
                <button className={!annual?'on':''} onClick={() => setAnnual(false)}>Monthly</button>
                <button className={annual?'on':''} onClick={() => setAnnual(true)}>Annual <span className="save-badge">Save 30%</span></button>
              </div>
            </div>
            <div className="price-grid">
              {plans.map(p => (
                <div key={p.name} className={`pc ${p.popular ? 'pc-forest' : 'pc-paper'}`}>
                  {p.popular && <div className="pc-pop">Most popular</div>}
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-tag">{p.tag}</div>
                  <div className="pc-price">
                    {p.monthly === 0 ? 'Free' : (
                      <>{annual ? <><sup>€</sup>{(p.annual/12).toFixed(2)}<small>/mo</small></> : <><sup>€</sup>{p.monthly.toFixed(2)}<small>/mo</small></>}</>
                    )}
                  </div>
                  {annual && p.monthly > 0 && (
                    <div style={{fontSize:11,marginBottom:16,opacity:0.7,color:p.popular?'var(--mist)':'var(--clay)'}}>Billed as €{p.annual}/yr</div>
                  )}
                  <Link href={p.href} className={`pc-btn ${p.btn}`}>{p.btnLabel}</Link>
                  <ul className="pc-feats">
                    {p.feats.map(f => (
                      <li key={f.label}>
                        {f.inc
                          ? <Icon id="check" size={12} color={p.popular ? 'var(--sage)' : 'var(--moss)'} />
                          : <Icon id="x" size={12} color="rgba(107,79,53,0.25)" />
                        }
                        <span className={`${p.popular ? 'ft-l' : 'ft-d'}${!f.inc ? ' ft-faded' : ''}`}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{textAlign:'center',fontSize:12,color:'var(--clay)',marginTop:16}}>All paid plans include a 14-day free trial · No credit card required · Cancel anytime</p>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="pfaq-heading">
          <div className="container" style={{maxWidth:740}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Pricing questions</span></div>
            <h2 className="section-title" id="pfaq-heading">Everything you need to <em>know</em></h2>
            <div className="faq">
              {faqs.map((f, i) => (
                <details key={i} className="faq-item">
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
            <h2>Start with <em>free today</em></h2>
            <p>No credit card. No commitment. Just the best family activity platform in Ireland.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Create free account <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
