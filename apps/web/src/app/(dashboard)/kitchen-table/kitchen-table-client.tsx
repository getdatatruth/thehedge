'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Leaf, Plus, X } from 'lucide-react';
import type { KTChild, KTAnswers, KTFramework } from '@/lib/kitchen-table';

const INTEREST_OPTIONS = [
  'animals', 'nature', 'art', 'building', 'stories', 'numbers',
  'music', 'sports', 'science', 'cooking', 'dinosaurs', 'space',
];

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
  { key: 'not_registered', label: "Not registered / not sure I need to" },
  { key: 'registered', label: 'Registered' },
  { key: 'awaiting', label: 'Awaiting assessment' },
  { key: 'curious', label: 'Just curious about it' },
];

type Exchange = { q: string; a: string };

export function KitchenTableClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [children, setChildren] = useState<KTChild[]>([{ name: '', age: null, interests: [] }]);
  const [answers, setAnswers] = useState<Partial<KTAnswers>>({});
  const [thinking, setThinking] = useState(false);
  const [framework, setFramework] = useState<KTFramework | null>(null);

  const isHomeEdLeaning = ['considering', 'school_not_working', 'homeschool'].includes(answers.whyKey || '');

  // Turn definitions in order. Some are special (children, place); the rest are chip turns.
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <Leaf className="h-8 w-8 text-moss animate-pulse" />
        <p className="font-display text-2xl font-light text-ink mt-5">Let me read that back to you...</p>
        <p className="text-[13px] text-clay mt-2 italic">Gathering what you said into something that feels like your family.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-16">
      {/* Past exchanges, like handwritten notes */}
      <div className="space-y-6 mb-8">
        {exchanges.map((e, i) => (
          <div key={i} className="animate-fade-up">
            <p className="font-display text-lg font-light text-ink/80 italic">{e.q}</p>
            <p className="text-[14px] text-moss mt-1.5 font-medium">{e.a}</p>
          </div>
        ))}
      </div>

      {/* Step 0: soft open */}
      {step === 0 && (
        <Turn>
          <h1 className="font-display text-3xl font-light text-ink leading-tight">Pull up a chair.</h1>
          <p className="text-[15px] text-clay mt-3 leading-relaxed">
            Before The Hedge does anything, I&apos;d love to understand your family a little. Just a few questions, and you can say as much or as little as you like.
          </p>
          <PrimaryButton onClick={() => setStep(1)}>Let&apos;s begin</PrimaryButton>
        </Turn>
      )}

      {/* Step 1: who's at the table */}
      {step === 1 && (
        <Turn>
          <Question>Who are we doing this for?</Question>
          <p className="text-[13px] text-clay mb-4">Their name, their age, and what they&apos;re mad about lately.</p>
          <div className="space-y-4">
            {children.map((c, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone/40 p-4 space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    value={c.name}
                    onChange={(ev) => setChildren((cs) => cs.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}
                    placeholder="Name"
                    className="flex-1 rounded-xl border border-stone/50 px-3 py-2 text-sm focus:outline-none focus:border-moss"
                  />
                  <input
                    value={c.age ?? ''}
                    onChange={(ev) => setChildren((cs) => cs.map((x, j) => j === i ? { ...x, age: ev.target.value ? parseInt(ev.target.value) : null } : x))}
                    placeholder="Age"
                    inputMode="numeric"
                    className="w-16 rounded-xl border border-stone/50 px-3 py-2 text-sm text-center focus:outline-none focus:border-moss"
                  />
                  {children.length > 1 && (
                    <button onClick={() => setChildren((cs) => cs.filter((_, j) => j !== i))} className="text-clay/50 hover:text-terracotta">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((opt) => {
                    const on = c.interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => setChildren((cs) => cs.map((x, j) => j === i ? { ...x, interests: on ? x.interests.filter((t) => t !== opt) : [...x.interests, opt] } : x))}
                        className={`rounded-full px-2.5 py-1 text-[11px] transition-all ${on ? 'bg-moss text-parchment' : 'bg-linen text-clay hover:bg-stone/30'}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setChildren((cs) => [...cs, { name: '', age: null, interests: [] }])} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-moss mt-3">
            <Plus className="h-3.5 w-3.5" /> Add another
          </button>
          <PrimaryButton
            disabled={!children.some((c) => c.name.trim())}
            onClick={() => {
              const named = children.filter((c) => c.name.trim());
              record('Who are we doing this for?', named.map((c) => c.age != null ? `${c.name} (${c.age})` : c.name).join(', '));
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
          onSubmit={(key, text) => {
            setAnswers((a) => ({ ...a, rhythmKey: key, rhythmText: text }));
            record('When does learning happen?', text || RHYTHM_CHIPS.find((c) => c.key === key)?.label || '');
            setStep(6);
          }}
        />
      )}

      {step === 6 && (
        <Turn>
          <Question>Last bit, where are you, and is there outdoor space?</Question>
          <input
            value={answers.county || ''}
            onChange={(ev) => setAnswers((a) => ({ ...a, county: ev.target.value }))}
            placeholder="Your county"
            className="w-full rounded-xl border border-stone/50 px-3 py-2.5 text-sm focus:outline-none focus:border-moss"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {OUTDOOR_CHIPS.map((c) => (
              <button
                key={c.key}
                onClick={() => setAnswers((a) => ({ ...a, outdoor: c.key }))}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition-all ${answers.outdoor === c.key ? 'bg-forest text-parchment' : 'bg-linen text-clay hover:bg-stone/30'}`}
              >
                {c.label}
              </button>
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
    </div>
  );
}

function Turn({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
function Question({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-light text-ink leading-snug mb-3">{children}</h2>;
}
function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 bg-forest text-parchment font-semibold text-sm rounded-2xl px-6 py-3 mt-6 hover:bg-forest/90 transition-colors disabled:opacity-40"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
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
  const canGo = selected !== null || text.trim().length > 0;
  return (
    <Turn>
      <Question>{question}</Question>
      {note && <p className="text-[12px] text-moss/80 italic mb-3">{note}</p>}
      <div className="flex flex-col gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => { setSelected(c.key); setText(''); }}
            className={`text-left rounded-2xl px-4 py-3 text-[14px] transition-all border ${selected === c.key ? 'bg-forest text-parchment border-forest' : 'bg-white text-ink border-stone/40 hover:border-moss/40'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {placeholder && (
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) setSelected(null); }}
          placeholder={placeholder}
          rows={2}
          className="w-full mt-3 rounded-2xl border border-stone/40 px-4 py-3 text-[14px] focus:outline-none focus:border-moss resize-none"
        />
      )}
      <PrimaryButton disabled={!canGo} onClick={() => onSubmit(selected || 'other', text.trim() || undefined)}>
        {submitLabel || 'Continue'}
      </PrimaryButton>
    </Turn>
  );
}

function FrameworkReveal({ framework, onDone }: { framework: KTFramework; onDone: () => void }) {
  return (
    <div className="max-w-xl mx-auto pb-16 animate-fade-up">
      <div className="text-center mb-8">
        <Leaf className="h-7 w-7 text-moss mx-auto" />
        <h1 className="font-display text-3xl font-light text-ink mt-3">Your Family Framework</h1>
        <p className="text-[14px] text-clay mt-2 italic">{framework.opening}</p>
      </div>

      <Section title="What you told me">
        <p className="text-[15px] text-umber leading-relaxed">{framework.whatYouToldMe}</p>
      </Section>

      <Section title="How The Hedge will work for you">
        <ul className="space-y-2.5">
          {framework.commitments.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] text-umber leading-relaxed">
              <Leaf className="h-4 w-4 text-moss shrink-0 mt-1" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The quiet floor">
        <p className="text-[15px] text-umber leading-relaxed">{framework.quietFloor}</p>
      </Section>

      <Section title="For your worry">
        <p className="text-[15px] text-umber leading-relaxed">{framework.forYourWorry}</p>
      </Section>

      <Section title="Three things you can do today">
        <ul className="space-y-2.5">
          {framework.thingsToday.map((t, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] text-umber leading-relaxed">
              <span className="font-display text-moss font-medium">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-center text-[12px] text-clay/70 italic mt-8">This is yours. Tweak anything from Our Hedge whenever you like.</p>
      <div className="text-center">
        <button onClick={onDone} className="inline-flex items-center gap-2 bg-forest text-parchment font-semibold text-sm rounded-2xl px-7 py-3 mt-5 hover:bg-forest/90 transition-colors">
          This is us, into The Hedge <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-sage/8 border border-sage/15 p-5 mb-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80 mb-2.5">{title}</p>
      {children}
    </div>
  );
}
