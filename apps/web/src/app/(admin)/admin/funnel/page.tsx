'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Filter, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';

interface FunnelStage {
  name: string;
  count: number;
}

interface FunnelData {
  stages: FunnelStage[];
}

const STAGE_COLORS = [
  '#4CAF7C',
  '#3D9A6A',
  '#2E8758',
  '#1F7446',
  '#106134',
];

export default function FunnelAnalyticsPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Funnel Analytics - The Hedge';
  }, []);

  useEffect(() => {
    async function fetchFunnelData() {
      try {
        const res = await fetch('/api/admin/funnel');
        if (!res.ok) {
          throw new Error(`Failed to fetch funnel data (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#5A6B5E]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-[#DC3545] text-sm">{error || 'Failed to load funnel data.'}</p>
      </div>
    );
  }

  const { stages } = data;
  const totalSignups = stages[0]?.count || 0;
  const paidConversions = stages[stages.length - 1]?.count || 0;
  const overallConversion = totalSignups > 0
    ? ((paidConversions / totalSignups) * 100).toFixed(1)
    : '0.0';

  // Build chart data with drop-off info
  const chartData = stages.map((stage, i) => {
    const prevCount = i === 0 ? stage.count : stages[i - 1].count;
    const proceedRate = prevCount > 0 ? (stage.count / prevCount) * 100 : 0;
    const dropOffRate = 100 - proceedRate;
    return {
      ...stage,
      proceedRate: i === 0 ? 100 : proceedRate,
      dropOffRate: i === 0 ? 0 : dropOffRate,
      prevCount,
    };
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A2E1E] tracking-tight">
          Funnel Analytics
        </h1>
        <p className="text-[#5A6B5E] mt-1">
          Conversion pipeline from signup to paid subscription.
        </p>
      </div>

      {/* Conversion Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-[#5A6B5E] uppercase tracking-wide">Total Signups</p>
          <p className="text-3xl font-bold text-[#1A2E1E] mt-1">{totalSignups.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-[#5A6B5E] uppercase tracking-wide">Paid Conversions</p>
          <p className="text-3xl font-bold text-[#4CAF7C] mt-1">{paidConversions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-[#5A6B5E] uppercase tracking-wide">Overall Conversion Rate</p>
          <p className="text-3xl font-bold text-[#1A2E1E] mt-1">{overallConversion}%</p>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-[#4CAF7C]" />
          <h2 className="text-lg font-bold text-[#1A2E1E]">Conversion Funnel</h2>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 80, bottom: 0, left: 0 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={160}
              tick={{ fill: '#1A2E1E', fontSize: 13, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                background: '#1C3520',
                border: 'none',
                borderRadius: 12,
                color: '#F2F5F0',
                fontSize: 12,
              }}
              formatter={(value) => [String(value ?? 0), 'Count']}
              cursor={{ fill: 'rgba(74, 175, 124, 0.06)' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={40}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fill: '#1A2E1E', fontSize: 13, fontWeight: 600 }}
                formatter={(value) => String(value ?? 0)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage-by-Stage Drop-off */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="h-4 w-4 text-[#DC3545]" />
          <h2 className="text-lg font-bold text-[#1A2E1E]">Stage-by-Stage Drop-off</h2>
        </div>
        <div className="space-y-0">
          {chartData.map((stage, i) => {
            if (i === 0) return null;
            const prev = chartData[i - 1];
            const dropped = prev.count - stage.count;
            return (
              <div key={stage.name} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                {/* From stage */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A2E1E] truncate">{prev.name}</p>
                  <p className="text-xs text-[#5A6B5E]">{prev.count.toLocaleString()}</p>
                </div>

                {/* Arrow with rates */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 w-32">
                  <ArrowRight className="h-4 w-4 text-[#5A6B5E]" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#4CAF7C]">
                      {stage.proceedRate.toFixed(1)}% proceed
                    </span>
                  </div>
                  <span className="text-[11px] text-[#DC3545]">
                    {dropped.toLocaleString()} dropped ({stage.dropOffRate.toFixed(1)}%)
                  </span>
                </div>

                {/* To stage */}
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium text-[#1A2E1E] truncate">{stage.name}</p>
                  <p className="text-xs text-[#5A6B5E]">{stage.count.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Bars (visual representation) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A2E1E] mb-6">Visual Funnel</h2>
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const widthPercent = totalSignups > 0
              ? Math.max((stage.count / totalSignups) * 100, 4)
              : 4;
            const conversionFromTop = totalSignups > 0
              ? ((stage.count / totalSignups) * 100).toFixed(1)
              : '0.0';
            return (
              <div key={stage.name} className="flex items-center gap-4">
                <div className="w-40 shrink-0 text-right">
                  <p className="text-sm font-medium text-[#1A2E1E]">{stage.name}</p>
                </div>
                <div className="flex-1">
                  <div
                    className="h-10 rounded-lg flex items-center px-3 transition-all"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length],
                      minWidth: '60px',
                    }}
                  >
                    <span className="text-white text-xs font-semibold whitespace-nowrap">
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right">
                  <span className="text-xs font-medium text-[#5A6B5E]">{conversionFromTop}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
