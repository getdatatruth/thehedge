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
    const { familyName, county, userName, familyStyle } = body;

    // Get user's family_id
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    // Update user name
    if (userName !== undefined) {
      const { error: userError } = await supabase
        .from('users')
        .update({ name: userName })
        .eq('id', user.id);

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 });
      }
    }

    // Update family data
    const familyUpdate: Record<string, string> = {};
    if (familyName !== undefined) familyUpdate.name = familyName;
    if (county !== undefined) familyUpdate.county = county;
    if (familyStyle !== undefined) familyUpdate.family_style = familyStyle;

    if (Object.keys(familyUpdate).length > 0) {
      const { error: familyError } = await supabase
        .from('families')
        .update(familyUpdate)
        .eq('id', profile.family_id);

      if (familyError) {
        return NextResponse.json({ error: familyError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
