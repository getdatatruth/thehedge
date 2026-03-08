'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Progress } from '@/components/ui/progress';
import { StepFamilyBasics } from './step-family-basics';
import { StepChildren } from './step-children';
import { StepFamilyStyle } from './step-family-style';
import { StepAvailability } from './step-availability';
import { StepPractical } from './step-practical';

const STEP_LABELS = [
  'Family basics',
  'Your children',
  'Family style',
  'Availability',
  'Practical details',
];

export function OnboardingWizard() {
  const step = useOnboardingStore((s) => s.step);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-800">The Hedge</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where curious families learn
        </p>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Step {step} of {STEP_LABELS.length}
          </span>
          <span>{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={(step / STEP_LABELS.length) * 100} className="h-2" />
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        {step === 1 && <StepFamilyBasics />}
        {step === 2 && <StepChildren />}
        {step === 3 && <StepFamilyStyle />}
        {step === 4 && <StepAvailability />}
        {step === 5 && <StepPractical />}
      </div>
    </div>
  );
}
