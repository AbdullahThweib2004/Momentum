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
| 5 | AI post generation | ✅ Live (OpenRouter + mock fallback) |
| 6 | Connect Supabase | 🟡 Credentials wired — run the SQL |
| 7 | Authentication UI | ✅ Done |
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

## Phase 5 — AI post generation ✅

> **Yes — real AI now writes the posts.** `generatePostDraft()` in
> [`lib/generate.ts`](lib/generate.ts) calls **OpenRouter** (OpenAI-compatible
> API) using free models, and **automatically falls back to the built-in mock
> generator** if the key is missing or the API errors / rate-limits — so the
> feature never breaks.

- [x] `generatePostDraft()` calls OpenRouter with a LinkedIn-ghostwriter prompt — **[BUILT]**
- [x] Model fallback chain + mock fallback on failure — **[BUILT]**
- [x] Output cleanup (strips preambles, quotes, leaked reasoning) — **[BUILT]**
- [x] `OPENROUTER_API_KEY` wired into `.env.local` — **[BUILT]**
- [ ] Pass Settings **voice notes + content pillars** into the prompt — **[YOU]** (optional polish)
- [ ] Add prepaid credit / a paid model for higher limits & quality — **[YOU]** (optional)

**How it works:**
- Models are tried in order from `OPENROUTER_MODEL` (default: free Gemma / gpt-oss).
- Free models occasionally rate-limit (HTTP 429) — the code just tries the next
  one, then the mock. To upgrade, add credit at
  [openrouter.ai](https://openrouter.ai) and set `OPENROUTER_MODEL` to a paid model.

---

## Phase 6 — Connect Supabase 🟡 (credentials wired — 3 SQL steps left)

> ✅ Your project URL + publishable key are already in `.env.local`, and the app
> now runs in **Connected to Supabase** mode. What's left runs inside the
> Supabase dashboard — the publishable key can't create tables, so this happens
> in the **SQL Editor**.

- [x] Create a Supabase project; copy **Project URL** + **publishable key** — **[BUILT]**
- [x] Add your keys to `.env.local` — **[BUILT]**
- [ ] **Run the migration** `supabase/migrations/0001_initial_schema.sql` in the SQL Editor — **[YOU]** ⬅ do this first
- [ ] **Create your account** — sign up at `/login`, **or** Supabase → Authentication → Add user — **[YOU]**
- [ ] **Run** `supabase/seed.sql` in the SQL Editor to load demo data — **[YOU]**

**Do these in order:**

1. **Run the migration first.** Supabase → **SQL Editor** → paste all of
   `supabase/migrations/0001_initial_schema.sql` → Run. Creates the 3 tables, RLS
   policies, and the publish-weight trigger.
   ⚠️ *Until this runs, the app will error after login because the tables don't exist yet.*
2. **Create your account.** Open the app → you'll land on `/login` → **Create an
   account**. (If your project requires email confirmation, confirm via the email,
   or add the user directly in Supabase → Authentication → Add user.)
3. **Seed the demo data.** SQL Editor → run `supabase/seed.sql`. It attaches the
   sample interests, drafts &amp; history to your user.
4. **Sign in** and you'll see your live data.

---

## Phase 7 — Authentication UI ✅
- [x] Login / sign-up screen (Supabase Auth) — `app/login/page.tsx` — **[BUILT]**
- [x] Protect routes + redirect unauthenticated users — middleware — **[BUILT]**
- [x] Show signed-in user + sign-out in the sidebar — **[BUILT]**

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
