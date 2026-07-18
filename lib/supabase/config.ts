// Central place to detect whether a real Supabase backend is configured.
// When it isn't, the data layer falls back to rich in-memory mock data so the
// app is fully explorable on first run (great for a demo).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_URL.includes("your-project-ref");
