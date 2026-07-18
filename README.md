# Momentum

A personal **LinkedIn content assistant**. Momentum tracks the topics you care
about, generates post drafts on those topics, and lets you review, edit, and
mark them as published once you've posted them manually on LinkedIn.
Publishing feeds back into the system — topics you publish about get weighted
higher for future generation.

> You publish on LinkedIn yourself. Momentum never posts for you — it helps you
> stay consistent.

## Highlights

- **Dashboard** — pending drafts, weekly/monthly publishing counts, top
  interests, and a 30-day activity chart.
- **Drafts** — generate, review, edit, approve/reject, schedule, and mark as
  published. Filter by status and topic. Per-draft editor with a LinkedIn-style
  live preview.
- **Interests** — tracked topics with visual weight/priority, add/edit/delete,
  and linked draft/published counts.
- **Engagement Log** — capture posts you liked/commented on/shared, optionally
  linked to an interest (or create a new one inline).
- **History** — every published post with topic-distribution and
  posting-frequency analytics.
- **Settings** — your writing voice and 3–5 content pillars (used later to
  steer AI generation).

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom design system (distinctive jade/teal brand)
- **shadcn/ui**-style components + **lucide-react** icons
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) for database & auth
- **Recharts** for charts, **sonner** for toasts
- Deploy-ready for **Vercel**

## Runs out of the box (demo mode)

Momentum ships with a rich in-memory mock dataset. **Without any Supabase
config it runs fully populated** so you can explore every screen immediately.
Create/edit/delete all work in-session (state resets on server restart).

```bash
npm install
npm run dev
# open http://localhost:3000  → a sidebar badge shows "Demo mode · mock data"
```

## Connecting Supabase (real database)

### 1. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in from **Supabase Dashboard → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Once these are set (and the URL isn't the placeholder), the app switches from
mock data to live Supabase queries automatically — the sidebar badge reads
"Connected to Supabase".

### 2. Run the migration

Creates the `interests`, `engagement_logs`, and `post_drafts` tables, enables
Row Level Security scoped to `auth.uid()`, and adds a trigger that bumps an
interest's weight when a related draft is published.

**Option A — Supabase SQL Editor:** paste the contents of
[`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql)
and run it.

**Option B — Supabase CLI:**

```bash
supabase db push
# or, against a linked project:
supabase db execute --file supabase/migrations/0001_initial_schema.sql
```

### 3. Create a user

RLS is scoped per user. Create one in **Dashboard → Authentication → Add user**
(email + password). The schema includes a `user_id` on every table, so it's
already multi-user ready.

### 4. Seed demo data

The seed attaches all rows to the **first** user in `auth.users`.

Run [`supabase/seed.sql`](supabase/seed.sql) in the SQL Editor (or
`supabase db execute --file supabase/seed.sql`). It inserts 8 interests,
~15 drafts across all statuses, and 10 engagement log entries with dates spread
across the last month.

## Project structure

```
app/
  layout.tsx            # root layout: sidebar shell + toaster
  page.tsx              # Dashboard
  drafts/               # list + [id] editor
  interests/            # interests grid
  engagement/           # log form + list
  history/              # published posts + analytics
  settings/             # voice & pillars
components/
  ui/                   # shadcn-style primitives
  layout/               # app shell, sidebar nav, page header
  dashboard/ drafts/ interests/ engagement/ history/ settings/
lib/
  supabase/             # client / server / middleware / config
  data.ts               # read layer (Supabase → mock fallback)
  actions.ts            # server actions (mutations)
  generate.ts           # generatePostDraft() placeholder — wire up AI here
  mock-data.ts          # in-memory demo store
  format.ts utils.ts
types/
  database.ts           # DB model types matching the schema
supabase/
  migrations/0001_initial_schema.sql
  seed.sql
```

## Wiring up AI generation later

`generatePostDraft()` in [`lib/generate.ts`](lib/generate.ts) currently returns
realistic mock content. Replace its body with a call to your AI provider,
passing in the user's **writing voice** and **content pillars** (from Settings)
plus the top-weighted **interests**. The function signature is stable, so
nothing else needs to change.

## Deploy to Vercel

1. Push to a Git repo and import it in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   environment variables (omit them to deploy in demo mode).
3. Deploy.

## Scripts

| Command         | Description               |
| --------------- | ------------------------- |
| `npm run dev`   | Start the dev server      |
| `npm run build` | Production build          |
| `npm run start` | Run the production build  |
| `npm run lint`  | Lint                      |
