# Rust — Complete Reference

> Rust's promise: systems programming without memory bugs. The borrow checker is your pair programmer that never sleeps.

---

## Why Rust?

```
Memory safety without GC:
  → Ownership system catches use-after-free, double-free, data races at compile time
  → Zero runtime overhead — same performance as C

Fearless concurrency:
  → Ownership prevents data races at compile time
  → "If it compiles, it's probably correct"

Modern language features:
  → Algebraic types, pattern matching, traits, closures, async/await
  → Excellent tooling (cargo, rustfmt, clippy)

Use cases:
  → Systems programming (OS kernels, embedded, device drivers)
  → Web backends, CLIs, WebAssembly, game engines
  → Anywhere C/C++ is used but you want safety
```

---

## Ownership, Borrowing, Lifetimes

### Ownership Rules
```rust
// 1. Every value has exactly one owner
// 2. When the owner goes out of scope, the value is dropped (freed)
// 3. You can transfer ownership (move) or borrow (reference)

fn main() {
    let s1 = String::from("hello");  // s1 owns the String
    let s2 = s1;                      // Ownership MOVED to s2
    // println!("{}", s1);             // ERROR: s1 no longer valid!
    println!("{}", s2);               // OK

    let s3 = s2.clone();              // Deep copy — both valid
    println!("{} {}", s2, s3);

    // Stack types implement Copy (no move semantics)
    let x: i32 = 5;
    let y = x;                        // Copy — both valid
    println!("{} {}", x, y);
}

// Ownership in functions
fn take_ownership(s: String) {        // s comes in
    println!("{}", s);
}   // s dropped here

fn makes_copy(x: i32) -> i32 {        // x copied in
    x                                  // x returned
}

let s = String::from("hello");
take_ownership(s);
// println!("{}", s);                  // ERROR: moved into function

// Return to give back ownership
fn take_and_give_back(s: String) -> String {
    s  // Return — moves ownership back out
}
```

### Borrowing (References)
```rust
fn calculate_length(s: &String) -> usize {  // & = borrow, not own
    s.len()
}   // s not dropped — we don't own it

let s = String::from("hello");
let len = calculate_length(&s);  // Pass reference
println!("{} has length {}", s, len);  // s still valid!

// Mutable references
fn change(s: &mut String) {
    s.push_str(" world");
}
let mut s = String::from("hello");
change(&mut s);
println!("{}", s);  // "hello world"

// Rules:
// 1. Either ONE mutable reference OR any number of immutable references
// 2. References must always be valid (no dangling references)

let mut s = String::from("hello");
let r1 = &s;       // Immutable borrow
let r2 = &s;       // Another immutable borrow — OK
// let r3 = &mut s;  // ERROR: can't have mut + immut at same time
println!("{} {}", r1, r2);
// r1, r2 no longer used after this point (NLL: Non-Lexical Lifetimes)
let r3 = &mut s;   // OK now — r1, r2 no longer in use
r3.push_str("!");
```

### Slices
```rust
let s = String::from("hello world");
let hello: &str = &s[0..5];   // Slice — reference into string
let world: &str = &s[6..11];
// s is dropped → hello, world become dangling — compiler prevents this

// String literals are &str (slice of read-only memory)
let literal: &str = "hello";

// Array slices
let a = [1, 2, 3, 4, 5];
let slice: &[i32] = &a[1..3];  // [2, 3]
```

### Lifetimes
```rust
// Lifetimes prevent dangling references
// Compiler infers most lifetimes — you annotate when ambiguous

// This won't compile without lifetime annotation
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    // 'a says: the returned reference lives at least as long as
    // the shorter of x and y
    if x.len() > y.len() { x } else { y }
}

let string1 = String::from("long string");
let result;
{
    let string2 = String::from("xyz");
    result = longest(string1.as_str(), string2.as_str());
    println!("{}", result);  // OK — both still alive
}
// println!("{}", result);   // ERROR — string2 dropped

// Lifetime in struct
struct Important<'a> {
    part: &'a str,  // Struct can't outlive the string it references
}

// Static lifetime: lives for entire program
let s: &'static str = "I live forever";
```

---

## Data Types

### Primitives and Compound Types
```rust
// Integers
let i: i8 = -128;       // i8, i16, i32 (default), i64, i128, isize
let u: u32 = 1_000_000; // u8, u16, u32, u64, u128, usize
let h: u8 = 0xFF;
let b: u8 = 0b1010_1010;

// Floats
let f: f64 = 3.14;  // f32, f64 (default)

// Booleans, chars
let t: bool = true;
let c: char = '🦀';  // char is 4 bytes (Unicode scalar)

// Tuples
let tup: (i32, f64, char) = (500, 6.4, 'x');
let (x, y, z) = tup;       // Destructure
let first = tup.0;          // Index access

// Arrays (fixed size, stack)
let arr: [i32; 5] = [1, 2, 3, 4, 5];
let zeros = [0; 100];  // [0, 0, 0, ...] 100 elements

// Vectors (dynamic, heap)
let mut v: Vec<i32> = Vec::new();
v.push(1); v.push(2); v.push(3);
let v2 = vec![1, 2, 3];  // Macro
println!("{}", v2[0]);
println!("{:?}", &v2[1..3]);  // Slice

// HashMap
use std::collections::HashMap;
let mut scores: HashMap<String, i32> = HashMap::new();
scores.insert(String::from("Alice"), 100);
let score = scores.get("Alice");          // Option<&i32>
scores.entry(String::from("Bob")).or_insert(50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

### Enums and Pattern Matching
```rust
// The most powerful feature: algebraic data types
enum Message {
    Quit,
    Move { x: i32, y: i32 },     // Struct variant
    Write(String),                 // Tuple variant
    Color(i32, i32, i32),
}

let msg = Message::Move { x: 10, y: 20 };

match msg {
    Message::Quit => println!("Quit"),
    Message::Move { x, y } => println!("Move to {},{}", x, y),
    Message::Write(text) => println!("Write: {}", text),
    Message::Color(r, g, b) => println!("Color: {},{},{}", r, g, b),
}

// Option<T>: the safe null replacement
let some_value: Option<i32> = Some(42);
let no_value: Option<i32> = None;

match some_value {
    Some(v) => println!("{}", v),
    None => println!("nothing"),
}

// Concise match with if let
if let Some(v) = some_value {
    println!("{}", v);
}

// while let
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{}", top);
}

// Result<T, E>: error handling
use std::num::ParseIntError;
fn parse_number(s: &str) -> Result<i32, ParseIntError> {
    s.trim().parse::<i32>()
}

match parse_number("42") {
    Ok(n) => println!("{}", n),
    Err(e) => println!("Error: {}", e),
}

// ? operator: propagate errors
fn read_file(path: &str) -> Result<String, std::io::Error> {
    let mut f = std::fs::File::open(path)?;  // Return Err if fails
    let mut contents = String::new();
    std::io::Read::read_to_string(&mut f, &mut contents)?;
    Ok(contents)
}
```

### Structs
```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    // Associated function (like static method)
    fn new(x: f64, y: f64) -> Self {
        Point { x, y }  // Shorthand: x: x
    }

    fn origin() -> Self {
        Point { x: 0.0, y: 0.0 }
    }

    // Method: &self = immutable borrow of self
    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }

    // Mutable method
    fn translate(&mut self, dx: f64, dy: f64) {
        self.x += dx;
        self.y += dy;
    }

    // Consuming method
    fn into_tuple(self) -> (f64, f64) {
        (self.x, self.y)
    }
}

let p1 = Point::new(0.0, 0.0);
let p2 = Point { x: 3.0, y: 4.0 };
println!("{}", p1.distance(&p2));  // 5.0
println!("{:?}", p2);  // Debug print: Point { x: 3.0, y: 4.0 }

// Tuple struct
struct Color(u8, u8, u8);
let red = Color(255, 0, 0);
println!("{}", red.0);

// Unit struct
struct AlwaysEqual;
```

---

## Traits

### Defining and Implementing Traits
```rust
// Trait: shared interface (like interface in other languages)
trait Summary {
    fn summarize(&self) -> String;  // Abstract method

    // Default implementation
    fn preview(&self) -> String {
        format!("{}...", &self.summarize()[..50.min(self.summarize().len())])
    }
}

struct Article {
    title: String,
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}, by {}", self.title, self.author)
    }
}

// Trait objects (dynamic dispatch)
fn notify(item: &dyn Summary) {
    println!("Summary: {}", item.summarize());
}

// Trait bounds (static dispatch — monomorphized, faster)
fn notify_generic<T: Summary>(item: &T) {
    println!("Summary: {}", item.summarize());
}

// Where clause (cleaner for multiple bounds)
fn process<T>(item: &T)
where T: Summary + Clone + std::fmt::Debug
{
    println!("{:?}", item);
}

// impl Trait syntax
fn make_summarizer() -> impl Summary {
    Article {
        title: String::from("Rust"),
        author: String::from("Alice"),
        content: String::from("Rust is great"),
    }
}

// Standard traits
use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

// Iterator trait
struct Counter { count: u32 }

impl Iterator for Counter {
    type Item = u32;  // Associated type

    fn next(&mut self) -> Option<Self::Item> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

let sum: u32 = Counter { count: 0 }
    .map(|x| x * 2)
    .filter(|x| x % 3 == 0)
    .sum();
```

---

## Error Handling

```rust
use std::fmt;
use std::io;

// Custom error type
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
    Custom(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "IO error: {}", e),
            AppError::Parse(e) => write!(f, "Parse error: {}", e),
            AppError::Custom(msg) => write!(f, "Error: {}", msg),
        }
    }
}

// Implement std::error::Error
impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            AppError::Io(e) => Some(e),
            AppError::Parse(e) => Some(e),
            AppError::Custom(_) => None,
        }
    }
}

// From trait enables ? operator conversion
impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self { AppError::Io(e) }
}
impl From<std::num::ParseIntError> for AppError {
    fn from(e: std::num::ParseIntError) -> Self { AppError::Parse(e) }
}

// Now ? works seamlessly
fn process(path: &str) -> Result<i32, AppError> {
    let content = std::fs::read_to_string(path)?;  // io::Error → AppError
    let n = content.trim().parse::<i32>()?;          // ParseIntError → AppError
    Ok(n * 2)
}

// thiserror crate (easier custom errors)
// #[derive(thiserror::Error, Debug)]
// enum AppError {
//     #[error("IO error: {0}")]
//     Io(#[from] io::Error),
//     #[error("Custom: {msg}")]
//     Custom { msg: String },
// }

// anyhow crate (for applications — any error type)
// use anyhow::{Context, Result};
// fn process() -> Result<()> {
//     let content = std::fs::read_to_string("file")
//         .context("Failed to read file")?;
//     Ok(())
// }
```

---

## Closures and Iterators

```rust
// Closures capture environment
let threshold = 10;
let is_big = |n: i32| n > threshold;  // Captures threshold
println!("{}", is_big(15));  // true

// Fn, FnMut, FnOnce traits
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }
fn apply_mut<F: FnMut(i32) -> i32>(mut f: F, x: i32) -> i32 { f(x) }
fn apply_once<F: FnOnce(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }

let mut count = 0;
let mut inc = || { count += 1; count };  // FnMut
println!("{}", inc());  // 1

// move: take ownership of captured vars (for threads)
let s = String::from("hello");
let print_s = move || println!("{}", s);  // s moved into closure
std::thread::spawn(print_s).join().unwrap();
// println!("{}", s);  // ERROR: s moved

// Iterator combinators
let v = vec![1, 2, 3, 4, 5, 6];

let result: Vec<i32> = v.iter()
    .filter(|&&x| x % 2 == 0)   // Keep evens
    .map(|&x| x * x)             // Square
    .collect();                   // [4, 16, 36]

let sum: i32 = v.iter().sum();
let product: i32 = v.iter().product();
let max = v.iter().max();

// chain, zip, enumerate, flat_map, take, skip
let chained: Vec<i32> = vec![1,2].into_iter()
    .chain(vec![3,4].into_iter())
    .collect();

for (i, val) in v.iter().enumerate() {
    println!("{}: {}", i, val);
}

// Lazy — nothing computed until consumed
let lazy = (0..1_000_000)
    .filter(|x| x % 2 == 0)
    .map(|x| x * x)
    .take(5);
// No computation yet!
let result: Vec<i64> = lazy.collect();  // Computed here
```

---

## Concurrency

```rust
use std::thread;
use std::sync::{Arc, Mutex, RwLock};
use std::sync::mpsc;  // Multi-producer, single-consumer

// Threads + message passing
let (tx, rx) = mpsc::channel();

let tx1 = tx.clone();
thread::spawn(move || {
    tx1.send(String::from("hello")).unwrap();
});

thread::spawn(move || {
    tx.send(String::from("world")).unwrap();
});

for msg in rx {  // Blocks until all senders dropped
    println!("{}", msg);
}

// Shared state: Arc<Mutex<T>>
// Arc: atomic reference counting (thread-safe Rc)
// Mutex: mutual exclusion
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
    handles.push(handle);
}

for h in handles { h.join().unwrap(); }
println!("{}", *counter.lock().unwrap());  // 10

// RwLock: multiple readers OR one writer
let data = Arc::new(RwLock::new(vec![1, 2, 3]));

let reader = Arc::clone(&data);
thread::spawn(move || {
    let v = reader.read().unwrap();
    println!("{:?}", *v);
});

let writer = Arc::clone(&data);
thread::spawn(move || {
    let mut v = writer.write().unwrap();
    v.push(4);
});

// Send and Sync marker traits:
// Send: type can be transferred across thread boundary
// Sync: type can be shared (referenced) by multiple threads
// Rc<T>: neither Send nor Sync
// Arc<T>: Send + Sync (if T: Send + Sync)
// Mutex<T>: Send + Sync (if T: Send)
```

---

## Async/Await

```rust
use tokio;  // Most popular async runtime

#[tokio::main]
async fn main() {
    let result = fetch_data("https://api.example.com").await;
    println!("{}", result);
}

async fn fetch_data(url: &str) -> String {
    // reqwest or similar
    let resp = reqwest::get(url).await.unwrap();
    resp.text().await.unwrap()
}

// Concurrent tasks
use tokio::task;

async fn do_many_things() {
    // Join: run concurrently, wait for all
    let (r1, r2) = tokio::join!(
        fetch_data("url1"),
        fetch_data("url2"),
    );

    // Spawn independent tasks
    let handle = task::spawn(async {
        fetch_data("url3").await
    });
    let r3 = handle.await.unwrap();

    // Select: first to complete wins
    tokio::select! {
        val = fetch_data("url4") => println!("Got: {}", val),
        _ = tokio::time::sleep(std::time::Duration::from_secs(5)) => {
            println!("Timeout!");
        }
    }
}

// Async in traits requires async-trait crate (until stabilized)
use async_trait::async_trait;

#[async_trait]
trait Fetcher {
    async fn fetch(&self, url: &str) -> String;
}
```

---

## Cargo and Ecosystem

```bash
# Project management
cargo new myapp         # New binary project
cargo new mylib --lib   # New library
cargo build             # Compile (debug)
cargo build --release   # Compile optimized
cargo run               # Build + run
cargo test              # Run tests
cargo check             # Fast type-check only (no codegen)
cargo clippy            # Linter
cargo fmt               # Formatter
cargo doc --open        # Generate + view docs

# Dependencies
cargo add tokio --features full    # Add dependency
cargo update                       # Update lockfile
cargo tree                         # Dependency tree
cargo audit                        # Security audit

# Workspaces (monorepo)
# Cargo.toml:
# [workspace]
# members = ["app", "lib1", "lib2"]
```

```toml
# Cargo.toml
[package]
name = "myapp"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
thiserror = "1"
reqwest = { version = "0.11", features = ["json"] }
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio"] }

[dev-dependencies]
mockall = "0.11"

[profile.release]
opt-level = 3
lto = true        # Link-time optimization
codegen-units = 1 # Better optimization, slower compile
```

---

*The borrow checker is your friend. It's teaching you to write correct code. Fight it less, understand it more.*
