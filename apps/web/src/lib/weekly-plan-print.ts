// ─── Weekly Plan Print Generator ─────────────────────────
// Generates a beautifully styled HTML document for printing weekly plans.
// Follows the same pattern as reports.ts - complete HTML with embedded CSS.

const CATEGORY_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
  nature: { bg: '#4CAF7C', text: '#FFFFFF', label: 'Nature' },
  science: { bg: '#5B8DEF', text: '#FFFFFF', label: 'Science' },
  art: { bg: '#E8735A', text: '#FFFFFF', label: 'Art' },
  maths: { bg: '#9B7BD4', text: '#FFFFFF', label: 'Maths' },
  literacy: { bg: '#5BBDD4', text: '#FFFFFF', label: 'Literacy' },
  movement: { bg: '#F5A623', text: '#FFFFFF', label: 'Movement' },
  kitchen: { bg: '#D4845B', text: '#FFFFFF', label: 'Kitchen' },
  life_skills: { bg: '#2E7D32', text: '#FFFFFF', label: 'Life Skills' },
  calm: { bg: '#8A9B8E', text: '#FFFFFF', label: 'Calm' },
  social: { bg: '#E85BAD', text: '#FFFFFF', label: 'Social' },
};

const SUBJECT_MAP: Record<string, string> = {
  nature: 'SESE', science: 'SESE', kitchen: 'Life Skills', art: 'Arts',
  movement: 'PE', literacy: 'Language', maths: 'Mathematics',
  life_skills: 'SPHE', calm: 'Wellbeing', social: 'SPHE',
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface PlanBlock {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  notes?: string;
  completed: boolean;
  category?: string;
}

interface DailyPlan {
  id: string;
  child_id: string;
  date: string;
  blocks: PlanBlock[];
  status: string;
}

interface ChildInfo {
  id: string;
  name: string;
  date_of_birth: string;
}

export interface PrintOptions {
  format: 'full' | 'summary';
  includeHeader: boolean;
  includeCategoryColours: boolean;
  includeCheckboxes: boolean;
  includeCurriculum: boolean;
  includeNotes: boolean;
  includeWeeklySummary: boolean;
  childId: string | null; // null = all children
}

interface PrintData {
  familyName: string;
  weekStart: string;
  weekEnd: string;
  children: ChildInfo[];
  dailyPlans: DailyPlan[];
  activityCategories: Record<string, string>; // activity_id -> category
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-IE', { month: 'long' });
  const eMonth = e.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
  if (sMonth === eMonth.split(' ')[0]) {
    return `${s.getDate()} - ${e.getDate()} ${eMonth}`;
  }
  return `${s.getDate()} ${sMonth} - ${e.getDate()} ${eMonth}`;
}

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function getBlockCategory(block: PlanBlock, activityCategories: Record<string, string>): string {
  if (block.category) return block.category;
  if (block.activity_id && activityCategories[block.activity_id]) return activityCategories[block.activity_id];
  // Reverse map from subject
  for (const [cat, subj] of Object.entries(SUBJECT_MAP)) {
    if (subj === block.subject) return cat;
  }
  return 'nature';
}

function timeIcon(time: string): string {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return '&#9728;'; // sun
  if (hour < 17) return '&#9788;'; // sun with rays
  return '&#9790;'; // moon
}

export function generateWeeklyPlanHtml(data: PrintData, options: PrintOptions): string {
  const filteredPlans = options.childId
    ? data.dailyPlans.filter(p => p.child_id === options.childId)
    : data.dailyPlans;

  const selectedChild = options.childId
    ? data.children.find(c => c.id === options.childId)
    : null;

  const childLabel = selectedChild ? selectedChild.name : 'All Children';

  // Group plans by date
  const plansByDate: Record<string, DailyPlan[]> = {};
  for (const plan of filteredPlans) {
    if (!plansByDate[plan.date]) plansByDate[plan.date] = [];
    plansByDate[plan.date].push(plan);
  }

  // Sort dates
  const sortedDates = Object.keys(plansByDate).sort();

  // Calculate summary stats
  let totalActivities = 0;
  let totalMinutes = 0;
  let completedCount = 0;
  const categoryCounts: Record<string, number> = {};

  for (const plans of Object.values(plansByDate)) {
    for (const plan of plans) {
      for (const block of plan.blocks) {
        totalActivities++;
        totalMinutes += block.duration || 0;
        if (block.completed) completedCount++;
        const cat = getBlockCategory(block, data.activityCategories);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }
  }

  const isCompact = options.format === 'summary';

  // ─── Build HTML ───

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Weekly Plan - ${childLabel} - ${formatWeekRange(data.weekStart, data.weekEnd)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    color: #1A2E1E;
    background: #FFFFFF;
    font-size: 14px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    max-width: 800px;
    margin: 0 auto;
    padding: ${isCompact ? '20px 24px' : '32px 40px'};
  }

  /* ─── Header ─── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 3px solid #4CAF7C;
    margin-bottom: ${isCompact ? '16px' : '24px'};
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-icon {
    width: 32px;
    height: 32px;
    background: #1C3520;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4CAF7C;
    font-size: 18px;
  }
  .brand-name {
    font-size: 18px;
    font-weight: 300;
    color: #1C3520;
    letter-spacing: -0.5px;
  }
  .header-right {
    text-align: right;
  }
  .family-name {
    font-size: 16px;
    font-weight: 600;
    color: #1A2E1E;
  }
  .child-name {
    font-size: 13px;
    color: #5A6B5E;
    margin-top: 2px;
  }
  .week-range {
    font-size: 20px;
    font-weight: 700;
    color: #1A2E1E;
    margin-bottom: 4px;
    text-align: center;
    margin-top: ${isCompact ? '8px' : '16px'};
    margin-bottom: ${isCompact ? '12px' : '20px'};
  }
  .week-subtitle {
    font-size: 12px;
    color: #8A9B8E;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 4px;
  }

  /* ─── Day sections ─── */
  .day-section {
    margin-bottom: ${isCompact ? '12px' : '20px'};
    break-inside: avoid;
  }
  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: ${isCompact ? '6px 12px' : '8px 16px'};
    background: #F2F5F0;
    border-radius: 10px;
    margin-bottom: ${isCompact ? '4px' : '8px'};
  }
  .day-name {
    font-size: ${isCompact ? '11px' : '13px'};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #1C3520;
  }
  .day-date {
    font-size: ${isCompact ? '11px' : '13px'};
    font-weight: 400;
    color: #5A6B5E;
    margin-left: 8px;
  }
  .day-progress {
    font-size: 11px;
    font-weight: 600;
    color: #4CAF7C;
  }

  /* ─── Activity rows ─── */
  .activity-table {
    width: 100%;
    border-collapse: collapse;
  }
  .activity-row {
    border-bottom: 1px solid #E8EDE6;
  }
  .activity-row:last-child {
    border-bottom: none;
  }
  .activity-row td {
    padding: ${isCompact ? '5px 6px' : '8px 10px'};
    vertical-align: middle;
  }
  .cat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .time-cell {
    font-size: ${isCompact ? '11px' : '12px'};
    color: #8A9B8E;
    white-space: nowrap;
    width: 60px;
  }
  .time-icon {
    margin-right: 4px;
    font-size: 12px;
  }
  .title-cell {
    font-size: ${isCompact ? '12px' : '14px'};
    font-weight: 500;
    color: #1A2E1E;
  }
  .cat-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
  .duration-cell {
    font-size: ${isCompact ? '11px' : '12px'};
    color: #5A6B5E;
    white-space: nowrap;
    text-align: right;
    width: 45px;
  }
  .checkbox-cell {
    width: 28px;
    text-align: center;
  }
  .checkbox {
    width: 16px;
    height: 16px;
    border: 1.5px solid #D8DDD5;
    border-radius: 4px;
    display: inline-block;
    vertical-align: middle;
  }
  .checkbox.checked {
    background: #4CAF7C;
    border-color: #4CAF7C;
    position: relative;
  }
  .checkbox.checked::after {
    content: "\\2713";
    color: white;
    font-size: 11px;
    position: absolute;
    top: -1px;
    left: 2px;
  }
  .curriculum-cell {
    font-size: 10px;
    color: #8A9B8E;
    white-space: nowrap;
    width: 80px;
  }

  /* ─── Weekly summary ─── */
  .summary {
    margin-top: ${isCompact ? '12px' : '24px'};
    padding: ${isCompact ? '12px' : '20px'};
    background: #F2F5F0;
    border-radius: 12px;
    break-inside: avoid;
  }
  .summary-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #4CAF7C;
    margin-bottom: 12px;
  }
  .summary-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
  }
  .summary-stat {
    text-align: center;
  }
  .summary-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1A2E1E;
  }
  .summary-stat-label {
    font-size: 11px;
    color: #5A6B5E;
  }
  .cat-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .cat-bar-label {
    font-size: 11px;
    width: 70px;
    color: #5A6B5E;
  }
  .cat-bar-track {
    flex: 1;
    height: 8px;
    background: #FFFFFF;
    border-radius: 4px;
    overflow: hidden;
  }
  .cat-bar-fill {
    height: 100%;
    border-radius: 4px;
  }
  .cat-bar-count {
    font-size: 11px;
    font-weight: 600;
    width: 20px;
    text-align: right;
    color: #1A2E1E;
  }

  /* ─── Notes section ─── */
  .notes-section {
    margin-top: 24px;
    break-inside: avoid;
  }
  .notes-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #4CAF7C;
    margin-bottom: 12px;
  }
  .notes-lines {
    min-height: 100px;
  }
  .notes-line {
    border-bottom: 1px solid #E8EDE6;
    height: 28px;
  }

  /* ─── Footer ─── */
  .footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #E8EDE6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #8A9B8E;
  }

  /* ─── Print button (hidden on print) ─── */
  .print-actions {
    position: fixed;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }
  .print-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .print-btn-primary {
    background: #1C3520;
    color: #F2F5F0;
  }
  .print-btn-primary:hover {
    background: #2A4A2E;
  }
  .print-btn-secondary {
    background: #F2F5F0;
    color: #1C3520;
    border: 1px solid #D8DDD5;
  }

  @media print {
    .print-actions { display: none !important; }
    body { background: white; }
    .page { padding: 0; max-width: none; }
    .day-section { break-inside: avoid; }
    .summary { break-inside: avoid; }
    .notes-section { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="print-actions">
  <button class="print-btn print-btn-primary" onclick="window.print()">&#x1F5A8; Print / Save PDF</button>
  <button class="print-btn print-btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="page">`;

  // ─── Header
  if (options.includeHeader) {
    html += `
  <div class="header">
    <div class="header-left">
      <div class="logo-icon">&#x1F33F;</div>
      <span class="brand-name">The Hedge</span>
    </div>
    <div class="header-right">
      <div class="family-name">${escapeHtml(data.familyName)}</div>
      <div class="child-name">${escapeHtml(childLabel)}</div>
    </div>
  </div>
  <div class="week-subtitle">WEEKLY PLAN</div>
  <div class="week-range">Week of ${formatWeekRange(data.weekStart, data.weekEnd)}</div>`;
  }

  // ─── 1-Page Grid (compact summary) ───
  if (isCompact) {
    html += `
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;font-size:10px;">`;

    // Build all 7 days of the week
    const weekDates: string[] = [];
    const ws = new Date(data.weekStart + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      weekDates.push(d.toISOString().split('T')[0]);
    }

    for (const date of weekDates) {
      const plans = plansByDate[date] || [];
      const allBlocks: PlanBlock[] = [];
      for (const plan of plans) {
        for (const block of plan.blocks) allBlocks.push(block);
      }
      allBlocks.sort((a, b) => a.time.localeCompare(b.time));

      const dayName = getDayOfWeek(date).substring(0, 3).toUpperCase();
      const dateLabel = formatDate(date);

      html += `
    <div style="background:#F2F5F0;border-radius:8px;overflow:hidden;">
      <div style="background:#1C3520;color:#F2F5F0;padding:6px 8px;text-align:center;">
        <div style="font-weight:700;font-size:11px;letter-spacing:1px;">${dayName}</div>
        <div style="font-size:9px;opacity:0.7;">${dateLabel}</div>
      </div>
      <div style="padding:6px;">`;

      if (allBlocks.length === 0) {
        html += `<div style="color:#8A9B8E;font-size:9px;text-align:center;padding:8px 0;">No activities</div>`;
      } else {
        for (const block of allBlocks) {
          const cat = getBlockCategory(block, data.activityCategories);
          const catInfo = CATEGORY_COLOURS[cat] || CATEGORY_COLOURS.nature;
          html += `
        <div style="padding:4px 0;border-bottom:1px solid #E8EDE6;display:flex;align-items:flex-start;gap:4px;">`;

          if (options.includeCheckboxes) {
            html += `<span style="display:inline-block;width:10px;height:10px;border:1px solid ${block.completed ? '#4CAF7C' : '#D8DDD5'};border-radius:2px;flex-shrink:0;margin-top:2px;${block.completed ? 'background:#4CAF7C;' : ''}"></span>`;
          }

          if (options.includeCategoryColours) {
            html += `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${catInfo.bg};flex-shrink:0;margin-top:4px;"></span>`;
          }

          html += `
          <div style="flex:1;min-width:0;">
            <div style="font-weight:500;font-size:10px;color:#1A2E1E;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(block.title)}</div>
            <div style="font-size:8px;color:#8A9B8E;">${block.time} · ${block.duration}m</div>
          </div>
        </div>`;
        }
      }

      html += `
      </div>
    </div>`;
    }

    html += `
  </div>`;

    // Compact summary row
    if (options.includeWeeklySummary && totalActivities > 0) {
      html += `
  <div style="display:flex;gap:16px;justify-content:center;margin-top:12px;padding:10px;background:#F2F5F0;border-radius:8px;font-size:11px;">
    <div style="text-align:center;"><strong>${totalActivities}</strong><br/><span style="color:#5A6B5E;">activities</span></div>
    <div style="text-align:center;"><strong>${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</strong><br/><span style="color:#5A6B5E;">learning time</span></div>
    <div style="text-align:center;"><strong>${Object.keys(categoryCounts).length}</strong><br/><span style="color:#5A6B5E;">categories</span></div>
    <div style="text-align:center;"><strong>${completedCount}/${totalActivities}</strong><br/><span style="color:#5A6B5E;">completed</span></div>
  </div>`;
    }

    // Footer for compact
    html += `
  <div class="footer">
    <span>Generated by The Hedge - thehedge.ie</span>
    <span>${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </div>
</div>
</body>
</html>`;

    return html;
  }

  // ─── Full Plan: Daily sections ───
  for (const date of sortedDates) {
    const plans = plansByDate[date];
    const allBlocks: (PlanBlock & { childName?: string })[] = [];

    for (const plan of plans) {
      const child = data.children.find(c => c.id === plan.child_id);
      for (const block of plan.blocks) {
        allBlocks.push({ ...block, childName: child?.name });
      }
    }

    // Sort by time
    allBlocks.sort((a, b) => a.time.localeCompare(b.time));

    if (allBlocks.length === 0) continue;

    const completed = allBlocks.filter(b => b.completed).length;
    const dayName = getDayOfWeek(date);
    const dateLabel = formatDate(date);

    html += `
  <div class="day-section">
    <div class="day-header">
      <div>
        <span class="day-name">${dayName}</span>
        <span class="day-date">${dateLabel}</span>
      </div>
      <span class="day-progress">${completed}/${allBlocks.length} DONE</span>
    </div>
    <table class="activity-table">`;

    for (const block of allBlocks) {
      const cat = getBlockCategory(block, data.activityCategories);
      const catInfo = CATEGORY_COLOURS[cat] || CATEGORY_COLOURS.nature;
      const subject = SUBJECT_MAP[cat] || '';

      html += `
      <tr class="activity-row">`;

      if (options.includeCheckboxes) {
        html += `
        <td class="checkbox-cell">
          <span class="checkbox ${block.completed ? 'checked' : ''}" style="position:relative;"></span>
        </td>`;
      }

      html += `
        <td class="time-cell">
          <span class="time-icon">${timeIcon(block.time)}</span>${block.time}
        </td>`;

      if (options.includeCategoryColours) {
        html += `
        <td style="width:16px;"><span class="cat-dot" style="background:${catInfo.bg};"></span></td>`;
      }

      html += `
        <td class="title-cell">${escapeHtml(block.title)}</td>`;

      if (options.includeCategoryColours) {
        html += `
        <td><span class="cat-badge" style="background:${catInfo.bg}15;color:${catInfo.bg};">${catInfo.label}</span></td>`;
      }

      html += `
        <td class="duration-cell">${block.duration}m</td>`;

      if (options.includeCurriculum && !isCompact) {
        html += `
        <td class="curriculum-cell">${subject}</td>`;
      }

      html += `
      </tr>`;
    }

    html += `
    </table>
  </div>`;
  }

  // ─── Empty state
  if (sortedDates.length === 0) {
    html += `
  <div style="text-align:center;padding:40px;color:#8A9B8E;">
    <p style="font-size:16px;margin-bottom:8px;">No activities planned for this week</p>
    <p style="font-size:13px;">Generate a plan from the Weekly Plan page to get started.</p>
  </div>`;
  }

  // ─── Weekly summary
  if (options.includeWeeklySummary && totalActivities > 0) {
    const maxCatCount = Math.max(...Object.values(categoryCounts), 1);

    html += `
  <div class="summary">
    <div class="summary-title">Weekly Summary</div>
    <div class="summary-stats">
      <div class="summary-stat">
        <div class="summary-stat-value">${totalActivities}</div>
        <div class="summary-stat-label">Activities</div>
      </div>
      <div class="summary-stat">
        <div class="summary-stat-value">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</div>
        <div class="summary-stat-label">Learning time</div>
      </div>
      <div class="summary-stat">
        <div class="summary-stat-value">${Object.keys(categoryCounts).length}</div>
        <div class="summary-stat-label">Categories</div>
      </div>
      <div class="summary-stat">
        <div class="summary-stat-value">${completedCount}/${totalActivities}</div>
        <div class="summary-stat-label">Completed</div>
      </div>
    </div>`;

    // Category balance bars
    const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    for (const [cat, count] of sortedCats) {
      const catInfo = CATEGORY_COLOURS[cat] || CATEGORY_COLOURS.nature;
      const pct = (count / maxCatCount) * 100;
      html += `
    <div class="cat-bar-row">
      <span class="cat-bar-label">${catInfo.label}</span>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${pct}%;background:${catInfo.bg};"></div>
      </div>
      <span class="cat-bar-count">${count}</span>
    </div>`;
    }

    html += `
  </div>`;
  }

  // ─── Notes section
  if (options.includeNotes && !isCompact) {
    html += `
  <div class="notes-section">
    <div class="notes-title">Notes &amp; Reflections</div>
    <div class="notes-lines">`;
    for (let i = 0; i < 5; i++) {
      html += `<div class="notes-line"></div>`;
    }
    html += `
    </div>
  </div>`;
  }

  // ─── Footer
  html += `
  <div class="footer">
    <span>Generated by The Hedge - thehedge.ie</span>
    <span>${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </div>
</div>
</body>
</html>`;

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
