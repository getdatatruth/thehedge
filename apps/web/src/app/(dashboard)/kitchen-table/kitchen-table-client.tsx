'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Leaf, Plus, X, Mic } from 'lucide-react';
import type { KTChild, KTAnswers, KTFramework } from '@/lib/kitchen-table';

const INTEREST_OPTIONS = [
  'animals', 'nature', 'art', 'building', 'stories', 'numbers',
  'music', 'sports', 'science', 'cooking', 'dinosaurs', 'space',
];
const AGES = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

const WHY_CHIPS = [
  { key: 'do_more', label: 'I just want to do more with them' },
  { key: 'considering', label: "We're wondering about home-ed" },
  { key: 'school_not_working', label: "School isn't quite working for us" },
  { key: 'homeschool', label: 'We already home-educate' },
];
const WORRY_CHIPS = [
  { key: 'enough', label: 'Am I doing enough?' },
  { key: 'social', label: 'Will they miss out socially?' },
  { key: 'not_teacher', label: "I'm not a teacher" },
  { key: 'tusla', label: 'The Tusla / legal side' },
  { key: 'none', label: 'No real worry, just want good days' },
];
const APPROACH_CHIPS = [
  { key: 'structured', label: 'A plan we follow, a bit of structure' },
  { key: 'blended', label: 'A loose rhythm, some structure some freedom' },
  { key: 'child_led', label: "Following whatever they're obsessed with" },
  { key: 'nature', label: 'Out in nature, led by the seasons' },
  { key: 'no_school', label: "We don't really 'do school'" },
];
const RHYTHM_CHIPS = [
  { key: 'after_school', label: 'After school and weekends' },
  { key: 'mornings', label: 'Mostly mornings' },
  { key: 'all_day', label: "All day, it's just life" },
  { key: 'grab_it', label: 'Whenever we can grab it' },
];
const OUTDOOR_CHIPS = [
  { key: 'garden', label: 'A garden' },
  { key: 'nearby', label: 'Green space nearby' },
  { key: 'none', label: 'Not really' },
];
const TUSLA_CHIPS = [
  { key: 'not_registered', label: 'Not registered / not sure I need to' },
  { key: 'registered', label: 'Registered' },
  { key: 'awaiting', label: 'Awaiting assessment' },
  { key: 'curious', label: 'Just curious about it' },
];

type Exchange = { q: string; a: string };

export function KitchenTableClient({ initialStep = 0 }: { initialStep?: number } = {}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [children, setChildren] = useState<KTChild[]>([{ name: '', age: null, interests: [] }]);
  const [answers, setAnswers] = useState<Partial<KTAnswers>>({});
  const [thinking, setThinking] = useState(false);
  const [framework, setFramework] = useState<KTFramework | null>(null);

  const isHomeEdLeaning = ['considering', 'school_not_working', 'homeschool'].includes(answers.whyKey || '');
  const totalQuestions = isHomeEdLeaning ? 7 : 6;

  const record = (q: string, a: string) => setExchanges((e) => [...e, { q, a }]);

  async function finish(final: Partial<KTAnswers>) {
    setThinking(true);
    const full: KTAnswers = {
      children: children.filter((c) => c.name.trim()),
      whyKey: final.whyKey || answers.whyKey || 'do_more',
      whyText: final.whyText ?? answers.whyText,
      worryKey: final.worryKey || answers.worryKey || 'enough',
      worryText: final.worryText ?? answers.worryText,
      approachKey: final.approachKey || answers.approachKey || 'blended',
      approachText: final.approachText ?? answers.approachText,
      rhythmKey: final.rhythmKey || answers.rhythmKey,
      county: final.county ?? answers.county,
      outdoor: final.outdoor || answers.outdoor,
      tuslaKey: final.tuslaKey || answers.tuslaKey,
    };
    try {
      const res = await fetch('/api/kitchen-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { ...full, transcript: exchanges } }),
      });
      const json = await res.json();
      setFramework(json.framework as KTFramework);
    } catch {
      // leave thinking; minimal error state
    }
    setThinking(false);
  }

  if (framework) {
    return <FrameworkReveal framework={framework} onDone={() => router.push('/dashboard')} />;
  }

  if (thinking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss/12">
          <Leaf className="h-7 w-7 text-moss animate-pulse" />
        </span>
        <p className="font-display text-2xl font-light text-ink mt-5">Let me read that back to you...</p>
        <p className="text-sm text-clay mt-2 italic">Gathering what you said into something that feels like your family.</p>
      </div>
    );
  }

  return (
    <Shell exchanges={exchanges} answered={exchanges.length} total={totalQuestions}>
      {step === 0 && (
        <Turn>
          <Speaker />
          <Question>Pull up a chair.</Question>
          <p className="mt-3 text-[15px] leading-relaxed text-clay">
            Before The Hedge does anything, I&apos;d love to understand your family a little.
            A few gentle questions, and you can say as much or as little as you like.
          </p>
          <PrimaryButton onClick={() => setStep(1)}>Let&apos;s begin</PrimaryButton>
        </Turn>
      )}

      {step === 1 && (
        <Turn>
          <Speaker />
          <Question>Who&apos;s at the table?</Question>
          <p className="mt-2 mb-5 text-[14px] text-clay">Add each child, their age, and what they&apos;re mad about lately.</p>
          <div className="space-y-4">
            {children.map((c, i) => (
              <ChildCard
                key={i}
                child={c}
                canRemove={children.length > 1}
                onChange={(patch) => setChildren((cs) => cs.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                onRemove={() => setChildren((cs) => cs.filter((_, j) => j !== i))}
              />
            ))}
          </div>
          <button
            onClick={() => setChildren((cs) => [...cs, { name: '', age: null, interests: [] }])}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone py-3 text-[13px] font-medium text-moss transition-colors hover:border-moss/50 hover:bg-moss/5"
          >
            <Plus className="h-4 w-4" /> Add another child
          </button>
          <PrimaryButton
            disabled={!children.some((c) => c.name.trim())}
            onClick={() => {
              const named = children.filter((c) => c.name.trim());
              record('Who are we doing this for?', named.map((c) => (c.age != null ? `${c.name} (${c.age})` : c.name)).join(', '));
              setStep(2);
            }}
          >
            That&apos;s our crew
          </PrimaryButton>
        </Turn>
      )}

      {step === 2 && (
        <ChipTurn
          question="What made you go looking for something like this?"
          chips={WHY_CHIPS}
          placeholder="or say it your own way..."
          onSubmit={(key, text) => {
            setAnswers((a) => ({ ...a, whyKey: key, whyText: text }));
            record('What made you go looking for something like this?', text || WHY_CHIPS.find((c) => c.key === key)?.label || '');
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <ChipTurn
          question="And honestly, what's the worry in the back of your mind?"
          chips={WORRY_CHIPS}
          placeholder="or in your own words..."
          onSubmit={(key, text) => {
            setAnswers((a) => ({ ...a, worryKey: key, worryText: text }));
            record("What's the worry in the back of your mind?", text || WORRY_CHIPS.find((c) => c.key === key)?.label || '');
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <ChipTurn
          question="When you picture a good day's learning, what does it look like?"
          chips={APPROACH_CHIPS}
          placeholder="describe a good day..."
          onSubmit={(key, text) => {
            setAnswers((a) => ({ ...a, approachKey: key, approachText: text }));
            record("A good day's learning looks like...", text || APPROACH_CHIPS.find((c) => c.key === key)?.label || '');
            setStep(5);
          }}
        />
      )}

      {step === 5 && (
        <ChipTurn
          question="When does learning usually happen for you?"
          chips={RHYTHM_CHIPS}
          placeholder="or describe your week..."
          onSubmit={(key, text) => {
            setAnswers((a) => ({ ...a, rhythmKey: key, rhythmText: text }));
            record('When does learning happen?', text || RHYTHM_CHIPS.find((c) => c.key === key)?.label || '');
            setStep(6);
          }}
        />
      )}

      {step === 6 && (
        <Turn>
          <Speaker />
          <Question>Last bit, where are you?</Question>
          <p className="mt-2 mb-4 text-[14px] text-clay">Your county shapes the weather and what&apos;s on near you. And is there outdoor space?</p>
          <input
            value={answers.county || ''}
            onChange={(ev) => setAnswers((a) => ({ ...a, county: ev.target.value }))}
            placeholder="Your county"
            className="w-full rounded-2xl border border-stone bg-white px-4 py-3.5 text-base shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/15"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {OUTDOOR_CHIPS.map((c) => (
              <Chip key={c.key} on={answers.outdoor === c.key} onClick={() => setAnswers((a) => ({ ...a, outdoor: c.key }))}>
                {c.label}
              </Chip>
            ))}
          </div>
          <PrimaryButton
            onClick={() => {
              record('Where are you?', `${answers.county || 'Ireland'}${answers.outdoor ? `, ${OUTDOOR_CHIPS.find((c) => c.key === answers.outdoor)?.label.toLowerCase()}` : ''}`);
              if (isHomeEdLeaning) setStep(7);
              else finish({});
            }}
          >
            {isHomeEdLeaning ? 'Nearly there' : 'Read me my framework'}
          </PrimaryButton>
        </Turn>
      )}

      {step === 7 && (
        <ChipTurn
          question="And where are you with Tusla, if at all?"
          note="AEARS sets no minimum hours and no attendance bar, and I'll never pretend it does."
          chips={TUSLA_CHIPS}
          onSubmit={(key) => {
            record('Where are you with Tusla?', TUSLA_CHIPS.find((c) => c.key === key)?.label || '');
            finish({ tuslaKey: key });
          }}
          submitLabel="Read me my framework"
        />
      )}
    </Shell>
  );
}

// ── Layout shell: a living "what I've heard" rail beside the current question ──
function Shell({ children, exchanges, answered, total }: {
  children: React.ReactNode;
  exchanges: Exchange[];
  answered: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((answered / total) * 100));
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        {/* Rail */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-3xl border border-stone/60 bg-white/60 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">The Kitchen Table</span>
              <span className="text-[11px] font-semibold text-clay">{Math.min(answered, total)} / {total}</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-stone/40">
              <div className="h-full rounded-full bg-moss transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-5 hidden lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-clay/70">What I&apos;ve heard</p>
              {exchanges.length === 0 ? (
                <p className="mt-3 text-[13.5px] leading-relaxed text-clay/80 italic">
                  Tell me about your family and I&apos;ll start writing it down here.
                </p>
              ) : (
                <ul className="mt-3 space-y-3.5">
                  {exchanges.map((e, i) => (
                    <li key={i} className="flex gap-2.5 animate-fade-up">
                      <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
                      <div className="min-w-0">
                        <div className="text-[10.5px] uppercase tracking-wide text-clay/60">{e.q}</div>
                        <div className="text-[13.5px] font-medium leading-snug text-ink">{e.a}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Current step */}
        <div className="min-w-0">
          <div className="rounded-3xl border border-stone/50 bg-white p-6 shadow-[0_18px_50px_rgba(28,53,32,0.07)] sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Speaker() {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/15">
        <Leaf className="h-3.5 w-3.5 text-moss" />
      </span>
      <span className="text-[12px] font-semibold text-moss">The Hedge</span>
    </div>
  );
}

function Turn({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}

function Question({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[26px] font-light leading-snug text-ink sm:text-[30px]">{children}</h2>;
}

function Chip({ children, on, onClick }: { children: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
        on ? 'bg-forest text-parchment shadow-sm' : 'bg-linen text-clay hover:bg-stone/40'
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-3.5 text-sm font-semibold text-parchment transition-all hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

// ── A warm, clearly-labelled child card with tappable age + interests ──
function ChildCard({ child, canRemove, onChange, onRemove }: {
  child: KTChild;
  canRemove: boolean;
  onChange: (patch: Partial<KTChild>) => void;
  onRemove: () => void;
}) {
  const initial = child.name.trim() ? child.name.trim()[0].toUpperCase() : null;
  return (
    <div className="rounded-3xl border border-stone/50 bg-linen/40 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss/15 font-display text-lg font-medium text-moss">
          {initial || <Leaf className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wide text-clay/70">Name</label>
          <input
            value={child.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Their name"
            className="w-full bg-transparent text-lg font-medium text-ink placeholder:font-normal placeholder:text-clay/50 focus:outline-none"
          />
        </div>
        {canRemove && (
          <button onClick={onRemove} aria-label="Remove child" className="text-clay/40 transition-colors hover:text-terracotta">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <label className="text-[10.5px] font-bold uppercase tracking-wide text-clay/70">Age</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {AGES.map((n) => {
            const on = child.age === n;
            return (
              <button
                key={n}
                onClick={() => onChange({ age: on ? null : n })}
                className={`h-9 w-9 rounded-xl text-[13px] font-semibold transition-all ${
                  on ? 'bg-forest text-parchment shadow-sm' : 'bg-white text-clay hover:bg-stone/30'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[10.5px] font-bold uppercase tracking-wide text-clay/70">Mad about lately</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {INTEREST_OPTIONS.map((opt) => {
            const on = child.interests.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onChange({ interests: on ? child.interests.filter((t) => t !== opt) : [...child.interests, opt] })}
                className={`rounded-full px-3 py-1.5 text-[12px] transition-all ${
                  on ? 'bg-moss text-parchment' : 'bg-white text-clay hover:bg-stone/30'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
}

// Lightweight in-browser speech-to-text so a parent can just talk their answer.
function useSpeech(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const supported = typeof window !== 'undefined' &&
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

  function toggle() {
    if (!supported) return;
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-IE';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      onText(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }
  return { supported, listening, toggle };
}

function ChipTurn({ question, chips, placeholder, note, onSubmit, submitLabel }: {
  question: string;
  chips: { key: string; label: string }[];
  placeholder?: string;
  note?: string;
  onSubmit: (key: string, text?: string) => void;
  submitLabel?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const speech = useSpeech((t) => { setText(t); setSelected(null); });
  const canGo = selected !== null || text.trim().length > 0;
  return (
    <Turn>
      <Speaker />
      <Question>{question}</Question>
      {note && <p className="mt-2 text-[12.5px] italic text-moss/80">{note}</p>}
      <div className="mt-5 flex flex-col gap-2.5">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => { setSelected(c.key); setText(''); }}
            className={`rounded-2xl border px-4 py-3.5 text-left text-[14.5px] transition-all ${
              selected === c.key
                ? 'border-forest bg-forest text-parchment shadow-sm'
                : 'border-stone/50 bg-white text-ink hover:border-moss/50 hover:bg-moss/[0.03]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {placeholder && (
        <div className="relative mt-3">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); if (e.target.value) setSelected(null); }}
            placeholder={speech.listening ? 'Listening, just talk away...' : placeholder}
            rows={2}
            className="w-full resize-none rounded-2xl border border-stone/50 bg-white px-4 py-3 pr-14 text-base shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/15"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={speech.toggle}
              aria-label={speech.listening ? 'Stop recording' : 'Speak your answer'}
              className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                speech.listening ? 'animate-pulse bg-terracotta text-white' : 'bg-moss/10 text-moss hover:bg-moss/20'
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {placeholder && speech.supported && !speech.listening && (
        <p className="mt-2 text-[12px] text-clay/70">Prefer to talk? Tap the mic and just say it.</p>
      )}
      <PrimaryButton disabled={!canGo} onClick={() => onSubmit(selected || 'other', text.trim() || undefined)}>
        {submitLabel || 'Continue'}
      </PrimaryButton>
    </Turn>
  );
}

function FrameworkReveal({ framework, onDone }: { framework: KTFramework; onDone: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 animate-fade-up">
      {/* Header band - the keepsake cover */}
      <div className="relative overflow-hidden rounded-t-[28px] bg-forest px-6 pb-9 pt-8 text-center sm:px-10 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_10%,rgba(94,139,82,0.45),transparent),radial-gradient(ellipse_70%_70%_at_20%_100%,rgba(61,97,66,0.5),transparent)]" />
        <div className="relative">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-parchment/15">
            <Leaf className="h-6 w-6 text-parchment" />
          </span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-sage">Your Family Framework</p>
          <h1 className="mt-1 font-display text-[30px] font-light leading-tight text-parchment sm:text-4xl">Written for your family</h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-parchment/75">{framework.opening}</p>
        </div>
      </div>

      {/* Document body */}
      <div className="rounded-b-[28px] border border-t-0 border-stone/50 bg-white px-6 py-8 shadow-[0_24px_60px_rgba(28,53,32,0.10)] sm:px-10 sm:py-10">
        <Block label="What you told me">
          <p className="border-l-2 border-moss/40 pl-4 text-[16.5px] leading-[1.75] text-ink">{framework.whatYouToldMe}</p>
        </Block>

        <Divider />

        <Block label="How The Hedge will work for you">
          <ul className="space-y-3.5">
            {framework.commitments.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss/12">
                  <Leaf className="h-3.5 w-3.5 text-moss" />
                </span>
                <span className="text-[15.5px] leading-[1.7] text-ink">{c}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Divider />

        <div className="grid gap-6 sm:grid-cols-2">
          <Block label="The quiet floor">
            <p className="text-[15px] leading-[1.7] text-umber">{framework.quietFloor}</p>
          </Block>
          <Block label="For your worry">
            <p className="text-[15px] leading-[1.7] text-umber">{framework.forYourWorry}</p>
          </Block>
        </div>

        <Divider />

        <Block label="Three things you can do today">
          <div className="grid gap-3 sm:grid-cols-3">
            {framework.thingsToday.map((t, i) => (
              <div key={i} className="rounded-2xl border border-stone/40 bg-linen/50 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-display text-[13px] font-semibold text-parchment">{i + 1}</span>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink">{t}</p>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <div className="mt-7 text-center">
        <button onClick={onDone} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-7 py-4 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90 sm:w-auto">
          This is us, into The Hedge <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-[12px] italic text-clay/70">This is yours. Tweak anything from Our Hedge whenever you like.</p>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-moss">{label}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-7 h-px bg-stone/50" />;
}
