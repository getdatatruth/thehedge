# ADR 0001 — Territory architecture: refactor-in-place + hybrid config/code

- **Status:** Proposed (awaiting founder sign-off before large-scale refactoring)
- **Date:** 2026-06-30
- **Context source:** `/docs/multi-territory-brief.md` §0 (delegated decisions), grounded in a full architecture audit of `apps/web`.

This ADR resolves the two decisions the brief delegates to engineering (§0): **refactor vs. parallel build**, and **config-driven vs. code-module per territory.**

---

## Decision 1 — Refactor the existing Ireland code into a territory-aware structure (NOT a parallel build)

### Why

The audit shows the data model is **already partly territory-aware**, and the Irish assumptions are **concentrated, not pervasive**:

- `families.country` (`text`, default `'IE'`), `families.county`, `families.timezone` already exist (`schema.ts:86–96`).
- `activities.countrySpecific text[]` already exists (`schema.ts:258`).
- **`curriculum_outcomes.country` is `notNull` (`schema.ts:330`)** — the curriculum store is already keyed by country. The only blockers are (a) no non-IE seed rows, and (b) three hardcoded `.eq('country','IE')` queries.
- The remaining IE hardcoding lives in a countable set of places: two AI system prompts (`spark.ts:46–77`, `moment.ts:28–42`), the chat route (`chat/route.ts:26`), the report engine (`reports.ts`), the 10 hardcoded learning areas in `personalisation.ts`, `ie-counties.ts`, and `en-IE` locale calls in ~15 files.

A **parallel build** would duplicate the AI engine, the report engine, and personalisation — directly violating the brief's guiding principle that "the marginal cost of adding a territory should approach *edit a config file*." Two engines guarantees two-way drift and double the test surface.

A **refactor-in-place** is low-risk here precisely because the IE data already exists: we introduce a territory-resolution layer and a framework registry, route the existing IE path through it, and migrate existing tags in place. There is one engine, exercised by IE from day one, so any regression is caught by the existing IE experience (which we hold as the parity baseline).

### Consequences

- Introduce a **territory layer** (resolution + framework registry + compliance profiles) that the single AI engine, report engine, personalisation engine, and onboarding all read from.
- Phase 1 re-expresses the IE build through that layer with **zero user-visible regression** (the parity gate).
- Existing Irish activity/log/portfolio tags are **migrated in place** to canonical dimensions (Decision 3) — no data loss, no IE downtime.

---

## Decision 2 — Hybrid: territory differences are **data** by default; only genuinely divergent **behaviour** is code

### The boundary (the rule we apply everywhere)

> **If a non-engineer should be able to change it — copy, a legal figure, an area name, a stage age-range, an LA variation, a roadmap step — it is DATA.**
> **If it is behaviour — how a stage is computed from an age, how a canonical tag projects to a native area, how the AI prompt is assembled — it is generic CODE driven by that data.**

### What is DATA (config, served from the server)

Per-territory **content modules**, versioned in git and served to clients via an API so web + iOS render identically (brief §15) and a territory edit is a file change, not an app release:

- **Framework definitions** — `territoryKey`, `frameworkName` + official body, `stages[]` (key, native name, age range, order), `areas[]` (key, native name, canonical-dimension mapping), `terminology{}`. (The `curriculum_outcomes` table is *already* DB data keyed by `country`; framework metadata sits alongside it.)
- **Compliance profiles** — registration regime, information duties, assessment/evidence expectation, framing/tone, plus a mandatory **`lastReviewed` date** and **`confirmed` vs `expected`** flags on every legal statement (brief §5, §16). Held as code-reviewed config (a PR + a date stamp is *safer* for legal content than runtime-editable DB; we accept a deploy as the cost of review).
- **Terminology / copy maps** and **roadmap steps** (brief §12, §13) — content, per territory, Welsh-language-ready.
- **Report template definitions** (brief §11) — section structure + vocabulary + framing as data so an LA variation is a content edit.

> **Legal-content exception to "no redeploy":** compliance/legal copy is intentionally kept in version-controlled config (reviewed via PR, dated) rather than a runtime-editable store. High-churn, low-risk content (e.g. England LA report variations) may later move to DB; legal framing does not.

### What is CODE (one generic implementation, driven by the data)

- **Age → stage resolution** — generic, reads each framework's `stages[].ageRange`.
- **Canonical ↔ native projection** — generic, reads each framework's `areas[].canonicalMapping`.
- **AI prompt assembly** (`spark.ts`, `moment.ts`, chat) — single engine; the active territory's framework + terminology + (IE-only) regulatory context is injected as structured input. **The engine must never emit Tusla/Aistear vocabulary outside `IE`** (brief §4.3, §12 hard rule).
- **Report generation** — one pipeline; template + vocabulary + framing vary by data.
- **Genuinely divergent logic** — e.g. Scotland's consent-to-withdraw guidance branch — expressed as a small flag/handler keyed off the compliance profile, not a forked module.

---

## Decision 3 — Data model & migration

### Canonical learning dimensions (internal lingua franca, brief §4.1)

Proposed eight (refined during build so every native area maps cleanly):

`literacy_language` · `numeracy_maths` · `science_natural_world` · `arts_creativity` · `physical_wellbeing` · `social_personal_moral` · `technology_digital` · `humanities_environment`

These must absorb (a) the existing 10 `personalisation.ts` `LEARNING_AREAS`, and (b) every territory's native areas (IE NCCA/Aistear, England NC subjects, Scotland's 8 CfE areas, Wales's 6 AoLEs, NI's 7 Areas of Learning). `physical_wellbeing` + `social_personal_moral` are genuinely tracked, not vestigial (brief §14 wellbeing).

### Schema changes (Drizzle, additive — IE unaffected)

- **`children`** gains an **education context**: `territory` (text, defaults to the family's `country` at creation) + `adminArea` (text — England/Wales LA, Scotland council, NI EA region, IE county; nullable). Territory is an attribute of the *child's education context* (brief §3.1), so one account can model children in different territories; UX is single-territory-per-account at launch (brief §18 working decision).
- **`activities`** and **`portfolio_entries`** gain `canonicalDimensions text[]` alongside the existing `outcomeIds`/`curriculumAreas`, populated by the AI at generation/log time and backfilled by migration.
- **Framework / compliance / roadmap / report-template** content: versioned config served via an API (see Decision 2); `curriculum_outcomes` stays in DB, extended with non-IE rows.
- **`RoadmapState`** (new): per-child territory-journey progress (brief §3.3, §13).

### Migration (no user-visible loss, brief §4.4 / §16)

Backfill `canonicalDimensions` for existing Irish `activities`, `activity_logs`, and `portfolio_entries` by projecting their current IE outcome codes / `curriculum_areas` through the IE framework mapping. Existing Irish families keep every piece of evidence and see no change.

---

## Honesty fixes folded in (gap analysis, brief §16)

Independent, low-risk, done in **Phase 0** ahead of the refactor:

1. **AEARS acronym** standardised to **"Alternative Education Assessment and Registration Service"** everywhere — fix the two wrong expansions at `aears.ts:3–4` ("Assessment of Education in a Place other than a Recognised School") and `chat/route.ts:26` ("…in line with the Rights of the child"). `reports.ts:1649/1802` is already correct.
2. **Attendance / "Hours required" / "Attendance %" report** (`reports.ts:529, 569–570`) — retire the school-framed "required/%" language (it contradicts the no-hours AEARS truth even with the existing caveat). Reframe as an optional, non-judgemental "rhythm overview," and **territory-gate it so it never appears outside `IE`.**
3. No surface anywhere claims Tusla/LA/EA/government **approval** (brief §16).

---

## Alternatives considered

- **Parallel per-territory builds** — rejected: duplicates three engines, guarantees drift, fails the "edit a config" principle.
- **All-DB, runtime-editable territory content** — rejected for legal/compliance copy (review safety); retained as a future option for high-churn non-legal content (LA variations).
- **Territory as an account-level (not child-level) attribute** — rejected: the brief wants cross-border families modellable; child-level is the clean model.

---

## Open items carried to build (brief §18)

- Final canonical dimension membership (refine against all five frameworks).
- England/Wales LA-variation content pipeline.
- Welsh-language localisation depth at launch (data-model ready; full UI phased).
- Re-verify CNIS commencement status + confirmed fields against primary sources before ENG/WAL launch.
