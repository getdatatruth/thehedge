import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const supabase = createAdminClient();

    switch (entity) {
      case 'groups': {
        const { data, error } = await supabase
          .from('community_groups')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data || []);
      }

      case 'posts': {
        const { data: posts, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;

        // Enrich with group name and family name
        const groupIds = [...new Set((posts || []).map((p: { group_id: string }) => p.group_id))];
        const familyIds = [...new Set((posts || []).map((p: { family_id: string }) => p.family_id))];

        const [{ data: groups }, { data: families }] = await Promise.all([
          groupIds.length > 0
            ? supabase.from('community_groups').select('id, name').in('id', groupIds)
            : { data: [] },
          familyIds.length > 0
            ? supabase.from('families').select('id, name').in('id', familyIds)
            : { data: [] },
        ]);

        const groupMap = (groups || []).reduce((acc: Record<string, string>, g: { id: string; name: string }) => {
          acc[g.id] = g.name;
          return acc;
        }, {});

        const familyMap = (families || []).reduce((acc: Record<string, string>, f: { id: string; name: string }) => {
          acc[f.id] = f.name;
          return acc;
        }, {});

        const enriched = (posts || []).map((p: { group_id: string; family_id: string; [key: string]: unknown }) => ({
          ...p,
          group_name: groupMap[p.group_id] || 'Unknown',
          family_name: familyMap[p.family_id] || 'Unknown',
        }));

        return NextResponse.json(enriched);
      }

      case 'memberships': {
        const { data, error } = await supabase
          .from('community_memberships')
          .select('*')
          .order('joined_at', { ascending: false })
          .limit(200);
        if (error) throw error;

        // Enrich
        const groupIds = [...new Set((data || []).map((m: { group_id: string }) => m.group_id))];
        const familyIds = [...new Set((data || []).map((m: { family_id: string }) => m.family_id))];

        const [{ data: groups }, { data: families }] = await Promise.all([
          groupIds.length > 0
            ? supabase.from('community_groups').select('id, name').in('id', groupIds)
            : { data: [] },
          familyIds.length > 0
            ? supabase.from('families').select('id, name').in('id', familyIds)
            : { data: [] },
        ]);

        const groupMap = (groups || []).reduce((acc: Record<string, string>, g: { id: string; name: string }) => {
          acc[g.id] = g.name;
          return acc;
        }, {});

        const familyMap = (families || []).reduce((acc: Record<string, string>, f: { id: string; name: string }) => {
          acc[f.id] = f.name;
          return acc;
        }, {});

        const enriched = (data || []).map((m: { group_id: string; family_id: string; [key: string]: unknown }) => ({
          ...m,
          group_name: groupMap[m.group_id] || 'Unknown',
          family_name: familyMap[m.family_id] || 'Unknown',
        }));

        return NextResponse.json(enriched);
      }

      case 'events': {
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);
        if (error) throw error;

        const groupIds = [...new Set((eventsData || []).map((e: { group_id: string }) => e.group_id))];
        let groupMap: Record<string, string> = {};
        if (groupIds.length > 0) {
          const { data: groups } = await supabase
            .from('community_groups')
            .select('id, name')
            .in('id', groupIds);
          groupMap = (groups || []).reduce((acc: Record<string, string>, g: { id: string; name: string }) => {
            acc[g.id] = g.name;
            return acc;
          }, {});
        }

        const enriched = (eventsData || []).map((e: { group_id: string; [key: string]: unknown }) => ({
          ...e,
          group_name: groupMap[e.group_id] || 'Unknown',
        }));

        return NextResponse.json(enriched);
      }

      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }
  } catch (error) {
    console.error('GET /api/admin/community error:', error);
    return NextResponse.json({ error: 'Failed to fetch community data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity, id, ...updates } = body;
    const supabase = createAdminClient();

    switch (entity) {
      case 'group': {
        const { error } = await supabase
          .from('community_groups')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'update_group', 'community_group', id, updates);
        break;
      }

      case 'membership_role': {
        const { family_id, group_id, role } = updates;
        const { error } = await supabase
          .from('community_memberships')
          .update({ role })
          .eq('family_id', family_id)
          .eq('group_id', group_id);
        if (error) throw error;
        logAuditEvent('admin', 'change_member_role', 'community_membership', `${family_id}:${group_id}`, { role });
        break;
      }

      case 'event': {
        const { error } = await supabase
          .from('events')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'update_event', 'event', id, updates);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/community error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');
    const supabase = createAdminClient();

    switch (entity) {
      case 'group': {
        if (!id) return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
        const { error } = await supabase.from('community_groups').delete().eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'delete_group', 'community_group', id, {});
        break;
      }

      case 'post': {
        if (!id) return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
        const { error } = await supabase.from('community_posts').delete().eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'delete_post', 'community_post', id, {});
        break;
      }

      case 'membership': {
        const familyId = searchParams.get('familyId');
        const groupId = searchParams.get('groupId');
        if (!familyId || !groupId) {
          return NextResponse.json({ error: 'Missing familyId or groupId' }, { status: 400 });
        }
        const { error } = await supabase
          .from('community_memberships')
          .delete()
          .eq('family_id', familyId)
          .eq('group_id', groupId);
        if (error) throw error;
        logAuditEvent('admin', 'remove_member', 'community_membership', `${familyId}:${groupId}`, {});
        break;
      }

      case 'event': {
        if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'delete_event', 'event', id, {});
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/community error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
