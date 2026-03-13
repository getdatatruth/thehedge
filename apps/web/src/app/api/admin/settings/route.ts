import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit';

// ─── In-memory system settings ─────────────────────────
// Can be migrated to a system_settings table later.

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

const settings: SystemSettings = {
  featureFlags: {
    community: true,
    ai_chat: true,
    educator_suite: true,
    weekly_plans: false,
    streaks: false,
    notifications: false,
    stripe_billing: false,
  },
  adminEmails: [],
  maintenanceMode: false,
  maintenanceMessage: 'We are performing scheduled maintenance. Please check back shortly.',
  systemHealth: {
    apiResponseTime: 142,
    errorRate: 0.02,
    uptime: 99.97,
    lastChecked: new Date().toISOString(),
  },
};

export async function GET() {
  try {
    // Refresh health check timestamp
    settings.systemHealth.lastChecked = new Date().toISOString();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'toggle_feature': {
        const { feature, enabled } = body;
        settings.featureFlags[feature] = enabled;
        logAuditEvent('admin', 'toggle_feature_flag', 'settings', feature, { enabled });
        break;
      }

      case 'add_admin_email': {
        const { email } = body;
        if (!settings.adminEmails.includes(email)) {
          settings.adminEmails.push(email);
          logAuditEvent('admin', 'add_admin_email', 'settings', email, {});
        }
        break;
      }

      case 'remove_admin_email': {
        const { email } = body;
        settings.adminEmails = settings.adminEmails.filter((e) => e !== email);
        logAuditEvent('admin', 'remove_admin_email', 'settings', email, {});
        break;
      }

      case 'toggle_maintenance': {
        settings.maintenanceMode = body.enabled;
        if (body.message) {
          settings.maintenanceMessage = body.message;
        }
        logAuditEvent('admin', 'toggle_maintenance', 'settings', 'maintenance', {
          enabled: body.enabled,
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
