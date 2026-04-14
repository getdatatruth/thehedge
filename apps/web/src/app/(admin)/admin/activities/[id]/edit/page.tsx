'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  location: string;
  energy_level: string;
  mess_level: string;
  screen_free: boolean;
  premium: boolean;
  published: boolean;
  instructions: { steps: string[] };
  materials: { name: string; household_common: boolean }[];
  learning_outcomes: string[];
  weather: string[];
  season: string[];
}

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('nature');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [ageMin, setAgeMin] = useState(3);
  const [ageMax, setAgeMax] = useState(10);
  const [location, setLocation] = useState('indoor');
  const [energyLevel, setEnergyLevel] = useState('moderate');
  const [messLevel, setMessLevel] = useState('low');
  const [screenFree, setScreenFree] = useState(true);
  const [premium, setPremium] = useState(false);
  const [published, setPublished] = useState(false);
  const [instructions, setInstructions] = useState(['']);
  const [materials, setMaterials] = useState([{ name: '', household_common: true }]);
  const [learningOutcomes, setLearningOutcomes] = useState(['']);
  const [weather, setWeather] = useState<string[]>([]);
  const [season, setSeason] = useState<string[]>([]);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch(`/api/admin/activities?id=${id}`);
        if (!res.ok) throw new Error('Failed to load activity');
        const data: Activity = await res.json();

        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setDurationMinutes(data.duration_minutes);
        setAgeMin(data.age_min);
        setAgeMax(data.age_max);
        setLocation(data.location);
        setEnergyLevel(data.energy_level);
        setMessLevel(data.mess_level);
        setScreenFree(data.screen_free);
        setPremium(data.premium);
        setPublished(data.published);
        setWeather(data.weather || []);
        setSeason(data.season || []);

        const steps = data.instructions?.steps || [];
        setInstructions(steps.length > 0 ? steps : ['']);

        const mats = data.materials || [];
        setMaterials(mats.length > 0 ? mats : [{ name: '', household_common: true }]);

        const outcomes = data.learning_outcomes || [];
        setLearningOutcomes(outcomes.length > 0 ? outcomes : ['']);
      } catch (err) {
        console.error(err);
        alert('Failed to load activity');
      } finally {
        setLoadingActivity(false);
      }
    }
    loadActivity();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const res = await fetch('/api/admin/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: title.trim(),
          slug,
          description: description.trim(),
          category,
          duration_minutes: durationMinutes,
          age_min: ageMin,
          age_max: ageMax,
          location,
          energy_level: energyLevel,
          mess_level: messLevel,
          screen_free: screenFree,
          premium,
          published,
          instructions: { steps: instructions.filter((s) => s.trim()) },
          materials: materials.filter((m) => m.name.trim()),
          learning_outcomes: learningOutcomes.filter((o) => o.trim()),
          weather,
          season,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update activity');
      }

      router.push('/admin/activities');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to update activity');
    } finally {
      setSaving(false);
    }
  }

  if (loadingActivity) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-moss" />
      </div>
    );
  }

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.nature;

  return (
    <div className="space-y-8 animate-fade-up max-w-3xl">
      <div>
        <Link href="/admin/activities" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to activities
        </Link>
        <div className="flex items-start justify-between">
          <h1 className="font-display text-3xl font-light text-ink tracking-tight">
            Edit Activity
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              {showPreview ? 'Hide preview' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      {showPreview && (
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-moss" />
            <h2 className="font-display text-lg font-light text-ink">Activity Preview</h2>
          </div>
          <div className="rounded-2xl border border-stone bg-parchment p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-medium ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              {premium && (
                <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold bg-amber/10 text-amber">
                  Premium
                </span>
              )}
              <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium ${
                published ? 'bg-moss/10 text-moss' : 'bg-gold/10 text-gold'
              }`}>
                {published ? 'Published' : 'Draft'}
              </span>
            </div>
            <h3 className="font-display text-2xl font-light text-ink">{title || 'Untitled'}</h3>
            <p className="text-sm text-clay">{description || 'No description'}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="tag bg-stone/30 text-umber">{durationMinutes}m</span>
              <span className="tag bg-stone/30 text-umber">{ageMin}–{ageMax}y</span>
              <span className="tag bg-stone/30 text-umber capitalize">{location}</span>
              <span className="tag bg-stone/30 text-umber capitalize">{energyLevel}</span>
              <span className="tag bg-stone/30 text-umber capitalize">{messLevel} mess</span>
            </div>
            {instructions.filter(s => s.trim()).length > 0 && (
              <div>
                <p className="text-xs font-bold text-umber mb-2">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-clay">
                  {instructions.filter(s => s.trim()).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Published status */}
      <div className="card-elevated p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-forest">Publish status</p>
          <p className="text-xs text-clay/50">
            {published ? 'This activity is live and visible to users.' : 'This activity is a draft and not visible to users.'}
          </p>
        </div>
        <button
          onClick={() => setPublished(!published)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            published
              ? 'bg-moss/10 text-moss hover:bg-moss/20'
              : 'bg-gold/10 text-gold hover:bg-gold/20'
          }`}
        >
          {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {published ? 'Published' : 'Draft'}
        </button>
      </div>

      {/* Basic info */}
      <div className="card-elevated p-6 space-y-5">
        <h2 className="font-display text-lg font-light text-ink">Basic Information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-semibold text-umber">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frogspawn Safari"
              className="rounded-lg border-stone bg-parchment/30"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-semibold text-umber">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of the activity..."
              rows={3}
              className="rounded-lg border-stone bg-parchment/30 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Duration (minutes)</Label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="rounded-lg border-stone bg-parchment/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Min age</Label>
            <Input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="rounded-lg border-stone bg-parchment/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Max age</Label>
            <Input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="rounded-lg border-stone bg-parchment/30"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card-elevated p-6 space-y-5">
        <h2 className="font-display text-lg font-light text-ink">Tags & Properties</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Location</Label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="both">Both</option>
              <option value="car">Car</option>
              <option value="anywhere">Anywhere</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Energy level</Label>
            <select
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
            >
              <option value="calm">Calm</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Mess level</Label>
            <select
              value={messLevel}
              onChange={(e) => setMessLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-stone bg-parchment/30 px-3 text-sm"
            >
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-umber-light cursor-pointer">
            <input type="checkbox" checked={screenFree} onChange={(e) => setScreenFree(e.target.checked)} className="rounded border-stone text-moss" />
            Screen-free
          </label>
          <label className="flex items-center gap-2 text-sm text-umber-light cursor-pointer">
            <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="rounded border-stone text-moss" />
            Premium activity
          </label>
        </div>

        {/* Season and weather */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Seasons</Label>
            <div className="flex flex-wrap gap-2">
              {['spring', 'summer', 'autumn', 'winter'].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setSeason(
                      season.includes(s) ? season.filter((x) => x !== s) : [...season, s]
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    season.includes(s)
                      ? 'bg-forest text-parchment'
                      : 'bg-parchment border border-stone text-clay/50 hover:border-forest/20'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-umber">Weather</Label>
            <div className="flex flex-wrap gap-2">
              {['sunny', 'cloudy', 'rainy', 'windy', 'snowy', 'any'].map((w) => (
                <button
                  key={w}
                  onClick={() =>
                    setWeather(
                      weather.includes(w) ? weather.filter((x) => x !== w) : [...weather, w]
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    weather.includes(w)
                      ? 'bg-forest text-parchment'
                      : 'bg-parchment border border-stone text-clay/50 hover:border-forest/20'
                  }`}
                >
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-light text-ink">Instructions</h2>
          <button
            onClick={() => setInstructions([...instructions, ''])}
            className="text-xs font-medium text-moss hover:text-forest flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add step
          </button>
        </div>
        <div className="space-y-2">
          {instructions.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-[11px] font-bold text-forest mt-1.5">
                {i + 1}
              </span>
              <Input
                value={step}
                onChange={(e) => {
                  const updated = [...instructions];
                  updated[i] = e.target.value;
                  setInstructions(updated);
                }}
                placeholder={`Step ${i + 1}...`}
                className="rounded-lg border-stone bg-parchment/30"
              />
              <button
                onClick={() => setInstructions(instructions.filter((_, j) => j !== i))}
                className="p-2 mt-1 rounded-lg hover:bg-rust/5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-umber-light/30 hover:text-rust" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-light text-ink">Materials</h2>
          <button
            onClick={() => setMaterials([...materials, { name: '', household_common: true }])}
            className="text-xs font-medium text-moss hover:text-forest flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add material
          </button>
        </div>
        <div className="space-y-2">
          {materials.map((material, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={material.name}
                onChange={(e) => {
                  const updated = [...materials];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setMaterials(updated);
                }}
                placeholder="Material name..."
                className="rounded-lg border-stone bg-parchment/30 flex-1"
              />
              <label className="flex items-center gap-1.5 text-xs text-umber-light/50 whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={material.household_common}
                  onChange={(e) => {
                    const updated = [...materials];
                    updated[i] = { ...updated[i], household_common: e.target.checked };
                    setMaterials(updated);
                  }}
                  className="rounded border-stone text-moss"
                />
                Common
              </label>
              <button
                onClick={() => setMaterials(materials.filter((_, j) => j !== i))}
                className="p-2 rounded-lg hover:bg-rust/5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-umber-light/30 hover:text-rust" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning outcomes */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-light text-ink">Learning Outcomes</h2>
          <button
            onClick={() => setLearningOutcomes([...learningOutcomes, ''])}
            className="text-xs font-medium text-moss hover:text-forest flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add outcome
          </button>
        </div>
        <div className="space-y-2">
          {learningOutcomes.map((outcome, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={outcome}
                onChange={(e) => {
                  const updated = [...learningOutcomes];
                  updated[i] = e.target.value;
                  setLearningOutcomes(updated);
                }}
                placeholder="e.g., Observation skills, Scientific method..."
                className="rounded-lg border-stone bg-parchment/30 flex-1"
              />
              <button
                onClick={() => setLearningOutcomes(learningOutcomes.filter((_, j) => j !== i))}
                className="p-2 rounded-lg hover:bg-rust/5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-umber-light/30 hover:text-rust" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 justify-end pb-8">
        <Link href="/admin/activities" className="btn-secondary text-sm">
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
