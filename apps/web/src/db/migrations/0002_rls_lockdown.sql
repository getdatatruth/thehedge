-- 0002_rls_lockdown.sql
-- Row-level security: enforce family isolation at the database layer.
--
-- Access model:
--   * User-facing reads/writes use the anon-key Supabase client. They run as
--     the `authenticated` role with auth.uid() available, so RLS applies.
--   * Trusted server routes use the service-role client, which BYPASSES RLS.
--
-- This migration is idempotent (drop-if-exists before each create).

-- Helper: the current user's family_id. SECURITY DEFINER so it bypasses RLS on
-- `users` (avoids recursion) and reads the link regardless of policies.
create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.users where id = auth.uid()
$$;

revoke all on function public.current_family_id() from public;
grant execute on function public.current_family_id() to authenticated, anon, service_role;

-- Name-only projection of families for community author display. `families`
-- itself is private (it holds billing + precise GPS), so the community feed
-- reads display names through this view instead. security_invoker = off means
-- the view runs as its owner and bypasses families RLS, exposing ONLY these
-- three non-sensitive columns.
drop view if exists public.family_public;
create view public.family_public
with (security_invoker = off) as
  select id, name, county from public.families;
grant select on public.family_public to authenticated, anon;

-- =====================================================================
-- PRIVATE family tables: own-family only
-- =====================================================================

-- families: read/update only your own; creation is done server-side via the
-- service-role client (no INSERT policy here, so the user client cannot insert).
alter table public.families enable row level security;
drop policy if exists fam_select on public.families;
drop policy if exists fam_update on public.families;
create policy fam_select on public.families
  for select to authenticated using (id = current_family_id());
create policy fam_update on public.families
  for update to authenticated
  using (id = current_family_id()) with check (id = current_family_id());

-- users: you may read members of your family and manage only your own row.
alter table public.users enable row level security;
drop policy if exists usr_select on public.users;
drop policy if exists usr_insert on public.users;
drop policy if exists usr_update on public.users;
create policy usr_select on public.users
  for select to authenticated
  using (id = auth.uid() or family_id = current_family_id());
create policy usr_insert on public.users
  for insert to authenticated with check (id = auth.uid());
create policy usr_update on public.users
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- children (the audited hole)
alter table public.children enable row level security;
drop policy if exists chl_all on public.children;
create policy chl_all on public.children
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- activity_logs
alter table public.activity_logs enable row level security;
drop policy if exists alog_all on public.activity_logs;
create policy alog_all on public.activity_logs
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- education_plans
alter table public.education_plans enable row level security;
drop policy if exists eplan_all on public.education_plans;
create policy eplan_all on public.education_plans
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- family_frameworks
alter table public.family_frameworks enable row level security;
drop policy if exists ffw_all on public.family_frameworks;
create policy ffw_all on public.family_frameworks
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- daily_plans (no family_id column -> scope through children)
alter table public.daily_plans enable row level security;
drop policy if exists dplan_all on public.daily_plans;
create policy dplan_all on public.daily_plans
  for all to authenticated
  using (child_id in (select id from public.children where family_id = current_family_id()))
  with check (child_id in (select id from public.children where family_id = current_family_id()));

-- portfolio_entries (no family_id column -> scope through children)
alter table public.portfolio_entries enable row level security;
drop policy if exists pent_all on public.portfolio_entries;
create policy pent_all on public.portfolio_entries
  for all to authenticated
  using (child_id in (select id from public.children where family_id = current_family_id()))
  with check (child_id in (select id from public.children where family_id = current_family_id()));

-- =====================================================================
-- SHARED reference tables: read-only to authenticated users
-- (writes are performed by the service-role client only)
-- =====================================================================

alter table public.activities enable row level security;
drop policy if exists act_select on public.activities;
create policy act_select on public.activities
  for select to authenticated using (true);

alter table public.curriculum_outcomes enable row level security;
drop policy if exists curr_select on public.curriculum_outcomes;
create policy curr_select on public.curriculum_outcomes
  for select to authenticated using (true);

-- =====================================================================
-- COMMUNITY: social space. Shared read; writes scoped to your own family.
-- =====================================================================

alter table public.community_groups enable row level security;
drop policy if exists cg_select on public.community_groups;
create policy cg_select on public.community_groups
  for select to authenticated using (true);

alter table public.events enable row level security;
drop policy if exists ev_select on public.events;
create policy ev_select on public.events
  for select to authenticated using (true);

alter table public.community_posts enable row level security;
drop policy if exists cp_select on public.community_posts;
drop policy if exists cp_write on public.community_posts;
create policy cp_select on public.community_posts
  for select to authenticated using (true);
create policy cp_write on public.community_posts
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

alter table public.community_memberships enable row level security;
drop policy if exists cm_select on public.community_memberships;
drop policy if exists cm_write on public.community_memberships;
create policy cm_select on public.community_memberships
  for select to authenticated using (true);
create policy cm_write on public.community_memberships
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());
