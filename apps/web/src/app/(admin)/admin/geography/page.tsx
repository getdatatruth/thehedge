'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  Users,
  Crown,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CountyData {
  county: string;
  totalFamilies: number;
  activeFamilies: number;
  avgActivities: number;
  topTier: string;
  growth: number;
}

interface SummaryData {
  countiesWithFamilies: number;
  mostPopularCounty: string;
  mostPopularCount: number;
  fastestGrowingCounty: string;
  fastestGrowingSignups: number;
}

interface GeoResponse {
  counties: CountyData[];
  summary: SummaryData;
}

type SortKey = keyof CountyData;
type SortDir = 'asc' | 'desc';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  family: 'Family',
  educator: 'Educator',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-[#8A9B8E]/20 text-[#5A6B5E]',
  family: 'bg-[#4CAF7C]/15 text-[#3A8F62]',
  educator: 'bg-[#7C4CAF]/15 text-[#6A3A9F]',
};

export default function GeographyPage() {
  const [data, setData] = useState<GeoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('totalFamilies');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/geography');
      if (!res.ok) throw new Error('Failed to fetch geography data');
      const json: GeoResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedCounties = useMemo(() => {
    if (!data) return [];
    return [...data.counties].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortDir === 'asc' ? numA - numB : numB - numA;
    });
  }, [data, sortKey, sortDir]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data.counties]
      .sort((a, b) => b.totalFamilies - a.totalFamilies)
      .slice(0, 10)
      .map(c => ({
        name: c.county.replace('County ', '').replace('Co. ', ''),
        families: c.totalFamilies,
        active: c.activeFamilies,
      }));
  }, [data]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) {
      return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 text-[#8A9B8E]" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="inline h-3.5 w-3.5 ml-1 text-[#4CAF7C]" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5 ml-1 text-[#4CAF7C]" />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF7C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[#5A6B5E]">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#4CAF7C] text-white rounded-xl text-sm font-medium hover:bg-[#3A9F6C] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A2E1E] tracking-tight">
          Geographic Analytics
        </h1>
        <p className="text-[#5A6B5E] mt-1">
          Family distribution and engagement by Irish county.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#4CAF7C]/10">
              <MapPin className="h-5 w-5 text-[#4CAF7C]" />
            </div>
            <span className="text-sm font-medium text-[#5A6B5E]">Counties Active</span>
          </div>
          <p className="text-3xl font-bold text-[#1A2E1E]">
            {summary.countiesWithFamilies}
          </p>
          <p className="text-xs text-[#8A9B8E] mt-1">Counties with at least one family</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#4CAF7C]/10">
              <Users className="h-5 w-5 text-[#4CAF7C]" />
            </div>
            <span className="text-sm font-medium text-[#5A6B5E]">Most Popular</span>
          </div>
          <p className="text-3xl font-bold text-[#1A2E1E]">
            {summary.mostPopularCounty}
          </p>
          <p className="text-xs text-[#8A9B8E] mt-1">
            {summary.mostPopularCount} {summary.mostPopularCount === 1 ? 'family' : 'families'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#4CAF7C]/10">
              <TrendingUp className="h-5 w-5 text-[#4CAF7C]" />
            </div>
            <span className="text-sm font-medium text-[#5A6B5E]">Fastest Growing</span>
          </div>
          <p className="text-3xl font-bold text-[#1A2E1E]">
            {summary.fastestGrowingCounty}
          </p>
          <p className="text-xs text-[#8A9B8E] mt-1">
            {summary.fastestGrowingSignups} new {summary.fastestGrowingSignups === 1 ? 'signup' : 'signups'} this month
          </p>
        </div>
      </div>

      {/* Bar Chart - Top 10 Counties */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A2E1E] mb-6">
          Top 10 Counties by Family Count
        </h2>
        {chartData.length > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE8" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#5A6B5E' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E8ECE8' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#8A9B8E' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2E1E',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  labelStyle={{ color: '#FFFFFF', fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: '#D1D9D3', fontSize: 13 }}
                  cursor={{ fill: 'rgba(76, 175, 124, 0.08)' }}
                />
                <Bar
                  dataKey="families"
                  name="Total Families"
                  fill="#4CAF7C"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="active"
                  name="Active Families"
                  fill="#4CAF7C"
                  fillOpacity={0.35}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-[#8A9B8E] py-12 text-center">
            No geographic data available yet.
          </p>
        )}
      </div>

      {/* County Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-bold text-[#1A2E1E]">
            All Counties
          </h2>
          <p className="text-sm text-[#8A9B8E] mt-1">
            {sortedCounties.length} {sortedCounties.length === 1 ? 'county' : 'counties'} with registered families
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-[#E8ECE8]">
                {[
                  { key: 'county' as SortKey, label: 'County' },
                  { key: 'totalFamilies' as SortKey, label: 'Total Families' },
                  { key: 'activeFamilies' as SortKey, label: 'Active (30d)' },
                  { key: 'avgActivities' as SortKey, label: 'Avg Activities' },
                  { key: 'topTier' as SortKey, label: 'Top Tier' },
                  { key: 'growth' as SortKey, label: 'Growth' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-3 text-left text-xs font-semibold text-[#5A6B5E] uppercase tracking-wider cursor-pointer hover:text-[#1A2E1E] transition-colors select-none"
                  >
                    {col.label}
                    <SortIcon column={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F0]">
              {sortedCounties.map((county) => (
                <tr
                  key={county.county}
                  className="hover:bg-[#F8FAF8] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#1A2E1E] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#8A9B8E]" />
                      {county.county}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#1A2E1E] font-semibold">
                    {county.totalFamilies}
                  </td>
                  <td className="px-6 py-4 text-[#5A6B5E]">
                    <span className="font-medium">{county.activeFamilies}</span>
                    {county.totalFamilies > 0 && (
                      <span className="text-[#8A9B8E] ml-1.5 text-xs">
                        ({Math.round((county.activeFamilies / county.totalFamilies) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#5A6B5E]">
                    {county.avgActivities}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        TIER_COLORS[county.topTier] || TIER_COLORS.free
                      }`}
                    >
                      {county.topTier === 'educator' && <Crown className="h-3 w-3" />}
                      {TIER_LABELS[county.topTier] || county.topTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {county.growth > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#4CAF7C] font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +{county.growth}
                      </span>
                    ) : (
                      <span className="text-[#8A9B8E]">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedCounties.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8A9B8E]">
                    No county data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
