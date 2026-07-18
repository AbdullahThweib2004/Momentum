// Data access layer.
//
// Every function tries Supabase first (real, RLS-scoped queries) and falls back
// to the in-memory mock store when Supabase isn't configured. UI code imports
// only from here and never worries about which backend is active.

import { createClient } from "@/lib/supabase/server";
import { store } from "@/lib/mock-data";
import type {
  EngagementLogWithInterest,
  Interest,
  PostDraftWithInterest,
} from "@/types/database";

function byInterest(interestId: string | null): Pick<Interest, "id" | "topic"> | null {
  if (!interestId) return null;
  const i = store.interests.find((x) => x.id === interestId);
  return i ? { id: i.id, topic: i.topic } : null;
}

// ---------------------------------------------------------------------------
// Interests
// ---------------------------------------------------------------------------
export async function getInterests(): Promise<Interest[]> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("interests")
      .select("*")
      .order("weight", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return [...store.interests].sort((a, b) => b.weight - a.weight);
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------
export async function getDrafts(): Promise<PostDraftWithInterest[]> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("post_drafts")
      .select("*, interest:interests(id, topic)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PostDraftWithInterest[]) ?? [];
  }
  return [...store.drafts]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map((d) => ({ ...d, interest: byInterest(d.related_interest_id) }));
}

export async function getDraftById(
  id: string
): Promise<PostDraftWithInterest | null> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("post_drafts")
      .select("*, interest:interests(id, topic)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as PostDraftWithInterest) ?? null;
  }
  const d = store.drafts.find((x) => x.id === id);
  return d ? { ...d, interest: byInterest(d.related_interest_id) } : null;
}

// ---------------------------------------------------------------------------
// Engagement logs
// ---------------------------------------------------------------------------
export async function getEngagements(): Promise<EngagementLogWithInterest[]> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("engagement_logs")
      .select("*, interest:interests(id, topic)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as EngagementLogWithInterest[]) ?? [];
  }
  return [...store.engagements]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map((e) => ({ ...e, interest: byInterest(e.related_interest_id) }));
}

// ---------------------------------------------------------------------------
// Dashboard aggregates
// ---------------------------------------------------------------------------
export interface DashboardStats {
  pendingReview: number;
  publishedThisWeek: number;
  publishedThisMonth: number;
  topInterests: Interest[];
  // 30-day publishing activity, oldest → newest
  activity: { date: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [drafts, interests] = await Promise.all([getDrafts(), getInterests()]);

  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;
  const monthAgo = now - 30 * 86_400_000;

  const published = drafts.filter((d) => d.status === "published" && d.published_at);

  const pendingReview = drafts.filter(
    (d) => d.status === "draft" || d.status === "approved"
  ).length;

  const publishedThisWeek = published.filter(
    (d) => +new Date(d.published_at as string) >= weekAgo
  ).length;
  const publishedThisMonth = published.filter(
    (d) => +new Date(d.published_at as string) >= monthAgo
  ).length;

  const topInterests = [...interests]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  // Build a 30-day bucketed activity series.
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of published) {
    const key = new Date(p.published_at as string).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const activity = Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    pendingReview,
    publishedThisWeek,
    publishedThisMonth,
    topInterests,
    activity,
  };
}
