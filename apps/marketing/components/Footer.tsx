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
              { title: 'Product', links: [
                ['/', 'Home'],
                ['/how-it-works', 'How it works'],
                ['/features', 'Features'],
                ['/homeschool', 'For Homeschoolers'],
                ['/pricing', 'Pricing'],
              ]},
              { title: 'Community', links: [
                ['/community', 'Family Groups'],
                ['/blog', 'Blog & Guides'],
                ['/about', 'Our Story'],
                ['https://app.thehedge.ie/signup', 'Join for free'],
              ]},
              { title: 'Support', links: [
                ['mailto:hello@thehedge.ie', 'Contact Us'],
                ['/privacy', 'Privacy Policy'],
                ['/terms', 'Terms of Use'],
              ]},
              { title: 'Ireland', links: [
                ['/homeschool', 'AEARS Support'],
                ['/homeschool', 'NCCA Curriculum'],
                ['/blog', 'Seasonal Guides'],
                ['/community', 'County Groups'],
              ]},
            ].map(col => (
              <div className="ft-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map(([href, label]) => (
                    <li key={href}><Link href={href}>{label}</Link></li>
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
