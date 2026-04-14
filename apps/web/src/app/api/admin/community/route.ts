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

      case 'analytics': {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
          { count: totalGroups },
          { count: totalPosts },
          { count: totalMembers },
          { count: postsThisWeek },
          { data: recentPosts },
        ] = await Promise.all([
          supabase.from('community_groups').select('*', { count: 'exact', head: true }),
          supabase.from('community_posts').select('*', { count: 'exact', head: true }),
          supabase.from('community_memberships').select('*', { count: 'exact', head: true }),
          supabase.from('community_posts').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
          supabase.from('community_posts').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: true }),
        ]);

        // Active groups this week = groups with posts in last 7 days
        const { data: activeGroupPosts } = await supabase
          .from('community_posts')
          .select('group_id')
          .gte('created_at', weekAgo.toISOString());
        const activeGroupsThisWeek = new Set((activeGroupPosts || []).map((p: { group_id: string }) => p.group_id)).size;

        // Build posts-per-day for last 30 days
        const dailyMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
          const key = d.toISOString().slice(0, 10);
          dailyMap[key] = 0;
        }
        (recentPosts || []).forEach((p: { created_at: string }) => {
          const key = p.created_at.slice(0, 10);
          if (dailyMap[key] !== undefined) dailyMap[key]++;
        });
        const postsPerDay = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

        return NextResponse.json({
          totalGroups: totalGroups || 0,
          totalPosts: totalPosts || 0,
          totalMembers: totalMembers || 0,
          postsThisWeek: postsThisWeek || 0,
          activeGroupsThisWeek,
          postsPerDay,
        });
      }

      case 'reports': {
        const status = searchParams.get('status') || 'pending';
        const { data: reports, error } = await supabase
          .from('community_reports')
          .select('*')
          .eq('status', status)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;

        // Enrich reports with post/comment content and reporter info
        const postIds = (reports || []).filter((r: { post_id: string | null }) => r.post_id).map((r: { post_id: string }) => r.post_id);
        const commentIds = (reports || []).filter((r: { comment_id: string | null }) => r.comment_id).map((r: { comment_id: string }) => r.comment_id);
        const reporterFamilyIds = [...new Set((reports || []).map((r: { reporter_family_id: string }) => r.reporter_family_id))];

        const [postsResult, commentsResult, familiesResult] = await Promise.all([
          postIds.length > 0
            ? supabase.from('community_posts').select('id, title, body, type, group_id').in('id', postIds)
            : { data: [] },
          commentIds.length > 0
            ? supabase.from('community_comments').select('id, body').in('id', commentIds)
            : { data: [] },
          reporterFamilyIds.length > 0
            ? supabase.from('families').select('id, name').in('id', reporterFamilyIds)
            : { data: [] },
        ]);

        const postMap = (postsResult.data || []).reduce((acc: Record<string, { title: string; body: string; type: string; group_id: string }>, p: { id: string; title: string; body: string; type: string; group_id: string }) => {
          acc[p.id] = p;
          return acc;
        }, {});

        const commentMap = (commentsResult.data || []).reduce((acc: Record<string, { body: string }>, c: { id: string; body: string }) => {
          acc[c.id] = c;
          return acc;
        }, {});

        const familyMap = (familiesResult.data || []).reduce((acc: Record<string, string>, f: { id: string; name: string }) => {
          acc[f.id] = f.name;
          return acc;
        }, {});

        const enriched = (reports || []).map((r: { post_id: string | null; comment_id: string | null; reporter_family_id: string; [key: string]: unknown }) => ({
          ...r,
          post: r.post_id ? postMap[r.post_id] || null : null,
          comment: r.comment_id ? commentMap[r.comment_id] || null : null,
          reporter_name: familyMap[r.reporter_family_id] || 'Unknown',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity, ...fields } = body;
    const supabase = createAdminClient();

    switch (entity) {
      case 'group': {
        const { name, type, county, emoji, description, rules, featured } = fields;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        const insertData: Record<string, unknown> = { name, type: type || 'county' };
        if (county) insertData.county = county;
        if (emoji) insertData.emoji = emoji;
        if (description) insertData.description = description;
        if (rules) insertData.rules = rules;
        if (featured !== undefined) insertData.featured = featured;

        const { data, error } = await supabase
          .from('community_groups')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        logAuditEvent('admin', 'create_group', 'community_group', data.id, { name });
        return NextResponse.json(data);
      }

      case 'event': {
        const { title, description, group_id, location, date, capacity } = fields;
        if (!title || !group_id || !date) {
          return NextResponse.json({ error: 'Title, group_id, and date are required' }, { status: 400 });
        }
        const insertData: Record<string, unknown> = { title, group_id, date };
        if (description) insertData.description = description;
        if (location) insertData.location = location;
        if (capacity) insertData.capacity = parseInt(capacity, 10);

        const { data, error } = await supabase
          .from('events')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        logAuditEvent('admin', 'create_event', 'event', data.id, { title });
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/admin/community error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
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

      case 'post': {
        const { error } = await supabase
          .from('community_posts')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'update_post', 'community_post', id, updates);
        break;
      }

      case 'report': {
        const { status } = updates;
        const { error } = await supabase
          .from('community_reports')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'update_report', 'community_report', id, { status });
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

      case 'comment': {
        if (!id) return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 });
        const { error } = await supabase.from('community_comments').delete().eq('id', id);
        if (error) throw error;
        logAuditEvent('admin', 'delete_comment', 'community_comment', id, {});
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
