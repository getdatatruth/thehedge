'use client';

import Link from 'next/link';
import {
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  Heart,
  Users,
  MessageCircle,
  Compass,
  GraduationCap,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  school_status: string;
}

interface EducationPlan {
  id: string;
  child_id: string;
  academic_year: string;
  approach: string;
  hours_per_day: number;
  days_per_week: number;
  curriculum_areas: Record<string, { priority: string; notes?: string }> | null;
  tusla_status: string;
}

interface DailyPlan {
  id: string;
  child_id: string;
  date: string;
  attendance_logged: boolean;
  blocks: { completed: boolean; duration: number; subject: string }[];
  status: string;
}

interface ActivityLog {
  id: string;
  date: string;
  duration_minutes: number | null;
  curriculum_areas_covered: string[] | null;
  child_ids: string[];
  notes: string | null;
  activities: { title: string; category: string } | { title: string; category: string }[] | null;
}

interface PortfolioEntry {
  id: string;
  child_id: string;
  title: string;
  date: string;
  curriculum_areas: string[];
}

interface Props {
  children: Child[];
  plans: EducationPlan[];
  dailyPlans: DailyPlan[];
  activityLogs: ActivityLog[];
  portfolioEntries: PortfolioEntry[];
}

// Aistear/Siolta curriculum themes
const AISTEAR_THEMES = [
  {
    name: 'Well-being',
    icon: Heart,
    color: 'bg-terracotta/10 text-terracotta',
    description: 'Children will be strong psychologically and physically.',
    areas: ['Physical health', 'Emotional well-being', 'Positive self-concept', 'Sense of safety'],
  },
  {
    name: 'Identity & Belonging',
    icon: Users,
    color: 'bg-moss/10 text-moss',
    description: 'Children will have strong self-identities and feel respected.',
    areas: ['Self-awareness', 'Group identity', 'Family & community', 'Cultural understanding'],
  },
  {
    name: 'Communicating',
    icon: MessageCircle,
    color: 'bg-amber/10 text-amber',
    description: 'Children will share their experiences, thoughts, and feelings.',
    areas: ['Oral language', 'Literacy & numeracy', 'Creative expression', 'Using media'],
  },
  {
    name: 'Exploring & Thinking',
    icon: Compass,
    color: 'bg-sky/10 text-sky',
    description: 'Children will learn about the world around them through exploration.',
    areas: ['Making sense of the world', 'Problem-solving', 'Curiosity & wonder', 'Mathematical concepts'],
  },
];

function getChildAge(dob: string): number {
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function EducatorDashboardClient({ children, plans, dailyPlans, activityLogs, portfolioEntries }: Props) {
  const firstChild = children[0];
  const firstPlan = plans.find((p) => firstChild && p.child_id === firstChild.id);

  // Calculate hours logged this week from activity logs
  const hoursThisWeek = Math.round(
    activityLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / 60 * 10
  ) / 10;

  // Calculate target hours this week
  const targetHoursWeek = firstPlan
    ? firstPlan.hours_per_day * firstPlan.days_per_week
    : 20;

  // Calculate attendance days this week
  const attendanceDays = dailyPlans.filter((dp) => dp.attendance_logged).length;
  const totalSchoolDays = firstPlan ? firstPlan.days_per_week : 5;

  // Calculate unique curriculum areas covered
  const allAreasCovered = new Set<string>();
  activityLogs.forEach((log) => {
    (log.curriculum_areas_covered || []).forEach((area) => allAreasCovered.add(area));
  });

  // Get curriculum areas from the plan
  const planAreas = firstPlan?.curriculum_areas || {};
  const planAreaNames = Object.keys(planAreas);
  const totalAreas = planAreaNames.length || 7;
  const coveredAreas = planAreaNames.filter((a) => allAreasCovered.has(a)).length;

  // Tusla compliance from plan
  const tuslaStatus = firstPlan?.tusla_status || 'not_applied';
  const attendancePercentage = dailyPlans.length > 0
    ? Math.round((attendanceDays / dailyPlans.length) * 100)
    : 0;

  // Recent activity feed (last 5 activity logs)
  const recentActivity = activityLogs.slice(0, 8);

  // Portfolio counts per child
  const portfolioCountByChild: Record<string, number> = {};
  portfolioEntries.forEach((entry) => {
    portfolioCountByChild[entry.child_id] = (portfolioCountByChild[entry.child_id] || 0) + 1;
  });

  // Completed blocks today
  const today = new Date().toISOString().split('T')[0];
  const todayPlans = dailyPlans.filter((dp) => dp.date === today);
  const todayBlocks = todayPlans.flatMap((dp) => dp.blocks || []);
  const todayCompleted = todayBlocks.filter((b) => b.completed).length;

  function getActivityTitle(log: ActivityLog): string {
    if (!log.activities) return log.notes || 'Untitled activity';
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.title || log.notes || 'Untitled activity';
  }

  function getActivityCategory(log: ActivityLog): string {
    if (!log.activities) return '';
    const activity = Array.isArray(log.activities) ? log.activities[0] : log.activities;
    return activity?.category || '';
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div>
        <p className="eyebrow mb-2">Home Education</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          Educator <em className="text-moss italic">Dashboard</em>
        </h1>
        <p className="text-clay mt-2 text-lg">
          {children.length > 0
            ? `Managing home education for ${children.map((c) => c.name).join(', ')}.`
            : 'Add children in settings to get started.'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Schedule', href: '/educator/schedule', icon: CalendarDays, color: 'bg-moss/10', iconColor: 'text-moss' },
          { label: 'Portfolio', href: firstChild ? `/educator/portfolio/${firstChild.id}` : '/educator', icon: FolderOpen, color: 'bg-terracotta/10', iconColor: 'text-terracotta' },
          { label: 'Plans', href: '/educator/plans', icon: BookOpen, color: 'bg-amber/10', iconColor: 'text-amber' },
          { label: 'Tusla', href: '/educator/tusla', icon: ClipboardCheck, color: 'bg-sky/10', iconColor: 'text-sky' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-interactive p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <span className="text-sm font-semibold text-ink">{item.label}</span>
            <ChevronRight className="ml-auto h-4 w-4 text-clay/20" />
          </Link>
        ))}
      </div>

      {/* Tusla compliance alert */}
      {attendancePercentage > 0 && attendancePercentage < 90 && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber/8 border border-amber/15 px-5 py-3.5">
          <AlertTriangle className="h-5 w-5 text-amber shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber">Attendance tracking</p>
            <p className="text-xs text-clay/60">
              Current attendance: {attendancePercentage}% this week
            </p>
          </div>
          <Link href="/educator/tusla" className="ml-auto text-xs font-medium text-amber hover:text-amber/80 transition-colors">
            View details
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss/10">
            <Clock className="h-5 w-5 text-moss" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{hoursThisWeek}</p>
            <p className="text-xs text-clay/50">Hours / {targetHoursWeek}h target</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/10">
            <CalendarDays className="h-5 w-5 text-sky" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{attendanceDays}</p>
            <p className="text-xs text-clay/50">Days / {totalSchoolDays} this week</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10">
            <TrendingUp className="h-5 w-5 text-amber" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">
              {coveredAreas}/{totalAreas}
            </p>
            <p className="text-xs text-clay/50">Curriculum areas</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10">
            <Sparkles className="h-5 w-5 text-terracotta" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">
              {todayCompleted}/{todayBlocks.length}
            </p>
            <p className="text-xs text-clay/50">Today&apos;s activities</p>
          </div>
        </div>
      </div>

      {/* Today's progress */}
      {todayBlocks.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-light text-ink">
              Today&apos;s <em className="text-moss italic">Progress</em>
            </h2>
            <Link
              href="/educator/schedule"
              className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1"
            >
              View schedule <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                {todayCompleted} of {todayBlocks.length} blocks completed
              </span>
              <span className="text-xs font-semibold text-ink">
                {todayBlocks.length > 0 ? Math.round((todayCompleted / todayBlocks.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-linen">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest to-moss transition-all"
                style={{ width: `${todayBlocks.length > 0 ? (todayCompleted / todayBlocks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {todayBlocks.map((block, i) => (
              <span
                key={i}
                className={`tag ${
                  block.completed ? 'bg-moss/15 text-moss line-through' : 'bg-linen text-clay/50'
                }`}
              >
                {block.subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum coverage from plan */}
      {planAreaNames.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-light text-ink">
              Curriculum <em className="text-moss italic">Coverage</em>
            </h2>
            {firstPlan && (
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                {firstPlan.academic_year}
              </span>
            )}
          </div>
          <div className="space-y-5">
            {planAreaNames.map((areaName) => {
              const areaConfig = planAreas[areaName];
              const isCovered = allAreasCovered.has(areaName);
              const priorityColor =
                areaConfig?.priority === 'high'
                  ? 'bg-moss'
                  : areaConfig?.priority === 'medium'
                    ? 'bg-amber'
                    : 'bg-clay/30';

              return (
                <div key={areaName} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${priorityColor}`} />
                      <span className="text-sm font-medium text-umber">{areaName}</span>
                    </div>
                    <span className="text-xs font-medium text-clay/50">
                      {isCovered ? 'Active' : 'Not started'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-linen">
                    <div
                      className={`h-full rounded-full ${priorityColor} transition-all`}
                      style={{ width: isCovered ? '100%' : '0%', opacity: 0.7 }}
                    />
                  </div>
                  <p className="text-[10px] text-clay/40 capitalize">
                    Priority: {areaConfig?.priority || 'medium'}
                    {areaConfig?.notes ? ` - ${areaConfig.notes}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aistear / Siolta Framework */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg font-light text-ink">
            Aistear <em className="text-moss italic">Framework</em>
          </h2>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
            Irish Early Years Curriculum
          </span>
        </div>
        <p className="text-xs text-clay/50 mb-6">
          Aistear is the curriculum framework for children from birth to six years in Ireland.
          Siolta is the National Quality Framework for Early Childhood Education.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {AISTEAR_THEMES.map((theme) => {
            const ThemeIcon = theme.icon;
            return (
              <div key={theme.name} className="rounded-2xl bg-parchment/50 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.color.split(' ')[0]}`}>
                    <ThemeIcon className={`h-5 w-5 ${theme.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{theme.name}</h3>
                    <p className="text-[10px] text-clay/50">{theme.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {theme.areas.map((area) => (
                    <span key={area} className="tag bg-linen text-clay/50">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity feed */}
      {recentActivity.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-light text-ink">
              Recent <em className="text-moss italic">Activity</em>
            </h2>
            <Link href="/timeline" className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentActivity.map((log) => {
              const title = getActivityTitle(log);
              const category = getActivityCategory(log);
              const childNames = children
                .filter((c) => (log.child_ids || []).includes(c.id))
                .map((c) => c.name);

              return (
                <div key={log.id} className="flex items-center gap-3 rounded-2xl p-3.5 hover:bg-parchment/50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss/10">
                    <GraduationCap className="h-5 w-5 text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-umber truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-clay/40">{formatDate(log.date)}</span>
                      {log.duration_minutes && (
                        <>
                          <span className="text-clay/20">·</span>
                          <span className="text-[11px] text-clay/40">{log.duration_minutes}m</span>
                        </>
                      )}
                      {childNames.length > 0 && (
                        <>
                          <span className="text-clay/20">·</span>
                          <span className="text-[11px] text-clay/40">{childNames.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {category && (
                    <span className="tag bg-linen text-clay/40 capitalize shrink-0">
                      {category.replace('_', ' ')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Education plan summary */}
      {firstPlan && firstChild && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-light text-ink">
              Education <em className="text-moss italic">Plan</em>
            </h2>
            <Link href="/educator/plans" className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1">
              Edit plan <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Child</p>
              <p className="text-sm font-medium text-umber">{firstChild.name}</p>
            </div>
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Approach</p>
              <p className="text-sm font-medium text-umber capitalize">{firstPlan.approach.replace('_', '-')}</p>
            </div>
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Hours/day</p>
              <p className="text-sm font-medium text-umber">{firstPlan.hours_per_day}h</p>
            </div>
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Days/week</p>
              <p className="text-sm font-medium text-umber">{firstPlan.days_per_week} days</p>
            </div>
          </div>
        </div>
      )}

      {/* All children overview */}
      {children.length > 0 && (
        <div className="card-elevated p-6">
          <h2 className="font-display text-lg font-light text-ink mb-4">
            All <em className="text-moss italic">Children</em>
          </h2>
          <div className="space-y-3">
            {children.map((child) => {
              const childPlan = plans.find((p) => p.child_id === child.id);
              const age = getChildAge(child.date_of_birth);
              const portfolioCount = portfolioCountByChild[child.id] || 0;

              return (
                <div key={child.id} className="flex items-center gap-3 rounded-2xl bg-parchment/30 p-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss/10">
                    <span className="text-sm font-light text-ink">{child.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-umber">{child.name}</p>
                    <p className="text-xs text-clay/50">
                      Age {age}
                      {childPlan ? ` · ${childPlan.approach.replace('_', '-')} · ${childPlan.academic_year}` : ' · No plan yet'}
                      {portfolioCount > 0 ? ` · ${portfolioCount} portfolio entries` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/educator/portfolio/${child.id}`}
                      className="text-xs font-medium text-moss hover:text-forest transition-colors"
                    >
                      Portfolio
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tusla status card */}
      {firstPlan && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-light text-ink">
              Tusla <em className="text-moss italic">Status</em>
            </h2>
            <Link href="/educator/tusla" className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1">
              View compliance <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Registration</p>
              <p className="text-sm font-medium text-umber capitalize">{tuslaStatus.replace('_', ' ')}</p>
            </div>
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Attendance</p>
              <p className="text-sm font-medium text-umber">{attendancePercentage}%</p>
            </div>
            <div className="rounded-2xl bg-parchment/50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40 mb-1">Hours This Week</p>
              <p className="text-sm font-medium text-umber">{hoursThisWeek}h</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {children.length === 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-forest/10 bg-parchment/50">
          <div className="text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-clay/20" />
            <p className="font-medium text-clay/40">No children added yet</p>
            <p className="text-sm text-clay/30 mt-1">
              Add children in settings to start using educator tools.
            </p>
            <Link href="/settings" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Go to settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
