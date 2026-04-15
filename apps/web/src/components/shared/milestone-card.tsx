'use client';

interface Milestone {
  id: string;
  name: string;
  emoji: string;
  achieved: boolean;
  progress?: number;
  target?: number;
  achievedDate?: string;
  description?: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: () => void;
}

function isRecentlyAchieved(achievedDate?: string): boolean {
  if (!achievedDate) return false;
  const achieved = new Date(achievedDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - achieved.getTime()) / 86400000);
  return diffDays <= 7;
}

function daysAgoLabel(achievedDate: string): string {
  const achieved = new Date(achievedDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - achieved.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function MilestoneCard({ milestone, onClick }: MilestoneCardProps) {
  const recentlyAchieved = milestone.achieved && isRecentlyAchieved(milestone.achievedDate);
  const isClose = !milestone.achieved
    && milestone.progress !== undefined
    && milestone.target !== undefined
    && milestone.progress / milestone.target > 0.8;

  // Only show if recently achieved or close to achieving
  if (!recentlyAchieved && !isClose) return null;

  if (recentlyAchieved) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-2xl border border-amber/20 bg-amber/5 p-6 transition-all hover:shadow-md hover:border-amber/30 cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm">🎉</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber">
            Milestone unlocked
          </span>
          <span className="text-sm">🎉</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">{milestone.emoji}</span>
          <p className="text-[13px] text-clay">You just earned...</p>
          <h3 className="font-display text-xl font-light text-ink">{milestone.name}</h3>
          {milestone.description && (
            <p className="text-[13px] text-clay text-center">{milestone.description}</p>
          )}
          {milestone.achievedDate && (
            <span className="text-[11px] text-stone mt-1">
              {daysAgoLabel(milestone.achievedDate)}
            </span>
          )}
        </div>
      </button>
    );
  }

  // Close to achieving - progress card
  const progress = milestone.progress!;
  const target = milestone.target!;
  const pct = Math.min(100, Math.round((progress / target) * 100));
  const remaining = target - progress;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white shadow-sm p-5 transition-all hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{milestone.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-cat-nature">
            Almost there!
          </p>
          <h3 className="text-[15px] font-semibold text-ink truncate">{milestone.name}</h3>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-cat-nature/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-cat-nature rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[12px] text-clay">
        {progress} / {target} - {remaining} more to go
      </p>
    </button>
  );
}

export { type Milestone };
