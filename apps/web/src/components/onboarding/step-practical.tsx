'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export function StepPractical() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    hasOutdoorSpace,
    carActivities,
    messComfort,
    updateField,
    prevStep,
    nextStep,
    familyName,
    country,
    county,
    children,
    learningPath,
    familyInterests,
    familyStyle,
    ideaTimes,
    weekendPlanning,
    holidayPlanning,
  } = useOnboardingStore();

  async function handleComplete() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName,
          country,
          county,
          children: children.map(c => ({
            ...c,
            interests: familyInterests,
          })),
          learningPath,
          familyStyle,
          ideaTimes,
          weekendPlanning,
          holidayPlanning,
          hasOutdoorSpace,
          carActivities,
          messComfort,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Move to completion step
      nextStep();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          Nearly there! A few practical bits.
        </h2>
        <p className="text-sm text-clay mt-1">
          So we suggest activities that actually work for you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-stone p-4">
          <Checkbox
            id="outdoor"
            checked={hasOutdoorSpace}
            onCheckedChange={(checked) =>
              updateField('hasOutdoorSpace', checked === true)
            }
          />
          <Label htmlFor="outdoor" className="text-umber">
            We have outdoor space (garden, yard, balcony)
          </Label>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-stone p-4">
          <Checkbox
            id="car"
            checked={carActivities}
            onCheckedChange={(checked) =>
              updateField('carActivities', checked === true)
            }
          />
          <Label htmlFor="car" className="text-umber">
            We spend time in the car (include car-friendly ideas)
          </Label>
        </div>

        <div className="space-y-2">
          <Label className="text-umber">How do you feel about mess?</Label>
          <Select
            value={messComfort}
            onValueChange={(v) =>
              updateField('messComfort', v as 'none' | 'low' | 'medium' | 'high')
            }
          >
            <SelectTrigger className="border-stone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keep it clean, please</SelectItem>
              <SelectItem value="low">A small bit is fine</SelectItem>
              <SelectItem value="medium">
                Sure, a bit of mess is grand
              </SelectItem>
              <SelectItem value="high">
                Go wild - the messier the better
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rust">{error}</p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep} className="text-clay" disabled={loading}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your family...
            </>
          ) : (
            'Start exploring'
          )}
        </Button>
      </div>
    </div>
  );
}
