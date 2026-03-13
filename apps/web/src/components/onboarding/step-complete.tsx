'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { TreePine, Sparkles, ArrowRight } from 'lucide-react';

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ['bg-forest', 'bg-moss', 'bg-sage', 'bg-terracotta', 'bg-gold', 'bg-sky', 'bg-berry'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 8 + 4;
  const rotation = Math.random() * 360;

  return (
    <div
      className={`absolute ${color} rounded-sm opacity-0 animate-confetti`}
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

export function StepComplete() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);
  const familyName = useOnboardingStore((s) => s.familyName);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  function handleContinue() {
    // Clear persisted onboarding data
    reset();
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-stone bg-linen p-8 text-center">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 2000}
              left={Math.random() * 100}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 space-y-6">
        {/* Success icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/15">
            <TreePine className="h-8 w-8 text-forest" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl font-bold text-ink">
              You&apos;re all set!
            </h2>
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <p className="text-clay font-serif">
            Welcome to The Hedge, {familyName || 'family'}!
          </p>
        </div>

        <div className="space-y-3 rounded-[14px] bg-parchment/50 p-5 text-left">
          <p className="text-sm font-medium text-forest">Here&apos;s what happens next:</p>
          <ul className="space-y-2 text-sm text-clay font-serif">
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[10px] font-bold text-forest">1</span>
              We&apos;ll suggest activities matched to your children&apos;s ages and interests
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[10px] font-bold text-forest">2</span>
              Browse ideas by category, or let us pick for you each day
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[10px] font-bold text-forest">3</span>
              Log activities and build your family&apos;s learning story
            </li>
          </ul>
        </div>

        <Button onClick={handleContinue} className="btn-primary w-full">
          Go to your dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
