# The Hedge — Multi-Territory Build Brief

**Audience:** Claude Code (and any human engineer working alongside it)
**Purpose:** Specify the expansion of The Hedge from a single-territory (Ireland) home-education platform into a multi-territory platform covering Ireland and the four UK nations (England, Scotland, Wales, Northern Ireland), with territory-aware curriculum alignment, compliance tooling, and onboarding.
**Status of this document:** Source of truth for the territory-expansion workstream. Keep it in the repo as persistent context.

> **Locked decisions (founder, 2026-06-30):**
> - **Scope:** This workstream covers territory expansion + the gap-fixes that fold into it (honesty leaks, the reassurance surface, the wellbeing/neurodivergent pass). **Community-seeding and the UK exam-centre-access feature are deferred** until after Ireland + England ship.
> - **Hedge Score:** The mobile 0–1000 score + tiers is **replaced** by a private, non-comparative "balance reflection" expressed in the active territory's own areas (no number to chase). This is the §14 wellbeing resolution.

---

## 0. How to use this brief

This document is intentionally exhaustive on **what** each territory requires (curricula, legal regimes, report formats, terminology) and deliberately **non-prescriptive on the exact code-level "how."** Claude Code has full latitude to choose the cleanest implementation path given the actual state of the repository.

Two decisions are explicitly delegated, to be made after inspecting the codebase:

1. **Refactor vs. parallel build.** Decide whether to refactor the existing Ireland implementation into a territory-aware structure from the outset, or to add the territory abstraction alongside the existing Ireland code and migrate incrementally. Pick whichever yields less risk and a cleaner end state. Document the decision and reasoning in an ADR under `/docs/adr/`.

2. **Config-driven vs. code-module per territory.** Decide whether territory differences are best expressed as data/configuration (loaded at runtime, no redeploy to change), as code modules per territory, or as a hybrid (e.g. config for content and copy; code for genuinely divergent logic). State the chosen approach and its boundaries in the same ADR.

**Before writing code:** produce a short implementation plan (the ADR plus a task breakdown) and surface it for review. Do not begin large-scale refactoring until the plan is confirmed.

**Guiding principle:** the marginal cost of adding or amending a territory should approach "edit a config / content file," not "rewrite a feature." Whatever architecture is chosen should make that true.

---

## 1. Product context (what The Hedge is)

The Hedge is a B2C subscription app for families who home-educate their children. It is rooted in the heritage of the Irish *hedge schools* (18th-century open-air, outside-the-system education), but the brand is deliberately modern and premium — closer to Linear, Notion, Headspace, or Duolingo than to a craft/heritage or children's-app aesthetic.

**Core value proposition:** The Hedge is the "MyFitnessPal for home education." A parent logs a real-world activity once; the platform organises it, aligns it to the relevant curriculum behind the scenes, keeps a running timeline, and can generate an assessment-ready report on demand. An AI engine learns whether a child's learning is balanced across areas and suggests activities that fill the gaps.

**Existing, shipped functionality (Ireland):**
- Authentication, family/child profiles, onboarding, dashboard.
- Activity engine with AI-generated, curriculum-aligned activities.
- **Spark:** a chat-style feature where a parent says what their child is interested in *right now* and instantly receives an at-home activity aligned to the curriculum.
- Automatic activity logging, timeline, and weather-aware suggestions.
- A Tusla-shaped annual assessment report generator.
- Web platform (Next.js) live; iOS app (Swift/SwiftUI / Expo) in TestFlight.
- Payments / tier-gating via Stripe (in final integration).

**The mission dimension:** the founder is relocating to rural Ireland to home-educate three young children. Children's wellbeing and mental health are first-class product concerns, not afterthoughts. Any territory work should preserve the "gentle, supportive, non-pressuring" product character (e.g. avoid manipulative streak/pressure mechanics; treat wellbeing as a real surface).

---

## 2. The market opportunity (why multi-territory, why now)

**Ireland (beachhead).** Home education is growing quickly. The Tusla register stood at roughly 2,610 children in Q3 2025, with new applications up about 50% year-on-year. A registration backlog means the true figure is higher. Ireland is where The Hedge wins first: revenue on, proof of concept, product–market fit.

**United Kingdom (expansion).** Far larger. England alone recorded roughly 126,000 children in elective home education on a single census day in autumn 2025, and around 175,900 at some point during the 2024/25 year — on the order of 1.5% of school-age children. Scotland, Wales and Northern Ireland add further to this.

**The regulatory catalyst.** The **Children's Wellbeing and Schools Act 2026** received Royal Assent on 29 April 2026. It introduces statutory "Children Not in School" registers, administered by local authorities, across **England and Wales**. Once the home-education provisions commence (expected around 2027, with realistic slippage later), registered families will have to provide specified information to their local authority within strict time limits or risk enforcement. The home-education sections are **not yet in force** — this is the runway during which The Hedge can become the tool families reach for when the registers switch on.

**Strategic implication for the build:** Ireland and England/Wales trend toward a *compliance must-have* (evidence of suitable education). Scotland and Northern Ireland are, for now, a *value-add* (no mandatory registration regime of the same kind). The product must be able to present itself differently by territory: lead with compliance reassurance where a register looms; lead with confidence, structure and wellbeing where it does not. **In the UK specifically, tone down the "Tusla-style / assessment-compliance" framing** — Tusla is an Irish agency and has no remit there, and a vocal segment of the UK home-ed community is hostile to anything that smells like imposed curriculum compliance.

---

## 3. Core domain model (territory-aware)

The central new concept is a **Territory** (jurisdiction / nation). Everything that currently hard-codes Irish assumptions (curriculum tags, the assessment report, onboarding copy, legal framing, terminology) must become a function of the family's selected territory.

> Field/table names and types below are **illustrative**. Adapt to repo conventions (Drizzle ORM + Supabase/PostgreSQL with RLS). Intent matters more than literal schema.

### 3.1 Territory

| Territory key | Name | Curriculum regime | Legal/registration regime | Default framing |
|---|---|---|---|---|
| `IE` | Ireland | Aistear + Primary Curriculum / Primary Curriculum Framework | Tusla register; statutory assessment of "certain minimum education" | Compliance must-have |
| `ENG` | England | National Curriculum (non-statutory for EHE) | Children Not in School register (Act 2026; pending commencement); LA oversight | Compliance-reassurance (soft) |
| `SCO` | Scotland | Curriculum for Excellence | Consent-to-withdraw in some cases; no CNIS-style national register | Value-add / confidence |
| `WAL` | Wales | Curriculum for Wales (2022) | Act 2026 extends to Wales; timing/implementation set by Welsh Government | Compliance-reassurance (soft, later) |
| `NIR` | Northern Ireland | NI Curriculum (CCEA) | Education Authority oversight; no CNIS-style register | Value-add / confidence |

**Territory is selected during onboarding and is mutable.** Treat the territory as an attribute of the *child's education context*, not immutably of the account, so one account can in principle contain children in different territories (rare, but a clean model avoids future pain — e.g. a cross-border Ireland/NI family).

### 3.2 Sub-territory (administrative area)

- `IE`: national (Tusla is a single national agency). Sub-territory is informational (county).
- `ENG`: **Local Authority (LA)** — ~150, each administers its own slice of the register and sets its own expectations/report preferences. Key sub-territory.
- `WAL`: **Local Authority** (22 principal areas).
- `SCO`: **Local Authority** (32 councils) — relevant mainly for consent-to-withdraw.
- `NIR`: **Education Authority** — single body with regional offices; informational.

Onboarding: **select country of residence → select where you are home-educating → roadmap specific to that regime,** drilling nation → local authority where relevant. See §13.

### 3.3 Other entities (extend, don't duplicate)

- **Family / Account**
- **Child** — gains an `educationContext` (territory + sub-territory + age/stage → curriculum level).
- **Activity** — gains **territory-aware curriculum alignment** (canonical tags projectable to any territory). See §4.
- **LogEntry / TimelineItem** — ensure stored curriculum tags resolve through the territory-aware alignment layer.
- **Report** — becomes a **territory-specific document template**. See §11.
- **RoadmapState** — new: tracks the family's territory-specific onboarding/compliance journey.

---

## 4. The curriculum alignment layer (the heart of the system)

A layer that aligns any activity to **any** territory's framework, so the same activity surfaces as evidence against Aistear (IE), the National Curriculum (ENG), CfE (SCO), etc.; the AI reasons in the *active territory's* framework/language; and adding a territory means adding a **framework definition**, not rewriting the engine.

### 4.1 Recommended shape: canonical taxonomy + per-territory mappings

1. **Canonical learning dimensions** — small, stable internal set of broad domains The Hedge owns (e.g. *literacy & language; numeracy & mathematical thinking; scientific & natural world; arts & creativity; physical & wellbeing; social, personal & moral; technology & digital; humanities & environment*). Internal lingua franca; broad enough that every territory's areas map on.

2. **Territory frameworks** — each defines its **areas** and **levels/stages** and a mapping from areas to canonical dimensions. An activity is tagged once against canonical dimensions, then *projected* into any territory's areas. Store the territory-native tag too where finer-grained (e.g. a named Welsh AoLE).

### 4.2 Framework definition (data)

Expressible as data, editable without redeploy where possible:
- `territoryKey`
- `frameworkName` + official body
- `stages[]` — key, display name, age range, ordering (England KS1/KS2; Scotland Early/First/Second; Wales progression steps; NI Foundation/KS1/KS2; Ireland infant/junior/senior)
- `areas[]` — key, native display name, optional description, mapping to canonical dimension(s)
- `terminology{}` — words this territory uses for "curriculum/assessment/report/areas/stages" (drives UI copy — §12)
- `complianceProfile` — §5

### 4.3 AI engine requirements

- **Activity generation & Spark** parameterised by territory: prompt/context includes the active territory's framework so output uses the right language and maps to the right areas. For ENG/SCO/WAL/NIR the engine must **not** reference Tusla, Aistear, or Irish assessment concepts.
- **Balance detection** computes "is this child's learning balanced?" against the *active territory's* areas and surfaces gaps in that vocabulary.
- Single engine; vary inputs by territory. No per-territory forks.
- Territory context is additional structured input, not a relaxation of any safety guardrail.

### 4.4 Migration of existing Irish data

Existing Irish-tagged activities/log entries must be back-mapped to canonical dimensions so they remain valid evidence. Provide a migration inferring canonical dimensions from Irish tags via the IE mapping. No user-visible data loss.

---

## 5. Compliance profiles (how territories differ legally)

Each territory carries a **compliance profile** driving onboarding, roadmap, report/evidence output, and framing/tone, across four dimensions: **registration regime**, **information duties**, **assessment/evidence expectation**, **framing/tone**.

**Treat all legal specifics as content reviewed by a knowledgeable human before launch in that territory.** Build a visible "last reviewed" date into each territory's compliance content. Never present legal certainty not held; prefer "here's what the law currently requires / is expected to require" with sourcing.

---

## 6. Territory: Ireland (`IE`) — the beachhead

**Curriculum regime.** Aistear (birth–6) + the Primary Curriculum / Primary Curriculum Framework. Areas: language; mathematics; SESE; arts education; physical education; SPHE; (where relevant) religious/ethics. Aistear themes (Well-being; Identity and Belonging; Communicating; Exploring and Thinking) for the youngest.

**Stages.** Map to primary structure (junior/senior infants → sixth class) + Aistear early-years band. Store age ranges so a child's age resolves to a stage.

**Registration & legal.** Statutory register of children educated outside recognised schools, administered by Tusla. Families provide a **"certain minimum education"**; an assessment process applies. Existing Tusla-shaped report supports this.

**Assessment/evidence.** Parents demonstrate breadth and suitability. **Tusla does not approve or endorse third-party software.** The Hedge must **never claim Tusla approval/endorsement.** De-risk by validating output with experienced home-educators, engaging INHSA, seeking informal assessor feedback — not formal approval. Copy: "designed to help you prepare for assessment," never "Tusla-approved."

**Framing/tone.** Compliance is a real must-have; foreground the assessment/report value — warmly, in the Hedge voice, without overclaiming official status.

**Report/output.** Existing annual assessment report, re-expressed as the `IE` template via the territory-aware engine (§11). Never labelled "Tusla-approved."

---

## 7. Territory: England (`ENG`) — the big prize

**Curriculum regime.** National Curriculum by **Key Stages**: EYFS (0–5), KS1 (Yrs 1–2, ages 5–7), KS2 (Yrs 3–6, ages 7–11), with subjects/programmes of study modelled as areas → canonical dimensions.

**Critical product point.** EHE families in England are **not legally required to follow the National Curriculum** or replicate school. The legal test is education **"suitable" and "efficient"** for the child's age, ability, aptitude and any SEN. Curriculum alignment is a **reassurance/evidence layer** ("proof of breadth and progress, in your own words"), **not** a compliance mandate. Do not present the NC as something the family *must* satisfy.

**Registration & legal.** The Act introduces **Children Not in School (CNIS) registers** administered by LAs. Encode as *expected* requirements pending commencement/regulations:
- Provide specified information to the LA, with updates within a strict window (figure discussed: **within 15 days** of becoming eligible and of relevant changes), or risk a school attendance order.
- Information expected: child's/parents' details, who provides the education and for how much time, other providers, education without parental involvement.
- Registers may capture additional demographic/SEN/welfare info; exact fields await regulations.
- Where the LA judges information incomplete, it can issue a notice (figure discussed: **10-day** notice) to satisfy it the child receives suitable education.

**Build to flex.** Regulations not finalised: the England compliance profile must be **versioned and clearly dated**, easy to update, never asserting unconfirmed detail as settled. Provide update hooks and proactive messaging ("the rules are changing — here's what's confirmed").

**Assessment/evidence.** No national assessment body, no single national report format. LAs vary enormously. Output is an **LA-flexible "suitability evidence pack"** — a base pack plus optional LA-specific variations (§11). Help the family (a) hold the information the LA can require within the 15-day window, and (b) quickly produce an evidence pack to answer a suitability enquiry/notice.

**Framing/tone — tone down the compliance edge.** Do **not** lead with "get compliant"; never use Tusla/Aistear vocabulary. Lead with *we know it's hard; here's something that makes it easier* — register/evidence capability as a quiet, optional safety net the parent controls. Respect community wariness of the register and of curriculum imposition.

**Sub-territory.** Local Authority (~150). Capture the family's LA; allow LA-specific report variations and (later) guidance. Provide a complete, maintainable English LA list.

---

## 8. Territory: Scotland (`SCO`) — value-add

**Curriculum regime.** Curriculum for Excellence (CfE). Levels: **Early** (pre-school–P1), **First** (to end P4), **Second** (to end P7), then Third/Fourth and Senior Phase. Eight areas: **expressive arts; health and wellbeing; languages; mathematics; religious and moral education; sciences; social studies; technologies.** Literacy, numeracy and health-and-wellbeing are "responsibility of all" — model as cross-cutting.

**Why CfE fits natively.** CfE is built around achievement evidenced by professional judgement across a wide range of evidence — a **portfolio-of-evidence** model mirroring what The Hedge produces. Excellent value-add fit.

**Registration & legal.** **Outside** the Act's register provisions. **No CNIS-style register.** Practical difference: where a child is *already enrolled in* a (non-independent) school, a parent generally needs **LA consent to withdraw**; withdrawing a child not enrolled (or from an independent school) does not. Encode as roadmap guidance, not a blocking gate.

**Assessment/evidence.** No mandatory external assessment of the Tusla kind. Evidence/portfolio is for family confidence and voluntary council engagement.

**Framing/tone.** Pure value-add: confidence, structure, breadth, wellbeing. No Tusla/Aistear language, no compliance pressure. Emphasise CfE's evidence-of-progress alignment with how The Hedge works.

**Sub-territory.** Local authority (32). Capture; don't gate.

---

## 9. Territory: Wales (`WAL`) — compliance, on a Welsh timeline

**Curriculum regime.** Curriculum for Wales (2022). **Six Areas of Learning and Experience (AoLEs):** Expressive Arts; Health and Well-being; Humanities (incl. RE/RVE); Languages, Literacy and Communication (incl. Welsh); Mathematics and Numeracy; Science and Technology. **Progression** against reference points at ages 5, 8, 11, 14, 16 (progression steps). Three cross-curricular skills: **literacy, numeracy and digital competence.** Model AoLEs as areas, progression steps as stages, cross-curricular skills as cross-cutting.

**Welsh language.** Integral. Build with **bilingual capability in mind**: allow Welsh display names/terminology for the Welsh framework; design copy so a Welsh-language UI is a later content addition, not a re-architecture. Full localisation can phase.

**Registration & legal.** Wales **is** covered by the Act, but **timing/detail are set by the Welsh Government** and differ from England's. Treat Wales as a **separate compliance profile** — same Act, different commencement/specifics. Version and date; avoid asserting unconfirmed detail.

**Assessment/evidence.** Expected to move toward register-based information duties similar in spirit to England's, administered by Welsh LAs (22). Output is, like England, an **LA-flexible evidence pack** — in Welsh-curriculum vocabulary (AoLEs, progression steps).

**Framing/tone.** Soft compliance-reassurance, on the Welsh timeline. No Tusla/Aistear language; Welsh-curriculum terminology. Ready to flip toward "register-readiness" as commencement approaches.

**Sub-territory.** Local Authority (22). Capture; LA-specific variations later.

---

## 10. Territory: Northern Ireland (`NIR`) — value-add

**Curriculum regime.** NI Curriculum (CCEA). Primary: **Foundation Stage** (Yrs 1–2), **KS1** (Yrs 3–4), **KS2** (Yrs 5–7). **Areas of Learning:** Language and Literacy; Mathematics and Numeracy; The Arts; The World Around Us; Personal Development and Mutual Understanding; Physical Education; Religious Education. Underpinned by **Thinking Skills and Personal Capabilities.** Model Areas of Learning as areas, Foundation/KS1/KS2 as stages, TS&PC as cross-cutting.

**Registration & legal.** **Outside** the Act. Oversight sits with the **Education Authority (EA)** (single body, regional offices). **No CNIS-style register.**

**Assessment/evidence.** No Tusla-style mandatory assessment. Evidence/portfolio is for family confidence and voluntary EA engagement.

**Framing/tone.** Value-add: confidence, structure, breadth, wellbeing, in CCEA vocabulary. No Tusla/Aistear language; no compliance pressure.

**Sub-territory.** EA region — informational. Capture; don't gate.

---

## 11. The report / evidence engine (territory-specific output)

Replace the single hard-coded Tusla report with a **territory-aware document engine.**

- A report is generated from a **territory-specific template** selected by the child's education context.
- Templates pull from the same logged activities + canonical alignment but **render in the territory's native vocabulary** and the **format that regime expects.**
- **Ireland:** existing annual assessment report as the `IE` template. Never "Tusla-approved."
- **England & Wales:** an **LA-flexible "evidence pack"** — base pack (child, period, breadth across areas, progress narrative, sample activities as evidence) + optional **LA-specific variations.** Framed as "evidence of a suitable education," not a mandated return. Welsh packs use AoLE/progression-step vocabulary (Welsh-language-ready).
- **Scotland & NI:** a **confidence/portfolio report** in CfE / CCEA vocabulary — breadth, progress narrative, evidence — framed as a family-owned record.
- Formats: clean PDF minimum; consider a shareable view. Shared generation logic; vary template + vocabulary + framing by territory.
- Every template carries a clear, dated statement of what it is and is not (no overclaiming official status; no implied approval by Tusla, an LA, the EA, or any government body).

Data-driven template definitions preferred (a non-engineer can adjust copy; an LA variation is a content edit). Generalise the existing IE report's logic; don't copy it four times.

---

## 12. Terminology & copy localisation

- Drive **all curriculum/compliance-facing UI copy** from the active territory's framework + compliance profile. No territory-specific strings hard-coded in components.
- Terms that vary: stage/level name (Key Stage / Level / Progression Step / class); areas (subjects / curriculum areas / AoLEs / Areas of Learning); whether to speak of "assessment," "evidence," or neither; whether "register" appears at all.
- **Tone toggles by framing:** compliance territories (IE; ENG/WAL as commencement nears) may surface "evidence/report/prepare for assessment" language (supportively); value-add territories (SCO/NIR; ENG/WAL today) lead with confidence/structure/wellbeing.
- **Hard rule:** Tusla, Aistear and Irish-assessment vocabulary appear **only** in `IE`. Never in any UK territory's UI, AI output, or report.
- Design the copy layer so a future **Welsh-language** (and potentially Irish-language) UI is a content addition, not a rebuild.

---

## 13. Onboarding & roadmap (the family-facing flow)

1. **Where do you live / where are you home-educating?** First choice sets the **territory**. (Allow residence and place-of-education to differ for edge cases.)
2. **Drill to sub-territory where relevant.** England/Wales → LA; Scotland → council; NI → EA region; Ireland → county (informational). Clean searchable selector (~150 English LAs).
3. **Generate a territory-specific roadmap:**
   - **IE:** register awareness, preparing for assessment, building the portfolio, generating the report.
   - **ENG / WAL:** *register-readiness* track (as commencement nears) — what information they'll need and the window; how to assemble an evidence pack; reassurance not alarm. Mark confirmed vs pending.
   - **SCO / NIR:** *confidence & breadth* track — structure, balance across areas, wellbeing; consent-to-withdraw guidance for Scotland where relevant.
4. **Persist roadmap state** (`RoadmapState`) so the family resumes and the dashboard reflects their journey.

**Design principles:** roadmap is **content-driven** per territory (steps as data); lead with **territory-appropriate framing** from step one; surface a **"rules may change" affordance** for ENG/WAL tied to the dated compliance profile.

---

## 14. Wellbeing as a first-class concern

- Avoid pressure/manipulation mechanics (no guilt-inducing streaks, no dark patterns pushing "more activities = better"). **The 0–1000 Hedge Score + tiers is replaced by a private, non-comparative balance reflection** in the active territory's areas. Balance detection encourages *breadth and gentleness*, not maximisation.
- Treat wellbeing as a **surface**, consistent with curricula that foreground it (Aistear's Well-being theme; Scotland's health-and-wellbeing "responsibility of all"; Wales's Health and Well-being AoLE; NI's Personal Development and Mutual Understanding). The canonical "physical & wellbeing" and "social, personal & moral" dimensions are genuinely tracked.
- Keep copy supportive and non-judgemental across all territories, especially in compliance contexts where parents may feel scrutinised.
- **Neurodivergent-aware:** a large and growing share of home-ed is SEND / "school can't" / anxiety-driven. Low-demand, child-led framing; nothing timed, scored, or gamified that raises a threat response.

---

## 15. Cross-platform note (iOS + web)

Web (Next.js/TypeScript) + iOS (Swift/SwiftUI / Expo); Android not yet built. The territory model is **platform-agnostic and lives server-side** (territory config, frameworks, compliance profiles, report templates, roadmap content served to clients):
- Both web and iOS consume the **same** territory definitions/copy from the backend.
- Adding/editing a territory does not require an app-store release.
- De-risks the future cross-platform decision: a server-driven territory layer is reused regardless of native shell.

Treat any client as a thin renderer of server-provided territory content wherever practical.

---

## 16. Quality, safety & correctness requirements

- **No false official endorsement, anywhere.** Never imply approval by Tusla, an LA, the EA, the Welsh Government, or any state body. Copy speaks to *helping families prepare/evidence*, with sourced, dated statements of what the law requires.
- **Legal content is reviewable and dated.** Each compliance profile carries a "last reviewed" date and is structured for easy human review/update — essential while England/Wales commencement moves.
- **Don't assert unconfirmed law as settled.** Pending provisions (CNIS commencement, exact fields, the 15-day/10-day figures) are presented as current expectation with caveats and update hooks.
- **Data protection.** Multi-jurisdiction family/child data; keep the EU data-residency posture and RLS; handle territory/SEN/welfare fields (some sensitive) with care and minimisation. Don't collect register fields not yet needed.
- **Migration safety.** Existing Irish families and logged evidence work unchanged; the IE experience must not regress.
- **Test across territories.** Cover territory resolution from onboarding; age→stage mapping per territory; canonical↔native alignment projection; report generation per template; copy/terminology correctness (and the hard rule that Irish terms never appear in UK territories); roadmap branching.

---

## 17. Suggested delivery sequence (may revise)

1. **Plan & ADRs** — refactor-vs-parallel and config-vs-module decisions; data-model sketch; surface for review.
2. **Territory abstraction + IE parity** — introduce the territory layer; re-express the Irish build through it with zero user-visible regression; migrate existing tags to canonical dimensions.
3. **Curriculum alignment layer** — canonical dimensions + IE framework mapping; territory-parameterise the AI engine (still IE-only in UI).
4. **England** — full framework, versioned/dated compliance profile, LA sub-territory + selector, evidence-pack report template, register-readiness roadmap, toned-down framing. Priority UK market.
5. **Report engine generalisation** — templates as data; IE + ENG live.
6. **Scotland & Northern Ireland** — frameworks, value-add roadmaps, portfolio report templates.
7. **Wales** — framework (Welsh-language-ready terminology), separate compliance profile/timeline, evidence-pack template.
8. **Onboarding polish, terminology audit, cross-territory tests, wellbeing pass.**

Ireland first and unbroken; England as the major build; Scotland/NI as lighter value-add configs; Wales with its Welsh-language and separate-timeline nuances.

---

## 18. Open questions to flag back

- Whether one account should fully support children in *different* territories at launch, or just be modelled for it. **(Working decision: model for it; single-territory-per-account UX at launch.)**
- The canonical dimension set's exact membership (refine against the five frameworks so every native area maps cleanly).
- How LA-specific report variations are sourced and maintained (content pipeline) for England/Wales.
- Depth of Welsh-language localisation at launch vs later. **(Working decision: data-model ready; full localisation phased.)**
- The precise, current CNIS commencement status and confirmed fields at the time England/Wales go live — re-verify against primary sources before launch; do not rely solely on this brief's figures.

---

*End of brief. Keep this document in-repo and update it as territories ship and as the England/Wales regulations are confirmed. Source of truth for the multi-territory workstream.*
