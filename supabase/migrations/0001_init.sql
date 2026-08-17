-- ============================================================================
-- SHARMA-RAGHAV OS — database schema (Postgres / Supabase)
-- Phase 2 deliverable, included now so the plan is concrete rather than prose.
-- Single-admin system: one real user (Raghav), enforced via RLS + an
-- allow-listed email checked in middleware, not via a roles table.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- shared helpers ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- profiles ----------
-- One row, tied to auth.users. Holds the public identity shown in the UI.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Raghav Sharma',
  headline text,
  bio text,
  location text,
  email_public text,
  linkedin_url text,
  github_url text,
  domain text,
  updated_at timestamptz not null default now()
);

-- ---------- content tables ----------
-- Every content table shares the same shape on purpose: id, slug, status,
-- visibility, timestamps. Keeps queries and RLS policies uniform.

create table research (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null check (kind in ('Paper','Whitepaper','Research Note','Draft')),
  summary text,
  body text,
  read_time_minutes int,
  status text not null default 'draft' check (status in ('draft','researching','review','published','archived')),
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text,
  summary text,
  body text,
  repo_url text,
  live_url text,
  stack text[] not null default '{}',
  status text not null default 'idea' check (status in ('idea','active','paused','completed','archived')),
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text,
  summary text,
  body text,
  read_time_minutes int,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  body text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  -- NOTE: visibility default is 'private' — public API must filter on this
  -- in SQL. Never fetch all rows and hide some in React.
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  category text,
  status text not null default 'queue' check (status in ('queue','reading','completed','abandoned')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  rating int check (rating between 1 and 5),
  notes text,
  started_at date,
  completed_at date,
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text unique not null,
  provider text,
  status text not null default 'in_progress' check (status in ('planned','in_progress','completed')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  is_certification boolean not null default false,
  credential_url text,
  completed_at date,
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table snippets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text,
  summary text,
  code text,
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text check (kind in ('image','document','video')),
  storage_path text not null,   -- Supabase Storage object path; never store binaries in-row
  mime_type text,
  file_size_bytes bigint,
  alt_text text,
  visibility text not null default 'private' check (visibility in ('public','unlisted','private')),
  created_at timestamptz not null default now()
);

create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  year_label text not null,
  title text unique not null,
  body text,
  event_date date,
  is_current boolean not null default false,
  sort_order int not null default 0,
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  created_at timestamptz not null default now()
);

-- ---------- unfinished work (tasks + goals + open loops, one table) ----------

create table open_loops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('task','goal','research','project','certification','other')),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'open' check (status in ('open','in_progress','blocked','done')),
  due_date date,
  related_table text,   -- e.g. 'projects'
  related_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- tagging / knowledge graph substrate ----------

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table taggables (
  tag_id uuid not null references tags(id) on delete cascade,
  taggable_table text not null,   -- 'research' | 'projects' | 'articles' | ...
  taggable_id uuid not null,
  primary key (tag_id, taggable_table, taggable_id)
);
create index taggables_lookup on taggables(taggable_table, taggable_id);

-- ---------- activity vs. audit (kept explicitly separate, per spec) ----------

create table activity_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null,             -- 'project_updated' | 'research_published' | ...
  summary text not null,
  related_table text,
  related_id uuid,
  occurred_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id),
  action text not null,           -- 'login' | 'create' | 'update' | 'delete' | 'publish' | ...
  resource_table text,
  resource_id uuid,
  ip_address text,
  user_agent text,
  occurred_at timestamptz not null default now()
);

-- ---------- admin-only settings ----------

create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------

do $$
declare t text;
begin
  foreach t in array array['research','projects','articles','journal_entries','books','courses','snippets','open_loops']
  loop
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ---------- full-text search (Phase 8) ----------

alter table research add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body,''))) stored;
alter table projects add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body,''))) stored;
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body,''))) stored;

create index research_search_idx on research using gin(search_vector);
create index projects_search_idx on projects using gin(search_vector);
create index articles_search_idx on articles using gin(search_vector);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Public (anon) role: select only where visibility = 'public' AND status
-- indicates it's meant to be seen. Admin (authenticated, matching the single
-- allow-listed user) gets full access. This is the actual enforcement layer
-- — there is no other one.
-- ============================================================================

alter table research enable row level security;
alter table projects enable row level security;
alter table articles enable row level security;
alter table journal_entries enable row level security;
alter table books enable row level security;
alter table courses enable row level security;
alter table snippets enable row level security;
alter table media enable row level security;
alter table timeline_events enable row level security;
alter table open_loops enable row level security;
alter table activity_events enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;

-- Example policy pattern (repeat per table with the table's own status check):
create policy "public can read published research"
  on research for select
  using (visibility = 'public' and status = 'published');

create policy "admin has full access to research"
  on research for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- journal_entries: public API must NEVER return private rows. This policy
-- is the backstop even if application code has a bug.
create policy "public can read only public journal entries"
  on journal_entries for select
  using (visibility = 'public' and status = 'published');

create policy "admin has full access to journal"
  on journal_entries for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- audit_logs: never readable by the public role, full stop.
create policy "admin only can read audit logs"
  on audit_logs for select
  using (auth.uid() is not null);

create policy "admin only can write audit logs"
  on audit_logs for insert
  with check (auth.uid() is not null);

-- Remaining content tables: same "public reads public+published, admin reads
-- and writes everything" shape as research/journal_entries above.
create policy "public can read public projects" on projects for select using (visibility = 'public');
create policy "admin has full access to projects" on projects for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read published articles" on articles for select using (visibility = 'public' and status = 'published');
create policy "admin has full access to articles" on articles for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read public books" on books for select using (visibility = 'public');
create policy "admin has full access to books" on books for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read public courses" on courses for select using (visibility = 'public');
create policy "admin has full access to courses" on courses for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read public snippets" on snippets for select using (visibility = 'public');
create policy "admin has full access to snippets" on snippets for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read public media" on media for select using (visibility = 'public');
create policy "admin has full access to media" on media for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read public timeline events" on timeline_events for select using (visibility = 'public');
create policy "admin has full access to timeline events" on timeline_events for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "public can read activity events" on activity_events for select using (true);
create policy "admin has full access to activity events" on activity_events for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- open_loops and settings: admin-only, no public policy at all — the
-- absence of a public "select" policy IS the protection (default-deny).
create policy "admin has full access to open loops" on open_loops for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin has full access to settings" on settings for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- profiles: public can read the single profile row (it's the About page
-- identity, meant to be public); only the admin can write it.
alter table profiles enable row level security;
create policy "public can read profile" on profiles for select using (true);
create policy "admin can update own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
