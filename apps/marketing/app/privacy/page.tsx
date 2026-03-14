import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - The Hedge',
  description: 'How The Hedge collects, uses, and protects your data. GDPR compliant, EU data storage, no third-party advertising.',
  alternates: { canonical: 'https://thehedge.ie/privacy' },
};

const sections = [
  { title: 'Who we are', body: 'The Hedge is operated by [Company Name], a company registered in Ireland. Our registered address is [Address], Ireland. Our data controller email is privacy@thehedge.ie.' },
  { title: 'What data we collect', body: 'We collect the information you provide when creating an account (email address, name), information about your family (children\'s ages, interests, your county) to personalise activity suggestions, usage data about how you interact with the platform (activities viewed, completed, rated), and technical data such as browser type and IP address for security and performance purposes. We do not collect special category data about children. Children\'s profiles contain only age and interest tags - no names, photos, or identifying information are required.' },
  { title: 'How we use your data', body: 'Your data is used to: provide and personalise The Hedge service; generate your daily activity recommendations; send you platform updates and (where you have opted in) our fortnightly newsletter; provide customer support; improve the platform through aggregated, anonymised analytics. We do not use your data for advertising. We do not sell your data to third parties.' },
  { title: 'Where your data is stored', body: 'All user data is stored on servers located in Frankfurt, Germany (EU). This means your data is subject to EU law and GDPR protections at all times. We use Supabase (with EU data residency enabled) as our database provider.' },
  { title: 'Your rights under GDPR', body: 'As an EU resident, you have the right to: access a copy of all data we hold about you; correct any inaccurate data; delete your account and all associated data; export your data in a machine-readable format; object to processing of your data; withdraw consent at any time. To exercise any of these rights, email privacy@thehedge.ie. We will respond within 30 days.' },
  { title: 'Cookies', body: 'We use essential cookies to keep you logged in and maintain your preferences. We use analytics cookies (opt-in only) to understand how the platform is used. We do not use advertising cookies. You can manage cookie preferences at any time from your account settings or by emailing privacy@thehedge.ie.' },
  { title: 'Children\'s privacy', body: 'The Hedge accounts are created by adults (parents or guardians). We do not knowingly collect personal information about children. Children\'s profiles within a family account contain only age ranges and interest tags - not names, images, or any identifying information.' },
  { title: 'Changes to this policy', body: 'We may update this privacy policy from time to time. We will notify account holders by email at least 14 days before any material changes take effect. The current version is always available at thehedge.ie/privacy.' },
];

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Legal</span></div>
            <h1>Privacy <em>Policy</em></h1>
            <p className="page-hero-desc">Last updated: November 2025. Your privacy matters to us - this is how we handle your data.</p>
          </div>
        </div>

        <section className="section">
          <div className="container" style={{maxWidth:740}}>
            <div style={{background:'rgba(61,97,66,0.06)',borderRadius:12,padding:'20px 22px',borderLeft:'3px solid var(--moss)',marginBottom:40}}>
              <p style={{fontSize:14,color:'var(--umber)',lineHeight:1.7}}>
                <strong>Short version:</strong> We store your data in the EU (Frankfurt), we never sell it or use it for advertising, and you can delete everything at any time. Full details below.
              </p>
            </div>
            {sections.map((s, i) => (
              <div key={i} style={{marginBottom:36}}>
                <h2 style={{fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:12,fontFamily:'var(--font-display)',fontStyle:'italic'}}>{s.title}</h2>
                <p style={{fontSize:14,color:'var(--clay)',lineHeight:1.75}}>{s.body}</p>
              </div>
            ))}
            <div style={{borderTop:'1px solid var(--stone)',paddingTop:28,marginTop:16}}>
              <p style={{fontSize:13,color:'var(--clay)'}}>Questions about this policy? Email us at <a href="mailto:privacy@thehedge.ie" style={{color:'var(--forest)',fontWeight:600}}>privacy@thehedge.ie</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
