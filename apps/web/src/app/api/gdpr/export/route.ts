import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }

    const familyId = profile.family_id;

    // Fetch all related data in parallel
    const [
      familyResult,
      childrenResult,
      activityLogsResult,
      educationPlansResult,
      dailyPlansResult,
      portfolioResult,
      communityMembershipsResult,
    ] = await Promise.all([
      supabase.from('families').select('*').eq('id', familyId).single(),
      supabase.from('children').select('*').eq('family_id', familyId),
      supabase.from('activity_logs').select('*').eq('family_id', familyId),
      supabase.from('education_plans').select('*').eq('family_id', familyId),
      supabase
        .from('children')
        .select('id')
        .eq('family_id', familyId)
        .then(async ({ data: kids }) => {
          if (!kids?.length) return { data: [] };
          const childIds = kids.map((k) => k.id);
          return supabase
            .from('daily_plans')
            .select('*')
            .in('child_id', childIds);
        }),
      supabase
        .from('children')
        .select('id')
        .eq('family_id', familyId)
        .then(async ({ data: kids }) => {
          if (!kids?.length) return { data: [] };
          const childIds = kids.map((k) => k.id);
          return supabase
            .from('portfolio_entries')
            .select('*')
            .in('child_id', childIds);
        }),
      supabase
        .from('community_memberships')
        .select('*, community_groups(name, type)')
        .eq('family_id', familyId),
    ]);

    // Try to get favourites (table may not exist yet)
    let favourites: unknown[] = [];
    try {
      const { data } = await supabase
        .from('favourites')
        .select('*')
        .eq('family_id', familyId);
      favourites = data || [];
    } catch {
      // favourites table may not exist yet
    }

    // Try to get notifications
    let notifications: unknown[] = [];
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('family_id', familyId);
      notifications = data || [];
    } catch {
      // notifications table may not exist yet
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        notification_prefs: profile.notification_prefs,
        created_at: profile.created_at,
      },
      family: familyResult.data,
      children: childrenResult.data || [],
      activity_logs: activityLogsResult.data || [],
      education_plans: educationPlansResult.data || [],
      daily_plans: dailyPlansResult.data || [],
      portfolio_entries: portfolioResult.data || [],
      community_memberships: communityMembershipsResult.data || [],
      favourites,
      notifications,
    };

    const json = JSON.stringify(exportData, null, 2);
    const fileName = `the-hedge-data-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
