'use client';

import { X } from 'lucide-react';

interface FilterChipsProps {
  filters: { label: string; value: string }[];
  active: string[];
  onChange: (active: string[]) => void;
}

export function FilterChips({ filters, active, onChange }: FilterChipsProps) {
  function toggle(value: string) {
    if (active.includes(value)) {
      onChange(active.filter((v) => v !== value));
    } else {
      onChange([...active, value]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-[11px] font-bold tracking-wide text-terracotta bg-terracotta/8 border border-terracotta/15 hover:bg-terracotta/15 transition-all"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
      {filters.map(({ label, value }) => {
        const isActive = active.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={`inline-flex items-center rounded px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-forest text-parchment'
                : 'bg-linen text-clay border border-stone hover:border-moss/30 hover:text-umber'
            }`}
          >
            {isActive && <span className="mr-1 text-sage">✓</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}
