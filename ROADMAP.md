# 📈 Momentum — Project Roadmap

> A live map of the build: what's already working, what's mocked, and the exact
> steps left. Check items off (`[ ]` → `[x]`) as you go.
>
> **Status today:** the app runs fully in **mock-data mode** — no backend needed.
> Two things remain that only you can finish: **wiring in real AI** and
> **connecting Supabase** (which also needs a login screen).

**Repo:** `AbdullahThweib2004/Momentum` · **Stack:** Next.js 14 · TypeScript · Tailwind · Supabase

**Legend:** ✅ Done & verified · 🟡 In progress / mocked · ⬜ To do (your action)
Tags: **[BUILT]** = done for you · **[YOU]** = your turn

---

## Progress at a glance

| Phase | Area | Status |
|------:|------|:------:|
| 1 | Foundation & design system | ✅ Done |
| 2 | Database schema & security | ✅ Done |
| 3 | Data layer & mock fallback | ✅ Done |
| 4 | All six pages | ✅ Done |
| 5 | AI post generation | 🟡 Mocked — needs wiring |
| 6 | Connect Supabase | ⬜ Your turn |
| 7 | Authentication UI | ⬜ Your turn |
| 8 | Deploy | ⬜ Your turn |
| 9 | Polish & future ideas | ⬜ Optional |

---

## Phase 1 — Foundation & design system ✅
- [x] Next.js 14 + TypeScript + Tailwind scaffold — **[BUILT]**
- [x] Custom jade-teal palette, light & dark themes — **[BUILT]**
- [x] shadcn/ui components (button, card, dialog, select…) — **[BUILT]**
- [x] Collapsible sidebar nav + responsive app shell — **[BUILT]**

## Phase 2 — Database schema & security ✅
- [x] `interests` / `engagement_logs` / `post_drafts` tables — **[BUILT]**
- [x] Row Level Security policies scoped to `auth.uid()` — **[BUILT]**
- [x] `user_id` on every table (multi-user ready) — **[BUILT]**
- [x] Publish → interest-weight trigger — **[BUILT]**
- [x] Seed SQL with realistic AI-tools data — **[BUILT]**

## Phase 3 — Data layer & mock fallback ✅
- [x] Supabase server/client/middleware setup — **[BUILT]**
- [x] Typed data layer (queries + aggregates) — **[BUILT]**
- [x] Server actions for every mutation — **[BUILT]**
- [x] In-memory mock store so it runs with no backend — **[BUILT]**

## Phase 4 — All six pages ✅
- [x] Dashboard — stat cards + 30-day activity chart — **[BUILT]**
- [x] Drafts — cards, filters, edit/approve/schedule/publish — **[BUILT]**
- [x] Interests — weighted list, add/edit/delete — **[BUILT]**
- [x] Engagement Log — capture form + history table — **[BUILT]**
- [x] Published History — topic & frequency analytics — **[BUILT]**
- [x] Settings — voice notes + content pillars — **[BUILT]**
- [x] Empty states, loading skeletons, toasts — **[BUILT]**

---

## Phase 5 — AI post generation 🟡 (next up)

> **Is AI generating the posts? Not yet.** Every draft comes from
> `generatePostDraft()` in [`lib/generate.ts`](lib/generate.ts) — a placeholder
> that stitches realistic text from templates with a fake delay. No model is
> called. The function's inputs (`topic`, `interest`, `voice`) and output shape
> already match what a real model needs, so it's a drop-in swap.

- [x] `generatePostDraft()` placeholder returning mock text — **[BUILT]**
- [x] Stable input/output contract for a model swap — **[BUILT]**
- [ ] Install an SDK (e.g. `@anthropic-ai/sdk`) + add API key — **[YOU]**
- [ ] Replace mock body with a Claude Messages API call — **[YOU]**
- [ ] Feed voice notes + content pillars into the prompt — **[YOU]**

**To make it real:**
```bash
npm install @anthropic-ai/sdk
# add ANTHROPIC_API_KEY to .env.local
# in generatePostDraft(): call the Claude Messages API,
# feeding it the topic + interest + your voice notes,
# and return { content, topic_tag }
```
> 💡 The Settings page already collects your **voice notes** and **content
> pillars** — pass those into the prompt so drafts sound like you.

---

## Phase 6 — Connect Supabase ⬜

> The app auto-detects real credentials via `isSupabaseConfigured` and flips from
> mock data to your live database — **no code change needed**.

- [ ] Create a Supabase project; copy **Project URL** + **anon public key** (Settings → API) — **[YOU]**
- [ ] Add your keys to `.env.local` — **[YOU]**
- [ ] Run the migration `supabase/migrations/0001_initial_schema.sql` in the SQL Editor — **[YOU]**
- [ ] Create a user (Authentication → Add user) — **[YOU]**
- [ ] Run `supabase/seed.sql` to load demo data — **[YOU]**
- [ ] Restart `npm run dev` — **[YOU]**

**Steps in detail:**

1. **Create a Supabase project** — at [supabase.com](https://supabase.com) → New project.
2. **Add your keys** to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   # then edit:
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
3. **Run the migration** — paste `supabase/migrations/0001_initial_schema.sql` into the
   Supabase **SQL Editor** and run. Creates the 3 tables, RLS policies, and the publish-weight trigger.
4. **Create a user** — Authentication → **Add user**. Rows are scoped to `auth.uid()`.
5. **Seed the data** — run `supabase/seed.sql` in the SQL Editor.
6. **Restart & sign in** — restart the dev server.

> ⚠️ **Important gap:** RLS returns **nothing** without a logged-in session. So
> live data won't appear until the **login screen (Phase 7)** exists. Until then,
> keep exploring in mock mode — it needs no backend at all.

---

## Phase 7 — Authentication UI ⬜ (required for live data)
- [ ] Login / sign-up screen (Supabase Auth) — **[YOU]**
- [ ] Protect routes + redirect unauthenticated users — **[YOU]**
- [ ] Show signed-in user in the sidebar — **[YOU]**

## Phase 8 — Deploy ⬜
- [x] Push to GitHub — **[BUILT]**
- [ ] Import repo into Vercel — **[YOU]**
- [ ] Set env vars in Vercel + deploy — **[YOU]**

## Phase 9 — Polish & future ideas ⬜ (optional)
- [ ] Persist Settings to a DB table (currently local-only) — **[YOU]**
- [ ] Scheduled-post reminders / calendar view — **[YOU]**
- [ ] Derive interests automatically from engagement — **[YOU]**
- [ ] Bump Next.js to latest patch release — **[YOU]**

---

## What the design is built with

| Area | Tools |
|------|-------|
| **Framework & language** | Next.js 14 (App Router / RSC), TypeScript, React 18 |
| **Styling & design system** | Tailwind CSS (tokens in config), shadcn/ui (new-york), CSS variables (light + dark), tailwindcss-animate |
| **Components & interaction** | Radix UI (dialog, select, tabs…), lucide-react (icons), Recharts (charts), sonner (toasts), date-fns |
| **Data & backend** | @supabase/supabase-js, @supabase/ssr, Postgres + RLS, in-memory mock store |

---

## 👉 What's next?

1. **Phase 5 — wire in real AI** (biggest visible payoff), **or**
2. **Phase 6 + 7 — connect Supabase & add login** (moves off mock data, persists everything).

Both are independent — do them in either order.
