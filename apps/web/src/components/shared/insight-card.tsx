'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

interface InsightCardProps {
  type: 'today' | 'plan_week' | 'activity' | 'progress';
  context: Record<string, any>;
  enabled?: boolean;
}

interface InsightData {
  insight: string;
  suggestion: string | null;
}

// Simple in-memory cache (persists across renders, cleared on page nav)
const insightCache: Record<string, { data: InsightData; timestamp: number }> = {};
const CACHE_TTL = 3600000; // 1 hour

function getCacheKey(type: string, context: Record<string, any>): string {
  const childNames = (context.children || []).map((c: any) => c.name).join(',');
  return `${type}-${childNames}-${context.activityTitle || ''}-${context.hedgeScore || 0}`;
}

export function InsightCard({ type, context, enabled = true }: InsightCardProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const fetchInsight = useCallback(async () => {
    const cacheKey = getCacheKey(type, context);
    const cached = insightCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const payload = json.data || json;
      const insightData: InsightData = {
        insight: payload.insight,
        suggestion: payload.suggestion || null,
      };
      setData(insightData);
      insightCache[cacheKey] = { data: insightData, timestamp: Date.now() };
    } catch {
      // Silently fail - don't show card if AI fails
    } finally {
      setLoading(false);
    }
  }, [type, context]);

  useEffect(() => {
    if (enabled) fetchInsight();
  }, [enabled, fetchInsight]);

  if (!data && !loading) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-cat-nature/20 bg-cat-nature/5 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3">
          <Sparkles className="h-3.5 w-3.5 text-cat-nature" />
          <div className="h-2.5 w-10 rounded-full bg-cat-nature/15 animate-pulse" />
          <div className="h-2.5 w-16 rounded-full bg-cat-nature/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-cat-nature/20 bg-cat-nature/5 overflow-hidden animate-fade-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-5 py-3 text-left cursor-pointer"
      >
        <Sparkles className="h-3.5 w-3.5 text-cat-nature shrink-0" />
        <span className="flex-1 text-[12px] font-semibold text-cat-nature uppercase tracking-wider">
          AI Insight
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-sage transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-2">
          <p className="text-sm leading-relaxed text-umber">{data.insight}</p>
          {data.suggestion && (
            <p className="text-sm font-medium text-cat-nature leading-relaxed">
              {data.suggestion}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
