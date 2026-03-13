'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  GraduationCap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  XCircle,
} from 'lucide-react';

interface EducationPlan {
  id: string;
  family_id: string;
  child_id: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
  curriculum_areas: Record<string, { priority: string; notes?: string }> | null;
  tusla_status: string;
  plan_document_url: string | null;
  created_at: string;
  updated_at: string;
  family_name: string;
  family_county: string | null;
  child_name: string;
  child_dob: string | null;
}

interface EducatorData {
  plans: EducationPlan[];
  tuslaStats: Record<string, number>;
  totalPlans: number;
}

const TUSLA_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  not_applied: { icon: XCircle, color: 'text-clay/40', bg: 'bg-clay/10', label: 'Not Applied' },
  applied: { icon: FileText, color: 'text-gold', bg: 'bg-gold/10', label: 'Applied' },
  awaiting: { icon: Clock, color: 'text-gold', bg: 'bg-gold/10', label: 'Awaiting' },
  registered: { icon: CheckCircle2, color: 'text-moss', bg: 'bg-moss/10', label: 'Registered' },
  review_due: { icon: AlertTriangle, color: 'text-rust', bg: 'bg-rust/10', label: 'Review Due' },
};

export function EducatorClient({ initialData }: { initialData: EducatorData }) {
  const [search, setSearch] = useState('');
  const [tuslaFilter, setTuslaFilter] = useState('all');

  const filtered = initialData.plans.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.family_name.toLowerCase().includes(q) &&
        !p.child_name.toLowerCase().includes(q) &&
        !(p.family_county || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (tuslaFilter !== 'all' && p.tusla_status !== tuslaFilter) return false;
    return true;
  });

  // Find overdue: plans where tusla_status is review_due or plans older than 10 months
  const overdueCount = initialData.plans.filter((p) => {
    if (p.tusla_status === 'review_due') return true;
    const planAge = Date.now() - new Date(p.created_at).getTime();
    const tenMonths = 10 * 30 * 24 * 60 * 60 * 1000;
    return planAge > tenMonths && p.tusla_status !== 'registered';
  }).length;

  function getAge(dob: string | null): string {
    if (!dob) return '?';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  }

  function handleExportCSV() {
    const headers = ['Family', 'County', 'Child', 'Age', 'Academic Year', 'Approach', 'Hours/Day', 'Days/Week', 'Tusla Status', 'Created'];
    const rows = filtered.map((p) => [
      `"${p.family_name.replace(/"/g, '""')}"`,
      p.family_county || '',
      `"${p.child_name.replace(/"/g, '""')}"`,
      getAge(p.child_dob),
      p.academic_year,
      p.approach,
      p.hours_per_day,
      p.days_per_week,
      p.tusla_status,
      new Date(p.created_at).toLocaleDateString('en-IE'),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `educator-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Educator / Tusla Oversight
          </h1>
          <p className="text-clay/70 mt-1 font-serif">
            {initialData.totalPlans} education plans across all families.
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="h-3.5 w-3.5" />
          Export Compliance Report
        </button>
      </div>

      {/* Tusla status summary */}
      <div className="grid gap-3 sm:grid-cols-5">
        {Object.entries(TUSLA_STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = initialData.tuslaStats[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setTuslaFilter(tuslaFilter === status ? 'all' : status)}
              className={`card-elevated p-4 text-left transition-all ${
                tuslaFilter === status ? 'ring-2 ring-forest/20' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold font-display text-forest">{count}</p>
              <p className="text-[11px] text-clay/50">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Alert for overdue */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-[14px] bg-rust/5 border border-rust/20 p-4">
          <AlertTriangle className="h-5 w-5 text-rust shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rust">
              {overdueCount} plan{overdueCount !== 1 ? 's' : ''} may need attention
            </p>
            <p className="text-xs text-rust/60">
              Plans with review due status or older than 10 months without registration.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
        <Input
          placeholder="Search family, child, county..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-9 rounded-lg border-stone bg-parchment"
        />
      </div>

      {/* Plans table */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone bg-parchment/30">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Family</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Child</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Year</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Approach</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Schedule</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Tusla Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-clay/40">
                  {initialData.totalPlans === 0
                    ? 'No education plans created yet.'
                    : 'No plans match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((plan) => {
                const statusConfig = TUSLA_STATUS_CONFIG[plan.tusla_status] || TUSLA_STATUS_CONFIG.not_applied;
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={plan.id} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-forest">{plan.family_name}</p>
                      <p className="text-xs text-clay/40">{plan.family_county || 'Unknown county'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-forest">{plan.child_name}</p>
                      <p className="text-xs text-clay/40">{getAge(plan.child_dob)} years old</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">{plan.academic_year}</td>
                    <td className="px-4 py-3">
                      <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-linen text-clay/60 capitalize">
                        {plan.approach.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-clay/60">
                      {plan.hours_per_day}h/day, {plan.days_per_week} days
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-clay/40">
                      {new Date(plan.created_at).toLocaleDateString('en-IE', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
