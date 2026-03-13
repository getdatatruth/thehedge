'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Trophy,
  CalendarDays,
  Flame,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  achievement: { icon: Trophy, bg: 'bg-terracotta/10', color: 'text-terracotta' },
  streak: { icon: Flame, bg: 'bg-amber-500/10', color: 'text-amber-500' },
  plan: { icon: CalendarDays, bg: 'bg-moss/10', color: 'text-moss' },
  content: { icon: Sparkles, bg: 'bg-sage/10', color: 'text-sage' },
  info: { icon: Bell, bg: 'bg-clay/10', color: 'text-clay' },
};

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.created_at);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() >= today.getTime()) {
      groups[0].items.push(n);
    } else if (d.getTime() >= yesterday.getTime()) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }

  const groups = groupByDate(notifications);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-3">Updates</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
            Notifications
          </h1>
          <p className="text-clay mt-2 font-serif text-lg">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/10 mb-4">
            <Bell className="h-8 w-8 text-sage/40" />
          </div>
          <h3 className="text-lg font-semibold text-ink/70 mb-1">No notifications yet</h3>
          <p className="text-sm text-clay/50 max-w-sm">
            When you log activities, hit streak milestones, or get plan updates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-clay/40 mb-3 px-1">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((notification) => {
                  const typeConfig = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
                  const Icon = typeConfig.icon;
                  const content = (
                    <div
                      className={`w-full text-left card-elevated p-4 flex items-start gap-4 transition-all ${
                        !notification.read ? 'ring-2 ring-moss/10 bg-moss/2' : ''
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeConfig.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${typeConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              !notification.read ? 'text-ink' : 'text-clay/70'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-moss" />
                          )}
                        </div>
                        {notification.body && (
                          <p className="text-xs text-clay/50 mt-0.5">{notification.body}</p>
                        )}
                        <p className="text-[10px] text-clay/30 mt-1.5">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  );

                  if (notification.action_url) {
                    return (
                      <Link
                        key={notification.id}
                        href={notification.action_url}
                        onClick={() => !notification.read && markRead(notification.id)}
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={notification.id}
                      onClick={() => !notification.read && markRead(notification.id)}
                      className="w-full"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
