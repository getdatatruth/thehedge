'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SVGDefs } from './Icons';

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/features', label: 'Features' },
  { href: '/homeschool', label: 'Home education', primary: true },
  { href: '/pricing', label: 'Pricing' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function Nav({ active = '' }: { active?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <SVGDefs />
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <div className="logo-mark" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" />
          </div>
          <div>
            <div className="nav-name">The Hedge</div>
            <div className="nav-domain">THEHEDGE.IE</div>
          </div>
        </Link>

        <ul className="nav-links" role="list">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={active === l.href ? 'active' : ''}
                style={l.primary ? { fontWeight: 700, color: 'var(--moss)' } : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <Link href="https://app.thehedge.ie/signin" className="nav-signin">Sign in</Link>
          <Link href="https://app.thehedge.ie/signup" className="nav-cta">Pull up a chair</Link>
          <button
            className={`nav-hamburger${open ? ' open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`nav-mobile${open ? ' open' : ''}`} aria-hidden={!open}>
        <nav className="nav-mobile-links">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={l.primary ? { fontWeight: 700, color: 'var(--moss)' } : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link href="https://app.thehedge.ie/signup" className="nav-cta" onClick={() => setOpen(false)}>
            Pull up a chair - it&apos;s free
          </Link>
        </nav>
      </div>
    </>
  );
}
