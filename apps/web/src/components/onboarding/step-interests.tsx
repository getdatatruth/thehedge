'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { Check } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'nature', label: 'Nature & outdoors', emoji: '🌿' },
  { id: 'art', label: 'Art & creativity', emoji: '🎨' },
  { id: 'building', label: 'Building & making', emoji: '🔨' },
  { id: 'animals', label: 'Animals & wildlife', emoji: '🐾' },
  { id: 'sport', label: 'Sport & movement', emoji: '⚽' },
  { id: 'music', label: 'Music & dance', emoji: '🎵' },
  { id: 'science', label: 'Science & experiments', emoji: '🔬' },
  { id: 'cooking', label: 'Cooking & baking', emoji: '🍳' },
  { id: 'stories', label: 'Stories & reading', emoji: '📚' },
  { id: 'numbers', label: 'Numbers & puzzles', emoji: '🧩' },
  { id: 'sensory', label: 'Sensory play', emoji: '✨' },
  { id: 'imaginative', label: 'Imaginative play', emoji: '🏰' },
];

export function StepInterests() {
  const familyInterests = useOnboardingStore((s) => s.familyInterests);
  const updateField = useOnboardingStore((s) => s.updateField);
  const children = useOnboardingStore((s) => s.children);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);

  function toggleInterest(id: string) {
    const updated = familyInterests.includes(id)
      ? familyInterests.filter(i => i !== id)
      : [...familyInterests, id];
    updateField('familyInterests', updated);
  }

  const childNames = children.filter(c => c.name).map(c => c.name);
  const subtitle = childNames.length > 0
    ? `What do ${childNames.length === 1 ? childNames[0] : childNames.join(' and ')} love? Pick as many as you like.`
    : 'What do your children love? Pick as many as you like.';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">What are they into?</h2>
        <p className="text-sm text-clay mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map(({ id, label, emoji }) => {
          const selected = familyInterests.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? 'bg-cat-nature/10 border-2 border-cat-nature text-ink'
                  : 'bg-parchment border-2 border-transparent text-clay hover:border-stone'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {selected && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cat-nature">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevStep} className="btn-secondary flex-1">Back</button>
        <button
          onClick={nextStep}
          disabled={familyInterests.length === 0}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
