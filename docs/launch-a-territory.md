# Runbook: launching a territory

All five frameworks (IE, ENG, SCO, WAL, NIR) are built, seeded, and
isolation-verified, but gated behind `LIVE_TERRITORIES` until reviewed. This is
the checklist to switch one on. Ireland is already live.

## Before you flip the switch

1. **Legal / content review (the gate).** Have a knowledgeable person review the
   territory's compliance content in `src/lib/territory/frameworks/<key>.ts`
   (the `compliance` block) and its roadmap in `roadmap.ts`. For **England/Wales**
   this means the CNIS register mechanics and the `expected`-flagged figures (the
   15-day / 10-day windows) — **re-verify against primary sources** (gov.uk,
   the commencement regulations), because they were not yet in force when this
   was written. Update `lastReviewed` and any `status: 'expected'` → `'confirmed'`
   as the rules land.
2. **England only:** confirm the LA list in
   `src/lib/territory/admin-areas/eng.ts` (153 ONS authorities) is current.

## Flip it on

3. **One line:** add the territory key to `LIVE_TERRITORIES` in
   `src/lib/territory/index.ts`, e.g. `['IE', 'ENG']`. This is the entire
   backend switch — the engine, prompts, curriculum data, reports, roadmaps and
   onboarding capture all already resolve by territory.

## Build the onboarding selection step (the one remaining UI piece)

4. The onboarding wizard (`app/(dashboard)/kitchen-table/kitchen-table-client.tsx`)
   is a numeric-step flow. Add a territory-selection step **only rendered when**
   `liveTerritories().length > 1` (so Ireland-only onboarding is unchanged):
   - **Residence → place-of-education → sub-territory** (brief §13). Set
     `answers.territory` (a live key) and `answers.adminArea`.
   - England/Wales: drill to **Local Authority** using
     `searchEnglandLocalAuthorities()` from `admin-areas/eng.ts`.
   - Scotland: council; NI: EA region; Ireland: county (informational).
   - The route already validates `answers.territory` against `isTerritoryLive`
     and stores `territory` + `admin_area` on the family and children, so no
     backend change is needed — only the UI step.
   - Lead with the territory's roadmap (`getRoadmap(territory)`) afterwards.

## Verify

5. Run `npm run check:territory` (must stay green — no vocabulary leaks).
6. Onboard a test family in the new territory and confirm: Spark/Moment use the
   right curriculum and voice (no Tusla/Aistear outside IE), the report renders
   in the territory's framing, and the roadmap matches.

## Notes

- The mobile reassurance card and web reassurance card are already live and
  territory-safe; nothing territory-specific is needed there.
- `npm run check:territory` is the regression guard — keep it in CI.
