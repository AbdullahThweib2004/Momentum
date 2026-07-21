-- Momentum — migration 0002
-- Adds LinkedIn/X platform support + the daily-generator tables.
--
-- Run this ONLY if you already applied the original 0001 schema (i.e. the
-- interests / post_drafts / engagement_logs tables already exist). A brand-new
-- database can just run 0001 (which now includes everything) and skip this.
--
-- This script is fully idempotent — safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1) platform column on post_drafts  ('linkedin' | 'x')
-- ---------------------------------------------------------------------------
alter table public.post_drafts
  add column if not exists platform text not null default 'linkedin';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'post_drafts_platform_check'
  ) then
    alter table public.post_drafts
      add constraint post_drafts_platform_check
      check (platform in ('linkedin', 'x'));
  end if;
end $$;

create index if not exists post_drafts_platform_idx on public.post_drafts (platform);

-- ---------------------------------------------------------------------------
-- 2) daily_topics — the user's fixed list for the daily generator
-- ---------------------------------------------------------------------------
create table if not exists public.daily_topics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic      text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3) daily_batches — idempotency record for "generate once per day"
-- ---------------------------------------------------------------------------
create table if not exists public.daily_batches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  batch_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, batch_date)
);

create index if not exists daily_topics_user_id_idx  on public.daily_topics (user_id);
create index if not exists daily_batches_user_id_idx on public.daily_batches (user_id);

alter table public.daily_topics  enable row level security;
alter table public.daily_batches enable row level security;

-- ---------------------------------------------------------------------------
-- 4) Policies — dropped first so re-running never errors with "already exists"
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own daily topics"   on public.daily_topics;
drop policy if exists "Users can insert their own daily topics"  on public.daily_topics;
drop policy if exists "Users can update their own daily topics"  on public.daily_topics;
drop policy if exists "Users can delete their own daily topics"  on public.daily_topics;

create policy "Users can view their own daily topics"
  on public.daily_topics for select using (auth.uid() = user_id);
create policy "Users can insert their own daily topics"
  on public.daily_topics for insert with check (auth.uid() = user_id);
create policy "Users can update their own daily topics"
  on public.daily_topics for update using (auth.uid() = user_id);
create policy "Users can delete their own daily topics"
  on public.daily_topics for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own daily batches"   on public.daily_batches;
drop policy if exists "Users can insert their own daily batches"  on public.daily_batches;
drop policy if exists "Users can delete their own daily batches"  on public.daily_batches;

create policy "Users can view their own daily batches"
  on public.daily_batches for select using (auth.uid() = user_id);
create policy "Users can insert their own daily batches"
  on public.daily_batches for insert with check (auth.uid() = user_id);
create policy "Users can delete their own daily batches"
  on public.daily_batches for delete using (auth.uid() = user_id);
