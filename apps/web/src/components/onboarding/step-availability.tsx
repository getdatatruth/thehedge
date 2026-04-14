'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', description: 'Before school / early' },
  { value: 'after_school', label: 'After school', description: '3pm–6pm' },
  { value: 'evening', label: 'Evening', description: 'After dinner' },
  { value: 'weekend', label: 'Weekends', description: 'Saturday & Sunday' },
  { value: 'holiday', label: 'School holidays', description: 'Mid-term, summer, etc.' },
];

export function StepAvailability() {
  const {
    ideaTimes,
    weekendPlanning,
    holidayPlanning,
    updateField,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  function toggleTime(value: string) {
    const updated = ideaTimes.includes(value)
      ? ideaTimes.filter((t) => t !== value)
      : [...ideaTimes, value];
    updateField('ideaTimes', updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          When do you need ideas?
        </h2>
        <p className="text-sm text-clay mt-1">
          We&apos;ll suggest activities at the right times.
        </p>
      </div>

      <div className="space-y-3">
        {TIME_SLOTS.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => toggleTime(value)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              ideaTimes.includes(value)
                ? 'border-moss bg-forest/5'
                : 'border-stone hover:border-moss/50'
            }`}
          >
            <Checkbox checked={ideaTimes.includes(value)} />
            <div>
              <p className="font-medium text-umber">{label}</p>
              <p className="text-sm text-clay">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-stone p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="weekend"
            checked={weekendPlanning}
            onCheckedChange={(checked) =>
              updateField('weekendPlanning', checked === true)
            }
          />
          <Label htmlFor="weekend" className="text-umber">
            Send me a weekend plan every Thursday
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="holiday"
            checked={holidayPlanning}
            onCheckedChange={(checked) =>
              updateField('holidayPlanning', checked === true)
            }
          />
          <Label htmlFor="holiday" className="text-umber">
            Send me holiday activity plans
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep} className="text-clay">
          Back
        </Button>
        <Button
          onClick={nextStep}
          className="btn-primary"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
