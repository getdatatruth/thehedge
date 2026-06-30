# Multi-Territory — Task Breakdown & Sequence

Companion to `/docs/multi-territory-brief.md` and `/docs/adr/0001-territory-architecture.md`.
Sequence mirrors brief §17. Gap-analysis fixes are woven in (marked **[gap]**). Each phase has a clear exit gate. **Ireland parity is the non-negotiable gate on every phase.**

---

## Phase 0 — Honesty quick-fixes (independent, low-risk, no refactor)

- [ ] **[gap]** Standardise AEARS → "Alternative Education Assessment and Registration Service": fix `aears.ts:3–4`, `chat/route.ts:26`. Verify `reports.ts:1649/1802` matches.
- [ ] **[gap]** Retire "Hours required / Attendance %" framing in `reports.ts` (`:529`, `:569–570`); reframe as optional non-judgemental "rhythm overview"; territory-gate to `IE` only.
- [ ] **[gap]** Audit for any "Tusla-approved / endorsed" implication; remove. Add the standing "prepare for, not approved by" line where assessment value is shown.
- **Exit gate:** IE app unchanged in behaviour except corrected copy; build + lint green.

## Phase 1 — Territory layer + IE parity + canonical alignment

- [ ] Add `children.territory` (defaults to `families.country`) + `children.adminArea` (Drizzle migration, additive).
- [ ] Add `activities.canonicalDimensions text[]` + `portfolio_entries.canonicalDimensions text[]`.
- [ ] Define the **canonical dimension** set + the **IE framework definition** (areas, stages w/ age-ranges, native terminology, canonical mapping) as served config.
- [ ] Build the generic **territory resolution** + **canonical↔native projection** + **age→stage** code (driven by framework data).
- [ ] Route the existing IE Spark/Moment/report/personalisation paths through the territory layer (replace the 3 `.eq('country','IE')` with `territory`-resolved queries: `spark.ts:126`, `moment.ts:55`, `portfolio page:82`).
- [ ] **Migration:** backfill `canonicalDimensions` for existing IE activities/logs/portfolio from current outcome codes/areas.
- [ ] **[gap]** Make `personalisation.ts` balance detection territory-parameterised (areas from the active framework, not the 10 hardcoded constants); keep the `COLD_START_LOGS=10` guard.
- **Exit gate:** IE experience byte-for-byte equivalent to today (manual + automated parity checks); existing evidence intact; engine now territory-parameterised though UI is still IE-only.

## Phase 2 — England (the major build)

- [ ] England **framework** (NC subjects → canonical; EYFS/KS1/KS2 stages w/ age-ranges; native terminology) as config.
- [ ] England **compliance profile** — CNIS register, info duties (15-day), suitability test, the 10-day notice — every legal line `lastReviewed`-dated and flagged `confirmed`/`expected`. **Toned-down framing** (brief §7); no Tusla/Aistear vocabulary; reassurance-as-optional-safety-net.
- [ ] **England curriculum_outcomes** seed (NC programmes of study, paraphrased; own codes; honest, not "official").
- [ ] **LA sub-territory** + complete searchable English-LA selector; store family LA.
- [ ] **Evidence-pack** report template (base pack + LA-variation hook) in NC vocabulary, framed "evidence of a suitable education."
- [ ] **Register-readiness roadmap** (content-driven), "rules may change" affordance tied to the dated profile.
- [ ] **[gap — reassurance surface]** Ship the calm "you're doing fine — here's one gentle next step" surface, in the active territory's vocabulary, reframed from any score. (Built once, territory-aware; lands first for IE+ENG.)
- **Exit gate:** an English family onboards → LA captured → register-readiness roadmap → generates an evidence pack; zero Irish vocabulary anywhere in the ENG path (automated check).

## Phase 3 — Report engine generalisation

- [ ] Generalise `reports.ts` to data-driven **template definitions** (IE assessment report + ENG evidence pack both expressed as templates; shared generation, varied vocabulary/framing). Dated "what this is / is not" statement on every template.
- **Exit gate:** IE + ENG reports both produced from the template engine; IE output unchanged from Phase 0.

## Phase 4 — Scotland & Northern Ireland (value-add configs)

- [ ] SCO framework (CfE: 8 areas, Early/First/Second, literacy/numeracy/HWB cross-cutting) + value-add compliance profile (no register; consent-to-withdraw guidance as a roadmap flag) + portfolio report template.
- [ ] NIR framework (CCEA: 7 Areas of Learning, Foundation/KS1/KS2, TS&PC cross-cutting) + value-add profile + portfolio report template.
- [ ] SCO/NIR confidence-&-breadth roadmaps.
- **Exit gate:** SCO + NIR onboard end-to-end as value-add; no compliance pressure, no Irish vocabulary.

## Phase 5 — Wales (Welsh-language-ready, separate timeline)

- [ ] WAL framework (6 AoLEs, progression steps ages 5/8/11/14/16, literacy/numeracy/digital cross-cutting) with **Welsh-language-ready terminology** in the data model.
- [ ] WAL **separate compliance profile** (same Act, Welsh-Government timeline/specifics; dated/flagged).
- [ ] WAL evidence-pack template in AoLE/progression-step vocabulary, Welsh-rendering-ready.
- **Exit gate:** WAL onboards as soft-compliance on its own timeline; terminology layer proven bilingual-ready.

## Phase 6 — Onboarding polish, terminology audit, wellbeing pass, tests

- [ ] Onboarding flow: residence → place-of-education → sub-territory drill → territory roadmap (brief §13).
- [ ] **Terminology audit** — automated test asserting Tusla/Aistear/AEARS strings appear **only** in `IE` output (UI, AI, reports).
- [ ] **[gap — wellbeing/Hedge Score]** Replace the mobile 0–1000 Hedge Score + tiers with the private, non-comparative **balance reflection** in the active territory's areas (founder decision 2026-06-30). Neurodivergent-aware copy pass (low-demand, nothing timed/scored/gamified).
- [ ] Cross-territory test matrix (brief §16): territory resolution, age→stage per territory, canonical↔native projection, report-per-template, copy correctness, roadmap branching, IE-parity regression.
- **Exit gate:** full five-territory matrix green; IE parity intact; wellbeing pass shipped on web + mobile.

---

## Deferred (founder decision 2026-06-30 — revisit after IE/ENG ship)

- Community-seeding / local-meetup discovery (gap analysis).
- UK exam-centre-access wedge for private candidates (gap analysis).

## Standing constraints (every phase)

- No claim of official endorsement anywhere (brief §16).
- Legal content dated + `confirmed`/`expected`-flagged; re-verify CNIS specifics against primary sources before ENG/WAL go live.
- IE never regresses; existing evidence preserved.
- Territory layer server-side so web + iOS share it (brief §15).
- Wellbeing/no-pressure character carried through prompts, copy, nudges (brief §14).
