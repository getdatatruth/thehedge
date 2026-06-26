'use client';
import { useState } from 'react';

type Variant = 'light' | 'footer';

interface Props {
  source: string;
  variant?: Variant;
  buttonLabel?: string;
  placeholder?: string;
}

type Status = 'idle' | 'loading' | 'ok' | 'error';

export default function NewsletterSignup({
  source,
  variant = 'footer',
  buttonLabel = 'Subscribe',
  placeholder = 'you@example.com',
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        setStatus('ok');
        setMessage(data.message || "You're on the list. Thanks for joining us.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please try again in a moment.');
    }
  }

  const msgColor =
    variant === 'light'
      ? status === 'ok'
        ? 'var(--sage)'
        : 'rgba(255,180,150,0.95)'
      : status === 'ok'
        ? 'var(--sage)'
        : 'rgba(255,180,150,0.9)';

  return (
    <form
      onSubmit={onSubmit}
      style={
        variant === 'light'
          ? { display: 'flex', gap: 10, flexDirection: 'column', maxWidth: 440, margin: '0 auto' }
          : undefined
      }
      noValidate
    >
      <div className={variant === 'footer' ? 'ft-nl-row' : undefined} style={variant === 'light' ? { display: 'flex', gap: 10, flexWrap: 'wrap' } : { display: 'flex', gap: 8 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="Email address"
          className="ft-nl-input"
          style={variant === 'light' ? { flex: 1, minWidth: 200 } : undefined}
          disabled={status === 'loading' || status === 'ok'}
        />
        <button
          type="submit"
          className="ft-nl-btn"
          style={variant === 'light' ? { width: 'auto' } : undefined}
          disabled={status === 'loading' || status === 'ok'}
        >
          {status === 'loading' ? 'Sending...' : status === 'ok' ? 'Done' : buttonLabel}
        </button>
      </div>
      {message && (
        <p role="status" style={{ fontSize: 12, marginTop: 10, color: msgColor, lineHeight: 1.5 }}>
          {message}
        </p>
      )}
    </form>
  );
}
