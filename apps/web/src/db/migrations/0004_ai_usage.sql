-- 0004_ai_usage.sql
-- Real per-family AI usage ledger so tier limits can be enforced server-side
-- (previously the suggester returned a weeklyLimit but never enforced it, and
-- usage was proxied off activity_logs). Idempotent.

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  feature text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_family_feature_idx
  on public.ai_usage (family_id, feature, created_at);

alter table public.ai_usage enable row level security;
drop policy if exists ai_usage_all on public.ai_usage;
create policy ai_usage_all on public.ai_usage
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());
