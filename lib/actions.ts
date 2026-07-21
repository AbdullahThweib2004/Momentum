"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUserId } from "@/lib/supabase/server";
import { store, uid, MOCK_USER } from "@/lib/mock-data";
import { generatePostDraft } from "@/lib/generate";
import { getDailyTopics, getInterests } from "@/lib/data";
import type {
  DraftStatus,
  EngagementLog,
  Interest,
  InteractionType,
  Platform,
  PostDraft,
} from "@/types/database";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/drafts");
  revalidatePath("/interests");
  revalidatePath("/engagement");
  revalidatePath("/history");
  revalidatePath("/settings");
}

// ---------------------------------------------------------------------------
// Interests
// ---------------------------------------------------------------------------
export async function createInterest(input: {
  topic: string;
  description?: string | null;
  weight?: number;
}) {
  const supabase = createClient();
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase.from("interests").insert({
      topic: input.topic,
      description: input.description ?? null,
      weight: input.weight ?? 1,
      source: "manual",
      ...(user_id ? { user_id } : {}),
    });
    if (error) throw new Error(error.message);
  } else {
    const now = new Date().toISOString();
    store.interests.push({
      id: uid(),
      user_id: MOCK_USER,
      topic: input.topic,
      description: input.description ?? null,
      weight: input.weight ?? 1,
      source: "manual",
      created_at: now,
    });
  }
  revalidateAll();
}

export async function updateInterest(
  id: string,
  input: Partial<Pick<Interest, "topic" | "description" | "weight">>
) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("interests").update(input).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const i = store.interests.find((x) => x.id === id);
    if (i) Object.assign(i, input);
  }
  revalidateAll();
}

export async function deleteInterest(id: string) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("interests").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    store.interests = store.interests.filter((x) => x.id !== id);
    // Null out references so the demo stays consistent.
    store.drafts.forEach((d) => {
      if (d.related_interest_id === id) d.related_interest_id = null;
    });
    store.engagements.forEach((e) => {
      if (e.related_interest_id === id) e.related_interest_id = null;
    });
  }
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------
// Look up an interest (with description) whether we're on Supabase or mock.
async function resolveInterest(id: string | null | undefined) {
  if (!id) return null;
  const supabase = createClient();
  if (supabase) {
    const all = await getInterests();
    const i = all.find((x) => x.id === id);
    return i ? { id: i.id, topic: i.topic, description: i.description } : null;
  }
  const i = store.interests.find((x) => x.id === id);
  return i ? { id: i.id, topic: i.topic, description: i.description } : null;
}

// Insert a generated draft (Supabase or mock).
async function insertDraft(d: {
  content: string;
  topic_tag: string;
  platform: Platform;
  related_interest_id: string | null;
}) {
  const supabase = createClient();
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase.from("post_drafts").insert({
      content: d.content,
      topic_tag: d.topic_tag,
      platform: d.platform,
      related_interest_id: d.related_interest_id,
      status: "draft",
      ...(user_id ? { user_id } : {}),
    });
    if (error) throw new Error(error.message);
  } else {
    store.drafts.unshift({
      id: uid(),
      user_id: MOCK_USER,
      content: d.content,
      topic_tag: d.topic_tag,
      platform: d.platform,
      related_interest_id: d.related_interest_id,
      status: "draft",
      scheduled_for: null,
      published_at: null,
      notes: null,
      created_at: new Date().toISOString(),
    });
  }
}

export async function generateDraft(input: {
  topic: string;
  related_interest_id?: string | null;
  platforms?: Platform[];
}) {
  const platforms: Platform[] =
    input.platforms && input.platforms.length ? input.platforms : ["linkedin"];
  const interest = await resolveInterest(input.related_interest_id);

  for (const platform of platforms) {
    const generated = await generatePostDraft({
      topic: input.topic,
      interest,
      platform,
    });
    await insertDraft({
      content: generated.content,
      topic_tag: generated.topic_tag,
      platform,
      related_interest_id: input.related_interest_id ?? null,
    });
  }
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Daily generator
// ---------------------------------------------------------------------------

// Daily topic list (used on the Settings page).
export async function addDailyTopic(topic: string) {
  const value = topic.trim();
  if (!value) return;
  const supabase = createClient();
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase.from("daily_topics").insert({
      topic: value,
      active: true,
      ...(user_id ? { user_id } : {}),
    });
    if (error) throw new Error(error.message);
  } else {
    store.dailyTopics.push({
      id: uid(),
      user_id: MOCK_USER,
      topic: value,
      active: true,
      created_at: new Date().toISOString(),
    });
  }
  revalidateAll();
}

export async function deleteDailyTopic(id: string) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("daily_topics").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    store.dailyTopics = store.dailyTopics.filter((t) => t.id !== id);
  }
  revalidateAll();
}

export async function toggleDailyTopic(id: string, active: boolean) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase
      .from("daily_topics")
      .update({ active })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const t = store.dailyTopics.find((x) => x.id === id);
    if (t) t.active = active;
  }
  revalidateAll();
}

export interface DailyRunResult {
  created: number;
  alreadyDone: boolean;
  date: string;
}

// How many topics a daily batch generates at most (each × LinkedIn + X).
const DAILY_TOPIC_CAP = 4;

// Idempotently generate "today's" posts. Safe to call repeatedly: a unique
// (user_id, batch_date) row claims the day so it only generates once.
// `localDate` is the client's local YYYY-MM-DD so "a new day" respects the
// user's timezone.
export async function ensureTodaysPosts(
  localDate: string
): Promise<DailyRunResult> {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(localDate)
    ? localDate
    : new Date().toISOString().slice(0, 10);

  const supabase = createClient();

  // 1) Claim the day. If it's already claimed (or schema missing), stop.
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase
      .from("daily_batches")
      .insert({ batch_date: date, ...(user_id ? { user_id } : {}) });
    if (error) {
      // Unique violation (already generated) or missing schema → nothing to do.
      return { created: 0, alreadyDone: true, date };
    }
  } else {
    if (store.dailyBatches.some((b) => b.batch_date === date)) {
      return { created: 0, alreadyDone: true, date };
    }
    store.dailyBatches.push({
      id: uid(),
      user_id: MOCK_USER,
      batch_date: date,
      created_at: new Date().toISOString(),
    });
  }

  // 2) Gather topics: top interests + active fixed daily topics.
  const [interests, dailyTopics] = await Promise.all([
    getInterests(),
    getDailyTopics(),
  ]);
  const topInterests = [...interests]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const jobs: {
    topic: string;
    related_interest_id: string | null;
    description: string | null;
  }[] = [];
  for (const i of topInterests)
    jobs.push({ topic: i.topic, related_interest_id: i.id, description: i.description });
  for (const t of dailyTopics.filter((t) => t.active))
    jobs.push({ topic: t.topic, related_interest_id: null, description: null });

  const capped = jobs.slice(0, DAILY_TOPIC_CAP);

  // 3) Generate a LinkedIn + X version for each topic and add to drafts.
  let created = 0;
  for (const job of capped) {
    for (const platform of ["linkedin", "x"] as Platform[]) {
      try {
        const generated = await generatePostDraft({
          topic: job.topic,
          interest: job.related_interest_id
            ? {
                id: job.related_interest_id,
                topic: job.topic,
                description: job.description,
              }
            : null,
          platform,
        });
        await insertDraft({
          content: generated.content,
          topic_tag: generated.topic_tag,
          platform,
          related_interest_id: job.related_interest_id,
        });
        created++;
      } catch {
        // Best-effort: skip a failed item, keep the rest of the batch.
      }
    }
  }

  revalidateAll();
  return { created, alreadyDone: false, date };
}

export async function updateDraft(
  id: string,
  input: Partial<Pick<PostDraft, "content" | "topic_tag" | "notes" | "scheduled_for">>
) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("post_drafts").update(input).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const d = store.drafts.find((x) => x.id === id);
    if (d) Object.assign(d, input);
  }
  revalidateAll();
}

export async function setDraftStatus(id: string, status: DraftStatus) {
  const supabase = createClient();
  if (supabase) {
    const patch: Partial<PostDraft> = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("post_drafts").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    // Note: the DB trigger bumps interest weight on publish.
  } else {
    const d = store.drafts.find((x) => x.id === id);
    if (d) {
      const wasPublished = d.status === "published";
      d.status = status;
      if (status === "published") {
        d.published_at = new Date().toISOString();
        // Mirror the DB trigger: bump related interest weight on first publish.
        if (!wasPublished && d.related_interest_id) {
          const interest = store.interests.find(
            (x) => x.id === d.related_interest_id
          );
          if (interest) interest.weight += 1;
        }
      }
    }
  }
  revalidateAll();
}

export async function scheduleDraft(id: string, scheduled_for: string | null) {
  await updateDraft(id, { scheduled_for });
}

export async function publishDraft(id: string, notes?: string | null) {
  if (typeof notes === "string") {
    await updateDraft(id, { notes });
  }
  await setDraftStatus(id, "published");
}

export async function deleteDraft(id: string) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("post_drafts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    store.drafts = store.drafts.filter((x) => x.id !== id);
  }
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Engagement logs
// ---------------------------------------------------------------------------
export async function createEngagement(input: {
  post_url?: string | null;
  post_summary: string;
  interaction_type: InteractionType;
  related_interest_id?: string | null;
  new_interest_topic?: string | null;
}) {
  let related_interest_id = input.related_interest_id ?? null;

  // Optionally create a brand-new interest inline.
  if (input.new_interest_topic && input.new_interest_topic.trim()) {
    const supabase = createClient();
    if (supabase) {
      const user_id = await getUserId();
      const { data, error } = await supabase
        .from("interests")
        .insert({
          topic: input.new_interest_topic.trim(),
          source: "manual",
          weight: 1,
          ...(user_id ? { user_id } : {}),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      related_interest_id = data.id;
    } else {
      const newInterest: Interest = {
        id: uid(),
        user_id: MOCK_USER,
        topic: input.new_interest_topic.trim(),
        description: null,
        weight: 1,
        source: "manual",
        created_at: new Date().toISOString(),
      };
      store.interests.push(newInterest);
      related_interest_id = newInterest.id;
    }
  }

  const supabase = createClient();
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase.from("engagement_logs").insert({
      post_url: input.post_url ?? null,
      post_summary: input.post_summary,
      interaction_type: input.interaction_type,
      related_interest_id,
      ...(user_id ? { user_id } : {}),
    });
    if (error) throw new Error(error.message);
  } else {
    const log: EngagementLog = {
      id: uid(),
      user_id: MOCK_USER,
      post_url: input.post_url ?? null,
      post_summary: input.post_summary,
      interaction_type: input.interaction_type,
      related_interest_id,
      created_at: new Date().toISOString(),
    };
    store.engagements.unshift(log);
  }
  revalidateAll();
}

export async function deleteEngagement(id: string) {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from("engagement_logs").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    store.engagements = store.engagements.filter((x) => x.id !== id);
  }
  revalidateAll();
}
