import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { morningIdea, weekendPlan, weeklySummary, community } = body;

    const notificationPrefs = {
      morning_idea: morningIdea ?? true,
      weekend_plan: weekendPlan ?? true,
      weekly_summary: weeklySummary ?? true,
      community: community ?? false,
    };

    const { error } = await supabase
      .from('users')
      .update({ notification_prefs: notificationPrefs })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notificationPrefs });
  } catch (error) {
    console.error('Notifications update error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
