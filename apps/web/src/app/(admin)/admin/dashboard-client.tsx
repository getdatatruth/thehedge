'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { KpiCard } from '@/components/admin/kpi-card';
import { RetentionTable } from '@/components/admin/retention-table';
import type { CohortRow } from '@/lib/admin/metrics';
import {
  Users, Activity, DollarSign, TrendingDown, RefreshCw,
  Zap, BarChart3, Clock, UserPlus, XCircle, LogIn,
} from 'lucide-react';

const CATEGORY_COLOURS: Record<string, string> = {
  nature: '#4CAF7C', science: '#5B8DEF', art: '#E8735A', maths: '#9B7BD4',
  literacy: '#5BBDD4', movement: '#F5A623', kitchen: '#D4845B',
  life_skills: '#2E7D32', calm: '#8A9B8E', social: '#E85BAD',
};

const TIER_COLOURS: Record<string, string> = {
  free: '#8A9B8E', family: '#4CAF7C', educator: '#5B8DEF',
};

interface AnalyticsData {
  kpis: {
    totalFamilies: number;
    totalUsers: number;
    mau: number;
    wau: number;
    dau: number;
    mrr: number;
    churnRate: number;
    trialConversion: number;
    avgActivitiesPerFamily: number;
    signupTrend: { current: number; previous: number; change: number };
    totalActivities: number;
    totalLogs: number;
  };
  revenue: {
    mrr: number;
    mrrHistory: { month: string; mrr: number }[];
    revenueByTier: { family: number; educator: number };
  };
  growth: {
    weeklySignups: { week: string; count: number }[];
    cumulativeFamilies: { month: string; total: number }[];
    tierDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  };
  engagement: {
    dau: number; wau: number; mau: number;
    dailyLogs: { date: string; count: number }[];
    topActivities: { title: string; category: string; count: number }[];
    categoryBreakdown: Record<string, number>;
  };
  retention: {
    cohorts: CohortRow[];
  };
  recentEvents: { type: string; description: string; timestamp: string }[];
}

export function AdminDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'revenue' | 'growth' | 'engagement' | 'retention'>('overview');

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 shadow-sm" />
          ))}
        </div>
        <div className="bg-white rounded-2xl h-80 shadow-sm" />
      </div>
    );
  }

  const tierData = Object.entries(data.growth.tierDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: TIER_COLOURS[name] || '#8A9B8E',
  }));

  const categoryData = Object.entries(data.engagement.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
      color: CATEGORY_COLOURS[name] || '#8A9B8E',
    }));

  const sections = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'revenue' as const, label: 'Revenue' },
    { id: 'growth' as const, label: 'Growth' },
    { id: 'engagement' as const, label: 'Engagement' },
    { id: 'retention' as const, label: 'Retention' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1E]">Dashboard</h1>
          <p className="text-sm text-[#5A6B5E]">The Hedge operations centre</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#1A2E1E] text-sm font-medium shadow-sm hover:shadow transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeSection === s.id
                ? 'bg-[#1C3520] text-[#F2F5F0]'
                : 'text-[#5A6B5E] hover:text-[#1A2E1E]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeSection === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              title="Total Families"
              value={data.kpis.totalFamilies}
              trend={data.kpis.signupTrend.change}
              trendLabel="vs last week"
              icon={<Users className="h-4 w-4" />}
            />
            <KpiCard
              title="Monthly Active"
              value={data.kpis.mau}
              subtitle={`${data.kpis.wau} WAU / ${data.kpis.dau} DAU`}
              icon={<Activity className="h-4 w-4" />}
            />
            <KpiCard
              title="MRR"
              value={data.kpis.mrr}
              format="currency"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <KpiCard
              title="Churn Rate"
              value={data.kpis.churnRate}
              format="percent"
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <KpiCard
              title="Trial Conversion"
              value={data.kpis.trialConversion}
              format="percent"
              icon={<Zap className="h-4 w-4" />}
            />
            <KpiCard
              title="Avg Activities/Family"
              value={data.kpis.avgActivitiesPerFamily}
              subtitle="this week"
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly signups */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Weekly Signups</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.growth.weeklySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                  <Tooltip
                    contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }}
                    labelStyle={{ color: '#8A9B8E' }}
                  />
                  <Bar dataKey="count" fill="#4CAF7C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily engagement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Daily Activity Logs (30 days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.engagement.dailyLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A9B8E' }} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                  <Tooltip
                    contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4CAF7C" fill="#4CAF7C" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tier distribution + Recent events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Tier Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {tierData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#5A6B5E', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {data.recentEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E8EDE6] last:border-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      event.type === 'signup' ? 'bg-[#4CAF7C]/10 text-[#4CAF7C]'
                        : event.type === 'cancel' ? 'bg-[#DC3545]/10 text-[#DC3545]'
                          : 'bg-[#5B8DEF]/10 text-[#5B8DEF]'
                    }`}>
                      {event.type === 'signup' ? <UserPlus className="h-3.5 w-3.5" /> :
                        event.type === 'cancel' ? <XCircle className="h-3.5 w-3.5" /> :
                          <LogIn className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1A2E1E] truncate">{event.description}</p>
                    </div>
                    <span className="text-[10px] text-[#8A9B8E] shrink-0">
                      {new Date(event.timestamp).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── REVENUE ─── */}
      {activeSection === 'revenue' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Monthly Recurring Revenue" value={data.revenue.mrr} format="currency" icon={<DollarSign className="h-4 w-4" />} />
            <KpiCard title="Family Plan Revenue" value={data.revenue.revenueByTier.family} format="currency" />
            <KpiCard title="Educator Plan Revenue" value={data.revenue.revenueByTier.educator} format="currency" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">MRR Over Time (12 months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.revenue.mrrHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8A9B8E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} tickFormatter={(v) => `EUR${v}`} />
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} formatter={(value) => [`EUR${value}`, 'MRR']} />
                  <Line type="monotone" dataKey="mrr" stroke="#4CAF7C" strokeWidth={2.5} dot={{ r: 4, fill: '#4CAF7C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Revenue by Plan</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { name: 'Family', revenue: data.revenue.revenueByTier.family, fill: '#4CAF7C' },
                  { name: 'Educator', revenue: data.revenue.revenueByTier.educator, fill: '#5B8DEF' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5A6B5E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} tickFormatter={(v) => `EUR${v}`} />
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} formatter={(value) => [`EUR${value}`]} />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    <Cell fill="#4CAF7C" />
                    <Cell fill="#5B8DEF" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ─── GROWTH ─── */}
      {activeSection === 'growth' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Total Families" value={data.kpis.totalFamilies} trend={data.kpis.signupTrend.change} trendLabel="vs last week" />
            <KpiCard title="This Week Signups" value={data.kpis.signupTrend.current} subtitle={`Last week: ${data.kpis.signupTrend.previous}`} />
            <KpiCard title="Total Users" value={data.kpis.totalUsers} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Weekly Signups (12 weeks)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.growth.weeklySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8A9B8E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#4CAF7C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Cumulative Families (12 months)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.growth.cumulativeFamilies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8A9B8E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" stroke="#1C3520" fill="#1C3520" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Subscription Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.growth.statusDistribution).map(([status, count]) => (
                <div key={status} className="text-center p-4 rounded-xl bg-[#F2F5F0]">
                  <p className="text-2xl font-bold text-[#1A2E1E]">{count}</p>
                  <p className="text-[11px] text-[#5A6B5E] capitalize">{status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── ENGAGEMENT ─── */}
      {activeSection === 'engagement' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="DAU" value={data.engagement.dau} subtitle="Today" sparklineData={data.engagement.dailyLogs.slice(-7).map(d => d.count)} />
            <KpiCard title="WAU" value={data.engagement.wau} subtitle="This week" sparklineData={data.engagement.dailyLogs.slice(-14).map(d => d.count)} />
            <KpiCard title="MAU" value={data.engagement.mau} subtitle="This month" sparklineData={data.engagement.dailyLogs.map(d => d.count)} />
            <KpiCard title="Total Logs" value={data.kpis.totalLogs} subtitle={`${data.kpis.totalActivities} activities`} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Daily Activity Logs (30 days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.engagement.dailyLogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A9B8E' }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#4CAF7C" fill="#4CAF7C" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top activities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Top 10 Activities</h3>
              <div className="space-y-3">
                {data.engagement.topActivities.map((a, i) => {
                  const max = data.engagement.topActivities[0]?.count || 1;
                  const pct = (a.count / max) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#8A9B8E] w-5 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-[13px] text-[#1A2E1E] font-medium truncate">{a.title}</p>
                        <div className="h-1.5 rounded-full bg-[#E8EDE6] mt-1">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: CATEGORY_COLOURS[a.category] || '#8A9B8E' }}
                          />
                        </div>
                      </div>
                      <span className="text-[12px] font-semibold text-[#1A2E1E] w-8 text-right">{a.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" paddingAngle={2} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ─── RETENTION ─── */}
      {activeSection === 'retention' && (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A2E1E] mb-1">Monthly Cohort Retention</h3>
            <p className="text-[12px] text-[#8A9B8E] mb-4">Percentage of families active in each month after signup</p>
            <RetentionTable cohorts={data.retention.cohorts} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Churn Rate" value={data.kpis.churnRate} format="percent" subtitle="This month" />
            <KpiCard title="Trial Conversion" value={data.kpis.trialConversion} format="percent" subtitle="Last 30 days" />
            <KpiCard title="MAU / Total" value={data.kpis.totalFamilies > 0 ? Math.round((data.kpis.mau / data.kpis.totalFamilies) * 100) : 0} format="percent" subtitle="Active rate" />
          </div>
        </>
      )}
    </div>
  );
}
