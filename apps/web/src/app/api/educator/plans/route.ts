import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ─── GET: Fetch education plans for the family ──────────

export async function GET() {
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

    const { data: plans, error } = await supabase
      .from('education_plans')
      .select('*, children(id, name, date_of_birth)')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch education plans:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    return NextResponse.json({ data: plans });
  } catch (err) {
    console.error('Plans GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Create a new education plan ──────────────────

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
    const {
      child_id,
      academic_year,
      approach,
      hours_per_day,
      days_per_week,
      curriculum_areas,
      tusla_status,
    } = body;

    if (!child_id || !academic_year) {
      return NextResponse.json(
        { error: 'child_id and academic_year are required' },
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

    const { data: plan, error: insertError } = await supabase
      .from('education_plans')
      .insert({
        family_id: profile.family_id,
        child_id,
        academic_year,
        approach: approach || 'blended',
        hours_per_day: hours_per_day || 4,
        days_per_week: days_per_week || 5,
        curriculum_areas: curriculum_areas || {},
        tusla_status: tusla_status || 'not_applied',
      })
      .select('*, children(id, name, date_of_birth)')
      .single();

    if (insertError) {
      console.error('Failed to create education plan:', insertError);
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (err) {
    console.error('Plans POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT: Update an existing education plan ─────────────

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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

    // Verify plan belongs to family
    const { data: existingPlan } = await supabase
      .from('education_plans')
      .select('id')
      .eq('id', id)
      .eq('family_id', profile.family_id)
      .single();

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    if (updates.approach !== undefined) allowedFields.approach = updates.approach;
    if (updates.hours_per_day !== undefined) allowedFields.hours_per_day = updates.hours_per_day;
    if (updates.days_per_week !== undefined) allowedFields.days_per_week = updates.days_per_week;
    if (updates.curriculum_areas !== undefined) allowedFields.curriculum_areas = updates.curriculum_areas;
    if (updates.tusla_status !== undefined) allowedFields.tusla_status = updates.tusla_status;
    if (updates.plan_document_url !== undefined) allowedFields.plan_document_url = updates.plan_document_url;
    if (updates.academic_year !== undefined) allowedFields.academic_year = updates.academic_year;

    allowedFields.updated_at = new Date().toISOString();

    const { data: plan, error: updateError } = await supabase
      .from('education_plans')
      .update(allowedFields)
      .eq('id', id)
      .select('*, children(id, name, date_of_birth)')
      .single();

    if (updateError) {
      console.error('Failed to update education plan:', updateError);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json({ data: plan });
  } catch (err) {
    console.error('Plans PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
