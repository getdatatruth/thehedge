'use client';

import type { CohortRow } from '@/lib/admin/metrics';

interface RetentionTableProps {
  cohorts: CohortRow[];
}

function getRetentionColor(pct: number): string {
  if (pct >= 80) return 'bg-[#4CAF7C] text-white';
  if (pct >= 60) return 'bg-[#4CAF7C]/70 text-white';
  if (pct >= 40) return 'bg-[#F5A623]/60 text-[#1A2E1E]';
  if (pct >= 20) return 'bg-[#E8735A]/50 text-[#1A2E1E]';
  if (pct > 0) return 'bg-[#DC3545]/40 text-[#1A2E1E]';
  return 'bg-[#D8DDD5]/30 text-[#8A9B8E]';
}

export function RetentionTable({ cohorts }: RetentionTableProps) {
  if (cohorts.length === 0) {
    return (
      <div className="text-center py-8 text-[#8A9B8E] text-sm">
        No cohort data available yet.
      </div>
    );
  }

  const maxMonths = Math.max(...cohorts.map(c => c.retention.length));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E] bg-[#F2F5F0] rounded-tl-lg">
              Cohort
            </th>
            <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E] bg-[#F2F5F0]">
              Size
            </th>
            {Array.from({ length: maxMonths }, (_, i) => (
              <th key={i} className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E] bg-[#F2F5F0] last:rounded-tr-lg">
                M{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.cohort} className="border-b border-[#E8EDE6]">
              <td className="py-2 px-3 font-medium text-[#1A2E1E] whitespace-nowrap">
                {cohort.cohort}
              </td>
              <td className="text-center py-2 px-3 text-[#5A6B5E]">
                {cohort.size}
              </td>
              {Array.from({ length: maxMonths }, (_, i) => {
                const pct = cohort.retention[i];
                if (pct === undefined) {
                  return <td key={i} className="text-center py-2 px-2" />;
                }
                return (
                  <td key={i} className="text-center py-1 px-1">
                    <span className={`inline-block w-full rounded-md py-1 px-2 text-[11px] font-semibold ${getRetentionColor(pct)}`}>
                      {pct}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
