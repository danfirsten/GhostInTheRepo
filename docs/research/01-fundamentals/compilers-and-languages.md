# Compilers & Language Theory — Complete Reference

> Understanding how languages work under the hood gives you power over every language you write.

---

## Compiler Pipeline

```
Source Code
    ↓
Lexical Analysis (Lexer/Scanner)
    → Tokens
    ↓
Syntax Analysis (Parser)
    → Abstract Syntax Tree (AST)
    ↓
Semantic Analysis
    → Type-checked AST with symbol table
    ↓
Intermediate Representation (IR)
    → Three-Address Code, SSA, LLVM IR
    ↓
Optimization
    → Optimized IR
    ↓
Code Generation
    → Machine code / Bytecode
```

---

## Lexical Analysis

### Tokens
```
Source: "x = 42 + y;"

Tokens:
  IDENTIFIER(x)
  ASSIGN(=)
  INTEGER(42)
  PLUS(+)
  IDENTIFIER(y)
  SEMICOLON(;)
```

### Regular Expressions → NFA → DFA
Tokens described by regular expressions.
Converted to NFA (Thompson's construction) → DFA (subset construction) → minimized DFA.

Lex/Flex generates lexers from regex rules.

---

## Parsing

### Context-Free Grammars
```
E → E + T | T
T → T * F | F
F → (E) | id | number

Derivation of "id + id * id":
E → E + T → T + T → F + T → id + T → id + T * F → id + F * F → id + id * F → id + id * id
```

### Parsing Strategies

**LL (Left-to-right, Leftmost derivation) — Top-Down:**
- Predict rules from lookahead
- Recursive descent (hand-written parsers)
- LL(k): k tokens of lookahead
- Problem: left recursion, ambiguity

**LR (Left-to-right, Rightmost derivation) — Bottom-Up:**
- Shift-reduce parsing
- LR(0), SLR(1), LALR(1), LR(1)
- YACC/Bison generates LALR(1) parsers
- More powerful than LL

**Recursive Descent Parser (Hand-Written):**
```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self): return self.tokens[self.pos] if self.pos < len(self.tokens) else None
    def consume(self): t = self.peek(); self.pos += 1; return t
    def expect(self, type): t = self.consume(); assert t.type == type; return t

    def parse_expr(self):
        return self.parse_addition()

    def parse_addition(self):
        left = self.parse_multiplication()
        while self.peek() and self.peek().type == 'PLUS':
            op = self.consume()
            right = self.parse_multiplication()
            left = BinaryOp(op, left, right)
        return left

    def parse_multiplication(self):
        left = self.parse_primary()
        while self.peek() and self.peek().type in ('STAR', 'SLASH'):
            op = self.consume()
            right = self.parse_primary()
            left = BinaryOp(op, left, right)
        return left

    def parse_primary(self):
        t = self.peek()
        if t.type == 'NUMBER':
            return Number(self.consume().value)
        if t.type == 'LPAREN':
            self.expect('LPAREN')
            expr = self.parse_expr()
            self.expect('RPAREN')
            return expr
        raise SyntaxError(f"Unexpected token: {t}")
```

### AST (Abstract Syntax Tree)
```python
# AST Node types
from dataclasses import dataclass

@dataclass
class Number:
    value: float

@dataclass
class BinaryOp:
    op: str     # '+', '-', '*', '/'
    left: 'Expr'
    right: 'Expr'

@dataclass
class Variable:
    name: str

@dataclass
class LetBinding:
    name: str
    value: 'Expr'
    body: 'Expr'

# "let x = 3 + 4 in x * 2"
ast = LetBinding(
    name="x",
    value=BinaryOp("+", Number(3), Number(4)),
    body=BinaryOp("*", Variable("x"), Number(2))
)
```

---

## Semantic Analysis

### Type Systems

**Static vs Dynamic Typing:**
- Static: types checked at compile time (Java, C, Rust, TypeScript)
- Dynamic: types checked at runtime (Python, JavaScript, Ruby)

**Strong vs Weak Typing:**
- Strong: no implicit coercions (Python: `"3" + 3` → TypeError)
- Weak: implicit conversions (JavaScript: `"3" + 3` → "33")

**Type Inference:**
```
// Hindley-Milner type inference (ML, Haskell, Rust)
let add x y = x + y
// Infers: add : 'a -> 'a -> 'a  (where 'a is Num)

// Without annotation, types inferred from usage
let x = 5          // int
let y = 5.0        // float
let z = "hello"    // string
```

**Nominal vs Structural Typing:**
- Nominal: type compatibility by name (Java, C#)
- Structural/Duck: type compatibility by shape (TypeScript, Go interfaces, Python protocols)

### Symbol Table & Scope
```python
class SymbolTable:
    def __init__(self, parent=None):
        self.symbols = {}
        self.parent = parent

    def define(self, name, symbol_type):
        self.symbols[name] = symbol_type

    def lookup(self, name):
        if name in self.symbols:
            return self.symbols[name]
        if self.parent:
            return self.parent.lookup(name)
        raise NameError(f"Undefined: {name}")

    def new_scope(self):
        return SymbolTable(parent=self)
```

---

## Intermediate Representations

### Three-Address Code
```
x = a + b * c - d

becomes:
t1 = b * c
t2 = a + t1
t3 = t2 - d
x = t3
```

### SSA (Static Single Assignment)
```
// Each variable defined exactly once
// Use φ (phi) functions at merge points

if (condition) {
    x = 1;
} else {
    x = 2;
}
use(x);

SSA form:
if (condition) {
    x1 = 1;
} else {
    x2 = 2;
}
x3 = φ(x1, x2)  // pick based on control flow
use(x3)
```
SSA enables many powerful optimizations.

### LLVM IR
```llvm
define i32 @add(i32 %a, i32 %b) {
entry:
  %result = add i32 %a, %b
  ret i32 %result
}
```
LLVM IR is the foundation of Clang (C/C++), Rust, Swift, Julia.

---

## Optimization

### Local Optimizations

**Constant Folding:**
```
x = 3 + 4    →    x = 7      (computed at compile time)
```

**Constant Propagation:**
```
x = 7
y = x + 1   →   y = 8
```

**Dead Code Elimination:**
```
x = expensive_fn()    // x never used afterward
// Remove entirely
```

**Common Subexpression Elimination:**
```
a = b + c
d = b + c   →   a = b + c; d = a
```

### Loop Optimizations

**Loop Invariant Code Motion:**
```c
for (int i = 0; i < n; i++) {
    x = a * b;    // a*b doesn't change
    arr[i] = x;
}
// →
x = a * b;
for (int i = 0; i < n; i++) {
    arr[i] = x;
}
```

**Loop Unrolling:**
```c
for (int i = 0; i < 4; i++) arr[i] *= 2;
// →
arr[0] *= 2; arr[1] *= 2; arr[2] *= 2; arr[3] *= 2;
// Reduces loop overhead, enables vectorization
```

**Loop Vectorization (SIMD):**
```c
// Compiler auto-vectorizes with SSE/AVX
for (int i = 0; i < n; i++) a[i] = b[i] + c[i];
// Becomes: process 4 or 8 elements per instruction
```

### Inlining
Replace function call with function body:
- Eliminates call overhead
- Enables further optimizations
- Can increase code size (use sparingly)

```c
inline int square(int x) { return x * x; }
// square(5) → 25 at compile time
// square(y) → y * y in code
```

---

## Runtime Systems

### Garbage Collection

**Mark-and-Sweep:**
```
1. Mark phase: trace from roots, mark all reachable
2. Sweep phase: collect unmarked (unreachable)

Roots: stack variables, global variables, registers
Stop-the-world: must pause execution during collection
```

**Reference Counting:**
```python
# Python (CPython) primary GC
x = [1, 2, 3]    # refcount = 1
y = x             # refcount = 2
del x             # refcount = 1
del y             # refcount = 0 → immediate deallocation
```
Problem: cycles → supplemental cyclic GC needed.

**Generational GC:**
Most objects die young (weak generational hypothesis).
- Generation 0 (young): collected frequently, fast
- Generation 1 (middle): collected occasionally
- Generation 2 (old): collected rarely

Used in: CPython, JVM (.NET, V8).

**Tracing GC (JVM HotSpot):**
- **Parallel GC**: uses multiple threads for GC
- **G1 GC**: region-based, predictable pause times
- **ZGC**: concurrent, sub-millisecond pauses (JDK 15+)
- **Shenandoah**: concurrent, OpenJDK

**Rust: Ownership (no GC):**
```rust
// Ownership rules:
// 1. Each value has one owner
// 2. When owner goes out of scope, value dropped
// 3. Only one mutable reference OR many immutable references

fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // Move: s1 no longer valid
    println!("{}", s2);  // OK
    // println!("{}", s1);  // Compile error: s1 moved

    let s3 = String::from("world");
    let s4 = &s3;   // Borrow: s3 still owns
    println!("{} {}", s3, s4);  // Both valid
}
```

### JIT Compilation
```
Source → Bytecode → Interpreter → Profile hot paths → JIT compile → Native code

Examples:
JVM HotSpot: interprets → JIT hot methods
V8: Ignition (interpreter) → Turbofan (JIT compiler)
PyPy: RPython-based JIT
LuaJIT: FFI + JIT compiler
```

---

## Language Paradigms

### Imperative
- Sequence of statements that change state
- C, Python (can be), Java

### Object-Oriented
- Objects with state and behavior
- Encapsulation, inheritance, polymorphism
- Java, C++, Python, Ruby

### Functional
- Functions as first-class values
- Immutability, pure functions
- Haskell, Clojure, Erlang, Elixir
- Supported in: Python, JavaScript, Rust

### Declarative
- Specify what, not how
- SQL, HTML, CSS, Prolog, configuration languages

### Logic Programming
- Express facts and rules
- Prolog: pattern matching + backtracking

### Array/Vectorized
- Operations on entire arrays
- APL, NumPy (Python), SQL

---

## Build Your Own Interpreter

```python
# Complete tiny interpreter for arithmetic + variables

import re
from dataclasses import dataclass
from typing import Union

# Tokens
@dataclass
class Token:
    type: str
    value: str

def tokenize(source: str) -> list[Token]:
    patterns = [
        ('NUMBER', r'\d+(\.\d+)?'),
        ('PLUS', r'\+'), ('MINUS', r'-'),
        ('STAR', r'\*'), ('SLASH', r'/'),
        ('LPAREN', r'\('), ('RPAREN', r'\)'),
        ('ASSIGN', r'='), ('IDENT', r'[a-zA-Z_]\w*'),
        ('SKIP', r'\s+'), ('MISMATCH', r'.'),
    ]
    combined = '|'.join(f'(?P<{name}>{pat})' for name, pat in patterns)
    tokens = []
    for m in re.finditer(combined, source):
        if m.lastgroup not in ('SKIP',):
            tokens.append(Token(m.lastgroup, m.group()))
    return tokens

# Parser (Recursive Descent)
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self): return self.tokens[self.pos] if self.pos < len(self.tokens) else Token('EOF', '')
    def consume(self): t = self.peek(); self.pos += 1; return t

    def parse(self):
        return self.parse_expr()

    def parse_expr(self):
        left = self.parse_term()
        while self.peek().type in ('PLUS', 'MINUS'):
            op = self.consume().type
            right = self.parse_term()
            left = (op, left, right)
        return left

    def parse_term(self):
        left = self.parse_primary()
        while self.peek().type in ('STAR', 'SLASH'):
            op = self.consume().type
            right = self.parse_primary()
            left = (op, left, right)
        return left

    def parse_primary(self):
        t = self.peek()
        if t.type == 'NUMBER':
            self.consume()
            return float(t.value)
        if t.type == 'IDENT':
            self.consume()
            return ('var', t.value)
        if t.type == 'LPAREN':
            self.consume()
            expr = self.parse_expr()
            assert self.peek().type == 'RPAREN'
            self.consume()
            return expr
        raise SyntaxError(f"Unexpected: {t}")

# Evaluator (Tree-Walk Interpreter)
def evaluate(node, env: dict):
    if isinstance(node, float):
        return node
    if isinstance(node, tuple):
        op = node[0]
        if op == 'var':
            return env[node[1]]
        left = evaluate(node[1], env)
        right = evaluate(node[2], env)
        if op == 'PLUS':  return left + right
        if op == 'MINUS': return left - right
        if op == 'STAR':  return left * right
        if op == 'SLASH': return left / right

# Test
env = {'x': 10, 'y': 5}
tokens = tokenize("(x + y) * 2")
ast = Parser(tokens).parse()
result = evaluate(ast, env)  # 30.0
```

---

*Understanding compilers transforms you from someone who writes code to someone who understands code. Every language concept has a formal underpinning — learn it.*
