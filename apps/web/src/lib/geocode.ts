// ─── Geocoding for non-Ireland territories ──────────────────────────────────
// Ireland uses an instant county-centroid table (ie-counties.ts). Other
// territories' administrative areas (England/Wales local authorities, Scotland
// councils, NI regions) are geocoded via OpenStreetMap's Nominatim, which - unlike
// a place-name geocoder - resolves administrative-area names that are not also
// town names (e.g. Cornwall, Westmorland and Furness, North Yorkshire). The
// weather provider (api.open-meteo.com) then takes the resulting lat/lng.
// Fail-soft: returns null on any error so weather just falls back to a default
// and onboarding is never blocked. Returns { lat, lng } to match coordsForCounty.
//
// Note: this calls public Nominatim, which is fine at onboarding volume (one
// lookup per signup) under its usage policy (<=1 req/s, identifying User-Agent).
// If UK signups scale heavily, move to a paid geocoder or self-hosted Nominatim.

import type { TerritoryKey } from '@/lib/territory';

const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TheHedge/1.0 (+https://thehedge.ie; hello@thehedge.ie)';

export async function geocodeArea(
  name: string | null | undefined,
  countryCode: string,
): Promise<{ lat: number; lng: number } | null> {
  const q = (name || '').trim();
  if (!q) return null;
  try {
    const url = new URL(GEOCODE_URL);
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    if (countryCode) url.searchParams.set('countrycodes', countryCode.toLowerCase());

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    // Cache a day: an area's coordinates do not move.
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const first = Array.isArray(data) ? data[0] : null;
    if (first?.lat && first?.lon) {
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

// The ISO country code to constrain geocoding for a territory, and the IANA
// timezone its families live in (drives the notification rhythm).
export function geocodeCountryFor(territory: TerritoryKey): string {
  return territory === 'IE' ? 'IE' : 'GB';
}

export function timezoneFor(territory: TerritoryKey): string {
  return territory === 'IE' ? 'Europe/Dublin' : 'Europe/London';
}
