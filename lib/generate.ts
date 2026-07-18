// generatePostDraft() — PLACEHOLDER
//
// This is where AI generation will be wired up later (e.g. an Anthropic /
// OpenAI call that takes the user's writing voice + content pillars + top
// interests and returns a LinkedIn-ready draft).
//
// For now it returns realistic mock content so the whole product is usable
// end-to-end. Keep the signature stable when you swap in a real model call.

import type { Interest } from "@/types/database";

export interface GenerateInput {
  topic: string;
  interest?: Pick<Interest, "id" | "topic" | "description"> | null;
  // Later: voice notes + content pillars to steer tone.
  voice?: string;
}

export interface GeneratedDraft {
  content: string;
  topic_tag: string;
}

const HOOKS = [
  "Most advice about {topic} skips the part that actually works.",
  "Unpopular opinion about {topic}:",
  "I changed my mind about {topic} this year. Here's why.",
  "The hard truth about {topic} nobody puts on a slide:",
  "{topic} isn't a strategy problem. It's a consistency problem.",
];

const BODIES = [
  "We stopped chasing the big swing and picked one small workflow. Boring? Yes. It's also the only thing that compounded.",
  "The teams that win here aren't smarter. They just ship the unglamorous version every single week.",
  "Everyone wants the framework. Almost nobody wants the reps. The reps are the framework.",
  "Specificity is the whole game. The moment your post could belong to anyone, it belongs to no one.",
  "Start with the outcome your audience feels on a Tuesday, not the feature you're proud of.",
];

const CTAS = [
  "What's the smallest version of this you could try this week?",
  "Curious how others are approaching this — what's worked for you?",
  "Save this for the next time you're staring at a blank page.",
  "Tell me I'm wrong. I'll bring the receipts.",
  "What would you add?",
];

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

/**
 * Returns a realistic mock LinkedIn draft for a topic.
 * Swap the body of this function for a real model call when ready.
 */
export async function generatePostDraft(
  input: GenerateInput
): Promise<GeneratedDraft> {
  // Simulate network latency so loading states are visible.
  await new Promise((r) => setTimeout(r, 600));

  const seed = Math.floor(Math.random() * 1000);
  const topic = input.topic.trim() || "your topic";

  const hook = pick(HOOKS, seed).replace(/\{topic\}/g, topic);
  const body = pick(BODIES, seed + 1);
  const cta = pick(CTAS, seed + 2);

  const content = `${hook}\n\n${body}\n\n${cta}`;

  return {
    content,
    topic_tag: input.interest?.topic ?? topic,
  };
}
