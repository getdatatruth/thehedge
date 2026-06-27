'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, X, Mic, Feather, GraduationCap } from 'lucide-react';

interface SparkChild { id: string; name: string }
interface QuietFloor {
  areas: { category: string; label: string; hint: string }[];
  message: string;
}

const loadingLines = (name: string) => [
  `Listening to what ${name} is curious about`,
  `Shaping a hands-on, screen-free activity for ${name}`,
  `Aligning it to Aistear and the primary curriculum`,
  `Writing a little parent guide to follow along`,
  `Tying it to real outcomes for ${name}'s portfolio`,
  `Almost there, putting it all together`,
];

export function SparkLauncher({ children, quietFloor }: { children: SparkChild[]; quietFloor: QuietFloor | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState<string | null>(children[0]?.id ?? null);
  const [prompt, setPrompt] = useState('');
  const [lean, setLean] = useState<{ category: string; label: string; hint: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const child = children.find((c) => c.id === childId) ?? children[0];

  function launch(withLean?: { category: string; label: string; hint: string }) {
    setLean(withLean ?? null);
    setPrompt(withLean ? withLean.hint : '');
    setError(null);
    setOpen(true);
  }

  async function follow() {
    if (!childId || prompt.trim().length < 3 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/v1/spark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ childId, prompt: prompt.trim(), lean: lean?.category }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.slug) {
        throw new Error(json?.error?.message || 'I could not shape that one just now. Have another go in a moment.');
      }
      router.push(`/activity/${json.data.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went sideways. Have another go in a moment.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero "Follow a spark" card */}
      <button
        onClick={() => launch()}
        className="card-forest group relative w-full overflow-hidden p-6 text-left transition-transform hover:-translate-y-0.5 sm:p-7"
      >
        <Sparkles className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 text-moss/10" strokeWidth={1} />
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-moss">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-moss">Follow a spark</p>
        <h3 className="mb-1.5 font-display text-xl font-semibold text-parchment">What are they curious about today?</h3>
        <p className="mb-4 max-w-md text-[13.5px] leading-relaxed text-parchment/70">
          Tell me in your own words and I&apos;ll shape one lovely activity around it, tied quietly to the curriculum.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-forest">
          Shape an activity <ArrowRight className="h-4 w-4" />
        </span>
      </button>

      {/* Quiet Floor nudge */}
      {quietFloor && (
        <div className="card-elevated p-5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Feather className="h-4 w-4 text-moss" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss">A gentle nudge</p>
          </div>
          <p className="text-[14px] leading-relaxed text-clay">{quietFloor.message}</p>
          <button
            onClick={() => launch(quietFloor.areas[0])}
            className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-moss hover:text-forest"
          >
            Shape a spark that leans that way <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={() => !loading && setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-t-3xl bg-parchment p-6 shadow-2xl sm:rounded-3xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <SparkLoading name={child?.name ?? 'them'} />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-moss" />
                    <h2 className="font-display text-xl font-semibold text-ink">Follow a spark</h2>
                  </div>
                  <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-clay hover:bg-stone/30">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mb-4 text-[14px] leading-relaxed text-clay">
                  Tell me what {child?.name ?? 'they'} {child ? 'is' : 'are'} curious about and I&apos;ll shape one
                  lovely thing to do, tied quietly to the curriculum so it counts.
                </p>

                {lean && (
                  <div className="mb-3 flex items-start gap-2 rounded-xl bg-moss/10 p-3 text-[13px] text-ink">
                    <Feather className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                    <span>Leaning toward {lean.label} to round things out. Tweak it however you like.</span>
                  </div>
                )}

                {children.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {children.map((c) => {
                      const on = c.id === childId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setChildId(c.id)}
                          className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${on ? 'border-moss bg-moss/10 text-ink' : 'border-stone text-clay hover:border-moss/50'}`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <textarea
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); if (error) setError(null); }}
                  rows={4}
                  autoFocus
                  placeholder={`e.g. ${child?.name ?? 'They'} is mad about volcanoes and how they erupt`}
                  className="w-full resize-none rounded-2xl border border-stone bg-white px-4 py-3 text-base shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/15"
                />

                <div className="mt-2 flex items-center gap-2 text-[12.5px] text-clay">
                  <Mic className="h-3.5 w-3.5 text-moss" />
                  Prefer to talk? Use your device&apos;s dictation and just say it.
                </div>

                {error && <p className="mt-3 text-[13px] text-[#C0392B]">{error}</p>}

                <button
                  onClick={follow}
                  disabled={prompt.trim().length < 3}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-3.5 text-base font-semibold text-parchment transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles className="h-4 w-4" /> Shape it for {child?.name ?? 'them'} <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SparkLoading({ name }: { name: string }) {
  const lines = loadingLines(name);
  const [i, setI] = useState(0);
  const [secs, setSecs] = useState(0);
  const [w, setW] = useState(6);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const a = setInterval(() => setI((x) => (x + 1) % lines.length), 2400);
    tick.current = setInterval(() => setSecs((x) => x + 1), 1000);
    const grow = setTimeout(() => setW(95), 50); // trigger the CSS transition
    return () => { clearInterval(a); if (tick.current) clearInterval(tick.current); clearTimeout(grow); };
  }, [lines.length]);
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-moss/10">
        <span className="absolute h-24 w-24 animate-ping rounded-[28px] bg-moss/15" />
        <Sparkles className="h-11 w-11 text-moss" strokeWidth={1.6} />
      </div>
      <h3 className="mb-2 font-display text-2xl font-semibold text-ink">Shaping something for {name}</h3>
      <p className="mb-5 flex min-h-[24px] items-center gap-1.5 text-[15px] text-moss">
        <GraduationCap className="h-4 w-4" /> {lines[i]}
      </p>
      <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-stone">
        <div className="h-full rounded-full bg-moss" style={{ width: `${w}%`, transition: 'width 16s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>
      <p className="mt-3 text-[12.5px] text-clay/70">{secs < 18 ? 'This usually takes a few seconds' : 'Nearly there, thanks for your patience'}</p>
    </div>
  );
}
