import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ─── GET: Fetch daily plans for a date range ─────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const childId = searchParams.get('childId');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'start and end dates are required' }, { status: 400 });
    }

    // Fetch children for the family
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('family_id', profile.family_id);

    const childIds = childId
      ? [childId]
      : (children || []).map((c) => c.id);

    if (childIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const { data: plans, error } = await supabase
      .from('daily_plans')
      .select('*')
      .in('child_id', childIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Failed to fetch daily plans:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    return NextResponse.json({ data: plans });
  } catch (err) {
    console.error('Schedule GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Create or update a daily plan ─────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const body = await request.json();
    const { child_id, date, blocks, education_plan_id } = body;

    if (!child_id || !date) {
      return NextResponse.json(
        { error: 'child_id and date are required' },
        { status: 400 }
      );
    }

    // Verify child belongs to family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('family_id', profile.family_id)
      .single();

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Find education plan if not provided
    let planId = education_plan_id;
    if (!planId) {
      const { data: plan } = await supabase
        .from('education_plans')
        .select('id')
        .eq('child_id', child_id)
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      planId = plan?.id;
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'No education plan found for this child. Create one first.' },
        { status: 400 }
      );
    }

    // Check if a daily plan already exists for this date and child
    const { data: existingPlan } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('child_id', child_id)
      .eq('date', date)
      .single();

    let result;

    if (existingPlan) {
      // Update existing
      const { data, error } = await supabase
        .from('daily_plans')
        .update({
          blocks: blocks || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPlan.id)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to update daily plan:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('daily_plans')
        .insert({
          education_plan_id: planId,
          child_id,
          date,
          blocks: blocks || [],
          status: 'planned',
          attendance_logged: false,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Failed to create daily plan:', error);
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ data: result }, { status: existingPlan ? 200 : 201 });
  } catch (err) {
    console.error('Schedule POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT: Update blocks or mark holiday ──────────────────

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const body = await request.json();
    const { id, blocks, status, attendance_logged, blockIndex, blockUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id)')
      .eq('id', id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const ep = Array.isArray(plan.education_plans)
      ? plan.education_plans[0]
      : plan.education_plans;

    if (ep?.family_id !== profile.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If updating a single block
    if (blockIndex !== undefined && blockUpdates) {
      const updatedBlocks = [...(plan.blocks || [])];
      if (blockIndex >= 0 && blockIndex < updatedBlocks.length) {
        updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], ...blockUpdates };
      }

      const { data: updated, error } = await supabase
        .from('daily_plans')
        .update({
          blocks: updatedBlocks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to update block:', error);
        return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
      }

      return NextResponse.json({ data: updated });
    }

    // Otherwise, update plan-level fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (blocks !== undefined) updates.blocks = blocks;
    if (status !== undefined) updates.status = status;
    if (attendance_logged !== undefined) updates.attendance_logged = attendance_logged;

    const { data: updated, error } = await supabase
      .from('daily_plans')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update daily plan:', error);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Schedule PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── DELETE: Remove a daily plan ─────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('*, education_plans(family_id)')
      .eq('id', id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const ep = Array.isArray(plan.education_plans)
      ? plan.education_plans[0]
      : plan.education_plans;

    if (ep?.family_id !== profile.family_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('daily_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete daily plan:', error);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Schedule DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
