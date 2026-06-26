import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Tier hierarchy for route gating
const TIER_RANK: Record<string, number> = {
  free: 0,
  family: 1,
  educator: 2,
};

// Routes that require a minimum subscription tier
const GATED_ROUTES: { prefix: string; requiredTier: string }[] = [
  { prefix: '/educator', requiredTier: 'educator' },
  { prefix: '/planner', requiredTier: 'family' },
  { prefix: '/favourites', requiredTier: 'family' },
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API routes authenticate themselves (their handlers return JSON 401/403 via
  // createApiClient / requireAdmin, or verify a signature/secret for webhooks
  // and cron). The middleware must not redirect them, and must NEVER treat them
  // as blanket-public for page access.
  if (pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  // Admin area: require an authenticated admin (ADMIN_EMAILS allowlist). This
  // was previously public, which let anyone open the admin UI.
  if (pathname.startsWith('/admin')) {
    if (!user || !user.email) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!adminEmails.includes(user.email.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    // Admins bypass the onboarding/tier gating below.
    return supabaseResponse;
  }

  // Public pages that don't require auth
  const publicRoutes = ['/', '/login', '/signup', '/signin', '/auth/callback', '/pricing'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Not authenticated - redirect to login (unless on a public page)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated - check onboarding status and subscription tier
  if (user && !isPublicRoute && pathname !== '/welcome') {
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(onboarding_completed, subscription_tier, subscription_status, trial_ends_at)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { onboarding_completed: boolean; subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null | undefined;

    // New family lands at The Kitchen Table (the conversational onboarding).
    if (!profile?.family_id || !family?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/welcome';
      return NextResponse.redirect(url);
    }

    // Determine effective tier (account for trial expiry)
    let effectiveTier = family.subscription_tier || 'free';
    const status = family.subscription_status || 'active';

    if (status === 'trialing' && family.trial_ends_at) {
      const trialEnd = new Date(family.trial_ends_at);
      if (new Date() > trialEnd) {
        effectiveTier = 'free'; // Trial expired
      }
    } else if (status === 'cancelled' || status === 'past_due') {
      effectiveTier = 'free';
    }

    // Check route-level tier gating
    for (const route of GATED_ROUTES) {
      if (pathname.startsWith(route.prefix)) {
        const userRank = TIER_RANK[effectiveTier] ?? 0;
        const requiredRank = TIER_RANK[route.requiredTier] ?? 0;

        if (userRank < requiredRank) {
          // Redirect to billing/upgrade page
          const url = request.nextUrl.clone();
          url.pathname = '/settings/billing';
          url.searchParams.set('upgrade', route.requiredTier);
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // Authenticated user on login/signup - redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
