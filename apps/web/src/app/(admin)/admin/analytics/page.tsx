import { getAnalytics, getAdminStats } from '@/lib/admin/queries';
import {
  TrendingUp,
  Users,
  Activity,
  BookOpen,
  Crown,
  GraduationCap,
  User,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [analytics, stats] = await Promise.all([getAnalytics(), getAdminStats()]);

  const totalFamilies = stats.totalFamilies;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
          Analytics
        </h1>
        <p className="text-clay/70 mt-1">
          Platform engagement and growth metrics.
        </p>
      </div>

      {/* Key numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Families', value: stats.totalFamilies.toLocaleString(), icon: Users, color: 'text-moss' },
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Activity, color: 'text-sky' },
          { label: 'Activities', value: stats.totalActivities.toString(), icon: BookOpen, color: 'text-gold' },
          { label: 'Total Logs', value: stats.totalLogs.toLocaleString(), icon: TrendingUp, color: 'text-berry' },
          { label: 'Logs This Week', value: stats.logsThisWeek.toLocaleString(), icon: Activity, color: 'text-rust' },
        ].map((metric) => (
          <div key={metric.label} className="card-elevated p-4">
            <metric.icon className={`h-4 w-4 ${metric.color} mb-2`} />
            <p className="text-xl font-bold font-display text-forest">{metric.value}</p>
            <p className="text-[11px] text-clay/50">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Signup chart */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-bold text-forest mb-5">Weekly Signups (last 10 weeks)</h2>
        {analytics.weeklySignups.some((w) => w.count > 0) ? (
          <div className="flex items-end gap-3 h-48">
            {analytics.weeklySignups.map((week) => {
              const maxCount = Math.max(...analytics.weeklySignups.map((w) => w.count), 1);
              const percent = (week.count / maxCount) * 100;
              return (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-clay/40">{week.count}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-forest/60 to-moss/40 transition-all hover:from-forest/80 hover:to-moss/60"
                      style={{ height: `${Math.max(percent, 2)}%`, maxWidth: '60px', margin: '0 auto' }}
                    />
                  </div>
                  <span className="text-[10px] text-clay/30">{week.week}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-clay/40 py-8 text-center">No signup data for this period yet.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tier distribution */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-5">Tier Distribution</h2>
          {totalFamilies > 0 ? (
            <div className="space-y-4">
              {Object.entries(analytics.tierDistribution).map(([tier, count]) => {
                const total = Object.values(analytics.tierDistribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;
                const colors: Record<string, string> = {
                  free: 'bg-linen',
                  family: 'bg-moss',
                  educator: 'bg-gold',
                };
                const icons: Record<string, React.ElementType> = {
                  free: User,
                  family: Crown,
                  educator: GraduationCap,
                };
                const TierIcon = icons[tier] || User;
                return (
                  <div key={tier} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-forest capitalize flex items-center gap-2">
                        <TierIcon className="h-3.5 w-3.5" />
                        {tier}
                      </span>
                      <span className="text-xs text-clay/50">{count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-linen">
                      <div className={`h-full rounded-full ${colors[tier]} transition-all`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No families registered yet.</p>
          )}
        </div>

        {/* Most popular activities */}
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-forest mb-5">Most Logged Activities</h2>
          {analytics.popularActivities.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularActivities.map((activity, i) => {
                const maxLogs = analytics.popularActivities[0]?.logs || 1;
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-[11px] font-bold text-forest">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-forest truncate block">{activity.title}</span>
                      <span className="text-[10px] text-clay/30 capitalize">{activity.category}</span>
                    </div>
                    <div className="w-28 h-2 rounded-full bg-linen">
                      <div className="h-full rounded-full bg-gold/60" style={{ width: `${(activity.logs / maxLogs) * 100}%` }} />
                    </div>
                    <span className="text-xs text-clay/40 w-14 text-right">{activity.logs.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-clay/40">No activity logs yet.</p>
          )}
        </div>
      </div>

      {/* Most active families */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-bold text-forest mb-5">Most Active Families</h2>
        {analytics.activeFamilies.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {analytics.activeFamilies.slice(0, 10).map((family, i) => (
              <div key={family.id} className="rounded-2xl bg-parchment/50 p-4 text-center">
                <span className="text-[10px] font-bold text-clay/30">#{i + 1}</span>
                <p className="text-sm font-bold font-display text-forest mt-1 truncate">{family.name}</p>
                <p className="text-xs text-clay/50 capitalize">{family.tier}</p>
                <p className="text-lg font-bold text-forest mt-1">{family.logs}</p>
                <p className="text-[10px] text-clay/30">activity logs</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-clay/40">No activity data yet.</p>
        )}
      </div>

      {/* Daily log activity (last 30 days) */}
      <div className="card-elevated p-6">
        <h2 className="font-display text-lg font-bold text-forest mb-5">Daily Activity Logs (30 days)</h2>
        {Object.keys(analytics.logsByDate).length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {(() => {
              const dates: string[] = [];
              for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push(d.toISOString().split('T')[0]);
              }
              const maxCount = Math.max(...dates.map((d) => analytics.logsByDate[d] || 0), 1);
              return dates.map((date) => {
                const count = analytics.logsByDate[date] || 0;
                const percent = (count / maxCount) * 100;
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group" title={`${date}: ${count} logs`}>
                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-t transition-all ${isToday ? 'bg-moss' : 'bg-forest/30 group-hover:bg-forest/50'}`}
                        style={{ height: `${Math.max(percent, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <p className="text-sm text-clay/40 py-8 text-center">No log data for this period yet.</p>
        )}
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-clay/30">30 days ago</span>
          <span className="text-[9px] text-clay/30">Today</span>
        </div>
      </div>
    </div>
  );
}
