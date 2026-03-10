'use client';
import { useState } from 'react';
import { Icon } from './Icons';

export default function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq" itemScope itemType="https://schema.org/FAQPage">
      {items.map((f, i) => (
        <div key={i} className={`faq-item${open === i ? ' open' : ''}`} itemScope itemType="https://schema.org/Question">
          <div
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-expanded={open === i}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(open === i ? null : i); }}
          >
            <span className="faq-q-text" itemProp="name">{f.q}</span>
            <div className="faq-icon"><Icon id="plus" size={12} color="currentColor" /></div>
          </div>
          <div className="faq-a" itemScope itemType="https://schema.org/Answer">
            <div className="faq-a-inner" itemProp="text">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
