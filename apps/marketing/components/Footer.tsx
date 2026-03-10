'use client';
import Link from 'next/link';
import { Icon } from './Icons';

export default function Footer() {
  return (
    <footer>
      <div className="ft-inner">
        <div className="ft-nl">
          <div className="ft-nl-title">Stay in the loop</div>
          <div className="ft-nl-body">Activity ideas, seasonal guides & platform updates — delivered to Irish families every fortnight.</div>
          <form className="ft-nl-form" onSubmit={e => e.preventDefault()}>
            <input className="ft-nl-input" type="email" placeholder="your@email.ie" aria-label="Email address" />
            <button type="submit" className="ft-nl-btn">Subscribe</button>
          </form>
        </div>

        <div className="ft-top">
          <div>
            <div className="ft-brand">The Hedge</div>
            <div className="ft-tagline">Inspired by Ireland&apos;s hedge schools.<br/>Learning that belongs to your family.</div>
            <div className="ft-socials">
              {[
                { id: 'ig', label: 'Instagram', href: 'https://instagram.com/thehedge.ie' },
                { id: 'fb', label: 'Facebook', href: 'https://facebook.com/thehedgeireland' },
              ].map(s => (
                <a key={s.id} href={s.href} className="ft-soc" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(143,175,126,0.6)" strokeWidth="1.8" strokeLinecap="round">
                    {s.id === 'ig' ? (
                      <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></>
                    ) : (
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    )}
                  </svg>
                </a>
              ))}
            </div>
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
                ['/faq', 'FAQ'],
                ['mailto:hello@thehedge.ie', 'Contact Us'],
                ['/privacy', 'Privacy Policy'],
                ['/terms', 'Terms of Use'],
              ]},
              { title: 'Ireland', links: [
                ['/homeschool', 'AEARS Compliance'],
                ['/homeschool', 'NCCA Curriculum'],
                ['/blog/irish-seasons', 'Seasonal Guides'],
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
            <Link href="/cookies">Cookies</Link>
            <span style={{color:'rgba(143,175,126,0.25)'}}>|</span>
            <span style={{color:'rgba(143,175,126,0.4)',fontSize:11}}>EU data residency · Frankfurt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
