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
        <h2 className="text-xl font-semibold text-green-800">
          When do you need ideas?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          We&apos;ll suggest activities at the right times.
        </p>
      </div>

      <div className="space-y-3">
        {TIME_SLOTS.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => toggleTime(value)}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              ideaTimes.includes(value)
                ? 'border-green-600 bg-green-50'
                : 'border-stone-200 hover:border-green-300'
            }`}
          >
            <Checkbox checked={ideaTimes.includes(value)} />
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-lg border border-stone-200 p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="weekend"
            checked={weekendPlanning}
            onCheckedChange={(checked) =>
              updateField('weekendPlanning', checked === true)
            }
          />
          <Label htmlFor="weekend">
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
          <Label htmlFor="holiday">
            Send me holiday activity plans
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button
          onClick={nextStep}
          className="bg-green-700 hover:bg-green-800"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
