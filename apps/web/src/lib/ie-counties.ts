// Approximate county centroids so weather works from day one without asking a
// family to fiddle with a map. Keyed on lowercased county name (tolerant of a
// leading "county"/"co " and "co.").
const COUNTY_COORDS: Record<string, [number, number]> = {
  antrim: [54.72, -6.21], armagh: [54.35, -6.65], carlow: [52.72, -6.84],
  cavan: [53.99, -7.36], clare: [52.91, -9.0], cork: [51.9, -8.47],
  derry: [54.99, -6.95], londonderry: [54.99, -6.95], donegal: [54.92, -8.0],
  down: [54.33, -5.95], dublin: [53.35, -6.26], fermanagh: [54.35, -7.63],
  galway: [53.27, -9.05], kerry: [52.15, -9.57], kildare: [53.16, -6.91],
  kilkenny: [52.65, -7.25], laois: [53.0, -7.33], leitrim: [54.12, -8.0],
  limerick: [52.66, -8.62], longford: [53.73, -7.79], louth: [53.92, -6.49],
  mayo: [53.85, -9.3], meath: [53.65, -6.68], monaghan: [54.25, -6.97],
  offaly: [53.24, -7.71], roscommon: [53.76, -8.27], sligo: [54.27, -8.47],
  tipperary: [52.67, -7.84], tyrone: [54.6, -7.31], waterford: [52.26, -7.11],
  westmeath: [53.53, -7.34], wexford: [52.34, -6.46], wicklow: [52.98, -6.37],
};

export function coordsForCounty(county?: string | null): { lat: number; lng: number } | null {
  if (!county) return null;
  const key = county.toLowerCase().replace(/^(county|co\.?)\s+/, '').trim();
  const hit = COUNTY_COORDS[key];
  return hit ? { lat: hit[0], lng: hit[1] } : null;
}
