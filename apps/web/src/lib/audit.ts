// ─── Audit Log ─────────────────────────────────────────
// In-memory store for now — can be migrated to a DB table later.

export interface AuditEvent {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// In-memory store (persists for the lifetime of the server process)
const auditEvents: AuditEvent[] = [];

let nextId = 1;

export function logAuditEvent(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {},
): AuditEvent {
  const event: AuditEvent = {
    id: String(nextId++),
    adminUserId,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  auditEvents.unshift(event); // newest first

  // Keep max 1000 events in memory
  if (auditEvents.length > 1000) {
    auditEvents.length = 1000;
  }

  return event;
}

export function getAuditEvents(filters?: {
  action?: string;
  entityType?: string;
  adminUserId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): { events: AuditEvent[]; total: number } {
  let filtered = [...auditEvents];

  if (filters?.action) {
    filtered = filtered.filter((e) => e.action === filters.action);
  }
  if (filters?.entityType) {
    filtered = filtered.filter((e) => e.entityType === filters.entityType);
  }
  if (filters?.adminUserId) {
    filtered = filtered.filter((e) => e.adminUserId === filters.adminUserId);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((e) => e.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter((e) => e.timestamp <= filters.endDate!);
  }

  const total = filtered.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;

  return {
    events: filtered.slice(offset, offset + limit),
    total,
  };
}
