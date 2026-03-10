import type { Metadata } from 'next';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Use — The Hedge',
  description: 'Terms of use for The Hedge family learning platform.',
  alternates: { canonical: 'https://thehedge.ie/terms' },
};

const sections = [
  { title: '1. Acceptance of Terms', body: 'By creating an account or using The Hedge platform (thehedge.ie and associated apps), you agree to these Terms of Use. If you do not agree, please do not use the platform.' },
  { title: '2. Eligibility', body: 'The Hedge is intended for adults (18+). You must be the parent or legal guardian of any children whose profiles you create within the platform. By creating a family profile, you confirm that you are the responsible adult for the children included.' },
  { title: '3. Account Responsibilities', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately at hello@thehedge.ie if you suspect any unauthorised access.' },
  { title: '4. Subscription and Billing', body: 'Paid plans are billed monthly or annually as chosen at sign-up. All plans include a 14-day free trial. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods.' },
  { title: '5. Acceptable Use', body: 'You agree not to use The Hedge to: post or share content that is harmful, offensive, or illegal; attempt to access other users\' accounts; reverse engineer or scrape the platform; use the platform for commercial purposes without our written consent. We reserve the right to suspend accounts that violate these terms.' },
  { title: '6. Content & Intellectual Property', body: 'All activity content, guides, and platform features are owned by The Hedge. You may use them for your personal and family use. Content you create within the platform (activity logs, notes, journal entries) belongs to you and can be exported or deleted at any time.' },
  { title: '7. Disclaimer', body: 'The Hedge provides educational activity suggestions. We are not a medical, therapeutic, or educational institution. Activities are provided for general family use and should be adapted to your children\'s individual needs and safety requirements. Always supervise children during activities.' },
  { title: '8. Limitation of Liability', body: 'To the extent permitted by Irish law, The Hedge is not liable for any indirect or consequential damages arising from use of the platform. Our total liability in any 12-month period is limited to the subscription fees paid by you in that period.' },
  { title: '9. Governing Law', body: 'These terms are governed by the laws of Ireland. Any disputes will be subject to the exclusive jurisdiction of the Irish courts.' },
  { title: '10. Changes to Terms', body: 'We may update these terms from time to time. We will notify you by email at least 14 days before material changes take effect. Continued use of the platform after the effective date constitutes acceptance of the updated terms.' },
];

export default function Terms() {
  return (
    <>
      <Nav />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Legal</span></div>
            <h1>Terms of <em>Use</em></h1>
            <p className="page-hero-desc">Last updated: November 2025. Plain English where possible.</p>
          </div>
        </div>
        <section className="section">
          <div className="container" style={{maxWidth:740}}>
            {sections.map((s, i) => (
              <div key={i} style={{marginBottom:32}}>
                <h2 style={{fontSize:18,fontWeight:700,color:'var(--ink)',marginBottom:10,fontFamily:'var(--font-display)',fontStyle:'italic'}}>{s.title}</h2>
                <p style={{fontSize:14,color:'var(--clay)',lineHeight:1.75}}>{s.body}</p>
              </div>
            ))}
            <div style={{borderTop:'1px solid var(--stone)',paddingTop:24,marginTop:16}}>
              <p style={{fontSize:13,color:'var(--clay)'}}>Questions? Email us at <a href="mailto:hello@thehedge.ie" style={{color:'var(--forest)',fontWeight:600}}>hello@thehedge.ie</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
