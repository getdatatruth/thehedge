'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  ScrollText,
  RefreshCw,
  Filter,
  Settings,
  Users,
  MessageSquare,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  update_family: Users,
  delete_family: Users,
  bulk_change_tier: Users,
  bulk_suspend: Users,
  bulk_unsuspend: Users,
  update_group: MessageSquare,
  delete_group: MessageSquare,
  delete_post: MessageSquare,
  change_member_role: MessageSquare,
  remove_member: MessageSquare,
  delete_event: MessageSquare,
  update_event: MessageSquare,
  send_notification: Bell,
  create_notification_template: Bell,
  create_discount: CreditCard,
  manual_tier_change: CreditCard,
  toggle_feature_flag: Settings,
  add_admin_email: Shield,
  remove_admin_email: Shield,
  toggle_maintenance: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  delete_family: 'text-rust bg-rust/10',
  delete_group: 'text-rust bg-rust/10',
  delete_post: 'text-rust bg-rust/10',
  delete_event: 'text-rust bg-rust/10',
  remove_member: 'text-rust bg-rust/10',
  bulk_suspend: 'text-rust bg-rust/10',
  toggle_maintenance: 'text-gold bg-gold/10',
  toggle_feature_flag: 'text-gold bg-gold/10',
  send_notification: 'text-moss bg-moss/10',
  create_discount: 'text-moss bg-moss/10',
  bulk_unsuspend: 'text-moss bg-moss/10',
};

const ENTITY_TYPES = [
  'family',
  'community_group',
  'community_post',
  'community_membership',
  'event',
  'notification',
  'notification_template',
  'discount',
  'settings',
];

export function AuditClient() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (entityTypeFilter) params.set('entityType', entityTypeFilter);
      if (startDate) params.set('startDate', new Date(startDate).toISOString());
      if (endDate) params.set('endDate', new Date(endDate).toISOString());
      params.set('limit', '100');

      const res = await fetch(`/api/admin/audit?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch audit events failed:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityTypeFilter, startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatDetails = (details: Record<string, unknown>) => {
    return Object.entries(details)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');
  };

  // Get unique actions for filter
  const uniqueActions = [...new Set(events.map((e) => e.action))];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Audit Log
          </h1>
          <p className="text-clay/70 mt-1 font-serif">
            {total} events recorded.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'border-forest' : ''}`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button onClick={fetchEvents} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card-elevated p-4 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="h-8 rounded-lg border border-stone bg-parchment px-2 text-xs text-forest"
            >
              <option value="">All</option>
              {ENTITY_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-8 rounded-lg border border-stone bg-parchment px-2 text-xs text-forest"
            >
              <option value="">All</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {formatAction(a)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 rounded-lg border-stone bg-parchment text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 rounded-lg border-stone bg-parchment text-xs"
            />
          </div>
          <button
            onClick={() => {
              setActionFilter('');
              setEntityTypeFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-clay/40 hover:text-clay/70 pb-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-5 w-5 animate-spin text-clay/30" />
        </div>
      ) : events.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <ScrollText className="h-8 w-8 text-clay/20 mx-auto mb-3" />
          <p className="text-sm text-clay/40">No audit events recorded yet.</p>
          <p className="text-xs text-clay/30 mt-1">
            Events are logged when you make changes through the admin panel.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const Icon = ACTION_ICONS[event.action] || Settings;
            const colorClass = ACTION_COLORS[event.action] || 'text-clay/50 bg-linen';

            return (
              <div key={event.id} className="card-elevated p-4 flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-forest">
                      {formatAction(event.action)}
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-linen text-clay/50">
                      {event.entityType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {Object.keys(event.details).length > 0 && (
                    <p className="text-xs text-clay/50 mt-1 truncate">
                      {formatDetails(event.details)}
                    </p>
                  )}
                  <p className="text-[10px] text-clay/30 mt-1">
                    Entity: {event.entityId.length > 40 ? event.entityId.substring(0, 40) + '...' : event.entityId}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-clay/40">
                    {new Date(event.timestamp).toLocaleDateString('en-IE', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-[10px] text-clay/30">
                    {new Date(event.timestamp).toLocaleTimeString('en-IE', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
