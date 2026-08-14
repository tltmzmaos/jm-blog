---
title: "AIES: AI, Ethics, and Society"
description: "Key AI ethics concepts from Georgia Tech OMSCS AIES (CS 6603): data and privacy, statistical literacy, fairness metrics, and bias mitigation."
pubDate: 2026-08-13
author: "Jongmin Lee"
tags: ["AI Ethics", "OMSCS", "CS6603", "Fairness", "Bias", "AI"]
draft: false
---

Georgia Tech OMSCS **AIES (CS 6603)** is a course about what happens when AI systems meet real people. There are no model architectures to implement and no leaderboards to climb. The subject is the gap between a model that works and a model that is acceptable to deploy. This post captures what I studied in Summer 2026.

## Course Focus

The course runs through four modules: data and society, the statistics behind big data claims, fairness in AI/ML applications, and bias mitigation. It builds in one direction. Where does the data come from, what can you legitimately conclude from it, where does the resulting system fail people, and what can you actually do about it.

I took it partly for graduation requirements, but the timing was right. AI is now part of my daily routine, at home and at work, and I also build systems that use it. That combination is easy to be uncritical about. What I wanted from the course was a wider set of viewpoints on the same technology I use every day, and it delivered that. The course has a lot of writing: case study discussions, two written critiques, and a final project report.

## Ethics Is Not Law

The first module draws a distinction that the rest of the course leans on. Law is a system of rules enforced by an institution. Ethics is a set of moral principles governing behavior. The two overlap but neither contains the other, and the practical consequence is simple: **something can be perfectly legal and still be the wrong thing to build**.

Two frameworks from this module stuck with me.

**PAPA** covers the four ethical pillars for big data:

| Pillar | The question it asks |
|---|---|
| Privacy | Can the individual control their personal information? |
| Accuracy | Who is responsible for the fidelity of the information? |
| Property | Who owns the information, and who controls access? |
| Accessibility | What does an organization have the right to collect, and what can it do with the data afterward? |

The **four ethical views** split into two camps. Consequence-based views (Utilitarian, Individualism) judge a decision by its outcome. Rule-based views (Moral-Rights, Justice) judge it by the principle it follows. This is not academic decoration. Most engineering arguments about "is this okay to ship" are actually two people arguing from different camps without saying so. Naming the camp makes the disagreement solvable.

The module also covers US privacy law, protected classes under discrimination law, and GDPR. The GDPR contrast is the sharpest one: the US default is opt-out, GDPR is explicit opt-in, and GDPR is extraterritorial, so it applies to your system if EU residents use it regardless of where you are.

## Profiling Myself

The first assignment was to download my own advertising profile from a platform and analyze it. I used Google's My Ad Center: 116 inferred items, 59 interest topics and 57 advertiser brands. I bucketed each one as relevant, irrelevant, or completely off.

The overall accuracy came out to 54.3 percent. That number is less interesting than the shape of the errors. Food and dining inferences were about 90 percent accurate. Apparel was the worst, with roughly a third of the items completely off. The pattern is that Google is accurate where I generate frequent, unambiguous signals, and it over-generalizes where the signal is sparse. One click on an article is apparently enough to attach a topic to me.

The part that actually changed my thinking was not the interest topics. It was the attributes Google inferred without me ever providing them, including my industry and my homeownership status. I can download my raw activity through Takeout, but the step that turns that activity into a label like "Industry: Technology" is not visible to me, and neither are the segments advertisers see. That asymmetry is the whole point of the assignment. The raw data is available; the inference is not.

## The Statistics Detour

The second module is a statistics course wedged into an ethics course, and the reason takes a while to become obvious. Most AI ethics failures are not exotic. They are ordinary statistical errors that nobody caught, deployed at scale.

The module covers three ways to mislead with data:

| Stage | Typical failure |
|---|---|
| Sampling | Non-representative samples, self-selection, survivorship |
| Analysis | Truncated axes, cherry-picked windows, mean vs median chosen for effect |
| Interpretation | Correlation read as causation, ignoring confounders |

Two items are worth repeating. **Simpson's paradox** shows that a trend present in every subgroup can reverse when the groups are combined, which means aggregate fairness numbers can hide subgroup harm entirely. And the five types of sampling bias make it clear that a biased dataset is usually not the result of anyone doing anything wrong. It is the default outcome of collecting data conveniently.

If you already have a statistics background this module is review. The framing is what matters: every one of these errors becomes a fairness problem once a model is trained on it.

## Where Systems Fail People

The third module walks through three application areas, each with a well-documented failure.

**Word embeddings.** Embeddings learn word meaning from co-occurrence, which means they also learn the stereotypes present in the corpus. The word analogy demo that makes embeddings feel magical (`king - man + woman ≈ queen`) is the same mechanism that produces `programmer - man + woman ≈ homemaker`. WEAT (Word Embedding Association Test) measures these associations quantitatively, and the Bolukbasi debiasing method attacks them in three steps: identify the bias direction, neutralize gender-neutral words against it, then equalize the remaining pairs.

**Facial recognition.** The Gender Shades study evaluated three commercial gender classification systems. Overall accuracy looked fine, in the high 80s to low 90s. Broken down by skin tone and gender, lighter-skinned males were classified at 99 to 100 percent accuracy while darker-skinned females were at 65 to 79 percent, a gap of up to 34 percentage points on the same system. This is the cleanest illustration in the whole course of why a single aggregate accuracy metric is not a safety check.

**Predictive algorithms.** COMPAS is the standard case: a recidivism risk model whose error rates broke differently across racial groups. False positives and false negatives were not distributed evenly, and the deeper problem is that the competing fairness definitions involved cannot all be satisfied at once. It was not a bug that better engineering would have fixed.

## Removing the Sensitive Attribute Does Not Work

This is the idea the course returns to most often, and it is the one I would want any engineer to take away.

The intuitive fix for a biased model is to drop the protected attribute. Do not give the model race, and it cannot discriminate by race. This fails, and it fails for a structural reason: **protected attributes are redundantly encoded across the remaining features**. ZIP code carries race. Purchase history carries gender. Name carries national origin. The model reconstructs what you removed from whatever is left.

Worse, dropping the column removes your ability to measure the problem. You cannot compute a fairness metric across groups you refused to record. The course calls this "fairness through unawareness" and treats it as the naive baseline that every other technique exists to replace.

The escalating alternatives are to strip proxy information as well, or to keep the protected attribute, train, measure whether the output is group-aware, and penalize and retrain until it is not.

## Fairness Metrics Conflict

Once you accept that fairness has to be measured, the next surprise is that there are more than thirty published definitions and many of them are mutually incompatible. Choosing the metric is itself an ethical decision, not a technical one.

The two the course centers on, both headline metrics in AIF360:

| Metric | Formula | Fair value |
|---|---|---|
| Statistical Parity Difference (SPD) | unprivileged rate − privileged rate | 0 |
| Disparate Impact (DI) | unprivileged rate ÷ privileged rate | 1 |

Disparate impact connects directly to US employment law through the four-fifths rule, where a ratio below 0.8 is a legal red flag.

The clearest demonstration is the loan threshold simulation, where you pick a lending strategy and watch what it equalizes. Group-unaware equalizes the threshold. Demographic parity equalizes the approval rate. Equal opportunity equalizes the true positive rate. No strategy equalizes everything, and every fair strategy makes less profit than the max-profit strategy. Fairness is not free, and the cost is visible in the chart.

## Mitigation

The final module organizes mitigation techniques by where they intervene in the pipeline:

| Phase | Target | Example algorithms |
|---|---|---|
| Pre-processing | Training data | Reweighing, Disparate Impact Remover, Learning Fair Representations |
| In-processing | The classifier | Adversarial Debiasing, Prejudice Remover, Meta Fair Classifier |
| Post-processing | The predictions | Reject Option Classification, Equalized Odds Postprocessing |

The choice depends on what you are allowed to touch. Reweighing only adjusts sample weights, leaving features and labels intact, which is the right tool when the data itself cannot be modified. Disparate Impact Remover edits feature values but returns a dataset in the same space as the input, so it stays inspectable. Learning Fair Representations moves the data into a latent space, which works but costs you transparency.

The tooling in this space is real and usable. IBM's AIF360 ships with 75+ fairness metrics and 10+ mitigation algorithms behind a scikit-learn style fit/predict interface. Google's What-If Tool lets you slice model performance by subgroup, edit individual data points to re-run inference, and find the closest counterfactual, which is the nearest example that gets classified differently.

The final project ties it together: pick a dataset, select two protected classes, compute fairness metrics on the raw data, apply a pre-processing mitigation, train classifiers on both versions, and report what actually changed. Doing it end to end is what makes the trade-off concrete. The metrics move, but not to zero, and accuracy moves too.

## Practical Constraints

A few things the course made me more careful about in my own work:

- **Aggregate metrics hide subgroup failures.** An accuracy number with no group breakdown is not evidence that a system is safe.
- **Inference is where the ethical exposure is, not storage.** My Google profile assignment showed this from the user side. The data I handed over was mundane; the labels derived from it were not.
- **Fairness auditing requires collecting the attribute you are auditing on**, which sits in direct tension with data minimization. There is no clean resolution, only a documented decision.
- **Every human decision in the pipeline is a place bias enters** — dataset selection, threshold setting, and what you choose to surface to the user, not just the training data.

I build AI-powered applications, and this course changed the questions I ask about them. Not "is the model accurate enough" but "accurate for whom, and who absorbs the errors." That is not a question a metric answers on its own.

## Course Takeaways

- Legal and ethical are different bars. Compliance is the floor.
- Fairness is not one property. It is a family of conflicting definitions, and picking one is a value judgment you should make explicitly.
- Bias is the default outcome of ordinary data collection, not evidence of bad intent, which is why it has to be measured rather than assumed absent.

CS 6603 is not a hard course technically, and if you come in looking for algorithms you will be disappointed. What it gives you is a vocabulary for a class of problems that engineers usually notice too late, plus enough legal and statistical grounding to argue the point with someone who is not an engineer. For anyone shipping AI features to real users, that turns out to be the useful part.

---

**Further Reading:**

- [Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification](https://proceedings.mlr.press/v81/buolamwini18a.html)
- [Machine Bias — ProPublica's COMPAS investigation](https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing)
- [Attacking Discrimination with Smarter Machine Learning — Google's interactive loan threshold simulation](https://research.google.com/bigpicture/attacking-discrimination-in-ml/)
- [AI Fairness 360 (AIF360)](https://github.com/Trusted-AI/AIF360)
- [What-If Tool](https://pair-code.github.io/what-if-tool/)
