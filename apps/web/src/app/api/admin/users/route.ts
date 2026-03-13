import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

// PUT: Update a family (tier, suspension, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing family ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('families')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    logAuditEvent('admin', 'update_family', 'family', id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
  }
}

// DELETE: Delete a family and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing family ID' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get family name before deleting for audit log
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', id)
      .single();

    // Delete family (cascades to users, children, activity_logs, etc.)
    const { error } = await supabase
      .from('families')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logAuditEvent('admin', 'delete_family', 'family', id, {
      familyName: family?.name || 'Unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
  }
}

// POST: Bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, familyIds, data } = body;

    if (!operation || !familyIds?.length) {
      return NextResponse.json({ error: 'Missing operation or familyIds' }, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (operation) {
      case 'change_tier': {
        const { error } = await supabase
          .from('families')
          .update({
            subscription_tier: data.tier,
            updated_at: new Date().toISOString(),
          })
          .in('id', familyIds);

        if (error) throw error;

        logAuditEvent('admin', 'bulk_change_tier', 'family', familyIds.join(','), {
          tier: data.tier,
          count: familyIds.length,
        });
        break;
      }

      case 'suspend': {
        const { error } = await supabase
          .from('families')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .in('id', familyIds);

        if (error) throw error;

        logAuditEvent('admin', 'bulk_suspend', 'family', familyIds.join(','), {
          count: familyIds.length,
        });
        break;
      }

      case 'unsuspend': {
        const { error } = await supabase
          .from('families')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .in('id', familyIds);

        if (error) throw error;

        logAuditEvent('admin', 'bulk_unsuspend', 'family', familyIds.join(','), {
          count: familyIds.length,
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}
