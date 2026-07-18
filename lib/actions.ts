"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUserId } from "@/lib/supabase/server";
import { store, uid, MOCK_USER } from "@/lib/mock-data";
import { generatePostDraft } from "@/lib/generate";
import type {
  DraftStatus,
  EngagementLog,
  Interest,
  InteractionType,
  PostDraft,
} from "@/types/database";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/drafts");
  revalidatePath("/interests");
  revalidatePath("/engagement");
  revalidatePath("/history");
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
export async function generateDraft(input: {
  topic: string;
  related_interest_id?: string | null;
}) {
  const interest = input.related_interest_id
    ? store.interests.find((x) => x.id === input.related_interest_id) ?? null
    : null;

  const generated = await generatePostDraft({
    topic: input.topic,
    interest: interest
      ? { id: interest.id, topic: interest.topic, description: interest.description }
      : null,
  });

  const supabase = createClient();
  if (supabase) {
    const user_id = await getUserId();
    const { error } = await supabase.from("post_drafts").insert({
      content: generated.content,
      topic_tag: generated.topic_tag,
      related_interest_id: input.related_interest_id ?? null,
      status: "draft",
      ...(user_id ? { user_id } : {}),
    });
    if (error) throw new Error(error.message);
  } else {
    store.drafts.unshift({
      id: uid(),
      user_id: MOCK_USER,
      content: generated.content,
      topic_tag: generated.topic_tag,
      related_interest_id: input.related_interest_id ?? null,
      status: "draft",
      scheduled_for: null,
      published_at: null,
      notes: null,
      created_at: new Date().toISOString(),
    });
  }
  revalidateAll();
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
