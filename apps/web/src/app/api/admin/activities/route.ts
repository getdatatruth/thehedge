import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/lib/admin/queries';
import { apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const activity = await getActivityById(id);
      return NextResponse.json(activity);
    }

    const activities = await getAllActivities();
    return NextResponse.json(activities);
  } catch (error) {
    console.error('GET /api/admin/activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const activity = await createActivity({
      title: body.title,
      slug,
      description: body.description || '',
      instructions: { steps: body.instructions || [] },
      category: body.category || 'nature',
      age_min: body.age_min || 3,
      age_max: body.age_max || 10,
      duration_minutes: body.duration_minutes || 30,
      location: body.location || 'indoor',
      energy_level: body.energy_level || 'moderate',
      mess_level: body.mess_level || 'low',
      screen_free: body.screen_free ?? true,
      premium: body.premium ?? false,
      materials: body.materials || [],
      learning_outcomes: body.learning_outcomes || [],
      published: body.published ?? false,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/activities error:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing activity ID' }, { status: 400 });
    }

    await updateActivity(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/activities error:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing activity ID' }, { status: 400 });
    }

    await deleteActivity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/activities error:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
