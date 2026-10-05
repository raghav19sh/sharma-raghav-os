-- Run once in the Supabase SQL editor for sharma-raghav-os.
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);

insert into public.site_settings (key, value)
values ('wallpaper_url', '/wallpaper.svg')
on conflict (key) do nothing;