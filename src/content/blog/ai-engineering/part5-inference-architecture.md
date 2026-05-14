---
title: 'AI Engineering Part 5: Inference Optimization and Production Architecture'
description: "Reading notes on chapters 9-10 of Chip Huyen's AI Engineering. Why inference is expensive, optimization techniques (quantization, KV cache, batching, speculative decoding), and architecture patterns for production AI systems."
pubDate: 2026-05-17
author: 'Jongmin Lee'
tags: ['AI', 'AI Engineering', 'LLM', 'Inference', 'Reading Notes']
featured: false
draft: true
---

By the end of the book, the question shifts from "does it work" to "can we afford to ship it." Inference economics shape every product decision — what model to use, how to architect the system, how to balance quality against cost and latency. Chapters 9 and 10 cover both the technical optimizations and the broader architecture patterns. These notes pull out the parts that matter for application teams, not just infrastructure engineers.

## Why Inference Is Expensive

Foundation models are big. Even with optimizations, every token generated requires hundreds of billions of parameter multiplications. Three forces drive cost:

- **Memory.** Loading model weights and activations into GPU memory dominates. For a 70B parameter model in 16-bit precision, you need ~140 GB just to hold the weights.
- **Compute.** Each token requires a forward pass through the model. Cost scales with model size and prompt length.
- **Latency.** Generation is sequential — token N depends on tokens 1 through N-1. You can't trivially parallelize within a single response.

The cost/latency/quality triangle:

- **Larger models** are higher quality but slower and more expensive.
- **Smaller models** are faster and cheaper but may not meet quality bars.
- **Optimizations** let you move along the curve — more quality per dollar — but they don't break the triangle.

Most AI engineering decisions are negotiating positions on this triangle. Understanding the techniques below helps you find better positions.

## Quantization

Reduce the precision used to store and compute model weights. Common levels:

| Precision  | Bytes per param | Memory for 7B model | Quality impact                                          |
| ---------- | --------------- | ------------------- | ------------------------------------------------------- |
| FP32       | 4               | 28 GB               | Reference                                               |
| FP16/BF16  | 2               | 14 GB               | Near-zero loss                                          |
| INT8       | 1               | 7 GB                | Small loss, acceptable for most apps                    |
| INT4       | 0.5             | 3.5 GB              | Noticeable but often acceptable quality loss            |
| INT2 / 1.58-bit | <0.25       | <2 GB               | Significant quality loss, useful for some narrow cases  |

Quantization can be applied:

- **Post-training (PTQ).** Take a trained model and quantize. Fastest path, sometimes lossy.
- **Quantization-aware training (QAT).** Train the model with quantization in mind, preserving quality better but at higher cost.

For application teams, the question is usually: pick a quantized version of a strong model rather than full-precision of a weaker model. INT8 inference of a 70B model often beats FP16 inference of a 13B model on the same task.

## The KV Cache (and How to Use It)

Transformer attention re-computes a lot if you're not careful. The **KV cache** stores keys and values from previous tokens so they don't need to be recomputed for the next token.

What this means for engineers:

- **Long prompts have a big upfront cost** (prefill phase) but generation is faster afterwards.
- **Subsequent generation tokens are cheap** because they only need to attend to existing cache entries.
- **Repeated prefixes can be cached across requests.** This is the basis for **prompt caching** features in modern provider APIs (Anthropic, OpenAI, Gemini).

Practical implications:

- **Put stable content at the start of the prompt.** System messages, retrieved documents, examples — anything reused across requests should be in the cacheable prefix.
- **Use prompt caching APIs aggressively** when available. It often cuts cost and latency by 50%+.
- **Cache reuse breaks when the prefix changes.** Tiny edits to the system prompt invalidate the cache for all subsequent requests.

The KV cache is one of the few places where you can dramatically improve cost _and_ latency without changing the model.

## Batching and Throughput

Single-request inference underuses the GPU. **Batching** runs many requests through the model together, sharing the matrix multiplications.

Two flavors matter:

- **Static batching.** Wait until N requests arrive, then process them together. Higher throughput, higher latency per request.
- **Continuous batching** (vLLM, Text Generation Inference). New requests can join an in-flight batch. Different requests can be at different generation stages. This is now the standard.

Why this matters for application teams: when you call a provider API, you're being served from continuously-batched inference. The provider's batch size and traffic shape affect your latency more than your individual prompt does.

Self-hosted note: if you're running your own inference, vLLM or similar serving engines are not optional. The throughput difference between continuous batching and naive serving is 10x or more.

## Speculative Decoding

Token generation is sequential, which limits parallelism. **Speculative decoding** breaks that constraint:

1. A small, fast "draft" model generates several candidate tokens.
2. The large "target" model verifies them in parallel (one forward pass).
3. The target accepts the prefix of the draft that matches what it would have generated, and corrects from there.

Net result: throughput goes up, often 2-3x, while output quality is identical to using the target model alone (the target is the final arbiter).

For application teams, this is mostly invisible — providers use it under the hood. Worth knowing because it explains why some models are faster than they "should" be given their size.

## Production Architecture Patterns

The book lays out several patterns that recur in production AI systems:

### Router

Use a cheap, fast model to classify the request, then dispatch to the right model or pipeline. Classifications like:

- "Simple FAQ" → small model, no retrieval
- "Complex reasoning" → large model with CoT
- "Code generation" → code-specialized model
- "Off-topic / refuse" → don't call any model

A well-tuned router can dramatically reduce cost while maintaining quality on the requests that need it.

### Cascade

Try a small model first. If its confidence is low (or its output fails a quality check), fall back to a larger model.

- Cheap most of the time.
- Quality stays high because the expensive model catches hard cases.
- Latency on hard cases is higher, but you can sometimes return the small-model answer fast while running the cascade in the background.

### Multi-step pipelines

Break complex tasks into smaller LLM calls, each focused on a specific subtask:

- Extract → Reason → Format
- Plan → Execute → Verify
- Retrieve → Synthesize → Cite

Each step has its own prompt, its own eval, and is independently debuggable. The trade-off: more latency, more chances for errors to cascade.

### Async and streaming

User-facing systems should stream output as it's generated. Time-to-first-token matters more than total latency for perceived speed. Backend pipelines that don't show output to users can batch and run async to optimize throughput instead.

## Observability and Feedback Loops

You can't operate an AI system blind. The book emphasizes building observability from day one:

- **Log everything.** Every request, every prompt, every response, every cost. You'll want this data for debugging, eval, and future fine-tuning.
- **Track quality signals.** Tie production user actions (retries, edits, copies, conversions) back to the requests that produced them.
- **Trace multi-step flows.** A bad final answer can come from any step. Without traces you're guessing.
- **Alert on distribution shift.** Input length, output length, refusal rate — any sudden change is worth investigating.
- **Close the loop.** Production data feeds eval set updates, prompt improvements, and the next round of fine-tuning.

The mature pattern: production traffic + observability becomes the training and evaluation source for the next iteration. Building an AI product is building a data flywheel.

## Cost-Latency-Quality Trade-offs

Concrete patterns the book lays out:

- **Pre-compute when possible.** If the input set is bounded (top 1000 product questions, all docs in a knowledge base), pre-compute embeddings, summaries, or even responses.
- **Cache aggressively.** Identical requests should never hit the model twice. Semantic-similar requests can be served from cache with a similarity threshold.
- **Right-size the model per request.** Not every user needs the biggest model. Most don't.
- **Budget latency by step.** A pipeline with 3 LLM calls has 3x the latency of one call. Either parallelize where possible, or use smaller models for steps that allow it.

## What I'm Taking from This

- **Inference cost is a first-class design constraint.** It shapes which models you can use, which architectures are viable, which features are economically feasible.
- **The KV cache and prompt caching are the highest-leverage optimizations** application teams can use without infrastructure work. Structure prompts to maximize cache hits.
- **Routers and cascades beat one-model-fits-all.** Multi-model systems serve real production traffic better than single models.
- **Observability is non-negotiable.** AI systems are too dynamic to run blind.
- **Production is a flywheel, not a launch.** Traffic feeds eval, eval feeds improvements, improvements ship, repeat.

This was the last section of the book in these notes. The throughline across all five parts: AI engineering is mostly _systems engineering_ around foundation models, not modeling itself. The model is the substrate; everything else — prompts, evaluation, retrieval, fine-tuning, optimization — is the engineering.

---

**Further Reading:**

- [Chip Huyen, _AI Engineering_ (O'Reilly, 2024)](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [vLLM — Continuous Batching for LLM Inference](https://docs.vllm.ai/en/latest/)
- [Anthropic — Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Hugging Face — Efficient Inference on a Single GPU](https://huggingface.co/docs/transformers/main/perf_infer_gpu_one)
