import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { ids, action } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No activity IDs provided' }, { status: 400 });
    }

    if (!['publish', 'unpublish', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === 'delete') {
      const { error } = await supabase
        .from('activities')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } else {
      const published = action === 'publish';
      const { error } = await supabase
        .from('activities')
        .update({ published, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    }

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (error) {
    console.error('POST /api/admin/activities/bulk error:', error);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
