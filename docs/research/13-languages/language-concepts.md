# Language Concepts — Complete Reference

> Languages are tools, but understanding what makes them different makes you a better programmer in all of them.

---

## Programming Paradigms

### Imperative vs Declarative
```
Imperative: HOW to do it
  List steps explicitly
  Mutable state, loops, assignments
  Examples: C, early Python, Java

Declarative: WHAT you want
  Express intent, not process
  Immutable, expression-based
  Examples: SQL, HTML, functional programming

// Imperative: how to sum evens
total = 0
for i in range(10):
    if i % 2 == 0:
        total += i

// Declarative: what you want
total = sum(i for i in range(10) if i % 2 == 0)
total = sum(filter(lambda x: x % 2 == 0, range(10)))
```

### Object-Oriented Programming
```
Encapsulation:  Bundle data + behavior, hide implementation
Inheritance:    Extend and specialize types
Polymorphism:   One interface, many implementations
Abstraction:    Work with abstract concepts, hide details

Problems with deep inheritance:
  - Fragile base class problem
  - The gorilla/banana problem
  - Tight coupling

Prefer composition over inheritance:
  Instead of: Dog extends Animal extends LivingThing
  Use: Dog has-a MovementBehavior, has-a SoundBehavior
       → Easy to change behaviors independently

Interface-based design:
  Code to interfaces (abstract), not concretions
  Enables testing (mock the interface)
  Enables extension (new implementation, same interface)
```

### Functional Programming
```
Pure functions:
  - Same input → same output (referential transparency)
  - No side effects (no mutation, no I/O)
  - Easy to test, reason about, parallelize

Immutability:
  - Data never changes after creation
  - "Changes" create new values
  - No race conditions

Higher-order functions:
  - Functions as first-class values
  - Functions that take/return functions
  - map, filter, reduce, compose

# Python functional style
from functools import reduce
from typing import Callable

def compose(*fns: Callable) -> Callable:
    """Compose functions right-to-left: compose(f, g)(x) == f(g(x))"""
    return reduce(lambda f, g: lambda x: f(g(x)), fns)

def pipe(*fns: Callable) -> Callable:
    """Compose left-to-right: pipe(f, g)(x) == g(f(x))"""
    return reduce(lambda f, g: lambda x: g(f(x)), fns)

double = lambda x: x * 2
add_one = lambda x: x + 1
square = lambda x: x * x

transform = pipe(double, add_one, square)
transform(3)  # square(add_one(double(3))) = square(7) = 49

# Immutable data patterns
from dataclasses import dataclass

@dataclass(frozen=True)  # Immutable
class Point:
    x: float
    y: float

    def translate(self, dx: float, dy: float) -> 'Point':
        return Point(self.x + dx, self.y + dy)  # Returns new Point

p = Point(0, 0)
p2 = p.translate(1, 2)  # p unchanged, p2 is new
```

---

## Type Systems

### Static vs Dynamic Typing
```
Static typing: types checked at compile time
  + Catch errors early (before runtime)
  + Better tooling (autocomplete, refactoring)
  + Self-documenting code
  + Performance (no runtime type checks)
  - More verbose
  - Less flexible for generic code (without generics/templates)
  Examples: Rust, Go, Java, TypeScript, Haskell

Dynamic typing: types checked at runtime
  + Flexible, concise
  + Faster prototyping
  - Runtime errors instead of compile errors
  - Harder to refactor large codebases
  Examples: Python, JavaScript, Ruby

Gradual typing (best of both):
  Optional type annotations
  Examples: TypeScript (JS + types), Python type hints + mypy
```

### Type System Features

#### Generics (Parametric Polymorphism)
```typescript
// Without generics: code duplication or loss of type info
function firstAny(arr: any[]): any { return arr[0]; }

// With generics: type-safe, reusable
function first<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

first([1, 2, 3]);         // TypeScript knows this is number | undefined
first(['a', 'b', 'c']);  // TypeScript knows this is string | undefined

// Constrained generics
function max<T extends { compare(other: T): number }>(a: T, b: T): T {
    return a.compare(b) >= 0 ? a : b;
}

// Generic class
class Stack<T> {
    private items: T[] = [];
    push(item: T): void { this.items.push(item); }
    pop(): T | undefined { return this.items.pop(); }
    peek(): T | undefined { return this.items[this.items.length - 1]; }
}

const numStack = new Stack<number>();
numStack.push(1); numStack.push(2);
```

#### Algebraic Data Types (ADTs)
```typescript
// Sum types (discriminated unions): ONE of several types
type Shape =
    | { kind: 'circle'; radius: number }
    | { kind: 'rectangle'; width: number; height: number }
    | { kind: 'triangle'; base: number; height: number }

function area(shape: Shape): number {
    switch (shape.kind) {
        case 'circle':     return Math.PI * shape.radius ** 2;
        case 'rectangle':  return shape.width * shape.height;
        case 'triangle':   return 0.5 * shape.base * shape.height;
        // TypeScript ensures exhaustiveness: missing a case = error
    }
}

// Product types (tuples/structs): ALL fields together
type User = { id: string; name: string; email: string };

// Option/Maybe: value or nothing (replaces null)
type Option<T> = { some: true; value: T } | { some: false };

// Result: success or failure
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function safeDivide(a: number, b: number): Result<number, string> {
    if (b === 0) return { ok: false, error: "Division by zero" };
    return { ok: true, value: a / b };
}
```

#### Structural vs Nominal Typing
```typescript
// TypeScript: structural typing (duck typing with types)
interface Quackable { quack(): void; }
interface Swimmable { swim(): void; }

// Any object with quack() satisfies Quackable
// No need to explicitly say "implements Quackable"
const duck = {
    quack() { console.log("Quack!"); },
    swim() { console.log("Splash!"); }
};

function makeItQuack(thing: Quackable) { thing.quack(); }
makeItQuack(duck);  // Works! duck has quack()

// Python structural typing via Protocol
from typing import Protocol

class Renderable(Protocol):
    def render(self) -> str: ...

class Button:
    def render(self) -> str: return "<button />"

def display(component: Renderable) -> None:
    print(component.render())

display(Button())  # Works! Button has render()
# Button doesn't need to inherit from Renderable
```

---

## Memory Management Strategies

### Manual Memory Management (C)
```
Programmer explicitly allocates and frees memory.
malloc/calloc/realloc → free

Pros: Maximum control, predictable performance, zero overhead
Cons: Use-after-free, double-free, memory leaks, buffer overflows

Safety tools:
  AddressSanitizer (-fsanitize=address): catches use-after-free, buffer overflow
  Valgrind: memory error detection + leak detection
  smart pointers in C++ (RAII): automatic cleanup
```

### Garbage Collection
```
Runtime automatically finds and frees unreachable objects.

Mark-and-Sweep:
  1. Mark: traverse from roots (globals, stack), mark all reachable
  2. Sweep: free everything not marked
  Pro: handles cycles
  Con: stop-the-world pause

Generational GC (JVM, Python, V8, .NET):
  Observation: most objects die young
  Young generation: small, collected frequently (minor GC)
  Old generation: larger, collected rarely (major GC)
  Eden → Survivor → Old

Concurrent GC (Go, Java G1/ZGC):
  Collection happens concurrently with application
  Eliminates or reduces stop-the-world pauses

Reference Counting (Python CPython, Swift, Rust Rc<T>):
  Track how many references point to each object
  Free when count reaches 0
  Con: cannot collect cycles → needs cycle detector

Languages: Python, Java, JavaScript, C#, Go, Haskell
```

### Ownership and Borrow Checking (Rust)
```
Rust's approach: compile-time memory management
  No GC, no manual malloc/free
  Ownership rules enforced by compiler

Ownership:
  Each value has exactly one owner
  When owner goes out of scope, value is dropped (freed)

Borrowing:
  References are temporary access without ownership
  Either: many immutable refs OR one mutable ref
  All refs must be valid (no dangling pointers)

Result: safe code with C performance, no GC pauses
Cost: steeper learning curve, fighting the borrow checker initially
```

---

## Concurrency Models

### Threads (Shared Memory)
```
Multiple threads share same memory space
Synchronization via mutexes, semaphores, condition variables

Problems:
  Race conditions: unsynchronized access to shared data
  Deadlocks: circular lock dependencies
  Overhead: thread creation, context switching (~100µs)

Languages: C, C++, Java, Python (with GIL caveat), Go

# Python threading (GIL limits to one thread at a time for CPU-bound!)
import threading
lock = threading.Lock()
shared = 0
def increment():
    global shared
    with lock:
        shared += 1
```

### Message Passing
```
No shared memory — communicate by passing messages
Erlang/Elixir: actor model (lightweight processes, mailboxes)
Go: goroutines + channels
CSP (Communicating Sequential Processes): the theory behind Go

Advantages:
  No shared state → no race conditions
  Scale to millions of goroutines/actors
  Natural fit for distributed systems

Disadvantages:
  Copying data between processes (overhead)
  More complex protocols for coordination
```

### Event Loop / Async (Single-threaded)
```
JavaScript, Python asyncio, Node.js

Single thread handles many concurrent I/O operations
Cooperative multitasking: give up control at await points
OS epoll/kqueue: watch many file descriptors efficiently

Advantages:
  No synchronization needed (single thread)
  Very efficient for I/O-bound workloads
  Simple mental model for I/O concurrency

Disadvantages:
  CPU-bound work blocks everything
  Callback hell (solved by async/await)
  Long synchronous operations block other tasks
```

---

## Evaluation Strategies

### Eager vs Lazy Evaluation
```python
# Eager: evaluate immediately
result = expensive_computation()  # Runs now, even if unused

# Lazy: evaluate on demand
def lazy_value():
    return expensive_computation()
result = lazy_value  # Doesn't run yet
actual = result()    # Runs now

# Python generators: lazy sequences
def infinite_count(start=0):
    n = start
    while True:
        yield n
        n += 1

counter = infinite_count(1)  # No computation
next(counter)  # 1
next(counter)  # 2

# Lazy evaluation in operations
numbers = range(10**9)          # O(1) — no actual list
squares = (x*x for x in numbers) # Generator, no computation yet
first_ten = list(itertools.islice(squares, 10))  # Compute only 10
```

### Call by Value vs Call by Reference
```python
# Python: "Call by object reference" (or "call by sharing")
# Mutable objects: reference shared
def modify_list(lst):
    lst.append(42)  # Modifies original!

my_list = [1, 2, 3]
modify_list(my_list)
# my_list is now [1, 2, 3, 42]

# Immutable objects: new object created on "modification"
def modify_string(s):
    s += " world"  # Creates new string, original unchanged
    return s

my_str = "hello"
result = modify_string(my_str)
# my_str is still "hello"
```

---

## Metaprogramming

### Reflection
```python
# Python runtime introspection
import inspect

class MyClass:
    def __init__(self, x):
        self.x = x

    def method(self):
        return self.x * 2

obj = MyClass(5)

# Inspect at runtime
print(type(obj))                           # <class '__main__.MyClass'>
print(dir(obj))                            # List of attributes/methods
print(hasattr(obj, 'method'))              # True
print(getattr(obj, 'method')())            # 10 (call method by name)
setattr(obj, 'y', 100)                     # Dynamically add attribute
print(inspect.signature(MyClass.__init__)) # (self, x)
print(inspect.getsource(MyClass))          # Source code as string
```

### Macros and Code Generation
```
Macros: code that writes code (compile-time)

Rust procedural macros:
  #[derive(Debug, Clone, PartialEq)] — auto-implements traits
  #[tokio::main] — transforms async main function
  serde: #[derive(Serialize, Deserialize)] — auto JSON serialization

Lisp: homoiconic (code is data)
  (defmacro when (condition &body body)
    `(if ,condition (progn ,@body)))

C preprocessor (simple text substitution):
  #define MAX(a, b) ((a) > (b) ? (a) : (b))
  Issues: no type safety, multiple evaluation
```

---

## Language Design Trade-offs

```
Expressiveness vs Simplicity:
  Haskell: extremely expressive, hard to learn
  Go: deliberately simple, fewer abstractions
  Python: expressive but interpreted

Safety vs Performance:
  Rust: both (but complex)
  C: performance, no safety
  Java: safety with GC overhead

Strictness vs Flexibility:
  Haskell: pure functional, very strict
  Python: dynamic, very flexible
  TypeScript: gradual strictness

Conciseness vs Readability:
  APL: extreme conciseness, near-unreadable
  Go: verbose but obvious
  Python: concise and readable

Static vs Dynamic:
  TypeScript: best of both worlds for JS
  Python + mypy: similar compromise
```

---

*Every language is a set of trade-offs made concrete. Understanding the trade-offs — not just the syntax — makes you fluent in any language.*
