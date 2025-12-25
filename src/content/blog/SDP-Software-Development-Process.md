---
title: "SDP: Software Development Process - OMSCS 2025 Fall"
description: "Key software engineering concepts from Georgia Tech OMSCS SDP (CS 6300): lifecycle models, UML, testing, Android development, and team collaboration."
pubDate: 2025-12-19
author: "Jongmin Lee"
tags: ["Software Engineering", "OMSCS", "Georgia Tech", "UML", "Testing", "Android", "Agile", "CS6300", "Fall 2025"]
heroImage: "/SDP/sdp-hero.png"
draft: false
---

# SDP: Software Development Process

Georgia Tech OMSCS **SDP (CS 6300)** is a hands-on introduction to software engineering practices. The course bridges the gap between writing code and building maintainable systems. This post captures what I learned in Fall 2025 about processes, testing, design, and team-based development.

## Course Focus

SDP treats software development as a disciplined process. You learn that coding is only one part of the story. Requirements, design, testing, and maintenance matter just as much, and ignoring them creates technical debt that compounds over time.

## Software Lifecycle Models

The course introduces multiple lifecycle models, from rigid waterfall to flexible agile. The key lesson is that no single model fits all projects. Context matters: team size, requirements stability, and risk tolerance all influence the right choice.

Key models covered:

- **Waterfall** - Sequential phases, works when requirements are stable.
- **Spiral** - Risk-driven, good for large uncertain projects.
- **Agile/Scrum** - Iterative, embraces change and continuous feedback.
- **RUP (Rational Unified Process)** - Use-case driven, architecture-centric.

The practical takeaway is to choose a process that matches your constraints, not to follow a model blindly.

## Requirements and Use Cases

Good software starts with clear requirements. The course emphasizes the difference between functional requirements (what the system does) and non-functional requirements (how well it does it).

Use cases provide a structured way to capture requirements from the user's perspective. A use case describes:

- An actor (who interacts)
- A goal (what they want)
- A flow (how they achieve it)
- Alternative paths (what could go wrong)

Writing use cases forces you to think through edge cases before coding begins.

## UML: Communicating Design

UML diagrams are a shared language for design discussions. The course covers several diagram types:

- **Class diagrams** - Show structure: classes, attributes, methods, and relationships.
- **Sequence diagrams** - Show behavior: how objects interact over time.
- **State diagrams** - Show lifecycle: how an object transitions between states.
- **Activity diagrams** - Show workflow: the flow of activities in a process.

UML is not about drawing perfect diagrams. It is about communicating intent clearly so the team builds the right thing.

## Testing: Catching Bugs Early

Testing is not an afterthought. The course emphasizes multiple testing levels and approaches:

### Test-Driven Development (TDD)

Write tests before code. TDD forces you to define expected behavior upfront and keeps the codebase testable by design.

### Black-Box Testing

Test without knowing the implementation. Focus on inputs and expected outputs. Techniques include equivalence partitioning and boundary value analysis.

### White-Box Testing

Test with full knowledge of the code. Aim for statement coverage, branch coverage, or path coverage depending on criticality.

### Category-Partition Method

A systematic approach to generating test cases. Identify parameters, categorize their values, and combine them to cover meaningful scenarios. This technique was used in Assignment 6 to generate comprehensive test specifications.

## Android Development

The team project required building an Android application. This provided practical experience with:

- Android architecture (Activities, Intents, Layouts)
- Local data persistence (SQLite, SharedPreferences)
- External web service integration
- User authentication and session management

The goal was not to master Android, but to apply software engineering principles in a real development environment.

## Version Control and Collaboration

The course used Git extensively. Beyond basic commands, students learned:

- Branching strategies for parallel development
- Pull requests and code reviews
- Merge conflict resolution
- Commit hygiene and meaningful messages

Working in a distributed team taught that communication and process discipline matter as much as technical skill.

## Design Principles

Good design makes code easier to understand, test, and change. The course touched on:

- **SOLID principles** - Guidelines for maintainable object-oriented design.
- **Low coupling, high cohesion** - Modules should be independent and focused.
- **Design patterns** - Reusable solutions to common problems.

The lesson is that design decisions compound. Small improvements in structure pay off as the system grows.

## Practical Constraints

SDP emphasizes that real projects face constraints:

- Deadlines and resource limits
- Changing requirements
- Team coordination overhead
- Technical debt from shortcuts

The process exists to manage these constraints, not to eliminate them.

## Course Takeaways

- Requirements and design prevent rework later.
- Testing is a first-class engineering activity.
- UML is a communication tool, not bureaucracy.
- Process should match context, not ideology.
- Team collaboration requires explicit coordination.

SDP is a practical foundation for thinking about software development as engineering rather than just coding. The skills transfer directly to industry work.

## Resources

- [Georgia Tech CS 6300 Course Page](https://omscs.gatech.edu/cs-6300-software-development-process)
- [Software Engineering Body of Knowledge (SWEBOK)](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [UML Specification (OMG)](https://www.omg.org/spec/UML/)
- [Agile Manifesto](https://agilemanifesto.org/)
