'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Send,
  Clock,
  Users,
  User,
  Crown,
  GraduationCap,
  Plus,
  Trash2,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'broadcast' | 'tier' | 'family';
  targetTier?: string;
  targetFamilyId?: string;
  subject: string;
  body: string;
  sentAt: string;
  scheduledFor?: string;
  status: 'sent' | 'scheduled' | 'draft';
  recipientCount: number;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
}

type Tab = 'send' | 'history' | 'templates';

export function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // Send form
  const [sendType, setSendType] = useState<'broadcast' | 'tier' | 'family'>('broadcast');
  const [targetTier, setTargetTier] = useState('family');
  const [targetFamilyId, setTargetFamilyId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [sending, setSending] = useState(false);

  // Template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?entity=templates');
      const data = await res.json();
      setTemplates(data || []);
    } catch (err) {
      console.error('Fetch templates failed:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'templates') fetchTemplates();
  }, [activeTab, fetchHistory, fetchTemplates]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Subject and body are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          type: sendType,
          targetTier: sendType === 'tier' ? targetTier : undefined,
          targetFamilyId: sendType === 'family' ? targetFamilyId : undefined,
          subject,
          body,
          scheduledFor: scheduledFor || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubject('');
      setBody('');
      setScheduledFor('');
      setTargetFamilyId('');
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || !templateSubject.trim() || !templateBody.trim()) return;
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_template',
          name: templateName,
          subject: templateSubject,
          body: templateBody,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowTemplateForm(false);
      setTemplateName('');
      setTemplateSubject('');
      setTemplateBody('');
      fetchTemplates();
    } catch (err) {
      console.error('Create template failed:', err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_template', templateId: id }),
      });
      fetchTemplates();
    } catch (err) {
      console.error('Delete template failed:', err);
    }
  };

  const applyTemplate = (template: Template) => {
    setSubject(template.subject);
    setBody(template.body);
    setActiveTab('send');
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'send', label: 'Send Notification', icon: Send },
    { key: 'history', label: 'History', icon: Clock },
    { key: 'templates', label: 'Templates', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
          Notifications
        </h1>
        <p className="text-clay/70 mt-1">
          Send notifications and manage templates.
        </p>
      </div>

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

      {/* Send Tab */}
      {activeTab === 'send' && (
        <div className="max-w-2xl space-y-6">
          {/* Recipient type */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
              Recipient
            </label>
            <div className="flex gap-2">
              {([
                { key: 'broadcast', label: 'All Users', icon: Users },
                { key: 'tier', label: 'By Tier', icon: Crown },
                { key: 'family', label: 'Specific Family', icon: User },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSendType(key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    sendType === key
                      ? 'bg-forest text-parchment'
                      : 'bg-parchment text-clay/50 border border-stone hover:border-forest/20'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tier selector */}
          {sendType === 'tier' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
                Target Tier
              </label>
              <div className="flex gap-2">
                {['free', 'family', 'educator'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTargetTier(tier)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      targetTier === tier
                        ? 'bg-forest text-parchment'
                        : 'bg-parchment text-clay/50 border border-stone hover:border-forest/20'
                    }`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Family ID input */}
          {sendType === 'family' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
                Family ID
              </label>
              <Input
                placeholder="Enter family UUID..."
                value={targetFamilyId}
                onChange={(e) => setTargetFamilyId(e.target.value)}
                className="h-10 rounded-lg border-stone bg-parchment max-w-md"
              />
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
              Subject
            </label>
            <Input
              placeholder="Notification subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 rounded-lg border-stone bg-parchment"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
              Message Body
            </label>
            <textarea
              placeholder="Write your notification message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-stone bg-parchment px-3 py-2.5 text-sm text-forest placeholder:text-clay/30 focus:outline-none focus:ring-2 focus:ring-moss/20"
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
              Schedule (optional)
            </label>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="h-10 rounded-lg border-stone bg-parchment max-w-xs"
            />
            <p className="text-[11px] text-clay/40 mt-1">Leave empty to send immediately.</p>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : scheduledFor ? 'Schedule Notification' : 'Send Now'}
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={fetchHistory} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <Bell className="h-8 w-8 text-clay/20 mx-auto mb-3" />
              <p className="text-sm text-clay/40">No notifications sent yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        notif.status === 'sent' ? 'bg-moss/10 text-moss' :
                        notif.status === 'scheduled' ? 'bg-gold/10 text-gold' :
                        'bg-linen text-clay/50'
                      }`}>
                        {notif.status}
                      </span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-linen text-clay/50 capitalize">
                        {notif.type}
                        {notif.targetTier ? ` (${notif.targetTier})` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-clay/40">
                      {new Date(notif.sentAt).toLocaleDateString('en-IE', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-forest">{notif.subject}</h3>
                  <p className="text-xs text-clay/60 mt-1 line-clamp-2">{notif.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTemplateForm(!showTemplateForm)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              New Template
            </button>
          </div>

          {showTemplateForm && (
            <div className="card-elevated p-6 space-y-4 max-w-2xl">
              <h3 className="font-display text-lg font-bold text-forest">Create Template</h3>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Name</label>
                <Input
                  placeholder="Template name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="h-9 rounded-lg border-stone bg-parchment"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Subject</label>
                <Input
                  placeholder="Email subject..."
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="h-9 rounded-lg border-stone bg-parchment"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Body</label>
                <textarea
                  placeholder="Template body..."
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-stone bg-parchment px-3 py-2 text-sm text-forest placeholder:text-clay/30 focus:outline-none focus:ring-2 focus:ring-moss/20"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateTemplate} className="btn-primary text-sm py-2 px-4">
                  Save Template
                </button>
                <button onClick={() => setShowTemplateForm(false)} className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {templates.length === 0 && !showTemplateForm ? (
            <div className="card-elevated p-12 text-center">
              <FileText className="h-8 w-8 text-clay/20 mx-auto mb-3" />
              <p className="text-sm text-clay/40">No templates created yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <div key={template.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-forest">{template.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => applyTemplate(template)}
                        className="rounded-lg p-1.5 text-moss hover:bg-moss/10 transition-all"
                        title="Use template"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="rounded-lg p-1.5 text-clay/30 hover:bg-rust/10 hover:text-rust transition-all"
                        title="Delete template"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-clay/60">{template.subject}</p>
                  <p className="text-xs text-clay/40 mt-1 line-clamp-2">{template.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
