import { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────

export type ReportType = 'assessment' | 'attendance' | 'portfolio' | 'annual';

interface ReportParams {
  supabase: SupabaseClient;
  familyId: string;
  childId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface FamilyDetails {
  name: string;
  county: string | null;
  country: string;
}

interface ChildDetails {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  interests: string[];
  schoolStatus: string;
  learningStyle: string | null;
}

interface EducationPlanSummary {
  academicYear: string;
  approach: string;
  hoursPerDay: number;
  daysPerWeek: number;
  tuslaStatus: string;
  curriculumAreas: Record<string, { priority: string; notes?: string }> | null;
}

interface ActivityLogEntry {
  id: string;
  date: string;
  durationMinutes: number | null;
  notes: string | null;
  rating: number | null;
  curriculumAreasCovered: string[] | null;
  activityTitle: string | null;
  activityCategory: string | null;
}

interface PortfolioEntry {
  id: string;
  date: string;
  title: string;
  description: string | null;
  curriculumAreas: string[];
  activityLogTitle: string | null;
}

interface DailyPlanEntry {
  date: string;
  status: string;
  attendanceLogged: boolean;
  blocks: {
    time: string;
    subject: string;
    title: string;
    duration: number;
    completed: boolean;
  }[];
}

// ─── Date Helpers ─────────────────────────────────────────

export function getAcademicYearDates(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Academic year: September 1 to June 30
  // If we're in Sep-Dec, start is this Sep, end is next Jun
  // If we're in Jan-Aug, start is last Sep, end is this Jun
  const startYear = month >= 8 ? year : year - 1;
  const endYear = month >= 8 ? year + 1 : year;

  return {
    startDate: `${startYear}-09-01`,
    endDate: `${endYear}-06-30`,
  };
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatApproach(approach: string): string {
  const labels: Record<string, string> = {
    structured: 'Structured',
    relaxed: 'Relaxed / Unschooling',
    child_led: 'Child-Led',
    blended: 'Blended',
    exploratory: 'Exploratory',
  };
  return labels[approach] || approach;
}

function formatCategory(cat: string): string {
  const labels: Record<string, string> = {
    nature: 'Nature & Outdoors',
    kitchen: 'Kitchen & Cooking',
    science: 'Science & Discovery',
    art: 'Art & Creativity',
    movement: 'Movement & Physical',
    literacy: 'Literacy & Language',
    maths: 'Maths & Numeracy',
    life_skills: 'Life Skills',
    calm: 'Calm & Mindfulness',
    social: 'Social & Emotional',
  };
  return labels[cat] || cat;
}

function formatTuslaStatus(status: string): string {
  const labels: Record<string, string> = {
    not_applied: 'Not Yet Applied',
    applied: 'Application Submitted',
    awaiting: 'Awaiting Assessment',
    registered: 'Registered',
    review_due: 'Review Due',
  };
  return labels[status] || status;
}

// ─── Data Fetchers ────────────────────────────────────────

async function fetchFamilyDetails(supabase: SupabaseClient, familyId: string): Promise<FamilyDetails> {
  const { data } = await supabase
    .from('families')
    .select('name, county, country')
    .eq('id', familyId)
    .single();

  return {
    name: data?.name || 'Unknown Family',
    county: data?.county || null,
    country: data?.country || 'IE',
  };
}

async function fetchChildDetails(supabase: SupabaseClient, childId: string): Promise<ChildDetails> {
  const { data } = await supabase
    .from('children')
    .select('id, name, date_of_birth, interests, school_status, learning_style')
    .eq('id', childId)
    .single();

  if (!data) throw new Error('Child not found');

  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    age: calculateAge(data.date_of_birth),
    interests: data.interests || [],
    schoolStatus: data.school_status,
    learningStyle: data.learning_style,
  };
}

async function fetchEducationPlan(
  supabase: SupabaseClient,
  familyId: string,
  childId: string
): Promise<EducationPlanSummary | null> {
  const { data } = await supabase
    .from('education_plans')
    .select('*')
    .eq('family_id', familyId)
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    academicYear: data.academic_year,
    approach: data.approach,
    hoursPerDay: data.hours_per_day,
    daysPerWeek: data.days_per_week,
    tuslaStatus: data.tusla_status,
    curriculumAreas: data.curriculum_areas as Record<string, { priority: string; notes?: string }> | null,
  };
}

async function fetchActivityLogs(
  supabase: SupabaseClient,
  familyId: string,
  childId: string,
  startDate: string,
  endDate: string
): Promise<ActivityLogEntry[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('id, date, duration_minutes, notes, rating, curriculum_areas_covered, child_ids, activities(title, category)')
    .eq('family_id', familyId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (!data) return [];

  // Filter logs that include this child
  return data
    .filter((log: Record<string, unknown>) => {
      const childIds = log.child_ids as string[];
      return Array.isArray(childIds) && childIds.includes(childId);
    })
    .map((log: Record<string, unknown>) => {
      const activity = Array.isArray(log.activities)
        ? (log.activities as Record<string, unknown>[])[0]
        : (log.activities as Record<string, unknown> | null);
      return {
        id: log.id as string,
        date: log.date as string,
        durationMinutes: log.duration_minutes as number | null,
        notes: log.notes as string | null,
        rating: log.rating as number | null,
        curriculumAreasCovered: log.curriculum_areas_covered as string[] | null,
        activityTitle: (activity?.title as string) || null,
        activityCategory: (activity?.category as string) || null,
      };
    });
}

async function fetchPortfolioEntries(
  supabase: SupabaseClient,
  childId: string,
  startDate: string,
  endDate: string
): Promise<PortfolioEntry[]> {
  const { data } = await supabase
    .from('portfolio_entries')
    .select('id, date, title, description, curriculum_areas, activity_logs(id, activities(title))')
    .eq('child_id', childId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (!data) return [];

  return data.map((entry: Record<string, unknown>) => {
    const activityLog = Array.isArray(entry.activity_logs)
      ? (entry.activity_logs as Record<string, unknown>[])[0]
      : (entry.activity_logs as Record<string, unknown> | null);
    const activity = activityLog
      ? (Array.isArray(activityLog.activities)
          ? (activityLog.activities as Record<string, unknown>[])[0]
          : (activityLog.activities as Record<string, unknown> | null))
      : null;
    return {
      id: entry.id as string,
      date: entry.date as string,
      title: entry.title as string,
      description: entry.description as string | null,
      curriculumAreas: (entry.curriculum_areas as string[]) || [],
      activityLogTitle: (activity?.title as string) || null,
    };
  });
}

async function fetchDailyPlans(
  supabase: SupabaseClient,
  childId: string,
  startDate: string,
  endDate: string
): Promise<DailyPlanEntry[]> {
  const { data } = await supabase
    .from('daily_plans')
    .select('date, status, attendance_logged, blocks')
    .eq('child_id', childId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (!data) return [];

  return data.map((plan: Record<string, unknown>) => ({
    date: plan.date as string,
    status: plan.status as string,
    attendanceLogged: plan.attendance_logged as boolean,
    blocks: ((plan.blocks as { time: string; subject: string; title: string; duration: number; completed: boolean }[]) || []),
  }));
}

// ─── Report Data Builders ─────────────────────────────────

export interface AssessmentReportData {
  type: 'assessment';
  family: FamilyDetails;
  child: ChildDetails;
  educationPlan: EducationPlanSummary | null;
  dateRange: { start: string; end: string };
  generatedAt: string;
  activitySummary: {
    totalActivities: number;
    totalHours: number;
    categoryCounts: Record<string, number>;
    aistearThemes: Record<string, number>;
  };
  recentActivities: {
    date: string;
    title: string;
    category: string;
    duration: number | null;
  }[];
  curriculumCoverage: {
    area: string;
    priority: string;
    activityCount: number;
    notes?: string;
  }[];
}

export async function buildAssessmentReport(params: ReportParams): Promise<AssessmentReportData> {
  const { supabase, familyId, childId, startDate, endDate } = params;

  const [family, child, educationPlan, logs] = await Promise.all([
    fetchFamilyDetails(supabase, familyId),
    fetchChildDetails(supabase, childId),
    fetchEducationPlan(supabase, familyId, childId),
    fetchActivityLogs(supabase, familyId, childId, startDate, endDate),
  ]);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const log of logs) {
    const cat = log.activityCategory || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Aistear theme mapping (categories -> Aistear themes)
  const aistearMap: Record<string, string[]> = {
    nature: ['Exploring & Thinking', 'Well-being'],
    science: ['Exploring & Thinking'],
    art: ['Communicating', 'Exploring & Thinking'],
    literacy: ['Communicating', 'Identity & Belonging'],
    maths: ['Exploring & Thinking'],
    movement: ['Well-being'],
    kitchen: ['Exploring & Thinking', 'Well-being'],
    life_skills: ['Identity & Belonging', 'Well-being'],
    calm: ['Well-being', 'Identity & Belonging'],
    social: ['Communicating', 'Identity & Belonging'],
  };

  const aistearThemes: Record<string, number> = {};
  for (const log of logs) {
    const themes = aistearMap[log.activityCategory || ''] || [];
    for (const theme of themes) {
      aistearThemes[theme] = (aistearThemes[theme] || 0) + 1;
    }
  }

  // Curriculum coverage based on education plan areas
  const curriculumCoverage: AssessmentReportData['curriculumCoverage'] = [];
  if (educationPlan?.curriculumAreas) {
    for (const [area, config] of Object.entries(educationPlan.curriculumAreas)) {
      // Count logs that mention this curriculum area
      const count = logs.filter(
        (l) => l.curriculumAreasCovered?.includes(area) || l.activityCategory === area
      ).length;
      curriculumCoverage.push({
        area: formatCategory(area),
        priority: config.priority,
        activityCount: count,
        notes: config.notes,
      });
    }
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  return {
    type: 'assessment',
    family,
    child,
    educationPlan,
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date().toISOString(),
    activitySummary: {
      totalActivities: logs.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      categoryCounts,
      aistearThemes,
    },
    recentActivities: logs.slice(0, 10).map((l) => ({
      date: l.date,
      title: l.activityTitle || 'Untitled Activity',
      category: formatCategory(l.activityCategory || 'unknown'),
      duration: l.durationMinutes,
    })),
    curriculumCoverage,
  };
}

// ─── Attendance Report ────────────────────────────────────

export interface AttendanceReportData {
  type: 'attendance';
  family: FamilyDetails;
  child: ChildDetails;
  educationPlan: EducationPlanSummary | null;
  dateRange: { start: string; end: string };
  generatedAt: string;
  monthlyBreakdown: {
    month: string;
    daysAttended: number;
    daysPlanned: number;
    hoursLogged: number;
    hoursRequired: number;
    completionRate: number;
  }[];
  totals: {
    totalDaysAttended: number;
    totalDaysRequired: number;
    totalHoursLogged: number;
    totalHoursRequired: number;
    attendancePercentage: number;
    planCompletionRate: number;
  };
  dailyPlanStats: {
    totalPlans: number;
    completedPlans: number;
    completionRate: number;
  };
}

export async function buildAttendanceReport(params: ReportParams): Promise<AttendanceReportData> {
  const { supabase, familyId, childId, startDate, endDate } = params;

  const [family, child, educationPlan, logs, dailyPlans] = await Promise.all([
    fetchFamilyDetails(supabase, familyId),
    fetchChildDetails(supabase, childId),
    fetchEducationPlan(supabase, familyId, childId),
    fetchActivityLogs(supabase, familyId, childId, startDate, endDate),
    fetchDailyPlans(supabase, childId, startDate, endDate),
  ]);

  const hoursPerDay = educationPlan?.hoursPerDay || 4;
  const daysPerWeek = educationPlan?.daysPerWeek || 5;

  // Group logs by month
  const logsByMonth: Record<string, ActivityLogEntry[]> = {};
  for (const log of logs) {
    const monthKey = log.date.substring(0, 7);
    if (!logsByMonth[monthKey]) logsByMonth[monthKey] = [];
    logsByMonth[monthKey].push(log);
  }

  // Group daily plans by month
  const plansByMonth: Record<string, DailyPlanEntry[]> = {};
  for (const plan of dailyPlans) {
    const monthKey = plan.date.substring(0, 7);
    if (!plansByMonth[monthKey]) plansByMonth[monthKey] = [];
    plansByMonth[monthKey].push(plan);
  }

  // Generate monthly breakdown
  const start = new Date(startDate);
  const end = new Date(endDate);
  const monthlyBreakdown: AttendanceReportData['monthlyBreakdown'] = [];

  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const monthKey = current.toISOString().substring(0, 7);
    const monthName = current.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });

    const monthLogs = logsByMonth[monthKey] || [];
    const monthPlans = plansByMonth[monthKey] || [];

    // Unique days with logged activities
    const uniqueDays = new Set(monthLogs.map((l) => l.date));
    const daysAttended = uniqueDays.size;

    // Calculate weeks in this month (approximate)
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const weeksInMonth = Math.round(daysInMonth / 7);
    const daysPlanned = weeksInMonth * daysPerWeek;

    const hoursLogged = Math.round(
      monthLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0) / 60 * 10
    ) / 10;
    const hoursRequired = Math.round(daysPlanned * hoursPerDay * 10) / 10;

    const completedPlans = monthPlans.filter((p) => p.status === 'completed').length;
    const completionRate = monthPlans.length > 0
      ? Math.round((completedPlans / monthPlans.length) * 100)
      : 0;

    monthlyBreakdown.push({
      month: monthName,
      daysAttended,
      daysPlanned,
      hoursLogged,
      hoursRequired,
      completionRate,
    });

    current.setMonth(current.getMonth() + 1);
  }

  // Calculate totals
  const totalDaysAttended = monthlyBreakdown.reduce((sum, m) => sum + m.daysAttended, 0);
  const totalDaysRequired = monthlyBreakdown.reduce((sum, m) => sum + m.daysPlanned, 0);
  const totalHoursLogged = monthlyBreakdown.reduce((sum, m) => sum + m.hoursLogged, 0);
  const totalHoursRequired = monthlyBreakdown.reduce((sum, m) => sum + m.hoursRequired, 0);

  const completedDailyPlans = dailyPlans.filter((p) => p.status === 'completed').length;

  return {
    type: 'attendance',
    family,
    child,
    educationPlan,
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date().toISOString(),
    monthlyBreakdown,
    totals: {
      totalDaysAttended,
      totalDaysRequired,
      totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
      totalHoursRequired: Math.round(totalHoursRequired * 10) / 10,
      attendancePercentage: totalDaysRequired > 0
        ? Math.round((totalDaysAttended / totalDaysRequired) * 100)
        : 0,
      planCompletionRate: dailyPlans.length > 0
        ? Math.round((completedDailyPlans / dailyPlans.length) * 100)
        : 0,
    },
    dailyPlanStats: {
      totalPlans: dailyPlans.length,
      completedPlans: completedDailyPlans,
      completionRate: dailyPlans.length > 0
        ? Math.round((completedDailyPlans / dailyPlans.length) * 100)
        : 0,
    },
  };
}

// ─── Portfolio Report ─────────────────────────────────────

export interface PortfolioReportData {
  type: 'portfolio';
  family: FamilyDetails;
  child: ChildDetails;
  dateRange: { start: string; end: string };
  generatedAt: string;
  entries: PortfolioEntry[];
  curriculumCoverageSummary: Record<string, number>;
  totalEntries: number;
}

export async function buildPortfolioReport(params: ReportParams): Promise<PortfolioReportData> {
  const { supabase, familyId, childId, startDate, endDate } = params;

  const [family, child, entries] = await Promise.all([
    fetchFamilyDetails(supabase, familyId),
    fetchChildDetails(supabase, childId),
    fetchPortfolioEntries(supabase, childId, startDate, endDate),
  ]);

  // Curriculum coverage summary
  const curriculumCoverageSummary: Record<string, number> = {};
  for (const entry of entries) {
    for (const area of entry.curriculumAreas) {
      curriculumCoverageSummary[area] = (curriculumCoverageSummary[area] || 0) + 1;
    }
  }

  return {
    type: 'portfolio',
    family,
    child,
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date().toISOString(),
    entries,
    curriculumCoverageSummary,
    totalEntries: entries.length,
  };
}

// ─── Annual Report (combines all) ────────────────────────

export interface AnnualReportData {
  type: 'annual';
  assessment: AssessmentReportData;
  attendance: AttendanceReportData;
  portfolio: PortfolioReportData;
}

export async function buildAnnualReport(params: ReportParams): Promise<AnnualReportData> {
  const [assessment, attendance, portfolio] = await Promise.all([
    buildAssessmentReport(params),
    buildAttendanceReport(params),
    buildPortfolioReport(params),
  ]);

  return {
    type: 'annual',
    assessment,
    attendance,
    portfolio,
  };
}

// ─── HTML Report Renderer ─────────────────────────────────

function htmlShell(title: string, childName: string, dateRange: string, generatedAt: string, body: string): string {
  const genDate = new Date(generatedAt).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${childName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

    :root {
      --forest: #1C3520;
      --parchment: #F5F0E4;
      --linen: #EDE6D3;
      --stone: #D5C9B0;
      --sage: #8FAF7E;
      --moss: #3D6142;
      --terracotta: #C4623A;
      --ink: #1A1612;
      --umber: #6B4F35;
      --clay: #9E7B5A;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink);
      background: #fff;
      font-size: 14px;
      line-height: 1.6;
      padding: 0;
    }

    .report {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    /* Header */
    .report-header {
      border-bottom: 3px solid var(--forest);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }

    .report-header .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 300;
      color: var(--forest);
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .report-header .subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--clay);
      margin-bottom: 20px;
    }

    .report-header .report-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }

    .report-header .meta {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: var(--umber);
    }

    .report-header .meta span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Sections */
    .section {
      margin-bottom: 32px;
    }

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--forest);
      border-bottom: 1px solid var(--stone);
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 32px;
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      gap: 8px;
    }

    .info-label {
      font-weight: 500;
      color: var(--umber);
      min-width: 140px;
      font-size: 13px;
    }

    .info-value {
      color: var(--ink);
      font-size: 13px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }

    thead th {
      background: var(--forest);
      color: #fff;
      padding: 10px 12px;
      text-align: left;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tbody td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--stone);
    }

    tbody tr:nth-child(even) {
      background: var(--parchment);
    }

    tbody tr:last-child td {
      border-bottom: 2px solid var(--forest);
    }

    /* Stats Cards */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--parchment);
      border: 1px solid var(--stone);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-card .stat-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 600;
      color: var(--forest);
      line-height: 1.1;
    }

    .stat-card .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--umber);
      margin-top: 4px;
    }

    /* Progress Bar */
    .progress-bar-container {
      background: var(--stone);
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: var(--sage);
      transition: width 0.3s;
    }

    .progress-bar-fill.high { background: var(--moss); }
    .progress-bar-fill.medium { background: var(--sage); }
    .progress-bar-fill.low { background: var(--terracotta); }

    /* Tags */
    .tag {
      display: inline-block;
      background: var(--linen);
      border: 1px solid var(--stone);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      color: var(--umber);
      margin: 2px 4px 2px 0;
    }

    /* Footer */
    .report-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid var(--stone);
      text-align: center;
      font-size: 11px;
      color: var(--clay);
    }

    .report-footer .generated {
      margin-bottom: 4px;
    }

    /* Page break helper */
    .page-break {
      page-break-before: always;
      margin-top: 0;
      padding-top: 24px;
    }

    /* Annual report section divider */
    .annual-divider {
      text-align: center;
      margin: 40px 0 32px;
      page-break-before: always;
    }

    .annual-divider .divider-line {
      border: none;
      border-top: 2px solid var(--forest);
      margin-bottom: 16px;
    }

    .annual-divider h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--forest);
    }

    /* Print styles */
    @media print {
      body { padding: 0; font-size: 12px; }
      .report { padding: 20px; max-width: none; }
      .stat-card { break-inside: avoid; }
      table { break-inside: avoid; }
      .section { break-inside: avoid; }
      .page-break { page-break-before: always; }
      .no-print { display: none !important; }
    }

    /* Print button */
    .print-button {
      position: fixed;
      top: 16px;
      right: 16px;
      background: var(--forest);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .print-button:hover {
      background: var(--moss);
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
  <div class="report">
    <div class="report-header">
      <div class="brand">The Hedge</div>
      <div class="subtitle">Home Education Record</div>
      <div class="report-title">${title}</div>
      <div class="meta">
        <span><strong>Child:</strong> ${childName}</span>
        <span><strong>Period:</strong> ${dateRange}</span>
        <span><strong>Generated:</strong> ${genDate}</span>
      </div>
    </div>
    ${body}
    <div class="report-footer">
      <div class="generated">Report generated on ${genDate} by The Hedge platform</div>
      <div>Generated by The Hedge &mdash; thehedge.ie</div>
    </div>
  </div>
</body>
</html>`;
}

function formatDateDisplay(d: string): string {
  return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRange(start: string, end: string): string {
  return `${formatDateDisplay(start)} &ndash; ${formatDateDisplay(end)}`;
}

function progressBar(percentage: number): string {
  const cls = percentage >= 80 ? 'high' : percentage >= 50 ? 'medium' : 'low';
  return `<div class="progress-bar-container"><div class="progress-bar-fill ${cls}" style="width: ${Math.min(percentage, 100)}%"></div></div>`;
}

// ─── Assessment HTML ──────────────────────────────────────

export function renderAssessmentHtml(data: AssessmentReportData): string {
  const { family, child, educationPlan, activitySummary, recentActivities, curriculumCoverage, dateRange, generatedAt } = data;

  let body = '';

  // Child & Family Details
  body += `
    <div class="section">
      <h3 class="section-title">Child &amp; Family Details</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Family Name</span><span class="info-value">${family.name}</span></div>
        <div class="info-row"><span class="info-label">County</span><span class="info-value">${family.county || 'Not specified'}</span></div>
        <div class="info-row"><span class="info-label">Child&rsquo;s Name</span><span class="info-value">${child.name}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${formatDateDisplay(child.dateOfBirth)}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span class="info-value">${child.age} years</span></div>
        <div class="info-row"><span class="info-label">Learning Style</span><span class="info-value">${child.learningStyle || 'Not specified'}</span></div>
      </div>
    </div>`;

  // Education Plan
  if (educationPlan) {
    body += `
    <div class="section">
      <h3 class="section-title">Education Plan</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Academic Year</span><span class="info-value">${educationPlan.academicYear}</span></div>
        <div class="info-row"><span class="info-label">Approach</span><span class="info-value">${formatApproach(educationPlan.approach)}</span></div>
        <div class="info-row"><span class="info-label">Hours per Day</span><span class="info-value">${educationPlan.hoursPerDay}</span></div>
        <div class="info-row"><span class="info-label">Days per Week</span><span class="info-value">${educationPlan.daysPerWeek}</span></div>
        <div class="info-row"><span class="info-label">Tusla Status</span><span class="info-value">${formatTuslaStatus(educationPlan.tuslaStatus)}</span></div>
      </div>
    </div>`;
  }

  // Activity Summary
  body += `
    <div class="section">
      <h3 class="section-title">Activity Summary</h3>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${activitySummary.totalActivities}</div>
          <div class="stat-label">Activities Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${activitySummary.totalHours}</div>
          <div class="stat-label">Total Hours</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(activitySummary.categoryCounts).filter(k => k !== 'unknown').length}</div>
          <div class="stat-label">Categories Covered</div>
        </div>
      </div>
    </div>`;

  // Category Breakdown
  if (Object.keys(activitySummary.categoryCounts).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Category Breakdown</h3>
      <table>
        <thead><tr><th>Category</th><th>Activities</th><th>Proportion</th></tr></thead>
        <tbody>`;
    const total = activitySummary.totalActivities || 1;
    for (const [cat, count] of Object.entries(activitySummary.categoryCounts).sort((a, b) => b[1] - a[1])) {
      const pct = Math.round((count / total) * 100);
      body += `<tr><td>${formatCategory(cat)}</td><td>${count}</td><td>${pct}% ${progressBar(pct)}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Aistear Theme Coverage
  if (Object.keys(activitySummary.aistearThemes).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Aistear Theme Coverage</h3>
      <table>
        <thead><tr><th>Theme</th><th>Activities Contributing</th></tr></thead>
        <tbody>`;
    for (const [theme, count] of Object.entries(activitySummary.aistearThemes).sort((a, b) => b[1] - a[1])) {
      body += `<tr><td>${theme}</td><td>${count}</td></tr>`;
    }
    body += `</tbody></table>
      <p style="font-size: 12px; color: var(--clay); margin-top: 8px;">
        Aistear themes: Well-being, Identity &amp; Belonging, Communicating, and Exploring &amp; Thinking.
        Activities may contribute to multiple themes.
      </p>
    </div>`;
  }

  // Curriculum Coverage
  if (curriculumCoverage.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Curriculum Area Coverage</h3>
      <table>
        <thead><tr><th>Area</th><th>Priority</th><th>Activities</th><th>Notes</th></tr></thead>
        <tbody>`;
    for (const area of curriculumCoverage) {
      body += `<tr><td>${area.area}</td><td>${area.priority}</td><td>${area.activityCount}</td><td>${area.notes || '&mdash;'}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Recent Activities
  if (recentActivities.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Recent Activities (Last 10)</h3>
      <table>
        <thead><tr><th>Date</th><th>Activity</th><th>Category</th><th>Duration</th></tr></thead>
        <tbody>`;
    for (const act of recentActivities) {
      body += `<tr><td>${formatDateDisplay(act.date)}</td><td>${act.title}</td><td>${act.category}</td><td>${act.duration ? act.duration + ' min' : '&mdash;'}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  return htmlShell('Assessment Report', child.name, formatDateRange(dateRange.start, dateRange.end), generatedAt, body);
}

// ─── Attendance HTML ──────────────────────────────────────

export function renderAttendanceHtml(data: AttendanceReportData): string {
  const { family, child, educationPlan, monthlyBreakdown, totals, dailyPlanStats, dateRange, generatedAt } = data;

  let body = '';

  // Child & Family Details
  body += `
    <div class="section">
      <h3 class="section-title">Child &amp; Family Details</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Family Name</span><span class="info-value">${family.name}</span></div>
        <div class="info-row"><span class="info-label">Child&rsquo;s Name</span><span class="info-value">${child.name}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${formatDateDisplay(child.dateOfBirth)}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span class="info-value">${child.age} years</span></div>
      </div>
    </div>`;

  // Education Plan Requirements
  if (educationPlan) {
    body += `
    <div class="section">
      <h3 class="section-title">Education Requirements</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Planned Hours/Day</span><span class="info-value">${educationPlan.hoursPerDay}</span></div>
        <div class="info-row"><span class="info-label">Planned Days/Week</span><span class="info-value">${educationPlan.daysPerWeek}</span></div>
        <div class="info-row"><span class="info-label">Approach</span><span class="info-value">${formatApproach(educationPlan.approach)}</span></div>
      </div>
    </div>`;
  }

  // Overall Stats
  body += `
    <div class="section">
      <h3 class="section-title">Overall Attendance</h3>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${totals.attendancePercentage}%</div>
          <div class="stat-label">Attendance Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totals.totalDaysAttended}</div>
          <div class="stat-label">Days Attended</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totals.totalHoursLogged}</div>
          <div class="stat-label">Hours Logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totals.planCompletionRate}%</div>
          <div class="stat-label">Plan Completion</div>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span>Hours: ${totals.totalHoursLogged} of ${totals.totalHoursRequired} required</span>
          <span>${totals.totalHoursRequired > 0 ? Math.round((totals.totalHoursLogged / totals.totalHoursRequired) * 100) : 0}%</span>
        </div>
        ${progressBar(totals.totalHoursRequired > 0 ? (totals.totalHoursLogged / totals.totalHoursRequired) * 100 : 0)}
      </div>
    </div>`;

  // Monthly Breakdown
  if (monthlyBreakdown.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Monthly Attendance Breakdown</h3>
      <table>
        <thead><tr><th>Month</th><th>Days Attended</th><th>Days Planned</th><th>Hours Logged</th><th>Hours Required</th><th>Plan Completion</th></tr></thead>
        <tbody>`;
    for (const month of monthlyBreakdown) {
      body += `<tr>
        <td>${month.month}</td>
        <td>${month.daysAttended}</td>
        <td>${month.daysPlanned}</td>
        <td>${month.hoursLogged}</td>
        <td>${month.hoursRequired}</td>
        <td>${month.completionRate}%</td>
      </tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Daily Plan Stats
  body += `
    <div class="section">
      <h3 class="section-title">Daily Plan Statistics</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Total Plans Created</span><span class="info-value">${dailyPlanStats.totalPlans}</span></div>
        <div class="info-row"><span class="info-label">Plans Completed</span><span class="info-value">${dailyPlanStats.completedPlans}</span></div>
        <div class="info-row"><span class="info-label">Completion Rate</span><span class="info-value">${dailyPlanStats.completionRate}%</span></div>
      </div>
    </div>`;

  return htmlShell('Attendance Report', child.name, formatDateRange(dateRange.start, dateRange.end), generatedAt, body);
}

// ─── Portfolio HTML ───────────────────────────────────────

export function renderPortfolioHtml(data: PortfolioReportData): string {
  const { family, child, entries, curriculumCoverageSummary, dateRange, generatedAt } = data;

  let body = '';

  // Child & Family Details
  body += `
    <div class="section">
      <h3 class="section-title">Child &amp; Family Details</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Family Name</span><span class="info-value">${family.name}</span></div>
        <div class="info-row"><span class="info-label">Child&rsquo;s Name</span><span class="info-value">${child.name}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${formatDateDisplay(child.dateOfBirth)}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span class="info-value">${child.age} years</span></div>
      </div>
    </div>`;

  // Summary Stats
  body += `
    <div class="section">
      <h3 class="section-title">Portfolio Summary</h3>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${entries.length}</div>
          <div class="stat-label">Portfolio Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(curriculumCoverageSummary).length}</div>
          <div class="stat-label">Curriculum Areas</div>
        </div>
      </div>
    </div>`;

  // Curriculum Coverage
  if (Object.keys(curriculumCoverageSummary).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Curriculum Area Coverage</h3>
      <table>
        <thead><tr><th>Curriculum Area</th><th>Portfolio Entries</th></tr></thead>
        <tbody>`;
    for (const [area, count] of Object.entries(curriculumCoverageSummary).sort((a, b) => b[1] - a[1])) {
      body += `<tr><td>${formatCategory(area)}</td><td>${count}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Portfolio Entries
  if (entries.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Portfolio Entries</h3>
      <table>
        <thead><tr><th>Date</th><th>Title</th><th>Curriculum Areas</th><th>Linked Activity</th></tr></thead>
        <tbody>`;
    for (const entry of entries) {
      const areas = entry.curriculumAreas.map((a) => `<span class="tag">${formatCategory(a)}</span>`).join('');
      body += `<tr>
        <td>${formatDateDisplay(entry.date)}</td>
        <td><strong>${entry.title}</strong>${entry.description ? `<br><span style="font-size: 12px; color: var(--umber);">${entry.description}</span>` : ''}</td>
        <td>${areas || '&mdash;'}</td>
        <td>${entry.activityLogTitle || '&mdash;'}</td>
      </tr>`;
    }
    body += `</tbody></table></div>`;
  } else {
    body += `<div class="section"><p style="color: var(--clay);">No portfolio entries found for this period.</p></div>`;
  }

  return htmlShell('Portfolio Summary', child.name, formatDateRange(dateRange.start, dateRange.end), generatedAt, body);
}

// ─── Annual Report HTML ──────────────────────────────────

export function renderAnnualHtml(data: AnnualReportData): string {
  const { assessment, attendance, portfolio } = data;
  const child = assessment.child;
  const family = assessment.family;
  const dateRange = assessment.dateRange;
  const generatedAt = assessment.generatedAt;

  let body = '';

  // Executive Summary
  body += `
    <div class="section">
      <h3 class="section-title">Annual Overview</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Family Name</span><span class="info-value">${family.name}</span></div>
        <div class="info-row"><span class="info-label">County</span><span class="info-value">${family.county || 'Not specified'}</span></div>
        <div class="info-row"><span class="info-label">Child&rsquo;s Name</span><span class="info-value">${child.name}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${formatDateDisplay(child.dateOfBirth)}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span class="info-value">${child.age} years</span></div>
        <div class="info-row"><span class="info-label">Interests</span><span class="info-value">${child.interests.length > 0 ? child.interests.join(', ') : 'Not specified'}</span></div>
      </div>
      <div class="stats-row" style="margin-top: 24px;">
        <div class="stat-card">
          <div class="stat-value">${assessment.activitySummary.totalActivities}</div>
          <div class="stat-label">Activities</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${assessment.activitySummary.totalHours}</div>
          <div class="stat-label">Hours Learning</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${attendance.totals.attendancePercentage}%</div>
          <div class="stat-label">Attendance</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${portfolio.totalEntries}</div>
          <div class="stat-label">Portfolio Entries</div>
        </div>
      </div>
    </div>`;

  // Education Plan
  if (assessment.educationPlan) {
    const plan = assessment.educationPlan;
    body += `
    <div class="section">
      <h3 class="section-title">Education Plan</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Academic Year</span><span class="info-value">${plan.academicYear}</span></div>
        <div class="info-row"><span class="info-label">Approach</span><span class="info-value">${formatApproach(plan.approach)}</span></div>
        <div class="info-row"><span class="info-label">Hours per Day</span><span class="info-value">${plan.hoursPerDay}</span></div>
        <div class="info-row"><span class="info-label">Days per Week</span><span class="info-value">${plan.daysPerWeek}</span></div>
        <div class="info-row"><span class="info-label">Tusla Status</span><span class="info-value">${formatTuslaStatus(plan.tuslaStatus)}</span></div>
      </div>
    </div>`;
  }

  // Section: Assessment
  body += `
    <div class="annual-divider">
      <hr class="divider-line" />
      <h2>Part 1: Assessment &amp; Curriculum</h2>
    </div>`;

  // Category Breakdown
  if (Object.keys(assessment.activitySummary.categoryCounts).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Category Breakdown</h3>
      <table>
        <thead><tr><th>Category</th><th>Activities</th><th>Proportion</th></tr></thead>
        <tbody>`;
    const total = assessment.activitySummary.totalActivities || 1;
    for (const [cat, count] of Object.entries(assessment.activitySummary.categoryCounts).sort((a, b) => b[1] - a[1])) {
      const pct = Math.round((count / total) * 100);
      body += `<tr><td>${formatCategory(cat)}</td><td>${count}</td><td>${pct}% ${progressBar(pct)}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Aistear Themes
  if (Object.keys(assessment.activitySummary.aistearThemes).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Aistear Theme Coverage</h3>
      <table>
        <thead><tr><th>Theme</th><th>Activities Contributing</th></tr></thead>
        <tbody>`;
    for (const [theme, count] of Object.entries(assessment.activitySummary.aistearThemes).sort((a, b) => b[1] - a[1])) {
      body += `<tr><td>${theme}</td><td>${count}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Curriculum Coverage
  if (assessment.curriculumCoverage.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Curriculum Area Coverage</h3>
      <table>
        <thead><tr><th>Area</th><th>Priority</th><th>Activities</th><th>Notes</th></tr></thead>
        <tbody>`;
    for (const area of assessment.curriculumCoverage) {
      body += `<tr><td>${area.area}</td><td>${area.priority}</td><td>${area.activityCount}</td><td>${area.notes || '&mdash;'}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Recent Activities
  if (assessment.recentActivities.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Sample Activities</h3>
      <table>
        <thead><tr><th>Date</th><th>Activity</th><th>Category</th><th>Duration</th></tr></thead>
        <tbody>`;
    for (const act of assessment.recentActivities) {
      body += `<tr><td>${formatDateDisplay(act.date)}</td><td>${act.title}</td><td>${act.category}</td><td>${act.duration ? act.duration + ' min' : '&mdash;'}</td></tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Section: Attendance
  body += `
    <div class="annual-divider">
      <hr class="divider-line" />
      <h2>Part 2: Attendance Record</h2>
    </div>`;

  body += `
    <div class="section">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${attendance.totals.attendancePercentage}%</div>
          <div class="stat-label">Attendance Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${attendance.totals.totalDaysAttended}</div>
          <div class="stat-label">Days Attended</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${attendance.totals.totalHoursLogged}</div>
          <div class="stat-label">Hours Logged</div>
        </div>
      </div>
    </div>`;

  if (attendance.monthlyBreakdown.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Monthly Attendance</h3>
      <table>
        <thead><tr><th>Month</th><th>Days</th><th>Hours</th><th>Plan Completion</th></tr></thead>
        <tbody>`;
    for (const month of attendance.monthlyBreakdown) {
      body += `<tr>
        <td>${month.month}</td>
        <td>${month.daysAttended} / ${month.daysPlanned}</td>
        <td>${month.hoursLogged} / ${month.hoursRequired}</td>
        <td>${month.completionRate}%</td>
      </tr>`;
    }
    body += `</tbody></table></div>`;
  }

  // Section: Portfolio
  body += `
    <div class="annual-divider">
      <hr class="divider-line" />
      <h2>Part 3: Portfolio of Learning</h2>
    </div>`;

  body += `
    <div class="section">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${portfolio.totalEntries}</div>
          <div class="stat-label">Portfolio Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(portfolio.curriculumCoverageSummary).length}</div>
          <div class="stat-label">Curriculum Areas</div>
        </div>
      </div>
    </div>`;

  if (portfolio.entries.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Portfolio Entries</h3>
      <table>
        <thead><tr><th>Date</th><th>Title</th><th>Curriculum Areas</th></tr></thead>
        <tbody>`;
    for (const entry of portfolio.entries) {
      const areas = entry.curriculumAreas.map((a) => `<span class="tag">${formatCategory(a)}</span>`).join('');
      body += `<tr>
        <td>${formatDateDisplay(entry.date)}</td>
        <td><strong>${entry.title}</strong>${entry.description ? `<br><span style="font-size: 12px; color: var(--umber);">${entry.description}</span>` : ''}</td>
        <td>${areas || '&mdash;'}</td>
      </tr>`;
    }
    body += `</tbody></table></div>`;
  }

  return htmlShell(
    'Annual Education Report',
    child.name,
    formatDateRange(dateRange.start, dateRange.end),
    generatedAt,
    body
  );
}
