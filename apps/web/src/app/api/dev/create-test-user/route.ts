import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DEV ONLY - creates a test user with email confirmed, family, and children
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { email, password, name } = await request.json();
    const admin = createAdminClient();

    // Create auth user with email auto-confirmed
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // Create family
    const { data: family, error: famError } = await admin
      .from('families')
      .insert({
        name: `${name}'s Family`,
        county: 'Cork',
        latitude: 51.8985,
        longitude: -8.4756,
        family_style: 'balanced',
        onboarding_completed: true,
        subscription_tier: 'family',
        subscription_status: 'active',
      })
      .select()
      .single();

    if (famError) {
      return NextResponse.json({ error: famError.message }, { status: 400 });
    }

    // Create user profile
    const { error: userError } = await admin
      .from('users')
      .insert({
        id: userId,
        family_id: family.id,
        name,
        email,
        role: 'owner',
      });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    // Create sample children
    const { error: childError } = await admin
      .from('children')
      .insert([
        {
          family_id: family.id,
          name: 'Saoirse',
          date_of_birth: '2021-03-15',
          interests: ['nature', 'art', 'animals'],
          school_status: 'mainstream',
          learning_style: 'kinesthetic',
        },
        {
          family_id: family.id,
          name: 'Fionn',
          date_of_birth: '2023-06-20',
          interests: ['movement', 'music', 'building'],
          school_status: 'mainstream',
          learning_style: 'visual',
        },
      ]);

    if (childError) {
      return NextResponse.json({ error: childError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Account created! Email: ${email}, Password: ${password}`,
      userId,
      familyId: family.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
