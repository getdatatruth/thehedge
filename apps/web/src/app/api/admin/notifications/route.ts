import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit';

// ─── In-memory notification store ──────────────────────
// Will be migrated to DB + Resend integration in Phase 2.6

export interface AdminNotification {
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

const notifications: AdminNotification[] = [];

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
}

const templates: NotificationTemplate[] = [];

let nextNotifId = 1;
let nextTemplateId = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');

    if (entity === 'templates') {
      return NextResponse.json(templates);
    }

    // Default: list notifications
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    return NextResponse.json({
      notifications: notifications.slice(offset, offset + limit),
      total: notifications.length,
    });
  } catch (error) {
    console.error('GET /api/admin/notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'send': {
        const { type, targetTier, targetFamilyId, subject, body: notifBody, scheduledFor } = body;

        const isScheduled = scheduledFor && new Date(scheduledFor) > new Date();

        const notification: AdminNotification = {
          id: String(nextNotifId++),
          type: type || 'broadcast',
          targetTier,
          targetFamilyId,
          subject,
          body: notifBody,
          sentAt: new Date().toISOString(),
          scheduledFor,
          status: isScheduled ? 'scheduled' : 'sent',
          recipientCount: type === 'family' ? 1 : type === 'tier' ? 0 : 0, // Placeholder counts
        };

        notifications.unshift(notification);

        logAuditEvent('admin', 'send_notification', 'notification', notification.id, {
          type,
          subject,
          targetTier,
          targetFamilyId,
        });

        return NextResponse.json(notification, { status: 201 });
      }

      case 'create_template': {
        const template: NotificationTemplate = {
          id: String(nextTemplateId++),
          name: body.name,
          subject: body.subject,
          body: body.body,
          createdAt: new Date().toISOString(),
        };

        templates.push(template);

        logAuditEvent('admin', 'create_notification_template', 'notification_template', template.id, {
          name: body.name,
        });

        return NextResponse.json(template, { status: 201 });
      }

      case 'delete_template': {
        const idx = templates.findIndex((t) => t.id === body.templateId);
        if (idx === -1) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        templates.splice(idx, 1);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/admin/notifications error:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
