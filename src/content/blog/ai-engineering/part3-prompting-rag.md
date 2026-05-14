---
title: 'AI Engineering Part 3: Prompt Engineering and RAG'
description: "Reading notes on chapters 5-6 of Chip Huyen's AI Engineering. The anatomy of a good prompt, core prompting techniques, retrieval-augmented generation, and when to reach for agents and tools."
pubDate: 2026-05-15
author: 'Jongmin Lee'
tags: ['AI', 'AI Engineering', 'LLM', 'RAG', 'Reading Notes']
featured: false
draft: true
---

Once you have evaluation in place, the main thing you do as an AI engineer is shape the input the model sees. The two highest-leverage levers are **prompting** and **retrieval-augmented generation (RAG)**. Chapters 5 and 6 of _AI Engineering_ cover these in depth. These notes pull out the patterns that actually matter in practice.

## Anatomy of a Prompt

A prompt isn't just the user's question. In production, a prompt is a structured payload with several parts:

| Component               | Purpose                                                              | Example                                                              |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **System message**      | Set role, behavior, constraints                                      | "You are a customer support agent. Be concise. Refuse off-topic."   |
| **Context**             | Retrieved or pasted information the model needs                     | Documents, previous turns, structured data                            |
| **Task description**    | What you want the model to do                                       | "Summarize the following ticket in two sentences."                   |
| **Examples (few-shot)** | Demonstrations of desired input-output behavior                     | 2-5 (input, output) pairs                                            |
| **Input**               | The actual user input                                                | The ticket text                                                       |
| **Output format hint**  | Specify structure (JSON schema, markdown, etc.)                     | "Respond with a JSON object containing `summary` and `priority`."    |

Most production prompts have all six. The model's behavior is shaped almost entirely by what's in these slots.

## Core Prompting Techniques

A short tour of techniques worth knowing:

### Zero-shot

Just describe the task and ask. Works surprisingly well for tasks the model has seen during training.

> _"Classify the sentiment of this review as positive, negative, or neutral. Review: {text}"_

When to use: simple tasks, prototyping, fast iteration.

### Few-shot

Include a handful of examples before the actual input.

> _"Classify the sentiment of these reviews._
>
> _Review: 'Loved it' → positive_
>
> _Review: 'Boring movie' → negative_
>
> _Review: '{text}' →"_

When to use: when the task has a specific format or style you want consistently. When zero-shot is inconsistent.

The number of shots matters less than the _quality_ of the examples. 2-3 well-chosen examples often beat 10 mediocre ones.

### Chain-of-thought (CoT)

Ask the model to think step by step before answering.

> _"Solve the math problem. Show your reasoning step by step, then give the final answer on the last line."_

When to use: multi-step reasoning, math, code, complex extraction. Especially helpful for smaller models that don't reason as fluently.

Modern reasoning-tuned models (o-series, Claude with extended thinking, Gemini Thinking) do this automatically — you don't need to ask. For other models, explicit CoT still helps.

### Structured output

Force the model to return parseable output.

> _"Respond with a JSON object: { \"summary\": string, \"priority\": \"low\" | \"medium\" | \"high\" }"_

Better yet: use the provider's structured-output / JSON-mode feature if available. They constrain the decoder to produce valid output, removing parsing errors.

When to use: any time the output feeds into other code.

### Role and persona

> _"You are a senior software engineer reviewing a junior's code. Be specific and direct."_

When to use: when behavior matters as much as content. Personas shape tone, depth, and refusal patterns. They don't make the model more accurate at the underlying task.

## Prompt Engineering as a System

Treating each prompt as a one-off string is a trap. Production prompts need:

- **Version control.** Prompt text in your repo, not in someone's notebook. Diff visible at review time.
- **Templated.** Use a template engine (or Jinja-style) so you can inject variables cleanly.
- **Evaluated.** Every change runs against your eval set. Don't ship vibes.
- **Documented.** What each prompt does and why. The next engineer (often future-you) won't remember.

The book argues that the "prompt engineer" as a separate role is mostly a transient phase. In mature teams, prompt engineering is a normal software skill, not a specialization.

## When You Need More Than Prompts: RAG

Prompts work when the model already knows enough to answer. They fail when:

- The answer depends on **private data** (your docs, your code, your tickets).
- The answer depends on **fresh data** (anything after the model's training cutoff).
- The answer depends on **large data** that doesn't fit in the context window.

**Retrieval-augmented generation (RAG)** fixes this by inserting relevant information into the prompt at inference time. The model isn't trained on your data — it's _shown_ your data when it needs it.

The basic flow:

1. **Index** your documents into a searchable store (vector DB, search engine, or both).
2. At query time, **retrieve** the documents most relevant to the user's question.
3. **Augment** the prompt with those documents.
4. **Generate** the response.

RAG is often the right answer when fine-tuning feels like overkill. It's cheaper, faster to iterate, and the source of truth stays in the documents — not baked into the model.

## The RAG Pipeline

A practical RAG system has more moving parts than the basic flow suggests:

| Stage             | What it does                                                                                            | What can go wrong                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Ingestion**     | Parse documents (PDFs, HTML, code), clean, chunk into passages                                          | Bad chunking — too small loses context, too big dilutes signal                          |
| **Embedding**     | Convert each chunk to a vector using an embedding model                                                 | Wrong embedding model — domain mismatch (e.g., general embeddings on legal text)        |
| **Indexing**      | Store vectors in a vector DB (Pinecone, Weaviate, pgvector, etc.) with metadata                         | Stale index — documents updated without re-embedding                                    |
| **Retrieval**     | Embed the query, find top-k nearest chunks. Optionally combine with keyword (BM25) search              | Pure vector search misses exact matches (names, codes). Pure keyword misses paraphrases |
| **Reranking**     | Run a heavier model on the top-k candidates to reorder them                                             | Skipping rerank — top-k from a fast retriever is rarely well-ordered                    |
| **Generation**    | Send the query + retrieved chunks to the LLM                                                            | Context overflow, or retrieved chunks contradicting each other                          |

Each stage has its own evaluation. The retrieval quality (was the answer in the retrieved chunks?) often matters more than the generation quality.

## Common RAG Pitfalls

- **Chunk size mismatch.** 256-token chunks work for some content, 1500-token chunks for others. Code, prose, and tables all behave differently. Tune.
- **Embedding model isn't domain-aware.** A general embedding model performs poorly on specialized vocabulary. Fine-tune embeddings or pick a domain-specific one.
- **Pure vector search.** Hybrid (vector + keyword) beats vector-only in most production setups, especially for queries with named entities.
- **No reranking.** Top-10 from a fast retriever is noisy. A cross-encoder reranker on those 10 dramatically improves precision.
- **Stale data.** RAG is only as good as the index freshness. Build a re-indexing pipeline.
- **Not surfacing sources.** Show users which documents the answer came from. Builds trust, reveals retrieval failures.

## Agents and Tool Use

RAG retrieves _information_ into the prompt. **Agents** let the model retrieve _actions_ — call APIs, search the web, run code, query databases. The model decides which tool to use, calls it, observes the result, and continues.

A typical agent loop:

1. Model receives the user's goal and a list of available tools (each with name, description, and JSON schema for arguments).
2. Model emits a tool call.
3. Application code runs the tool, returns the result.
4. Result is appended to the conversation.
5. Loop until the model says it's done.

Where agents shine:

- Tasks that require **fetching real-time data** (web search, database queries, current time).
- Tasks that require **multi-step interaction** with external systems.
- Tasks where the next step depends on the result of the previous step.

Where agents struggle:

- **Long horizons.** Errors compound. A 20-step agent has many chances to go off the rails.
- **Cost and latency.** Each step is a model call. Real-world agents are expensive to run at scale.
- **Debugging.** When something goes wrong, you have to trace through model decisions plus tool outputs. Observability matters.

The book is pragmatic here: simple chained prompts often beat agentic loops in production, because they're cheaper and easier to debug. Reach for an agent when the problem genuinely requires branching decisions or external information that varies per request.

## What I'm Taking from This

- **A prompt is a structured payload, not a string.** Treat its parts as separate concerns.
- **Few-shot beats zero-shot when behavior matters; CoT beats both for reasoning.** Pick by task shape.
- **RAG before fine-tuning** when the question is "the model doesn't know about my data." It's cheaper, faster, more debuggable.
- **Retrieval quality is the bottleneck in most RAG systems.** Spend time on chunking, hybrid search, and reranking before changing the generator.
- **Agents are a tool, not a default.** Simple pipelines first. Agentic loops only when the problem requires it.

The next part goes into fine-tuning — what it actually does, when it beats prompting + RAG, and the dataset engineering work that makes or breaks it.

---

**Further Reading:**

- [Chip Huyen, _AI Engineering_ (O'Reilly, 2024)](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Pinecone — RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)
