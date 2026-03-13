import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'No family found for user' },
        { status: 400 }
      );
    }

    const { data: children, error: queryError } = await supabase
      .from('children')
      .select('id, name, date_of_birth, avatar_url')
      .eq('family_id', profile.family_id)
      .order('date_of_birth', { ascending: true });

    if (queryError) {
      console.error('Failed to fetch children:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch children' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: children });
  } catch (err) {
    console.error('Children GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
