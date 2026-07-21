// generatePostDraft()
//
// Generates a LinkedIn post draft. It calls OpenRouter (an OpenAI-compatible AI
// gateway) when OPENROUTER_API_KEY is set, and automatically falls back to a
// built-in mock generator if the key is missing or the API errors / rate-limits
// — so this feature always returns something usable.
//
// Runs server-side only (invoked from the generateDraft server action), so the
// API key is never exposed to the browser.

import type { Interest, Platform } from "@/types/database";

export interface GenerateInput {
  topic: string;
  interest?: Pick<Interest, "id" | "topic" | "description"> | null;
  // Target platform — shapes length & tone. Defaults to LinkedIn.
  platform?: Platform;
  // Optional writing-voice guidance (from Settings) to steer tone.
  voice?: string;
}

export interface GeneratedDraft {
  content: string;
  topic_tag: string;
  platform: Platform;
  // Which engine produced it — handy for debugging / UI hints.
  source: "openrouter" | "mock";
  model?: string;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function models(): string[] {
  const raw =
    process.env.OPENROUTER_MODEL ??
    "google/gemma-4-26b-a4b-it:free,openai/gpt-oss-20b:free";
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

function buildPrompt(input: GenerateInput) {
  const platform: Platform = input.platform ?? "linkedin";
  const topic = input.topic.trim() || "a topic I care about";
  const context = input.interest?.description
    ? `\nContext on this topic: ${input.interest.description}`
    : "";
  const voice = input.voice?.trim()
    ? `\nMatch this writing voice: ${input.voice.trim()}`
    : "";

  if (platform === "x") {
    const system =
      "You are an expert X (Twitter) ghostwriter for a tech/AI audience. You " +
      "write punchy, specific posts with a strong hook. No hashtag spam, no " +
      "emojis unless they truly help, no hype, no threads. Output ONLY the " +
      "post text — no preamble, no quotation marks, no notes.";
    const user =
      `Write a single X post about "${topic}".${context}${voice}\n\n` +
      "Requirements:\n" +
      "- Strict: 280 characters or fewer.\n" +
      "- Punchy hook; 1–3 very short lines with line breaks.\n" +
      "- Concrete and specific; no generic platitudes.\n" +
      "- No hashtags unless one is genuinely natural.";
    return { system, user };
  }

  const system =
    "You are an expert LinkedIn ghostwriter. You write concise, human, " +
    "opinionated posts that earn engagement without sounding like a press " +
    "release. No hashtag spam, no emojis unless they truly help, no hype. " +
    "Output ONLY the post text — no preamble, no quotation marks, no notes.";

  const user =
    `Write a single LinkedIn post about "${topic}".${context}${voice}\n\n` +
    "Requirements:\n" +
    "- Open with a strong, specific hook on its own line.\n" +
    "- 3–6 short paragraphs or a tight list; use line breaks generously.\n" +
    "- Under ~1300 characters.\n" +
    "- End with a question or light call to engage.\n" +
    "- Be concrete and specific; avoid generic platitudes.";

  return { system, user };
}

// Strip common model artifacts: surrounding quotes, code fences, "Here's a post:"
// preambles, and any leaked <think> reasoning.
function cleanOutput(raw: string): string {
  let t = raw.trim();
  // Remove <think>…</think> reasoning blocks if a reasoning model leaks them.
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // If the model wrote reasoning then the post, keep text after the last such marker.
  const afterThink = t.split(/<\/think>/i).pop();
  if (afterThink) t = afterThink.trim();
  // Strip markdown code fences.
  t = t.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  // Strip a leading "Here's ...:" preamble line.
  t = t.replace(/^(here('|’)s|here is|sure[,!]?|draft:)[^\n]*\n+/i, "").trim();
  // Strip wrapping quotes.
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("“") && t.endsWith("”"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

async function callOpenRouter(
  input: GenerateInput,
  apiKey: string
): Promise<GeneratedDraft | null> {
  const platform: Platform = input.platform ?? "linkedin";
  const { system, user } = buildPrompt(input);

  for (const model of models()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Optional attribution headers recommended by OpenRouter.
          "HTTP-Referer": "https://momentum.app",
          "X-Title": "Momentum",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.85,
          max_tokens: platform === "x" ? 160 : 600,
        }),
      });

      if (!res.ok) {
        // 429 (rate limit) / 404 (model gone) / etc → try the next model.
        continue;
      }

      const json = await res.json();
      const content: string | undefined = json?.choices?.[0]?.message?.content;
      let cleaned = content ? cleanOutput(content) : "";
      // Enforce X's hard character limit.
      if (platform === "x" && cleaned.length > 280) {
        cleaned = cleaned.slice(0, 277).trimEnd() + "…";
      }
      if (cleaned.length > 20) {
        return {
          content: cleaned,
          topic_tag: input.interest?.topic ?? input.topic.trim(),
          platform,
          source: "openrouter",
          model,
        };
      }
      // Empty / too-short response → try the next model.
    } catch {
      // Network error / timeout / abort → try the next model.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

/**
 * Generate a post draft. Uses OpenRouter when configured; otherwise (or on any
 * failure) returns realistic mock content so the feature never breaks.
 */
export async function generatePostDraft(
  input: GenerateInput
): Promise<GeneratedDraft> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey) {
    const ai = await callOpenRouter(input, apiKey);
    if (ai) return ai;
    // else: fall through to the mock generator.
  }
  return mockDraft(input);
}

// ---------------------------------------------------------------------------
// Mock generator — used when no API key is set or the API is unavailable.
// ---------------------------------------------------------------------------
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

async function mockDraft(input: GenerateInput): Promise<GeneratedDraft> {
  // Simulate latency so loading states are visible.
  await new Promise((r) => setTimeout(r, 500));
  const platform: Platform = input.platform ?? "linkedin";
  const seed = Math.floor(Math.random() * 1000);
  const topic = input.topic.trim() || "your topic";
  const hook = pick(HOOKS, seed).replace(/\{topic\}/g, topic);

  const content =
    platform === "x"
      ? `${hook}\n\n${pick(BODIES, seed + 1)}`.slice(0, 280)
      : `${hook}\n\n${pick(BODIES, seed + 1)}\n\n${pick(CTAS, seed + 2)}`;

  return {
    content,
    topic_tag: input.interest?.topic ?? topic,
    platform,
    source: "mock",
  };
}
