'use client';

import { useState } from 'react';
import type { EarnedBadge } from '@/lib/badges';
import { Star, Lock, X } from 'lucide-react';

interface BadgeDisplayProps {
  badges: EarnedBadge[];
  showAll?: boolean;
  compact?: boolean;
}

export function BadgeDisplay({ badges, showAll = true, compact = false }: BadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);

  const earned = badges.filter((b) => b.unlocked);
  const inProgress = badges.filter((b) => !b.unlocked && b.progress > 0);
  const locked = badges.filter((b) => !b.unlocked && b.progress === 0);

  const displayInProgress = showAll ? inProgress : inProgress.slice(0, 6);
  const displayLocked = showAll ? locked : [];

  return (
    <>
      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
              Earned ({earned.length})
            </p>
          </div>
          <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {earned.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="card-elevated p-4 flex items-center gap-3 text-left hover:ring-1 hover:ring-sage/30 transition-all"
              >
                <span className="text-2xl flex-shrink-0">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{badge.name}</p>
                  <p className="text-xs text-clay/50 truncate font-serif">{badge.description}</p>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/15 flex-shrink-0">
                  <Star className="h-3.5 w-3.5 text-moss fill-moss" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In progress */}
      {displayInProgress.length > 0 && (
        <div className="space-y-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/40">
            In Progress ({inProgress.length})
          </p>
          <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {displayInProgress.map((badge) => {
              const percent = Math.min((badge.progress / badge.threshold) * 100, 100);
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className="card-elevated p-4 text-left hover:ring-1 hover:ring-stone/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale-[30%] flex-shrink-0">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{badge.name}</p>
                      <p className="text-xs text-clay/50 truncate font-serif">{badge.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-linen">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-terracotta/60 to-terracotta/40 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-clay/40 whitespace-nowrap">
                      {badge.progress}/{badge.threshold}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {displayLocked.length > 0 && (
        <div className="space-y-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/30">
            Locked ({locked.length})
          </p>
          <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'}`}>
            {displayLocked.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="card-elevated p-3 flex flex-col items-center gap-2 opacity-40 hover:opacity-60 transition-all text-center"
              >
                <span className="text-xl grayscale">{badge.icon}</span>
                <div className="flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5 text-clay/30" />
                  <p className="text-[10px] font-medium text-clay/40">{badge.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge detail modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-parchment rounded-[14px] p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedBadge.icon}</span>
                <div>
                  <h3 className="font-display text-xl font-light text-ink">{selectedBadge.name}</h3>
                  <p className="text-xs text-clay/50 capitalize">{selectedBadge.type} badge</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-lg hover:bg-linen transition-colors"
              >
                <X className="h-4 w-4 text-clay/40" />
              </button>
            </div>

            <p className="text-sm font-serif text-clay mb-4">{selectedBadge.description}</p>

            {selectedBadge.unlocked ? (
              <div className="flex items-center gap-2 bg-moss/10 rounded-lg p-3">
                <Star className="h-4 w-4 text-moss fill-moss" />
                <span className="text-sm font-medium text-moss">
                  Earned{selectedBadge.unlockedAt ? ` on ${new Date(selectedBadge.unlockedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-clay/50">Progress</span>
                  <span className="text-xs font-semibold text-clay/60">
                    {selectedBadge.progress} / {selectedBadge.threshold}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-linen">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-terracotta to-terracotta/70 transition-all"
                    style={{ width: `${Math.min((selectedBadge.progress / selectedBadge.threshold) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-clay/40 mt-2 font-serif">
                  {selectedBadge.threshold - selectedBadge.progress} more to go!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Badge ribbon (compact inline display) ───────────────

interface BadgeRibbonProps {
  badges: EarnedBadge[];
  maxDisplay?: number;
}

export function BadgeRibbon({ badges, maxDisplay = 8 }: BadgeRibbonProps) {
  const earned = badges.filter((b) => b.unlocked);
  const display = earned.slice(0, maxDisplay);
  const remaining = earned.length - maxDisplay;

  if (earned.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {display.map((badge) => (
        <span
          key={badge.id}
          title={badge.name}
          className="text-lg cursor-default hover:scale-125 transition-transform"
        >
          {badge.icon}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] font-semibold text-clay/40 ml-1">
          +{remaining}
        </span>
      )}
    </div>
  );
}

// ─── Achievement timeline ────────────────────────────────

interface AchievementTimelineProps {
  badges: EarnedBadge[];
}

export function AchievementTimeline({ badges }: AchievementTimelineProps) {
  const earned = badges
    .filter((b) => b.unlocked && b.unlockedAt)
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''));

  if (earned.length === 0) {
    return (
      <p className="text-sm text-clay/50 font-serif py-4">
        Start logging activities to earn your first badge!
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-stone/50" />
      <div className="space-y-4">
        {earned.map((badge, index) => {
          const date = badge.unlockedAt
            ? new Date(badge.unlockedAt).toLocaleDateString('en-IE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '';
          return (
            <div key={badge.id} className="flex items-start gap-4 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-parchment border-2 border-sage/30 z-10 flex-shrink-0">
                <span className="text-lg">{badge.icon}</span>
              </div>
              <div className={`flex-1 pb-4 ${index < earned.length - 1 ? '' : ''}`}>
                <p className="text-sm font-medium text-ink">{badge.name}</p>
                <p className="text-xs text-clay/50 font-serif">{badge.description}</p>
                <p className="text-[10px] text-clay/40 mt-1">{date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
