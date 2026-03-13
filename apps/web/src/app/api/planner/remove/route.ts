import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, blockIndex } = body;

    if (!planId || blockIndex === undefined) {
      return NextResponse.json(
        { error: 'planId and blockIndex are required' },
        { status: 400 }
      );
    }

    // Fetch the existing plan
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id)')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    const ep = Array.isArray(plan.education_plans)
      ? plan.education_plans[0]
      : plan.education_plans;

    if (ep?.family_id !== profile?.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const blocks = [...(plan.blocks || [])];
    if (blockIndex < 0 || blockIndex >= blocks.length) {
      return NextResponse.json(
        { error: 'Invalid block index' },
        { status: 400 }
      );
    }

    // Remove the block
    blocks.splice(blockIndex, 1);

    if (blocks.length === 0) {
      // Delete the entire daily plan if no blocks remain
      await supabase.from('daily_plans').delete().eq('id', planId);
      return NextResponse.json({ data: null, deleted: true });
    }

    // Update status
    const allCompleted = blocks.every(
      (b: { completed: boolean }) => b.completed
    );
    const anyCompleted = blocks.some(
      (b: { completed: boolean }) => b.completed
    );
    const newStatus = allCompleted
      ? 'completed'
      : anyCompleted
        ? 'in_progress'
        : 'planned';

    const { data: updated, error: updateError } = await supabase
      .from('daily_plans')
      .update({
        blocks,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Planner remove error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
