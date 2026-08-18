-- Global public appearance. Visitors can read only this single setting;
-- only the authenticated admin can write settings.
create policy "public can read current public theme"
  on settings for select
  using (key = 'public_theme');

insert into settings (key, value)
values ('public_theme', '"minimal"'::jsonb)
on conflict (key) do nothing;
