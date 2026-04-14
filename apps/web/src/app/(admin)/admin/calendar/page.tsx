'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  BookOpen,
  Star,
  Sparkles,
  Trash2,
  Pencil,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'content' | 'collection';
  status: 'planned' | 'draft' | 'scheduled' | 'done';
  description?: string;
}

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-moss/10 text-moss',
  scheduled: 'bg-sky/10 text-sky',
  draft: 'bg-gold/10 text-gold',
  planned: 'bg-linen text-clay/40',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  content: BookOpen,
  collection: Star,
};

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'content' | 'collection'>('content');
  const [formStatus, setFormStatus] = useState<'planned' | 'draft' | 'scheduled' | 'done'>('planned');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('hedge-admin-calendar');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
          return;
        }
      } catch {
        // fall through to defaults
      }
    }

    // Default events
    const defaults: CalendarEvent[] = [
      { id: '1', date: '2026-03-10', title: 'Spring activities launch', type: 'content', status: 'done' },
      { id: '2', date: '2026-03-17', title: "St Patrick's Day bundle", type: 'collection', status: 'scheduled' },
      { id: '3', date: '2026-03-20', title: 'Spring equinox activities', type: 'content', status: 'scheduled' },
      { id: '4', date: '2026-03-25', title: "Mother's Day craft activities", type: 'collection', status: 'draft' },
      { id: '5', date: '2026-04-01', title: 'Easter activities bundle', type: 'collection', status: 'draft' },
      { id: '6', date: '2026-04-06', title: 'Outdoor exploration week', type: 'content', status: 'planned' },
      { id: '7', date: '2026-04-15', title: 'Earth Day activities', type: 'collection', status: 'planned' },
      { id: '8', date: '2026-05-01', title: 'Bealtaine/May Day activities', type: 'collection', status: 'planned' },
      { id: '9', date: '2026-06-01', title: 'Summer holiday bundle', type: 'collection', status: 'planned' },
      { id: '10', date: '2026-06-21', title: 'Summer solstice / longest day', type: 'content', status: 'planned' },
    ];
    setEvents(defaults);
    localStorage.setItem('hedge-admin-calendar', JSON.stringify(defaults));
  }, []);

  function saveEvents(updated: CalendarEvent[]) {
    setEvents(updated);
    localStorage.setItem('hedge-admin-calendar', JSON.stringify(updated));
  }

  function resetForm() {
    setFormDate('');
    setFormTitle('');
    setFormType('content');
    setFormStatus('planned');
    setFormDescription('');
  }

  function startCreate() {
    resetForm();
    setCreating(true);
    setEditingId(null);
  }

  function startEdit(event: CalendarEvent) {
    setFormDate(event.date);
    setFormTitle(event.title);
    setFormType(event.type);
    setFormStatus(event.status);
    setFormDescription(event.description || '');
    setEditingId(event.id);
    setCreating(false);
  }

  function handleSave() {
    if (!formTitle.trim() || !formDate) return;
    setSaving(true);

    if (creating) {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        date: formDate,
        title: formTitle.trim(),
        type: formType,
        status: formStatus,
        description: formDescription.trim() || undefined,
      };
      saveEvents([...events, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    } else if (editingId) {
      saveEvents(
        events
          .map((e) =>
            e.id === editingId
              ? { ...e, date: formDate, title: formTitle.trim(), type: formType, status: formStatus, description: formDescription.trim() || undefined }
              : e
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    }

    setCreating(false);
    setEditingId(null);
    resetForm();
    setSaving(false);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this calendar event?')) return;
    saveEvents(events.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  }

  function updateStatus(id: string, status: CalendarEvent['status']) {
    saveEvents(events.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  // Group events by month
  const grouped = events.reduce(
    (acc, event) => {
      const d = new Date(event.date);
      const month = d.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    },
    {} as Record<string, CalendarEvent[]>,
  );

  const isFormOpen = creating || editingId !== null;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Content Calendar
          </h1>
          <p className="text-clay/70 mt-1">
            Plan seasonal content drops, collections, and editorial events.
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-3.5 w-3.5" />
          Add event
        </button>
      </div>

      {/* Info card */}
      <div className="card-elevated p-5 border-l-4 border-l-moss/30">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-moss mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-forest mb-1">Living content engine</p>
            <p className="text-sm text-clay/60 leading-relaxed">
              Schedule content drops to keep the platform fresh. Each event can launch new activities,
              collections, or featured bundles. Users see &quot;New this week&quot; badges and seasonal
              collections automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit form */}
      {isFormOpen && (
        <div className="card-elevated p-6 space-y-5 border-l-4 border-l-forest">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-forest">
              {creating ? 'New Calendar Event' : 'Edit Event'}
            </h2>
            <button
              onClick={() => {
                setCreating(false);
                setEditingId(null);
                resetForm();
              }}
              className="rounded-lg p-1.5 hover:bg-linen transition-colors"
            >
              <X className="h-4 w-4 text-clay/40" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold text-umber">Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Easter activities bundle"
                className="rounded-lg border-stone bg-parchment/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Date</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="rounded-lg border-stone bg-parchment/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Type</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as 'content' | 'collection')}
                className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
              >
                <option value="content">Content</option>
                <option value="collection">Collection</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-umber">Status</Label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as CalendarEvent['status'])}
                className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
              >
                <option value="planned">Planned</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold text-umber">Description (optional)</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description..."
                className="rounded-lg border-stone bg-parchment/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCreating(false);
                setEditingId(null);
                resetForm();
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formTitle.trim() || !formDate}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
              {creating ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Calendar timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-forest/5">
                <Calendar className="h-4 w-4 text-moss" />
              </div>
              <h2 className="font-display text-base font-bold text-forest">
                {month}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-forest/8 to-transparent" />
            </div>

            <div className="space-y-2 ml-4 border-l-2 border-stone pl-6">
              {monthEvents.map((event) => {
                const TypeIcon = TYPE_ICONS[event.type] || BookOpen;
                const eventDate = new Date(event.date);
                const dateStr = eventDate.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });
                return (
                  <div key={event.id} className="card-elevated p-4 relative group">
                    <div className="absolute -left-[33px] top-5 h-3 w-3 rounded-full border-2 border-moss bg-parchment" />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-clay/40 w-16 shrink-0">{dateStr}</span>
                      <TypeIcon className="h-4 w-4 text-clay/30 shrink-0" />
                      <span className="text-sm font-semibold text-forest flex-1">{event.title}</span>

                      {/* Status dropdown */}
                      <select
                        value={event.status}
                        onChange={(e) => updateStatus(event.id, e.target.value as CalendarEvent['status'])}
                        className={`rounded px-2.5 py-0.5 text-[10px] font-bold capitalize border-0 cursor-pointer ${STATUS_STYLES[event.status]}`}
                      >
                        <option value="planned">Planned</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="done">Done</option>
                      </select>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(event)}
                          className="rounded-lg p-1 hover:bg-linen transition-colors"
                        >
                          <Pencil className="h-3 w-3 text-clay/30" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="rounded-lg p-1 hover:bg-rust/5 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 text-clay/30 hover:text-rust" />
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-clay/40 mt-1.5 ml-[76px]">{event.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !isFormOpen && (
        <div className="card-elevated p-12 text-center">
          <Calendar className="h-8 w-8 text-clay/20 mx-auto mb-3" />
          <p className="text-sm text-clay/50 mb-3">No calendar events yet.</p>
          <button onClick={startCreate} className="btn-primary text-sm mx-auto">
            Create your first event
          </button>
        </div>
      )}
    </div>
  );
}
