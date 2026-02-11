---
title: "Clean Architecture Part 4: Architecture Design"
description: "Core concepts of clean architecture including independence, boundaries, business rules, and the famous Clean Architecture diagram. Learn how to design systems that are testable, flexible, and independent of frameworks."
pubDate: 2026-01-14
author: "Jongmin Lee"
tags: ["Clean Architecture", "Software Engineering", "Best Practices", "Robert C. Martin", "Architecture"]
draft: false
---

# Clean Architecture Part 4: Architecture Design

This part covers the heart of clean architecture: what architecture actually is, how to achieve independence from frameworks and databases, how to draw boundaries, and the famous Clean Architecture pattern itself.

---

## Chapter 15: What Is Architecture?

### The Goal

The goal of software architecture is to minimize the human resources required to build and maintain the system.

The strategy is to **leave as many options open as possible, for as long as possible.**

### Development

A small team of five can work efficiently with no architecture. But as teams grow, you need well-defined components with stable interfaces.

Architecture must support development efficiency at all team sizes.

### Deployment

The architecture should make deployment easy. **A system that cannot be easily deployed is not useful.**

If deployment requires manual configuration of dozens of servers and obscure scripts, the architecture failed. Good architectures make deployment a single, trivial action.

### Operation

Architecture affects operation, but hardware is cheap. An inefficient architecture can often be solved by throwing more servers at it.

However, architecture should make operation obvious. The system's structure should **scream** its use cases. A new developer should immediately understand what the system does.

### Maintenance

Of all concerns, maintenance is the most expensive. **Spelunking**—digging through existing code to figure out where to make changes and how to avoid breaking things—dominates maintenance costs.

Good architecture reduces spelunking by separating concerns into well-defined components.

### Keeping Options Open

All software systems can be decomposed into two elements:
- **Policy:** Business rules, the value of the system
- **Details:** Things needed for humans/machines to communicate with policy (databases, web, frameworks)

Good architecture defers details. It allows you to delay decisions about:
- Database vendor
- Web server
- REST vs GraphQL
- Dependency injection framework

**The longer you wait to make these decisions, the more information you have to make them correctly.**

A good architect maximizes the number of decisions NOT made.

---

## Chapter 16: Independence

A good architecture must support:
- **Use cases:** The system's purpose
- **Operation:** Performance, scalability
- **Development:** Team organization
- **Deployment:** Ease of deployment

### Use Cases

Architecture should make use cases visible. Looking at the code structure should reveal the system's intent.

A shopping cart system should have classes named `AddItemToCart`, `RemoveItemFromCart`, `Checkout`—not `RequestHandler`, `DataProcessor`, `Manager`.

### Operation

Some systems need to handle 100,000 users simultaneously. Others process transactions that must complete in milliseconds. Architecture must support operational requirements.

**But don't over-architect early.** Design for today's requirements. A well-designed system can be transformed for different operational needs later.

### Development

**Conway's Law:** "Organizations design systems that mirror their own communication structure."

A system developed by five teams should have five components, one per team. Architecture must support team structure.

### Deployment

The goal is **immediate deployment**—a single action to deploy after build and test. Architecture should not require manual steps, server configurations, or file manipulations.

### Decoupling Layers

Horizontal layers to separate:
- **UI**
- **Application-specific business rules** (use cases)
- **Application-independent business rules** (entities)
- **Database**

### Decoupling Use Cases

Different use cases change for different reasons. The "add order" use case has different change reasons than "delete order."

Separate them vertically. Each use case slices through all horizontal layers.

### The Decoupling Modes

Three levels of decoupling:

**Source level:** Modules separated by source files. Same address space, communicate via function calls.

**Deployment level:** Modules in separate deployable units (JARs, DLLs). Same machine, communicate via inter-process calls.

**Service level:** Modules as independent services. Different machines, communicate via network.

**Start at source level.** Move to deployment or service level when needed. Over-engineering toward microservices early is a common mistake.

### Duplication

**Real duplication:** The same code that changes for the same reasons. Consolidate it.

**Accidental duplication:** Code that looks similar but serves different purposes and will diverge. Keep it separate.

Two use cases might have identical screen layouts today. That doesn't mean they should share code—they have different reasons to change.

---

## Chapter 17: Boundaries: Drawing Lines

Architecture is the art of drawing lines—**boundaries**—that separate software elements and restrict each side from knowing about the other.

### The Database Is a Detail

The database is a detail. The business rules don't need to know about the database schema.

Draw a boundary between business rules and database:

```
[Business Rules] → [Database Interface] ← [Database Access]
```

Business rules depend on the interface. Database access implements it. Business rules don't know (or care) whether data comes from SQL, NoSQL, files, or memory.

### The GUI Is a Detail

The GUI is a detail. Business rules shouldn't know about HTML, REST, or buttons.

```
[Business Rules] → [View Interface] ← [Web UI]
                                    ← [Mobile UI]
                                    ← [CLI]
```

Multiple UIs can plug into the same business rules.

### Plugin Architecture

The result is a **plugin architecture:**

```
           ┌─────────────────┐
           │  Business Rules │
           │    (Entities)   │
           └────────┬────────┘
                    │
         ┌──────────┼──────────┐
         ↓          ↓          ↓
    [Database]   [Web UI]   [External APIs]
```

Details are plugins to business rules. Business rules are protected from changes in details.

This inverts the traditional dependency direction where business rules depend on the database.

---

## Chapter 18: Boundary Anatomy

### Boundary Crossing

At runtime, a boundary crossing is just a function call from one side to the other. But source code dependencies must point in the right direction—**toward higher-level components.**

### The Dreaded Monolith

Even monoliths have boundaries—they're just internal module boundaries. Source-level decoupling.

Good boundaries in a monolith mean:
- Faster compilation (only recompile changed modules)
- Easier testing (mock dependencies)
- Clearer code (understand one module at a time)

### Deployment Components

JARs, DLLs, shared libraries. Communication is still function calls (same process), but deployment is separate.

### Threads

Threads are not architectural boundaries. Both single-threaded and multi-threaded systems can have good or bad architecture. Threads are an execution model, not a structural element.

### Local Processes

Separate processes on the same machine. Communicate via sockets, shared memory, message queues.

The boundary is physical—processes can't call each other's functions directly.

### Services

Strongest boundary. Separate machines, network communication.

Services assume nothing about physical location of the other party. All communication via network.

---

## Chapter 19: Policy and Level

Software systems are policies—statements of how inputs transform to outputs.

### Level

**Level** = distance from inputs and outputs.

- **Low-level:** Policies that deal directly with inputs and outputs
- **High-level:** Policies that are furthest from inputs and outputs

```
    High Level
        ↓
  [Business Rules]
        ↓
   [Use Cases]
        ↓
  [Controllers]
        ↓
    [Devices]
        ↓
    Low Level
```

### The Direction of Dependencies

Source code dependencies should point **toward higher levels.**

Low-level components depend on high-level components. Changes in low-level (I/O devices, formats) shouldn't affect high-level (business rules).

### Example: Encryption Program

```
Characters ← Read → Translate → Write → Characters
```

Naive implementation:

```c
void encrypt() {
    while(true) {
        char c = readChar();
        char encrypted = translate(c);
        writeChar(encrypted);
    }
}
```

This couples high-level (`translate`) to low-level (`readChar`, `writeChar`).

Better:

```
[Translate Policy] → [Character Reader Interface] ← [Console Reader]
                   → [Character Writer Interface] ← [Console Writer]
```

Now `Translate` doesn't know where characters come from or go to. It's reusable with file I/O, network I/O, or anything else.

---

## Chapter 20: Business Rules

### Entities

**Entities** are the most general business rules—things that would exist even without automation.

A `Loan` entity has:
- Principle
- Rate
- Period
- `makePayment()` method
- `applyInterest()` method

These rules exist whether or not there's a computer system. A banker in 1850 would recognize them.

Entities are the **highest-level** policies. They change only when the business itself changes.

### Use Cases

**Use Cases** are application-specific business rules. They describe how automated systems interact with entities.

A bank clerk processing a loan application follows a use case:
1. Gather customer info
2. Verify credit score
3. Create loan entity
4. Calculate terms
5. Present offer

Use cases orchestrate entities but don't contain entity logic.

### Request and Response Models

Use cases accept **request models** and return **response models.**

```java
public class CreateLoanRequest {
    public String customerName;
    public double principal;
    public int termMonths;
}

public class CreateLoanResponse {
    public boolean approved;
    public double monthlyPayment;
    public String loanId;
}
```

Request/response models should **not** be entities. They're data transfer objects for the boundary. This prevents entity changes from rippling to controllers.

---

## Chapter 21: Screaming Architecture

### The Theme

When you look at a building blueprint, it screams its purpose: "I'm a house!" or "I'm a library!"

When you look at software architecture, what does it scream? "I'm Rails!" or "I'm Spring!" is wrong.

**It should scream: "I'm a health care system!" or "I'm an accounting system!"**

### The Purpose of Architecture

Frameworks are tools, not architecture. Architecture should tell you what the system does, not what it's built with.

### But What About the Web?

The web is a delivery mechanism—a detail. Your architecture shouldn't be dominated by the fact that it's delivered over HTTP.

A good architecture lets you defer the web. You should be able to test all business rules without a web server.

### Frameworks Are Details

Frameworks want to couple to your code. They want you to derive from their base classes, import their packages everywhere.

**Don't marry the framework.** Keep it at arm's length. Use it in low-level components. Don't let it infect your entities and use cases.

### Testable Architectures

If your architecture is good, you can test business rules without:
- The database
- The web server
- The framework
- Any external agency

Business rules should be testable in isolation, with simple test data injected through interfaces.

---

## Chapter 22: The Clean Architecture

This is the famous diagram:

```
                    ┌─────────────────────────────────┐
                    │         External Interfaces     │
                    │   (Web, DB, Devices, External)  │
                    ├─────────────────────────────────┤
                    │                                 │
                    │     Interface Adapters          │
                    │  (Controllers, Gateways,        │
                    │   Presenters)                   │
                    ├─────────────────────────────────┤
                    │                                 │
                    │       Application Business      │
                    │       Rules (Use Cases)         │
                    │                                 │
                    ├─────────────────────────────────┤
                    │                                 │
                    │     Enterprise Business Rules   │
                    │          (Entities)             │
                    │                                 │
                    └─────────────────────────────────┘

        Dependencies point INWARD →
```

### The Dependency Rule

> "Source code dependencies must point only inward, toward higher-level policies."

Nothing in an inner circle can know anything about an outer circle. The name of something declared in an outer circle must not be mentioned in an inner circle.

### The Layers

**Entities (innermost):** Enterprise-wide business rules. These could be shared across many applications.

**Use Cases:** Application-specific business rules. Orchestrate entities to achieve application goals.

**Interface Adapters:** Convert data between use cases/entities and external formats (web, database).

**Frameworks & Drivers (outermost):** Web frameworks, database drivers, external APIs. The glue code.

### Crossing Boundaries

When crossing a boundary, data should be in the form most convenient for the inner circle:
- **Inward calls:** Request models specific to use cases
- **Outward returns:** Response models specific to use cases

Don't pass entity objects across boundaries—use simple data structures.

### A Typical Scenario

1. **Web Controller** receives HTTP request, converts to `CreateOrderRequest`
2. **Use Case Interactor** receives request, calls entities
3. **Entities** perform business logic, return results
4. **Interactor** creates `CreateOrderResponse`
5. **Presenter** formats response for web
6. **View** renders HTML/JSON

```
HTTP Request → Controller → Use Case → Entities
                               ↓
HTTP Response ← Presenter ← Use Case
```

### Which Data Crosses Boundaries?

Simple data structures. Rows from the database should be converted to entity-like structures before reaching use cases. Use cases should return simple response objects, not entities.

**Why?** Data structures that cross boundaries can become "tramp data"—passed through many layers unchanged. This couples layers unnecessarily.

---

## Key Takeaways

1. **Architecture maximizes decisions not made.** Defer details (database, framework, UI) as long as possible.

2. **Boundaries separate policy from detail.** Business rules should never depend on how data is stored or displayed.

3. **The Dependency Rule is paramount.** All source code dependencies point inward, toward high-level policies.

4. **Entities are the core.** They represent pure business rules that exist independent of the application.

5. **Use cases orchestrate entities.** They're application-specific but still independent of delivery mechanism.

6. **Architecture should scream purpose.** Looking at the code structure should reveal what the system does, not what framework it uses.

7. **Testability is the litmus test.** If you can test business rules without the framework, database, and web server, your architecture is good.

8. **Plugin architecture protects the center.** Details (DB, UI) are plugins to the business rules, not the other way around.

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [The Clean Architecture Blog Post](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
