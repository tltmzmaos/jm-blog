---
title: "Clean Architecture Part 6: Details and Case Study"
description: "Why databases, web, and frameworks are details, not architecture. Includes a complete video sales case study and the missing chapter on package structure."
pubDate: 2026-01-22
author: "Jongmin Lee"
tags: ["Clean Architecture", "Software Engineering", "Best Practices", "Robert C. Martin", "Case Study"]
draft: false
---

# Clean Architecture Part 6: Details and Case Study

This final part challenges common assumptions: databases, the web, and frameworks are all **details**, not architecture. The book concludes with a case study applying these principles and a "missing chapter" on organizing code by package.

---

## Chapter 30: The Database Is a Detail

### The Claim

From the architecture's perspective, the database is a detail. It's a mechanism for storing and retrieving data—nothing more.

### The Data Model Is Not the Architecture

The structure of your data is architecturally significant. The mechanism for storing it is not.

A relational database, document store, graph database, or flat files—these are all interchangeable from the business rules' perspective.

### Why Databases Dominate Our Thinking

Databases emerged when disk space was expensive and slow. We needed sophisticated systems to manage data efficiently.

But:
- Memory is cheap now
- Many applications could run entirely in RAM
- The database is often just a detail of how data persists

### The Disk Is a Detail

We organize data into rows, tables, and indexes because of disk characteristics (seek time, rotation latency). These are implementation details that shouldn't leak into business rules.

### What About Performance?

Performance is a concern, but it's a low-level detail. You can:
- Optimize the data access layer
- Add caching
- Use indexes

All without changing business rules.

### In Practice

```
[Business Rules]
       ↓
[Data Access Interface]
       ↓
[Database Implementation]
       ↓
[PostgreSQL / MongoDB / In-Memory]
```

Business rules use the interface. The implementation can be swapped. Tests use in-memory storage.

### Anecdote

Martin tells of working at a company where the architects said "we won't have a database." They stored everything in memory with file-based persistence.

Later, when they added a database, it was a simple addition—a low-level plugin. The architecture didn't change.

---

## Chapter 31: The Web Is a Detail

### The Oscillating Model

The web represents the latest swing in an ongoing oscillation:

1. **Centralized:** Mainframes with dumb terminals
2. **Distributed:** PCs with local processing
3. **Centralized:** Web servers with thin browsers
4. **Distributed:** Rich JavaScript clients
5. **Centralized:** Server-side rendering
6. **Distributed:** Single-page applications

This oscillation will continue. Build your architecture to survive it.

### The Web Is Just Another Delivery Mechanism

Like a console application, desktop GUI, or mobile app, the web is a way to deliver your application's functionality.

**Architecture should not be dominated by the delivery mechanism.**

### The Upshot

The GUI (whether web or otherwise) is a detail. Business rules should not know:
- Whether they're being accessed via HTTP
- What format the data arrives in (JSON, XML, forms)
- What the response format is

### Practical Architecture

```
[Business Rules / Use Cases]
           ↓
[Delivery Mechanism Interface]
           ↓
[Web Controller] or [CLI Handler] or [Mobile API]
```

The same use cases serve web, mobile, command line, and future delivery mechanisms we haven't invented yet.

### Example

```java
// Use case - knows nothing about web
public class CreateOrder {
    public CreateOrderResponse execute(CreateOrderRequest request) {
        // Business logic
        return new CreateOrderResponse(...);
    }
}

// Web adapter - translates HTTP to use case
@PostMapping("/orders")
public ResponseEntity<OrderDto> createOrder(@RequestBody OrderDto dto) {
    CreateOrderRequest request = toRequest(dto);
    CreateOrderResponse response = createOrder.execute(request);
    return ResponseEntity.ok(toDto(response));
}
```

Change the web framework? Only the adapter changes.

---

## Chapter 32: Frameworks Are Details

### The Framework Authors' Perspective

Framework authors solve problems for a wide audience. They want you to:
- Derive from their base classes
- Import their packages everywhere
- Put your code in their containers

They're not thinking about your specific architecture.

### The Asymmetric Marriage

When you adopt a framework, you make a huge commitment. The framework makes no commitment back.

**You marry the framework. It doesn't marry you.**

If the framework works for you, great. If not, you're stuck. Divorce is messy and expensive.

### The Risks

**Framework evolution:** Frameworks change. APIs become deprecated. Upgrade paths break compatibility.

**Feature creep:** Frameworks add features you don't need, increasing complexity and potential vulnerabilities.

**Abandonment:** Frameworks can be abandoned. The community moves on, leaving your code stranded.

### The Solution

**Don't marry the framework.** Keep it at arm's length.

- Treat the framework as a detail that belongs in the outer circles
- Don't derive domain entities from framework base classes
- Don't let framework annotations pollute your use cases
- Create interfaces that you own, with adapters to the framework

### Practical Examples

**Bad:** Entity coupled to framework

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue
    private Long id;

    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItem> items;
}
```

Hibernate annotations throughout. Can't test without Hibernate. Can't use with a different persistence mechanism.

**Better:** Separate domain and persistence

```java
// Domain entity - pure Java
public class Order {
    private OrderId id;
    private List<OrderItem> items;

    public void addItem(OrderItem item) { ... }
    public Money calculateTotal() { ... }
}

// Persistence model - framework-specific
@Entity
@Table(name = "orders")
public class OrderJpaEntity {
    @Id @GeneratedValue
    private Long id;
    // mapping details
}

// Mapper between them
public class OrderMapper {
    public Order toDomain(OrderJpaEntity entity) { ... }
    public OrderJpaEntity toJpa(Order order) { ... }
}
```

More code, but domain logic is clean and testable.

### When to Embrace Frameworks

Some frameworks are so fundamental that wrapping them adds no value:
- Standard library (String, List, etc.)
- Mature, stable frameworks (C++ STL, Java Collections)

The more volatile and opinionated a framework, the more you should isolate it.

---

## Chapter 33: Case Study: Video Sales

Martin walks through designing a system for selling videos online.

### Use Cases

**Actors:**
- Viewer (watches videos)
- Purchaser (buys access to videos)
- Administrator (manages catalog)

**Viewer use cases:**
- Browse catalog
- View purchased content
- Watch video

**Purchaser use cases:**
- Purchase video
- View purchase history

**Administrator use cases:**
- Add videos
- Delete videos
- Configure pricing

### Component Architecture

Following clean architecture principles:

```
                    ┌────────────┐
                    │   Views    │
                    │   (Web)    │
                    └─────┬──────┘
                          │
              ┌───────────┼───────────┐
              ↓           ↓           ↓
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ Catalog │ │ Purchase│ │  Admin  │
        │ View    │ │ View    │ │  View   │
        └────┬────┘ └────┬────┘ └────┬────┘
             │           │           │
             ↓           ↓           ↓
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ Catalog │ │ Purchase│ │  Admin  │
        │Use Cases│ │Use Cases│ │Use Cases│
        └────┬────┘ └────┬────┘ └────┬────┘
             │           │           │
             └───────────┼───────────┘
                         ↓
                   ┌───────────┐
                   │  Entities │
                   │ (License, │
                   │  Video,   │
                   │  User)    │
                   └─────┬─────┘
                         ↓
                   ┌───────────┐
                   │ Gateways  │
                   └─────┬─────┘
                         ↓
                   ┌───────────┐
                   │ Database  │
                   └───────────┘
```

### Dependency Direction

All dependencies point inward:
- Views depend on Use Cases
- Use Cases depend on Entities
- Gateways depend on Entity interfaces

Database is at the bottom—a detail that can be swapped.

### Decoupling Modes

The diagram shows components that could be:
- **Source-level:** All in one codebase
- **Deployment-level:** Separate JARs, deployed together
- **Service-level:** Separate processes/containers

Start with source-level. Move to services if operational requirements demand.

### The Key Insights

1. **Separate by actor:** Each actor's use cases are grouped
2. **Entities are shared:** Common business objects in the center
3. **Views are plugins:** Multiple UI types can connect
4. **Databases are plugins:** The gateway abstraction allows swapping

---

## Chapter 34: The Missing Chapter

By Simon Brown (author of "Software Architecture for Developers")

This chapter addresses: How do you organize code in packages?

### Package by Layer

Traditional approach—organize by technical layer:

```
com.example.myapp
├── controllers/
│   └── OrderController.java
├── services/
│   └── OrderService.java
├── repositories/
│   └── OrderRepository.java
└── entities/
    └── Order.java
```

**Problems:**
- Similar-looking structure regardless of domain
- Horizontal slicing encourages bypassing layers
- Easy to break encapsulation

### Package by Feature

Organize by business feature:

```
com.example.myapp
├── orders/
│   ├── OrderController.java
│   ├── OrderService.java
│   ├── OrderRepository.java
│   └── Order.java
└── users/
    ├── UserController.java
    └── ...
```

**Better:** Related code is together. Adding a feature means adding one package, not touching every layer.

**Still problematic:** Doesn't reflect clean architecture's dependency direction.

### Ports and Adapters

Reflect the clean architecture:

```
com.example.myapp
├── orders/
│   ├── domain/
│   │   ├── Order.java
│   │   └── OrderRepository.java (interface)
│   ├── application/
│   │   └── OrderService.java
│   └── infrastructure/
│       ├── web/
│       │   └── OrderController.java
│       └── persistence/
│           └── JpaOrderRepository.java
```

**Clear dependency direction:** Domain knows nothing about infrastructure. Infrastructure implements domain interfaces.

### Package by Component

Simon Brown's preferred approach:

```
com.example.myapp
├── orders/
│   ├── OrdersComponent.java (facade)
│   ├── OrdersComponentImpl.java
│   ├── Order.java
│   └── internal/
│       ├── OrderRepository.java
│       └── OrderValidator.java
└── web/
    └── OrderController.java
```

**Key idea:** The component has a public interface (`OrdersComponent`) and hides internal details. The web layer uses only the public interface.

### Access Modifiers Matter

In Java/C#, package structure affects visibility:

```java
// Public - accessible everywhere
public class OrdersComponent { }

// Package-private - only within package
class OrderValidator { }
```

Use access modifiers to enforce architecture! Make implementation details package-private so other packages can't bypass the public interface.

### The Devil Is in the Implementation Details

The real test: **Can your code compile if someone violates the architecture?**

If `OrderController` can directly call `OrderRepository` (bypassing `OrderService`), the architecture isn't enforced.

Options to enforce:
- **Compile-time:** Access modifiers, module systems (Java 9 modules)
- **Build-time:** ArchUnit, ArchGuard, or similar tools
- **CI:** Automated architecture checks

### Closing Thoughts

Package structure should:
1. **Reflect your architecture** (not just convention)
2. **Enforce the dependency rule** (with access modifiers)
3. **Make the codebase screaming obvious** (feature-focused)
4. **Be validated automatically** (tests, CI checks)

---

## Key Takeaways

1. **Database is a detail.** Your business rules shouldn't care whether data lives in PostgreSQL, MongoDB, or memory.

2. **The web is a detail.** It's just another delivery mechanism. Don't let HTTP concepts pollute business logic.

3. **Frameworks are details.** Keep them at arm's length. Don't marry them—wrap them in adapters you control.

4. **Use cases drive architecture.** Organize by what the system does (use cases), not what it's built with (frameworks).

5. **Package structure matters.** It should reflect architecture and be enforced by access modifiers or tooling.

6. **Enforce architecture with code.** If violations compile, they'll happen. Use access modifiers, modules, and automated checks.

7. **Architecture is about change.** Details (database, web, framework) will change. Protect business rules from that change.

---

## The Complete Clean Architecture

After reading all six parts, you now understand:

1. **Why architecture matters** (minimize cost of change)
2. **Three paradigms** (structured, OO, functional)
3. **SOLID principles** (class-level design)
4. **Component principles** (cohesion and coupling)
5. **Clean architecture** (the dependency rule, boundaries)
6. **Implementation** (humble objects, services, testing)
7. **Details** (database, web, frameworks)

The unifying theme: **Protect high-level policies from low-level details.** Make the center of your application—the business rules—stable and independent. Let everything else be a plugin that can be swapped.

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Software Architecture for Developers by Simon Brown](https://leanpub.com/software-architecture-for-developers)
- [ArchUnit - Test Architecture](https://www.archunit.org/)
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
