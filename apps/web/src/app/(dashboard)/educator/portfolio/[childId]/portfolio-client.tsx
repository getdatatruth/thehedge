'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
  X,
  Check,
  Upload,
  Printer,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Trash2,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface AllChild {
  id: string;
  name: string;
}

interface ActivityInfo {
  title: string;
  category: string;
}

interface PortfolioEntry {
  id: string;
  child_id: string;
  date: string;
  title: string;
  description: string | null;
  curriculum_areas: string[];
  outcome_ids: string[];
  photos: string[];
  activity_log_id: string | null;
  activity_logs: {
    id: string;
    date: string;
    duration_minutes: number | null;
    notes: string | null;
    activities: ActivityInfo | ActivityInfo[] | null;
  } | Array<{
    id: string;
    date: string;
    duration_minutes: number | null;
    notes: string | null;
    activities: ActivityInfo | ActivityInfo[] | null;
  }> | null;
}

interface ActivityLogOption {
  id: string;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  activities: ActivityInfo | ActivityInfo[] | null;
}

interface CurriculumOutcome {
  id: string;
  curriculum_area: string;
  stage: string;
  strand: string;
  outcome_code: string;
  outcome_text: string;
}

const CURRICULUM_AREA_OPTIONS = [
  'Language',
  'Gaeilge',
  'Mathematics',
  'SESE',
  'Arts',
  'PE',
  'SPHE',
  'Wellbeing',
  'Life Skills',
];

type ViewMode = 'timeline' | 'grid';

interface Props {
  child: Child | null;
  entries: PortfolioEntry[];
  activityLogs: ActivityLogOption[];
  allChildren: AllChild[];
  outcomes: CurriculumOutcome[];
}

export function PortfolioClient({
  child,
  entries: initialEntries,
  activityLogs,
  allChildren,
  outcomes,
}: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filterArea, setFilterArea] = useState<string>('');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAreas, setFormAreas] = useState<string[]>([]);
  const [formLogId, setFormLogId] = useState('');
  const [formOutcomeIds, setFormOutcomeIds] = useState<string[]>([]);
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAreas([]);
    setFormLogId('');
    setFormOutcomeIds([]);
    setFormPhotos([]);
    setShowForm(false);
    setError('');
  }

  function toggleArea(area: string) {
    setFormAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleOutcome(id: string) {
    setFormOutcomeIds((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !child) return;

    setUploadingPhoto(true);

    try {
      // For now, we create a data URL as a placeholder
      // In production, this would upload to Supabase Storage
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setFormPhotos((prev) => [...prev, reader.result as string]);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      console.error('Failed to process photo:', err);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function removePhoto(index: number) {
    setFormPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!child) return;
    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/educator/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          date: formDate,
          curriculum_areas: formAreas,
          outcome_ids: formOutcomeIds,
          photos: formPhotos,
          activity_log_id: formLogId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create entry');

      setEntries((prev) => [json.data, ...prev]);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entryId: string) {
    try {
      const res = await fetch(`/api/educator/portfolio?id=${entryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }

  function getActivityTitle(entry: PortfolioEntry): string | null {
    if (!entry.activity_logs) return null;
    const log = Array.isArray(entry.activity_logs) ? entry.activity_logs[0] : entry.activity_logs;
    if (!log?.activities) return null;
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.title || null;
  }

  function getLogActivityTitle(log: ActivityLogOption): string {
    if (!log.activities) return log.notes || 'Untitled activity';
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.title || log.notes || 'Untitled activity';
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatMonth(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
  }

  // Group entries by curriculum area for coverage summary
  const byArea: Record<string, PortfolioEntry[]> = {};
  entries.forEach((entry) => {
    entry.curriculum_areas.forEach((area) => {
      if (!byArea[area]) byArea[area] = [];
      byArea[area].push(entry);
    });
  });

  // Group entries by month for timeline
  const byMonth: Record<string, PortfolioEntry[]> = {};
  const filteredEntries = filterArea
    ? entries.filter((e) => e.curriculum_areas.includes(filterArea))
    : entries;
  filteredEntries.forEach((entry) => {
    const month = formatMonth(entry.date);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(entry);
  });
  const months = Object.keys(byMonth);

  // Get outcomes grouped by area for the form
  const outcomesByArea: Record<string, CurriculumOutcome[]> = {};
  outcomes.forEach((o) => {
    if (!outcomesByArea[o.curriculum_area]) outcomesByArea[o.curriculum_area] = [];
    outcomesByArea[o.curriculum_area].push(o);
  });

  // Print view
  if (showPrintView) {
    return (
      <div className="p-8 bg-white text-black print:p-4">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">{child?.name}&apos;s Learning Portfolio</h1>
          <p className="text-gray-600 mt-1">
            {entries.length} entries - Generated {new Date().toLocaleDateString('en-IE')}
          </p>
        </div>

        {/* Coverage summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Curriculum Coverage</h2>
          <div className="flex flex-wrap gap-2">
            {CURRICULUM_AREA_OPTIONS.map((area) => {
              const count = byArea[area]?.length || 0;
              return (
                <span key={area} className={`px-2 py-1 text-xs border rounded ${
                  count > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  {area} ({count})
                </span>
              );
            })}
          </div>
        </div>

        {/* Entries */}
        {entries.map((entry) => (
          <div key={entry.id} className="mb-6 border-b pb-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{entry.title}</h3>
              <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
            </div>
            {entry.description && (
              <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
            )}
            {entry.curriculum_areas.length > 0 && (
              <div className="flex gap-1 mt-2">
                {entry.curriculum_areas.map((area) => (
                  <span key={area} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{area}</span>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-8 text-xs text-gray-500 flex justify-between">
          <span>Generated by The Hedge - thehedge.ie</span>
          <span>{new Date().toLocaleDateString('en-IE')}</span>
        </div>

        <button
          onClick={() => setShowPrintView(false)}
          className="mt-4 text-sm text-blue-600 hover:underline print:hidden"
        >
          Back to portfolio
        </button>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FolderOpen className="mx-auto mb-3 h-8 w-8 text-clay/20" />
          <p className="font-medium text-clay/40">Child not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div>
        <Link href="/educator" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to educator
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss/15">
              <span className="text-xl font-light font-display text-ink">{child.name[0]}</span>
            </div>
            <div>
              <p className="eyebrow mb-1">Portfolio</p>
              <h1 className="font-display text-3xl font-light text-ink tracking-tight">
                {child.name}&apos;s <em className="text-moss italic">Portfolio</em>
              </h1>
              <p className="text-clay font-serif mt-1">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'} - Evidence of learning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPrintView(true);
                setTimeout(() => window.print(), 300);
              }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add entry
            </button>
          </div>
        </div>
      </div>

      {/* Child tabs (if multiple children) */}
      {allChildren.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allChildren.map((c) => (
            <Link
              key={c.id}
              href={`/educator/portfolio/${c.id}`}
              className={`rounded-[14px] px-4 py-2 text-sm font-medium transition-all shrink-0 ${
                c.id === child.id
                  ? 'bg-forest text-parchment shadow-sm'
                  : 'bg-linen text-clay/50 hover:bg-parchment'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Add entry form */}
      {showForm && (
        <div className="card-elevated p-6 space-y-5 border-2 border-moss/20">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-light text-ink">
              New <em className="text-moss italic">Entry</em>
            </h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-linen transition-colors">
              <X className="h-4 w-4 text-clay/40" />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                placeholder="What did they learn or create?"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none resize-none"
                placeholder="Describe what happened, what they learned..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Link to activity log</label>
                <select
                  value={formLogId}
                  onChange={(e) => setFormLogId(e.target.value)}
                  className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                >
                  <option value="">None</option>
                  {activityLogs.map((log) => (
                    <option key={log.id} value={log.id}>
                      {log.date} - {getLogActivityTitle(log)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-2 block">
                Photos / Evidence
              </label>
              <div className="flex flex-wrap gap-3">
                {formPhotos.map((photo, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden bg-linen group">
                    {photo.startsWith('data:image') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-clay/20" />
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ink/60 text-parchment flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-forest/10 flex flex-col items-center justify-center gap-1 text-clay/30 hover:text-moss hover:border-moss/20 transition-all"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[9px] font-bold uppercase">
                    {uploadingPhoto ? '...' : 'Add'}
                  </span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Curriculum areas */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-2 block">Curriculum Areas</label>
              <div className="flex flex-wrap gap-2">
                {CURRICULUM_AREA_OPTIONS.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`tag cursor-pointer transition-all ${
                      formAreas.includes(area)
                        ? 'bg-moss/15 text-moss border border-moss/30'
                        : 'bg-linen text-clay/40 hover:bg-parchment'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Curriculum outcomes */}
            {outcomes.length > 0 && formAreas.length > 0 && (
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-2 block">
                  Curriculum Outcomes
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-[14px] border border-forest/10 bg-parchment/30 p-3">
                  {formAreas.map((area) => {
                    const areaOutcomes = outcomesByArea[area] || [];
                    if (areaOutcomes.length === 0) return null;

                    return (
                      <div key={area}>
                        <p className="text-[10px] font-bold text-clay/50 mb-1">{area}</p>
                        {areaOutcomes.map((outcome) => (
                          <button
                            key={outcome.id}
                            onClick={() => toggleOutcome(outcome.id)}
                            className={`w-full text-left rounded-lg p-2 text-xs transition-all mb-1 ${
                              formOutcomeIds.includes(outcome.id)
                                ? 'bg-moss/10 text-moss'
                                : 'text-clay/50 hover:bg-parchment/50'
                            }`}
                          >
                            <span className="font-mono text-[9px] text-clay/40 mr-2">{outcome.outcome_code}</span>
                            {outcome.outcome_text}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formTitle.trim()}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Add entry'}
            </button>
          </div>
        </div>
      )}

      {/* Coverage summary */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Evidence by Curriculum Area</p>
          {filterArea && (
            <button
              onClick={() => setFilterArea('')}
              className="text-xs text-moss hover:text-forest flex items-center gap-1"
            >
              Clear filter <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CURRICULUM_AREA_OPTIONS.map((area) => {
            const count = byArea[area]?.length || 0;
            const isFiltered = filterArea === area;
            return (
              <button
                key={area}
                onClick={() => setFilterArea(isFiltered ? '' : area)}
                className={`tag cursor-pointer transition-all ${
                  isFiltered
                    ? 'bg-moss/20 text-moss border border-moss/30'
                    : count > 0
                      ? 'bg-moss/10 text-moss hover:bg-moss/15'
                      : 'bg-linen text-clay/30 hover:bg-parchment'
                }`}
              >
                {area} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-clay/50">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          {filterArea ? ` in ${filterArea}` : ''}
        </p>
        <div className="flex items-center gap-1 bg-linen rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('timeline')}
            className={`rounded-md p-1.5 transition-all ${
              viewMode === 'timeline' ? 'bg-parchment shadow-sm' : 'text-clay/40 hover:text-umber'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-parchment shadow-sm' : 'text-clay/40 hover:text-umber'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeline view */}
      {viewMode === 'timeline' && months.length > 0 && (
        <div className="space-y-8">
          {months.map((month) => (
            <div key={month}>
              <h3 className="font-display text-lg font-light text-ink mb-3">
                {month}
              </h3>
              <div className="relative pl-6 border-l-2 border-stone/20 space-y-4">
                {byMonth[month].map((entry) => {
                  const activityTitle = getActivityTitle(entry);
                  const hasPhotos = entry.photos && entry.photos.length > 0;
                  const isExpanded = expandedEntry === entry.id;

                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-3 h-3 w-3 rounded-full bg-parchment border-2 border-moss" />

                      <div
                        className="card-elevated p-5 cursor-pointer"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            hasPhotos ? 'bg-sky/10' : 'bg-amber/10'
                          }`}>
                            {hasPhotos ? (
                              <ImageIcon className="h-6 w-6 text-sky" />
                            ) : (
                              <FileText className="h-6 w-6 text-amber" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-medium text-umber">{entry.title}</h3>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-clay/30" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-clay/30" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[11px] text-clay/40 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(entry.date)}
                              </span>
                              {activityTitle && (
                                <>
                                  <span className="text-clay/20">·</span>
                                  <span className="text-[11px] text-clay/40 font-serif">
                                    from: {activityTitle}
                                  </span>
                                </>
                              )}
                            </div>
                            {entry.curriculum_areas.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {entry.curriculum_areas.map((area) => (
                                  <span key={area} className="tag bg-moss/8 text-moss">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-stone/15 space-y-3">
                            {entry.description && (
                              <p className="text-xs text-clay/60 font-serif leading-relaxed">
                                {entry.description}
                              </p>
                            )}
                            {hasPhotos && (
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-2">Evidence</p>
                                <div className="flex gap-2 flex-wrap">
                                  {entry.photos.map((photo, i) => (
                                    <div key={i} className="h-24 w-24 rounded-xl bg-linen flex items-center justify-center overflow-hidden">
                                      {photo.startsWith('data:image') || photo.startsWith('http') ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={photo} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                                      ) : (
                                        <ImageIcon className="h-6 w-6 text-clay/20" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {entry.outcome_ids.length > 0 && (
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">
                                  Linked Outcomes ({entry.outcome_ids.length})
                                </p>
                                <div className="space-y-1">
                                  {entry.outcome_ids.map((oid) => {
                                    const outcome = outcomes.find((o) => o.id === oid);
                                    return outcome ? (
                                      <p key={oid} className="text-[11px] text-clay/50 font-serif">
                                        <span className="font-mono text-[9px] text-clay/30 mr-1">{outcome.outcome_code}</span>
                                        {outcome.outcome_text}
                                      </p>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this portfolio entry?')) {
                                    deleteEntry(entry.id);
                                  }
                                }}
                                className="text-xs text-clay/30 hover:text-terracotta flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filteredEntries.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => {
            const activityTitle = getActivityTitle(entry);
            const hasPhotos = entry.photos && entry.photos.length > 0;

            return (
              <div key={entry.id} className="card-elevated p-4">
                {hasPhotos && (
                  <div className="h-32 -mx-4 -mt-4 mb-3 rounded-t-[14px] overflow-hidden bg-linen flex items-center justify-center">
                    {entry.photos[0].startsWith('data:image') || entry.photos[0].startsWith('http') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.photos[0]} alt={entry.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-clay/20" />
                    )}
                    {entry.photos.length > 1 && (
                      <span className="absolute top-2 right-2 tag bg-ink/60 text-parchment">
                        +{entry.photos.length - 1}
                      </span>
                    )}
                  </div>
                )}
                <h3 className="text-sm font-medium text-umber">{entry.title}</h3>
                <p className="text-[11px] text-clay/40 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.date)}
                </p>
                {entry.curriculum_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.curriculum_areas.map((area) => (
                      <span key={area} className="tag bg-moss/8 text-moss">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredEntries.length === 0 && !showForm && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-forest/10 bg-parchment/50">
          <div className="text-center">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-clay/20" />
            <p className="font-medium text-clay/40">
              {filterArea ? `No entries for ${filterArea}` : 'No portfolio entries yet'}
            </p>
            <p className="text-sm text-clay/30 mt-1 font-serif">
              {filterArea
                ? 'Try clearing the filter or add entries for this curriculum area.'
                : 'Add evidence of learning from completed activities.'}
            </p>
            {!filterArea && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add first entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
