import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Pricing — Free, Family €6.99/mo, Educator €14.99/mo',
  description: 'Simple, fair pricing for Irish families. Free plan available. Family plan from €6.99/month. Educator plan with homeschool tools from €14.99/month. No contracts.',
  alternates: { canonical: 'https://thehedge.ie/pricing' },
};

const plans = [
  {
    name: 'Free',
    tag: 'Just get started',
    monthly: '€0',
    annual: '€0',
    sub: 'forever',
    btn: 'pcb-outline',
    btnTxt: 'Get started free',
    btnHref: 'https://app.thehedge.ie/signup',
    dark: false,
    feats: [
      { t:'1–2 activity ideas per day', on:true },
      { t:'Curated activity library (limited)', on:true },
      { t:'5 AI-personalised suggestions per week', on:true },
      { t:'Basic weekly view', on:true },
      { t:'iOS & Android app', on:false },
      { t:'Weather integration', on:false },
      { t:'Unlimited AI personalisation', on:false },
      { t:'Full 1,200+ activity library', on:false },
      { t:'Weekly planner', on:false },
      { t:'Activity timeline', on:false },
      { t:'NCCA curriculum mapping', on:false },
      { t:'AEARS learning logs', on:false },
    ],
  },
  {
    name: 'Family',
    tag: 'For families who want more',
    monthly: '€6.99',
    annual: '€59.99',
    sub: '/month',
    btn: 'pcb-terra',
    btnTxt: '14-day free trial',
    btnHref: 'https://app.thehedge.ie/signup?plan=family',
    dark: false,
    pop: 'Most popular',
    feats: [
      { t:'Unlimited personalised ideas daily', on:true },
      { t:'Full 1,200+ activity library', on:true },
      { t:'Live weather integration', on:true },
      { t:'Weekly planner & calendar', on:true },
      { t:'Activity timeline & logging', on:true },
      { t:'iOS & Android app', on:true },
      { t:'Share with partner / co-parent', on:true },
      { t:'NCCA curriculum mapping', on:false },
      { t:'AEARS learning logs', on:false },
      { t:'PDF report export', on:false },
      { t:'IEP support tools', on:false },
    ],
  },
  {
    name: 'Educator',
    tag: 'Built for homeschoolers',
    monthly: '€14.99',
    annual: '€134.99',
    sub: '/month',
    btn: 'pcb-sage',
    btnTxt: '14-day free trial',
    btnHref: 'https://app.thehedge.ie/signup?plan=educator',
    dark: true,
    feats: [
      { t:'Everything in Family', on:true },
      { t:'NCCA curriculum mapping (all strands)', on:true },
      { t:'AEARS-compliant learning logs', on:true },
      { t:'Auto-generated PDF reports', on:true },
      { t:'IEP support tools', on:true },
      { t:'Priority support', on:true },
      { t:'Bulk activity scheduling', on:true },
      { t:'Multiple child management', on:true },
      { t:'Learning outcome tagging', on:true },
      { t:'Export to assessor format', on:true },
      { t:'Community educator forums', on:true },
    ],
  },
];

const faqs = [
  { q:"Is there really a free plan?", a:"Yes, genuinely free — not a trial. Our free plan gives you 1–2 activity ideas per day from a curated library, and 5 AI-personalised suggestions per week. No credit card required to sign up." },
  { q:"What's included in the free trial?", a:"The 14-day free trial on paid plans gives you full access to every feature on your chosen plan — no restrictions. At the end of 14 days, you can continue by adding a payment method, or drop back to the free plan automatically." },
  { q:"Can I switch plans?", a:"Yes, any time. You can upgrade, downgrade, or cancel from your account settings. If you downgrade mid-cycle, you keep the current plan until the end of the billing period." },
  { q:"Do you offer annual billing?", a:"Yes — pay annually and get roughly 2 months free on both paid plans. Annual pricing: Family €59.99/year (saves €23.89), Educator €134.99/year (saves €44.89)." },
  { q:"What payment methods do you accept?", a:"We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. All transactions are processed securely. We do not store card details." },
  { q:"Is there a family or group discount?", a:"We're working on group pricing for homeschool co-ops and parent groups. Get in touch at hello@thehedge.ie if you're enquiring for a group." },
];

export default function Pricing() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'The Hedge Family Plan',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Free', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', price: '6.99', priceCurrency: 'EUR', name: 'Family', billingPeriod: 'P1M', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', price: '14.99', priceCurrency: 'EUR', name: 'Educator', billingPeriod: 'P1M', availability: 'https://schema.org/InStock' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav active="/pricing" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Simple, fair pricing</span></div>
            <h1>Plans for every <em>Irish family</em></h1>
            <p className="page-hero-desc">Start free. Upgrade when you&apos;re ready. No contracts, no hidden fees, no surprises. Cancel any time from your account settings.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="plans-title">
          <div className="container">
            <div style={{textAlign:'center',marginBottom:36}}>
              <div style={{display:'inline-flex',flexDirection:'column',gap:4,alignItems:'center'}}>
                <div style={{fontSize:13,color:'var(--clay)',marginBottom:8}}>Annual billing saves up to <strong style={{color:'var(--terracotta)'}}>2 months free</strong></div>
                <div className="toggle">
                  <button className="on" id="monthly-btn">Monthly</button>
                  <button id="annual-btn">Annual <span className="save-badge">Save 28%</span></button>
                </div>
              </div>
            </div>

            <div className="price-grid">
              {plans.map(p => (
                <div key={p.name} className={`pc ${p.dark ? 'pc-forest' : 'pc-paper'}`}>
                  {p.pop && <div className="pc-pop">{p.pop}</div>}
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-tag">{p.tag}</div>
                  <div className="pc-price" id={`price-${p.name.toLowerCase()}`} data-monthly={p.monthly} data-annual={p.annual} data-sub={p.sub}>
                    {p.monthly}<small>{p.sub}</small>
                  </div>
                  <a href={p.btnHref} className={`pc-btn ${p.btn}`}>{p.btnTxt}</a>
                  <ul className="pc-feats">
                    {p.feats.map(f => (
                      <li key={f.t} className={`${p.dark ? 'ft-l' : 'ft-d'} ${!f.on ? 'ft-faded' : ''}`}>
                        <Icon id={f.on ? 'check' : 'x'} size={13} color={f.on ? (p.dark ? 'var(--sage)' : 'var(--moss)') : 'var(--stone)'} style={{flexShrink:0,marginTop:2}} />
                        {f.t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="section section-linen" aria-labelledby="guarantee-title">
          <div className="container" style={{maxWidth:700,textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(61,97,66,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <Icon id="shield" size={24} color="var(--moss)" />
            </div>
            <h2 className="section-title" id="guarantee-title" style={{textAlign:'center'}}>14-day <em>money-back guarantee</em></h2>
            <p className="section-body" style={{textAlign:'center'}}>If The Hedge isn&apos;t right for your family in the first 14 days, we&apos;ll refund you in full. No awkward questions. Just email hello@thehedge.ie and we&apos;ll sort it within 24 hours.</p>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="section" aria-labelledby="compare-title">
          <div className="container">
            <h2 className="section-title" id="compare-title" style={{marginBottom:32}}>Full feature <em>comparison</em></h2>
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:520}} role="table">
                <thead>
                  <tr>
                    <th style={{textAlign:'left',padding:'12px 16px',fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--clay)',borderBottom:'2px solid var(--stone)',width:'50%'}}>Feature</th>
                    {['Free','Family','Educator'].map(p => (
                      <th key={p} style={{textAlign:'center',padding:'12px 8px',fontSize:13,fontWeight:700,color:p==='Educator'?'var(--forest)':p==='Family'?'var(--terracotta)':'var(--clay)',borderBottom:'2px solid var(--stone)'}}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Daily activity ideas', '1–2', 'Unlimited', 'Unlimited'],
                    ['Activity library', 'Limited', '1,200+', '1,200+'],
                    ['AI personalisation', '5/week', '✓', '✓'],
                    ['Weather integration', '–', '✓', '✓'],
                    ['Weekly planner', '–', '✓', '✓'],
                    ['Activity timeline', '–', '✓', '✓'],
                    ['iOS & Android app', '–', '✓', '✓'],
                    ['NCCA curriculum mapping', '–', '–', '✓'],
                    ['AEARS learning logs', '–', '–', '✓'],
                    ['PDF report export', '–', '–', '✓'],
                    ['IEP support tools', '–', '–', '✓'],
                    ['Priority support', '–', '–', '✓'],
                  ].map(([feat,...vals], i) => (
                    <tr key={feat} style={{background:i%2===0?'transparent':'rgba(107,79,53,0.03)'}}>
                      <td style={{padding:'11px 16px',fontSize:14,color:'var(--umber)',borderBottom:'1px solid rgba(107,79,53,0.06)'}}>{feat}</td>
                      {vals.map((v,vi) => (
                        <td key={vi} style={{textAlign:'center',padding:'11px 8px',fontSize:13,color:v==='–'?'var(--stone)':v==='✓'?'var(--moss)':'var(--umber)',fontWeight:v==='✓'?700:400,borderBottom:'1px solid rgba(107,79,53,0.06)'}}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-linen" aria-labelledby="pricing-faq-title">
          <div className="container" style={{maxWidth:760}}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Pricing questions</span></div>
            <h2 className="section-title" id="pricing-faq-title">Frequently <em>asked</em></h2>
            <FAQ items={faqs} />
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Start free,<br /><em>upgrade when you&apos;re ready.</em></h2>
            <p>No credit card. No commitment. Your first activity brief lands tomorrow morning.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Get started free <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var monthlyBtn = document.getElementById('monthly-btn');
          var annualBtn = document.getElementById('annual-btn');
          var prices = document.querySelectorAll('.pc-price[data-monthly]');

          function setInterval(interval) {
            prices.forEach(function(el) {
              var m = el.getAttribute('data-monthly');
              var a = el.getAttribute('data-annual');
              var sub = el.getAttribute('data-sub');
              if (m === '€0') return;
              if (interval === 'annual') {
                el.innerHTML = a + '<small>/year</small>';
              } else {
                el.innerHTML = m + '<small>' + sub + '</small>';
              }
            });
            if (interval === 'annual') {
              monthlyBtn.classList.remove('on');
              annualBtn.classList.add('on');
            } else {
              annualBtn.classList.remove('on');
              monthlyBtn.classList.add('on');
            }
          }

          monthlyBtn.addEventListener('click', function() { setInterval('monthly'); });
          annualBtn.addEventListener('click', function() { setInterval('annual'); });
        })();
      `}} />
    </>
  );
}
