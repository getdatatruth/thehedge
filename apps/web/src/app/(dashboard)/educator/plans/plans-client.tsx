'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Clock,
  CalendarDays,
  Target,
  Pencil,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Users,
  MessageCircle,
  Compass,
  Trash2,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface LearningGoal {
  id: string;
  text: string;
  term: string;
  aistearTheme: string;
  status: 'not_started' | 'in_progress' | 'achieved';
}

interface EducationPlan {
  id: string;
  child_id: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
  curriculum_areas: Record<string, { priority: string; notes?: string; goals?: LearningGoal[] }> | null;
  tusla_status: string;
  plan_document_url: string | null;
  children: Child | Child[] | null;
}

interface ActivityLog {
  id: string;
  date: string;
  duration_minutes: number | null;
  curriculum_areas_covered: string[] | null;
  child_ids: string[];
}

const APPROACHES = [
  { value: 'structured', label: 'Structured', description: 'Timetabled, textbook-led approach' },
  { value: 'relaxed', label: 'Relaxed', description: 'Flexible schedule, interest-led learning' },
  { value: 'child_led', label: 'Child-led', description: 'Unschooling - follow the child\'s interests' },
  { value: 'blended', label: 'Blended', description: 'Mix of structured and child-led approaches' },
  { value: 'exploratory', label: 'Exploratory', description: 'Project-based, experiential learning' },
];

const AISTEAR_THEMES = [
  { name: 'Well-being', icon: Heart, color: 'bg-terracotta/10 text-terracotta', borderColor: 'border-terracotta/20' },
  { name: 'Identity & Belonging', icon: Users, color: 'bg-moss/10 text-moss', borderColor: 'border-moss/20' },
  { name: 'Communicating', icon: MessageCircle, color: 'bg-amber/10 text-amber', borderColor: 'border-amber/20' },
  { name: 'Exploring & Thinking', icon: Compass, color: 'bg-sky/10 text-sky', borderColor: 'border-sky/20' },
];

const DEFAULT_CURRICULUM_AREAS: Record<string, { priority: string }> = {
  Language: { priority: 'high' },
  Gaeilge: { priority: 'medium' },
  Mathematics: { priority: 'high' },
  SESE: { priority: 'medium' },
  Arts: { priority: 'medium' },
  PE: { priority: 'medium' },
  SPHE: { priority: 'medium' },
  Wellbeing: { priority: 'low' },
};

const TERMS = ['Term 1 (Sep-Dec)', 'Term 2 (Jan-Mar)', 'Term 3 (Apr-Jun)'];
const GOAL_STATUSES = [
  { value: 'not_started', label: 'Not started', color: 'bg-clay/20 text-clay/50' },
  { value: 'in_progress', label: 'In progress', color: 'bg-amber/15 text-amber' },
  { value: 'achieved', label: 'Achieved', color: 'bg-moss/15 text-moss' },
];

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

function getChildAge(dob: string): number {
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface Props {
  plans: EducationPlan[];
  children: Child[];
  activityLogs: ActivityLog[];
}

export function PlansClient({ plans: initialPlans, children, activityLogs }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0]?.id || null);
  const [showGoalForm, setShowGoalForm] = useState<string | null>(null);
  const [editingAreas, setEditingAreas] = useState<string | null>(null);

  // Form state
  const [formChildId, setFormChildId] = useState(children[0]?.id || '');
  const [formYear, setFormYear] = useState(getAcademicYear());
  const [formApproach, setFormApproach] = useState('blended');
  const [formHours, setFormHours] = useState(4);
  const [formDays, setFormDays] = useState(5);

  // Goal form state
  const [goalText, setGoalText] = useState('');
  const [goalTerm, setGoalTerm] = useState(TERMS[0]);
  const [goalTheme, setGoalTheme] = useState(AISTEAR_THEMES[0].name);
  const [goalArea, setGoalArea] = useState('');

  // Curriculum area editor
  const [editAreaName, setEditAreaName] = useState('');
  const [editAreaPriority, setEditAreaPriority] = useState('medium');
  const [editAreaNotes, setEditAreaNotes] = useState('');

  function resetForm() {
    setFormChildId(children[0]?.id || '');
    setFormYear(getAcademicYear());
    setFormApproach('blended');
    setFormHours(4);
    setFormDays(5);
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  function startEdit(plan: EducationPlan) {
    setFormChildId(plan.child_id);
    setFormYear(plan.academic_year);
    setFormApproach(plan.approach);
    setFormHours(plan.hours_per_day);
    setFormDays(plan.days_per_week);
    setEditingId(plan.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const res = await fetch('/api/educator/plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            approach: formApproach,
            hours_per_day: formHours,
            days_per_week: formDays,
            academic_year: formYear,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to update');
        setPlans((prev) => prev.map((p) => (p.id === editingId ? json.data : p)));
      } else {
        const res = await fetch('/api/educator/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_id: formChildId,
            academic_year: formYear,
            approach: formApproach,
            hours_per_day: formHours,
            days_per_week: formDays,
            curriculum_areas: DEFAULT_CURRICULUM_AREAS,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to create');
        setPlans((prev) => [json.data, ...prev]);
        setExpandedPlan(json.data.id);
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function addGoal(planId: string) {
    if (!goalText.trim() || !goalArea) return;

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const areas = { ...(plan.curriculum_areas || {}) };
    const area = areas[goalArea] || { priority: 'medium' };
    const goals: LearningGoal[] = (area as { goals?: LearningGoal[] }).goals || [];

    const newGoal: LearningGoal = {
      id: crypto.randomUUID(),
      text: goalText.trim(),
      term: goalTerm,
      aistearTheme: goalTheme,
      status: 'not_started',
    };

    areas[goalArea] = { ...area, goals: [...goals, newGoal] };

    setSaving(true);
    try {
      const res = await fetch('/api/educator/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          curriculum_areas: areas,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      setPlans((prev) => prev.map((p) => (p.id === planId ? json.data : p)));
      setGoalText('');
      setShowGoalForm(null);
      router.refresh();
    } catch (err) {
      console.error('Failed to add goal:', err);
    } finally {
      setSaving(false);
    }
  }

  async function updateGoalStatus(planId: string, areaName: string, goalId: string, newStatus: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const areas = { ...(plan.curriculum_areas || {}) };
    const area = areas[areaName];
    if (!area) return;

    const goals: LearningGoal[] = ((area as { goals?: LearningGoal[] }).goals || []).map((g) =>
      g.id === goalId ? { ...g, status: newStatus as LearningGoal['status'] } : g
    );

    areas[areaName] = { ...area, goals };

    try {
      const res = await fetch('/api/educator/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          curriculum_areas: areas,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.data : p)));
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  }

  async function removeGoal(planId: string, areaName: string, goalId: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const areas = { ...(plan.curriculum_areas || {}) };
    const area = areas[areaName];
    if (!area) return;

    const goals: LearningGoal[] = ((area as { goals?: LearningGoal[] }).goals || []).filter(
      (g) => g.id !== goalId
    );

    areas[areaName] = { ...area, goals };

    try {
      const res = await fetch('/api/educator/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          curriculum_areas: areas,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.data : p)));
      }
    } catch (err) {
      console.error('Failed to remove goal:', err);
    }
  }

  async function addCurriculumArea(planId: string) {
    if (!editAreaName.trim()) return;

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const areas = { ...(plan.curriculum_areas || {}) };
    areas[editAreaName.trim()] = {
      priority: editAreaPriority,
      notes: editAreaNotes.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await fetch('/api/educator/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          curriculum_areas: areas,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.data : p)));
        setEditAreaName('');
        setEditAreaNotes('');
        setEditAreaPriority('medium');
        setEditingAreas(null);
      }
    } catch (err) {
      console.error('Failed to add area:', err);
    } finally {
      setSaving(false);
    }
  }

  async function removeCurriculumArea(planId: string, areaName: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const areas = { ...(plan.curriculum_areas || {}) };
    delete areas[areaName];

    try {
      const res = await fetch('/api/educator/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          curriculum_areas: areas,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.data : p)));
      }
    } catch (err) {
      console.error('Failed to remove area:', err);
    }
  }

  function getChildName(plan: EducationPlan): string {
    const child = Array.isArray(plan.children) ? plan.children[0] : plan.children;
    return child?.name || children.find((c) => c.id === plan.child_id)?.name || 'Unknown';
  }

  function getChildDob(plan: EducationPlan): string {
    const child = Array.isArray(plan.children) ? plan.children[0] : plan.children;
    return child?.date_of_birth || children.find((c) => c.id === plan.child_id)?.date_of_birth || '';
  }

  // Calculate coverage stats for a plan
  function getPlanStats(plan: EducationPlan) {
    const areas = plan.curriculum_areas || {};
    const areaNames = Object.keys(areas);
    const relevantLogs = activityLogs.filter((l) => (l.child_ids || []).includes(plan.child_id));
    const coveredAreas = new Set<string>();
    relevantLogs.forEach((log) => {
      (log.curriculum_areas_covered || []).forEach((a) => coveredAreas.add(a));
    });
    const totalHours = Math.round(relevantLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) / 60 * 10) / 10;

    const allGoals: LearningGoal[] = [];
    areaNames.forEach((name) => {
      const areaGoals = (areas[name] as { goals?: LearningGoal[] }).goals || [];
      allGoals.push(...areaGoals);
    });
    const achievedGoals = allGoals.filter((g) => g.status === 'achieved').length;

    return {
      coveredAreas: areaNames.filter((a) => coveredAreas.has(a)).length,
      totalAreas: areaNames.length,
      totalHours,
      totalGoals: allGoals.length,
      achievedGoals,
    };
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div>
        <Link href="/educator" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to educator
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow mb-2">Planning</p>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
              Education <em className="text-moss italic">Plans</em>
            </h1>
            <p className="text-clay mt-2 font-serif text-lg">
              Per-child education plans with learning goals and curriculum tracking.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New plan
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="card-elevated p-6 space-y-5 border-2 border-moss/20">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-light text-ink">
              {editingId ? 'Edit' : 'New'} <em className="text-moss italic">Plan</em>
            </h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-linen transition-colors">
              <X className="h-4 w-4 text-clay/40" />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {!editingId && (
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Child</label>
                <select
                  value={formChildId}
                  onChange={(e) => setFormChildId(e.target.value)}
                  className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Academic Year</label>
              <input
                type="text"
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                placeholder="2025/2026"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-2 block">Approach</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {APPROACHES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setFormApproach(a.value)}
                    className={`rounded-[14px] p-3 text-left transition-all border ${
                      formApproach === a.value
                        ? 'bg-moss/10 border-moss/20'
                        : 'bg-parchment/30 border-stone/30 hover:bg-parchment/50'
                    }`}
                  >
                    <span className="text-sm font-medium text-umber block">{a.label}</span>
                    <span className="text-[10px] text-clay/50 font-serif">{a.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Hours per day</label>
              <input
                type="number"
                min={1}
                max={8}
                step={0.5}
                value={formHours}
                onChange={(e) => setFormHours(parseFloat(e.target.value))}
                className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Days per week</label>
              <input
                type="number"
                min={1}
                max={7}
                value={formDays}
                onChange={(e) => setFormDays(parseInt(e.target.value, 10))}
                className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formChildId}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : editingId ? 'Update plan' : 'Create plan'}
            </button>
          </div>
        </div>
      )}

      {/* Plans list */}
      {plans.length === 0 && !showForm && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-forest/10 bg-parchment/50">
          <div className="text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-clay/20" />
            <p className="font-medium text-clay/40">No education plans yet</p>
            <p className="text-sm text-clay/30 mt-1 font-serif">
              Create a plan for each child to start tracking home education.
            </p>
          </div>
        </div>
      )}

      {plans.map((plan) => {
        const childName = getChildName(plan);
        const childDob = getChildDob(plan);
        const childAge = childDob ? getChildAge(childDob) : null;
        const areas = plan.curriculum_areas || {};
        const areaNames = Object.keys(areas);
        const isExpanded = expandedPlan === plan.id;
        const stats = getPlanStats(plan);

        return (
          <div key={plan.id} className="card-elevated overflow-hidden">
            {/* Header - always visible */}
            <div
              className="p-6 cursor-pointer"
              onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10">
                    <BookOpen className="h-6 w-6 text-amber" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-light text-ink">
                      {childName}&apos;s Plan
                    </h2>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mt-0.5">
                      {plan.academic_year}
                      {childAge !== null ? ` · Age ${childAge}` : ''}
                      {' · '}
                      {plan.approach.replace('_', '-')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(plan); }}
                    className="rounded-xl p-2 hover:bg-linen transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-clay/40" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-clay/30" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-clay/30" />
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid gap-3 sm:grid-cols-4 mt-4">
                <div className="rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-clay/40" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40">Schedule</p>
                  </div>
                  <p className="text-sm font-medium text-umber">{plan.hours_per_day}h/day · {plan.days_per_week} days</p>
                </div>
                <div className="rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-clay/40" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40">Coverage</p>
                  </div>
                  <p className="text-sm font-medium text-umber">{stats.coveredAreas}/{stats.totalAreas} areas active</p>
                </div>
                <div className="rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3.5 w-3.5 text-clay/40" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40">Goals</p>
                  </div>
                  <p className="text-sm font-medium text-umber">
                    {stats.achievedGoals}/{stats.totalGoals} achieved
                  </p>
                </div>
                <div className="rounded-[14px] bg-parchment/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-3.5 w-3.5 text-clay/40" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40">Hours logged</p>
                  </div>
                  <p className="text-sm font-medium text-umber">{stats.totalHours}h</p>
                </div>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-stone/20 p-6 space-y-8">
                {/* Aistear themes linked to this plan */}
                <div>
                  <p className="eyebrow mb-4">Aistear Themes</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {AISTEAR_THEMES.map((theme) => {
                      const ThemeIcon = theme.icon;
                      // Count goals linked to this theme
                      let themeGoals = 0;
                      let themeAchieved = 0;
                      areaNames.forEach((name) => {
                        const areaGoals: LearningGoal[] = (areas[name] as { goals?: LearningGoal[] }).goals || [];
                        areaGoals.forEach((g) => {
                          if (g.aistearTheme === theme.name) {
                            themeGoals++;
                            if (g.status === 'achieved') themeAchieved++;
                          }
                        });
                      });

                      return (
                        <div key={theme.name} className={`rounded-[14px] p-4 border ${theme.borderColor} ${theme.color.split(' ')[0]}`}>
                          <div className="flex items-center gap-3">
                            <ThemeIcon className={`h-5 w-5 ${theme.color.split(' ')[1]}`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink">{theme.name}</p>
                              <p className="text-[10px] text-clay/50">
                                {themeGoals > 0 ? `${themeAchieved}/${themeGoals} goals achieved` : 'No goals linked yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Curriculum areas with goals */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="eyebrow">Curriculum Areas & Goals</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAreas(editingAreas === plan.id ? null : plan.id)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <Plus className="h-3 w-3 mr-1 inline" />
                        Add area
                      </button>
                      <button
                        onClick={() => {
                          setShowGoalForm(showGoalForm === plan.id ? null : plan.id);
                          if (areaNames.length > 0) setGoalArea(areaNames[0]);
                        }}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <Target className="h-3 w-3 mr-1 inline" />
                        Add goal
                      </button>
                    </div>
                  </div>

                  {/* Add curriculum area form */}
                  {editingAreas === plan.id && (
                    <div className="rounded-[14px] bg-parchment/50 p-4 mb-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Subject name</label>
                          <input
                            type="text"
                            value={editAreaName}
                            onChange={(e) => setEditAreaName(e.target.value)}
                            placeholder="e.g., Music"
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Priority</label>
                          <select
                            value={editAreaPriority}
                            onChange={(e) => setEditAreaPriority(e.target.value)}
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Notes</label>
                          <input
                            type="text"
                            value={editAreaNotes}
                            onChange={(e) => setEditAreaNotes(e.target.value)}
                            placeholder="Optional notes"
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingAreas(null)} className="text-xs text-clay/50 hover:text-umber">Cancel</button>
                        <button
                          onClick={() => addCurriculumArea(plan.id)}
                          disabled={saving || !editAreaName.trim()}
                          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add goal form */}
                  {showGoalForm === plan.id && (
                    <div className="rounded-[14px] bg-moss/5 border border-moss/15 p-4 mb-4 space-y-3">
                      <h4 className="text-sm font-semibold text-ink">New Learning Goal</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Goal description</label>
                          <input
                            type="text"
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            placeholder="e.g., Can read short sentences independently"
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Curriculum area</label>
                          <select
                            value={goalArea}
                            onChange={(e) => setGoalArea(e.target.value)}
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          >
                            {areaNames.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Term</label>
                          <select
                            value={goalTerm}
                            onChange={(e) => setGoalTerm(e.target.value)}
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          >
                            {TERMS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1 block">Aistear theme</label>
                          <select
                            value={goalTheme}
                            onChange={(e) => setGoalTheme(e.target.value)}
                            className="w-full rounded-[14px] border border-forest/10 bg-parchment/50 px-3 py-2 text-sm text-umber focus:border-moss focus:outline-none"
                          >
                            {AISTEAR_THEMES.map((t) => (
                              <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowGoalForm(null)} className="text-xs text-clay/50 hover:text-umber">Cancel</button>
                        <button
                          onClick={() => addGoal(plan.id)}
                          disabled={saving || !goalText.trim() || !goalArea}
                          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                        >
                          Add goal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Areas list */}
                  <div className="space-y-4">
                    {areaNames.map((areaName) => {
                      const areaConfig = areas[areaName];
                      const areaGoals: LearningGoal[] = (areaConfig as { goals?: LearningGoal[] }).goals || [];
                      const priorityColor =
                        areaConfig?.priority === 'high'
                          ? 'bg-moss'
                          : areaConfig?.priority === 'medium'
                            ? 'bg-amber'
                            : 'bg-clay/30';

                      return (
                        <div key={areaName} className="rounded-[14px] bg-parchment/30 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${priorityColor}`} />
                              <span className="text-sm font-semibold text-ink">{areaName}</span>
                              <span className="text-[10px] text-clay/40 capitalize">{areaConfig?.priority} priority</span>
                            </div>
                            <button
                              onClick={() => removeCurriculumArea(plan.id, areaName)}
                              className="p-1 rounded hover:bg-linen transition-colors"
                              title="Remove area"
                            >
                              <Trash2 className="h-3 w-3 text-clay/30 hover:text-terracotta" />
                            </button>
                          </div>
                          {areaConfig?.notes && (
                            <p className="text-[11px] text-clay/50 font-serif mb-3">{areaConfig.notes}</p>
                          )}

                          {/* Goals for this area */}
                          {areaGoals.length > 0 ? (
                            <div className="space-y-2">
                              {areaGoals.map((goal) => {
                                const statusConfig = GOAL_STATUSES.find((s) => s.value === goal.status) || GOAL_STATUSES[0];
                                const themeConfig = AISTEAR_THEMES.find((t) => t.name === goal.aistearTheme);

                                return (
                                  <div key={goal.id} className="flex items-center gap-3 rounded-lg bg-parchment/50 p-3">
                                    <button
                                      onClick={() => {
                                        const nextStatus =
                                          goal.status === 'not_started'
                                            ? 'in_progress'
                                            : goal.status === 'in_progress'
                                              ? 'achieved'
                                              : 'not_started';
                                        updateGoalStatus(plan.id, areaName, goal.id, nextStatus);
                                      }}
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                        goal.status === 'achieved'
                                          ? 'border-moss bg-moss text-parchment'
                                          : goal.status === 'in_progress'
                                            ? 'border-amber bg-amber/20'
                                            : 'border-clay/20 hover:border-moss/40'
                                      }`}
                                    >
                                      {goal.status === 'achieved' && <Check className="h-3 w-3" />}
                                      {goal.status === 'in_progress' && <div className="h-2 w-2 rounded-full bg-amber" />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium ${
                                        goal.status === 'achieved' ? 'text-clay/50 line-through' : 'text-umber'
                                      }`}>
                                        {goal.text}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`tag text-[8px] ${statusConfig.color}`}>{statusConfig.label}</span>
                                        <span className="text-[9px] text-clay/30">{goal.term}</span>
                                        {themeConfig && (
                                          <span className={`tag text-[8px] ${themeConfig.color}`}>{themeConfig.name}</span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeGoal(plan.id, areaName, goal.id)}
                                      className="p-1 rounded hover:bg-linen transition-colors"
                                    >
                                      <X className="h-3 w-3 text-clay/30 hover:text-terracotta" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-clay/30 font-serif italic">
                              No learning goals set for this area yet.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Generate report section */}
                <div className="rounded-[14px] bg-parchment/30 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/10">
                      <FileText className="h-5 w-5 text-sky" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-umber">Plan Report</p>
                      <p className="text-[10px] text-clay/50 font-serif">
                        Generate a PDF summary of this education plan, including goals and progress.
                      </p>
                    </div>
                    <Link
                      href="/educator/tusla"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Reports
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
