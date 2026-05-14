---
title: 'AI Engineering Part 1: Foundation Models and the Rise of AI Engineering'
description: "Reading notes on chapters 1-2 of Chip Huyen's AI Engineering. What foundation models are, how they're built, why they generate inconsistent output, and where the AI engineering stack sits in modern software."
pubDate: 2026-05-13
author: 'Jongmin Lee'
tags: ['AI', 'AI Engineering', 'LLM', 'Software Engineering', 'Reading Notes']
featured: false
draft: false
---

> These are AI-assisted notes I'm building up as I work through Chip Huyen's _AI Engineering_ (O'Reilly, 2024). The goal is to capture the book's core ideas in a way that's useful even if you haven't read it. Treat these as a curated guide, not a substitute for the book itself.

Foundation models changed what software engineering looks like in a way that wasn't obvious from the outside. The first two chapters of _AI Engineering_ set up that shift: what these models actually are, how they get built, and why working with them feels different from any other kind of engineering. This part walks through those foundations.

## From ML Engineering to AI Engineering

Before foundation models, building anything with machine learning meant collecting your own training data, training your own model, and serving it. That's "ML engineering" — and it was specialized work, often siloed away from the rest of an engineering org.

Foundation models flipped the default. Most teams now build on top of pre-trained, general-purpose models — they don't train from scratch. The engineering skill shifted from _training a model_ to _using a model well_: choosing the right one, prompting it effectively, evaluating its outputs, and wiring it into a product.

Huyen calls this new discipline **AI engineering**, and argues it's distinct from ML engineering in three ways:

- **Where the model comes from.** AI engineering builds on top of existing foundation models. ML engineering typically builds models from data.
- **What the engineer's leverage is.** AI engineering puts more weight on application design — prompts, evaluation, retrieval — than on model training.
- **Who can do it.** AI engineering is approachable to software engineers without a PhD-style ML background. That's a much larger pool.

The shift isn't that ML engineering is gone. It still happens at labs building foundation models. But for the rest of the industry, the meaningful work is one layer up.

## What a Foundation Model Actually Is

The book's working definition: a **foundation model** is a model trained on broad data at scale that can be adapted to many downstream tasks.

Three properties matter:

1. **Generality.** It wasn't trained for a single task. It learned patterns that transfer to many tasks — summarization, translation, code generation, reasoning — without retraining.
2. **Scale.** Both the dataset (trillions of tokens) and the parameter count (billions to hundreds of billions) are large enough that capabilities _emerge_ — they appear without being directly trained for.
3. **Adaptability.** Through prompting, fine-tuning, or retrieval, the same base model can serve very different applications.

The word "foundation" is the key claim: this model is a base layer that other applications build on top of, in the same way OS kernels or databases are foundations for the software above them.

LLMs (large language models) are the most visible kind of foundation model, but the category also includes vision models (CLIP, Stable Diffusion), audio models (Whisper), and multimodal models (GPT-4o, Gemini).

## How Foundation Models Get Built

There are two distinct training phases. Each does something different, and understanding the difference helps with everything downstream.

### Pre-training

This is the "foundation" part. The model is trained on a massive corpus — web text, books, code, sometimes images and audio — using a self-supervised objective. For text models, the objective is usually **next-token prediction**: given a sequence of tokens, predict the next one.

Pre-training:

- Uses **enormous amounts of data and compute.** Frontier-model training runs cost tens to hundreds of millions of dollars.
- Produces a model with **broad world knowledge and language ability** but no specific task alignment.
- Is **mostly inaccessible** to application teams. You don't pre-train your own foundation model.

The training data is the model. Two consequences:

- **Data composition shapes behavior.** A model trained on a lot of code is better at code. A model trained mostly on English text is worse at Korean. Multilingual coverage is a deliberate choice, not a free lunch.
- **Data cutoff is a real boundary.** A model only knows what was in its training data, up to the cutoff date. Anything after — current events, new APIs, recent versions of libraries — needs to come from outside the model.

### Post-training

A pre-trained model can complete text, but it doesn't follow instructions well, doesn't refuse harmful requests, and has no notion of a conversation. **Post-training** is how a base model becomes the chat-tuned assistant you actually talk to.

Two main stages:

- **Supervised fine-tuning (SFT).** Train on examples of (prompt, ideal response) pairs. This teaches the model the _form_ of being helpful — answering questions, following instructions, returning structured responses.
- **Preference fine-tuning** (RLHF, DPO, and variants). Train on (prompt, better response, worse response) triples. Humans rank candidate responses; the model learns to prefer the ranked-better ones.

What this means in practice:

- The chat-tuned model is the pre-trained model plus a relatively thin layer of alignment work. The personality, refusals, and style come from post-training.
- Different post-training choices produce different "feels" across providers. GPT, Claude, and Gemini are trained on similar pre-training data scales but feel different — most of that comes from post-training.
- Post-training is what most labs iterate on between releases. Pre-training a frontier model is rare; rerunning the post-training is more frequent.

## Why Outputs Are Inconsistent

This is the section most worth internalizing.

Foundation models don't deterministically compute an answer. They generate output by sampling from a probability distribution over possible next tokens. That's the source of every counterintuitive thing about them.

### The sampling process

At each step:

1. The model takes the current sequence (your prompt plus what it's generated so far).
2. It produces a probability distribution over the entire vocabulary — every possible next token, with some probability.
3. A **sampling strategy** picks one token from that distribution.
4. The chosen token is appended; repeat.

The sampling strategy matters. Common knobs:

| Parameter         | What it does                                                                                                | Effect                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Temperature**   | Reshapes the probability distribution. Low = sharper (more confident picks). High = flatter (more variety). | T=0 ≈ deterministic. T=1 = original distribution. T>1 = more creative, less stable. |
| **Top-k**         | Only consider the top _k_ most likely tokens.                                                               | k=1 is greedy. k=50 lets some randomness in.                                        |
| **Top-p** (nucleus) | Consider the smallest set of tokens whose cumulative probability exceeds _p_.                               | Adapts to confidence: when the model is unsure, more tokens are in play.            |

You usually use top-p with temperature. Top-k is older but still appears in APIs.

### Why this matters for applications

- **Same prompt, different outputs.** Set temperature to 0 if you need reproducibility (evaluation, deterministic pipelines). Even then, some providers don't fully guarantee determinism due to floating-point variations across hardware.
- **Hallucination is a sampling artifact.** When the model is uncertain (low confidence across many tokens) and you let it generate freely, it picks plausible-sounding continuations that aren't grounded in any fact. The model isn't "lying"; it's doing exactly what it was trained to do — produce fluent text.
- **Tuning sampling won't fix factuality.** Lower temperature makes outputs more consistent, but if the underlying knowledge isn't there, you'll just consistently get the wrong answer. The right tool for factuality is retrieval (covered later in the book) or fine-tuning, not sampling knobs.

The mental model worth keeping: a foundation model is a **probabilistic generator** that produces fluent text, not a database that answers questions. Everything else about engineering with these models follows from that.

## The AI Engineering Stack

Huyen frames the work in three layers:

| Layer                       | What lives here                                                              | Who works on it                              |
| --------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| **Application development** | Prompt engineering, RAG, agents, evaluation, UX, product integration         | Most teams                                   |
| **Model development**       | Pre-training, fine-tuning, model architectures, training infrastructure      | Foundation model labs                        |
| **Infrastructure**          | Inference serving, GPU orchestration, observability, data pipelines          | Platform teams and ML infra companies        |

Most engineers entering AI engineering work in the **application layer**. That's where the leverage is — where products get built, where customer-facing decisions get made, and where small changes can dramatically shift outcomes.

The book's framing is that you don't have to understand pre-training to be effective at application development, but you should understand _enough_ about what's below you to make good decisions. The earlier sections — training, sampling — are exactly that minimum: knowing where the model came from and how it generates output.

## What I'm Taking from This

A few framings worth carrying forward:

- **Treat foundation models as probabilistic, not deterministic.** Every design decision should account for output variability.
- **The model is its training data plus its post-training.** When picking a model, knowing what it was trained on and how it was aligned matters more than benchmark scores in isolation.
- **Most engineering leverage is in the application layer.** Prompting, retrieval, evaluation, and product design move the needle more than tweaking the model.
- **Pre-training cutoffs are real.** Anything time-sensitive needs to be fed in from outside.

The next part will go into how to _evaluate_ these systems — which turns out to be the harder problem.

---

**Further Reading:**

- [Chip Huyen, _AI Engineering_ (O'Reilly, 2024)](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Lilian Weng — Prompt Engineering](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
