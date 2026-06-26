'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icons';
import KitchenTableDemo from './KitchenTableDemo';

// The Kitchen Table demo, moved off the hero and behind a CTA so it does not
// dominate the real estate. The button opens it in a calm modal, portalled to
// document.body so the fixed overlay escapes the hero's animated transform.
export default function HeroDemo() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const modal = open ? (
    <div
      className="kt-modal-overlay"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="The Kitchen Table"
    >
      <div className="kt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="kt-modal-close" aria-label="Close" onClick={() => setOpen(false)}>
          <span aria-hidden>&times;</span>
        </button>
        <KitchenTableDemo />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Pull up a chair <Icon id="arrow-r" size={16} color="currentColor" />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
