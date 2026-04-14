'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { School, Home, HelpCircle } from 'lucide-react';

const LEARNING_PATHS = [
  {
    id: 'mainstream',
    label: 'Our kids go to school',
    description: 'We want great activities for evenings, weekends, and holidays',
    Icon: School,
  },
  {
    id: 'homeschool',
    label: 'We homeschool',
    description: 'We need a full learning system with curriculum support and planning',
    Icon: Home,
  },
  {
    id: 'considering',
    label: "We're thinking about it",
    description: "Exploring homeschooling but haven't committed yet - show us what's possible",
    Icon: HelpCircle,
  },
];

export function StepLearningPath() {
  const learningPath = useOnboardingStore((s) => s.learningPath);
  const updateField = useOnboardingStore((s) => s.updateField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">How does your family learn?</h2>
        <p className="text-sm text-clay mt-1">
          This shapes your entire experience - you can always change it later.
        </p>
      </div>

      <div className="space-y-3">
        {LEARNING_PATHS.map(({ id, label, description, Icon }) => (
          <button
            key={id}
            onClick={() => updateField('learningPath', id)}
            className={`w-full text-left rounded-2xl p-4 transition-all flex items-start gap-4 ${
              learningPath === id
                ? 'bg-cat-nature/10 border-2 border-cat-nature'
                : 'bg-parchment border-2 border-transparent hover:border-stone'
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              learningPath === id ? 'bg-cat-nature/20' : 'bg-stone/20'
            }`}>
              <Icon className={`h-5 w-5 ${learningPath === id ? 'text-cat-nature' : 'text-clay'}`} />
            </div>
            <div>
              <p className={`font-semibold ${learningPath === id ? 'text-ink' : 'text-umber'}`}>{label}</p>
              <p className="text-sm text-clay mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevStep} className="btn-secondary flex-1">Back</button>
        <button
          onClick={nextStep}
          disabled={!learningPath}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
