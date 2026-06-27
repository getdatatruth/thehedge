-- Spark: on-demand, family-private, curriculum-grounded bespoke activities.
-- The public library keeps family_id null; a sparked activity carries the
-- family + child it was generated for, and the parent's own words.
alter table public.activities
  add column if not exists family_id uuid references public.families(id) on delete cascade,
  add column if not exists child_id uuid references public.children(id) on delete set null,
  add column if not exists source_prompt text;

create index if not exists activities_family_id_idx on public.activities(family_id);

-- Tighten read access. Previously every authenticated user could read every
-- activity (using (true)). Now the public library (family_id null) stays open to
-- all, but a bespoke activity is visible only to the family that sparked it.
-- Inserts/updates of bespoke rows are done by the service-role client, which
-- bypasses RLS, so no write policy is needed here.
drop policy if exists act_select on public.activities;
create policy act_select on public.activities
  for select to authenticated using (
    family_id is null or family_id = public.current_family_id()
  );
