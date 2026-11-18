begin;
create table if not exists public.game_profile_titles (
  id integer primary key,
  type smallint not null check (type in (1, 2)),
  name text not null
);
alter table public.game_profile_titles enable row level security;
grant select on public.game_profile_titles to anon, authenticated;
grant select, insert, update on public.game_profile_titles to service_role;
drop policy if exists "Read profile titles" on public.game_profile_titles;
create policy "Read profile titles" on public.game_profile_titles
  for select to anon, authenticated using (true);

insert into public.game_profile_titles (id, type, name) values
  (1, 1, 'Amnesia'),
  (3, 1, 'Blank'),
  (5, 1, 'Daisy'),
  (7, 1, 'Calm'),
  (9, 1, 'Cool'),
  (11, 1, 'Wise'),
  (13, 1, 'Forest'),
  (23, 1, 'Passionate'),
  (25, 1, 'Greenhouse'),
  (19, 1, 'Erudite'),
  (15, 1, 'Athletic'),
  (17, 1, 'Artsy'),
  (21, 1, 'Charmer'),
  (27, 1, 'Meticulous'),
  (29, 1, 'Cold'),
  (31, 1, 'Champion'),
  (33, 1, 'The Wilds'),
  (35, 1, 'Dark'),
  (37, 1, 'All-Rounder'),
  (39, 1, 'Dependable'),
  (41, 1, 'Blazing Speed'),
  (43, 1, 'Gentle'),
  (45, 1, 'Cold-Blooded'),
  (47, 1, 'Professional'),
  (49, 1, 'Nova'),
  (51, 1, 'Nightwatch'),
  (53, 1, 'Bidder'),
  (55, 1, 'Glory'),
  (57, 1, 'Time'),
  (59, 1, 'Open-sea'),
  (2, 2, 'Tyrant'),
  (4, 2, 'Trekker'),
  (6, 2, 'Steward'),
  (8, 2, 'Boss'),
  (10, 2, 'Captain'),
  (12, 2, 'Principal'),
  (14, 2, 'Guardian'),
  (24, 2, 'Ninja'),
  (26, 2, 'Protector'),
  (20, 2, 'Appraiser'),
  (16, 2, 'Foodie'),
  (18, 2, 'Author'),
  (22, 2, 'Instrumentalist'),
  (28, 2, 'Geographer'),
  (30, 2, 'Professor'),
  (32, 2, 'Artisan'),
  (34, 2, 'Sharpshooter'),
  (36, 2, 'Lord'),
  (38, 2, 'Safety Officer'),
  (40, 2, 'Sailor'),
  (42, 2, 'Racer'),
  (44, 2, 'Mom'),
  (46, 2, 'Hunter'),
  (48, 2, 'Shadow Seeker'),
  (50, 2, 'Monster Hunter'),
  (52, 2, 'Knight'),
  (54, 2, 'Expert'),
  (56, 2, 'Chief'),
  (58, 2, 'Traveler'),
  (60, 2, 'Navigator')
on conflict (id) do update set type = excluded.type, name = excluded.name;
notify pgrst, 'reload schema';
commit;
