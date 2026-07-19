// In-memory mock data store.
//
// Used only when Supabase isn't configured. It's mutable at module scope so the
// demo supports create / edit / delete during a running session. State resets
// when the dev server restarts. Mirrors supabase/seed.sql.

import type {
  EngagementLog,
  Interest,
  PostDraft,
} from "@/types/database";

const MOCK_USER = "00000000-0000-0000-0000-000000000001";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}
function daysAhead(n: number) {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

export function uid() {
  // Lightweight unique id for mock rows.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Stable ids for interests so drafts/engagements can reference them.
const I = {
  aiCoding: "10000000-0000-0000-0000-000000000001",
  aiAgents: "10000000-0000-0000-0000-000000000002",
  llmDev: "10000000-0000-0000-0000-000000000003",
  aiProductivity: "10000000-0000-0000-0000-000000000004",
  openModels: "10000000-0000-0000-0000-000000000005",
  genMedia: "10000000-0000-0000-0000-000000000006",
  ragSearch: "10000000-0000-0000-0000-000000000007",
  aiEvals: "10000000-0000-0000-0000-000000000008",
};

interface MockStore {
  interests: Interest[];
  drafts: PostDraft[];
  engagements: EngagementLog[];
}

function seed(): MockStore {
  const interests: Interest[] = [
    { id: I.aiCoding, user_id: MOCK_USER, topic: "AI Coding Assistants", description: "Hands-on with Cursor, GitHub Copilot, Claude Code and the new agentic IDEs.", weight: 7, source: "derived_from_publish", created_at: daysAgo(42) },
    { id: I.aiAgents, user_id: MOCK_USER, topic: "AI Agents & Automation", description: "Autonomous agents, tool use, and orchestration frameworks that actually ship.", weight: 5, source: "derived_from_publish", created_at: daysAgo(38) },
    { id: I.llmDev, user_id: MOCK_USER, topic: "Building with LLMs", description: "Prompting, context engineering, and wiring model APIs into real products.", weight: 4, source: "manual", created_at: daysAgo(30) },
    { id: I.aiProductivity, user_id: MOCK_USER, topic: "AI Productivity Tools", description: "New tools for notes, meetings, and daily work — what earns a spot in the stack.", weight: 3, source: "manual", created_at: daysAgo(26) },
    { id: I.openModels, user_id: MOCK_USER, topic: "Open-Source AI Models", description: "Running and fine-tuning open weights locally — Llama, Mistral, Qwen and friends.", weight: 6, source: "derived_from_publish", created_at: daysAgo(24) },
    { id: I.genMedia, user_id: MOCK_USER, topic: "AI Image & Video Tools", description: "Generative media tools for creators: image, video, and voice.", weight: 2, source: "manual", created_at: daysAgo(20) },
    { id: I.ragSearch, user_id: MOCK_USER, topic: "RAG & Vector Search", description: "Retrieval, embeddings, and vector databases for grounded AI apps.", weight: 3, source: "manual", created_at: daysAgo(16) },
    { id: I.aiEvals, user_id: MOCK_USER, topic: "Evals & AI Reliability", description: "Testing, evals, and guardrails that keep AI features trustworthy in production.", weight: 4, source: "manual", created_at: daysAgo(12) },
  ];

  const drafts: PostDraft[] = [
    { id: uid(), user_id: MOCK_USER, content: `Spent a week letting Cursor's agent mode drive real feature work instead of autocomplete.\n\nThe surprise wasn't speed. It was where the time moved.\n\n- 60% less time typing boilerplate\n- 2x more time reviewing diffs\n- 0 shortcuts on tests\n\nThe new tool didn't replace the engineer. It moved the job from writing to reviewing.\n\nWhat's the smallest task you'd hand to an AI coding agent this week?`, topic_tag: "AI Coding Assistants", related_interest_id: I.aiCoding, status: "published", scheduled_for: null, published_at: daysAgo(2), notes: "Led with the specific tool + numbers. Strong comment section from devs.", created_at: daysAgo(5) },
    { id: uid(), user_id: MOCK_USER, content: `Everyone's shipping "AI agents." Almost nobody's shipping reliable ones.\n\nThe fix that changed everything for us: give the agent fewer tools, not more. Three sharp, well-described tools beat fifteen fuzzy ones every time.\n\nConstrain the surface. Watch the reliability climb.\n\nHow many tools does your agent actually need?`, topic_tag: "AI Agents & Automation", related_interest_id: I.aiAgents, status: "published", scheduled_for: null, published_at: daysAgo(6), notes: "Fewer-tools angle resonated. Tagged two builders.", created_at: daysAgo(9) },
    { id: uid(), user_id: MOCK_USER, content: `A dev asked me: "How do I get consistent output from an LLM without babysitting every prompt?"\n\nMy answer: stop prompting harder. Start engineering context.\n\nNobody remembers your clever system prompt. They remember whether the model had the right examples and data in front of it.\n\nShip the context. The quality follows.`, topic_tag: "Building with LLMs", related_interest_id: I.llmDev, status: "published", scheduled_for: null, published_at: daysAgo(11), notes: "Context > prompting framing. High saves.", created_at: daysAgo(13) },
    { id: uid(), user_id: MOCK_USER, content: `Most new AI productivity tools fail on the handoff, not the demo.\n\nThe AI notetaker that dazzles in a launch video rarely survives contact with a Tuesday standup — where the win is a clean summary in your existing doc, not a magic second brain.\n\nBuild for the workflow people already have, not the one you wish they had.`, topic_tag: "AI Productivity Tools", related_interest_id: I.aiProductivity, status: "approved", scheduled_for: daysAhead(2), published_at: null, notes: null, created_at: daysAgo(3) },
    { id: uid(), user_id: MOCK_USER, content: `Underrated move for 2026: run a small open model locally before you reach for a frontier API.\n\nI moved our classification step to an 8B model on my own machine. Latency dropped, the bill went to zero, and privacy stopped being a slide in the security review.\n\nNot everything needs the biggest model. Match the tool to the task.`, topic_tag: "Open-Source AI Models", related_interest_id: I.openModels, status: "approved", scheduled_for: daysAhead(4), published_at: null, notes: null, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, content: `"Which vector database should I use?" is usually the wrong first question.\n\nIf your retrieval is bad, no database will save you. Fix the chunking and the embeddings first.\n\nSo yes — pick a vector store. But get the retrieval quality right before you argue about the infra.`, topic_tag: "RAG & Vector Search", related_interest_id: I.ragSearch, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, content: `"We tested our AI feature" often means "we tried it twice and it looked fine."\n\nEvals aren't a launch gate you run once. They're a habit — a small, versioned test set you grow every time the model surprises you.\n\nStart with 20 real failure cases. That's the whole strategy for month one.`, topic_tag: "Evals & AI Reliability", related_interest_id: I.aiEvals, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, content: `The AI video tool you're impressed by is not the story.\n\nThe hour it gives back is.\n\nStop posting "look what AI made." Start showing the boring Tuesday task it removed. People don't adopt novelty. They adopt time back.`, topic_tag: "AI Image & Video Tools", related_interest_id: I.genMedia, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: hoursAgo(4) },
    { id: uid(), user_id: MOCK_USER, content: `The AI feature you shipped is not the story.\n\nThe hour it gives back is.\n\nStop selling "powered by AI." Start selling the Tuesday afternoon your user gets back. People don't adopt technology. They adopt outcomes.`, topic_tag: "Building with LLMs", related_interest_id: I.llmDev, status: "approved", scheduled_for: daysAhead(1), published_at: null, notes: null, created_at: hoursAgo(18) },
    { id: uid(), user_id: MOCK_USER, content: `Hot take: most "AI agent" demos are just a for-loop avoiding responsibility.\n\nIf your agent can't say "I'm not sure" and hand back to a human, it isn't autonomous. It's unaccountable.\n\nGraceful handoff is the whole game.`, topic_tag: "AI Agents & Automation", related_interest_id: I.aiAgents, status: "rejected", scheduled_for: null, published_at: null, notes: "Too snarky — didn't match my voice. Might revisit the handoff point on its own.", created_at: daysAgo(7) },
    { id: uid(), user_id: MOCK_USER, content: `My checklist before adopting any new AI tool:\n\n1. Does it fit a workflow I already have?\n2. What happens to my data?\n3. Can I export and leave in 5 minutes?\n4. Does it still help when the demo magic wears off?\n\nBoring questions. That's why they work.`, topic_tag: "AI Productivity Tools", related_interest_id: I.aiProductivity, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, content: `AI coding assistants won't take your engineering job.\n\nBut they will absolutely take the 6 hours a week you spend on boilerplate and glue code.\n\nSpend those 6 hours on the two things AI still can't do: system design, and deciding what's actually worth building.`, topic_tag: "AI Coding Assistants", related_interest_id: I.aiCoding, status: "published", scheduled_for: null, published_at: daysAgo(19), notes: "Reassuring-but-honest framing. Great save rate.", created_at: daysAgo(22) },
    { id: uid(), user_id: MOCK_USER, content: `Nobody adopts your AI feature because the model is "state of the art."\n\nThey adopt it because, for one task, it just worked and got out of the way.\n\nRe-read your product. Does it show off the model, or quietly finish the user's job?`, topic_tag: "Building with LLMs", related_interest_id: I.llmDev, status: "approved", scheduled_for: daysAhead(3), published_at: null, notes: null, created_at: hoursAgo(10) },
    { id: uid(), user_id: MOCK_USER, content: `The best eval dashboard I ever built had one number on it: pass rate on our real failure set. Everything else was a click away. Focus is a design decision — even for AI.`, topic_tag: "Evals & AI Reliability", related_interest_id: I.aiEvals, status: "published", scheduled_for: null, published_at: daysAgo(26), notes: "Simple, opinionated. Solid reach.", created_at: daysAgo(28) },
    { id: uid(), user_id: MOCK_USER, content: `Running open-source models is a trust business. You earn confidence one reproducible benchmark at a time — and lose it with one cherry-picked chart.`, topic_tag: "Open-Source AI Models", related_interest_id: I.openModels, status: "published", scheduled_for: null, published_at: daysAgo(16), notes: "Short. Landed well with the local-LLM crowd.", created_at: daysAgo(18) },
    { id: uid(), user_id: MOCK_USER, content: `New AI tools spread because people trust people, not launch videos. The vendor's benchmark is a billboard. Your honest week-one review is the story.`, topic_tag: "Open-Source AI Models", related_interest_id: I.openModels, status: "published", scheduled_for: null, published_at: daysAgo(9), notes: "Reliable evergreen theme for me.", created_at: daysAgo(12) },
  ];

  const engagements: EngagementLog[] = [
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-ai-coding-activity-1", post_summary: "A staff engineer broke down their Claude Code + Cursor workflow for shipping a feature end-to-end in a day.", interaction_type: "comment", related_interest_id: I.aiCoding, created_at: hoursAgo(2) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-agents-activity-2", post_summary: "Great thread on why giving an agent fewer, sharper tools beats a giant toolbelt.", interaction_type: "like", related_interest_id: I.aiAgents, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Builder shared a candid post about context engineering mattering more than clever prompts.", interaction_type: "like", related_interest_id: I.llmDev, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-openmodels-activity-3", post_summary: "Someone benchmarked a new open 8B model running locally and it held up shockingly well for classification.", interaction_type: "comment", related_interest_id: I.openModels, created_at: daysAgo(3) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-productivity-activity-4", post_summary: "Post arguing that an AI notetaker only wins if it drops the summary into the doc you already use.", interaction_type: "share", related_interest_id: I.aiProductivity, created_at: daysAgo(5) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Someone pushed back on RAG hype — said fix your chunking before picking a vector DB. Saved it.", interaction_type: "like", related_interest_id: I.ragSearch, created_at: daysAgo(6) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-evals-activity-5", post_summary: "Sharp reminder that evals are a habit, not a one-time launch gate — grow a real failure set.", interaction_type: "comment", related_interest_id: I.aiEvals, created_at: daysAgo(8) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Creator demoed a new AI video tool and shared an honest \"what still breaks\" breakdown.", interaction_type: "like", related_interest_id: I.genMedia, created_at: daysAgo(10) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-agents-activity-6", post_summary: "Debate on whether autonomous agents should ever act without a human in the loop.", interaction_type: "other", related_interest_id: I.aiAgents, created_at: daysAgo(13) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Enjoyed a post on selling the hour-back outcome instead of the shiny new model.", interaction_type: "like", related_interest_id: I.aiCoding, created_at: daysAgo(16) },
  ];

  return { interests, drafts, engagements };
}

// Persist across HMR reloads in dev.
const globalForMock = globalThis as unknown as { __momentumMock?: MockStore };
export const store: MockStore = globalForMock.__momentumMock ?? seed();
if (!globalForMock.__momentumMock) globalForMock.__momentumMock = store;

export { MOCK_USER };
