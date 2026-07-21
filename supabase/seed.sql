-- Momentum — seed data
-- Persona: a builder/developer who tries new AI tools and posts about them.
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
  i_ai_coding       uuid;
  i_ai_agents       uuid;
  i_llm_dev         uuid;
  i_ai_productivity uuid;
  i_open_models     uuid;
  i_gen_media       uuid;
  i_rag_search      uuid;
  i_ai_evals        uuid;
begin
  select id into v_user from auth.users order by created_at asc limit 1;

  if v_user is null then
    raise exception 'No user found in auth.users. Create a user before seeding.';
  end if;

  -- Clean slate for this user
  delete from public.post_drafts     where user_id = v_user;
  delete from public.engagement_logs where user_id = v_user;
  delete from public.daily_topics    where user_id = v_user;
  delete from public.daily_batches   where user_id = v_user;
  delete from public.interests       where user_id = v_user;

  -- ----------------------------------------------------------------------
  -- Interests (varying weights)
  -- ----------------------------------------------------------------------
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI Coding Assistants', 'Hands-on with Cursor, GitHub Copilot, Claude Code and the new agentic IDEs.', 7, 'derived_from_publish', now() - interval '42 days')
    returning id into i_ai_coding;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI Agents & Automation', 'Autonomous agents, tool use, and orchestration frameworks that actually ship.', 5, 'derived_from_publish', now() - interval '38 days')
    returning id into i_ai_agents;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Building with LLMs', 'Prompting, context engineering, and wiring model APIs into real products.', 4, 'manual', now() - interval '30 days')
    returning id into i_llm_dev;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI Productivity Tools', 'New tools for notes, meetings, and daily work — what earns a spot in the stack.', 3, 'manual', now() - interval '26 days')
    returning id into i_ai_productivity;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Open-Source AI Models', 'Running and fine-tuning open weights locally — Llama, Mistral, Qwen and friends.', 6, 'derived_from_publish', now() - interval '24 days')
    returning id into i_open_models;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'AI Image & Video Tools', 'Generative media tools for creators: image, video, and voice.', 2, 'manual', now() - interval '20 days')
    returning id into i_gen_media;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'RAG & Vector Search', 'Retrieval, embeddings, and vector databases for grounded AI apps.', 3, 'manual', now() - interval '16 days')
    returning id into i_rag_search;
  insert into public.interests (user_id, topic, description, weight, source, created_at) values
    (v_user, 'Evals & AI Reliability', 'Testing, evals, and guardrails that keep AI features trustworthy in production.', 4, 'manual', now() - interval '12 days')
    returning id into i_ai_evals;

  -- ----------------------------------------------------------------------
  -- Post drafts (mix of statuses)
  -- ----------------------------------------------------------------------
  insert into public.post_drafts (user_id, content, topic_tag, related_interest_id, status, scheduled_for, published_at, notes, created_at) values
    (v_user,
     E'Spent a week letting Cursor''s agent mode drive real feature work instead of autocomplete.\n\nThe surprise wasn''t speed. It was where the time moved.\n\n- 60% less time typing boilerplate\n- 2x more time reviewing diffs\n- 0 shortcuts on tests\n\nThe new tool didn''t replace the engineer. It moved the job from writing to reviewing.\n\nWhat''s the smallest task you''d hand to an AI coding agent this week?',
     'AI Coding Assistants', i_ai_coding, 'published', null, now() - interval '2 days', 'Led with the specific tool + numbers. Strong comment section from devs.', now() - interval '5 days'),

    (v_user,
     E'Everyone''s shipping "AI agents." Almost nobody''s shipping reliable ones.\n\nThe fix that changed everything for us: give the agent fewer tools, not more. Three sharp, well-described tools beat fifteen fuzzy ones every time.\n\nConstrain the surface. Watch the reliability climb.\n\nHow many tools does your agent actually need?',
     'AI Agents & Automation', i_ai_agents, 'published', null, now() - interval '6 days', 'Fewer-tools angle resonated. Tagged two builders.', now() - interval '9 days'),

    (v_user,
     E'A dev asked me: "How do I get consistent output from an LLM without babysitting every prompt?"\n\nMy answer: stop prompting harder. Start engineering context.\n\nNobody remembers your clever system prompt. They remember whether the model had the right examples and data in front of it.\n\nShip the context. The quality follows.',
     'Building with LLMs', i_llm_dev, 'published', null, now() - interval '11 days', 'Context > prompting framing. High saves.', now() - interval '13 days'),

    (v_user,
     E'Most new AI productivity tools fail on the handoff, not the demo.\n\nThe AI notetaker that dazzles in a launch video rarely survives contact with a Tuesday standup — where the win is a clean summary in your existing doc, not a magic second brain.\n\nBuild for the workflow people already have, not the one you wish they had.',
     'AI Productivity Tools', i_ai_productivity, 'approved', now() + interval '2 days', null, null, now() - interval '3 days'),

    (v_user,
     E'Underrated move for 2026: run a small open model locally before you reach for a frontier API.\n\nI moved our classification step to an 8B model on my own machine. Latency dropped, the bill went to zero, and privacy stopped being a slide in the security review.\n\nNot everything needs the biggest model. Match the tool to the task.',
     'Open-Source AI Models', i_open_models, 'approved', now() + interval '4 days', null, null, now() - interval '2 days'),

    (v_user,
     E'"Which vector database should I use?" is usually the wrong first question.\n\nIf your retrieval is bad, no database will save you. Fix the chunking and the embeddings first.\n\nSo yes — pick a vector store. But get the retrieval quality right before you argue about the infra.',
     'RAG & Vector Search', i_rag_search, 'draft', null, null, null, now() - interval '1 day'),

    (v_user,
     E'"We tested our AI feature" often means "we tried it twice and it looked fine."\n\nEvals aren''t a launch gate you run once. They''re a habit — a small, versioned test set you grow every time the model surprises you.\n\nStart with 20 real failure cases. That''s the whole strategy for month one.',
     'Evals & AI Reliability', i_ai_evals, 'draft', null, null, null, now() - interval '1 day'),

    (v_user,
     E'The AI video tool you''re impressed by is not the story.\n\nThe hour it gives back is.\n\nStop posting "look what AI made." Start showing the boring Tuesday task it removed. People don''t adopt novelty. They adopt time back.',
     'AI Image & Video Tools', i_gen_media, 'draft', null, null, null, now() - interval '4 hours'),

    (v_user,
     E'The AI feature you shipped is not the story.\n\nThe hour it gives back is.\n\nStop selling "powered by AI." Start selling the Tuesday afternoon your user gets back. People don''t adopt technology. They adopt outcomes.',
     'Building with LLMs', i_llm_dev, 'approved', now() + interval '1 day', null, null, now() - interval '18 hours'),

    (v_user,
     E'Hot take: most "AI agent" demos are just a for-loop avoiding responsibility.\n\nIf your agent can''t say "I''m not sure" and hand back to a human, it isn''t autonomous. It''s unaccountable.\n\nGraceful handoff is the whole game.',
     'AI Agents & Automation', i_ai_agents, 'rejected', null, null, E'Too snarky — didn''t match my voice. Might revisit the handoff point on its own.', now() - interval '7 days'),

    (v_user,
     E'My checklist before adopting any new AI tool:\n\n1. Does it fit a workflow I already have?\n2. What happens to my data?\n3. Can I export and leave in 5 minutes?\n4. Does it still help when the demo magic wears off?\n\nBoring questions. That''s why they work.',
     'AI Productivity Tools', i_ai_productivity, 'draft', null, null, null, now() - interval '2 days'),

    (v_user,
     E'AI coding assistants won''t take your engineering job.\n\nBut they will absolutely take the 6 hours a week you spend on boilerplate and glue code.\n\nSpend those 6 hours on the two things AI still can''t do: system design, and deciding what''s actually worth building.',
     'AI Coding Assistants', i_ai_coding, 'published', null, now() - interval '19 days', 'Reassuring-but-honest framing. Great save rate.', now() - interval '22 days'),

    (v_user,
     E'Nobody adopts your AI feature because the model is "state of the art."\n\nThey adopt it because, for one task, it just worked and got out of the way.\n\nRe-read your product. Does it show off the model, or quietly finish the user''s job?',
     'Building with LLMs', i_llm_dev, 'approved', now() + interval '3 days', null, null, now() - interval '10 hours');

  -- ----------------------------------------------------------------------
  -- Extra published-history rows (spread across the last month for charts)
  -- ----------------------------------------------------------------------
  insert into public.post_drafts (user_id, content, topic_tag, related_interest_id, status, published_at, notes, created_at) values
    (v_user,
     E'The best eval dashboard I ever built had one number on it: pass rate on our real failure set. Everything else was a click away. Focus is a design decision — even for AI.',
     'Evals & AI Reliability', i_ai_evals, 'published', now() - interval '26 days', 'Simple, opinionated. Solid reach.', now() - interval '28 days'),
    (v_user,
     E'Running open-source models is a trust business. You earn confidence one reproducible benchmark at a time — and lose it with one cherry-picked chart.',
     'Open-Source AI Models', i_open_models, 'published', now() - interval '16 days', 'Short. Landed well with the local-LLM crowd.', now() - interval '18 days'),
    (v_user,
     E'New AI tools spread because people trust people, not launch videos. The vendor''s benchmark is a billboard. Your honest week-one review is the story.',
     'Open-Source AI Models', i_open_models, 'published', now() - interval '9 days', 'Reliable evergreen theme for me.', now() - interval '12 days');

  -- ----------------------------------------------------------------------
  -- Engagement logs (most recent first when queried)
  -- ----------------------------------------------------------------------
  insert into public.engagement_logs (user_id, post_url, post_summary, interaction_type, related_interest_id, created_at) values
    (v_user, 'https://www.linkedin.com/posts/example-ai-coding-activity-1', 'A staff engineer broke down their Claude Code + Cursor workflow for shipping a feature end-to-end in a day.', 'comment', i_ai_coding, now() - interval '2 hours'),
    (v_user, 'https://www.linkedin.com/posts/example-agents-activity-2', 'Great thread on why giving an agent fewer, sharper tools beats a giant toolbelt.', 'like', i_ai_agents, now() - interval '1 day'),
    (v_user, null, 'Builder shared a candid post about context engineering mattering more than clever prompts.', 'like', i_llm_dev, now() - interval '2 days'),
    (v_user, 'https://www.linkedin.com/posts/example-openmodels-activity-3', 'Someone benchmarked a new open 8B model running locally and it held up shockingly well for classification.', 'comment', i_open_models, now() - interval '3 days'),
    (v_user, 'https://www.linkedin.com/posts/example-productivity-activity-4', 'Post arguing that an AI notetaker only wins if it drops the summary into the doc you already use.', 'share', i_ai_productivity, now() - interval '5 days'),
    (v_user, null, 'Someone pushed back on RAG hype — said fix your chunking before picking a vector DB. Saved it.', 'like', i_rag_search, now() - interval '6 days'),
    (v_user, 'https://www.linkedin.com/posts/example-evals-activity-5', 'Sharp reminder that evals are a habit, not a one-time launch gate — grow a real failure set.', 'comment', i_ai_evals, now() - interval '8 days'),
    (v_user, null, 'Creator demoed a new AI video tool and shared an honest "what still breaks" breakdown.', 'like', i_gen_media, now() - interval '10 days'),
    (v_user, 'https://www.linkedin.com/posts/example-agents-activity-6', 'Debate on whether autonomous agents should ever act without a human in the loop.', 'other', i_ai_agents, now() - interval '13 days'),
    (v_user, null, 'Enjoyed a post on selling the hour-back outcome instead of the shiny new model.', 'like', i_ai_coding, now() - interval '16 days');

  -- ----------------------------------------------------------------------
  -- X / Twitter example drafts (short form)
  -- ----------------------------------------------------------------------
  insert into public.post_drafts (user_id, content, topic_tag, platform, related_interest_id, status, created_at) values
    (v_user,
     E'Cursor''s agent mode didn''t make me faster.\n\nIt made me a reviewer instead of a typist.\n\nThe job moved. That''s the real story.',
     'AI Coding Assistants', 'x', i_ai_coding, 'draft', now() - interval '5 hours'),
    (v_user,
     E'Everyone''s shipping AI agents.\n\nAlmost nobody''s shipping reliable ones.\n\nGive the agent fewer tools, not more. Watch reliability climb.',
     'AI Agents & Automation', 'x', i_ai_agents, 'approved', now() - interval '20 hours'),
    (v_user,
     E'Stop prompting harder.\n\nStart engineering context.\n\nThe model doesn''t need a clever system prompt. It needs the right examples in front of it.',
     'Building with LLMs', 'x', i_llm_dev, 'published', now() - interval '4 days');

  update public.post_drafts set published_at = now() - interval '4 days'
    where user_id = v_user and platform = 'x' and status = 'published';

  -- ----------------------------------------------------------------------
  -- Daily generator topic list (fixed topics; the batch also uses interests)
  -- ----------------------------------------------------------------------
  insert into public.daily_topics (user_id, topic, active, created_at) values
    (v_user, 'A new AI tool I tried this week', true, now() - interval '10 days'),
    (v_user, 'A hard lesson from shipping with LLMs', true, now() - interval '10 days'),
    (v_user, 'One workflow AI actually saved me time on', true, now() - interval '10 days');

  raise notice 'Momentum seed complete for user %', v_user;
end $$;
