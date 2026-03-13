import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAccountDeletedEmail } from '@/lib/email';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require confirmation token in body
    const body = await request.json();
    const { confirmationText } = body;

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, name, email, families(name, stripe_customer_id)')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }

    const family = Array.isArray(profile.families)
      ? profile.families[0]
      : profile.families;
    const familyName = family?.name || 'your family';
    const userEmail = profile.email || user.email || '';

    const adminSupabase = createAdminClient();

    // Cancel Stripe subscription if it exists
    if (family?.stripe_customer_id) {
      try {
        const { getStripe } = await import('@/lib/stripe');
        const stripeClient = getStripe();
        const subscriptions = await stripeClient.subscriptions.list({
          customer: family.stripe_customer_id,
          status: 'active',
        });
        for (const sub of subscriptions.data) {
          await stripeClient.subscriptions.cancel(sub.id);
        }
      } catch (err) {
        console.error('Failed to cancel Stripe subscription:', err);
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete family (cascades to children, activity_logs, education_plans,
    // daily_plans, portfolio_entries, community_memberships, community_posts)
    const { error: deleteError } = await adminSupabase
      .from('families')
      .delete()
      .eq('id', profile.family_id);

    if (deleteError) {
      console.error('Failed to delete family:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account data' },
        { status: 500 }
      );
    }

    // Delete the user record
    await adminSupabase.from('users').delete().eq('id', user.id);

    // Delete the Supabase auth user
    const { error: authDeleteError } =
      await adminSupabase.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError);
      // Data is already deleted, so we log but don't fail
    }

    // Send confirmation email
    try {
      await sendAccountDeletedEmail(userEmail, familyName);
    } catch (err) {
      console.error('Failed to send account deletion email:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GDPR delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
