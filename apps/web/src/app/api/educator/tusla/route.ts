import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

// ─── Helper: ensure tusla_registrations table exists ─────
async function ensureTable() {
  try {
    const admin = createAdminClient();
    // Create table if it doesn't exist (idempotent)
    await admin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tusla_registrations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
          child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
          status text NOT NULL DEFAULT 'not_started',
          notification_form jsonb DEFAULT '{}',
          documents jsonb DEFAULT '[]',
          deadlines jsonb DEFAULT '[]',
          assessment_checklist jsonb DEFAULT '[]',
          notes text,
          submitted_at timestamptz,
          approved_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE(family_id, child_id)
        );
      `,
    });
  } catch {
    // RPC might not exist or table may already exist - ignore errors
  }
}

// ─── GET: Fetch Tusla registration data ──────────────────

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

    // Try to fetch from tusla_registrations table
    const { data: registrations, error } = await supabase
      .from('tusla_registrations')
      .select('*')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet - return empty
      console.warn('tusla_registrations fetch error (table may not exist):', error.message);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: registrations || [] });
  } catch (err) {
    console.error('Tusla GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Create or update Tusla registration ───────────

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
      status,
      notification_form,
      documents,
      deadlines,
      assessment_checklist,
      notes,
    } = body;

    if (!child_id) {
      return NextResponse.json(
        { error: 'child_id is required' },
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

    // Attempt to ensure table exists
    await ensureTable();

    // Upsert registration data
    const record: Record<string, unknown> = {
      family_id: profile.family_id,
      child_id,
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      record.status = status;
      if (status === 'submitted') record.submitted_at = new Date().toISOString();
      if (status === 'approved') record.approved_at = new Date().toISOString();
    }
    if (notification_form !== undefined) record.notification_form = notification_form;
    if (documents !== undefined) record.documents = documents;
    if (deadlines !== undefined) record.deadlines = deadlines;
    if (assessment_checklist !== undefined) record.assessment_checklist = assessment_checklist;
    if (notes !== undefined) record.notes = notes;

    // Try upsert
    const { data: registration, error: upsertError } = await supabase
      .from('tusla_registrations')
      .upsert(record, { onConflict: 'family_id,child_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert tusla registration:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save registration data' },
        { status: 500 }
      );
    }

    // Also update tusla_status on the education plan if status changed
    if (status) {
      const statusMap: Record<string, string> = {
        not_started: 'not_applied',
        in_progress: 'applied',
        submitted: 'awaiting',
        approved: 'registered',
      };
      const planStatus = statusMap[status] || 'not_applied';

      await supabase
        .from('education_plans')
        .update({ tusla_status: planStatus, updated_at: new Date().toISOString() })
        .eq('family_id', profile.family_id)
        .eq('child_id', child_id);
    }

    return NextResponse.json({ data: registration }, { status: 200 });
  } catch (err) {
    console.error('Tusla POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT: Update specific fields ─────────────────────────

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
      return NextResponse.json({ error: 'Registration id is required' }, { status: 400 });
    }

    // Verify registration belongs to family
    const { data: existing } = await supabase
      .from('tusla_registrations')
      .select('id, child_id')
      .eq('id', id)
      .eq('family_id', profile.family_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const allowedFields: Record<string, unknown> = {};
    if (updates.status !== undefined) {
      allowedFields.status = updates.status;
      if (updates.status === 'submitted') allowedFields.submitted_at = new Date().toISOString();
      if (updates.status === 'approved') allowedFields.approved_at = new Date().toISOString();
    }
    if (updates.notification_form !== undefined) allowedFields.notification_form = updates.notification_form;
    if (updates.documents !== undefined) allowedFields.documents = updates.documents;
    if (updates.deadlines !== undefined) allowedFields.deadlines = updates.deadlines;
    if (updates.assessment_checklist !== undefined) allowedFields.assessment_checklist = updates.assessment_checklist;
    if (updates.notes !== undefined) allowedFields.notes = updates.notes;
    allowedFields.updated_at = new Date().toISOString();

    const { data: registration, error: updateError } = await supabase
      .from('tusla_registrations')
      .update(allowedFields)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update tusla registration:', updateError);
      return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
    }

    // Sync tusla_status on education plan
    if (updates.status) {
      const statusMap: Record<string, string> = {
        not_started: 'not_applied',
        in_progress: 'applied',
        submitted: 'awaiting',
        approved: 'registered',
      };
      const planStatus = statusMap[updates.status] || 'not_applied';

      await supabase
        .from('education_plans')
        .update({ tusla_status: planStatus, updated_at: new Date().toISOString() })
        .eq('family_id', profile.family_id)
        .eq('child_id', existing.child_id);
    }

    return NextResponse.json({ data: registration });
  } catch (err) {
    console.error('Tusla PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
