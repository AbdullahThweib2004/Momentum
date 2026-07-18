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
  aiGtm: "10000000-0000-0000-0000-000000000001",
  contentOps: "10000000-0000-0000-0000-000000000002",
  aiHealth: "10000000-0000-0000-0000-000000000003",
  devMktg: "10000000-0000-0000-0000-000000000004",
  founder: "10000000-0000-0000-0000-000000000005",
  community: "10000000-0000-0000-0000-000000000006",
  analytics: "10000000-0000-0000-0000-000000000007",
  positioning: "10000000-0000-0000-0000-000000000008",
};

interface MockStore {
  interests: Interest[];
  drafts: PostDraft[];
  engagements: EngagementLog[];
}

function seed(): MockStore {
  const interests: Interest[] = [
    { id: I.aiGtm, user_id: MOCK_USER, topic: "AI in Go-To-Market", description: "How AI is reshaping demand gen, sales enablement and lifecycle marketing.", weight: 7, source: "derived_from_publish", created_at: daysAgo(42) },
    { id: I.contentOps, user_id: MOCK_USER, topic: "Content Operations", description: "Scaling a content engine: briefs, repurposing, and editorial systems.", weight: 5, source: "derived_from_publish", created_at: daysAgo(38) },
    { id: I.aiHealth, user_id: MOCK_USER, topic: "AI in Healthcare", description: "Practical, compliant applications of AI across clinical and payer workflows.", weight: 4, source: "manual", created_at: daysAgo(30) },
    { id: I.devMktg, user_id: MOCK_USER, topic: "Developer Marketing", description: "Reaching technical audiences with docs-first, low-hype content.", weight: 3, source: "manual", created_at: daysAgo(26) },
    { id: I.founder, user_id: MOCK_USER, topic: "Founder-Led Content", description: "Helping founders build a credible, consistent voice on LinkedIn.", weight: 6, source: "derived_from_publish", created_at: daysAgo(24) },
    { id: I.community, user_id: MOCK_USER, topic: "Community-Led Growth", description: "Turning an audience into a compounding distribution channel.", weight: 2, source: "manual", created_at: daysAgo(20) },
    { id: I.analytics, user_id: MOCK_USER, topic: "Marketing Analytics", description: "Attribution, pipeline influence, and proving content ROI.", weight: 3, source: "manual", created_at: daysAgo(16) },
    { id: I.positioning, user_id: MOCK_USER, topic: "Positioning & Messaging", description: "Sharper category narratives that make buyers care.", weight: 4, source: "manual", created_at: daysAgo(12) },
  ];

  const drafts: PostDraft[] = [
    { id: uid(), user_id: MOCK_USER, content: `Most "AI in marketing" advice skips the boring part that actually works.\n\nWe didn't start with a moonshot. We started with one workflow: turning every closed-won call into three lifecycle emails.\n\n- 40% less time from call → nurture\n- 2 extra touchpoints per deal\n- 0 new headcount\n\nAI didn't replace the marketer. It removed the blank page.\n\nWhat's the smallest workflow you could hand to AI this week?`, topic_tag: "AI in Go-To-Market", related_interest_id: I.aiGtm, status: "published", scheduled_for: null, published_at: daysAgo(2), notes: "Led with the contrarian hook. Posted 8:10am, strong comment section.", created_at: daysAgo(5) },
    { id: uid(), user_id: MOCK_USER, content: `Your content engine isn't slow because people are lazy.\n\nIt's slow because every asset starts from scratch.\n\nThe fix that changed everything for us: a "source of truth" doc per launch. One narrative, then 12 derivatives — posts, emails, a webinar outline, sales one-pagers.\n\nWrite once. Distribute everywhere.\n\nHow many net-new docs did your team write last week that could have been derivatives?`, topic_tag: "Content Operations", related_interest_id: I.contentOps, status: "published", scheduled_for: null, published_at: daysAgo(6), notes: "Repurposing angle always performs. Tagged two teammates.", created_at: daysAgo(9) },
    { id: uid(), user_id: MOCK_USER, content: `A founder asked me: "How do I sound credible on LinkedIn without sounding like a press release?"\n\nMy answer: stop announcing. Start noticing.\n\nNobody remembers your funding post. They remember the small, specific observation only you could have made from inside the work.\n\nShip the observation. The credibility follows.`, topic_tag: "Founder-Led Content", related_interest_id: I.founder, status: "published", scheduled_for: null, published_at: daysAgo(11), notes: "Short-form, high saves. Good replies from two founders.", created_at: daysAgo(13) },
    { id: uid(), user_id: MOCK_USER, content: `AI in healthcare doesn't fail on the model. It fails on the handoff.\n\nThe demo that impresses a conference rarely survives contact with a Tuesday afternoon in a real clinic — where the win is 90 seconds saved per chart, not a magic diagnosis.\n\nBuild for the workflow, not the keynote.`, topic_tag: "AI in Healthcare", related_interest_id: I.aiHealth, status: "approved", scheduled_for: daysAhead(2), published_at: null, notes: null, created_at: daysAgo(3) },
    { id: uid(), user_id: MOCK_USER, content: `Developer marketing tip nobody wants to hear:\n\nYour best "campaign" is a better quickstart.\n\nWe cut our time-to-first-call from 22 minutes to 6. Signups didn't 10x. But activation did — and activation is the only number the board actually felt.\n\nDocs are marketing. Treat them like it.`, topic_tag: "Developer Marketing", related_interest_id: I.devMktg, status: "approved", scheduled_for: daysAhead(4), published_at: null, notes: null, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, content: `Attribution debates are usually a proxy for a trust problem.\n\nWhen leadership trusts marketing, "influenced pipeline" is enough. When they don't, no dashboard will save you.\n\nSo yes — fix the model. But first, fix the relationship.`, topic_tag: "Marketing Analytics", related_interest_id: I.analytics, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, content: `"We do community-led growth" often means "we have a Slack nobody opens."\n\nCommunity isn't a channel you launch. It's a byproduct of being consistently useful in public.\n\nStart by showing up in 3 conversations a day you weren't invited to. That's the whole strategy for month one.`, topic_tag: "Community-Led Growth", related_interest_id: I.community, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, content: `Positioning is not your tagline.\n\nIt's the sentence a customer says to a colleague when you're not in the room.\n\nIf you don't know that sentence, you don't have positioning — you have hope.\n\nGo ask five customers this week. Write down the exact words.`, topic_tag: "Positioning & Messaging", related_interest_id: I.positioning, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: hoursAgo(4) },
    { id: uid(), user_id: MOCK_USER, content: `The AI feature you shipped is not the story.\n\nThe hour it gives back is.\n\nStop selling "powered by AI." Start selling the Tuesday afternoon your customer gets back. Buyers don't adopt technology. They adopt outcomes.`, topic_tag: "AI in Go-To-Market", related_interest_id: I.aiGtm, status: "approved", scheduled_for: daysAhead(1), published_at: null, notes: null, created_at: hoursAgo(18) },
    { id: uid(), user_id: MOCK_USER, content: `Hot take: most "thought leadership" is just leadership avoiding thought.\n\nIf your post could have been written by any exec at any company in your category, it isn't leadership. It's wallpaper.\n\nSpecificity is the whole game.`, topic_tag: "Founder-Led Content", related_interest_id: I.founder, status: "rejected", scheduled_for: null, published_at: null, notes: "Too snarky — didn't match my voice. Might revisit the specificity point on its own.", created_at: daysAgo(7) },
    { id: uid(), user_id: MOCK_USER, content: `Content operations checklist we run before any launch:\n\n1. One narrative doc, approved\n2. Derivative map (who ships what, by when)\n3. A single tracking convention\n4. A retro on the calendar BEFORE launch day\n\nBoring? Yes. That's why it works.`, topic_tag: "Content Operations", related_interest_id: I.contentOps, status: "draft", scheduled_for: null, published_at: null, notes: null, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, content: `AI won't take your marketing job.\n\nBut it will absolutely take the 6 hours a week you spend reformatting things.\n\nSpend those 6 hours on the two things AI still can't do: original point of view, and real customer conversations.`, topic_tag: "AI in Go-To-Market", related_interest_id: I.aiGtm, status: "published", scheduled_for: null, published_at: daysAgo(19), notes: "Reassuring-but-honest framing. Great save rate.", created_at: daysAgo(22) },
    { id: uid(), user_id: MOCK_USER, content: `Nobody buys because your messaging is "clever."\n\nThey buy because, for one sentence, they felt understood.\n\nRe-read your homepage. Does it describe your product, or your customer's Tuesday?`, topic_tag: "Positioning & Messaging", related_interest_id: I.positioning, status: "approved", scheduled_for: daysAhead(3), published_at: null, notes: null, created_at: hoursAgo(10) },
    { id: uid(), user_id: MOCK_USER, content: `The best marketing analytics dashboard I ever built had one number on it: pipeline created this week. Everything else was a click away. Focus is a design decision.`, topic_tag: "Marketing Analytics", related_interest_id: I.analytics, status: "published", scheduled_for: null, published_at: daysAgo(26), notes: "Simple, opinionated. Solid reach.", created_at: daysAgo(28) },
    { id: uid(), user_id: MOCK_USER, content: `Developer marketing is a trust business. You earn a technical audience one accurate sentence at a time — and lose them with one bit of hype.`, topic_tag: "Developer Marketing", related_interest_id: I.devMktg, status: "published", scheduled_for: null, published_at: daysAgo(16), notes: "Short. Landed well with eng-adjacent folks.", created_at: daysAgo(18) },
    { id: uid(), user_id: MOCK_USER, content: `Founder-led content works because people follow people, not logos. Your company page is a filing cabinet. You are the story.`, topic_tag: "Founder-Led Content", related_interest_id: I.founder, status: "published", scheduled_for: null, published_at: daysAgo(9), notes: "Reliable evergreen theme for me.", created_at: daysAgo(12) },
  ];

  const engagements: EngagementLog[] = [
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-ai-gtm-activity-1", post_summary: "A VP Marketing broke down how they use AI to draft first-pass nurture sequences from call transcripts.", interaction_type: "comment", related_interest_id: I.aiGtm, created_at: hoursAgo(2) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-content-ops-activity-2", post_summary: "Great thread on building a derivative map so one launch narrative becomes 12 assets.", interaction_type: "like", related_interest_id: I.contentOps, created_at: daysAgo(1) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Founder shared a candid post about posting consistency beating virality over 12 months.", interaction_type: "like", related_interest_id: I.founder, created_at: daysAgo(2) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-healthcare-activity-3", post_summary: "Clinical informaticist explained why AI scribe adoption lives or dies on the EHR handoff.", interaction_type: "comment", related_interest_id: I.aiHealth, created_at: daysAgo(3) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-devmktg-activity-4", post_summary: "Post arguing that a better quickstart outperforms most paid dev campaigns.", interaction_type: "share", related_interest_id: I.devMktg, created_at: daysAgo(5) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Someone pushed back on attribution theater — said trust matters more than the model. Saved it.", interaction_type: "like", related_interest_id: I.analytics, created_at: daysAgo(6) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-positioning-activity-5", post_summary: "Sharp reminder that positioning is the sentence a customer says to a colleague.", interaction_type: "comment", related_interest_id: I.positioning, created_at: daysAgo(8) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Community builder shared a \"show up in 3 conversations a day\" routine for month one.", interaction_type: "like", related_interest_id: I.community, created_at: daysAgo(10) },
    { id: uid(), user_id: MOCK_USER, post_url: "https://www.linkedin.com/posts/example-ai-gtm-activity-6", post_summary: "Debate on whether \"powered by AI\" messaging helps or hurts conversion.", interaction_type: "other", related_interest_id: I.aiGtm, created_at: daysAgo(13) },
    { id: uid(), user_id: MOCK_USER, post_url: null, post_summary: "Enjoyed a post on selling the hour-back outcome instead of the AI feature.", interaction_type: "like", related_interest_id: I.aiGtm, created_at: daysAgo(16) },
  ];

  return { interests, drafts, engagements };
}

// Persist across HMR reloads in dev.
const globalForMock = globalThis as unknown as { __momentumMock?: MockStore };
export const store: MockStore = globalForMock.__momentumMock ?? seed();
if (!globalForMock.__momentumMock) globalForMock.__momentumMock = store;

export { MOCK_USER };
