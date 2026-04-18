---
title: 'A Few Months Into Team-Wide AI: What I''m Still Figuring Out'
description: 'A few months into team-wide AI use, here are the patterns I''m seeing — and the question that keeps coming back about what should stay consistent across the team.'
pubDate: 2026-04-18
author: 'Jongmin Lee'
tags: ['AI', 'Claude Code', 'Software Engineering']
draft: false
---

## The Question That Keeps Coming Back

Since the start of this year, my team has been using AI tools actively. Features that used to take a few days now wrap up a lot faster, and most of us reach for an AI assistant by default — for ideation, implementation, review, right up to merge.

This has been mostly good. But there's a question that keeps coming back to me, and I haven't found a clean answer yet:

*When a team uses AI this heavily, how much of the setup should be shared, and how much should be left to each individual?*

Outputs vary by how people phrase things, what they emphasize, what context they drop into the chat. That part is unavoidable. I'm not trying to control that. What I keep wondering about is the starting point — the common ground the AI is working from before anyone types anything.

This post is not an answer. It's a set of observations and a few things I'm still sorting through.

## What I've Been Seeing

I want to share three patterns I've run into over the past few months. Two of these I've seen in the wild; one is about me.

### Shared setup quietly breaking individual work

Teams tend to build up shared tooling — hooks that enforce validations, scripts that run before commits, and so on. Most of this is good. But if a piece of tooling only applies to a specific area and gets scoped globally, it can fire during unrelated work.

One version of this I've seen: a validation hook meant for a specific layer of the codebase ends up running during work that doesn't touch that layer at all. The AI session picks up that forced validation as part of its loop. It tries to respond to it, which triggers it again, and you end up watching the session talk to itself for a while.

The underlying problem isn't the hook. It's that shared tooling assumes a certain scope, and when that scope doesn't match what someone is actually doing, the AI's flow gets hijacked by a side effect no one explicitly chose.

### AI-driven feature work missing the whole-picture checks

When the end-to-end flow of a feature is driven mostly through AI — design, code, review, merge — the human habit of stepping back and running broader checks starts to fade.

Focusing on a single feature with an AI assistant isn't enough on its own. The overall build and testing layer has to exist as a separate thing that runs regardless of how the individual feature was developed. Without it, things that an experienced developer would have caught just from seeing the whole picture — basic build warnings, type-related issues, edge cases at integration points — start showing up only after merge.

The AI wasn't wrong in those moments, and neither was the person using it. It's just that the loop had narrowed around the feature, and no one was standing outside of it.

### My own dependence

This one is about me, not anyone else.

I've noticed that when I'm working with AI on a project decision or an idea, I tend to stay inside the conversation. I ask, I get an answer, I push on it a bit, I move on. The thing is, I know there are other angles I could approach the same question from — different tools, different people, or just sitting with it for a while — but I keep defaulting back to chat.

It's not that the AI's answers are bad. They're often good. But I can feel the muscle for *different* approaches getting a little weaker.

## What I Think Should Stay Consistent

Here's where my thinking has landed, for now.

The output of each session will differ. That's fine. What I think matters is that **the starting conditions are the same across the team** — the AI should begin with the same base of knowledge, the same rules, the same sense of what this project is.

What I mean by "starting conditions," concretely:

- **`CLAUDE.md`** — the project's shared context, conventions, what to avoid. Everyone cloning the repo should be working with the same version.
- **A shared workflow** — roughly how we go from idea to merge, what the AI is expected to do at each step and what it isn't.
- **Pre-commit hooks that force a review step** — not as a stylistic nudge, but as a gate that says "a human actually looked at this."
- **A common body of reference knowledge** — whatever the AI is pulling on (internal docs, past decisions, domain terms) should be the same set, not something each person has rebuilt on their own machine.

This isn't a bold claim. It's basically "make the baseline the same." But I think it's easy to skip, because each person's individual experience with AI feels fine and productive. The problem only shows up in the gaps between people.

## The Side Effect That Worries Me More

When I first started noticing the unevenness, I thought it was mostly about technical terms — people picking up a phrase from an AI response and using it without quite meaning it. That is happening. But it's not the part that worries me most.

The bigger pattern I've been seeing is about how we relate to each other's opinions.

If everyone is leaning heavily on AI, and the AI is confidently producing answers that sound well-reasoned, it's easy for individual positions to get more certain than they should be. "The AI said it, I agree with it, and it knows more than you do" isn't something anyone would say out loud. But it's the shape of what happens when peer feedback doesn't land the way it used to.

Feedback is the thing that's supposed to smooth out the unevenness between people. If we're not receiving it well, the baseline problems don't get corrected — they get defended.

## Where I'm Not Sure

I want to be honest about what I don't know.

The case for *less* standardization is real. Forcing a single setup on everyone can flatten the ways people approach problems. A uniform starting point might cost more than it saves, depending on the team's culture and what it values.

It's also possible that what I'm describing isn't really an AI problem. Maybe it's a communication problem that existed already, and AI just gave it a new surface to show up on. I can see the logic of that argument, even if my gut says the AI piece is doing real work here.

So I hold this pretty loosely. Every team has its own culture and its own policies. What I'd want on my team might be wrong for the team next to it.

## Where I'm At

I don't think any of this is settled. My team is going through this in real time, a few months in, not a few years in.

If you're somewhere in the same spot — actively using AI across a team, noticing some of the same weird patterns — I'd be genuinely curious how it's showing up for you. Am I the only one feeling the peer-feedback thing get weirder? Or does everyone's team have a hook that broke someone's AI session at some point?

I'll probably come back to this later with a different view. For now these are just the notes.
