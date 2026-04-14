'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { KpiCard } from '@/components/admin/kpi-card';
import {
  ArrowLeft, Users, Heart, AlertTriangle, XCircle, CheckCircle,
  Clock, Flame, Star, MapPin, Mail, Crown, GraduationCap, User,
  Activity, Calendar,
} from 'lucide-react';

const CATEGORY_COLOURS: Record<string, string> = {
  nature: '#4CAF7C', science: '#5B8DEF', art: '#E8735A', maths: '#9B7BD4',
  literacy: '#5BBDD4', movement: '#F5A623', kitchen: '#D4845B',
  life_skills: '#2E7D32', calm: '#8A9B8E', social: '#E85BAD',
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  healthy: { label: 'Healthy', color: 'text-[#4CAF7C]', bg: 'bg-[#4CAF7C]/10', icon: Heart },
  'at-risk': { label: 'At Risk', color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10', icon: AlertTriangle },
  churning: { label: 'Churning', color: 'text-[#E8735A]', bg: 'bg-[#E8735A]/10', icon: AlertTriangle },
  inactive: { label: 'Inactive', color: 'text-[#DC3545]', bg: 'bg-[#DC3545]/10', icon: XCircle },
};

const TIER_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  free: { label: 'Free', icon: User, color: '#8A9B8E' },
  family: { label: 'Family', icon: Crown, color: '#4CAF7C' },
  educator: { label: 'Educator', icon: GraduationCap, color: '#5B8DEF' },
};

interface FamilyData {
  family: {
    id: string; name: string; county: string; country: string;
    tier: string; status: string; stripeCustomerId: string | null;
    trialEndsAt: string | null; onboardingCompleted: boolean; createdAt: string;
  };
  members: { id: string; name: string; email: string; role: string; created_at: string }[];
  children: { id: string; name: string; age: number; interests: string[]; school_status: string }[];
  health: {
    totalActivities: number; currentStreak: number; daysSinceLastActivity: number | null;
    lastActivityDate: string | null; riskLevel: string; avgRating: number | null;
    totalMinutes: number; categoriesExplored: number;
  };
  weeklyActivity: { week: string; count: number }[];
  categoryBreakdown: Record<string, number>;
  recentActivities: { date: string; title: string; category: string; duration: number; rating: number | null }[];
}

export default function FamilyHealthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/family/${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl" />)}
        </div>
        <div className="h-64 bg-white rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-[#4CAF7C] hover:text-[#1C3520]">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
        <p className="text-[#5A6B5E]">Family not found.</p>
      </div>
    );
  }

  const { family, members, children, health, weeklyActivity, categoryBreakdown, recentActivities } = data;
  const risk = RISK_CONFIG[health.riskLevel] || RISK_CONFIG.inactive;
  const RiskIcon = risk.icon;
  const tier = TIER_CONFIG[family.tier] || TIER_CONFIG.free;
  const TierIcon = tier.icon;

  const catData = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, fill: CATEGORY_COLOURS[name] || '#8A9B8E' }));

  const memberSince = new Date(family.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-[#4CAF7C] hover:text-[#1C3520] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1E]">{family.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6B5E]">
            {family.county && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {family.county}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Member since {memberSince}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Tier badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: `${tier.color}15`, color: tier.color }}>
            <TierIcon className="h-3.5 w-3.5" /> {tier.label}
          </span>
          {/* Risk badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${risk.bg} ${risk.color}`}>
            <RiskIcon className="h-3.5 w-3.5" /> {risk.label}
          </span>
        </div>
      </div>

      {/* Health KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Activities" value={health.totalActivities} sparklineData={weeklyActivity.map(w => w.count)} icon={<Activity className="h-4 w-4" />} />
        <KpiCard title="Current Streak" value={health.currentStreak} subtitle="days" icon={<Flame className="h-4 w-4" />} />
        <KpiCard title="Last Active" value={health.daysSinceLastActivity !== null ? `${health.daysSinceLastActivity}d ago` : 'Never'} icon={<Clock className="h-4 w-4" />} />
        <KpiCard title="Avg Rating" value={health.avgRating || 'N/A'} subtitle={`${health.categoriesExplored}/10 categories`} icon={<Star className="h-4 w-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly activity trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Activity Trend (12 weeks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8A9B8E' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8A9B8E' }} />
              <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#4CAF7C" fill="#4CAF7C" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Category Coverage</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8A9B8E' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#5A6B5E' }} width={80} />
                <Tooltip contentStyle={{ background: '#1C3520', border: 'none', borderRadius: 12, color: '#F2F5F0', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#8A9B8E] text-sm text-center py-10">No activities logged yet</p>
          )}
        </div>
      </div>

      {/* Members + Children */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1A2E1E] mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#8A9B8E]" /> Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-[#E8EDE6] last:border-0">
                <div className="h-8 w-8 rounded-full bg-[#F2F5F0] flex items-center justify-center text-[11px] font-bold text-[#1C3520]">
                  {m.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A2E1E]">{m.name}</p>
                  <p className="text-[11px] text-[#8A9B8E] flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase text-[#8A9B8E]">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Children ({children.length})</h3>
          <div className="space-y-3">
            {children.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#E8EDE6] last:border-0">
                <div className="h-8 w-8 rounded-full bg-[#4CAF7C]/10 flex items-center justify-center text-[11px] font-bold text-[#4CAF7C]">
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A2E1E]">{c.name} <span className="text-[#8A9B8E] font-normal">Age {c.age}</span></p>
                  <p className="text-[11px] text-[#8A9B8E]">
                    {c.school_status === 'homeschool' ? 'Home educated' : c.school_status === 'mainstream' ? 'Mainstream school' : 'Considering'}
                    {c.interests?.length > 0 && ` - ${c.interests.join(', ')}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activities timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Recent Activities</h3>
        {recentActivities.length === 0 ? (
          <p className="text-[#8A9B8E] text-sm text-center py-6">No activities logged in the last 90 days</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E8EDE6] last:border-0">
                <span className="text-[11px] text-[#8A9B8E] w-16 shrink-0">
                  {new Date(a.date + 'T00:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                </span>
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: CATEGORY_COLOURS[a.category] || '#8A9B8E' }} />
                <span className="text-sm text-[#1A2E1E] flex-1 truncate">{a.title}</span>
                <span className="inline-block rounded-xl px-2 py-0.5 text-[10px] font-semibold capitalize"
                  style={{ background: `${CATEGORY_COLOURS[a.category] || '#8A9B8E'}15`, color: CATEGORY_COLOURS[a.category] || '#8A9B8E' }}>
                  {a.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-[#8A9B8E] w-10 text-right">{a.duration}m</span>
                {a.rating && (
                  <span className="text-[11px] text-[#F5A623] flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-[#F5A623]" /> {a.rating}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1A2E1E] mb-4">Subscription</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E]">Tier</p>
            <p className="text-lg font-semibold text-[#1A2E1E] capitalize mt-1">{family.tier}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E]">Status</p>
            <p className="text-lg font-semibold text-[#1A2E1E] capitalize mt-1">{family.status}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E]">Onboarding</p>
            <p className="mt-1 flex items-center gap-1.5">
              {family.onboardingCompleted
                ? <><CheckCircle className="h-4 w-4 text-[#4CAF7C]" /> <span className="text-sm text-[#4CAF7C]">Complete</span></>
                : <><XCircle className="h-4 w-4 text-[#DC3545]" /> <span className="text-sm text-[#DC3545]">Incomplete</span></>
              }
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9B8E]">Stripe</p>
            <p className="text-sm text-[#1A2E1E] mt-1">{family.stripeCustomerId ? 'Connected' : 'Not connected'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
