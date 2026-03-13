'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Progress } from '@/components/ui/progress';
import { StepFamilyBasics } from './step-family-basics';
import { StepChildren } from './step-children';
import { StepFamilyStyle } from './step-family-style';
import { StepAvailability } from './step-availability';
import { StepPractical } from './step-practical';
import { StepComplete } from './step-complete';
import { TreePine } from 'lucide-react';

const STEP_LABELS = [
  'Family basics',
  'Your children',
  'Family style',
  'Availability',
  'Practical details',
];

const TOTAL_FORM_STEPS = 5;

export function OnboardingWizard() {
  const step = useOnboardingStore((s) => s.step);

  // Step 6 is the completion screen
  if (step === 6) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <StepComplete />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-up">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TreePine className="h-6 w-6 text-forest" />
          <h1 className="font-display text-3xl font-bold text-ink">The Hedge</h1>
        </div>
        <p className="mt-1 text-sm text-clay font-serif">
          Where curious families learn
        </p>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs text-clay">
          <span>
            Step {step} of {TOTAL_FORM_STEPS}
          </span>
          <span>{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={(step / TOTAL_FORM_STEPS) * 100} className="h-2" />
      </div>

      <div className="rounded-[14px] border border-stone bg-linen p-6">
        {step === 1 && <StepFamilyBasics />}
        {step === 2 && <StepChildren />}
        {step === 3 && <StepFamilyStyle />}
        {step === 4 && <StepAvailability />}
        {step === 5 && <StepPractical />}
      </div>
    </div>
  );
}
