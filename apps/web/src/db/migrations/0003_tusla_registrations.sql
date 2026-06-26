-- 0003_tusla_registrations.sql
-- Promote tusla_registrations from a runtime exec_sql hack (which silently
-- failed, losing AEARS registration data) to a real, migrated, RLS-protected
-- table. Idempotent.

create table if not exists public.tusla_registrations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  status text not null default 'not_started',
  notification_form jsonb not null default '{}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  deadlines jsonb not null default '[]'::jsonb,
  assessment_checklist jsonb not null default '[]'::jsonb,
  notes text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, child_id)
);

create index if not exists tusla_registrations_family_idx
  on public.tusla_registrations (family_id);

-- Family isolation, consistent with 0002_rls_lockdown.
alter table public.tusla_registrations enable row level security;
drop policy if exists tusla_all on public.tusla_registrations;
create policy tusla_all on public.tusla_registrations
  for all to authenticated
  using (family_id = current_family_id())
  with check (family_id = current_family_id());
