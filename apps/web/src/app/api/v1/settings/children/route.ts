import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/settings/children
 * Returns all children for this family.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { data: children, error: queryError } = await supabase
    .from('children')
    .select('*')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: true });

  if (queryError) {
    return apiError('Failed to fetch children', 500);
  }

  return apiSuccess(children || []);
}

/**
 * POST /api/v1/settings/children
 * Add a new child to this family.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { name, date_of_birth, interests, school_status } = body;

  if (!name) return apiError('Child name is required', 422, 'VALIDATION_ERROR');

  const { data: child, error: insertError } = await supabase
    .from('children')
    .insert({
      family_id: profile.family_id,
      name,
      date_of_birth: date_of_birth || null,
      interests: interests || [],
      school_status: school_status || null,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to add child', 500);
  }

  return apiSuccess(child, undefined, 201);
}

/**
 * PUT /api/v1/settings/children
 * Update an existing child.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return apiError('Child id is required', 422, 'VALIDATION_ERROR');

  // Verify child belongs to this family
  const { data: existing } = await supabase
    .from('children')
    .select('id')
    .eq('id', id)
    .eq('family_id', profile.family_id)
    .single();

  if (!existing) return apiError('Child not found', 404);

  const allowedFields: Record<string, unknown> = {};
  const allowed = ['name', 'date_of_birth', 'interests', 'school_status', 'learning_style', 'sen_flags', 'curriculum_stage', 'avatar_url'];
  for (const key of allowed) {
    if (key in updates) {
      allowedFields[key] = updates[key];
    }
  }

  if (Object.keys(allowedFields).length === 0) {
    return apiError('No valid fields to update', 422, 'VALIDATION_ERROR');
  }

  const { data: child, error: updateError } = await supabase
    .from('children')
    .update(allowedFields)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return apiError('Failed to update child', 500);
  }

  return apiSuccess(child);
}

/**
 * DELETE /api/v1/settings/children
 * Remove a child from this family.
 */
export async function DELETE(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { id } = body;

  if (!id) return apiError('Child id is required', 422, 'VALIDATION_ERROR');

  // Verify child belongs to this family
  const { data: existing } = await supabase
    .from('children')
    .select('id')
    .eq('id', id)
    .eq('family_id', profile.family_id)
    .single();

  if (!existing) return apiError('Child not found', 404);

  const { error: deleteError } = await supabase
    .from('children')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return apiError('Failed to remove child', 500);
  }

  return apiSuccess({ deleted: true });
}
