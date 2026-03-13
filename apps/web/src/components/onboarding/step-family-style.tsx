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
        <h2 className="font-display text-xl font-semibold text-ink">
          What&apos;s your family style?
        </h2>
        <p className="text-sm text-clay mt-1 font-serif">
          This helps us suggest the right activities. You can change this later.
        </p>
      </div>

      <div className="grid gap-3">
        {STYLES.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateField('familyStyle', value)}
            className={`flex items-start gap-4 rounded-[14px] border p-4 text-left transition-all ${
              familyStyle === value
                ? 'border-moss bg-forest/5 ring-1 ring-moss'
                : 'border-stone hover:border-moss/50 hover:bg-linen'
            }`}
          >
            <div
              className={`rounded-[14px] p-2 ${
                familyStyle === value
                  ? 'bg-forest/10 text-forest'
                  : 'bg-linen text-clay'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-umber">{label}</p>
              <p className="text-sm text-clay font-serif">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={prevStep} className="text-clay">
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!familyStyle}
          className="btn-primary"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
