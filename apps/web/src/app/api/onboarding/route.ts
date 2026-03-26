import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createApiClient(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'You must be signed in to complete onboarding.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      familyName,
      country,
      county,
      children,
      familyStyle,
      ideaTimes,
      weekendPlanning,
      holidayPlanning,
      hasOutdoorSpace,
      carActivities,
      messComfort,
    } = body;

    // Validate required fields
    if (!familyName?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Family name is required.', code: 'VALIDATION_ERROR' } }, { status: 400 });
    }
    if (!children || children.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'At least one child is required.', code: 'VALIDATION_ERROR' } }, { status: 400 });
    }
    for (const child of children) {
      if (!child.name?.trim() || !child.dateOfBirth) {
        return NextResponse.json(
          { success: false, error: { message: 'Each child must have a name and date of birth.', code: 'VALIDATION_ERROR' } },
          { status: 400 }
        );
      }
    }

    // Check if user already has a family (resume/retry scenario)
    const { data: existingUser } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    let familyId: string;

    // Determine subscription tier based on plan param and child school status
    const planParam = user.user_metadata?.plan as string | undefined;
    const hasHomeschoolChild = children.some(
      (child: { schoolStatus?: string }) =>
        child.schoolStatus === 'homeschool' || child.schoolStatus === 'considering'
    );

    let initialTier: 'free' | 'family' | 'educator' = 'free';
    let initialStatus: 'active' | 'trialing' = 'active';
    let trialEndsAt: string | null = null;

    if (planParam === 'educator' || hasHomeschoolChild) {
      // Homeschool families or those who selected educator plan get a 14-day trial
      initialTier = 'educator';
      initialStatus = 'trialing';
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      trialEndsAt = trialEnd.toISOString();
    } else if (planParam === 'family') {
      // Family plan selection gets a 14-day trial
      initialTier = 'family';
      initialStatus = 'trialing';
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      trialEndsAt = trialEnd.toISOString();
    }
    // Otherwise stays free (no trial needed)

    if (existingUser?.family_id) {
      // Update existing family
      const { error: familyError } = await supabase
        .from('families')
        .update({
          name: familyName.trim(),
          country: country || 'IE',
          county: county || null,
          family_style: familyStyle || 'balanced',
          onboarding_completed: true,
          subscription_tier: initialTier,
          subscription_status: initialStatus,
          trial_ends_at: trialEndsAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.family_id);

      if (familyError) throw familyError;
      familyId = existingUser.family_id;

      // Remove existing children so we can re-insert fresh
      await supabase.from('children').delete().eq('family_id', familyId);
    } else {
      // Create new family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName.trim(),
          country: country || 'IE',
          county: county || null,
          family_style: familyStyle || 'balanced',
          onboarding_completed: true,
          subscription_tier: initialTier,
          subscription_status: initialStatus,
          trial_ends_at: trialEndsAt,
        })
        .select('id')
        .single();

      if (familyError) throw familyError;
      familyId = family.id;
    }

    // Upsert user record with family link and preferences
    const { error: userError } = await supabase.from('users').upsert({
      id: user.id,
      family_id: familyId,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email!,
      role: 'owner',
      notification_prefs: {
        morning_idea: true,
        weekend_plan: weekendPlanning ?? true,
        weekly_summary: true,
        community: true,
      },
    });

    if (userError) throw userError;

    // Insert children
    if (children.length > 0) {
      const childInserts = children.map(
        (child: {
          name: string;
          dateOfBirth: string;
          interests: string[];
          schoolStatus: string;
          senFlags: string[];
          learningStyle: string | null;
        }) => ({
          family_id: familyId,
          name: child.name.trim(),
          date_of_birth: child.dateOfBirth,
          interests: child.interests || [],
          school_status: child.schoolStatus || 'mainstream',
          sen_flags: child.senFlags || [],
          learning_style: child.learningStyle || null,
        })
      );

      const { error: childrenError } = await supabase
        .from('children')
        .insert(childInserts);

      if (childrenError) throw childrenError;
    }

    // Save extended preferences as family metadata
    // We store ideaTimes, hasOutdoorSpace, carActivities, messComfort
    // in a preferences jsonb or as family columns. Since the schema
    // doesn't have a preferences column, we store them via user metadata
    // update on the auth user as app_metadata.
    // Actually let's update the family record with these additional prefs
    // using the existing columns where possible.
    // The families table doesn't have columns for these, so let's use
    // Supabase auth user_metadata to persist them.
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        onboarding_prefs: {
          ideaTimes: ideaTimes || [],
          holidayPlanning: holidayPlanning ?? true,
          hasOutdoorSpace: hasOutdoorSpace ?? false,
          carActivities: carActivities ?? false,
          messComfort: messComfort || 'medium',
        },
      },
    });

    if (metaError) {
      console.warn('Failed to save extended preferences:', metaError);
      // Non-critical, don't fail the whole request
    }

    return NextResponse.json({ success: true, data: { familyId } });
  } catch (error) {
    console.error('POST /api/onboarding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
          code: 'SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
