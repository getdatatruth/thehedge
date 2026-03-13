import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession } from '@/lib/stripe';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Get user's family with Stripe customer ID
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(stripe_customer_id)')
      .eq('id', user.id)
      .single();

    const family = Array.isArray(profile?.families)
      ? profile.families[0]
      : profile?.families;

    if (!family?.stripe_customer_id) {
      return apiError('No billing account found. Please subscribe first.', 400);
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const returnUrl = `${origin}/settings/billing`;

    const session = await createPortalSession(family.stripe_customer_id, returnUrl);

    return apiSuccess({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return apiError('Failed to create portal session', 500);
  }
}
