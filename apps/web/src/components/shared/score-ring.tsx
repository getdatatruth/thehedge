'use client';

import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  subtitle?: string;
}

export function ScoreRing({
  score,
  maxScore = 1000,
  size = 140,
  label,
  subtitle,
}: ScoreRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min(score / maxScore, 1);

  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const strokeWidth = size * 0.06;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - animatedProgress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-stone)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-cat-nature)"
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Leaf className="h-6 w-6 text-cat-nature mb-0.5" />
          <span className="text-3xl font-bold text-umber tracking-tight leading-none">
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-semibold text-umber">{label}</span>
      )}
      {subtitle && (
        <span className="text-[12px] text-sage">{subtitle}</span>
      )}
    </div>
  );
}
