import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { BETA_FULL_ACCESS } from '@/lib/subscription';

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
      learningPath,
      educationApproach,
      learningGoals,
      activitiesPerWeek,
      ideaTimes,
      weekendPlanning,
      holidayPlanning,
      hasOutdoorSpace,
      outdoorSpace,
      carActivities,
      messComfort,
      // When false, leave onboarding incomplete so a later step (the Kitchen
      // Table framework) is what marks it done. Prevents a half-finished family
      // from being treated as onboarded if the framework step then fails.
      completeOnboarding,
    } = body;
    const markComplete = completeOnboarding !== false;

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
    const hasHomeschoolChild = learningPath === 'homeschool' || learningPath === 'considering' || children.some(
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

    // BETA: every TestFlight tester is exactly that, a tester, so give them the
    // full Educator tier with no trial expiry the moment they finish the real
    // onboarding, regardless of the doorway they chose. Lets them exercise the
    // whole app (planner, AEARS/Tusla suite, portfolio, reports). Flip
    // BETA_FULL_ACCESS off before paid tiers / public launch.
    if (BETA_FULL_ACCESS) {
      initialTier = 'educator';
      initialStatus = 'active';
      trialEndsAt = null;
    }

    if (existingUser?.family_id) {
      // Update existing family
      const { error: familyError } = await supabase
        .from('families')
        .update({
          name: familyName.trim(),
          country: country || 'IE',
          county: county || null,
          family_style: familyStyle || 'balanced',
          onboarding_completed: markComplete,
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
      // Create new family. This bootstrap runs before the user is linked to a
      // family, so it must use the service-role client: under RLS the
      // user-scoped client cannot read back (RETURNING) a family it does not
      // yet belong to.
      const admin = createAdminClient();
      const { data: family, error: familyError } = await admin
        .from('families')
        .insert({
          name: familyName.trim(),
          country: country || 'IE',
          county: county || null,
          family_style: familyStyle || 'balanced',
          onboarding_completed: markComplete,
          subscription_tier: initialTier,
          subscription_status: initialStatus,
          trial_ends_at: trialEndsAt,
        })
        .select('id')
        .single();

      if (familyError) throw familyError;
      familyId = family.id;
    }

    // Clear any stale profile row holding this email. Supabase auth enforces a
    // unique email, so any public.users row with this email and a DIFFERENT id
    // is an orphan left behind when an old account was deleted without its
    // profile row cascading. Without this, the upsert below hits the unique
    // email index (users_email_idx) and the whole onboarding 500s. Needs the
    // service-role client: RLS forbids a user touching a row that is not theirs.
    if (user.email) {
      const adminCleanup = createAdminClient();
      await adminCleanup.from('users').delete().eq('email', user.email).neq('id', user.id);
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
    // Surface the real cause. Supabase/Postgres errors are plain objects (not
    // Error instances), so the old `instanceof Error` check hid them behind a
    // generic line. Pull message + code + details/hint from whatever shape.
    const e = error as { message?: string; code?: string; details?: string; hint?: string } | null;
    const message = e?.message || (error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    const code = e?.code;
    const extra = [e?.details, e?.hint].filter(Boolean).join(' ');
    return NextResponse.json(
      {
        success: false,
        error: {
          message: [message, code ? `[${code}]` : '', extra].filter(Boolean).join(' ').trim(),
          code: code || 'SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
