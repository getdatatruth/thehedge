import type {
  AssessmentReportData,
  AttendanceReportData,
  PortfolioReportData,
  AnnualReportData,
} from '@/lib/reports';

// ─── CSV Building Blocks ──────────────────────────────────

/**
 * Escape a single CSV field per RFC 4180.
 * A field is wrapped in double quotes if it contains a comma, quote,
 * carriage return or newline. Embedded quotes are doubled.
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Join an array of fields into one escaped CSV row. */
export function csvRow(fields: (string | number | null | undefined)[]): string {
  return fields.map(csvField).join(',');
}

/**
 * Build a complete CSV document from a list of rows.
 * Rows are separated by CRLF (RFC 4180). A leading UTF-8 BOM is added so
 * that Excel opens accented characters (e.g. Irish names) correctly.
 */
export function buildCsv(rows: (string | number | null | undefined)[][]): string {
  const bom = '﻿';
  return bom + rows.map(csvRow).join('\r\n') + '\r\n';
}

/** Turn a report title and child name into a safe download filename. */
export function csvFilename(reportType: string, childName: string, startDate: string, endDate: string): string {
  const safeName = (childName || 'child')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${reportType}-${safeName}-${startDate}-to-${endDate}.csv`;
}

// ─── Shared Header Rows ───────────────────────────────────

/**
 * A short identifying block placed at the top of every CSV so the file is
 * meaningful on its own: family, child, date range and generation date.
 */
function headerBlock(
  reportLabel: string,
  family: { name: string; county: string | null; country: string },
  child: { name: string; age: number },
  dateRange: { start: string; end: string },
  generatedAt: string
): (string | number | null | undefined)[][] {
  const generated = new Date(generatedAt).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const location = [family.county, family.country].filter(Boolean).join(', ');
  return [
    ['The Hedge', reportLabel],
    ['Family', family.name],
    ['Location', location],
    ['Child', child.name],
    ['Age', child.age],
    ['Period', `${dateRange.start} to ${dateRange.end}`],
    ['Generated', generated],
    [], // blank separator row
  ];
}

// ─── Attendance CSV ───────────────────────────────────────

/**
 * Attendance log as CSV: a month-by-month breakdown plus a totals row.
 * Columns: Month, Days attended, Days planned, Hours logged, Hours required,
 * Plan completion rate (%).
 */
export function attendanceToCsv(data: AttendanceReportData): string {
  const rows: (string | number | null | undefined)[][] = [
    ...headerBlock('Attendance Record', data.family, data.child, data.dateRange, data.generatedAt),
    [
      'Month',
      'Days attended',
      'Days planned',
      'Hours logged',
      'Hours required',
      'Plan completion (%)',
    ],
  ];

  for (const m of data.monthlyBreakdown) {
    rows.push([
      m.month,
      m.daysAttended,
      m.daysPlanned,
      m.hoursLogged,
      m.hoursRequired,
      m.completionRate,
    ]);
  }

  rows.push([]);
  rows.push([
    'Total',
    data.totals.totalDaysAttended,
    data.totals.totalDaysRequired,
    data.totals.totalHoursLogged,
    data.totals.totalHoursRequired,
    data.totals.planCompletionRate,
  ]);
  rows.push(['Attendance (%)', data.totals.attendancePercentage]);
  rows.push([
    'Daily plans completed',
    `${data.dailyPlanStats.completedPlans} of ${data.dailyPlanStats.totalPlans}`,
  ]);

  return buildCsv(rows);
}

// ─── Portfolio CSV ────────────────────────────────────────

/**
 * Portfolio entries as CSV, one row per entry.
 * Columns: Date, Title, Description, Curriculum areas, Linked activity.
 */
export function portfolioToCsv(data: PortfolioReportData): string {
  const rows: (string | number | null | undefined)[][] = [
    ...headerBlock('Portfolio Entries', data.family, data.child, data.dateRange, data.generatedAt),
    ['Date', 'Title', 'Description', 'Curriculum areas', 'Linked activity'],
  ];

  for (const entry of data.entries) {
    rows.push([
      entry.date,
      entry.title,
      entry.description ?? '',
      entry.curriculumAreas.join('; '),
      entry.activityLogTitle ?? '',
    ]);
  }

  rows.push([]);
  rows.push(['Total entries', data.totalEntries]);

  return buildCsv(rows);
}

// ─── Annual / Activity Summary CSV ────────────────────────

/**
 * Annual activity summary as CSV. Pulls the activity figures from the
 * assessment portion of the annual report: per-category counts, Aistear
 * theme coverage, and the recent activity log.
 */
export function annualToCsv(data: AnnualReportData): string {
  const a: AssessmentReportData = data.assessment;
  const rows: (string | number | null | undefined)[][] = [
    ...headerBlock('Annual Activity Summary', a.family, a.child, a.dateRange, a.generatedAt),
  ];

  // Headline totals
  rows.push(['Total activities', a.activitySummary.totalActivities]);
  rows.push(['Total hours', a.activitySummary.totalHours]);
  rows.push([]);

  // Activity counts by category
  rows.push(['Category', 'Activities']);
  for (const [category, count] of Object.entries(a.activitySummary.categoryCounts)) {
    rows.push([category, count]);
  }
  rows.push([]);

  // Aistear theme coverage
  rows.push(['Aistear theme', 'Activities']);
  for (const [theme, count] of Object.entries(a.activitySummary.aistearThemes)) {
    rows.push([theme, count]);
  }
  rows.push([]);

  // Recent activity log
  rows.push(['Date', 'Activity', 'Category', 'Duration (mins)']);
  for (const item of a.recentActivities) {
    rows.push([item.date, item.title, item.category, item.duration ?? '']);
  }

  // Attendance summary appended so the annual file is a single rounded record
  rows.push([]);
  rows.push(['Attendance summary']);
  rows.push(['Days attended', data.attendance.totals.totalDaysAttended]);
  rows.push(['Days planned', data.attendance.totals.totalDaysRequired]);
  rows.push(['Hours logged', data.attendance.totals.totalHoursLogged]);
  rows.push(['Hours required', data.attendance.totals.totalHoursRequired]);
  rows.push(['Attendance (%)', data.attendance.totals.attendancePercentage]);
  rows.push(['Portfolio entries', data.portfolio.totalEntries]);

  return buildCsv(rows);
}

// ─── Assessment CSV ───────────────────────────────────────

/**
 * Term/assessment summary as CSV: totals, category counts, Aistear themes,
 * curriculum coverage and the recent activity log.
 */
export function assessmentToCsv(data: AssessmentReportData): string {
  const rows: (string | number | null | undefined)[][] = [
    ...headerBlock('Term Summary', data.family, data.child, data.dateRange, data.generatedAt),
  ];

  rows.push(['Total activities', data.activitySummary.totalActivities]);
  rows.push(['Total hours', data.activitySummary.totalHours]);
  rows.push([]);

  rows.push(['Category', 'Activities']);
  for (const [category, count] of Object.entries(data.activitySummary.categoryCounts)) {
    rows.push([category, count]);
  }
  rows.push([]);

  rows.push(['Aistear theme', 'Activities']);
  for (const [theme, count] of Object.entries(data.activitySummary.aistearThemes)) {
    rows.push([theme, count]);
  }
  rows.push([]);

  if (data.curriculumCoverage.length > 0) {
    rows.push(['Curriculum area', 'Priority', 'Activities', 'Notes']);
    for (const area of data.curriculumCoverage) {
      rows.push([area.area, area.priority, area.activityCount, area.notes ?? '']);
    }
    rows.push([]);
  }

  rows.push(['Date', 'Activity', 'Category', 'Duration (mins)']);
  for (const item of data.recentActivities) {
    rows.push([item.date, item.title, item.category, item.duration ?? '']);
  }

  return buildCsv(rows);
}
