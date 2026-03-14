import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/admin/collections
 * List all collections (admin view - includes unpublished).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/admin/collections error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

/**
 * POST /api/admin/collections
 * Create a new collection.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    const slug = (body.slug || body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .insert({
        title: body.title,
        slug,
        description: body.description || null,
        emoji: body.emoji || null,
        activity_ids: body.activity_ids || [],
        featured: body.featured ?? false,
        seasonal: body.seasonal ?? false,
        event_date: body.event_date || null,
        published: body.published ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/collections error:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/collections
 * Update an existing collection.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    // Re-generate slug if title changed
    if (updates.title && !updates.slug) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    updates.updated_at = new Date().toISOString();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT /api/admin/collections error:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/collections?id=<uuid>
 * Delete a collection.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/collections error:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
