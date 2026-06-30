-- Multi-territory foundation: a child's education context + territory-neutral
-- curriculum alignment. Additive and Ireland-safe: every existing child defaults
-- to IE, and canonical_dimensions are backfilled separately by
-- scripts/backfill-canonical-dimensions.ts. No RLS change (columns inherit the
-- existing table policies). See docs/multi-territory-brief.md and
-- docs/adr/0001-territory-architecture.md.

-- Child education context: territory (regulatory + curricular regime) and the
-- administrative sub-territory (England/Wales LA, Scotland council, NI EA
-- region, IE county). Territory is on the child, not the account, so one family
-- could in principle span territories (brief §3.1).
alter table public.children
  add column if not exists territory text not null default 'IE',
  add column if not exists admin_area text;

-- Seed each child's territory from the family's country (all 'IE' today).
update public.children c
  set territory = coalesce(f.country, 'IE')
  from public.families f
  where c.family_id = f.id
    and c.territory = 'IE';

-- Canonical learning dimensions (brief §4): one tagging that projects into any
-- territory's native areas. Nullable; backfilled from existing IE tags.
alter table public.activities
  add column if not exists canonical_dimensions text[];

alter table public.portfolio_entries
  add column if not exists canonical_dimensions text[];
