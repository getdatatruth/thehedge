'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Star,
  Calendar,
  Trash2,
  Save,
  X,
  Loader2,
  BookOpen,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  emoji: string;
  activity_ids: string[];
  featured: boolean;
  seasonal: boolean;
  event_date: string;
  published: boolean;
}

interface Activity {
  id: string;
  title: string;
  category: string;
  published: boolean;
}

const EMOJIS = ['🌿', '🎨', '🔬', '📚', '🌞', '❄️', '🍂', '🌸', '🎃', '🎄', '🐰', '🦋', '🌊', '🏃', '🍳'];

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEmoji, setFormEmoji] = useState('🌿');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSeasonal, setFormSeasonal] = useState(false);
  const [formEventDate, setFormEventDate] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formActivityIds, setFormActivityIds] = useState<string[]>([]);
  const [activitySearch, setActivitySearch] = useState('');

  // Load from database on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [colRes, actRes] = await Promise.all([
          fetch('/api/admin/collections'),
          fetch('/api/admin/activities'),
        ]);
        if (colRes.ok) {
          const data = await colRes.json();
          setCollections(Array.isArray(data) ? data : []);
        }
        if (actRes.ok) {
          const data = await actRes.json();
          if (Array.isArray(data)) setActivities(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormEmoji('🌿');
    setFormFeatured(false);
    setFormSeasonal(false);
    setFormEventDate('');
    setFormPublished(true);
    setFormActivityIds([]);
    setActivitySearch('');
  }

  function startCreate() {
    resetForm();
    setCreating(true);
    setEditing(null);
  }

  function startEdit(collection: Collection) {
    setFormTitle(collection.title);
    setFormDescription(collection.description || '');
    setFormEmoji(collection.emoji || '🌿');
    setFormFeatured(collection.featured);
    setFormSeasonal(collection.seasonal);
    setFormEventDate(collection.event_date || '');
    setFormPublished(collection.published ?? true);
    setFormActivityIds(collection.activity_ids || []);
    setEditing(collection.id);
    setCreating(false);
  }

  async function handleSave() {
    if (!formTitle.trim()) return;
    setSaving(true);

    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        emoji: formEmoji,
        activity_ids: formActivityIds,
        featured: formFeatured,
        seasonal: formSeasonal,
        event_date: formEventDate || null,
        published: formPublished,
      };

      if (creating) {
        const res = await fetch('/api/admin/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newCol = await res.json();
          setCollections((prev) => [newCol, ...prev]);
        }
      } else if (editing) {
        const res = await fetch('/api/admin/collections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing, ...payload }),
        });
        if (res.ok) {
          const updated = await res.json();
          setCollections((prev) =>
            prev.map((c) => (c.id === editing ? updated : c))
          );
        }
      }
    } catch (err) {
      console.error('Save collection error:', err);
    }

    setCreating(false);
    setEditing(null);
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        if (editing === id) {
          setEditing(null);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Delete collection error:', err);
    }
  }

  function toggleActivity(activityId: string) {
    setFormActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  }

  const filteredActivities = activities.filter((a) => {
    if (!activitySearch.trim()) return true;
    return a.title.toLowerCase().includes(activitySearch.toLowerCase());
  });

  const isFormOpen = creating || editing !== null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-clay/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Collections
          </h1>
          <p className="text-clay/70 mt-1 font-serif">
            Curated activity bundles. {collections.length} collections.
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-3.5 w-3.5" />
          New collection
        </button>
      </div>

      {/* Create/Edit form */}
      {isFormOpen && (
        <div className="card-elevated p-6 space-y-5 border-l-4 border-l-forest">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-forest">
              {creating ? 'New Collection' : 'Edit Collection'}
            </h2>
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
                resetForm();
              }}
              className="rounded-lg p-1.5 hover:bg-linen transition-colors"
            >
              <X className="h-4 w-4 text-clay/40" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Spring Nature Walk"
                className="rounded-lg border-stone bg-parchment/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Emoji</Label>
              <div className="flex gap-1 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormEmoji(emoji)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      formEmoji === emoji
                        ? 'bg-forest/10 ring-2 ring-forest/30'
                        : 'hover:bg-linen'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold text-umber">Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe this collection..."
                rows={2}
                className="rounded-lg border-stone bg-parchment/30 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Event date (optional)</Label>
              <Input
                type="date"
                value={formEventDate}
                onChange={(e) => setFormEventDate(e.target.value)}
                className="rounded-lg border-stone bg-parchment/30"
              />
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm text-umber cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-stone text-moss"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-umber cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSeasonal}
                  onChange={(e) => setFormSeasonal(e.target.checked)}
                  className="rounded border-stone text-moss"
                />
                Seasonal
              </label>
              <label className="flex items-center gap-2 text-sm text-umber cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="rounded border-stone text-moss"
                />
                Published
              </label>
            </div>
          </div>

          {/* Activity picker */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-umber">
              Activities ({formActivityIds.length} selected)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-clay/30" />
              <Input
                placeholder="Search activities to add..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="h-9 pl-9 rounded-lg border-stone bg-parchment/30 text-sm"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-stone bg-parchment/30 p-2 space-y-1">
              {filteredActivities.length === 0 ? (
                <p className="text-xs text-clay/40 p-2">No activities found.</p>
              ) : (
                filteredActivities.slice(0, 30).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggleActivity(a.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      formActivityIds.includes(a.id)
                        ? 'bg-forest/8 text-forest'
                        : 'hover:bg-linen text-clay/60'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      formActivityIds.includes(a.id)
                        ? 'bg-forest border-forest text-parchment'
                        : 'border-stone'
                    }`}>
                      {formActivityIds.includes(a.id) ? '✓' : ''}
                    </span>
                    <span className="truncate flex-1">{a.title}</span>
                    <span className="text-[10px] text-clay/30 capitalize">{a.category}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
                resetForm();
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formTitle.trim()}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
              {creating ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 && !isFormOpen ? (
        <div className="card-elevated p-12 text-center">
          <BookOpen className="h-8 w-8 text-clay/20 mx-auto mb-3" />
          <p className="text-sm text-clay/50 mb-3">No collections yet.</p>
          <button onClick={startCreate} className="btn-primary text-sm mx-auto">
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map((collection) => (
            <div key={collection.id} className="card-elevated p-5">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{collection.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-forest">{collection.title}</h3>
                    {collection.featured && (
                      <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                    )}
                    {collection.seasonal && (
                      <Calendar className="h-3.5 w-3.5 text-sky" />
                    )}
                    {collection.published ? (
                      <Eye className="h-3.5 w-3.5 text-sage" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-clay/30" />
                    )}
                  </div>
                  <p className="text-xs text-clay/50 mt-0.5 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] text-clay/40">
                      {(collection.activity_ids || []).length} activities
                    </span>
                    {collection.event_date && (
                      <>
                        <span className="text-clay/20">·</span>
                        <span className="text-[11px] text-clay/40">
                          Event: {collection.event_date}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(collection)}
                    className="rounded-lg p-2 hover:bg-linen transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-clay/30 hover:text-forest" />
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="rounded-lg p-2 hover:bg-rust/5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-clay/30 hover:text-rust" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
