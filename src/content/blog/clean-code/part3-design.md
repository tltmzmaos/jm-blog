---
title: "Clean Code Part 3: Testing and Class Design"
description: "Advanced clean code concepts covering boundaries with third-party code, unit testing best practices, class design principles, and system architecture."
pubDate: 2025-12-22
author: "Jongmin Lee"
tags: ["Clean Code", "Software Engineering", "Best Practices", "Robert C. Martin", "Testing", "TDD"]
draft: false
---

# Clean Code Part 3: Testing and Class Design

This part covers how to handle boundaries with external code, write effective unit tests, design clean classes, and think about systems at scale. These chapters bridge the gap between writing clean functions and building clean systems.

---

## Chapter 8: Boundaries

We rarely control all the software in our systems. We use third-party packages, open-source libraries, and other teams' code. Managing these boundaries cleanly is essential.

### Using Third-Party Code

Third-party providers aim for broad applicability; users want focused interfaces. This tension causes problems at boundaries.

Consider `java.util.Map`:

```java
// Map is very powerful - maybe too powerful
Map<String, Sensor> sensors = new HashMap<>();

// Anyone with the map can:
sensors.clear();                    // Delete everything
sensors.put("key", wrongType);      // Add wrong types (pre-generics)
// And so on...
```

Passing `Map` around exposes too much:

```java
// Bad - Map interface scattered throughout code
Map<String, Sensor> sensors = getSensors();
Sensor s = sensors.get(sensorId);
```

**Better approach:** Wrap the boundary:

```java
// Good - boundary is encapsulated
public class Sensors {
    private Map<String, Sensor> sensors = new HashMap<>();

    public Sensor getById(String id) {
        return sensors.get(id);
    }
}
```

This isn't always necessary, but avoid passing boundary interfaces around. Keep them inside a class or close family of classes.

### Exploring and Learning Boundaries

Learning third-party code is hard. Integrating it is hard. Doing both at the same time is doubly hard.

**Learning tests** solve this: write tests to explore the third-party API. These tests:
- Focus on what we want from the API
- Are controlled experiments
- Document our understanding
- Alert us when new versions change behavior

```java
// Learning test for log4j
@Test
public void testLogCreate() {
    Logger logger = Logger.getLogger("MyLogger");
    logger.info("hello");
}

@Test
public void testLogAddAppender() {
    Logger logger = Logger.getLogger("MyLogger");
    ConsoleAppender appender = new ConsoleAppender();
    logger.addAppender(appender);
    logger.info("hello");
}
```

Learning tests are free—we have to learn the API anyway. They give us a clean way to experiment and document.

### Using Code That Doesn't Exist Yet

Sometimes you need to work against an API that doesn't exist yet. Define the interface you *wish* you had:

```java
// We don't know how the Transmitter API will look yet
// Define what we need:
public interface Transmitter {
    void transmit(Frequency frequency, DataStream stream);
}

// Use our interface in our code
public class CommunicationsController {
    private Transmitter transmitter;

    public void send(Data data) {
        transmitter.transmit(STANDARD_FREQUENCY, data.getStream());
    }
}

// Later, write an adapter for the real API
public class TransmitterAdapter implements Transmitter {
    private RealTransmitter realTransmitter;

    public void transmit(Frequency frequency, DataStream stream) {
        // Translate to real API calls
        realTransmitter.connect(frequency.getValue());
        realTransmitter.send(stream.getBytes());
    }
}
```

This **Adapter Pattern** keeps our code clean and insulated from the eventual API.

### Clean Boundaries

Interesting things happen at boundaries. Change is one of those things. Good design accommodates change without major rework.

**Boundary best practices:**
- Wrap third-party code to minimize dependencies
- Use learning tests to understand APIs
- Define interfaces for code that doesn't exist
- Depend on what you control, not what you don't

---

## Chapter 9: Unit Tests

The Agile and TDD movements have encouraged many programmers to write automated tests. But hastily written tests can become a maintenance burden.

### The Three Laws of TDD

1. **You may not write production code until you have written a failing unit test.**
2. **You may not write more of a unit test than is sufficient to fail** (and not compiling is failing).
3. **You may not write more production code than is sufficient to pass the currently failing test.**

These three laws lock you into a cycle roughly 30 seconds long. Tests and production code are written together, with tests just a few seconds ahead.

### Keeping Tests Clean

Test code is just as important as production code. It requires thought, design, and care. It must be kept as clean as production code.

**The dirty test trap:** "Quick and dirty" tests are worse than no tests:
- They're hard to change
- As production code evolves, tests become a liability
- Eventually the team deletes them
- Without tests, defects increase and fear of change grows

**Tests enable the -ilities:** Tests allow you to make changes to code without fear. Without tests, every change is a possible bug. With a comprehensive test suite, you can improve architecture without fear.

### Clean Tests

What makes a clean test? **Readability.** Clarity, simplicity, and density of expression.

**The BUILD-OPERATE-CHECK pattern:**

```java
@Test
public void testGetPageHierarchyAsXml() throws Exception {
    // Build
    makePages("PageOne", "PageOne.ChildOne", "PageTwo");

    // Operate
    submitRequest("root", "type:pages");

    // Check
    assertResponseIsXML();
    assertResponseContains(
        "<name>PageOne</name>",
        "<name>PageTwo</name>",
        "<name>ChildOne</name>"
    );
}
```

Each test clearly shows what's being built, what operation is performed, and what's checked.

**Domain-Specific Testing Language**

Build utility functions and methods specific to your tests:

```java
// Bad - raw API calls in tests
@Test
public void testFlagParsing() {
    String[] args = new String[]{"-x", "-y", "alpha"};
    Args arg = new Args("x,y*", args);
    assertTrue(arg.isValid());
    assertEquals(true, arg.getBoolean('x'));
    assertEquals("alpha", arg.getString('y'));
}

// Good - domain-specific utilities
@Test
public void testFlagParsing() {
    givenArgs("-x -y alpha");
    whenParsedWithSchema("x,y*");
    thenArgsShouldBeValid();
    thenBooleanArg('x').shouldBeTrue();
    thenStringArg('y').shouldEqual("alpha");
}
```

### One Assert per Test

Some argue each test should have a single assert. This isn't always practical, but minimizing asserts per test is a good guideline.

**Better rule: Single concept per test:**

```java
// Bad - testing multiple concepts
@Test
public void testAddMonths() {
    // Testing 31-day months
    SerialDate d1 = SerialDate.createInstance(31, 5, 2004);
    assertEquals(30, d1.addMonths(1).getDayOfMonth());

    // Testing 30-day months
    SerialDate d2 = SerialDate.createInstance(30, 6, 2004);
    assertEquals(30, d2.addMonths(1).getDayOfMonth());

    // Testing leap year
    SerialDate d3 = SerialDate.createInstance(29, 2, 2004);
    assertEquals(28, d3.addMonths(1).getDayOfMonth());
}

// Good - separate tests for each concept
@Test
public void testAddMonths_fromEndOf31DayMonth() { ... }

@Test
public void testAddMonths_fromEndOf30DayMonth() { ... }

@Test
public void testAddMonths_fromLeapDay() { ... }
```

### F.I.R.S.T. - Properties of Clean Tests

**Fast:** Tests should run quickly. Slow tests won't be run frequently.

**Independent:** Tests should not depend on each other. You should be able to run tests in any order.

**Repeatable:** Tests should work in any environment—development, QA, production, on a train without network.

**Self-Validating:** Tests should have a boolean output: pass or fail. No manual inspection of logs.

**Timely:** Tests should be written just before the production code. Tests written after the fact are harder to write, and the code may not be testable.

---

## Chapter 10: Classes

So far we've focused on writing clean lines and blocks. Now we zoom out to the organization of classes.

### Class Organization

Standard Java convention:
1. Public static constants
2. Private static variables
3. Private instance variables
4. Public functions
5. Private utilities called by public functions

This follows the **stepdown rule**—we want the reader to read like a newspaper article.

### Encapsulation

Keep variables and utility functions private when possible. Loosening encapsulation is always a last resort.

### Classes Should Be Small!

With functions, we measure size by lines. With classes, we measure by **responsibilities**.

**The Single Responsibility Principle (SRP):** A class should have one, and only one, reason to change.

```java
// Bad - multiple responsibilities
public class SuperDashboard extends JFrame implements MetaDataUser {
    public Component getLastFocusedComponent();
    public void setLastFocusedComponent(Component c);
    public int getMajorVersionNumber();
    public int getMinorVersionNumber();
    public int getBuildNumber();
}
```

This class has two reasons to change: focus management and version information.

```java
// Good - single responsibility
public class Version {
    public int getMajorVersionNumber();
    public int getMinorVersionNumber();
    public int getBuildNumber();
}
```

**Identifying responsibilities:** Try describing the class in 25 words or less without using "if", "and", "or", or "but". If you can't, it has too many responsibilities.

**Why we avoid SRP:** We worry about having too many small classes. But a system with many small classes has no more moving parts than one with a few large classes—and it's easier to navigate.

### Cohesion

Classes should have a small number of instance variables. Each method should manipulate one or more of those variables. When each variable is used by each method, the class is **maximally cohesive**.

```java
// Highly cohesive class
public class Stack {
    private int topOfStack = 0;
    private List<Integer> elements = new LinkedList<>();

    public int size() {
        return topOfStack;
    }

    public void push(int element) {
        topOfStack++;
        elements.add(element);
    }

    public int pop() throws EmptyStackException {
        if (topOfStack == 0) throw new EmptyStackException();
        int element = elements.get(--topOfStack);
        elements.remove(topOfStack);
        return element;
    }
}
```

**Maintaining cohesion leads to many small classes:** When a subset of variables is used by a subset of methods, it's a sign that a class wants to be extracted.

### Organizing for Change

Change is inevitable. Classes should be organized to reduce the risk of change.

```java
// Bad - class that must change for any SQL modification
public class Sql {
    public String create();
    public String insert(Object[] fields);
    public String selectAll();
    public String findByKey(String key);
    // Adding new statement types requires modifying this class
}

// Good - open for extension, closed for modification
abstract public class Sql {
    abstract public String generate();
}

public class CreateSql extends Sql {
    public String generate() { ... }
}

public class SelectSql extends Sql {
    public String generate() { ... }
}

public class InsertSql extends Sql {
    public String generate() { ... }
}

// Adding new statement type = adding new class, not modifying existing ones
```

This follows the **Open-Closed Principle (OCP):** Classes should be open for extension but closed for modification.

### Isolating from Change

Needs change, so code will change. Concrete classes contain implementation details. Abstract classes represent concepts only.

**Depend on abstractions, not concretions** (Dependency Inversion Principle):

```java
// Bad - concrete dependency
public class Portfolio {
    private TokyoStockExchange exchange;

    public Portfolio(TokyoStockExchange exchange) {
        this.exchange = exchange;
    }
}

// Good - abstract dependency
public interface StockExchange {
    Money currentPrice(String symbol);
}

public class Portfolio {
    private StockExchange exchange;

    public Portfolio(StockExchange exchange) {
        this.exchange = exchange;
    }
}
```

Now `Portfolio` depends on an abstraction and is testable with a mock exchange.

---

## Chapter 11: Systems

How do we build clean systems at scale?

### Separate Construction from Use

Software systems should separate the startup process (constructing objects, wiring dependencies) from the runtime logic that uses those objects.

```java
// Bad - lazy initialization mixed with business logic
public Service getService() {
    if (service == null) {
        service = new MyServiceImpl(...);  // Construction mixed with use
    }
    return service;
}
```

Problems:
- Hard-coded dependency on `MyServiceImpl`
- Can't test without either using `MyServiceImpl` or modifying the code
- Violates SRP (knows how to construct AND provide)

**Solution 1: Main Separation**

Move all construction to `main` or modules called by `main`:

```
main → builds objects → Application uses objects
```

**Solution 2: Factories**

When the application needs control over when objects are created:

```java
public interface LineItemFactory {
    LineItem makeLineItem();
}

// main creates the factory implementation
// Application uses the factory interface
```

**Solution 3: Dependency Injection**

The class takes dependencies through its constructor (or setters), remaining passive about construction:

```java
public class MyService {
    private final Dependency dependency;

    // DI container injects the dependency
    public MyService(Dependency dependency) {
        this.dependency = dependency;
    }
}
```

Spring, Guice, and similar frameworks automate this pattern.

### Cross-Cutting Concerns

Some concerns—logging, security, transactions—cut across many modules. **Aspect-Oriented Programming (AOP)** handles these.

With AOP, the cross-cutting behavior is defined in one place (an aspect) and applied declaratively:

```java
// Without AOP - transaction handling scattered everywhere
public void updateUser(User user) {
    beginTransaction();
    try {
        userRepository.update(user);
        commitTransaction();
    } catch (Exception e) {
        rollbackTransaction();
    }
}

// With AOP - clean business logic
@Transactional
public void updateUser(User user) {
    userRepository.update(user);
}
```

### Test Drive the System Architecture

Optimal architecture emerges through iteration. Start simple and evolve:

> "An optimal system architecture consists of modularized domains of concern, each implemented with Plain Old Java Objects. The different domains are integrated together with minimally invasive Aspects or Aspect-like tools. This architecture can be test-driven, just like the code."

### Use Standards Wisely, When They Add Value

Standards make it easier to reuse ideas and components. But standards can be heavyweight. Use them when they genuinely add value, not just because "everyone uses them."

### Domain-Specific Languages (DSLs)

DSLs allow business logic to be expressed in terms domain experts understand:

```java
// Instead of
if (job.getType() == JobType.RECURRING
    && job.getNextRunTime().before(now)
    && job.isEnabled()) {
    execute(job);
}

// DSL approach
schedule(recurringJob).ifDueAndEnabled().execute();
```

Good DSLs minimize the communication gap between domain concept and implementing code.

---

## Chapter 12: Emergence

Kent Beck's four rules of **Simple Design** (in priority order):

### 1. Runs All the Tests

A system that cannot be verified doesn't work. Writing tests leads to better design—small, single-purpose classes are easier to test.

Tight coupling makes tests hard to write. So we naturally decouple, use interfaces, and apply dependency injection. **Testable systems are well-designed systems.**

### 2. Contains No Duplication

Duplication is the primary enemy of a well-designed system. It represents additional work, risk, and complexity.

```java
// Duplication
public void scaleToOneDimension(float desiredDimension, float imageDimension) {
    if (Math.abs(desiredDimension - imageDimension) < errorThreshold)
        return;
    float scalingFactor = desiredDimension / imageDimension;
    scalingFactor = (float)(Math.floor(scalingFactor * 100) * 0.01f);
    replaceImage(ImageUtilities.getScaledImage(image, scalingFactor));
}

public void rotate(int degrees) {
    replaceImage(ImageUtilities.getRotatedImage(image, degrees));
}

// Common pattern extracted
private void replaceImage(RenderedOp newImage) {
    image.dispose();
    System.gc();
    image = newImage;
}
```

The **TEMPLATE METHOD** pattern is a common technique for removing higher-level duplication.

### 3. Expresses Intent

Code should clearly express the intent of its author. As systems become more complex, it takes more time to understand them. Choose good names, keep functions and classes small, use standard patterns (where readers will recognize them), write well-crafted unit tests.

**The most important thing:** Try. Spend time on your code. Care about your craft.

### 4. Minimizes Classes and Methods

Keep the count of classes and methods low—but not at the expense of the other rules. This rule has the lowest priority.

Avoid dogmatism: don't create a class for every concept or follow every guideline rigidly. Pragmatism wins.

---

## Key Takeaways

1. **Wrap third-party code** to isolate boundaries. Use learning tests to understand APIs. Define your own interfaces for code you don't control.

2. **Tests are first-class code.** Keep them clean, fast, independent, repeatable, self-validating, and timely. Tests enable change.

3. **Classes should be small and have one reason to change.** High cohesion means every variable is used by every method. Split classes when cohesion drops.

4. **Follow OCP and DIP.** Open for extension, closed for modification. Depend on abstractions, not concretions.

5. **Separate construction from use.** Dependency injection keeps business logic clean and testable.

6. **Simple design:** Runs all tests, has no duplication, expresses intent, minimizes elements. In that order.

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Test Driven Development by Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
