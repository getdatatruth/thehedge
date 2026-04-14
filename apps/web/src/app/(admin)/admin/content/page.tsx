'use client';

import { useEffect, useState } from 'react';
import { BookOpen, BarChart3, Layers, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { KpiCard } from '@/components/admin/kpi-card';

// ---------- Types ----------

interface ActivityPerformance {
  id: string;
  title: string;
  category: string;
  logCount: number;
  avgRating: number | null;
}

interface CategoryStat {
  category: string;
  logCount: number;
  activityCount: number;
  avgRating: number | null;
}

interface ContentData {
  kpis: {
    totalActivities: number;
    totalLogs: number;
    avgLogsPerActivity: number;
    categoriesCovered: number;
  };
  top20: ActivityPerformance[];
  bottom20: ActivityPerformance[];
  categoryStats: CategoryStat[];
  neverLoggedCount: number;
  neverLoggedSample: { title: string; category: string }[];
}

// ---------- Constants ----------

const CATEGORY_COLOURS: Record<string, string> = {
  nature: '#4CAF7C',
  science: '#5B8DEF',
  art: '#E8735A',
  maths: '#9B7BD4',
  literacy: '#5BBDD4',
  movement: '#F5A623',
  kitchen: '#D4845B',
  life_skills: '#2E7D32',
  calm: '#8A9B8E',
  social: '#E85BAD',
};

const CATEGORY_LABELS: Record<string, string> = {
  nature: 'Nature',
  science: 'Science',
  art: 'Art',
  maths: 'Maths',
  literacy: 'Literacy',
  movement: 'Movement',
  kitchen: 'Kitchen',
  life_skills: 'Life Skills',
  calm: 'Calm',
  social: 'Social',
};

function categoryColour(cat: string): string {
  return CATEGORY_COLOURS[cat] || '#8A9B8E';
}

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] || cat;
}

// ---------- Sub-components ----------

function CategoryBadge({ category }: { category: string }) {
  const colour = categoryColour(category);
  return (
    <span
      className="inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: `${colour}26`,
        color: colour,
      }}
    >
      {categoryLabel(category)}
    </span>
  );
}

function ActivityTable({
  title,
  subtitle,
  activities,
}: {
  title: string;
  subtitle: string;
  activities: ActivityPerformance[];
}) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A2E1E] mb-1">{title}</h2>
        <p className="text-sm text-[#5A6B5E] mb-6">{subtitle}</p>
        <p className="text-sm text-[#8A9B8E] text-center py-8">No data available yet.</p>
      </div>
    );
  }

  const maxLogs = activities[0]?.logCount || 1;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#1A2E1E] mb-1">{title}</h2>
      <p className="text-sm text-[#5A6B5E] mb-6">{subtitle}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8EDE9]">
              <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-12">
                #
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3">
                Activity
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-24">
                Category
              </th>
              <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-16">
                Logs
              </th>
              <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-16">
                Avg Rating
              </th>
              <th className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-32 hidden sm:table-cell">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, i) => {
              const barWidth = maxLogs > 0 ? (activity.logCount / maxLogs) * 100 : 0;
              return (
                <tr
                  key={activity.id}
                  className="border-b border-[#F2F5F0] last:border-0 hover:bg-[#F9FAF9] transition-colors"
                >
                  <td className="py-3 pr-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A2E1E]/5 text-[11px] font-bold text-[#1A2E1E]">
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-[#1A2E1E] block truncate max-w-[280px]">
                      {activity.title}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <CategoryBadge category={activity.category} />
                  </td>
                  <td className="py-3 text-right font-semibold text-[#1A2E1E] tabular-nums">
                    {activity.logCount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-[#5A6B5E] tabular-nums">
                    {activity.avgRating !== null ? activity.avgRating.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 pl-4 hidden sm:table-cell">
                    <div className="w-full h-2 rounded-full bg-[#F2F5F0]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: categoryColour(activity.category),
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Custom Tooltip ----------

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1A2E1E] text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-semibold">{categoryLabel(label || '')}</p>
      <p className="text-[#8A9B8E] mt-0.5">{payload[0].value.toLocaleString()} logs</p>
    </div>
  );
}

// ---------- Main Page ----------

export default function ContentPerformancePage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Content Performance - The Hedge';

    async function fetchData() {
      try {
        const res = await fetch('/api/admin/content');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[#E8EDE9] rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm h-28" />
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <AlertTriangle className="h-8 w-8 text-[#E8735A] mx-auto mb-3" />
        <p className="text-[#1A2E1E] font-semibold mb-1">Failed to load content data</p>
        <p className="text-sm text-[#5A6B5E]">{error || 'Please try again.'}</p>
      </div>
    );
  }

  const { kpis, top20, bottom20, categoryStats, neverLoggedCount, neverLoggedSample } = data;

  const chartData = categoryStats.map((c) => ({
    name: c.category,
    label: categoryLabel(c.category),
    logs: c.logCount,
    colour: categoryColour(c.category),
  }));

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A2E1E] tracking-tight">
          Content Performance
        </h1>
        <p className="text-[#5A6B5E] mt-1">
          How activities are performing across the platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Published Activities"
          value={kpis.totalActivities}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <KpiCard
          title="Total Logs"
          value={kpis.totalLogs}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <KpiCard
          title="Avg Logs / Activity"
          value={kpis.avgLogsPerActivity}
          subtitle="across all published"
        />
        <KpiCard
          title="Categories Covered"
          value={kpis.categoriesCovered}
          subtitle="of 10 total"
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Category Performance Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A2E1E] mb-1">Category Performance</h2>
        <p className="text-sm text-[#5A6B5E] mb-6">Total logs by category</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#8A9B8E' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8A9B8E' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F2F5F0' }} />
              <Bar dataKey="logs" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.colour} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[#8A9B8E] text-center py-8">No category data yet.</p>
        )}
      </div>

      {/* Most Logged Activities */}
      <ActivityTable
        title="Most Logged Activities"
        subtitle="Top 20 activities by total log count"
        activities={top20}
      />

      {/* Least Logged Activities */}
      <ActivityTable
        title="Least Logged Activities"
        subtitle="Bottom 20 logged activities - potential content gaps"
        activities={bottom20}
      />

      {/* Never Logged */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A2E1E] mb-1">Never Logged Activities</h2>
            <p className="text-sm text-[#5A6B5E]">
              Content that has never been used - may need promotion or review
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8735A]/10 text-[#E8735A] px-3 py-1.5 text-sm font-bold">
            <AlertTriangle className="h-3.5 w-3.5" />
            {neverLoggedCount}
          </span>
        </div>
        {neverLoggedSample.length > 0 ? (
          <>
            <div className="space-y-2">
              {neverLoggedSample.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#F9FAF9]"
                >
                  <span className="text-sm text-[#1A2E1E] truncate max-w-[300px]">{a.title}</span>
                  <CategoryBadge category={a.category} />
                </div>
              ))}
            </div>
            {neverLoggedCount > 10 && (
              <p className="text-xs text-[#8A9B8E] mt-3 text-center">
                Showing 10 of {neverLoggedCount} never-logged activities
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-[#4CAF7C] text-center py-6 font-medium">
            All activities have been logged at least once.
          </p>
        )}
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A2E1E] mb-1">Category Breakdown</h2>
        <p className="text-sm text-[#5A6B5E] mb-6">Detailed stats by category</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDE9]">
                <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3">
                  Category
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-24">
                  Activities
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-24">
                  Total Logs
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-24">
                  Logs / Activity
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A9B8E] pb-3 w-20">
                  Avg Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((cat) => (
                <tr
                  key={cat.category}
                  className="border-b border-[#F2F5F0] last:border-0 hover:bg-[#F9FAF9] transition-colors"
                >
                  <td className="py-3">
                    <CategoryBadge category={cat.category} />
                  </td>
                  <td className="py-3 text-right text-[#1A2E1E] tabular-nums">
                    {cat.activityCount}
                  </td>
                  <td className="py-3 text-right font-semibold text-[#1A2E1E] tabular-nums">
                    {cat.logCount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-[#5A6B5E] tabular-nums">
                    {cat.activityCount > 0
                      ? (cat.logCount / cat.activityCount).toFixed(1)
                      : '-'}
                  </td>
                  <td className="py-3 text-right text-[#5A6B5E] tabular-nums">
                    {cat.avgRating !== null ? cat.avgRating.toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
