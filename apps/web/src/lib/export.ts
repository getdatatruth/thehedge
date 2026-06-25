import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

// ─── Real PDF export ──────────────────────────────────────
// We already build correct, escaped CSV for every report. Rather than
// duplicate each report's layout, we parse that CSV back into rows and render
// a genuine, paginated PDF document - real bytes, not a print-to-PDF page.

function parseCsv(csv: string): string[][] {
  const text = csv.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export async function csvToPdf(csv: string, title: string): Promise<Uint8Array> {
  const rows = parseCsv(csv);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const A4 = { w: 595.28, h: 841.89 };
  const margin = 48;
  const maxW = A4.w - margin * 2;
  const ink = rgb(0.1, 0.09, 0.07);
  const moss = rgb(0.24, 0.38, 0.26);
  const grey = rgb(0.42, 0.38, 0.34);

  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - margin;

  const wrap = (s: string, f: typeof font, size: number): string[] => {
    const words = s.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(test, size) > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  };
  const newPageIfNeeded = (need: number) => {
    if (y - need < margin) { page = doc.addPage([A4.w, A4.h]); y = A4.h - margin; }
  };
  const draw = (s: string, f: typeof font, size: number, color = ink, indent = 0) => {
    for (const ln of wrap(s, f, size)) {
      newPageIfNeeded(size + 4);
      page.drawText(ln, { x: margin + indent, y: y - size, size, font: f, color });
      y -= size + 5;
    }
  };

  // Title
  draw(title, bold, 18, moss);
  y -= 6;

  for (const r of rows) {
    if (r.length === 0 || (r.length === 1 && r[0] === '')) { y -= 8; continue; } // blank separator
    const label = (r[0] || '').trim();
    const rest = r.slice(1).map((c) => (c ?? '').trim()).filter(Boolean);
    // A label-only row reads as a section heading.
    if (rest.length === 0) {
      y -= 4;
      draw(label, bold, 12, moss);
    } else if (r.length === 2) {
      draw(`${label}:  ${rest[0]}`, font, 11, ink);
    } else {
      // tabular row: label in bold, cells joined
      newPageIfNeeded(16);
      const line = [label, ...rest].join('   ·   ');
      draw(line, label && rest.length ? font : font, 10.5, label === r[0] && r.indexOf(label) === 0 ? ink : grey);
    }
  }

  const bytes = await doc.save();
  return bytes;
}

export function pdfFilename(reportType: string, childName: string, startDate: string, endDate: string): string {
  return csvFilename(reportType, childName, startDate, endDate).replace(/\.csv$/, '.pdf');
}
