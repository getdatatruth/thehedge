'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  CheckCircle,
  Plus,
  X,
  Printer,
  CalendarOff,
  Trash2,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface Block {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  notes?: string;
  completed: boolean;
  outcome_ids?: string[];
}

interface DailyPlan {
  id: string;
  child_id: string;
  date: string;
  blocks: Block[];
  status: string;
  attendance_logged: boolean;
}

interface EducationPlan {
  id: string;
  child_id: string;
  curriculum_areas: Record<string, { priority: string }> | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const SUBJECT_COLORS: Record<string, string> = {
  Language: 'bg-moss/10 border-moss/20 text-moss',
  Gaeilge: 'bg-moss/10 border-moss/20 text-moss',
  Mathematics: 'bg-amber/10 border-amber/20 text-amber',
  SESE: 'bg-sky/10 border-sky/20 text-sky',
  'Science & Geography': 'bg-sky/10 border-sky/20 text-sky',
  Arts: 'bg-terracotta/10 border-terracotta/20 text-terracotta',
  'Arts Education': 'bg-terracotta/10 border-terracotta/20 text-terracotta',
  PE: 'bg-terracotta/10 border-terracotta/20 text-terracotta',
  'Physical Education': 'bg-terracotta/10 border-terracotta/20 text-terracotta',
  SPHE: 'bg-moss/10 border-moss/20 text-moss',
  Wellbeing: 'bg-moss/10 border-moss/20 text-moss',
  'Well-being': 'bg-moss/10 border-moss/20 text-moss',
  'Life Skills': 'bg-amber/10 border-amber/20 text-amber',
  Break: 'bg-linen border-stone/20 text-clay/40',
  Holiday: 'bg-linen border-stone/20 text-clay/30',
};

const DEFAULT_SUBJECTS = [
  'Language',
  'Gaeilge',
  'Mathematics',
  'SESE',
  'Arts',
  'PE',
  'SPHE',
  'Wellbeing',
  'Life Skills',
  'Break',
];

const DEFAULT_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
];

interface Props {
  children: Child[];
  dailyPlans: DailyPlan[];
  weekDates: string[];
  educationPlans: EducationPlan[];
}

export function ScheduleClient({
  children,
  dailyPlans: initialPlans,
  weekDates: initialWeekDates,
  educationPlans,
}: Props) {
  const [dailyPlans, setDailyPlans] = useState(initialPlans);
  const [weekDates] = useState(initialWeekDates);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const idx = initialWeekDates.indexOf(today);
    return idx >= 0 ? idx : 0;
  });
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [togglingBlock, setTogglingBlock] = useState<string | null>(null);
  const [togglingAttendance, setTogglingAttendance] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [saving, setSaving] = useState(false);

  // New block form state
  const [newBlockTime, setNewBlockTime] = useState('09:00');
  const [newBlockSubject, setNewBlockSubject] = useState('Language');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockDuration, setNewBlockDuration] = useState(30);
  const [newBlockNotes, setNewBlockNotes] = useState('');

  const selectedDate = weekDates[selectedDay] || '';
  const dayPlan = dailyPlans.find(
    (dp) => dp.date === selectedDate && dp.child_id === selectedChild
  );
  const blocks = dayPlan?.blocks || [];

  const totalMinutes = blocks.reduce((sum, b) => sum + b.duration, 0);
  const completedMinutes = blocks.filter((b) => b.completed).reduce((sum, b) => sum + b.duration, 0);

  const isHoliday = dayPlan?.status === 'skipped';

  const child = children.find((c) => c.id === selectedChild);

  // Get curriculum areas from education plan
  const childPlan = educationPlans.find((p) => p.child_id === selectedChild);
  const planSubjects = childPlan?.curriculum_areas
    ? Object.keys(childPlan.curriculum_areas)
    : DEFAULT_SUBJECTS;

  const allSubjects = [...new Set([...planSubjects, ...DEFAULT_SUBJECTS])];

  async function toggleBlock(blockIndex: number) {
    if (!dayPlan) return;
    const blockId = `${dayPlan.id}-${blockIndex}`;
    setTogglingBlock(blockId);

    try {
      const res = await fetch('/api/educator/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dayPlan.id,
          blockIndex,
          blockUpdates: { completed: !blocks[blockIndex].completed },
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setDailyPlans((prev) =>
          prev.map((dp) => (dp.id === dayPlan.id ? json.data : dp))
        );
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
    } finally {
      setTogglingBlock(null);
    }
  }

  async function toggleAttendance() {
    if (!dayPlan) return;
    setTogglingAttendance(true);

    try {
      const res = await fetch('/api/educator/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: dayPlan.id,
          attendance_logged: !dayPlan.attendance_logged,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setDailyPlans((prev) =>
          prev.map((dp) => (dp.id === dayPlan.id ? { ...dp, attendance_logged: json.data.attendance_logged } : dp))
        );
      }
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
    } finally {
      setTogglingAttendance(false);
    }
  }

  async function addBlock() {
    if (!newBlockTitle.trim() && newBlockSubject !== 'Break') return;

    setSaving(true);

    const newBlock: Block = {
      time: newBlockTime,
      subject: newBlockSubject,
      title: newBlockTitle.trim() || newBlockSubject,
      duration: newBlockDuration,
      notes: newBlockNotes.trim() || undefined,
      completed: false,
    };

    const updatedBlocks = [...blocks, newBlock].sort((a, b) => a.time.localeCompare(b.time));

    try {
      const res = await fetch('/api/educator/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild,
          date: selectedDate,
          blocks: updatedBlocks,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setDailyPlans((prev) => {
          const existing = prev.find(
            (dp) => dp.date === selectedDate && dp.child_id === selectedChild
          );
          if (existing) {
            return prev.map((dp) =>
              dp.id === existing.id ? json.data : dp
            );
          }
          return [...prev, json.data];
        });

        // Reset form
        setNewBlockTitle('');
        setNewBlockNotes('');
        setShowAddBlock(false);
      }
    } catch (err) {
      console.error('Failed to add block:', err);
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(blockIndex: number) {
    if (!dayPlan) return;

    const updatedBlocks = blocks.filter((_, i) => i !== blockIndex);

    try {
      const res = await fetch('/api/educator/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dayPlan.id,
          blocks: updatedBlocks,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setDailyPlans((prev) =>
          prev.map((dp) => (dp.id === dayPlan.id ? json.data : dp))
        );
      }
    } catch (err) {
      console.error('Failed to remove block:', err);
    }
  }

  async function toggleHoliday() {
    if (!dayPlan && !selectedDate) return;

    setSaving(true);

    try {
      if (dayPlan) {
        // Toggle status between planned and skipped
        const newStatus = dayPlan.status === 'skipped' ? 'planned' : 'skipped';
        const res = await fetch('/api/educator/schedule', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: dayPlan.id,
            status: newStatus,
          }),
        });

        const json = await res.json();
        if (res.ok && json.data) {
          setDailyPlans((prev) =>
            prev.map((dp) => (dp.id === dayPlan.id ? json.data : dp))
          );
        }
      } else {
        // Create a new plan marked as holiday
        const res = await fetch('/api/educator/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_id: selectedChild,
            date: selectedDate,
            blocks: [{ time: '09:00', subject: 'Holiday', title: 'Holiday / Break', duration: 0, completed: false }],
          }),
        });

        const json = await res.json();
        if (res.ok && json.data) {
          // Now mark it as skipped
          const res2 = await fetch('/api/educator/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: json.data.id,
              status: 'skipped',
            }),
          });
          const json2 = await res2.json();
          if (res2.ok && json2.data) {
            setDailyPlans((prev) => [...prev, json2.data]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle holiday:', err);
    } finally {
      setSaving(false);
    }
  }

  const handlePrint = useCallback(() => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 300);
  }, []);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
  }

  function formatDateFull(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Print view
  if (showPrintView) {
    return (
      <div className="p-8 bg-white text-black print:p-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <p className="text-gray-600">
            {child?.name} - Week of {formatDate(weekDates[0])} to {formatDate(weekDates[4])}
          </p>
        </div>

        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 w-20">Time</th>
              {DAYS.map((day, i) => (
                <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                  {day} {formatDate(weekDates[i])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEFAULT_TIMES.map((time) => (
              <tr key={time}>
                <td className="border border-gray-300 p-2 font-mono text-xs">{time}</td>
                {weekDates.map((date) => {
                  const plan = dailyPlans.find(
                    (dp) => dp.date === date && dp.child_id === selectedChild
                  );
                  const block = plan?.blocks?.find((b) => b.time === time);
                  const planIsHoliday = plan?.status === 'skipped';

                  return (
                    <td
                      key={date}
                      className={`border border-gray-300 p-2 text-xs ${
                        planIsHoliday ? 'bg-gray-50 text-gray-400' : ''
                      }`}
                    >
                      {planIsHoliday ? (
                        <span className="italic">Holiday</span>
                      ) : block ? (
                        <div>
                          <span className="font-semibold">{block.subject}</span>
                          {block.title !== block.subject && (
                            <span className="block text-gray-500">{block.title}</span>
                          )}
                          <span className="block text-gray-400">{block.duration}m</span>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-xs text-gray-500 flex justify-between">
          <span>Generated by The Hedge - thehedge.ie</span>
          <span>{new Date().toLocaleDateString('en-IE')}</span>
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
          <div>
            <p className="eyebrow mb-2">Daily Planner</p>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
              Weekly <em className="text-moss italic">Schedule</em>
            </h1>
            <p className="text-clay mt-2 text-lg">
              {child ? `Daily schedule for ${child.name}.` : 'No children found.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Child selector (if multiple) */}
      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                selectedChild === c.id
                  ? 'bg-forest text-parchment shadow-sm'
                  : 'bg-linen text-clay/50 hover:bg-parchment'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Day selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
          className="p-2 rounded-lg hover:bg-linen transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-clay/40" />
        </button>
        <div className="flex gap-1 flex-1 justify-center">
          {DAYS.map((day, i) => {
            const datePlan = dailyPlans.find(
              (dp) => dp.date === weekDates[i] && dp.child_id === selectedChild
            );
            const dateIsHoliday = datePlan?.status === 'skipped';

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-all relative ${
                  selectedDay === i
                    ? 'bg-forest text-parchment shadow-sm'
                    : dateIsHoliday
                      ? 'text-clay/30 bg-linen/50 line-through'
                      : 'text-clay/50 hover:bg-linen'
                }`}
              >
                <span>{day}</span>
                {weekDates[i] && (
                  <span className="block text-[10px] font-normal opacity-70">
                    {formatDate(weekDates[i])}
                  </span>
                )}
                {datePlan?.attendance_logged && selectedDay !== i && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-moss" />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSelectedDay(Math.min(4, selectedDay + 1))}
          className="p-2 rounded-lg hover:bg-linen transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-clay/40" />
        </button>
      </div>

      {/* Holiday / Attendance row */}
      <div className="flex items-center gap-3">
        {/* Attendance toggle */}
        {dayPlan && !isHoliday && (
          <div className="card-elevated p-4 flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <CheckCircle className={`h-5 w-5 ${dayPlan.attendance_logged ? 'text-moss' : 'text-clay/30'}`} />
              <div>
                <p className="text-sm font-medium text-umber">Attendance</p>
                <p className="text-xs text-clay/50">
                  {dayPlan.attendance_logged ? 'Logged for today' : 'Not logged yet'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAttendance}
              disabled={togglingAttendance}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                dayPlan.attendance_logged
                  ? 'bg-moss/10 text-moss'
                  : 'bg-linen text-clay/50 hover:bg-parchment'
              }`}
            >
              {togglingAttendance ? 'Saving...' : dayPlan.attendance_logged ? 'Attended' : 'Mark attended'}
            </button>
          </div>
        )}

        {/* Holiday toggle */}
        <button
          onClick={toggleHoliday}
          disabled={saving}
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 shrink-0 ${
            isHoliday
              ? 'bg-amber/10 text-amber border border-amber/20'
              : 'bg-linen text-clay/50 hover:bg-parchment border border-stone'
          }`}
        >
          <CalendarOff className="h-4 w-4" />
          {isHoliday ? 'Holiday (click to remove)' : 'Mark as holiday'}
        </button>
      </div>

      {/* Holiday notice */}
      {isHoliday && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber/8 border border-amber/15 px-5 py-4">
          <CalendarOff className="h-5 w-5 text-amber shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber">Holiday / Break</p>
            <p className="text-xs text-clay/60">
              {formatDateFull(selectedDate)} is marked as a holiday. No lessons are scheduled.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {dayPlan && !isHoliday && blocks.length > 0 && (
        <div className="card-elevated p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Today&apos;s progress</span>
              <span className="text-xs font-semibold text-ink">
                {completedMinutes}/{totalMinutes} min
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-linen">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest to-moss transition-all"
                style={{ width: `${totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Schedule blocks */}
      {!isHoliday && blocks.length > 0 && (
        <div className="space-y-2">
          {blocks.map((block, index) => {
            const colorClass = SUBJECT_COLORS[block.subject] || 'bg-linen border-stone/20 text-clay/40';
            const blockId = dayPlan ? `${dayPlan.id}-${index}` : '';
            return (
              <div
                key={index}
                className={`rounded-2xl border p-4 transition-all ${
                  block.completed ? 'opacity-60' : ''
                } ${colorClass.split(' ').filter((c: string) => c.startsWith('border-')).join(' ')} bg-linen`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleBlock(index)}
                    disabled={togglingBlock === blockId}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      block.completed
                        ? 'border-moss bg-moss text-parchment'
                        : 'border-forest/15 hover:border-moss/40'
                    }`}
                  >
                    {block.completed && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`tag ${colorClass}`}>
                        {block.subject}
                      </span>
                      <span className="text-[11px] text-clay/40 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {block.time} · {block.duration}m
                      </span>
                    </div>
                    {block.title && block.title !== block.subject && (
                      <Link
                        href={block.activity_id ? `/activity/${block.activity_id}` : '#'}
                        className={`text-sm font-medium hover:text-moss transition-colors ${
                          block.completed ? 'text-clay/50 line-through' : 'text-umber'
                        }`}
                      >
                        {block.title}
                      </Link>
                    )}
                    {block.notes && (
                      <p className="text-[11px] text-clay/40 mt-1">{block.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlock(index)}
                    className="p-1.5 rounded-lg hover:bg-parchment transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove block"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-clay/30 hover:text-terracotta" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add block button / form */}
      {!isHoliday && (
        <>
          {!showAddBlock ? (
            <button
              onClick={() => setShowAddBlock(true)}
              className="w-full rounded-2xl border-2 border-dashed border-forest/10 p-4 text-sm font-medium text-clay/40 hover:text-moss hover:border-moss/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add a time block
            </button>
          ) : (
            <div className="card-elevated p-6 space-y-4 border-2 border-moss/20">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-light text-ink">
                  New <em className="text-moss italic">Block</em>
                </h3>
                <button
                  onClick={() => setShowAddBlock(false)}
                  className="p-2 rounded-lg hover:bg-linen transition-colors"
                >
                  <X className="h-4 w-4 text-clay/40" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Time</label>
                  <select
                    value={newBlockTime}
                    onChange={(e) => setNewBlockTime(e.target.value)}
                    className="w-full rounded-2xl border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                  >
                    {DEFAULT_TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Subject</label>
                  <select
                    value={newBlockSubject}
                    onChange={(e) => setNewBlockSubject(e.target.value)}
                    className="w-full rounded-2xl border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                  >
                    {allSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Activity title</label>
                  <input
                    type="text"
                    value={newBlockTitle}
                    onChange={(e) => setNewBlockTitle(e.target.value)}
                    className="w-full rounded-2xl border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                    placeholder={newBlockSubject === 'Break' ? 'Break' : 'e.g., Nature walk journaling'}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={newBlockDuration}
                    onChange={(e) => setNewBlockDuration(parseInt(e.target.value, 10))}
                    className="w-full rounded-2xl border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/60 mb-1.5 block">Notes (optional)</label>
                <input
                  type="text"
                  value={newBlockNotes}
                  onChange={(e) => setNewBlockNotes(e.target.value)}
                  className="w-full rounded-2xl border border-forest/10 bg-parchment/50 px-4 py-2.5 text-sm text-umber focus:border-moss focus:outline-none"
                  placeholder="Any notes about this block..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddBlock(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={addBlock}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {saving ? 'Adding...' : 'Add block'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state for no blocks and no holiday */}
      {!isHoliday && blocks.length === 0 && !showAddBlock && (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-forest/10 bg-parchment/50">
          <div className="text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-clay/20" />
            <p className="font-medium text-clay/40">No schedule for {formatDateFull(selectedDate)}</p>
            <p className="text-sm text-clay/30 mt-1">
              Add time blocks above or mark as a holiday.
            </p>
          </div>
        </div>
      )}

      {/* Weekly overview */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-light text-ink mb-4">
          Week <em className="text-moss italic">Overview</em>
        </h2>
        <div className="grid gap-2 sm:grid-cols-5">
          {weekDates.map((date, i) => {
            const plan = dailyPlans.find(
              (dp) => dp.date === date && dp.child_id === selectedChild
            );
            const dayBlocks = plan?.blocks || [];
            const done = dayBlocks.filter((b) => b.completed).length;
            const total = dayBlocks.length;
            const dateIsHoliday = plan?.status === 'skipped';

            return (
              <button
                key={date}
                onClick={() => setSelectedDay(i)}
                className={`rounded-2xl p-3 text-left transition-all ${
                  selectedDay === i
                    ? 'bg-moss/10 border border-moss/20'
                    : dateIsHoliday
                      ? 'bg-amber/5 border border-amber/10'
                      : 'bg-parchment/30 hover:bg-parchment/50'
                }`}
              >
                <p className="text-xs font-bold text-clay/50">{DAYS[i]}</p>
                <p className="text-[10px] text-clay/30 mb-2">{formatDate(date)}</p>
                {dateIsHoliday ? (
                  <p className="text-[10px] text-amber italic">Holiday</p>
                ) : plan ? (
                  <>
                    <p className="text-sm font-medium text-umber">{done}/{total}</p>
                    <div className="h-1 rounded-full bg-linen mt-1">
                      <div
                        className="h-full rounded-full bg-moss"
                        style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                      />
                    </div>
                    {plan.attendance_logged && (
                      <span className="text-[9px] text-moss mt-1 block">Attended</span>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] text-clay/30">No plan</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timetable grid view */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-light text-ink mb-4">
          Timetable <em className="text-moss italic">Grid</em>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 w-16">Time</th>
                {DAYS.map((day, i) => {
                  const plan = dailyPlans.find(
                    (dp) => dp.date === weekDates[i] && dp.child_id === selectedChild
                  );
                  const dateIsHoliday = plan?.status === 'skipped';
                  return (
                    <th
                      key={day}
                      className={`p-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] ${
                        dateIsHoliday ? 'text-amber/50' : 'text-clay/40'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {DEFAULT_TIMES.slice(0, 10).map((time) => (
                <tr key={time}>
                  <td className="p-2 text-[11px] text-clay/40 font-mono border-t border-stone/10">{time}</td>
                  {weekDates.map((date) => {
                    const plan = dailyPlans.find(
                      (dp) => dp.date === date && dp.child_id === selectedChild
                    );
                    const block = plan?.blocks?.find((b) => b.time === time);
                    const dateIsHoliday = plan?.status === 'skipped';
                    const colorClass = block ? (SUBJECT_COLORS[block.subject] || 'bg-linen text-clay/40') : '';

                    return (
                      <td key={date} className="p-1 border-t border-stone/10">
                        {dateIsHoliday ? (
                          <div className="rounded-lg bg-amber/5 p-1.5 text-center">
                            <span className="text-[10px] text-amber/40 italic">Holiday</span>
                          </div>
                        ) : block ? (
                          <div className={`rounded-lg p-1.5 ${colorClass.split(' ')[0]}`}>
                            <span className={`text-[10px] font-medium ${colorClass.split(' ').slice(2).join(' ') || 'text-clay/60'}`}>
                              {block.subject}
                            </span>
                            {block.completed && (
                              <Check className="h-2.5 w-2.5 text-moss inline ml-1" />
                            )}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
