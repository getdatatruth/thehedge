import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { toggleActivityPublished } from '@/lib/admin/queries';
import { apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id, published } = await request.json();

    if (!id || typeof published !== 'boolean') {
      return NextResponse.json({ error: 'Missing id or published flag' }, { status: 400 });
    }

    await toggleActivityPublished(id, published);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/admin/activities/toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle activity' }, { status: 500 });
  }
}
