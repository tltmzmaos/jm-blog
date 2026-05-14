---
title: 'AI Engineering Part 4: Fine-tuning and Dataset Engineering'
description: "Reading notes on chapters 7-8 of Chip Huyen's AI Engineering. When fine-tuning beats prompting and RAG, types of fine-tuning (LoRA, QLoRA, RLHF), and the dataset engineering work that determines the outcome."
pubDate: 2026-05-16
author: 'Jongmin Lee'
tags: ['AI', 'AI Engineering', 'LLM', 'Fine-tuning', 'Reading Notes']
featured: false
draft: true
---

Most AI applications never fine-tune a model. Prompting and RAG cover the majority of cases, are cheaper, and let you iterate faster. But when fine-tuning is the right move, it can dramatically improve quality, cost, or both. Chapters 7 and 8 of _AI Engineering_ cover both halves: when to fine-tune, and how to do the dataset work that actually determines the outcome.

## When to Fine-tune

Huyen's decision framework: try prompting → RAG → fine-tuning, in that order. Each step adds engineering cost. Don't skip ahead unless you have evidence.

Reach for fine-tuning when:

- **The model needs to learn a behavior**, not just facts. Format compliance, style, domain-specific reasoning patterns. Behavior is hard to elicit reliably from prompts alone.
- **You need lower latency or cost.** A fine-tuned small model can match a prompted large model on a narrow task. Production cost matters at scale.
- **Prompts have hit a quality ceiling.** You've iterated on prompts and evals and still can't get above some threshold on important examples.
- **You need consistent voice or persona** across millions of outputs — and prompt drift makes that hard.

Don't fine-tune when:

- **The knowledge changes frequently.** RAG is better — bake the index, not the model.
- **You don't have evaluations in place.** Without evals, you can't tell if fine-tuning helped. You'll spend money and ship a worse model.
- **You don't have enough data.** Fine-tuning with too little or too noisy data often makes the model worse, not better.

## Types of Fine-tuning

The space has gotten richer. The book groups techniques by what they modify:

| Type                                | What changes                                            | Cost          | Typical use                                                  |
| ----------------------------------- | ------------------------------------------------------- | ------------- | ------------------------------------------------------------ |
| **Full fine-tuning**                | All parameters                                          | Very high     | Frontier labs, foundational shifts in behavior               |
| **Parameter-efficient (LoRA, etc.)** | A small adapter (~1% of params)                         | Low-medium    | Most applied fine-tuning today                               |
| **Quantization-aware (QLoRA)**      | Same as LoRA, but base model in 4-bit precision         | Low           | Fine-tuning very large models on a single GPU                |
| **Instruction fine-tuning**         | Adapts to follow instructions (a form of SFT)           | Medium        | Bringing a base model up to chat-tuned                       |
| **RLHF / DPO / GRPO**               | Preference-based, adjusts the model toward better outputs | High-medium | Aligning model to human preferences after SFT                |

For most teams, **LoRA-based parameter-efficient fine-tuning (PEFT)** is the workhorse. You don't change the base model — you train a small adapter that gets composed with the base at inference. Cheap to train, cheap to serve, easy to swap.

## Parameter-Efficient Fine-Tuning (PEFT)

LoRA (Low-Rank Adaptation) is the dominant technique. The idea is simple:

- Freeze the base model weights entirely.
- Insert small trainable matrices (the "adapter") into attention layers.
- Train only those matrices.

You end up with a base model + a small adapter file (sometimes <1% of the base model's size). At inference, the adapter is composed with the base model in a way that costs almost nothing.

What this enables:

- **Multiple specialized adapters from one base.** Train an adapter for customer support, another for code review, another for medical Q&A. Swap them at runtime.
- **Cheap experimentation.** Trying 10 adapter configurations costs roughly 10x training a single adapter — still way under one full fine-tune.
- **Easy rollback.** A bad adapter is one file to remove.

QLoRA goes further by quantizing the base model to 4-bit precision during training. The math still works (gradients flow through the quantized base into the LoRA adapter), and memory drops enough to train large models on consumer GPUs.

## Reinforcement Learning from Feedback

After SFT, models are often "polished" with preference learning. The classic approach:

1. **Collect preference data.** For each prompt, generate multiple responses. Have humans rank them.
2. **Train a reward model** that predicts which response a human would prefer.
3. **Use RL** (typically PPO) to update the language model toward responses the reward model rates higher.

This is **RLHF** (Reinforcement Learning from Human Feedback). It's powerful but operationally heavy — three models in the loop, complex training dynamics.

**DPO** (Direct Preference Optimization) is the now-dominant simplification. It skips the reward model and updates the policy directly from preference pairs. It's roughly as effective, much simpler to run.

**GRPO** and other variants extend this further, but the conceptual picture is the same: preference data shapes behavior in a way that SFT alone can't.

For most application teams, full RLHF is out of scope. But understanding it matters because:

- The chat-tuned models you call are themselves RLHF/DPO outputs of a base model.
- Some preference data + DPO can dramatically improve a fine-tuned model that's already close.

## Dataset Engineering

This is the section that gets too little attention. Chip writes it explicitly: in fine-tuning, the dataset is the lever, not the algorithm.

Three properties that matter:

### Size

Less than people expect. For many fine-tuning tasks, **a few hundred to a few thousand examples** is enough. Quality dominates quantity. 500 carefully-curated examples beat 50,000 noisy ones.

How to think about it:

- Format compliance / style: 100-500 examples can be enough.
- Domain adaptation (medical, legal): 1,000-10,000.
- Substantial behavior changes: 10,000+.

If you're collecting millions of examples for a fine-tune, you're probably solving the wrong problem.

### Quality

The biggest predictor of fine-tuning outcomes. Quality means:

- **Correct.** Outputs are actually what you want.
- **Consistent.** Different examples follow the same format, style, and decision rules.
- **Aligned with eval.** Examples reflect the kinds of inputs you'll see in production.
- **Free of artifacts.** No "I'm an AI language model" disclaimers, no boilerplate that contradicts your goals.

Curation matters more than collection. Spend more time pruning than gathering.

### Diversity

The eval set's distribution should match production. So should the training set. Three failure modes:

- **Mode collapse.** All examples are similar, model overfits to that shape and fails on variation.
- **Imbalance.** One class dominates, model defaults to it.
- **Long-tail gaps.** Edge cases that matter in production are missing from training.

Active learning helps: deploy the current model, sample the cases where it's wrong or uncertain, label those, add to the next training round.

## Synthetic Data and Distillation

You don't always have to collect data manually.

**Synthetic data generation:**

- Use a larger model (GPT-4-class) to generate examples.
- Filter aggressively — keep only the examples that pass quality checks.
- Mix with real human data; pure synthetic often produces brittle models.

**Distillation:**

- The "teacher" is a large, expensive model.
- The "student" is a small, fast model.
- Train the student to mimic the teacher's outputs on a dataset.

Distillation is how a fine-tuned 7B parameter model can sometimes match a prompted 70B model on a narrow task at a fraction of the cost. The trade-off: the student inherits the teacher's biases and limitations.

## Evaluating a Fine-tuned Model

After fine-tuning, you need to verify three things:

1. **It improved on the target task.** Compare against the base model on your eval set. The improvement should be measurable, not just visible.
2. **It didn't regress elsewhere.** Fine-tuning can degrade general capabilities (catastrophic forgetting). Test on a broader eval set, including capabilities the base model had but you didn't specifically train.
3. **It's still safe.** Fine-tuning can also degrade safety alignment. Test refusal behavior, harmful content handling, etc.

The default assumption: a fine-tune that improves your target metric is likely worse at something. Make sure the trade is worth it.

## What I'm Taking from This

- **Try prompting → RAG → fine-tuning in that order.** Skip ahead only with evidence.
- **PEFT (LoRA-class) handles most production fine-tuning.** Full fine-tunes are rare.
- **The dataset is the lever.** Quality, consistency, and diversity beat quantity.
- **Distillation + synthetic data unlock small, fast models that match large ones on narrow tasks.** Worth understanding even if you don't run it yourself.
- **Always test for regression.** A fine-tune that wins one metric while losing three others is a net negative.

The final part covers what happens after the model is good enough — inference optimization and production architecture.

---

**Further Reading:**

- [Chip Huyen, _AI Engineering_ (O'Reilly, 2024)](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Hugging Face PEFT Library](https://huggingface.co/docs/peft/index)
- [Direct Preference Optimization (Rafailov et al., 2023)](https://arxiv.org/abs/2305.18290)
