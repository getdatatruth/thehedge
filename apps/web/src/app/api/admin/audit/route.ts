import { NextRequest, NextResponse } from 'next/server';
import { getAuditEvents } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      adminUserId: searchParams.get('adminUserId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = getAuditEvents(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/admin/audit error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
