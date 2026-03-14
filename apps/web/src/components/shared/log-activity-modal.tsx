'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityLogStore } from '@/stores/activity-log';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
} from '@/components/ui/dialog';
import { Star, CheckCircle, Users, Clock, Calendar } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  avatar_url: string | null;
}

interface LogActivityModalProps {
  activityId?: string | null;
  activityTitle?: string;
  defaultDuration?: number;
  children: React.ReactNode;
}

export function LogActivityModal({
  activityId,
  activityTitle,
  defaultDuration,
  children: triggerContent,
}: LogActivityModalProps) {
  const router = useRouter();
  const logActivity = useActivityLogStore((s) => s.logActivity);

  const [open, setOpen] = useState(false);
  const [familyChildren, setFamilyChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<Set<string>>(
    new Set()
  );
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [duration, setDuration] = useState<string>(
    defaultDuration ? String(defaultDuration) : ''
  );
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const fetchChildren = useCallback(async () => {
    setChildrenLoading(true);
    try {
      const res = await fetch('/api/children');
      if (res.ok) {
        const { data } = await res.json();
        setFamilyChildren(data || []);
        // Auto-select all children
        if (data && data.length > 0) {
          setSelectedChildIds(new Set(data.map((c: Child) => c.id)));
        }
      }
    } catch {
      // Silently fail - children selection is optional
    } finally {
      setChildrenLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchChildren();
      // Reset form state
      setDate(new Date().toISOString().split('T')[0]);
      setDuration(defaultDuration ? String(defaultDuration) : '');
      setNotes('');
      setRating(null);
      setError(null);
      setSuccess(false);
    }
  }, [open, defaultDuration, fetchChildren]);

  function toggleChild(childId: string) {
    setSelectedChildIds((prev) => {
      const next = new Set(prev);
      if (next.has(childId)) {
        next.delete(childId);
      } else {
        next.add(childId);
      }
      return next;
    });
  }

  function getChildAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const log = await logActivity({
      activity_id: activityId || null,
      child_ids: Array.from(selectedChildIds),
      date,
      duration_minutes: duration ? parseInt(duration, 10) : null,
      notes: notes || null,
      rating,
    });

    setLoading(false);

    if (log) {
      setSuccess(true);
      router.refresh();
    } else {
      const storeError = useActivityLogStore.getState().error;
      setError(storeError || 'Something went wrong');
    }
  }

  const displayRating = hoverRating ?? rating;
  const title = activityTitle || 'an activity';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />}>{triggerContent}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-linen border-stone">
        {success ? (
          <div className="text-center space-y-5 py-6 animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[14px] bg-gradient-to-br from-forest to-moss shadow-lg">
              <CheckCircle className="h-8 w-8 text-parchment" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-center text-2xl font-light text-ink">
                Logged!
              </DialogTitle>
              <DialogDescription className="text-center text-clay/60 font-serif">
                &quot;{title}&quot; has been added to your family timeline.
              </DialogDescription>
            </DialogHeader>
            <DialogClose>
              <button className="btn-primary">Grand</button>
            </DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-light text-ink">
                We did <em className="text-moss italic">this</em>!
              </DialogTitle>
              <DialogDescription className="text-clay/60 font-serif">
                Log &quot;{title}&quot; to your family timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Children selection */}
              <div className="space-y-2.5">
                <Label className="text-umber text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-clay/40" />
                  Which children?
                </Label>
                {childrenLoading ? (
                  <div className="flex gap-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-24 rounded-[4px] bg-stone/30 animate-pulse"
                      />
                    ))}
                  </div>
                ) : familyChildren.length === 0 ? (
                  <p className="text-xs text-clay/40 italic font-serif">
                    No children in your family profile yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {familyChildren.map((child) => {
                      const isSelected = selectedChildIds.has(child.id);
                      return (
                        <div
                          key={child.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleChild(child.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleChild(child.id); } }}
                          className={`flex items-center gap-2 rounded-[4px] border px-3 py-2 text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'border-moss bg-moss/8 text-forest font-medium'
                              : 'border-stone bg-parchment/30 text-clay hover:border-moss/40'
                          }`}
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                              isSelected
                                ? 'bg-moss text-parchment'
                                : 'bg-stone/50 text-clay'
                            }`}
                          >
                            {getInitial(child.name)}
                          </div>
                          <span>{child.name}</span>
                          <span className="text-[10px] text-clay/40">
                            {getChildAge(child.date_of_birth)}y
                          </span>
                          <div className={`ml-1 flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'border-moss bg-moss text-white' : 'border-stone'}`}>
                            {isSelected && <CheckCircle className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date and Duration row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="log-date"
                    className="text-umber text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5"
                  >
                    <Calendar className="h-3 w-3 text-clay/40" />
                    Date
                  </Label>
                  <Input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-[4px] border-stone bg-parchment/30 shadow-sm text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="log-duration"
                    className="text-umber text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5"
                  >
                    <Clock className="h-3 w-3 text-clay/40" />
                    Duration (min)
                  </Label>
                  <Input
                    id="log-duration"
                    type="number"
                    min={1}
                    max={480}
                    placeholder={defaultDuration ? String(defaultDuration) : 'e.g. 30'}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="rounded-[4px] border-stone bg-parchment/30 shadow-sm text-sm"
                  />
                </div>
              </div>

              {/* Star rating */}
              <div className="space-y-2">
                <Label className="text-umber text-[9px] font-bold uppercase tracking-[0.2em]">
                  How was it? (optional)
                </Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(rating === star ? null : star)
                      }
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-all hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          displayRating && star <= displayRating
                            ? 'fill-amber text-amber drop-shadow-sm'
                            : 'text-stone hover:text-amber/40'
                        }`}
                      />
                    </button>
                  ))}
                  {rating && (
                    <span className="ml-2 text-xs text-clay/50 self-center font-serif italic">
                      {rating === 1
                        ? 'Not great'
                        : rating === 2
                          ? 'Okay'
                          : rating === 3
                            ? 'Good'
                            : rating === 4
                              ? 'Great!'
                              : 'Loved it!'}
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label
                  htmlFor="log-notes"
                  className="text-umber text-[9px] font-bold uppercase tracking-[0.2em]"
                >
                  Notes (optional)
                </Label>
                <Textarea
                  id="log-notes"
                  placeholder="How did it go? Any funny moments or observations?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="rounded-[4px] border-stone bg-parchment/30 shadow-sm resize-none text-sm"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-terracotta bg-terracotta/5 rounded-[4px] px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full justify-center h-11 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Log activity'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
