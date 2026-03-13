import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFamilyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', userId)
    .single();
  return data?.family_id;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = await getFamilyId(supabase, user.id);
    if (!familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const { data: children, error } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('date_of_birth', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Children fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = await getFamilyId(supabase, user.id);
    if (!familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, dateOfBirth, interests, schoolStatus, senFlags, learningStyle, curriculumStage } = body;

    if (!name || !dateOfBirth) {
      return NextResponse.json({ error: 'Name and date of birth are required' }, { status: 400 });
    }

    const { data: child, error } = await supabase
      .from('children')
      .insert({
        family_id: familyId,
        name,
        date_of_birth: dateOfBirth,
        interests: interests || [],
        school_status: schoolStatus || 'school',
        sen_flags: senFlags || [],
        learning_style: learningStyle || null,
        curriculum_stage: curriculumStage || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    console.error('Child create error:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = await getFamilyId(supabase, user.id);
    if (!familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, dateOfBirth, interests, schoolStatus, senFlags, learningStyle, curriculumStage } = body;

    if (!id) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (interests !== undefined) updateData.interests = interests;
    if (schoolStatus !== undefined) updateData.school_status = schoolStatus;
    if (senFlags !== undefined) updateData.sen_flags = senFlags;
    if (learningStyle !== undefined) updateData.learning_style = learningStyle;
    if (curriculumStage !== undefined) updateData.curriculum_stage = curriculumStage;

    const { data: child, error } = await supabase
      .from('children')
      .update(updateData)
      .eq('id', id)
      .eq('family_id', familyId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error('Child update error:', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = await getFamilyId(supabase, user.id);
    if (!familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id)
      .eq('family_id', familyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Child delete error:', error);
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
  }
}
