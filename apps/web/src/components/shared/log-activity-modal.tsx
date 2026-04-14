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
import { Star, CheckCircle, Users, Clock, Calendar, BookOpen, Camera, X } from 'lucide-react';

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
  const [diaryEntry, setDiaryEntry] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [saveToPortfolio, setSaveToPortfolio] = useState(false);
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
      setDiaryEntry('');
      setPhotos([]);
      setPhotoUrls([]);
      setSaveToPortfolio(false);
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-moss shadow-lg">
              <CheckCircle className="h-8 w-8 text-parchment" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-center text-2xl font-light text-ink">
                Logged!
              </DialogTitle>
              <DialogDescription className="text-center text-clay/60">
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
              <DialogDescription className="text-clay/60">
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
                        className="h-10 w-24 rounded-2xl bg-stone/30 animate-pulse"
                      />
                    ))}
                  </div>
                ) : familyChildren.length === 0 ? (
                  <p className="text-xs text-clay/40 italic">
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
                          className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-all cursor-pointer ${
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
                    className="rounded-2xl border-stone bg-parchment/30 shadow-sm text-sm"
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
                    className="rounded-2xl border-stone bg-parchment/30 shadow-sm text-sm"
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
                    <span className="ml-2 text-xs text-clay/50 self-center italic">
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
                  className="rounded-2xl border-stone bg-parchment/30 shadow-sm resize-none text-sm"
                />
              </div>

              {/* Diary entry (for portfolio) */}
              <div className="space-y-2">
                <Label
                  htmlFor="log-diary"
                  className="text-umber text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5"
                >
                  <BookOpen className="h-3 w-3 text-clay/40" />
                  Diary entry (optional)
                </Label>
                <Textarea
                  id="log-diary"
                  placeholder="What did they learn? Any breakthrough moments? This can be added to their portfolio."
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  rows={3}
                  className="rounded-2xl border-stone bg-parchment/30 shadow-sm resize-none text-sm"
                />
              </div>

              {/* Photo upload */}
              <div className="space-y-2">
                <Label className="text-umber text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Camera className="h-3 w-3 text-clay/40" />
                  Photos (optional)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden bg-stone/20">
                      <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = [...photos];
                          const newUrls = [...photoUrls];
                          URL.revokeObjectURL(newUrls[i]);
                          newPhotos.splice(i, 1);
                          newUrls.splice(i, 1);
                          setPhotos(newPhotos);
                          setPhotoUrls(newUrls);
                        }}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-stone/40 hover:border-cat-nature/40 transition-colors">
                      <Camera className="h-5 w-5 text-stone" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && photos.length < 5) {
                            setPhotos([...photos, file]);
                            setPhotoUrls([...photoUrls, URL.createObjectURL(file)]);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                {photos.length > 0 && (
                  <p className="text-[10px] text-clay">{photos.length}/5 photos</p>
                )}
              </div>

              {/* Save to portfolio toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-umber">Save to portfolio</p>
                  <p className="text-[11px] text-clay">Include diary entry and photos in learning portfolio</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveToPortfolio(!saveToPortfolio)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    saveToPortfolio ? 'bg-cat-nature' : 'bg-stone/40'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      saveToPortfolio ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-terracotta bg-terracotta/5 rounded-2xl px-3 py-2">
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
