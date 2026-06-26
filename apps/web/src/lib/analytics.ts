import { PostHog } from 'posthog-node';

// Server-side analytics helper for the key funnel events.
// Reads POSTHOG_KEY (server) and POSTHOG_HOST, defaulting to the EU region.
// When no key is set it is a complete no-op, so dev and CI never break.

const posthogKey = process.env.POSTHOG_KEY;
const posthogHost = process.env.POSTHOG_HOST || 'https://eu.i.posthog.com';

// Funnel event names. Keep these stable so dashboards stay consistent.
export const AnalyticsEvent = {
  SIGNED_UP: 'signed_up',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ACTIVITY_LOGGED: 'activity_logged',
  TRIAL_STARTED: 'trial_started',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  PAYWALL_VIEWED: 'paywall_viewed',
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!posthogKey) return null;
  if (!client) {
    client = new PostHog(posthogKey, {
      host: posthogHost,
      // Send immediately; serverless functions are short-lived.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

/**
 * Capture a server-side event. No-ops gracefully when POSTHOG_KEY is unset.
 * Never throws: analytics must not break a request.
 */
export async function capture(
  event: AnalyticsEventName,
  distinctId: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const ph = getClient();
  if (!ph || !distinctId) return;

  try {
    ph.capture({ distinctId, event, properties });
    // Ensure the event leaves the function before it freezes or exits.
    await ph.flush();
  } catch (err) {
    console.error('Analytics capture failed:', err);
  }
}
