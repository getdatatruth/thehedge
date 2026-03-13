import Link from 'next/link';
import { getAdminStats } from '@/lib/admin/queries';
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const signupChange = stats.recentSignups - stats.prevWeekSignups;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-clay/70 mt-1 font-serif">
          Platform overview and key metrics.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-5 w-5 text-moss" />
            <div className={`flex items-center gap-0.5 text-xs font-semibold ${signupChange >= 0 ? 'text-moss' : 'text-rust'}`}>
              {signupChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(signupChange)}
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-forest">{stats.totalFamilies.toLocaleString()}</p>
          <p className="text-xs text-clay/50">Total families</p>
          <p className="text-[10px] text-clay/30 mt-1">{stats.recentSignups} this week</p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <Activity className="h-5 w-5 text-sky" />
          </div>
          <p className="text-2xl font-bold font-display text-forest">{stats.logsThisWeek.toLocaleString()}</p>
          <p className="text-xs text-clay/50">Activity logs this week</p>
          <p className="text-[10px] text-clay/30 mt-1">{stats.totalLogs.toLocaleString()} total</p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="h-5 w-5 text-gold" />
          </div>
          <p className="text-2xl font-bold font-display text-forest">{stats.totalActivities}</p>
          <p className="text-xs text-clay/50">Total activities</p>
          <p className="text-[10px] text-clay/30 mt-1">
            {stats.publishedActivities} published · {stats.draftActivities} draft
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-5 w-5 text-berry" />
          </div>
          <p className="text-2xl font-bold font-display text-forest">{stats.totalUsers}</p>
          <p className="text-xs text-clay/50">Total user accounts</p>
        </div>
      </div>

      {/* Tier distribution */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-bold text-forest mb-4">Subscription Distribution</h2>
        {Object.values(stats.tierDistribution).reduce((a, b) => a + b, 0) > 0 ? (
          <div className="flex gap-2 h-8 rounded-full overflow-hidden">
            {Object.entries(stats.tierDistribution).map(([tier, count]) => {
              const total = Object.values(stats.tierDistribution).reduce((a, b) => a + b, 0);
              const percent = total > 0 ? (count / total) * 100 : 0;
              const colors: Record<string, string> = {
                free: 'bg-linen',
                family: 'bg-moss',
                educator: 'bg-gold',
              };
              if (percent === 0) return null;
              return (
                <div
                  key={tier}
                  className={`${colors[tier]} flex items-center justify-center transition-all`}
                  style={{ width: `${Math.max(percent, 8)}%` }}
                >
                  <span className={`text-[10px] font-bold ${tier === 'free' ? 'text-clay/50' : 'text-white'}`}>
                    {tier} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-clay/40">No families registered yet.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-4">Recent Signups</h2>
          {stats.recentSignupsList.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSignupsList.map((family: {
                id: string;
                name: string;
                county: string | null;
                subscription_tier: string;
                onboarding_completed: boolean;
                created_at: string;
              }) => (
                <div key={family.id} className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-moss/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest truncate">{family.name}</p>
                    <p className="text-[11px] text-clay/40">
                      {family.county || 'Unknown'} · {family.subscription_tier}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {family.onboarding_completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-moss" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rust/40" />
                    )}
                    <span className="text-[10px] text-clay/30">
                      {new Date(family.created_at).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No recent signups.</p>
          )}
        </div>

        {/* Top activities */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-4">Top Activities</h2>
          {stats.topActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.topActivities.map((activity: { title: string; logs: number }, i: number) => {
                const maxLogs = stats.topActivities[0].logs;
                const percent = maxLogs > 0 ? (activity.logs / maxLogs) * 100 : 0;
                return (
                  <div key={activity.title} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-clay/30 w-5 text-right">{i + 1}</span>
                    <span className="text-sm font-medium text-forest flex-1 truncate">{activity.title}</span>
                    <div className="w-24 h-2 rounded-full bg-linen">
                      <div className="h-full rounded-full bg-gold/60" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-clay/40 w-12 text-right">{activity.logs.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No activity logs yet.</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Manage Activities', href: '/admin/activities', description: `${stats.totalActivities} activities` },
          { label: 'View Users', href: '/admin/users', description: `${stats.totalFamilies} families` },
          { label: 'Content Calendar', href: '/admin/calendar', description: 'Plan seasonal content' },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="card-interactive p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-forest">{link.label}</p>
              <p className="text-xs text-clay/50">{link.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-clay/20" />
          </Link>
        ))}
      </div>
    </div>
  );
}
