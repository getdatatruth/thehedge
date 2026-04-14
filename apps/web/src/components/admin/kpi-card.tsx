'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percent';
  sparklineData?: number[];
}

export function KpiCard({ title, value, subtitle, trend, trendLabel, icon, format, sparklineData }: KpiCardProps) {
  const displayValue = format === 'currency'
    ? `EUR${typeof value === 'number' ? value.toLocaleString('en-IE', { minimumFractionDigits: 0 }) : value}`
    : format === 'percent'
      ? `${value}%`
      : typeof value === 'number' ? value.toLocaleString() : value;

  const chartData = sparklineData?.map((v, i) => ({ i, v }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Sparkline background */}
      {chartData && chartData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#4CAF7C"
                fill="#4CAF7C"
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E]">
            {title}
          </span>
          {icon && <div className="text-[#8A9B8E]">{icon}</div>}
        </div>
        <p className="text-3xl font-bold text-[#1A2E1E] tracking-tight">{displayValue}</p>
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                trend > 0
                  ? 'bg-[#4CAF7C]/10 text-[#4CAF7C]'
                  : trend < 0
                    ? 'bg-[#DC3545]/10 text-[#DC3545]'
                    : 'bg-[#8A9B8E]/10 text-[#8A9B8E]'
              }`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
            {(subtitle || trendLabel) && (
              <span className="text-[11px] text-[#8A9B8E]">{subtitle || trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
