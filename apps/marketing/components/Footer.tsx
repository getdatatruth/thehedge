'use client';
import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  return (
    <footer>
      <div className="ft-inner">
        <div className="ft-nl">
          <div className="ft-nl-title">Stay in the loop</div>
          <div className="ft-nl-body">Activity ideas, seasonal guides & platform updates for Irish families. No spam, ever.</div>
          <NewsletterSignup source="footer" variant="footer" buttonLabel="Subscribe" />
        </div>

        <div className="ft-top">
          <div>
            <div className="ft-brand">The Hedge</div>
            <div className="ft-tagline">Inspired by Ireland&apos;s hedge schools.<br/>Learning that belongs to your family.</div>
          </div>

          <div className="ft-cols">
            {[
              { title: 'The product', links: [
                ['/how-it-works', 'How it works'],
                ['/features', 'The Kitchen Table'],
                ['/features', 'Today, Plan & Keep'],
                ['/features', 'Ask, your calm companion'],
                ['/pricing', 'Pricing'],
              ]},
              { title: 'Home education', links: [
                ['/homeschool', 'Home education families'],
                ['/homeschool', 'AEARS evidence, kept for you'],
                ['/homeschool', 'NCCA strands at home'],
                ['/blog', 'Guides & seasonal notes'],
              ]},
              { title: 'Belong', links: [
                ['/community', 'Family groups'],
                ['/community', 'County groups'],
                ['/about', 'Our story'],
                ['https://app.thehedge.ie/signup', 'Pull up a chair'],
              ]},
              { title: 'Support', links: [
                ['mailto:hello@thehedge.ie', 'Contact us'],
                ['/privacy', 'Privacy policy'],
                ['/terms', 'Terms of use'],
              ]},
            ].map(col => (
              <div className="ft-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map(([href, label], i) => (
                    <li key={`${href}-${i}`}><Link href={href}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ft-bot">
          <p className="ft-bot-p">© {new Date().getFullYear()} The Hedge. Made with care in West Cork, Ireland.</p>
          <div className="ft-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span style={{color:'rgba(143,175,126,0.25)'}}>|</span>
            <span style={{color:'rgba(143,175,126,0.4)',fontSize:11}}>EU data residency · Frankfurt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
