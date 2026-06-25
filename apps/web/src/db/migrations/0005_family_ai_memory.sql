-- 0005_family_ai_memory.sql
-- A lightweight, per-family memory the AI accumulates over time, so every
-- reply is shaped by what we have learned about THIS family and no other.
-- Notes are short gist-of-the-ask jottings; summary is an optional rolled-up
-- digest. Strictly own-family, enforced at the database layer. Idempotent.

create table if not exists public.family_ai_memory (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  notes jsonb not null default '[]',
  summary text,
  updated_at timestamptz not null default now(),
  unique(family_id)
);

create index if not exists family_ai_memory_family_id_idx
  on public.family_ai_memory (family_id);

-- Own-family only, mirroring 0002_rls_lockdown.sql. Reads/writes through the
-- anon-key client are scoped to current_family_id(); the service-role client
-- (used by recordAiMemory) bypasses RLS so the memory always writes.
alter table public.family_ai_memory enable row level security;
drop policy if exists fam_ai_mem_all on public.family_ai_memory;
create policy fam_ai_mem_all on public.family_ai_memory
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());
