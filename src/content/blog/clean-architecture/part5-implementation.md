---
title: "Clean Architecture Part 5: Architecture Implementation"
description: "Practical implementation of clean architecture covering presenters, humble objects, partial boundaries, the main component, services, testing, and embedded systems."
pubDate: 2026-01-18
author: "Jongmin Lee"
tags: ["Clean Architecture", "Software Engineering", "Best Practices", "Robert C. Martin", "Implementation"]
draft: false
---

# Clean Architecture Part 5: Architecture Implementation

This part covers the practical implementation of clean architecture: how to handle presentation, when to use partial boundaries, the role of the main component, the truth about services, testing strategies, and applying clean architecture to embedded systems.

---

## Chapter 23: Presenters and Humble Objects

### The Humble Object Pattern

The **Humble Object Pattern** separates hard-to-test behaviors from easy-to-test behaviors.

**Example:** GUIs are hard to test. Behavior that controls the GUI is easy to test. Separate them:

- **View (Humble Object):** Contains only the simplest possible code to display data. Hard to test but has almost no logic.
- **Presenter:** Prepares data for display. Easy to test, contains all the logic.

### Presenters and Views

**Presenter:** Accepts data from the application and formats it for presentation.

```java
public class OrderPresenter {
    public OrderViewModel present(OrderResponse response) {
        return new OrderViewModel(
            formatCurrency(response.total),
            formatDate(response.orderDate),
            response.items.stream()
                .map(this::formatItem)
                .collect(toList())
        );
    }
}
```

**View:** Takes the ViewModel and displays it. No logic—just rendering.

```java
public class OrderView {
    public void render(OrderViewModel vm) {
        // Just puts strings on screen
        totalLabel.setText(vm.formattedTotal);
        dateLabel.setText(vm.formattedDate);
        itemList.setItems(vm.formattedItems);
    }
}
```

The View is "humble"—it's so simple it doesn't need testing.

### Testing and Architecture

Humble objects appear at architectural boundaries:

- **Database Gateway:** The interactor uses a gateway interface. The implementation (humble object) just moves data to/from the database.
- **ORM:** The ORM is a humble object between gateways and the database.
- **Service Listeners:** Parse incoming data (humble), then pass to interactors for processing.

### Humble Object Summary

At every architectural boundary:
- Put logic in the testable side
- Keep the hard-to-test side "humble"

This makes the system testable while keeping the architecture clean.

---

## Chapter 24: Partial Boundaries

Full architectural boundaries are expensive:
- Interface definitions
- Input/output data structures
- Dependency management
- Two separate components to maintain

Sometimes you anticipate needing a boundary but don't want to pay the full cost yet.

### Skip the Last Step

Implement all the interfaces and data structures, but keep everything in the same component:

```
[Component]
├── UseCase
├── UseCaseInterface  ← boundary exists
├── Repository
└── RepositoryInterface  ← boundary exists
```

The code is structured for separation, but deployment is together. Later, splitting is easy.

**Risk:** Without separate compilation, discipline may erode. Developers might bypass the interfaces.

### One-Dimensional Boundaries

Full boundaries have interfaces on both sides. A simpler approach uses the **Strategy pattern**—interface on only one side:

```
[Client] → [ServiceBoundary Interface] ← [ServiceImpl]
```

The client depends on the interface. The implementation can be swapped. But no interface protects the service from the client.

**Useful when:** You need to swap implementations but clients are stable.

### Facades

The simplest partial boundary. A **Facade** class provides methods that call the underlying services:

```java
public class ServiceFacade {
    private Service1 service1;
    private Service2 service2;

    public void operation1() { service1.op(); }
    public void operation2() { service2.op(); }
}
```

**Trade-off:** Client depends on the Facade, Facade depends on all services. The client is transitively coupled to all services.

**Useful when:** You want to simplify an API but don't need true independence.

### When to Use Partial Boundaries

- **Early in a project:** When you suspect a boundary will be needed but aren't certain
- **Budget constraints:** When full boundaries are too expensive right now
- **Evolutionary design:** Start partial, upgrade to full if needed

**Warning:** Partial boundaries can degrade over time. If you never need the full boundary, the partial boundary is pure overhead.

---

## Chapter 25: Layers and Boundaries

### Hunt the Wumpus Example

Martin uses a text adventure game to explore boundaries:

**First attempt:** Separate game rules from UI

```
[Game Rules] → [UI Boundary] ← [Text UI]
```

**But then:** What if we want multiple languages? Add a language boundary:

```
[Game Rules] → [Language Boundary] ← [English]
                                   ← [Spanish]
```

**And then:** What about data storage? Game state persistence?

```
[Game Rules] → [Data Storage Boundary] ← [Flash Storage]
                                       ← [Cloud Storage]
```

### The Architecture Keeps Evolving

Every time we think we have the boundaries right, a new requirement appears. The architecture must evolve.

**Key insight:** You can't predict all boundaries upfront. Design for known requirements, watch for emerging boundaries.

### Boundaries Everywhere?

You could put boundaries everywhere "just in case." But:
- Boundaries are expensive
- YAGNI (You Aren't Gonna Need It) applies

**Balance:** Recognize where boundaries are likely. Don't implement them until necessary, but keep the code structured so adding them is easy.

### Watch for Warning Signs

Signs you might need a boundary:
- "If we change X, we have to change Y too"
- "We can't test X without Y"
- "Team A keeps breaking Team B's code"

When these appear, consider adding or strengthening a boundary.

---

## Chapter 26: The Main Component

### The Dirtiest Component

Every system has at least one component that creates, coordinates, and oversees the others. This is **Main**.

Main is the **dirtiest** component—it depends on everything else. It's at the outermost circle of the clean architecture.

### Main's Responsibilities

1. **Create factories, strategies, and other global facilities**
2. **Hand them to higher-level components via dependency injection**
3. **Then transfer control to the abstract, clean components**

```java
public class Main {
    public static void main(String[] args) {
        // Create infrastructure
        Database db = new PostgresDatabase(config);
        EmailService email = new SmtpEmailService(config);

        // Create use case with injected dependencies
        OrderRepository repo = new SqlOrderRepository(db);
        OrderInteractor interactor = new OrderInteractor(repo, email);

        // Create and start the application
        WebServer server = new WebServer(interactor);
        server.start();
    }
}
```

### Main as Plugin

Think of Main as a **plugin** to the application.

You might have:
- `MainDev` for development (in-memory database, console email)
- `MainTest` for testing (mocks)
- `MainProd` for production (real services)

Each Main configures the application differently, but the core architecture remains unchanged.

### Configuration

Main handles configuration:
- Read environment variables
- Parse command-line arguments
- Load configuration files

Then it translates configuration into dependencies and injects them.

---

## Chapter 27: Services: Great and Small

### The Service Illusion

**Myth:** Microservices are inherently good architecture.

**Reality:** Services are just another way to deploy components. They don't automatically create good architecture.

### Services Are Not Architecture

Two fallacies about services:

**Fallacy 1: Services are decoupled**

Services can be just as coupled as a monolith. If Service A breaks when Service B changes its API, they're coupled.

**Fallacy 2: Services support independent development**

Large teams can work on a monolith with good component boundaries. Small teams can struggle with poorly-designed services.

### The Problem with Coupling

Services often share:
- Data schemas
- API contracts
- Timing assumptions
- Error handling conventions

Changes to shared elements affect all services. This is coupling, regardless of network boundaries.

### The Value of Services

Services DO provide:
- **Scalability:** Scale individual services independently
- **Deployment:** Deploy individual services independently
- **Development:** Separate code bases, separate repos

But these are **operational** benefits, not **architectural** benefits.

### Architecture First, Services Second

Good monolith architecture > Bad service architecture

1. Design good boundaries (interfaces, use cases, entities)
2. Implement as a monolith with those boundaries
3. Deploy as services IF operational requirements demand it

Don't start with services hoping they'll create good architecture.

---

## Chapter 28: The Test Boundary

### Tests Are Part of the System

Tests are not separate from the system—they're part of its architecture. They must be designed with the same care as production code.

### The Fragile Tests Problem

Tests that are coupled to volatile things break often:
- Tests that depend on GUI details break when GUI changes
- Tests that depend on data structures break when structures change
- Tests that use production databases break when data changes

**Result:** Teams disable or delete tests. Quality suffers.

### Design for Testability

Create a **testing API** that decouples tests from volatile elements:

```java
// Instead of testing via GUI
clickButton("submit");
assertTextDisplayed("Order confirmed");

// Test via API
OrderResponse response = orderApi.submitOrder(testOrder);
assertEquals("CONFIRMED", response.status);
```

The testing API:
- Bypasses security, database setup, and other obstacles
- Provides direct access to business rules
- Is stable even when delivery mechanisms change

### Structural Coupling

Tests should not know about production code structure. If tests know about every class and function, refactoring becomes impossible.

**Solution:** Test through stable APIs (use cases, business rules), not through implementation details.

### The Testing API

The testing API is a separate component:

```
[Tests] → [Testing API] → [Use Cases] → [Entities]
                ↓
         [Test Utilities]
         [Test Database]
```

The Testing API might include:
- Factories for creating test objects
- Helpers for verifying results
- Shortcuts that bypass irrelevant complexity

### Security Concerns

The Testing API creates a security risk—it bypasses normal access controls. Solutions:
- Only include in test builds
- Keep in separate repository
- Use feature flags to disable in production

---

## Chapter 29: Clean Embedded Architecture

Embedded systems face unique challenges: limited resources, direct hardware access, real-time requirements. Clean architecture still applies.

### The Problem

Many embedded systems are **firmware**—code tightly coupled to hardware. This makes code:
- Impossible to test without hardware
- Impossible to reuse on different hardware
- Expensive to maintain when hardware changes

### The Target-Hardware Bottleneck

If you can only test on target hardware:
- Development is slow (limited hardware access)
- Testing is slow (manual setup)
- Hardware bugs and software bugs are mixed

**Clean architecture separates software from hardware.**

### The Layers

Embedded systems need three layers:

**1. Software Layer**
Application-specific business logic. Knows nothing about hardware.

**2. Operating System Abstraction Layer (OSAL)**
Abstracts the OS. Provides threading, memory, timing services through interfaces.

**3. Hardware Abstraction Layer (HAL)**
Abstracts the hardware. Provides sensor readings, actuator control through interfaces.

```
[Software (Business Rules)]
           ↓
[Operating System Abstraction Layer]
           ↓
[Hardware Abstraction Layer]
           ↓
[Firmware & Hardware]
```

### Example: LED Control

**Without HAL:**
```c
// Directly manipulates hardware register
void turnOnLed() {
    *GPIO_PORT_A |= (1 << 5);
}
```

Can't test without hardware. Can't port to different hardware.

**With HAL:**
```c
// Interface
void Led_TurnOn(Led led);
void Led_TurnOff(Led led);

// Implementation (can be swapped)
void Led_TurnOn(Led led) {
    *GPIO_PORT_A |= (1 << led.pin);
}
```

Now you can:
- Mock the LED interface for testing
- Swap implementations for different hardware
- Test business logic on a PC

### Benefits

1. **Testability:** Test business logic without hardware
2. **Portability:** Change hardware with minimal code changes
3. **Maintainability:** Hardware experts work on HAL, software experts work on business logic
4. **Reusability:** Business logic works on multiple hardware platforms

### The Importance of Interfaces

Interfaces are even more important in embedded systems because hardware changes are common:
- Chip shortages force component swaps
- New revisions have different registers
- Same product on different hardware platforms

Investing in clean architecture pays dividends in embedded development.

---

## Key Takeaways

1. **Humble Objects make testing possible.** Put logic in testable components, keep hard-to-test components "humble."

2. **Partial boundaries are a trade-off.** Use them to prepare for future separation without paying full cost today.

3. **Main is the dirtiest component.** It creates everything and injects dependencies. Think of it as a plugin.

4. **Services ≠ Architecture.** Services provide operational benefits but don't automatically create good architecture. Design boundaries first.

5. **Tests are architectural components.** Design for testability. Create stable testing APIs. Avoid structural coupling.

6. **Embedded systems need clean architecture too.** Hardware abstraction layers enable testing, portability, and maintainability.

7. **Boundaries evolve.** You can't predict all boundaries upfront. Design for what you know, watch for signals, and add boundaries when needed.

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Humble Object Pattern](https://martinfowler.com/bliki/HumbleObject.html)
- [Testing on the Toilet: Testing APIs](https://testing.googleblog.com/)
- [Hardware Abstraction Layer Design](https://www.embedded.com/introduction-to-hardware-abstraction-layers-for-socs/)
