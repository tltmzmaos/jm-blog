---
title: "Clean Code Part 4: Concurrency and Refactoring"
description: "Advanced clean code topics covering concurrent programming, successive refinement through real-world examples, and the comprehensive list of code smells and heuristics."
pubDate: 2025-12-25
author: "Jongmin Lee"
tags: ["Clean Code", "Software Engineering", "Best Practices", "Robert C. Martin", "Refactoring", "Concurrency"]
draft: false
---

# Clean Code Part 4: Concurrency and Refactoring

This final part tackles the hardest topics: concurrent programming, real-world refactoring case studies, and a comprehensive reference of code smells and heuristics. These chapters separate competent programmers from expert ones.

---

## Chapter 13: Concurrency

Writing clean concurrent code is hard—very hard. Even code that looks clean can be broken in subtle ways.

### Why Concurrency?

Concurrency is a **decoupling strategy**. It decouples *what* gets done from *when* it gets done. In single-threaded applications, what and when are tightly coupled.

Benefits of decoupling what from when:
- Improved throughput (handling multiple users)
- Better response times (doing work in background)
- More natural problem modeling (some problems are inherently concurrent)

### Myths and Misconceptions

**Myth: Concurrency always improves performance.**
Reality: Concurrency can sometimes improve performance, but only when wait time can be shared between threads. It adds overhead.

**Myth: Design doesn't change when writing concurrent programs.**
Reality: The design of a concurrent system can be dramatically different from a single-threaded system.

**Myth: Understanding concurrency issues isn't important when working with containers like web or EJB containers.**
Reality: You need to know what the container does and how to protect concurrent updates.

### Concurrency Defense Principles

**Single Responsibility Principle**

Concurrency-related code has its own development lifecycle. Keep it separate:

```java
// Bad - concurrency mixed with business logic
public class UserService {
    public void processUsers() {
        synchronized(this) {
            // business logic intertwined with locking
        }
    }
}

// Good - separated concerns
public class UserService {
    public void processUser(User user) {
        // Pure business logic
    }
}

public class ConcurrentUserProcessor {
    private UserService service;

    public void processUsersConcurrently(List<User> users) {
        // Concurrency logic separated
    }
}
```

**Corollary: Limit the Scope of Data**

Restrict access to shared data. Use `synchronized` or similar mechanisms, but minimize shared sections.

Two threads modifying the same shared object can interfere in unexpected ways. The more places shared data can be updated, the more likely:
- You'll forget to protect one section
- Duplication will break DRY
- It's hard to determine the source of failures

**Corollary: Use Copies of Data**

A good way to avoid sharing: don't share. Copy objects and treat them as read-only. Merge results in a single thread.

The overhead of copying might be offset by avoiding synchronization.

**Corollary: Threads Should Be as Independent as Possible**

Write code so each thread exists in its own world, sharing no data with other threads. Each processes one client request, with all data from unshared sources and stored as local variables.

### Know Your Library

Java 5 and later offer significant concurrency improvements:

**Thread-safe collections:**
- `ConcurrentHashMap` - much better than synchronized `HashMap`
- `ReentrantLock` - can be acquired in one method, released in another
- `Semaphore` - classic counting semaphore
- `CountDownLatch` - waits for events before releasing threads

```java
// Bad
Map<String, Integer> map = new HashMap<>();
synchronized(map) {
    map.put(key, value);
}

// Good
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put(key, value);  // Thread-safe without explicit locking
```

### Know Your Execution Models

**Producer-Consumer:** Producers place work on a queue; consumers take work from the queue. The queue is a bound resource.

**Readers-Writers:** Readers can read simultaneously, but writers need exclusive access. Balance throughput against starvation.

**Dining Philosophers:** Threads compete for resources in a way that can lead to deadlock, livelock, or throughput issues.

Understanding these patterns helps you recognize and solve concurrency problems.

### Beware Dependencies Between Synchronized Methods

Having more than one synchronized method on a shared object can cause subtle bugs:

```java
// Dangerous - two synchronized methods
public class IntegerIterator implements Iterator<Integer> {
    private Integer nextValue = 0;

    public synchronized boolean hasNext() {
        return nextValue < 100000;
    }

    public synchronized Integer next() {
        if (nextValue == 100000) throw new NoSuchElementException();
        return nextValue++;
    }
}
```

Even though both methods are synchronized, this sequence can fail:

```
Thread 1: hasNext() returns true
Thread 2: hasNext() returns true
Thread 1: next() returns 99999
Thread 2: next() throws exception (nextValue is now 100000)
```

Solutions:
- Client-based locking (client locks server before calling)
- Server-based locking (server locks inside, provides atomic method)
- Adapted server (intermediary provides atomic operations)

### Keep Synchronized Sections Small

`synchronized` introduces delays and overhead. Don't extend critical sections beyond what's necessary:

```java
// Bad - too much inside synchronized block
synchronized(this) {
    expensiveComputation();  // Doesn't need lock
    updateSharedState();     // Needs lock
    anotherComputation();    // Doesn't need lock
}

// Good - minimal critical section
expensiveComputation();
synchronized(this) {
    updateSharedState();
}
anotherComputation();
```

### Writing Correct Shut-Down Code Is Hard

Graceful shutdown is hard to get right. Think about shutdown early. Getting this working early is essential.

Common issues:
- Deadlock—threads waiting forever for signals that never come
- Resources not being released
- Threads that don't terminate

### Testing Threaded Code

Testing doesn't guarantee correctness, but good tests minimize risk:

**Treat spurious failures as candidate threading issues.** Developers often ignore system failures. "The server was hiccuping." "Cosmic ray." Threading bugs might appear as one-in-a-thousand failures. Don't ignore them.

**Get your nonthreaded code working first.** Don't debug threading and code issues simultaneously.

**Make your threaded code pluggable.** So it can run in various configurations:
- One thread, several threads, varied number of threads
- Real vs. test doubles
- Fast vs. slow iterations

**Make your threaded code tunable.** Allow number of threads to be easily adjusted, even at runtime.

**Run with more threads than processors.** This increases the chance of task swapping and exposing bugs.

**Run on different platforms.** Threading behavior differs across OSes.

**Instrument your code to try and force failures.** Add calls to `Object.wait()`, `Object.sleep()`, `Object.yield()`, `Object.priority()` to change execution order.

```java
public synchronized String nextUrlOrNull() {
    if (hasNext()) {
        String url = urlGenerator.next();
        Thread.yield();  // Force context switch for testing
        updateHasNext();
        return url;
    }
    return null;
}
```

Use jiggling strategies (tools like IBM's ConTest) to randomize these calls.

---

## Chapter 14: Successive Refinement

This chapter is a detailed case study of cleaning up a command-line argument parser. It demonstrates the **iterative refinement** process.

### The Args Implementation

The chapter shows a clean, final implementation of an `Args` class that parses command-line arguments:

```java
Args arg = new Args("l,p#,d*", args);
boolean logging = arg.getBoolean('l');
int port = arg.getInt('p');
String directory = arg.getString('d');
```

The schema string defines:
- `l` - boolean flag
- `p#` - integer argument
- `d*` - string argument

### How Did I Do This?

The key insight: **I didn't write it clean from the start.** The first version was a mess. Clean code requires successive refinement.

Martin shows the progression:

1. **First draft:** Boolean arguments only. Already messy.
2. **Second draft:** Added String arguments. Code doubled in complexity.
3. **Crisis point:** Adding Integer arguments would have created chaos.
4. **Stop and refactor:** Recognize the pattern, extract abstractions.

### The Progression

**Step 1: Boolean arguments work**
```java
// Initial messy code
private void parseSchema() {
    for (String element : schema.split(",")) {
        parseSchemaElement(element);
    }
}

private void parseSchemaElement(String element) {
    if (element.length() == 1) {
        parseBooleanSchemaElement(element);
    }
}
```

**Step 2: String arguments added**

The code doubled. Similar if-else chains for parsing schema, parsing arguments, and retrieving values.

**Step 3: See the pattern**

Each argument type needs:
- Schema parsing
- Argument parsing
- Value retrieval
- Default value

**Step 4: Extract the ArgumentMarshaler interface**

```java
public interface ArgumentMarshaler {
    void set(Iterator<String> currentArgument);
    Object get();
}

public class BooleanArgumentMarshaler implements ArgumentMarshaler {
    private boolean booleanValue = false;

    public void set(Iterator<String> currentArgument) {
        booleanValue = true;
    }

    public Object get() {
        return booleanValue;
    }
}
```

**Step 5: Move type-specific code to marshalers**

Each marshaler handles its own parsing. The main class just orchestrates.

### Key Lessons

**Incrementalism:** Software is never "written." It's grown. Start with something that works. Improve iteratively.

**Refactoring is not rewriting:** Changes are small. Tests pass after each change. Never break the system.

**Stop when you see the mess:** Don't keep adding features to messy code. Clean it first.

**The Boy Scout Rule in action:** Leave the code cleaner than you found it. Every change is an opportunity.

> "It is not enough for code to work. Code that works is often badly broken. Programmers who satisfy themselves with merely working code are behaving unprofessionally."

---

## Chapters 15-16: JUnit and SerialDate Case Studies

These chapters show real-world refactoring of production code.

### JUnit Internals (Chapter 15)

Martin refactors the `ComparisonCompactor` class from JUnit. Key improvements:

1. **Extract method** for complex conditions
2. **Rename variables** for clarity (e.g., `fExpected` → `expected`)
3. **Eliminate redundancy** in string handling
4. **Simplify conditionals** with guard clauses

**Before:**
```java
private String compactExpected;
private String compactActual;

private void compactExpectedAndActual() {
    findCommonPrefix();
    findCommonSuffix();
    compactExpected = compactString(expected);
    compactActual = compactString(actual);
}
```

**After:**
```java
private String compact(String source) {
    return new StringBuilder()
        .append(startingEllipsis())
        .append(startingContext())
        .append(DELTA_START)
        .append(delta(source))
        .append(DELTA_END)
        .append(endingContext())
        .append(endingEllipsis())
        .toString();
}
```

### Refactoring SerialDate (Chapter 16)

Martin refactors a date handling class. The chapter demonstrates:

1. **Fix bugs first:** Found through testing
2. **Remove dead code:** Unused variables, unreachable branches
3. **Rename for clarity:** `stringToWeekdayCode` → `parseDay`
4. **Extract classes:** Separate `DayDate` from `SpreadsheetDate`
5. **Apply SRP:** Move factory methods to separate factory class
6. **Use enums:** Replace integer constants with type-safe enums

**Key insight:** Even well-intentioned code from experienced developers benefits from refactoring. Nobody writes perfect code the first time.

---

## Chapter 17: Smells and Heuristics

This chapter is a reference catalog of code smells and heuristics. Use it as a checklist.

### Comments

**C1: Inappropriate Information**
Comments should not hold information better kept elsewhere (version control, issue tracking).

**C2: Obsolete Comment**
Comments that are old, irrelevant, or incorrect. Update or delete them.

**C3: Redundant Comment**
Comments that describe what code already says clearly.

**C4: Poorly Written Comment**
Don't ramble. Don't state the obvious. Be brief.

**C5: Commented-Out Code**
Delete it. Version control remembers.

### Environment

**E1: Build Requires More Than One Step**
Building should be a single command: `make`, `ant all`, `mvn package`.

**E2: Tests Require More Than One Step**
Running all tests should be a single command.

### Functions

**F1: Too Many Arguments**
Zero is best. Three is suspicious. More than three is problematic.

**F2: Output Arguments**
Avoid them. Return values instead.

**F3: Flag Arguments**
Boolean arguments signal the function does more than one thing. Split it.

**F4: Dead Function**
Delete functions that are never called.

### General

**G1: Multiple Languages in One Source File**
Keep XML, HTML, JavaScript, etc. separate when possible.

**G2: Obvious Behavior Is Unimplemented**
Follow the Principle of Least Surprise. If a function is named `getDayOfWeek()`, it should return a day of the week.

**G3: Incorrect Behavior at the Boundaries**
Don't rely on intuition. Test every boundary condition.

**G4: Overridden Safeties**
Don't turn off compiler warnings. Don't skip failing tests. Don't ignore exceptions.

**G5: Duplication**
Every time you see duplication, it represents a missed opportunity for abstraction. DRY (Don't Repeat Yourself).

**G6: Code at Wrong Level of Abstraction**
High-level concepts in base classes, low-level details in derivatives.

**G7: Base Classes Depending on Their Derivatives**
Base classes should know nothing about their derivatives.

**G8: Too Much Information**
Hide data. Hide utility functions. Hide constants and temporaries. Don't expose inner structure.

**G9: Dead Code**
Code that isn't executed. Find and delete it.

**G10: Vertical Separation**
Variables should be declared close to usage. Private functions should be just below their first usage.

**G11: Inconsistency**
If you do something a certain way, do all similar things the same way.

**G12: Clutter**
Remove unused variables, functions, comments.

**G13: Artificial Coupling**
Things that don't depend on each other shouldn't be coupled.

**G14: Feature Envy**
Methods that use accessors of another class extensively want to be in that class.

**G15: Selector Arguments**
Boolean or enum arguments that select behavior should be separate functions.

**G16: Obscured Intent**
Code should be as expressive as possible.

**G17: Misplaced Responsibility**
Code should be where a reader would expect it.

**G18: Inappropriate Static**
Prefer non-static methods. Static methods can't be overridden.

**G19: Use Explanatory Variables**
Break complex expressions into intermediate variables with meaningful names.

**G20: Function Names Should Say What They Do**
If you have to look at implementation to understand, rename it.

**G21: Understand the Algorithm**
Don't just make code "work" through trial and error. Understand why it works.

**G22: Make Logical Dependencies Physical**
If one module depends on another, that dependency should be explicit.

**G23: Prefer Polymorphism to If/Else or Switch/Case**
Most conditionals on type can be replaced with polymorphism.

**G24: Follow Standard Conventions**
Team conventions trump personal preferences.

**G25: Replace Magic Numbers with Named Constants**
`86400` means nothing. `SECONDS_PER_DAY` is clear.

**G26: Be Precise**
Don't use floating-point for currency. Don't use ArrayList when you need concurrency. Don't ignore compiler warnings.

**G27: Structure over Convention**
Enforce design decisions through structure, not just convention.

**G28: Encapsulate Conditionals**
```java
// Bad
if (timer.hasExpired() && !timer.isRecurrent())

// Good
if (shouldBeDeleted(timer))
```

**G29: Avoid Negative Conditionals**
```java
// Bad
if (!buffer.shouldNotCompact())

// Good
if (buffer.shouldCompact())
```

**G30: Functions Should Do One Thing**
Multiple sections in a function are a sign it does too much.

**G31: Hidden Temporal Couplings**
Make temporal dependencies explicit through arguments.

**G32: Don't Be Arbitrary**
Structure reflects reasoning. If structure seems arbitrary, others will feel free to change it.

**G33: Encapsulate Boundary Conditions**
```java
// Bad
if (level + 1 < tags.length) {
    parts = parse(level + 1);
}

// Good
int nextLevel = level + 1;
if (nextLevel < tags.length) {
    parts = parse(nextLevel);
}
```

**G34: Functions Should Descend Only One Level of Abstraction**

**G35: Keep Configurable Data at High Levels**
Don't bury configuration deep in low-level functions.

**G36: Avoid Transitive Navigation**
Modules should know only about their immediate collaborators (Law of Demeter).

### Names

**N1: Choose Descriptive Names**
Names are 90% of readability. Take time to choose them.

**N2: Choose Names at the Appropriate Level of Abstraction**
Don't pick names that communicate implementation details.

**N3: Use Standard Nomenclature Where Possible**
Use design pattern names (Factory, Visitor), mathematical terms, etc.

**N4: Unambiguous Names**
Choose names that make the workings of a function unambiguous.

**N5: Use Long Names for Long Scopes**
Short names for small scopes, long names for large scopes.

**N6: Avoid Encodings**
No Hungarian notation, no `m_` prefixes.

**N7: Names Should Describe Side Effects**
`getOos()` that creates an ObjectOutputStream should be `createOrReturnOos()`.

### Tests

**T1: Insufficient Tests**
Test everything that could possibly break.

**T2: Use a Coverage Tool**
Know what's untested.

**T3: Don't Skip Trivial Tests**
They document behavior.

**T4: An Ignored Test Is a Question about an Ambiguity**
Express requirements uncertainties as tests.

**T5: Test Boundary Conditions**
Boundaries are where bugs cluster.

**T6: Exhaustively Test Near Bugs**
Bugs congregate. When you find one, look for more nearby.

**T7: Patterns of Failure Are Revealing**
Analyze test failures. Patterns point to causes.

**T8: Test Coverage Patterns Can Be Revealing**
Looking at which code runs (or doesn't) in passing tests is illuminating.

**T9: Tests Should Be Fast**
Slow tests don't get run.

---

## Key Takeaways

1. **Concurrency is hard.** Keep concurrent code separate. Minimize shared data. Know your tools and patterns. Test aggressively.

2. **Clean code is grown, not born.** Start simple and refactor continuously. Successive refinement is the professional way.

3. **Refactoring is safe.** Small changes, tests pass after each one. Never break the system while improving it.

4. **Code smells are patterns.** Learn to recognize them. The heuristics catalog is a checklist for code review.

5. **Professionalism is caring.** Working code isn't enough. Clean code is a matter of professional pride.

---

## The Final Word

> "Of course bad code can be cleaned up. But it's very expensive. As code rots, the time and cost of making changes increases dramatically. In many cases, the cost becomes so high that the product dies."

The only way to go fast is to go well. Clean code isn't a luxury—it's a survival skill.

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring by Martin Fowler](https://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0134757599)
- [Java Concurrency in Practice](https://www.amazon.com/Java-Concurrency-Practice-Brian-Goetz/dp/0321349601)
- [Working Effectively with Legacy Code](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052)
