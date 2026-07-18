-- Momentum — seed data
-- Persona: a B2B SaaS Product Marketing Lead who posts about AI, GTM and content.
--
-- RLS is scoped to auth.uid(), so seed rows must belong to a real auth user.
-- This script attaches all rows to the FIRST user in auth.users. Create a user
-- first (Supabase Dashboard → Authentication → Add user), then run this file.
--
-- Running it again is safe-ish for a demo: it clears the three tables for that
-- user before re-inserting. Remove the DELETE lines if you don't want that.

do $$
declare
  v_user uuid;
  i_ai_gtm         uuid;
  i_content_ops    uuid;
  i_ai_healthcare  uuid;
  i_dev_marketing  uuid;
  i_founder_led    uuid;
  i_community      uuid;
  i_analytics      uuid;
  i_positioning    uuid;
begin
  select id into v_user from auth.users order by created_at asc limit 1;

  if v_user is null then
    raise exception 'No user found in auth.users. Create a user before seeding.';
  end if;

  -- Clean slate for this user
  delete from public.post_drafts     where user_id = v_user;
  delete from public.engagement_logs where user_id = v_user;
  delete from public.interests       where user_id = v_user;

  -- ----------------------------------------------------------------------
  -- Interests (varying weights)
  -- ----------------------------------------------------------------------
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI in Go-To-Market', 'How AI is reshaping demand gen, sales enablement and lifecycle marketing.', 7, 'derived_from_publish', now() - interval '42 days')
    returning id into i_ai_gtm;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Content Operations', 'Scaling a content engine: briefs, repurposing, and editorial systems.', 5, 'derived_from_publish', now() - interval '38 days')
    returning id into i_content_ops;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI in Healthcare', 'Practical, compliant applications of AI across clinical and payer workflows.', 4, 'manual', now() - interval '30 days')
    returning id into i_ai_healthcare;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Developer Marketing', 'Reaching technical audiences with docs-first, low-hype content.', 3, 'manual', now() - interval '26 days')
    returning id into i_dev_marketing;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Founder-Led Content', 'Helping founders build a credible, consistent voice on LinkedIn.', 6, 'derived_from_publish', now() - interval '24 days')
    returning id into i_founder_led;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Community-Led Growth', 'Turning an audience into a compounding distribution channel.', 2, 'manual', now() - interval '20 days')
    returning id into i_community;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Marketing Analytics', 'Attribution, pipeline influence, and proving content ROI.', 3, 'manual', now() - interval '16 days')
    returning id into i_analytics;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Positioning & Messaging', 'Sharper category narratives that make buyers care.', 4, 'manual', now() - interval '12 days')
    returning id into i_positioning;

  -- ----------------------------------------------------------------------
  -- Post drafts (mix of statuses)
  -- ----------------------------------------------------------------------
  insert into public.post_drafts (user_id, content, topic_tag, related_interest_id, status, scheduled_for, published_at, notes, created_at) values
    (v_user,
     E'Most "AI in marketing" advice skips the boring part that actually works.\n\nWe didn''t start with a moonshot. We started with one workflow: turning every closed-won call into three lifecycle emails.\n\n- 40% less time from call → nurture\n- 2 extra touchpoints per deal\n- 0 new headcount\n\nAI didn''t replace the marketer. It removed the blank page.\n\nWhat''s the smallest workflow you could hand to AI this week?',
     'AI in Go-To-Market', i_ai_gtm, 'published', null, now() - interval '2 days', 'Led with the contrarian hook. Posted 8:10am, strong comment section.', now() - interval '5 days'),

    (v_user,
     E'Your content engine isn''t slow because people are lazy.\n\nIt''s slow because every asset starts from scratch.\n\nThe fix that changed everything for us: a "source of truth" doc per launch. One narrative, then 12 derivatives — posts, emails, a webinar outline, sales one-pagers.\n\nWrite once. Distribute everywhere.\n\nHow many net-new docs did your team write last week that could have been derivatives?',
     'Content Operations', i_content_ops, 'published', null, now() - interval '6 days', 'Repurposing angle always performs. Tagged two teammates.', now() - interval '9 days'),

    (v_user,
     E'A founder asked me: "How do I sound credible on LinkedIn without sounding like a press release?"\n\nMy answer: stop announcing. Start noticing.\n\nNobody remembers your funding post. They remember the small, specific observation only you could have made from inside the work.\n\nShip the observation. The credibility follows.',
     'Founder-Led Content', i_founder_led, 'published', null, now() - interval '11 days', 'Short-form, high saves. Good replies from two founders.', now() - interval '13 days'),

    (v_user,
     E'AI in healthcare doesn''t fail on the model. It fails on the handoff.\n\nThe demo that impresses a conference rarely survives contact with a Tuesday afternoon in a real clinic — where the win is 90 seconds saved per chart, not a magic diagnosis.\n\nBuild for the workflow, not the keynote.',
     'AI in Healthcare', i_ai_healthcare, 'approved', now() + interval '2 days', null, null, now() - interval '3 days'),

    (v_user,
     E'Developer marketing tip nobody wants to hear:\n\nYour best "campaign" is a better quickstart.\n\nWe cut our time-to-first-call from 22 minutes to 6. Signups didn''t 10x. But activation did — and activation is the only number the board actually felt.\n\nDocs are marketing. Treat them like it.',
     'Developer Marketing', i_dev_marketing, 'approved', now() + interval '4 days', null, null, now() - interval '2 days'),

    (v_user,
     E'Attribution debates are usually a proxy for a trust problem.\n\nWhen leadership trusts marketing, "influenced pipeline" is enough. When they don''t, no dashboard will save you.\n\nSo yes — fix the model. But first, fix the relationship.',
     'Marketing Analytics', i_analytics, 'draft', null, null, null, now() - interval '1 day'),

    (v_user,
     E'"We do community-led growth" often means "we have a Slack nobody opens."\n\nCommunity isn''t a channel you launch. It''s a byproduct of being consistently useful in public.\n\nStart by showing up in 3 conversations a day you weren''t invited to. That''s the whole strategy for month one.',
     'Community-Led Growth', i_community, 'draft', null, null, null, now() - interval '1 day'),

    (v_user,
     E'Positioning is not your tagline.\n\nIt''s the sentence a customer says to a colleague when you''re not in the room.\n\nIf you don''t know that sentence, you don''t have positioning — you have hope.\n\nGo ask five customers this week. Write down the exact words.',
     'Positioning & Messaging', i_positioning, 'draft', null, null, null, now() - interval '4 hours'),

    (v_user,
     E'The AI feature you shipped is not the story.\n\nThe hour it gives back is.\n\nStop selling "powered by AI." Start selling the Tuesday afternoon your customer gets back. Buyers don''t adopt technology. They adopt outcomes.',
     'AI in Go-To-Market', i_ai_gtm, 'approved', now() + interval '1 day', null, null, now() - interval '18 hours'),

    (v_user,
     E'Hot take: most "thought leadership" is just leadership avoiding thought.\n\nIf your post could have been written by any exec at any company in your category, it isn''t leadership. It''s wallpaper.\n\nSpecificity is the whole game.',
     'Founder-Led Content', i_founder_led, 'rejected', null, null, E'Too snarky — didn''t match my voice. Might revisit the specificity point on its own.', now() - interval '7 days'),

    (v_user,
     E'Content operations checklist we run before any launch:\n\n1. One narrative doc, approved\n2. Derivative map (who ships what, by when)\n3. A single tracking convention\n4. A retro on the calendar BEFORE launch day\n\nBoring? Yes. That''s why it works.',
     'Content Operations', i_content_ops, 'draft', null, null, null, now() - interval '2 days'),

    (v_user,
     E'AI won''t take your marketing job.\n\nBut it will absolutely take the 6 hours a week you spend reformatting things.\n\nSpend those 6 hours on the two things AI still can''t do: original point of view, and real customer conversations.',
     'AI in Go-To-Market', i_ai_gtm, 'published', null, now() - interval '19 days', 'Reassuring-but-honest framing. Great save rate.', now() - interval '22 days'),

    (v_user,
     E'Nobody buys because your messaging is "clever."\n\nThey buy because, for one sentence, they felt understood.\n\nRe-read your homepage. Does it describe your product, or your customer''s Tuesday?',
     'Positioning & Messaging', i_positioning, 'approved', now() + interval '3 days', null, null, now() - interval '10 hours');

  -- ----------------------------------------------------------------------
  -- Extra published-history rows (spread across the last month for charts)
  -- ----------------------------------------------------------------------
  insert into public.post_drafts (user_id, content, topic_tag, related_interest_id, status, published_at, notes, created_at) values
    (v_user,
     E'The best marketing analytics dashboard I ever built had one number on it: pipeline created this week. Everything else was a click away. Focus is a design decision.',
     'Marketing Analytics', i_analytics, 'published', now() - interval '26 days', 'Simple, opinionated. Solid reach.', now() - interval '28 days'),
    (v_user,
     E'Developer marketing is a trust business. You earn a technical audience one accurate sentence at a time — and lose them with one bit of hype.',
     'Developer Marketing', i_dev_marketing, 'published', now() - interval '16 days', 'Short. Landed well with eng-adjacent folks.', now() - interval '18 days'),
    (v_user,
     E'Founder-led content works because people follow people, not logos. Your company page is a filing cabinet. You are the story.',
     'Founder-Led Content', i_founder_led, 'published', now() - interval '9 days', 'Reliable evergreen theme for me.', now() - interval '12 days');

  -- ----------------------------------------------------------------------
  -- Engagement logs (most recent first when queried)
  -- ----------------------------------------------------------------------
  insert into public.engagement_logs (user_id, post_url, post_summary, interaction_type, related_interest_id, created_at) values
    (v_user, 'https://www.linkedin.com/posts/example-ai-gtm-activity-1', 'A VP Marketing broke down how they use AI to draft first-pass nurture sequences from call transcripts.', 'comment', i_ai_gtm, now() - interval '2 hours'),
    (v_user, 'https://www.linkedin.com/posts/example-content-ops-activity-2', 'Great thread on building a derivative map so one launch narrative becomes 12 assets.', 'like', i_content_ops, now() - interval '1 day'),
    (v_user, null, 'Founder shared a candid post about posting consistency beating virality over 12 months.', 'like', i_founder_led, now() - interval '2 days'),
    (v_user, 'https://www.linkedin.com/posts/example-healthcare-activity-3', 'Clinical informaticist explained why AI scribe adoption lives or dies on the EHR handoff.', 'comment', i_ai_healthcare, now() - interval '3 days'),
    (v_user, 'https://www.linkedin.com/posts/example-devmktg-activity-4', 'Post arguing that a better quickstart outperforms most paid dev campaigns.', 'share', i_dev_marketing, now() - interval '5 days'),
    (v_user, null, 'Someone pushed back on attribution theater — said trust matters more than the model. Saved it.', 'like', i_analytics, now() - interval '6 days'),
    (v_user, 'https://www.linkedin.com/posts/example-positioning-activity-5', 'Sharp reminder that positioning is the sentence a customer says to a colleague.', 'comment', i_positioning, now() - interval '8 days'),
    (v_user, null, 'Community builder shared a "show up in 3 conversations a day" routine for month one.', 'like', i_community, now() - interval '10 days'),
    (v_user, 'https://www.linkedin.com/posts/example-ai-gtm-activity-6', 'Debate on whether "powered by AI" messaging helps or hurts conversion.', 'other', i_ai_gtm, now() - interval '13 days'),
    (v_user, null, 'Enjoyed a post on selling the hour-back outcome instead of the AI feature.', 'like', i_ai_gtm, now() - interval '16 days');

  raise notice 'Momentum seed complete for user %', v_user;
end $$;
