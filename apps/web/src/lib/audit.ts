// ─── Audit Log ─────────────────────────────────────────
// Persists to Supabase admin_audit_logs table.
// Falls back to in-memory if DB write fails.

import { createClient } from '@/lib/supabase/server';

export interface AuditEvent {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// In-memory fallback (used if DB is unavailable)
const memoryFallback: AuditEvent[] = [];
let nextId = 1;

export async function logAuditEvent(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {},
): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: String(nextId++),
    adminUserId,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('admin_audit_logs').insert({
      admin_user_id: adminUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });

    if (error) {
      // Fall back to in-memory if table doesn't exist yet
      memoryFallback.unshift(event);
      if (memoryFallback.length > 1000) memoryFallback.length = 1000;
    }
  } catch {
    // DB unavailable - use in-memory fallback
    memoryFallback.unshift(event);
    if (memoryFallback.length > 1000) memoryFallback.length = 1000;
  }

  return event;
}

export async function getAuditEvents(filters?: {
  action?: string;
  entityType?: string;
  adminUserId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ events: AuditEvent[]; total: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.adminUserId) query = query.eq('admin_user_id', filters.adminUserId);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data) {
      // Fall back to in-memory
      return getMemoryEvents(filters);
    }

    const events: AuditEvent[] = data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      adminUserId: row.admin_user_id as string,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      details: (row.details || {}) as Record<string, unknown>,
      timestamp: row.created_at as string,
    }));

    return { events, total: count || events.length };
  } catch {
    return getMemoryEvents(filters);
  }
}

// In-memory fallback for when DB is unavailable
function getMemoryEvents(filters?: {
  action?: string;
  entityType?: string;
  adminUserId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): { events: AuditEvent[]; total: number } {
  let filtered = [...memoryFallback];

  if (filters?.action) filtered = filtered.filter(e => e.action === filters.action);
  if (filters?.entityType) filtered = filtered.filter(e => e.entityType === filters.entityType);
  if (filters?.adminUserId) filtered = filtered.filter(e => e.adminUserId === filters.adminUserId);
  if (filters?.startDate) filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
  if (filters?.endDate) filtered = filtered.filter(e => e.timestamp <= filters.endDate!);

  const total = filtered.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;

  return {
    events: filtered.slice(offset, offset + limit),
    total,
  };
}
