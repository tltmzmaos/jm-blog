---
title: "Clean Architecture Part 2: SOLID Principles"
description: "The five SOLID principles of object-oriented design explained in depth. SRP, OCP, LSP, ISP, and DIP form the foundation of clean architecture."
pubDate: 2026-01-06
author: "Jongmin Lee"
tags: ["Clean Architecture", "Software Engineering", "Best Practices", "Robert C. Martin", "SOLID", "Design Principles"]
draft: false
---

# Clean Architecture Part 2: SOLID Principles

SOLID is an acronym for five design principles that make software designs more understandable, flexible, and maintainable. These principles are the mid-level building blocks of clean architecture—they guide how we organize code into classes and how those classes interconnect.

---

## What Is SOLID?

The SOLID principles tell us how to arrange our functions and data structures into classes (or similar groupings) and how those classes should be interconnected.

The goal of these principles is the creation of mid-level software structures that:
- **Tolerate change**
- **Are easy to understand**
- **Are reusable** across many software systems

"Mid-level" means these principles apply at the module/class level, above the code level (functions) and below the architecture level (components).

---

## Chapter 7: SRP - Single Responsibility Principle

> "A module should have one, and only one, reason to change."

### The Misconception

Many programmers misunderstand SRP as "a function should do one thing." That's useful advice, but it's not SRP.

SRP is about **who** the module is responsible to, not **what** the module does.

### The Real Definition

> "A module should be responsible to one, and only one, actor."

An **actor** is a group of users or stakeholders who want the system to change in the same way.

### Example: The Employee Class

```java
public class Employee {
    public Money calculatePay();      // CFO's team uses this
    public void save();               // CTO's team uses this
    public int reportHours();         // COO's team uses this
}
```

Three different actors depend on this class:
- **CFO** (Chief Financial Officer): Needs `calculatePay()`
- **CTO** (Chief Technology Officer): Needs `save()`
- **COO** (Chief Operating Officer): Needs `reportHours()`

### The Problem

Suppose `calculatePay()` and `reportHours()` share a common algorithm for calculating regular hours:

```java
private int regularHours() {
    // Shared calculation
}
```

The CFO's team decides overtime rules should change. A developer modifies `regularHours()` for `calculatePay()`. But this accidentally changes `reportHours()` too!

The COO's reports are now wrong. The company loses money. People might get fired.

**Different actors' code should not be coupled.**

### Solution: Separate Classes

```java
public class PayCalculator {
    public Money calculatePay(EmployeeData e);
}

public class HourReporter {
    public int reportHours(EmployeeData e);
}

public class EmployeeSaver {
    public void save(EmployeeData e);
}
```

Now changes for one actor cannot affect another.

If having three classes feels awkward, use the **Facade pattern**:

```java
public class EmployeeFacade {
    private PayCalculator payCalculator;
    private HourReporter hourReporter;
    private EmployeeSaver employeeSaver;

    public Money calculatePay() { return payCalculator.calculatePay(data); }
    public int reportHours() { return hourReporter.reportHours(data); }
    public void save() { employeeSaver.save(data); }
}
```

### SRP at Higher Levels

SRP appears at different levels:
- **Component level:** Common Closure Principle
- **Architecture level:** Axis of change that creates architectural boundaries

---

## Chapter 8: OCP - Open-Closed Principle

> "A software artifact should be open for extension but closed for modification."

### The Goal

If simple extensions require massive changes to existing code, the architecture has failed.

Good architecture allows adding new features by adding new code, not changing existing code.

### Example: Financial Report

A system generates financial reports for a web page. Stakeholders want PDF reports too.

**Bad design:** Modify the existing report generator to handle both formats.

**Good design:** The report generator knows nothing about output format. Web and PDF formatters are plugins.

### Architecture Diagram

```
                    [Financial Data]
                          ↓
              [Financial Report Generator]
                          ↓
               [Report Format Interface]
                     ↙         ↘
            [Web Formatter]  [PDF Formatter]
```

The Report Generator depends on an abstraction (interface). Formatters implement that interface. To add CSV output, just add a new formatter—no existing code changes.

### Directional Control

Notice the dependencies point **toward** the higher-level component:

```
Web Formatter → Interface ← Financial Report Generator
```

The `Financial Report Generator` is protected from changes in formatters. This is the heart of OCP: **protect high-level components from changes in low-level components.**

### Information Hiding

The `Financial Report Generator` doesn't know about specific formatters. It's protected from:
- Changes to formatter implementations
- Addition of new formatters
- Details like HTML or PDF encoding

### The Goal of OCP

Make the system easy to extend without high impact. Achieve this by:
1. Partitioning into components
2. Arranging dependencies so high-level components are protected from changes in low-level components
3. Using abstractions (interfaces) to invert dependencies where needed

---

## Chapter 9: LSP - Liskov Substitution Principle

> "What is wanted here is something like the following substitution property: If for each object o1 of type S there is an object o2 of type T such that for all programs P defined in terms of T, the behavior of P is unchanged when o1 is substituted for o2, then S is a subtype of T."
> — Barbara Liskov, 1988

In simpler terms: **Subtypes must be substitutable for their base types.**

### Example: Rectangle and Square

```java
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int w) { width = w; }
    public void setHeight(int h) { height = h; }
    public int getArea() { return width * height; }
}
```

Mathematically, a square IS a rectangle. So:

```java
public class Square extends Rectangle {
    @Override
    public void setWidth(int w) {
        width = w;
        height = w;  // Must keep width == height
    }

    @Override
    public void setHeight(int h) {
        width = h;   // Must keep width == height
        height = h;
    }
}
```

### The Problem

```java
Rectangle r = getShape();  // Might return Square
r.setWidth(5);
r.setHeight(2);
assert(r.getArea() == 10);  // Fails if r is Square!
```

If `r` is a `Square`, setting width to 5 then height to 2 leaves both at 2. Area is 4, not 10.

**Square is not substitutable for Rectangle.** It violates LSP.

### Architectural Implications

LSP violations lead to type-checking conditionals:

```java
if (shape instanceof Square) {
    // Special handling
} else {
    // Normal handling
}
```

These conditionals spread through the code, coupling components and violating OCP.

### Real-World Example: Taxi Dispatch

A taxi company has a dispatch service with URI:

```
/pickupAddress/%s/pickupTime/%s/destination/%s
```

The company buys other taxi services. Each uses different URIs:
- Company B: `/pickup/%s/%s/dest/%s`
- Company C: `/p/%s/t/%s/d/%s`

Bad solution: Adding conditionals everywhere:

```java
if (company == "B") {
    uri = formatForB(data);
} else if (company == "C") {
    uri = formatForC(data);
} else {
    uri = defaultFormat(data);
}
```

Good solution: Use a configuration database mapping companies to URI formats. Dispatch component remains unchanged.

### LSP Summary

LSP should be extended to interfaces and implementations. Any client using an interface must be able to use any implementation without knowing the difference.

---

## Chapter 10: ISP - Interface Segregation Principle

> "Clients should not be forced to depend on interfaces they do not use."

### The Problem

```java
// Fat interface
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class Robot implements Worker {
    public void work() { /* OK */ }
    public void eat() { /* Robots don't eat! */ }
    public void sleep() { /* Robots don't sleep! */ }
}
```

`Robot` is forced to implement `eat()` and `sleep()` even though they don't apply.

### The Solution: Segregated Interfaces

```java
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public class Human implements Workable, Eatable, Sleepable {
    public void work() { ... }
    public void eat() { ... }
    public void sleep() { ... }
}

public class Robot implements Workable {
    public void work() { ... }
}
```

Now `Robot` only depends on what it uses.

### Architectural Example

Consider three users using one operations class:

```
User1 → op1()  ↘
User2 → op2()  → OPS (has op1, op2, op3)
User3 → op3()  ↗
```

User1 depends on the entire OPS class even though it only uses `op1()`. If `op3()` changes, User1 must recompile even though it doesn't use `op3()`.

Better:

```
User1 → U1Ops (has op1) → OPS
User2 → U2Ops (has op2) → OPS
User3 → U3Ops (has op3) → OPS
```

Each user depends only on the operations it uses.

### ISP and Language

In dynamically typed languages (Python, Ruby, JavaScript), ISP violations are less severe because there's no compile-time dependency on unused methods.

In statically typed languages (Java, C#, C++), ISP violations cause recompilation and redeployment cascades.

### ISP at Architecture Level

Don't depend on modules that contain more than you need. A system depending on a framework pulls in everything that framework depends on—even unused parts.

```
System → Framework → Database
```

Even if System doesn't use the database, a database change might force System to redeploy.

---

## Chapter 11: DIP - Dependency Inversion Principle

> "The most flexible systems are those in which source code dependencies refer only to abstractions, not to concretions."

### What Does This Mean?

- Don't refer to volatile concrete classes. Refer to abstract interfaces instead.
- Don't derive from volatile concrete classes.
- Don't override concrete functions.
- Never mention the name of anything concrete and volatile.

### Stable Abstractions

The `String` class in Java is concrete, but it's extremely stable—it rarely changes. We can tolerate depending on it.

The issue is **volatile** concrete classes—those actively developed and frequently changing. These should be hidden behind interfaces.

### The DIP Diagram

Traditional layered architecture:

```
High-Level Policy
       ↓
Low-Level Details
```

High-level depends on low-level. Changes in low-level ripple up.

With DIP:

```
High-Level Policy → Abstract Interface ← Low-Level Details
```

Both high-level and low-level depend on abstractions. The dependency is **inverted**—low-level now depends on high-level policy.

### Factories

If high-level code must create low-level objects, use factories:

```java
// High-level code
public class Application {
    private ServiceFactory factory;

    public void doSomething() {
        Service s = factory.makeService();  // Creates concrete instance
        s.doWork();
    }
}

// Interface
public interface Service {
    void doWork();
}

public interface ServiceFactory {
    Service makeService();
}

// Low-level implementation
public class ConcreteService implements Service {
    public void doWork() { ... }
}

public class ConcreteServiceFactory implements ServiceFactory {
    public Service makeService() {
        return new ConcreteService();
    }
}
```

The `Application` never mentions `ConcreteService`. It depends only on abstractions.

### The Dependency Rule

Source code dependencies must point only toward higher-level policies:

```
UI → Use Cases → Entities
          ↓           ↓
    (Interfaces) (Interfaces)
          ↑           ↑
   Controllers    Gateways
```

Nothing in an inner circle can know about something in an outer circle.

### Concrete Components

Some concrete code must exist—something has to create the concrete objects. This is typically in `main` or a dependency injection framework.

Think of `main` as the dirtiest component in the system—it creates all the concrete instances and hands them to the abstract, clean components.

### DIP Summary

The DIP tells us:
1. Use interfaces for volatile dependencies
2. Depend on abstractions, not concretions
3. Use factories and DI to create concrete instances
4. Source code dependencies should point toward stability

---

## SOLID Summary

| Principle | Focus | Key Insight |
|-----------|-------|-------------|
| **SRP** | Cohesion | One reason to change (one actor) |
| **OCP** | Extension | Add new code, don't modify existing |
| **LSP** | Substitution | Subtypes must be interchangeable |
| **ISP** | Coupling | Don't depend on unused interfaces |
| **DIP** | Abstraction | Depend on abstractions, not concretions |

Together, these principles help create systems that are:
- **Tolerant of change** (OCP, LSP)
- **Easy to understand** (SRP, ISP)
- **Reusable** (DIP, ISP)
- **Testable** (DIP—mock dependencies easily)

---

## Key Takeaways

1. **SRP is about actors, not functions.** Group code by who uses it, not by what it does.

2. **OCP protects high-level policies.** Arrange dependencies so core business logic doesn't change when details change.

3. **LSP enables substitutability.** If clients need type-checking conditionals, you've violated LSP.

4. **ISP prevents forced dependencies.** Clients shouldn't depend on methods they don't use.

5. **DIP inverts the dependency direction.** Low-level details should depend on high-level policies, not the other way around.

6. **SOLID principles work together.** DIP enables OCP. ISP supports SRP. LSP ensures OCP works with polymorphism.

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [SOLID Principles Explained](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [Dependency Inversion Principle](https://martinfowler.com/articles/dipInTheWild.html)
