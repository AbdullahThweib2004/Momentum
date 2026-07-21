-- Momentum — initial schema
-- Tables: interests, engagement_logs, post_drafts
-- Row Level Security is enabled and scoped to auth.uid().
-- Every table carries a user_id so the schema is multi-user ready even though
-- the app is used single-user for now.

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- interests
-- ---------------------------------------------------------------------------
create table if not exists public.interests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic       text not null,
  description text,
  weight      integer not null default 1,
  -- 'manual' | 'derived_from_publish'
  source      text not null default 'manual' check (source in ('manual', 'derived_from_publish')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- engagement_logs
-- ---------------------------------------------------------------------------
create table if not exists public.engagement_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  post_url            text,
  post_summary        text not null,
  -- 'like' | 'comment' | 'share' | 'other'
  interaction_type    text not null default 'like' check (interaction_type in ('like', 'comment', 'share', 'other')),
  related_interest_id uuid references public.interests (id) on delete set null,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- post_drafts
-- ---------------------------------------------------------------------------
create table if not exists public.post_drafts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content             text not null,
  topic_tag           text not null,
  -- 'linkedin' | 'x'
  platform            text not null default 'linkedin' check (platform in ('linkedin', 'x')),
  related_interest_id uuid references public.interests (id) on delete set null,
  -- 'draft' | 'approved' | 'rejected' | 'published'
  status              text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'published')),
  scheduled_for       timestamptz,
  published_at        timestamptz,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists interests_user_id_idx        on public.interests (user_id);
create index if not exists engagement_logs_user_id_idx  on public.engagement_logs (user_id);
create index if not exists engagement_logs_interest_idx on public.engagement_logs (related_interest_id);
create index if not exists post_drafts_user_id_idx      on public.post_drafts (user_id);
create index if not exists post_drafts_status_idx       on public.post_drafts (status);
create index if not exists post_drafts_interest_idx     on public.post_drafts (related_interest_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.interests       enable row level security;
alter table public.engagement_logs enable row level security;
alter table public.post_drafts     enable row level security;

-- interests policies
drop policy if exists "Users can view their own interests"   on public.interests;
drop policy if exists "Users can insert their own interests" on public.interests;
drop policy if exists "Users can update their own interests" on public.interests;
drop policy if exists "Users can delete their own interests" on public.interests;
create policy "Users can view their own interests"
  on public.interests for select using (auth.uid() = user_id);
create policy "Users can insert their own interests"
  on public.interests for insert with check (auth.uid() = user_id);
create policy "Users can update their own interests"
  on public.interests for update using (auth.uid() = user_id);
create policy "Users can delete their own interests"
  on public.interests for delete using (auth.uid() = user_id);

-- engagement_logs policies
drop policy if exists "Users can view their own engagement logs"   on public.engagement_logs;
drop policy if exists "Users can insert their own engagement logs" on public.engagement_logs;
drop policy if exists "Users can update their own engagement logs" on public.engagement_logs;
drop policy if exists "Users can delete their own engagement logs" on public.engagement_logs;
create policy "Users can view their own engagement logs"
  on public.engagement_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own engagement logs"
  on public.engagement_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own engagement logs"
  on public.engagement_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own engagement logs"
  on public.engagement_logs for delete using (auth.uid() = user_id);

-- post_drafts policies
drop policy if exists "Users can view their own drafts"   on public.post_drafts;
drop policy if exists "Users can insert their own drafts" on public.post_drafts;
drop policy if exists "Users can update their own drafts" on public.post_drafts;
drop policy if exists "Users can delete their own drafts" on public.post_drafts;
create policy "Users can view their own drafts"
  on public.post_drafts for select using (auth.uid() = user_id);
create policy "Users can insert their own drafts"
  on public.post_drafts for insert with check (auth.uid() = user_id);
create policy "Users can update their own drafts"
  on public.post_drafts for update using (auth.uid() = user_id);
create policy "Users can delete their own drafts"
  on public.post_drafts for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_topics — the user's fixed list of topics for the daily generator.
-- (The daily batch also pulls from the user's top interests.)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_topics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic      text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- daily_batches — records which calendar days have already been generated, so
-- the "generate on a new day" logic is idempotent (no duplicate batches).
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
create index if not exists post_drafts_platform_idx  on public.post_drafts (platform);

alter table public.daily_topics  enable row level security;
alter table public.daily_batches enable row level security;

-- daily_topics policies
drop policy if exists "Users can view their own daily topics"   on public.daily_topics;
drop policy if exists "Users can insert their own daily topics" on public.daily_topics;
drop policy if exists "Users can update their own daily topics" on public.daily_topics;
drop policy if exists "Users can delete their own daily topics" on public.daily_topics;
create policy "Users can view their own daily topics"
  on public.daily_topics for select using (auth.uid() = user_id);
create policy "Users can insert their own daily topics"
  on public.daily_topics for insert with check (auth.uid() = user_id);
create policy "Users can update their own daily topics"
  on public.daily_topics for update using (auth.uid() = user_id);
create policy "Users can delete their own daily topics"
  on public.daily_topics for delete using (auth.uid() = user_id);

-- daily_batches policies
drop policy if exists "Users can view their own daily batches"   on public.daily_batches;
drop policy if exists "Users can insert their own daily batches" on public.daily_batches;
drop policy if exists "Users can delete their own daily batches" on public.daily_batches;
create policy "Users can view their own daily batches"
  on public.daily_batches for select using (auth.uid() = user_id);
create policy "Users can insert their own daily batches"
  on public.daily_batches for insert with check (auth.uid() = user_id);
create policy "Users can delete their own daily batches"
  on public.daily_batches for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Publish feedback loop:
-- when a draft moves to 'published', bump the weight of its related interest.
-- This implements "published topics get weighted higher for future generation".
-- ---------------------------------------------------------------------------
create or replace function public.bump_interest_weight_on_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published'
     and (old.status is distinct from 'published')
     and new.related_interest_id is not null then
    update public.interests
      set weight = weight + 1
      where id = new.related_interest_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_interest_weight on public.post_drafts;
create trigger trg_bump_interest_weight
  after update on public.post_drafts
  for each row
  execute function public.bump_interest_weight_on_publish();
