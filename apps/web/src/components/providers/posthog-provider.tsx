'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

// Initialise once, on the client, only when a key is present.
// This keeps dev and CI builds working with no analytics configured.
if (typeof window !== 'undefined' && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Only create person profiles for identified users (GDPR friendly).
    person_profiles: 'identified_only',
    // We capture pageviews ourselves on route change (see PageViewTracker)
    // because the App Router does not trigger full page loads.
    capture_pageview: false,
    // Conservative for a children's-data product: no automatic capture of
    // clicks or form inputs, so we never record sensitive field contents.
    autocapture: false,
    capture_pageleave: true,
  });
}

// Tracks App Router navigations and sends a $pageview on each route change.
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogKey || !posthog.__loaded) return;
    let url = window.origin + pathname;
    const search = searchParams?.toString();
    if (search) {
      url = url + '?' + search;
    }
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // No key configured: render children untouched, init nothing.
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
