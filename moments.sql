begin;
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  trekker_slug text not null check (trekker_slug ~ '^[a-z0-9-]{1,40}$'),
  player_name text not null default '' check (char_length(player_name) <= 40),
  pulled_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.moments enable row level security;
grant select, insert on public.moments to anon, authenticated;
drop policy if exists "Read shared moments" on public.moments;
create policy "Read shared moments" on public.moments for select to anon, authenticated using (true);
drop policy if exists "Save moments" on public.moments;
create policy "Save moments" on public.moments for insert to anon, authenticated with check (true);
notify pgrst, 'reload schema';
commit;
