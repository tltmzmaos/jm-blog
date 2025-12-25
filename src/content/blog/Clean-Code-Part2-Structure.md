---
title: "Clean Code Part 2: Structure and Formatting"
description: "Code organization principles from Clean Code. Covers formatting rules, objects vs data structures, and robust error handling strategies."
pubDate: 2025-12-19
author: "Jongmin Lee"
tags: ["Clean Code", "Software Engineering", "Best Practices", "Robert C. Martin"]
draft: false
---

# Clean Code Part 2: Structure and Formatting

After mastering the basics of naming and functions, the next step is organizing code at a higher level. This part covers how to format code for readability, the fundamental difference between objects and data structures, and how to handle errors without cluttering business logic.

---

## Chapter 5: Formatting

Code formatting is about communication, and communication is the professional developer's first order of business.

### The Purpose of Formatting

The functionality you create today has a good chance of changing in the next release, but the readability of your code will have a profound effect on all changes that will ever be made. The coding style and readability set precedents that continue to affect maintainability long after the original code has been changed beyond recognition.

### Vertical Formatting

**How big should a source file be?**

Martin analyzed several projects and found that most files in well-maintained systems are between 200-500 lines. Files can be significantly smaller (FitNesse averages about 65 lines per file). Small files are easier to understand.

**The Newspaper Metaphor**

Think of a source file like a newspaper article:
- The name should be simple but explanatory (headline)
- The topmost parts should provide high-level concepts (lead paragraph)
- Detail should increase as we move downward (body)

You should be able to understand the file's purpose from the first few lines.

**Vertical Openness Between Concepts**

Use blank lines to separate distinct concepts:

```java
// Good - blank lines separate package, imports, and class
package fitnesse.wikitext.widgets;

import java.util.regex.*;

public class BoldWidget extends ParentWidget {
    public static final String REGEXP = "'''.+?'''";

    public BoldWidget(ParentWidget parent, String text) {
        // ...
    }

    public String render() {
        // ...
    }
}
```

Without blank lines, code becomes unreadable—a sea of text with no structure.

**Vertical Density**

Lines of code that are tightly related should appear vertically close:

```java
// Bad - useless comments separate related things
public class ReporterConfig {
    /**
     * The class name of the reporter listener
     */
    private String m_className;

    /**
     * The properties of the reporter listener
     */
    private List<Property> m_properties;
}

// Good - related lines are close
public class ReporterConfig {
    private String className;
    private List<Property> properties;
}
```

**Vertical Distance**

Concepts that are closely related should be kept vertically close to each other. This applies to:

**Variable declarations:** Declare variables as close to their usage as possible.

```java
// Local variables at the top of functions
private static void readPreferences() {
    InputStream is = null;
    try {
        is = new FileInputStream(getPreferencesFile());
        // ... use is
    }
}
```

**Instance variables:** Should be declared at the top of the class (Java convention) or at the bottom (C++ convention). Pick one and be consistent.

**Dependent functions:** If one function calls another, keep them vertically close, with the caller above the callee when possible. This creates a natural flow from high-level to low-level.

```java
public void processFile() {
    readHeader();
    processBody();
    writeOutput();
}

private void readHeader() { ... }
private void processBody() { ... }
private void writeOutput() { ... }
```

**Conceptual affinity:** Certain code wants to be near other code. They share a common naming scheme or perform variations of the same task:

```java
// These belong together
public void assertTrue(boolean condition) { ... }
public void assertFalse(boolean condition) { ... }
public void assertEquals(Object expected, Object actual) { ... }
```

**Vertical Ordering**

In general, we want function call dependencies to point in the downward direction. A function that is called should be below the function that does the calling. This creates a nice flow from high level to low level.

### Horizontal Formatting

**How Wide Should a Line Be?**

Keep lines short. Martin suggests a limit around 120 characters. Programmers clearly prefer shorter lines—longer lines indicate something that should be broken up.

**Horizontal Openness and Density**

Use horizontal white space to associate things that are strongly related and disassociate things that are weakly related:

```java
// Spaces around assignment, no space for function calls
private void measureLine(String line) {
    lineCount++;
    int lineSize = line.length();
    totalChars += lineSize;

    // Spaces around operators by precedence
    return (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
}
```

**Horizontal Alignment**

Don't align declarations or assignments horizontally:

```java
// Bad - tempting but problematic
private   String      name;
private   int         age;
private   List<Item>  items;

// Good - let it be
private String name;
private int age;
private List<Item> items;
```

Horizontal alignment emphasizes the wrong things and creates busywork when names change.

**Indentation**

Indentation makes scope hierarchy visible. Without indentation, code would be virtually unreadable:

```java
// Without indentation - impossible to read
public class MyClass {
public String method() {
if (condition) {
for (int i = 0; i < 10; i++) {
doSomething();
}}}}

// With indentation - structure is clear
public class MyClass {
    public String method() {
        if (condition) {
            for (int i = 0; i < 10; i++) {
                doSomething();
            }
        }
    }
}
```

**Don't break the indentation for short statements:**

```java
// Bad
if (condition) return;
while (running) process();

// Good
if (condition) {
    return;
}
while (running) {
    process();
}
```

### Team Rules

A team of developers should agree upon a single formatting style. The style may not be your preferred style, but it should be consistent throughout the codebase.

A good software system is composed of a set of documents that read nicely. They need to have a consistent style. The reader should not have to switch mental gears constantly.

---

## Chapter 6: Objects and Data Structures

There is a fundamental difference between objects and data structures, and understanding it is crucial for good design.

### Data Abstraction

Hiding implementation is about abstraction, not just putting variables behind getters and setters:

```java
// Concrete point - exposes implementation
public class Point {
    public double x;
    public double y;
}

// Abstract point - hides implementation
public interface Point {
    double getX();
    double getY();
    void setCartesian(double x, double y);
    double getR();
    double getTheta();
    void setPolar(double r, double theta);
}
```

The second form is superior because you cannot tell whether the implementation uses rectangular or polar coordinates. It enforces an access policy.

**Hiding implementation is not just about putting a layer of functions between variables.** It's about exposing abstract interfaces that allow users to manipulate the *essence* of data without knowing its implementation.

### Data/Object Anti-Symmetry

This is a fundamental dichotomy:

- **Objects** hide their data behind abstractions and expose functions that operate on that data
- **Data structures** expose their data and have no meaningful functions

These two things are virtually opposites:

```java
// Procedural code with data structures
public class Square {
    public Point topLeft;
    public double side;
}

public class Circle {
    public Point center;
    public double radius;
}

public class Geometry {
    public double area(Object shape) {
        if (shape instanceof Square) {
            Square s = (Square) shape;
            return s.side * s.side;
        } else if (shape instanceof Circle) {
            Circle c = (Circle) shape;
            return Math.PI * c.radius * c.radius;
        }
        throw new NoSuchShapeException();
    }
}
```

vs.

```java
// Object-oriented code with polymorphism
public interface Shape {
    double area();
}

public class Square implements Shape {
    private Point topLeft;
    private double side;

    public double area() {
        return side * side;
    }
}

public class Circle implements Shape {
    private Point center;
    private double radius;

    public double area() {
        return Math.PI * radius * radius;
    }
}
```

**The key insight:**

- **Procedural code (using data structures)** makes it easy to add new functions without changing existing data structures, but hard to add new data structures because all functions must change.

- **Object-oriented code** makes it easy to add new classes without changing existing functions, but hard to add new functions because all classes must change.

**Neither is inherently better.** The choice depends on whether you expect to add more data types or more operations.

### The Law of Demeter

A module should not know about the innards of the objects it manipulates. An object should not expose its internal structure through accessors.

More precisely, a method `f` of class `C` should only call methods of:
- `C` itself
- An object created by `f`
- An object passed as an argument to `f`
- An object held in an instance variable of `C`

**Train Wrecks**

This kind of code violates Demeter:

```java
// Bad - train wreck
final String outputDir = ctxt.getOptions().getScratchDir().getAbsolutePath();
```

Break it up:

```java
// Better - but still questionable
Options opts = ctxt.getOptions();
File scratchDir = opts.getScratchDir();
final String outputDir = scratchDir.getAbsolutePath();
```

**Best approach:** Ask why you need the path. What are you doing with it?

```java
// Best - tell, don't ask
BufferedOutputStream bos = ctxt.createScratchFileStream(classFileName);
```

### Data Transfer Objects (DTOs)

A DTO is a class with public variables and no functions—a quintessential data structure. They're useful for:
- Communicating with databases
- Parsing messages from sockets
- Transferring data between layers

**Active Records** are DTOs with navigational methods like `save` and `find`. Treat them as data structures—don't put business logic in them.

---

## Chapter 7: Error Handling

Error handling is important, but if it obscures logic, it's wrong.

### Use Exceptions Rather Than Return Codes

Return codes clutter the caller:

```java
// Bad - error codes
public class DeviceController {
    public void sendShutDown() {
        DeviceHandle handle = getHandle(DEV1);
        if (handle != DeviceHandle.INVALID) {
            DeviceRecord record = retrieveDeviceRecord(handle);
            if (record.getStatus() != DEVICE_SUSPENDED) {
                pauseDevice(handle);
                clearDeviceWorkQueue(handle);
                closeDevice(handle);
            } else {
                logger.log("Device suspended.");
            }
        } else {
            logger.log("Invalid handle.");
        }
    }
}

// Good - exceptions
public class DeviceController {
    public void sendShutDown() {
        try {
            tryToShutDown();
        } catch (DeviceShutDownError e) {
            logger.log(e);
        }
    }

    private void tryToShutDown() throws DeviceShutDownError {
        DeviceHandle handle = getHandle(DEV1);
        DeviceRecord record = retrieveDeviceRecord(handle);
        pauseDevice(handle);
        clearDeviceWorkQueue(handle);
        closeDevice(handle);
    }
}
```

The code is cleaner because the algorithm and error handling are separated.

### Write Your Try-Catch-Finally Statement First

When you write code that could throw exceptions, start with a try-catch-finally. This helps you define what the caller can expect.

Think of try blocks as transactions. Your catch has to leave your program in a consistent state.

**Use TDD:** Write a test that expects an exception, then write code that throws it, then add behavior.

### Use Unchecked Exceptions

Checked exceptions (Java's unique feature) violate the Open/Closed Principle. A change in a low-level function's signature forces changes all the way up the call chain.

```java
// Checked exceptions propagate changes
public void method1() throws MyException { method2(); }
public void method2() throws MyException { method3(); }
public void method3() throws MyException { /* actual throw */ }
```

If `method3` adds a new exception, `method1` and `method2` must change. This breaks encapsulation—low-level details leak into high-level policies.

### Provide Context with Exceptions

Each exception should provide enough context to determine the source and location of an error:
- Create informative error messages
- Pass relevant data (operation attempted, type of failure)
- Mention the operation that failed

```java
// Good - context in exception message
throw new PortInUseException(
    "Port " + portNumber + " is already in use by " + existingProcess);
```

### Define Exception Classes by Caller's Needs

Wrap third-party APIs to simplify exception handling:

```java
// Bad - too many catches
try {
    port.open();
} catch (DeviceResponseException e) {
    reportPortError(e);
} catch (ATM1212UnlockedException e) {
    reportPortError(e);
} catch (GMXError e) {
    reportPortError(e);
}

// Good - wrap the API
public class LocalPort {
    private ACMEPort innerPort;

    public void open() {
        try {
            innerPort.open();
        } catch (DeviceResponseException e) {
            throw new PortDeviceFailure(e);
        } catch (ATM1212UnlockedException e) {
            throw new PortDeviceFailure(e);
        } catch (GMXError e) {
            throw new PortDeviceFailure(e);
        }
    }
}

// Now calling code is clean
try {
    port.open();
} catch (PortDeviceFailure e) {
    reportError(e);
}
```

Wrapping third-party APIs is a best practice. It:
- Minimizes dependencies on the API
- Makes it easier to mock for testing
- Lets you define your own exception types

### Define the Normal Flow

Sometimes you don't want to abort with an exception. Use the **Special Case Pattern**:

```java
// Bad - exception for non-exceptional case
try {
    MealExpenses expenses = expenseReportDAO.getMeals(employee.getID());
    total += expenses.getTotal();
} catch (MealExpensesNotFound e) {
    total += getMealPerDiem();
}

// Good - special case object
MealExpenses expenses = expenseReportDAO.getMeals(employee.getID());
total += expenses.getTotal();

// ExpenseReportDAO returns a PerDiemMealExpenses if no meals found
public class PerDiemMealExpenses implements MealExpenses {
    public int getTotal() {
        return PER_DIEM_DEFAULT;
    }
}
```

### Don't Return Null

Returning null creates work for callers and leads to `NullPointerException`:

```java
// Bad - checking null everywhere
List<Employee> employees = getEmployees();
if (employees != null) {
    for (Employee e : employees) {
        totalPay += e.getPay();
    }
}

// Good - return empty collection
public List<Employee> getEmployees() {
    if (/* no employees */) {
        return Collections.emptyList();
    }
    // ...
}

// Now no null check needed
for (Employee e : getEmployees()) {
    totalPay += e.getPay();
}
```

### Don't Pass Null

Passing null is even worse than returning it. Unless your API expects null, avoid it:

```java
// What if someone passes null?
public double xProjection(Point p1, Point p2) {
    return (p2.x - p1.x) * 1.5;
}

// Option 1: Check and throw (not great)
public double xProjection(Point p1, Point p2) {
    if (p1 == null || p2 == null) {
        throw new IllegalArgumentException("Invalid argument");
    }
    return (p2.x - p1.x) * 1.5;
}

// Option 2: Use assertions (for internal code)
public double xProjection(Point p1, Point p2) {
    assert p1 != null : "p1 should not be null";
    assert p2 != null : "p2 should not be null";
    return (p2.x - p1.x) * 1.5;
}
```

In most languages, there's no good way to handle accidental null. The best solution: don't pass null in the first place. Make it a policy.

---

## Key Takeaways

1. **Formatting is about communication.** Code will change, but the coding style affects all future changes. Agree on a style with your team and stick to it.

2. **Vertical organization matters.** Related code should be close together. Functions should read like a newspaper—high level first, details below.

3. **Understand the object/data structure dichotomy.** Objects hide data and expose behavior. Data structures expose data and have no behavior. Each has trade-offs for extensibility.

4. **Follow the Law of Demeter.** Don't chain method calls on objects you don't own. Tell objects what to do; don't ask them for their internals.

5. **Use exceptions, not return codes.** Separate error handling from business logic. Provide context. Don't return or pass null.

6. **Wrap third-party APIs.** It reduces dependencies, simplifies exception handling, and makes testing easier.

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter)
- [Null Object Pattern](https://en.wikipedia.org/wiki/Null_object_pattern)
