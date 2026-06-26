'use client';

import { useState } from 'react';
import { Leaf, Pencil, Plus, X, Check } from 'lucide-react';
import type { KTFramework } from '@/lib/kitchen-table';

// Persistent editing of the Family Framework from Our Hedge. View mode mirrors
// the keepsake; edit mode lets a parent tweak the words anytime and saves them,
// re-rendering the markdown the AI reads so everything stays in sync.
export function FrameworkEditor({ initial }: { initial: KTFramework }) {
  const [fw, setFw] = useState<KTFramework>(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<KTFramework>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(fw);
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/me/framework', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: {
            whatYouToldMe: draft.whatYouToldMe,
            commitments: draft.commitments.filter((c) => c.trim()),
            quietFloor: draft.quietFloor,
            forYourWorry: draft.forYourWorry,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.framework) throw new Error(json?.error || 'Could not save your changes');
      setFw(json.data.framework as KTFramework);
      setEditing(false);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-moss">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-moss transition-colors hover:text-forest"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
        <div className="space-y-3">
          {fw.whatYouToldMe && <Card title="What you told me"><p>{fw.whatYouToldMe}</p></Card>}
          {fw.commitments?.length > 0 && (
            <Card title="How The Hedge works for you">
              <ul className="space-y-2.5">
                {fw.commitments.map((c, i) => (
                  <li key={i} className="flex gap-2.5"><Leaf className="mt-1 h-4 w-4 shrink-0 text-moss" /><span>{c}</span></li>
                ))}
              </ul>
            </Card>
          )}
          {fw.quietFloor && <Card title="The quiet floor"><p>{fw.quietFloor}</p></Card>}
          {fw.forYourWorry && <Card title="For your worry"><p>{fw.forYourWorry}</p></Card>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <EditCard title="What you told me">
        <Area value={draft.whatYouToldMe} onChange={(v) => setDraft({ ...draft, whatYouToldMe: v })} rows={4} />
      </EditCard>

      <EditCard title="How The Hedge works for you">
        <div className="space-y-2">
          {draft.commitments.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <Leaf className="mt-3 h-4 w-4 shrink-0 text-moss" />
              <Area
                value={c}
                rows={2}
                onChange={(v) => setDraft({ ...draft, commitments: draft.commitments.map((x, j) => (j === i ? v : x)) })}
              />
              <button
                onClick={() => setDraft({ ...draft, commitments: draft.commitments.filter((_, j) => j !== i) })}
                aria-label="Remove"
                className="mt-2.5 text-clay/40 transition-colors hover:text-terracotta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setDraft({ ...draft, commitments: [...draft.commitments, ''] })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-stone px-3 py-2 text-[13px] font-medium text-moss transition-colors hover:border-moss/50 hover:bg-moss/5"
          >
            <Plus className="h-3.5 w-3.5" /> Add a promise
          </button>
        </div>
      </EditCard>

      <EditCard title="The quiet floor">
        <Area value={draft.quietFloor} onChange={(v) => setDraft({ ...draft, quietFloor: v })} rows={3} />
      </EditCard>

      <EditCard title="For your worry">
        <Area value={draft.forYourWorry} onChange={(v) => setDraft({ ...draft, forYourWorry: v })} rows={3} />
      </EditCard>

      {error && <p className="rounded-2xl bg-terracotta/5 px-3 py-2 text-sm text-terracotta">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-2.5 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <button
          onClick={() => { setEditing(false); setError(null); }}
          className="rounded-2xl px-4 py-2.5 text-sm font-medium text-clay transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone/40 bg-white p-5 shadow-sm">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">{title}</p>
      <div className="text-[15px] leading-relaxed text-umber">{children}</div>
    </div>
  );
}

function EditCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-moss/30 bg-white p-5 shadow-sm">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">{title}</p>
      {children}
    </div>
  );
}

function Area({ value, onChange, rows }: { value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full resize-none rounded-xl border border-stone bg-parchment/20 px-3 py-2.5 text-[15px] leading-relaxed text-ink shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/15"
    />
  );
}
