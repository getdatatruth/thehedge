import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

// ── Hedge Score Algorithm ──────────────────────────────────
//
// The Hedge Score measures a family's learning engagement across
// four dimensions, each worth up to 250 points (max 1000):
//
// 1. VOLUME (0-250): Total activities completed
//    - 1 point per activity, capped at 250
//
// 2. CONSISTENCY (0-250): Streak and regularity
//    - Current streak: 5 points per day (max 150)
//    - Unique active days: 1 point per day (max 100)
//
// 3. BREADTH (0-250): Curriculum coverage diversity
//    - Categories explored: 25 points per unique category (max 250 for all 10)
//
// 4. DEPTH (0-250): Time invested in learning
//    - 1 point per 10 minutes of total learning time (max 250 = 2500 min / ~42 hours)
//
// ── Tier Progression ───────────────────────────────────────
//
// Seedling:    0-99      (just getting started)
// Sprout:      100-249   (building habits)
// Sapling:     250-449   (consistent engagement, some breadth)
// Young Oak:   450-699   (strong across multiple dimensions)
// Oak:         700-899   (excellent coverage, deep engagement)
// Ancient Oak: 900-1000  (mastery - full year of diverse learning)
//

interface TierInfo {
  name: string;
  emoji: string;
  nextTier: string | null;
  minScore: number;
  maxScore: number;
  progress: number; // 0-1 within this tier
}

const TIERS = [
  { name: 'Seedling', emoji: '🌱', min: 0, max: 99 },
  { name: 'Sprout', emoji: '🌿', min: 100, max: 249 },
  { name: 'Sapling', emoji: '🌳', min: 250, max: 449 },
  { name: 'Young Oak', emoji: '🌲', min: 450, max: 699 },
  { name: 'Oak', emoji: '🏆', min: 700, max: 899 },
  { name: 'Ancient Oak', emoji: '👑', min: 900, max: 1000 },
];

function calculateHedgeScore(stats: {
  totalActivities: number;
  currentStreak: number;
  uniqueDays: number;
  totalMinutes: number;
  categoriesExplored: number;
}): { score: number; breakdown: { volume: number; consistency: number; breadth: number; depth: number } } {
  const volume = Math.min(250, stats.totalActivities);
  const consistency = Math.min(250,
    Math.min(150, stats.currentStreak * 5) +
    Math.min(100, stats.uniqueDays)
  );
  const breadth = Math.min(250, stats.categoriesExplored * 25);
  const depth = Math.min(250, Math.floor(stats.totalMinutes / 10));

  return {
    score: volume + consistency + breadth + depth,
    breakdown: { volume, consistency, breadth, depth },
  };
}

function getTierInfo(score: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i].min) {
      const tier = TIERS[i];
      const nextTier = i < TIERS.length - 1 ? TIERS[i + 1] : null;
      const tierRange = tier.max - tier.min;
      const progress = tierRange > 0 ? Math.min(1, (score - tier.min) / tierRange) : 1;
      return {
        name: tier.name,
        emoji: tier.emoji,
        nextTier: nextTier?.name || null,
        minScore: tier.min,
        maxScore: tier.max,
        progress,
      };
    }
  }
  return { name: 'Seedling', emoji: '🌱', nextTier: 'Sprout', minScore: 0, maxScore: 99, progress: 0 };
}

/**
 * GET /api/v1/progress
 * Returns progress stats, Hedge Score, tier, streaks, and category breakdown.
 * Query params: child_id (optional)
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { searchParams } = request.nextUrl;
  const childId = searchParams.get('child_id');

  // Get activity logs with activity details for category
  let logQuery = supabase
    .from('activity_logs')
    .select('*, activity:activity_id(category)')
    .eq('family_id', profile.family_id)
    .order('date', { ascending: false });

  if (childId) {
    logQuery = logQuery.contains('child_ids', [childId]);
  }

  const { data: logs } = await logQuery;
  const allLogs = logs || [];

  // Calculate stats
  const totalActivities = allLogs.length;
  const totalMinutes = allLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

  // Category breakdown - use joined activity category
  const categoryCount: Record<string, number> = {};
  for (const log of allLogs) {
    const category = Array.isArray(log.activity)
      ? log.activity[0]?.category
      : log.activity?.category;
    const cat = category || 'uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }

  // Streak calculation
  const uniqueDates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  let checkDate = new Date(todayStr);

  for (const dateStr of uniqueDates) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateStr === checkStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < checkStr) {
      break;
    }
  }

  // This week count
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split('T')[0];
  const thisWeek = allLogs.filter((l) => l.date >= mondayStr).length;

  // Average rating
  const rated = allLogs.filter((l) => l.rating);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, l) => sum + (l.rating || 0), 0) / rated.length
    : null;

  // Hedge Score
  const categoriesExplored = Object.keys(categoryCount).filter(k => k !== 'uncategorized').length;
  const hedgeScore = calculateHedgeScore({
    totalActivities,
    currentStreak: streak,
    uniqueDays: uniqueDates.length,
    totalMinutes,
    categoriesExplored,
  });
  const tier = getTierInfo(hedgeScore.score);

  // Badges/achievements
  const achievements = [
    { id: 'first_activity', name: 'First Activity', emoji: '🌱', unlocked: totalActivities >= 1, requirement: 'Complete 1 activity' },
    { id: 'streak_3', name: '3-Day Streak', emoji: '🔥', unlocked: streak >= 3 || uniqueDates.length >= 3, requirement: '3 days in a row' },
    { id: 'streak_7', name: 'Week Warrior', emoji: '⚡', unlocked: streak >= 7 || uniqueDates.length >= 7, requirement: '7 days in a row' },
    { id: 'ten_activities', name: 'Getting Going', emoji: '🚀', unlocked: totalActivities >= 10, requirement: '10 activities completed' },
    { id: 'five_categories', name: 'Explorer', emoji: '🧭', unlocked: categoriesExplored >= 5, requirement: 'Try 5 different categories' },
    { id: 'all_categories', name: 'Renaissance', emoji: '🌈', unlocked: categoriesExplored >= 10, requirement: 'Try all 10 categories' },
    { id: 'fifty_activities', name: 'Half Century', emoji: '⭐', unlocked: totalActivities >= 50, requirement: '50 activities completed' },
    { id: 'streak_30', name: 'Month Master', emoji: '👑', unlocked: streak >= 30, requirement: '30 days in a row' },
    { id: 'hundred_activities', name: 'Centurion', emoji: '🏆', unlocked: totalActivities >= 100, requirement: '100 activities completed' },
    { id: 'ten_hours', name: 'Time Investor', emoji: '⏰', unlocked: totalMinutes >= 600, requirement: '10 hours of learning' },
  ];

  return apiSuccess({
    total_activities: totalActivities,
    total_minutes: totalMinutes,
    current_streak: streak,
    this_week: thisWeek,
    average_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    unique_days: uniqueDates.length,
    category_breakdown: categoryCount,
    hedge_score: {
      score: hedgeScore.score,
      max_score: 1000,
      breakdown: hedgeScore.breakdown,
    },
    tier: {
      name: tier.name,
      emoji: tier.emoji,
      next_tier: tier.nextTier,
      progress: Math.round(tier.progress * 100) / 100,
      min_score: tier.minScore,
      max_score: tier.maxScore,
    },
    achievements,
  });
}
