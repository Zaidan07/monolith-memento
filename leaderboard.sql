begin;

create or replace function public.get_trekker_leaderboard(
  vote_category text default null,
  trekker_element text default null
)
returns table (
  id uuid,
  name text,
  element text,
  image_url text,
  vote_count bigint,
  placement bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with totals as (
    select t.id, t.name, t.element, t.image_url, count(*) as vote_count
    from public.votes as v
    join public.trekkers as t on t.id = v.trekker_id
    where v.category in ('favorite-element', 'bingo', 'top9')
      and (vote_category is null or v.category = vote_category)
      and (trekker_element is null or t.element = trekker_element)
    group by t.id, t.name, t.element, t.image_url
  )
  select totals.*, rank() over (order by totals.vote_count desc) as placement
  from totals
  order by totals.vote_count desc, lower(totals.name), totals.id;
$$;

revoke all on function public.get_trekker_leaderboard(text, text) from public;
grant execute on function public.get_trekker_leaderboard(text, text) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
