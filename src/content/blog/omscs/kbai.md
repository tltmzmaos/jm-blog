---
title: "KBAI: Knowledge-Based AI"
description: "Key knowledge-based AI concepts from Georgia Tech OMSCS KBAI (CS 7637): knowledge representation, reasoning strategies, learning, planning, and the ARC-AGI project."
pubDate: 2026-05-11
author: "Jongmin Lee"
tags: ["Knowledge-Based AI", "OMSCS", "AI", "CS7637", "ARC-AGI"]
draft: false
---

Georgia Tech OMSCS **KBAI (CS 7637)** is a course about building agents that reason, learn, and remember through structured knowledge rather than statistical pattern matching. This post captures what I learned in Spring 2026 about cognitive architectures, knowledge representations, and the ARC-AGI project that runs through the semester.

## Course Focus

KBAI is not a machine learning course. There are no gradients, no training loops, no neural network architectures. The course frames AI as the design of cognitive systems built from three intertwined processes: **reasoning**, **learning**, and **memory**. The recurring lens is the *Four Schools of AI*, which positions knowledge-based approaches alongside (not against) ML, neural, and statistical methods.

I picked the course for two reasons. It counted toward my graduation requirements, and I wanted hands-on exposure to agent-style AI — the line of work that thinks about cognition as reasoning over structured knowledge. The course delivered on that, with a fair amount of writing along the way: each unit has reflective questions and short essays, and the project comes with its own report.

## Knowledge Representation

How an agent stores what it knows is the foundation for everything else. The course covers four representations:

- **Semantic Networks** - Nodes and labeled links that capture concepts and their relationships.
- **Production Systems** - If-then rules that map perceptions to actions, organized into a cognitive architecture like SOAR with working memory, long-term memory, and a learning mechanism called *chunking* that fires on impasses.
- **Frames** - Slot-and-filler structures that represent stereotypes of situations or actions. A frame for the verb *ate* has slots for subject, object, location, utensils, whether the object is still alive, and so on. Frames generate expectations, which makes processing partially top-down rather than purely bottom-up.
- **Logic** - Formal propositional and predicate logic for deductive inference.

This was the part of the course I came back to the most. As a software engineer working on data-heavy systems, I keep asking how to store information so that it stays usable later. Production systems and frames are clean answers to that for a specific kind of agent. The idea that a frame *encodes what kind of information you expect* about a concept is something I want to bring back to the way I structure data on the engineering side.

## Reasoning Strategies

Once knowledge is represented, the agent needs strategies for using it:

- **Generate and Test** - Generate candidate solutions, filter against constraints.
- **Means-Ends Analysis** - Compare the current state to the goal state and pick operators that reduce the difference.
- **Classification** - Match instances to concepts in a hierarchy.
- **Constraint Propagation** - Tighten variable assignments by propagating local constraints through a network.

These strategies are deliberately simple. The course's point is that with the right knowledge representation, even basic strategies cover a lot of ground.

## Learning

Learning in KBAI is not gradient descent. It is symbolic, often one-shot, and tied to specific knowledge structures:

- **Learning by Recording Cases** and **Case-Based Reasoning** - Store past problem-solution pairs and adapt the closest one to a new problem.
- **Incremental Concept Learning** - Refine a concept definition example by example, using heuristics like *drop-link*, *enlarge-set*, and *climb-tree* (which uses background knowledge as an ontology to generalize upward in a class hierarchy).
- **Version Spaces** - Maintain the most general and most specific hypotheses consistent with seen examples, narrowing the space as new examples arrive.
- **Explanation-Based Learning** - Generalize from a single example by reasoning about *why* it satisfies the goal, not just that it does.
- **Learning by Correcting Mistakes** - Diagnose failures and revise the rule base accordingly.

The thread is that learning is cheap when the representation is right. A version space or a single explained example can teach you something a neural model would need thousands of samples to approximate — but only inside a clean, well-bounded knowledge schema.

## Planning and Problem Solving

Planning is the process of selecting and ordering actions to achieve one or more goals:

- **Classical Planning** - States, operators, and goals expressed in propositional logic.
- **Partial-Order Planning** - Delay committing to a strict ordering until conflicts force it; helps when one goal's plan clobbers another's preconditions.
- **Hierarchical Task Networks** - Decompose high-level tasks into sub-tasks recursively, useful when the action space has natural abstractions.
- **Configuration and Diagnosis** - Two applied problem-solving variants: building something that satisfies a set of constraints, and identifying which component is responsible for an observed failure.

Planning is treated as a central cognitive process because action selection itself is central to cognition. Most of what an agent does, at any level, eventually reduces to "which action next."

## Common Sense Reasoning

This block was where the course's framing felt most distinctive:

- **Understanding** - Building internal representations of stories or situations from language input.
- **Common Sense Reasoning** - Schank's framework of primitive actions: a small set (move object, transfer possession, ingest, and so on) that together form, in the course's own words, *"an ontology of actions."* Ontology is defined here as "a specification of a conceptualization of the world."
- **Scripts** - Stereotyped sequences of events (the classic example is the restaurant script) that let an agent fill in unstated details.

The primitive actions section is the one that stuck with me most, partly because of the explicit definition of ontology and partly because of the design philosophy underneath it. With a small set of well-chosen primitives, plus a frame structure to compose them and handle implied actions and state changes, you can interpret a surprising range of input without having a huge knowledge base. That kind of compact, structured representation is exactly what makes sense in environments where compute and data are constrained.

## Higher-Level Reasoning

The final block covers two cross-cutting topics:

- **Analogical Reasoning** - Solving novel problems by mapping them onto familiar ones. The mapping itself, not the solution, is the learned object.
- **Meta-Reasoning** - Reasoning about the agent's own reasoning: noticing when it is stuck, deciding when to switch strategies, and learning from its own failures.

Meta-reasoning is treated as the layer that sits above the reactive and deliberative parts of the architecture. It is what lets an agent recognize that its current approach isn't working and try something else.

## The ARC-AGI Project

The semester-long project is built around **ARC-AGI** (Abstract and Reasoning Corpus for Artificial General Intelligence), the benchmark proposed by François Chollet that the course recently switched to from the older Raven's Progressive Matrices project.

The setup is simple to describe. You get a small number of input-output grid pairs, where each grid is a 2D array of integers from 0–9 representing colors. Your agent has to infer the transformation rule from the examples and apply it to a new test input.

The fact that ARC-AGI is an actively used benchmark in the AI industry made it more engaging than working on a closed academic problem. The milestones ramp up: easier problems first, then medium, then hard, then the full set for the final.

Early milestones were tractable. Most problems could be solved by identifying a primitive operation (rotation, fill, shape extraction, color swap) and composing a few of them. The "find a primitive, then compose" pattern from the course mapped naturally onto the code.

The final was where I hit my limit. The hidden test problems forced harder generalization. I had assumed that the shapes and transformations my code already handled would cover the hidden cases too, but they didn't. "I can already handle this kind of shape" turned out to be very different from "my code will generalize to unseen versions of it."

## Practical Constraints

- The autograder enforces submission limits and a 40-minute total timeout, so brute-force search is not a viable strategy.
- Hardcoding answers or probing the grader is explicitly prohibited — the goal is generalization, not test-set fitting.
- Up to 3 predictions per problem are allowed; more is automatic failure.

These constraints make the project feel more like real ML evaluation than a typical homework assignment.

## Course Takeaways

- Knowledge representation is the design decision that determines everything downstream — choose it carefully.
- A small, well-structured set of primitives plus a way to compose them goes a long way, especially when knowledge is bounded.
- Symbolic learning is cheap when the representation is right, and expensive when it is not.
- The ideas in KBAI map well to constrained environments — offline, low-compute, or domain-specific — where building a focused ontology can outperform throwing a generic model at the problem.
- After taking this course, I'd like to see how large ontology and knowledge-based systems are actually implemented in practice: how the rule bases are designed and maintained, and how the representations are kept consistent as they grow.

KBAI gave me a vocabulary and a set of design patterns for thinking about agents, knowledge, and cognition that I expect to keep coming back to as I work on systems where AI has to fit within tight, real-world constraints.
