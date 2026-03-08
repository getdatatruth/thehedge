'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import type { FamilyStyle } from '@/types/database';
import { Trees, Palette, Lightbulb, BookOpen, Scale } from 'lucide-react';

const STYLES: {
  value: FamilyStyle;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'active',
    label: 'Active & Outdoors',
    description: 'Always on the move — walks, sports, adventure.',
    icon: Trees,
  },
  {
    value: 'creative',
    label: 'Creative & Crafty',
    description: 'Art, building, making — mess is welcome.',
    icon: Palette,
  },
  {
    value: 'curious',
    label: 'Curious & Sciencey',
    description: 'Experiments, questions, figuring things out.',
    icon: Lightbulb,
  },
  {
    value: 'bookish',
    label: 'Bookish & Calm',
    description: 'Reading, stories, quiet time together.',
    icon: BookOpen,
  },
  {
    value: 'balanced',
    label: 'A bit of everything',
    description: 'Mix it up — variety is grand.',
    icon: Scale,
  },
];

export function StepFamilyStyle() {
  const { familyStyle, updateField, nextStep, prevStep } =
    useOnboardingStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-green-800">
          What&apos;s your family style?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us suggest the right activities. You can change this later.
        </p>
      </div>

      <div className="grid gap-3">
        {STYLES.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateField('familyStyle', value)}
            className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
              familyStyle === value
                ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                : 'border-stone-200 hover:border-green-300 hover:bg-stone-50'
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                familyStyle === value
                  ? 'bg-green-100 text-green-700'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
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
