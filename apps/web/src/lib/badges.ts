// ─── Badge Definitions & Calculation Logic ───────────────
// Real badge system that computes earned badges from activity log data.

export interface BadgeDefinition {
  id: string;
  type: 'milestone' | 'streak' | 'category' | 'explorer' | 'time' | 'special';
  name: string;
  description: string;
  icon: string;
  threshold: number;
  /** Which category this badge relates to (for category-type badges) */
  category?: string;
}

export interface EarnedBadge extends BadgeDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

// ─── All badge definitions ───────────────────────────────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Milestone badges
  { id: 'first-steps', type: 'milestone', name: 'First Steps', description: 'Log your very first activity', icon: '🌱', threshold: 1 },
  { id: 'getting-started', type: 'milestone', name: 'Getting Started', description: 'Complete 10 activities', icon: '🌿', threshold: 10 },
  { id: 'building-habits', type: 'milestone', name: 'Building Habits', description: 'Complete 25 activities', icon: '🌾', threshold: 25 },
  { id: 'half-century', type: 'milestone', name: 'Half Century', description: 'Complete 50 activities', icon: '🌳', threshold: 50 },
  { id: 'century-club', type: 'milestone', name: 'Century Club', description: 'Complete 100 activities', icon: '🏆', threshold: 100 },
  { id: 'dedicated-learner', type: 'milestone', name: 'Dedicated Learner', description: 'Complete 250 activities', icon: '🎓', threshold: 250 },

  // Streak badges
  { id: 'streak-3', type: 'streak', name: '3-Day Streak', description: 'Do activities 3 days in a row', icon: '🔥', threshold: 3 },
  { id: 'streak-7', type: 'streak', name: 'Week Warrior', description: 'Do activities 7 days in a row', icon: '⚡', threshold: 7 },
  { id: 'streak-14', type: 'streak', name: 'Fortnight Force', description: 'Do activities 14 days in a row', icon: '💪', threshold: 14 },
  { id: 'streak-30', type: 'streak', name: 'Monthly Marvel', description: 'Do activities 30 days in a row', icon: '💫', threshold: 30 },

  // Category badges (10 activities in each category)
  { id: 'nature-explorer', type: 'category', name: 'Nature Explorer', description: 'Complete 10 nature activities', icon: '🌲', threshold: 10, category: 'nature' },
  { id: 'kitchen-helper', type: 'category', name: 'Kitchen Helper', description: 'Complete 10 kitchen activities', icon: '👨‍🍳', threshold: 10, category: 'kitchen' },
  { id: 'science-star', type: 'category', name: 'Science Star', description: 'Complete 10 science activities', icon: '🧪', threshold: 10, category: 'science' },
  { id: 'creative-spark', type: 'category', name: 'Creative Spark', description: 'Complete 10 art activities', icon: '🎨', threshold: 10, category: 'art' },
  { id: 'active-adventurer', type: 'category', name: 'Active Adventurer', description: 'Complete 10 movement activities', icon: '🏃', threshold: 10, category: 'movement' },
  { id: 'bookworm', type: 'category', name: 'Bookworm', description: 'Complete 10 literacy activities', icon: '📚', threshold: 10, category: 'literacy' },
  { id: 'number-ninja', type: 'category', name: 'Number Ninja', description: 'Complete 10 maths activities', icon: '🔢', threshold: 10, category: 'maths' },
  { id: 'life-learner', type: 'category', name: 'Life Learner', description: 'Complete 10 life skills activities', icon: '🔧', threshold: 10, category: 'life_skills' },
  { id: 'zen-master', type: 'category', name: 'Zen Master', description: 'Complete 10 calm activities', icon: '🧘', threshold: 10, category: 'calm' },
  { id: 'social-butterfly', type: 'category', name: 'Social Butterfly', description: 'Complete 10 social activities', icon: '🤝', threshold: 10, category: 'social' },

  // Explorer badge
  { id: 'all-rounder', type: 'explorer', name: 'All-Rounder', description: 'Try at least one activity from every category', icon: '🌈', threshold: 10 },

  // Time badges
  { id: 'time-100', type: 'time', name: 'Time Traveller', description: 'Spend 100 minutes learning', icon: '⏱️', threshold: 100 },
  { id: 'time-500', type: 'time', name: 'Hour Hero', description: 'Spend 500 minutes learning', icon: '⏳', threshold: 500 },
  { id: 'time-1000', type: 'time', name: 'Time Champion', description: 'Spend 1,000 minutes learning', icon: '🕐', threshold: 1000 },

  // Special badges
  { id: 'weekend-warrior', type: 'special', name: 'Weekend Warrior', description: 'Log activities on 5 different weekends', icon: '🎪', threshold: 5 },
  { id: 'early-bird', type: 'special', name: 'Consistent Logger', description: 'Log activities in 3 different months', icon: '📅', threshold: 3 },
];

// ─── Types for log data ──────────────────────────────────

export interface LogForBadges {
  date: string;
  category: string | null;
  duration_minutes: number | null;
}

// ─── Streak calculation ──────────────────────────────────

export function calculateStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = [...new Set(dates)].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the most recent log is today or yesterday for current streak
  const mostRecent = new Date(uniqueDates[0] + 'T00:00:00');
  mostRecent.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  if (mostRecent >= yesterday) {
    let checkDate = mostRecent.getTime() === today.getTime() ? today : yesterday;
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr + 'T00:00:00');
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate = new Date(checkDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (d < checkDate) {
        break;
      }
    }
  }

  // Calculate longest streak
  const sortedAsc = [...new Set(dates)].sort();
  let longest = 1;
  let runLength = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1] + 'T00:00:00');
    const curr = new Date(sortedAsc[i] + 'T00:00:00');
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      runLength++;
      if (runLength > longest) longest = runLength;
    } else if (diffDays > 1) {
      runLength = 1;
    }
  }

  return { current: currentStreak, longest };
}

// ─── Badge calculation ───────────────────────────────────

export function calculateBadges(logs: LogForBadges[]): EarnedBadge[] {
  const totalActivities = logs.length;
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const dates = logs.map((l) => l.date);
  const { current: currentStreak, longest: longestStreak } = calculateStreak(dates);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const log of logs) {
    const cat = log.category || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Categories with at least 1 activity (for all-rounder)
  const allCategories = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
  const categoriesCovered = allCategories.filter((cat) => (categoryCounts[cat] || 0) > 0).length;

  // Weekend counts (unique Saturdays/Sundays with activities)
  const weekendDates = new Set<string>();
  for (const log of logs) {
    const d = new Date(log.date + 'T00:00:00');
    const day = d.getDay();
    if (day === 0 || day === 6) {
      // Use the week identifier (ISO week start) to count unique weekends
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      weekendDates.add(weekStart.toISOString().split('T')[0]);
    }
  }
  const weekendCount = weekendDates.size;

  // Unique months with activities
  const monthSet = new Set<string>();
  for (const log of logs) {
    monthSet.add(log.date.substring(0, 7)); // YYYY-MM
  }
  const monthCount = monthSet.size;

  // Sort logs by date to find when thresholds were crossed
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  return BADGE_DEFINITIONS.map((badge) => {
    let progress = 0;
    let unlocked = false;
    let unlockedAt: string | null = null;

    switch (badge.type) {
      case 'milestone': {
        progress = Math.min(totalActivities, badge.threshold);
        unlocked = totalActivities >= badge.threshold;
        if (unlocked && sortedLogs.length >= badge.threshold) {
          unlockedAt = sortedLogs[badge.threshold - 1].date;
        }
        break;
      }
      case 'streak': {
        progress = Math.min(longestStreak, badge.threshold);
        unlocked = longestStreak >= badge.threshold;
        // We can't easily determine the exact date the streak was achieved, so use latest date
        if (unlocked && sortedLogs.length > 0) {
          unlockedAt = sortedLogs[sortedLogs.length - 1].date;
        }
        break;
      }
      case 'category': {
        const catCount = categoryCounts[badge.category!] || 0;
        progress = Math.min(catCount, badge.threshold);
        unlocked = catCount >= badge.threshold;
        if (unlocked) {
          // Find the date of the Nth activity in this category
          let count = 0;
          for (const log of sortedLogs) {
            if (log.category === badge.category) {
              count++;
              if (count === badge.threshold) {
                unlockedAt = log.date;
                break;
              }
            }
          }
        }
        break;
      }
      case 'explorer': {
        progress = categoriesCovered;
        unlocked = categoriesCovered >= badge.threshold;
        if (unlocked && sortedLogs.length > 0) {
          unlockedAt = sortedLogs[sortedLogs.length - 1].date;
        }
        break;
      }
      case 'time': {
        progress = Math.min(totalMinutes, badge.threshold);
        unlocked = totalMinutes >= badge.threshold;
        if (unlocked && sortedLogs.length > 0) {
          unlockedAt = sortedLogs[sortedLogs.length - 1].date;
        }
        break;
      }
      case 'special': {
        if (badge.id === 'weekend-warrior') {
          progress = Math.min(weekendCount, badge.threshold);
          unlocked = weekendCount >= badge.threshold;
        } else if (badge.id === 'early-bird') {
          progress = Math.min(monthCount, badge.threshold);
          unlocked = monthCount >= badge.threshold;
        }
        if (unlocked && sortedLogs.length > 0) {
          unlockedAt = sortedLogs[sortedLogs.length - 1].date;
        }
        break;
      }
    }

    return {
      ...badge,
      unlocked,
      unlockedAt,
      progress,
    };
  });
}

// ─── Calendar heatmap data ───────────────────────────────

export interface CalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function buildCalendarHeatmap(dates: string[], monthsBack: number = 6): CalendarDay[] {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    counts[d] = (counts[d] || 0) + 1;
  }

  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - monthsBack);
  start.setDate(1);

  const days: CalendarDay[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().split('T')[0];
    const count = counts[dateStr] || 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: dateStr, count, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
