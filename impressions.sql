-- Apply once in Supabase SQL Editor to allow anonymous users to edit their own entries.
-- session_id contains a SHA-256 digest of a private browser UUID for this feature.
begin;

drop policy if exists "impressions update own session" on public.impressions;
create policy "impressions update own session" on public.impressions
  for update to anon
  using (
    session_id = encode(sha256(convert_to(
      nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-impression-session',
      'UTF8'
    )), 'hex')
  )
  with check (
    session_id = encode(sha256(convert_to(
      nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-impression-session',
      'UTF8'
    )), 'hex')
  );

commit;
