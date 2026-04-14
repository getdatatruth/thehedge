'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Shield,
  Activity,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Wrench,
  Users,
  Zap,
} from 'lucide-react';

interface SystemSettings {
  featureFlags: Record<string, boolean>;
  adminEmails: string[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
  systemHealth: {
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
    lastChecked: string;
  };
}

type Tab = 'features' | 'admins' | 'health' | 'maintenance';

export function SettingsClient() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('features');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
      setMaintenanceMsg(data.maintenanceMessage || '');
    } catch (err) {
      console.error('Fetch settings failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (action: string, data: Record<string, unknown>) => {
    setActionLoading(action);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setSettings(updated);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update settings');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) return;
    updateSettings('add_admin_email', { email: newAdminEmail.trim() });
    setNewAdminEmail('');
  };

  const FEATURE_LABELS: Record<string, { label: string; description: string }> = {
    community: { label: 'Community', description: 'Groups, posts, and events' },
    ai_chat: { label: 'AI Chat', description: 'HedgeAI-powered activity suggestions' },
    educator_suite: { label: 'Educator Suite', description: 'Education plans, Tusla compliance' },
    weekly_plans: { label: 'Weekly Plans', description: 'Automated weekly activity planning' },
    streaks: { label: 'Streaks', description: 'Activity streak tracking and rewards' },
    notifications: { label: 'Notifications', description: 'Push and email notifications' },
    stripe_billing: { label: 'Stripe Billing', description: 'Paid subscriptions via Stripe' },
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'features', label: 'Feature Flags', icon: Zap },
    { key: 'admins', label: 'Admin Users', icon: Users },
    { key: 'health', label: 'System Health', icon: Activity },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-clay/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            System Settings
          </h1>
          <p className="text-clay/70 mt-1">
            Feature flags, admin management, and system configuration.
          </p>
        </div>
        <button onClick={fetchSettings} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Maintenance mode alert */}
      {settings.maintenanceMode && (
        <div className="flex items-center gap-3 rounded-2xl bg-rust/5 border border-rust/20 p-4">
          <AlertTriangle className="h-5 w-5 text-rust shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rust">Maintenance mode is ON</p>
            <p className="text-xs text-rust/60">Users will see the maintenance message.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone pb-px">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-linen border border-stone border-b-linen text-forest -mb-px'
                : 'text-clay/50 hover:text-clay/70'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Feature Flags */}
      {activeTab === 'features' && (
        <div className="space-y-3 max-w-2xl">
          {Object.entries(settings.featureFlags).map(([feature, enabled]) => {
            const featureInfo = FEATURE_LABELS[feature] || { label: feature, description: '' };
            return (
              <div
                key={feature}
                className="card-elevated p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-forest">{featureInfo.label}</p>
                  <p className="text-xs text-clay/50">{featureInfo.description}</p>
                </div>
                <button
                  onClick={() => updateSettings('toggle_feature', { feature, enabled: !enabled })}
                  disabled={actionLoading === 'toggle_feature'}
                  className="transition-all"
                >
                  {enabled ? (
                    <ToggleRight className="h-7 w-7 text-moss" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-clay/30" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Users */}
      {activeTab === 'admins' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex gap-2">
            <Input
              placeholder="admin@thehedge.ie"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              className="h-10 rounded-lg border-stone bg-parchment flex-1"
            />
            <button
              onClick={handleAddAdmin}
              disabled={!newAdminEmail.trim()}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Admin
            </button>
          </div>

          {settings.adminEmails.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <Shield className="h-8 w-8 text-clay/20 mx-auto mb-3" />
              <p className="text-sm text-clay/40">No admin emails configured.</p>
              <p className="text-xs text-clay/30 mt-1">Add email addresses to grant admin access.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {settings.adminEmails.map((email) => (
                <div key={email} className="card-elevated p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 text-xs font-bold text-forest">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-forest">{email}</span>
                  </div>
                  <button
                    onClick={() => updateSettings('remove_admin_email', { email })}
                    className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Health */}
      {activeTab === 'health' && (
        <div className="space-y-4 max-w-2xl">
          <p className="text-xs text-clay/40">
            Last checked: {new Date(settings.systemHealth.lastChecked).toLocaleString('en-IE')}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <Activity className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">API Response</span>
              </div>
              <p className="text-2xl font-bold font-display text-forest">
                {settings.systemHealth.apiResponseTime}ms
              </p>
              <p className="text-[10px] text-clay/30 mt-1">Average response time</p>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Error Rate</span>
              </div>
              <p className={`text-2xl font-bold font-display ${
                settings.systemHealth.errorRate > 1 ? 'text-rust' : 'text-forest'
              }`}>
                {settings.systemHealth.errorRate}%
              </p>
              <p className="text-[10px] text-clay/30 mt-1">Last 24 hours</p>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <Zap className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Uptime</span>
              </div>
              <p className="text-2xl font-bold font-display text-moss">
                {settings.systemHealth.uptime}%
              </p>
              <p className="text-[10px] text-clay/30 mt-1">Last 30 days</p>
            </div>
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-display text-lg font-bold text-forest mb-3">System Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Database (Supabase)', status: 'operational' },
                { name: 'Authentication', status: 'operational' },
                { name: 'File Storage', status: 'operational' },
                { name: 'HedgeAI', status: 'operational' },
                { name: 'Email (Resend)', status: 'not_configured' },
                { name: 'Payments (Stripe)', status: 'not_configured' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between py-1">
                  <span className="text-sm text-forest">{service.name}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    service.status === 'operational'
                      ? 'bg-moss/10 text-moss'
                      : service.status === 'not_configured'
                        ? 'bg-clay/10 text-clay/40'
                        : 'bg-rust/10 text-rust'
                  }`}>
                    {service.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Mode */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6 max-w-2xl">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-forest">Maintenance Mode</h3>
                <p className="text-xs text-clay/50 mt-1">
                  When enabled, users will see a maintenance message instead of the app.
                </p>
              </div>
              <button
                onClick={() =>
                  updateSettings('toggle_maintenance', {
                    enabled: !settings.maintenanceMode,
                    message: maintenanceMsg,
                  })
                }
                disabled={actionLoading === 'toggle_maintenance'}
                className="transition-all"
              >
                {settings.maintenanceMode ? (
                  <ToggleRight className="h-8 w-8 text-rust" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-clay/30" />
                )}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
                Maintenance Message
              </label>
              <textarea
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-stone bg-parchment px-3 py-2.5 text-sm text-forest placeholder:text-clay/30 focus:outline-none focus:ring-2 focus:ring-moss/20"
              />
              <button
                onClick={() =>
                  updateSettings('toggle_maintenance', {
                    enabled: settings.maintenanceMode,
                    message: maintenanceMsg,
                  })
                }
                className="btn-secondary text-sm mt-3"
              >
                Update Message
              </button>
            </div>
          </div>

          {settings.maintenanceMode && (
            <div className="rounded-2xl bg-rust/5 border border-rust/20 p-6 text-center">
              <Wrench className="h-8 w-8 text-rust mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-rust mb-2">Preview</h3>
              <p className="text-sm text-rust/70">{settings.maintenanceMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
