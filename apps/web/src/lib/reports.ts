import { SupabaseClient } from '@supabase/supabase-js';
import { signPortfolioPhotos } from '@/lib/storage';

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
  photos: string[];
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

// Map an activity category to the NCCA primary curriculum areas it nourishes.
// Framed as a helpful map, not a required curriculum: the standard in Ireland is
// 'a certain minimum education suitable to the child's age, ability and aptitude'.
const NCCA_AREA_MAP: Record<string, string[]> = {
  nature: ['Social, Environmental & Scientific Education'],
  science: ['Social, Environmental & Scientific Education', 'Mathematics'],
  art: ['Arts Education'],
  literacy: ['Language'],
  maths: ['Mathematics'],
  movement: ['Physical Education'],
  kitchen: ['Social, Environmental & Scientific Education', 'Social, Personal & Health Education'],
  life_skills: ['Social, Personal & Health Education'],
  calm: ['Social, Personal & Health Education'],
  social: ['Social, Personal & Health Education', 'Language'],
};

// The six NCCA primary curriculum areas, in their conventional order.
const NCCA_AREAS = [
  'Language',
  'Mathematics',
  'Social, Environmental & Scientific Education',
  'Arts Education',
  'Physical Education',
  'Social, Personal & Health Education',
] as const;

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
    .select('id, date, title, description, curriculum_areas, photos, activity_logs(id, activities(title))')
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
      photos: (entry.photos as string[]) || [],
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

// A portfolio entry with its Storage photo paths already signed into
// displayable URLs, ready to embed as <img> evidence in the AEARS pack.
export interface PortfolioEntryWithPhotos extends PortfolioEntry {
  signedPhotos: string[];
}

export interface NccaAreaCoverage {
  area: string;
  activityCount: number;
  covered: boolean;
}

export interface AnnualReportData {
  type: 'annual';
  assessment: AssessmentReportData;
  attendance: AttendanceReportData;
  portfolio: PortfolioReportData;
  // ── AEARS pack additions ──────────────────────────────
  // A warm, honest narrative of the child's year, assembled from real data.
  narrative: string;
  // Coverage across the six NCCA primary areas (a map, not a requirement).
  nccaCoverage: NccaAreaCoverage[];
  // Portfolio entries with their photo evidence signed for embedding.
  portfolioWithPhotos: PortfolioEntryWithPhotos[];
  academicYear: string;
}

// Build a calm, honest few-sentence summary of the child's year from real data.
function buildAnnualNarrative(
  assessment: AssessmentReportData,
  portfolio: PortfolioReportData,
  nccaCoverage: NccaAreaCoverage[]
): string {
  const child = assessment.child;
  const total = assessment.activitySummary.totalActivities;
  const categoriesCovered = Object.keys(assessment.activitySummary.categoryCounts).filter(
    (k) => k !== 'unknown'
  );
  const areasTouched = nccaCoverage.filter((a) => a.covered).length;

  // Standout areas: the two most active categories.
  const ranked = Object.entries(assessment.activitySummary.categoryCounts)
    .filter(([cat]) => cat !== 'unknown')
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => formatCategory(cat));
  const standout = ranked.slice(0, 2);

  if (total === 0 && portfolio.totalEntries === 0) {
    return `This pack gathers ${child.name}'s home education for the year. As learning is recorded through the year, it will fill out here with the activities, areas covered, and portfolio evidence that show the breadth of ${child.name}'s days.`;
  }

  const parts: string[] = [];
  parts.push(
    `Over this academic year, ${child.name} (age ${child.age}) has learned through ${total} recorded ${total === 1 ? 'activity' : 'activities'} across ${categoriesCovered.length} ${categoriesCovered.length === 1 ? 'area of life' : 'areas of life'} at home.`
  );

  if (areasTouched > 0) {
    parts.push(
      `This learning touched ${areasTouched} of the six NCCA primary curriculum areas, a breadth that reflects a rounded, everyday education suited to ${child.name}'s age, ability and aptitude.`
    );
  }

  if (standout.length > 0) {
    parts.push(
      standout.length === 1
        ? `${standout[0]} was a particular thread running through the year.`
        : `${standout[0]} and ${standout[1]} were particular threads running through the year.`
    );
  }

  if (portfolio.totalEntries > 0) {
    parts.push(
      `Alongside the day-to-day learning, the family kept a portfolio of ${portfolio.totalEntries} ${portfolio.totalEntries === 1 ? 'piece' : 'pieces'} of work and moments worth holding onto, included later in this pack with their photo evidence.`
    );
  }

  if (child.interests.length > 0) {
    parts.push(
      `${child.name}'s interests this year included ${child.interests.slice(0, 4).join(', ')}, which helped guide what the days looked like.`
    );
  }

  return parts.join(' ');
}

export async function buildAnnualReport(params: ReportParams): Promise<AnnualReportData> {
  const [assessment, attendance, portfolio] = await Promise.all([
    buildAssessmentReport(params),
    buildAttendanceReport(params),
    buildPortfolioReport(params),
  ]);

  // ── NCCA area coverage (a helpful map, not a requirement) ──
  // Count activities per NCCA area via the category mapping, and fold in any
  // portfolio entries tagged to those underlying categories.
  const nccaCounts: Record<string, number> = {};
  for (const area of NCCA_AREAS) nccaCounts[area] = 0;
  for (const [cat, count] of Object.entries(assessment.activitySummary.categoryCounts)) {
    for (const area of NCCA_AREA_MAP[cat] || []) {
      nccaCounts[area] = (nccaCounts[area] || 0) + count;
    }
  }
  for (const entry of portfolio.entries) {
    for (const cat of entry.curriculumAreas) {
      for (const area of NCCA_AREA_MAP[cat] || []) {
        nccaCounts[area] = (nccaCounts[area] || 0) + 1;
      }
    }
  }
  const nccaCoverage: NccaAreaCoverage[] = NCCA_AREAS.map((area) => ({
    area,
    activityCount: nccaCounts[area] || 0,
    covered: (nccaCounts[area] || 0) > 0,
  }));

  // ── Sign portfolio photos for embedding as evidence ──
  // Storage paths become time-limited signed URLs; legacy data/http URLs pass
  // through unchanged. This is the key gap the AEARS pack now closes.
  const portfolioWithPhotos: PortfolioEntryWithPhotos[] = await Promise.all(
    portfolio.entries.map(async (entry) => ({
      ...entry,
      signedPhotos: await signPortfolioPhotos(entry.photos),
    }))
  );

  const narrative = buildAnnualNarrative(assessment, portfolio, nccaCoverage);

  return {
    type: 'annual',
    assessment,
    attendance,
    portfolio,
    narrative,
    nccaCoverage,
    portfolioWithPhotos,
    academicYear: assessment.educationPlan?.academicYear || '',
  };
}

// ─── HTML Report Renderer ─────────────────────────────────

function htmlStyleBlock(): string {
  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

    :root {
      --forest: #1C3520;
      --parchment: #F2F5F0;
      --linen: #FFFFFF;
      --stone: #D8DDD5;
      --sage: #8A9B8E;
      --moss: #4CAF7C;
      --terracotta: #4CAF7C;
      --ink: #1A2E1E;
      --umber: #1A2E1E;
      --clay: #5A6B5E;
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

    /* ── AEARS pack: cover page ── */
    .cover {
      min-height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
    }
    .cover .cover-brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 34px;
      font-weight: 300;
      color: var(--forest);
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .cover .cover-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--clay);
      margin-bottom: 48px;
    }
    .cover .cover-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 40px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.15;
      margin-bottom: 12px;
    }
    .cover .cover-child {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 400;
      color: var(--forest);
      margin-bottom: 40px;
    }
    .cover .cover-meta {
      display: inline-block;
      text-align: left;
      background: var(--parchment);
      border: 1px solid var(--stone);
      border-radius: 12px;
      padding: 20px 28px;
      margin: 0 auto 40px;
    }
    .cover .cover-meta div {
      font-size: 13px;
      color: var(--ink);
      padding: 3px 0;
    }
    .cover .cover-meta strong {
      display: inline-block;
      min-width: 140px;
      color: var(--clay);
      font-weight: 500;
    }
    .cover .cover-note {
      max-width: 460px;
      margin: 0 auto;
      font-size: 12px;
      font-style: italic;
      color: var(--clay);
      line-height: 1.6;
    }

    /* ── Narrative block ── */
    .narrative {
      background: var(--parchment);
      border-left: 3px solid var(--moss);
      border-radius: 4px;
      padding: 20px 24px;
      font-size: 14px;
      line-height: 1.8;
      color: var(--ink);
    }

    /* ── NCCA coverage grid ── */
    .coverage-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .coverage-card {
      border: 1px solid var(--stone);
      border-radius: 8px;
      padding: 14px 16px;
      background: #fff;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .coverage-card.covered {
      background: var(--parchment);
      border-color: var(--sage);
    }
    .coverage-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
      background: var(--stone);
    }
    .coverage-card.covered .coverage-dot { background: var(--moss); }
    .coverage-card .coverage-area {
      font-weight: 600;
      font-size: 13px;
      color: var(--ink);
    }
    .coverage-card .coverage-count {
      font-size: 11px;
      color: var(--clay);
      margin-top: 2px;
    }

    /* ── Portfolio evidence (with photos) ── */
    .portfolio-entry {
      border: 1px solid var(--stone);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      break-inside: avoid;
    }
    .portfolio-entry .entry-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 6px;
    }
    .portfolio-entry .entry-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--forest);
    }
    .portfolio-entry .entry-date {
      font-size: 12px;
      color: var(--clay);
      white-space: nowrap;
    }
    .portfolio-entry .entry-desc {
      font-size: 13px;
      color: var(--ink);
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .portfolio-entry .entry-tags { margin-bottom: 12px; }
    .photo-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .photo-gallery img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--stone);
      background: var(--parchment);
    }
    .no-photo-note {
      font-size: 11px;
      color: var(--clay);
      font-style: italic;
    }

    /* ── Disclaimer panel ── */
    .disclaimer-panel {
      background: var(--parchment);
      border: 1px solid var(--stone);
      border-radius: 10px;
      padding: 20px 24px;
      font-size: 12px;
      line-height: 1.7;
      color: var(--clay);
    }
    .disclaimer-panel strong { color: var(--umber); }

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
  </style>`;
}

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
  ${htmlStyleBlock()}
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

// Escape user-supplied text so titles/descriptions/photo URLs render safely.
function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  const { family, child, monthlyBreakdown, totals, dateRange, generatedAt } = data;

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

  // Overall record - descriptive, never framed as attendance against a requirement.
  body += `
    <div class="section">
      <h3 class="section-title">Overall Record of Learning</h3>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${totals.totalDaysAttended}</div>
          <div class="stat-label">Days of Learning</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totals.totalHoursLogged}</div>
          <div class="stat-label">Hours Logged</div>
        </div>
      </div>
      <p style="font-size: 11px; color: #888; margin-top: 8px;">This is a descriptive record of the learning you chose to log over this period, not a measure of attendance. AEARS sets no minimum number of hours or days; a home education is assessed on whether a certain minimum education is being provided, not on attendance.</p>
    </div>`;

  // Month by month - days of learning and hours logged only.
  if (monthlyBreakdown.length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Month by Month</h3>
      <table>
        <thead><tr><th>Month</th><th>Days of Learning</th><th>Hours Logged</th></tr></thead>
        <tbody>`;
    for (const month of monthlyBreakdown) {
      body += `<tr>
        <td>${month.month}</td>
        <td>${month.daysAttended}</td>
        <td>${month.hoursLogged}</td>
      </tr>`;
    }
    body += `</tbody></table></div>`;
  }

  return htmlShell('Learning Rhythm', child.name, formatDateRange(dateRange.start, dateRange.end), generatedAt, body);
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

// A dedicated shell for the AEARS pack: it leads with a full cover page and
// closes with the honest Tusla disclaimer, reusing the shared report styling.
function aearsShell(childName: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEARS Pack - ${esc(childName)}</title>
  ${htmlStyleBlock()}
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
  <div class="report">
    ${body}
  </div>
</body>
</html>`;
}

export function renderAnnualHtml(data: AnnualReportData): string {
  const { assessment, attendance, portfolio, narrative, nccaCoverage, portfolioWithPhotos, academicYear } = data;
  const child = assessment.child;
  const family = assessment.family;
  const dateRange = assessment.dateRange;
  const generatedAt = assessment.generatedAt;

  const genDate = new Date(generatedAt).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const periodLabel = academicYear
    ? `${esc(academicYear)} academic year`
    : `${formatDateDisplay(dateRange.start)} to ${formatDateDisplay(dateRange.end)}`;

  let body = '';

  // ── Cover page ──────────────────────────────────────────
  body += `
    <div class="cover">
      <div class="cover-brand">The Hedge</div>
      <div class="cover-eyebrow">Home Education Portfolio</div>
      <div class="cover-title">Assessment Pack</div>
      <div class="cover-child">${esc(child.name)} &middot; age ${child.age}</div>
      <div class="cover-meta">
        <div><strong>Family</strong> ${esc(family.name)}</div>
        <div><strong>Child</strong> ${esc(child.name)} (${formatDateDisplay(child.dateOfBirth)})</div>
        <div><strong>Period</strong> ${periodLabel}</div>
        ${family.county ? `<div><strong>County</strong> ${esc(family.county)}</div>` : ''}
        <div><strong>Prepared</strong> ${genDate}</div>
      </div>
      <p class="cover-note">
        Prepared by the family using The Hedge. Not affiliated with Tusla.
        A portfolio assembled to support an application or review under the
        Alternative Education Assessment and Registration Service (AEARS).
      </p>
    </div>`;

  // ── Narrative summary of the year ───────────────────────
  body += `
    <div class="section page-break">
      <h3 class="section-title">${esc(child.name)}&rsquo;s Year</h3>
      <div class="narrative">${esc(narrative)}</div>
    </div>`;

  // ── Child & family details ──────────────────────────────
  body += `
    <div class="section">
      <h3 class="section-title">Child &amp; Family</h3>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Family Name</span><span class="info-value">${esc(family.name)}</span></div>
        <div class="info-row"><span class="info-label">County</span><span class="info-value">${family.county ? esc(family.county) : 'Not specified'}</span></div>
        <div class="info-row"><span class="info-label">Child&rsquo;s Name</span><span class="info-value">${esc(child.name)}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${formatDateDisplay(child.dateOfBirth)}</span></div>
        <div class="info-row"><span class="info-label">Age</span><span class="info-value">${child.age} years</span></div>
        <div class="info-row"><span class="info-label">Interests</span><span class="info-value">${child.interests.length > 0 ? esc(child.interests.join(', ')) : 'Not specified'}</span></div>
      </div>
    </div>`;

  // ── At-a-glance figures ─────────────────────────────────
  body += `
    <div class="section">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">${assessment.activitySummary.totalActivities}</div>
          <div class="stat-label">Activities Recorded</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${nccaCoverage.filter((a) => a.covered).length}<span style="font-size:18px;">/6</span></div>
          <div class="stat-label">NCCA Areas Touched</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${attendance.totals.totalDaysAttended}</div>
          <div class="stat-label">Days of Learning</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${portfolio.totalEntries}</div>
          <div class="stat-label">Portfolio Pieces</div>
        </div>
      </div>
    </div>`;

  // ── Curriculum coverage (NCCA / Aistear), correctly framed ──
  body += `
    <div class="section page-break">
      <h3 class="section-title">Curriculum Coverage</h3>
      <p style="font-size:13px; color: var(--clay); margin-bottom:16px; line-height:1.7;">
        Home education in Ireland is assessed on whether a child is receiving
        <em>a certain minimum education suitable to their age, ability and aptitude</em>.
        The national curriculum is <strong>not</strong> required. The six NCCA primary areas below
        are used here only as a familiar map, to show the breadth of ${esc(child.name)}&rsquo;s learning across the year.
      </p>
      <div class="coverage-grid">`;
  for (const area of nccaCoverage) {
    body += `
        <div class="coverage-card${area.covered ? ' covered' : ''}">
          <div class="coverage-dot"></div>
          <div>
            <div class="coverage-area">${esc(area.area)}</div>
            <div class="coverage-count">${area.covered ? `${area.activityCount} ${area.activityCount === 1 ? 'activity' : 'activities'} contributing` : 'Room to grow into next'}</div>
          </div>
        </div>`;
  }
  body += `
      </div>
    </div>`;

  // Aistear early-years themes (a gentle complement for younger children).
  if (Object.keys(assessment.activitySummary.aistearThemes).length > 0) {
    body += `
    <div class="section">
      <h3 class="section-title">Aistear Themes (early years)</h3>
      <table>
        <thead><tr><th>Theme</th><th>Activities Contributing</th></tr></thead>
        <tbody>`;
    for (const [theme, count] of Object.entries(assessment.activitySummary.aistearThemes).sort((a, b) => b[1] - a[1])) {
      body += `<tr><td>${esc(theme)}</td><td>${count}</td></tr>`;
    }
    body += `</tbody></table>
      <p style="font-size:12px; color: var(--clay); margin-top:8px;">Aistear themes: Well-being, Identity &amp; Belonging, Communicating, and Exploring &amp; Thinking. Activities may contribute to more than one.</p>
    </div>`;
  }

  // ── Learning record summary (by category) ───────────────
  body += `
    <div class="section page-break">
      <h3 class="section-title">Learning Record</h3>`;
  if (Object.keys(assessment.activitySummary.categoryCounts).length > 0) {
    body += `
      <table>
        <thead><tr><th>Area of Life</th><th>Activities</th><th>Proportion</th></tr></thead>
        <tbody>`;
    const total = assessment.activitySummary.totalActivities || 1;
    for (const [cat, count] of Object.entries(assessment.activitySummary.categoryCounts).filter(([c]) => c !== 'unknown').sort((a, b) => b[1] - a[1])) {
      const pct = Math.round((count / total) * 100);
      body += `<tr><td>${formatCategory(cat)}</td><td>${count}</td><td>${pct}% ${progressBar(pct)}</td></tr>`;
    }
    body += `</tbody></table>`;
  } else {
    body += `<p style="color: var(--clay);">No activities recorded for this period yet.</p>`;
  }
  body += `
      <p style="font-size:12px; color: var(--clay); margin-top:12px; line-height:1.7;">
        There is <strong>no minimum number of hours</strong> and <strong>no attendance requirement</strong> for home education in Ireland.
        These figures simply reflect what the family chose to record over the year.${attendance.totals.totalHoursLogged > 0 ? ` Time noted across the year came to roughly ${attendance.totals.totalHoursLogged} hours.` : ''}
      </p>
    </div>`;

  // ── Portfolio of evidence WITH PHOTOS ───────────────────
  body += `
    <div class="section page-break">
      <h3 class="section-title">Portfolio of Evidence</h3>`;
  if (portfolioWithPhotos.length > 0) {
    body += `<p style="font-size:13px; color: var(--clay); margin-bottom:20px;">Dated pieces of ${esc(child.name)}&rsquo;s work and learning, with photo evidence where the family captured it.</p>`;
    for (const entry of portfolioWithPhotos) {
      const tags = entry.curriculumAreas.map((a) => `<span class="tag">${formatCategory(a)}</span>`).join('');
      body += `
      <div class="portfolio-entry">
        <div class="entry-head">
          <span class="entry-title">${esc(entry.title)}</span>
          <span class="entry-date">${formatDateDisplay(entry.date)}</span>
        </div>
        ${entry.description ? `<p class="entry-desc">${esc(entry.description)}</p>` : ''}
        ${tags ? `<div class="entry-tags">${tags}</div>` : ''}`;
      if (entry.signedPhotos.length > 0) {
        body += `<div class="photo-gallery">`;
        for (const url of entry.signedPhotos) {
          body += `<img src="${esc(url)}" alt="${esc(entry.title)} - photo evidence" loading="lazy" />`;
        }
        body += `</div>`;
      } else {
        body += `<p class="no-photo-note">No photo attached to this entry.</p>`;
      }
      body += `
      </div>`;
    }
  } else {
    body += `<p style="color: var(--clay);">No portfolio entries recorded for this period yet. As the family adds pieces of work, with photos, they will appear here as evidence.</p>`;
  }
  body += `
    </div>`;

  // ── Footer disclaimer ───────────────────────────────────
  body += `
    <div class="section page-break">
      <div class="disclaimer-panel">
        <p style="margin-bottom:10px;"><strong>About this pack.</strong> It was assembled by the family using The Hedge from the learning they recorded over the year. <strong>The Hedge is not affiliated with Tusla</strong> and this is not an official Tusla document.</p>
        <p style="margin-bottom:10px;">In Ireland, a parent <strong>applies to Tusla via AEARS</strong> (the Alternative Education Assessment and Registration Service) to register a child on the Section 14 Register under the Education (Welfare) Act 2000. An <strong>authorised person</strong> carries out the assessment. The standard is whether the child is receiving <strong>a certain minimum education</strong> suitable to their age, ability and aptitude. There is <strong>no required curriculum, no minimum hours, and no attendance requirement</strong>. Registration is subject to <strong>periodic review</strong>.</p>
        <p>Please use Tusla&rsquo;s official application (currently the R1 form) and current guidance when you apply. Nothing here is legal advice.</p>
      </div>
      <div class="report-footer" style="margin-top:24px;">
        <div class="generated">Prepared ${genDate} with The Hedge &middot; thehedge.ie</div>
      </div>
    </div>`;

  return aearsShell(child.name, body);
}
