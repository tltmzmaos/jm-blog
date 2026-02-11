---
title: "Clean Architecture Part 3: Component Principles"
description: "Principles for organizing code into components. Covers component cohesion (REP, CCP, CRP) and component coupling (ADP, SDP, SAP) for building modular systems."
pubDate: 2026-01-10
author: "Jongmin Lee"
tags: ["Clean Architecture", "Software Engineering", "Best Practices", "Robert C. Martin", "Components"]
draft: false
---

# Clean Architecture Part 3: Component Principles

Components are the units of deployment. They're the smallest entities that can be deployed as part of a system—JARs in Java, DLLs in .NET, npm packages in JavaScript. This part covers how to decide what goes into a component and how components should depend on each other.

---

## Chapter 12: Components

### A Brief History

In the early days, programmers controlled memory location of programs. Libraries were linked by manually adjusting addresses—a nightmare.

**Relocatable binaries** solved this: compilers emitted code that could be loaded anywhere. Loaders combined separately compiled programs at load time.

**Linking loaders** appeared next, keeping libraries separate until runtime. This eventually became too slow as programs grew.

The solution was **component plugins**—dynamically linked libraries (DLLs, shared objects) loaded at runtime. This is the modern component architecture.

### Components Today

Components are now:
- **Units of deployment:** JAR files, DLLs, npm packages
- **Independently developable:** Teams can work separately
- **Independently deployable:** Can update one without others

A well-designed component architecture allows rapid development and flexible deployment.

---

## Chapter 13: Component Cohesion

Three principles govern which classes belong in which components:

### REP: Reuse/Release Equivalence Principle

> "The granule of reuse is the granule of release."

Classes that are reused together should be released together. They should share the same version number and release documentation.

**Implication:** Classes grouped into a component should be **releasable together**. If some classes change and others don't, they might not belong together.

People who want to reuse a component want to know:
- What version are they using?
- What changed between versions?
- Is it compatible with their other dependencies?

If a component contains unrelated classes, reusers are forced to upgrade for changes they don't care about.

### CCP: Common Closure Principle

> "Gather into components those classes that change for the same reasons and at the same times. Separate into different components those classes that change at different times and for different reasons."

This is SRP restated for components. A component should not have multiple reasons to change.

**Goal:** When requirements change, limit the changes to a minimal number of components. Ideally, only one component changes.

If two classes always change together (for the same reason, at the same time), they belong in the same component. If a change affects multiple components, deployment, validation, and release become complex.

### CRP: Common Reuse Principle

> "Don't force users of a component to depend on things they don't need."

This is ISP restated for components.

**When you depend on a component, you depend on ALL of it.** If a component contains classes you don't use, you still suffer when those classes change.

**Implication:** Classes that aren't tightly bound should be in separate components.

When someone depends on your component, they should need everything in it. Don't make them drag along baggage they don't use.

### The Tension Diagram

These three principles are in tension:

```
        REP
        /  \
       /    \
      /      \
    CCP ---- CRP
```

- **REP + CCP:** Group for ease of release and change → Components get larger
- **CCP + CRP:** Separate unrelated classes → Components get smaller
- **REP + CRP:** Group reusable classes together → Components might include unrelated things

**Early in a project:** Favor CCP. Developability is more important than reusability. You're not releasing components yet.

**As project matures:** Shift toward REP and CRP. Components stabilize and become reusable. Too much coupling causes painful releases.

The balance shifts over time. A good architect revisits component structure as the project evolves.

---

## Chapter 14: Component Coupling

Three principles govern relationships between components:

### ADP: Acyclic Dependencies Principle

> "Allow no cycles in the component dependency graph."

### The Morning-After Syndrome

Developer A commits changes. Developer B arrives the next morning—their code no longer works because it depends on what A changed.

In larger teams, this becomes a nightmare. Integration takes weeks. Nobody can deploy anything stable.

### Two Solutions

**Weekly Build:** Everyone works independently for a week, then integrates on Friday. But as the project grows, Friday integration takes multiple days. Eventually, it dominates the schedule.

**Acyclic Dependencies:** Structure components so there are no cycles in the dependency graph. Changes can propagate without surprises.

### The Dependency Graph

Components and their dependencies form a directed graph. If the graph has no cycles, it's a **DAG** (Directed Acyclic Graph).

```
        Main
       /    \
      ↓      ↓
  Presenters  Controllers
      ↓     ↙   ↘
   Interactors  Authorizer
       ↓    ↘    ↙
    Entities  Permissions
              ↓
           Database
```

To release a component:
1. Find all components that depend on it
2. Those components need testing with the new version
3. Release in topological order

With no cycles, you can trace exactly which components are affected by any change.

### Breaking Cycles

If you discover a cycle:

```
Entities → Authorizer → Permissions → Entities (CYCLE!)
```

Two ways to break it:

**1. Dependency Inversion:** Create an interface in the depended-on component:

```
Entities → Permissions Interface ← Permissions → Authorizer
```

**2. Extract new component:** Move the shared code into a new component that both depend on:

```
Entities → SharedModule ← Authorizer
```

### Jitters

The component structure **evolves**. Cycles appear, you break them. New components appear, old ones merge.

Don't expect to design the perfect component graph upfront. It grows and changes with the system.

### SDP: Stable Dependencies Principle

> "Depend in the direction of stability."

Some components are designed to be volatile—they capture requirements that change frequently. They should not be depended on by components that are difficult to change.

A stable component should not depend on an unstable one.

### Stability Metrics

**Stability (I)** = Fan-out / (Fan-in + Fan-out)

- **Fan-in:** Number of classes outside this component that depend on classes inside
- **Fan-out:** Number of classes inside this component that depend on classes outside

**I = 0:** Maximally stable (nothing goes out, many things come in)
**I = 1:** Maximally unstable (many go out, nothing comes in)

SDP says: **Dependencies should flow toward lower I values.**

```
Component A (I=0.8) → Component B (I=0.2)  ✓ Good
Component A (I=0.2) → Component B (I=0.8)  ✗ Bad
```

### What If You Must Depend on Something Stable?

If an unstable component needs to use something in a stable component:

**Wrong:**
```
Stable → Unstable  (Stable now depends on something that changes often!)
```

**Right:** Use DIP
```
Stable → Interface ← Unstable
```

The interface is stable. The implementation can change freely.

### SAP: Stable Abstractions Principle

> "A component should be as abstract as it is stable."

Stable components should be abstract so they can be extended. Unstable components should be concrete since instability makes them easy to change.

**Combine SDP and SAP:** Dependencies should run toward abstraction.

### Measuring Abstractness

**Abstractness (A)** = Number of abstract classes / Total classes

- **A = 0:** No abstract classes (completely concrete)
- **A = 1:** All abstract classes (completely abstract)

### The Main Sequence

Plot components on a graph with I (instability) on X-axis and A (abstractness) on Y-axis:

```
A
1.0 |  Zone of        .
    |  Uselessness   .  .
    |              .      \
    |            .     Main
    |          .      Sequence
    |        .     /
    |      .  .
    |  Zone of
0.0 |  Pain
    +------------------------
    0.0                   1.0  I
```

**The Main Sequence:** The line from (0,1) to (1,0)

- **Zone of Pain (0,0):** Stable and concrete. Hard to change but must be changed. Example: database schemas, concrete utility libraries.

- **Zone of Uselessness (1,1):** Abstract and unstable. No one depends on them, so what's the point?

**Distance from Main Sequence (D):** |A + I - 1|

- D = 0: Perfectly on the main sequence
- D > 0: Too far from the ideal

Most components should cluster near the main sequence. A component in the Zone of Pain is a risk. A component in the Zone of Uselessness is waste.

---

## Component Principles Summary

### Cohesion Principles

| Principle | Says | Effect |
|-----------|------|--------|
| **REP** | Group for release together | Larger components |
| **CCP** | Group things that change together | Larger components |
| **CRP** | Don't force unused dependencies | Smaller components |

**Balance:** Early projects favor CCP. Mature projects shift to REP/CRP.

### Coupling Principles

| Principle | Says |
|-----------|------|
| **ADP** | No cycles in dependency graph |
| **SDP** | Depend toward stability |
| **SAP** | Stable components should be abstract |

---

## Key Takeaways

1. **Components are deployment units.** They should be independently developable and deployable.

2. **Cohesion is about what goes in.** REP: releasable together. CCP: change together. CRP: used together.

3. **The tension triangle evolves.** Early: favor CCP (developability). Later: favor CRP (reusability).

4. **No cycles in dependencies.** Use DIP or extract new components to break cycles.

5. **Depend toward stability.** Stable components are hard to change—don't depend unstable things on them.

6. **Stable components should be abstract.** This allows extension without modification.

7. **The Main Sequence is the sweet spot.** Stable-and-abstract or unstable-and-concrete. Avoid the zones of pain and uselessness.

8. **Component structure evolves.** Don't design it all upfront. Let it grow with the system and refactor when needed.

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Package Principles](https://en.wikipedia.org/wiki/Package_principles)
- [Stability Metrics](https://www.ibm.com/developerworks/library/j-shed/index.html)
