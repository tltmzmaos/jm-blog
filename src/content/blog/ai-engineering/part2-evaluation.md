---
title: 'AI Engineering Part 2: Evaluation Methodology and Evaluating AI Systems'
description: "Reading notes on chapters 3-4 of Chip Huyen's AI Engineering. Why evaluating AI systems is harder than traditional ML, the spectrum of methods, LLM-as-judge, and building reliable production evaluations."
pubDate: 2026-05-13
author: 'Jongmin Lee'
tags: ['AI', 'AI Engineering', 'LLM', 'Evaluation', 'Reading Notes']
featured: false
draft: true
---

> These are AI-assisted notes I'm building up as I work through Chip Huyen's _AI Engineering_ (O'Reilly, 2024). The goal is to capture the book's core ideas in a way that's useful even if you haven't read it. Treat these as a curated guide, not a substitute for the book itself.

If Part 1 was about what foundation models _are_, this part is about how to tell whether they're actually doing their job. Huyen spends two chapters on evaluation, which is unusual — and a strong signal that evaluation is the hardest part of building AI products. These notes cover both: the methodology (chapter 3) and the practical work of evaluating real systems (chapter 4).

## Why Evaluation Is Hard

Traditional software has a clean test idea: given input, the function should return _this_ output. You write `assertEqual(actual, expected)` and you're done. Traditional ML adds noise but stays close to this — you have ground-truth labels and standard metrics (accuracy, F1, RMSE).

Foundation models break that. The space of valid outputs for a prompt is _huge_. "Summarize this article" has thousands of acceptable summaries. There's no single correct answer to compare against.

Three properties make evaluation hard:

- **Open-ended outputs.** There's no exact-match check. A response can be correct, partially correct, or wrong in many different ways.
- **Subjective quality.** Helpfulness, tone, and clarity matter, and they're not directly measurable.
- **Behavior drift.** The same model can behave differently as providers update it. The same prompt can produce different outputs across runs.

The book's framing: evaluation isn't a one-time gate, it's an ongoing _system_. You build it, run it continuously, and refine it as the product evolves.

## The Spectrum of Evaluation Methods

Huyen lays out evaluation methods along a spectrum from "high signal, low scale" to "low signal, high scale":

| Method                  | Scale          | Signal quality        | When to use                                                          |
| ----------------------- | -------------- | --------------------- | -------------------------------------------------------------------- |
| **Human evaluation**    | Low (10-100s)  | Highest               | Final-quality decisions, ground truth, irreducible subjective tasks   |
| **LLM-as-judge**        | Medium (1000s) | Good-to-high          | Automated quality checks, regression detection                        |
| **Reference-based**     | High           | Medium                | When you have known-good answers (e.g., factual QA)                  |
| **Functional checks**   | Highest        | Limited but precise   | Format compliance, schema validation, code execution                  |

You don't pick one. A mature eval system layers all of them:

- Functional checks catch trivial breakage cheaply.
- LLM-as-judge runs on every change to detect regressions.
- Human eval validates the metrics themselves and handles the final-quality call before launches.

## Reference-Based vs Reference-Free Metrics

**Reference-based** metrics compare the model's output to a known-good answer. Examples:

- **Exact match** — strict; only works for closed-form answers like numbers or labels.
- **BLEU, ROUGE** — n-gram overlap with reference text. Originated in translation and summarization. They penalize different word choices even when the meaning is the same.
- **BERTScore, semantic similarity** — embedding-based, more forgiving of phrasing.

Reference-based metrics need reference outputs. Building a reference dataset is expensive, and references can themselves be subjective. They work best when there's a clear correct answer.

**Reference-free** metrics evaluate output against criteria, not against a known answer. Examples:

- **Fluency, coherence** — can the output be read? Does it stay on topic?
- **Faithfulness** — does the answer stick to the source documents (in RAG)?
- **Constraint adherence** — did the model follow instructions about format, length, tone?

Reference-free is what most production evaluation looks like. You usually don't have a ground-truth answer for "summarize this customer ticket" — you have _criteria_ for what a good summary looks like.

## LLM-as-Judge

This is the technique that made automated evaluation tractable. Use a strong language model to evaluate the outputs of another model (often itself, often a different one).

A typical setup:

1. Give the judge model a clear rubric ("rate this response 1-5 on factual accuracy, with 1 being completely wrong and 5 being fully correct").
2. Optionally give it a reference answer for comparison.
3. Ask for a score plus a short explanation.
4. Aggregate scores across examples.

LLM-as-judge is the workhorse of modern AI evaluation. But it has known biases:

- **Position bias.** Judges favor whichever response is listed first when comparing two outputs.
- **Verbosity bias.** Longer responses get rated higher even when they're not better.
- **Self-preference.** A model judging its own outputs tends to rate them higher than human raters would.
- **Style over substance.** Judges can be fooled by confident tone even when content is wrong.

Mitigation patterns:

- **Randomize position** when comparing two responses.
- **Calibrate against humans.** Run the judge and humans on the same sample; check the correlation. If correlation is weak, redesign the rubric.
- **Use a different judge model than the one being evaluated** to reduce self-preference.
- **Make the rubric concrete.** "Rate quality 1-5" produces noise. "Did the response include all three required fields?" produces signal.

## Building Custom Evaluations

The book emphasizes that off-the-shelf benchmarks (MMLU, HumanEval, GSM8K) are not enough for production. Benchmarks measure general capability, but your application has specific behaviors that matter.

A custom evaluation pipeline typically has:

- **An evaluation dataset.** A curated set of inputs that represent your real distribution. Should cover happy paths, edge cases, and known failure modes. 50-200 examples is enough to start; you don't need 10,000 to get signal.
- **A set of criteria or rubric.** What does "good" mean for your task? Concrete, observable properties.
- **A scoring mechanism.** Functional check, LLM judge, or human rating.
- **A regression baseline.** Before changing a prompt or swapping a model, snapshot current scores. After the change, compare.

Custom evals are version-controlled artifacts. They live with the code. They get updated when the product evolves.

## Production Evaluation

Offline evaluation tells you the system works in controlled conditions. Production evaluation tells you what's happening in the wild. Both matter.

Key elements:

- **Implicit feedback.** What signals do you already have? Conversion, retention, time-on-task, retry rate, copy-to-clipboard. These are imperfect proxies but cheap and high-volume.
- **Explicit feedback.** Thumbs up/down, free-text feedback. Lower volume, higher signal.
- **Sampling and audit.** Periodically sample real traffic and run your offline eval on it. Catches distribution shift before users do.
- **A/B testing.** The gold standard for "does this change actually help users." Expensive to set up but unambiguous.

The book points out that explicit feedback ratios are usually very low — most users don't rate. So implicit signals plus sampled audits do most of the heavy lifting.

## Common Pitfalls

A list worth memorizing:

- **Vibes-based evaluation.** "It feels better." Test it on the eval set. Get a number.
- **Evaluating the wrong thing.** Optimizing for benchmark scores that don't correspond to user value. Or optimizing for user value in a way that doesn't generalize.
- **Overfitting to the eval set.** If you tune prompts against your eval set repeatedly, you've turned it into training data. Keep a held-out test set.
- **Ignoring cost and latency in the rubric.** A 2x-slower response with marginally better quality is usually worse for users. Include latency and cost as evaluation dimensions.
- **Single-model judges with self-preference.** Cross-check against a different judge or against humans periodically.
- **Treating eval as a launch gate, not a system.** The eval set decays as the product evolves. Refresh it.

## What I'm Taking from This

- **Build the eval before the product.** You can't decide what's good if you can't measure it.
- **Layer your evaluation.** Functional checks for the cheap stuff, LLM-as-judge for scale, humans for ground truth.
- **Custom over general benchmarks.** Your task isn't MMLU. Build the set that matches your actual workload.
- **Calibrate judges against humans, regularly.** Otherwise you're optimizing against a metric that's drifting from reality.
- **Production telemetry is half of evaluation.** Offline tells you it works in a lab. Production tells you it works for users.

The next part goes into how to actually _build_ with these models — prompt engineering and RAG — once you have a way to tell whether your changes are helping.

---

**Further Reading:**

- [Chip Huyen, _AI Engineering_ (O'Reilly, 2024)](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Eugene Yan — Evaluation & Hallucinations in LLM-Based Applications](https://eugeneyan.com/writing/evals/)
- [Hamel Husain — Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/)
