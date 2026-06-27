-- Push tokens for Expo notifications. This table was referenced by the app but
-- never created, so push notifications could not work at all. Create it now,
-- with RLS scoping each parent to their own tokens (the cron reads via the
-- service-role client, which bypasses RLS).
create table if not exists public.push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  token text not null,
  platform text not null default 'ios',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token)
);
create index if not exists push_tokens_family_id_idx on public.push_tokens(family_id);

alter table public.push_tokens enable row level security;
drop policy if exists pt_own on public.push_tokens;
create policy pt_own on public.push_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Make PostgREST aware of the new table immediately.
notify pgrst, 'reload schema';
