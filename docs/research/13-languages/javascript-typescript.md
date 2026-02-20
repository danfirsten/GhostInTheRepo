# JavaScript & TypeScript — Complete Reference

> JavaScript is the most misunderstood language in the world. Understood deeply, it's powerful and expressive. TypeScript makes it production-grade.

---

## JavaScript Under the Hood

### The Event Loop
```
┌─────────────────────────────────┐
│             Call Stack           │
└─────────────────────────────────┘
         ↓ (empty stack)
┌─────────────────────────────────┐
│         Microtask Queue          │  ← Promises, queueMicrotask
│  (runs COMPLETELY between tasks) │
└─────────────────────────────────┘
         ↓ (after microtasks)
┌─────────────────────────────────┐
│          Task Queue (Macro)      │  ← setTimeout, setInterval, I/O, events
│   (one task at a time)           │
└─────────────────────────────────┘
```

```javascript
console.log('1')

setTimeout(() => console.log('2'), 0)  // Macro task

Promise.resolve().then(() => console.log('3'))  // Microtask

console.log('4')

// Output: 1, 4, 3, 2
// Microtasks always before next macro task
```

### Execution Context & Closures
```javascript
function outer() {
    let count = 0;           // Lives in outer's scope

    return function inner() {
        count++;             // Closes over outer's count
        return count;
    };
}

const counter = outer();
counter();  // 1
counter();  // 2
counter();  // 3

// count persists because inner holds reference to outer's scope
// This is the closure — inner "closes over" the outer scope

// Classic bug: var in loops
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);  // 3, 3, 3 (var is function-scoped)
}

// Fix 1: let (block-scoped)
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);  // 0, 1, 2
}

// Fix 2: IIFE closure
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(() => console.log(j), 100);
    })(i);
}
```

### Prototype Chain
```javascript
function Animal(name) {
    this.name = name;
}
Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

function Dog(name, breed) {
    Animal.call(this, name);  // Super call
    this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
    return `${this.name} barks`;
};

const dog = new Dog("Rex", "Labrador");
dog.speak();  // "Rex barks"
// Prototype chain: dog → Dog.prototype → Animal.prototype → Object.prototype → null

// Modern class syntax (same underlying mechanism)
class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return `${this.name} makes a sound`;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
    speak() {
        return `${this.name} barks`;
    }
}
```

### `this` Binding
```javascript
// 1. Default binding (global or undefined in strict mode)
function fn() { console.log(this); }
fn();  // window or undefined (strict)

// 2. Implicit binding (method call)
const obj = { fn() { console.log(this); } };
obj.fn();  // obj

// 3. Explicit binding
fn.call(obj, arg1, arg2)
fn.apply(obj, [arg1, arg2])
const bound = fn.bind(obj)  // Returns new function

// 4. new binding
const instance = new Constructor();  // this = new object

// 5. Arrow function: no own this, inherits from enclosing
class Timer {
    constructor() {
        this.seconds = 0;
    }
    start() {
        setInterval(() => {
            this.seconds++;  // Arrow: this is Timer instance
        }, 1000);
    }
}

// Priority: new > explicit > implicit > default
```

---

## Promises & Async

```javascript
// Promise states: pending → fulfilled | rejected
const p = new Promise((resolve, reject) => {
    setTimeout(() => resolve(42), 1000);
    // Or: reject(new Error("Failed"))
});

p.then(value => console.log(value))
 .catch(err => console.error(err))
 .finally(() => console.log("Done"));

// Promise combinators
Promise.all([p1, p2, p3])       // All succeed, or first failure
Promise.allSettled([p1, p2])    // Wait for all, regardless of outcome
Promise.race([p1, p2])          // First to settle (success or failure)
Promise.any([p1, p2, p3])       // First to succeed (fail if all fail)

// async/await
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch user:", err);
        throw err;  // Re-throw for caller
    }
}

// Parallel execution
async function fetchAll(ids) {
    const users = await Promise.all(ids.map(id => fetchUser(id)));  // Parallel
    return users;
}

// Sequential
async function sequential(items) {
    const results = [];
    for (const item of items) {
        results.push(await process(item));  // One at a time
    }
    return results;
}

// AbortController for cancellation
const controller = new AbortController();
const { signal } = controller;

fetch("/api/data", { signal })
    .then(res => res.json())
    .catch(err => {
        if (err.name === 'AbortError') {
            console.log('Request aborted');
        }
    });

setTimeout(() => controller.abort(), 5000);  // Cancel after 5s
```

---

## Functional Programming in JS

```javascript
// Pure functions, immutability, higher-order functions

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map, filter, reduce
const result = data
    .filter(n => n % 2 === 0)         // [2, 4, 6, 8, 10]
    .map(n => n * n)                   // [4, 16, 36, 64, 100]
    .reduce((sum, n) => sum + n, 0);   // 220

// Immutable updates
const original = { name: "Alice", age: 30 };
const updated = { ...original, age: 31 };  // New object
const arr = [1, 2, 3];
const newArr = [...arr, 4];  // [1, 2, 3, 4]

// Currying
const add = a => b => a + b;
const add5 = add(5);
add5(3);  // 8

// Composition
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(
    x => x * 2,
    x => x + 1,
    x => x.toString()
);
transform(5);  // "11"

// Memoization
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const memoFib = memoize(function fib(n) {
    if (n <= 1) return n;
    return memoFib(n-1) + memoFib(n-2);
});
```

---

## TypeScript

### Type System
```typescript
// Primitives
let n: number = 42;
let s: string = "hello";
let b: boolean = true;
let sym: symbol = Symbol("key");
let big: bigint = 9007199254740991n;

// Any (avoid), Unknown (safer), Never
let any: any = anything;           // Escape hatch
let unknown: unknown = anything;   // Must narrow before use
function throws(): never {         // Never returns
    throw new Error("always");
}

// Union types
type ID = string | number;
type Status = "active" | "inactive" | "pending";

// Intersection types
type Employee = Person & { employeeId: string };

// Type guards
function isString(x: unknown): x is string {
    return typeof x === 'string';
}

function processId(id: ID) {
    if (typeof id === 'string') {
        id.toUpperCase();  // TypeScript knows id is string here
    } else {
        id.toFixed(0);     // TypeScript knows id is number here
    }
}

// Narrowing with instanceof
if (error instanceof NetworkError) {
    error.statusCode;  // TypeScript knows type
}
```

### Interfaces vs Types
```typescript
// Interface: object shapes, extendable
interface User {
    id: number;
    name: string;
    email?: string;  // Optional
    readonly createdAt: Date;  // Immutable
}

interface Admin extends User {
    permissions: string[];
}

// Interface merging (can add to existing interface)
interface Window {
    analytics: Analytics;  // Extend global Window
}

// Type alias: anything
type Point = { x: number; y: number };
type Callback = (err: Error | null, result?: string) => void;
type StringArray = string[];
type Pair<T, U> = [T, U];

// When to use each:
// Interface: for object types, APIs, OOP patterns (extendable)
// Type: for unions, intersections, tuples, aliases
```

### Generics
```typescript
// Generic function
function identity<T>(arg: T): T {
    return arg;
}

// Generic with constraints
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length;
}

// Generic class
class Repository<T extends Entity> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    findById(id: string): T | undefined {
        return this.items.find(item => item.id === id);
    }
}

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Optional<T> = { [K in keyof T]?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Template literal types
type EventName = `on${Capitalize<string>}`;
type CssProperty = `margin-${'top'|'right'|'bottom'|'left'}`;
```

### Advanced Types
```typescript
// Discriminated unions (tagged unions)
type Shape =
    | { kind: 'circle'; radius: number }
    | { kind: 'rectangle'; width: number; height: number }
    | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
    switch (shape.kind) {
        case 'circle':      return Math.PI * shape.radius ** 2;
        case 'rectangle':   return shape.width * shape.height;
        case 'triangle':    return 0.5 * shape.base * shape.height;
        // TypeScript ensures exhaustiveness!
    }
}

// Extract and Exclude
type Actions = 'login' | 'logout' | 'register' | 'delete';
type AuthActions = Extract<Actions, 'login' | 'logout'>;   // 'login' | 'logout'
type NonAuth = Exclude<Actions, 'login' | 'logout'>;       // 'register' | 'delete'

// Record
type UserMap = Record<string, User>;
const users: UserMap = {};

// Pick and Omit
type UserPreview = Pick<User, 'id' | 'name'>;
type UserWithoutPassword = Omit<User, 'password'>;

// Parameters and ReturnType
function fetchUser(id: string, options?: Options): Promise<User> { ... }
type FetchParams = Parameters<typeof fetchUser>;  // [string, Options?]
type FetchReturn = ReturnType<typeof fetchUser>;  // Promise<User>

// Template literal type magic
type ApiRoutes = '/users' | '/posts' | '/comments';
type WithId = `${ApiRoutes}/${string}`;  // '/users/123' etc.
```

### Utility Types
```typescript
Partial<T>          // All properties optional
Required<T>         // All properties required
Readonly<T>         // All properties readonly
Record<K, V>        // Object with keys K and values V
Pick<T, K>          // Keep only keys K
Omit<T, K>          // Remove keys K
Exclude<T, U>       // Remove U from union T
Extract<T, U>       // Keep only U in union T
NonNullable<T>      // Remove null and undefined
ReturnType<T>       // Return type of function T
Parameters<T>       // Parameter types of function T
InstanceType<T>     // Instance type of constructor T
ConstructorParameters<T>  // Constructor parameters
Awaited<T>          // Unwrap Promise type
```

---

## Modern JavaScript Features

```javascript
// Destructuring
const { name, age = 25, role: userRole } = user;  // Rename, defaults
const [first, ...rest] = array;
const [, second] = array;  // Skip first

// Optional chaining
const city = user?.address?.city;   // null if any is null
const len = data?.items?.length ?? 0;  // Nullish coalescing

// Nullish coalescing (only null/undefined, not falsy)
const count = response.count ?? 0;  // 0 is falsy but not null

// Logical assignment
x ||= defaultValue;   // Assign if x is falsy
x &&= newValue;       // Assign if x is truthy
x ??= fallback;       // Assign if x is null/undefined

// Spread / Rest
const merged = { ...obj1, ...obj2 };  // Shallow merge
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

// Tagged template literals
function html(strings, ...values) {
    return strings.reduce((result, str, i) =>
        result + str + (values[i] != null ? escape(values[i]) : ''), ''
    );
}
const safe = html`<p>${userInput}</p>`;

// Symbol for unique keys
const id = Symbol('id');
obj[id] = 42;  // Won't conflict with string 'id'

// WeakMap/WeakSet (garbage collectible keys)
const cache = new WeakMap();
cache.set(obj, computedValue);  // Collected when obj is GC'd

// Proxy
const handler = {
    get(target, prop) {
        return prop in target ? target[prop] : `Property ${prop} not found`;
    },
    set(target, prop, value) {
        if (typeof value !== 'number') throw new TypeError('Must be number');
        target[prop] = value;
        return true;
    }
};
const proxied = new Proxy({}, handler);

// Reflect API
Reflect.get(target, prop, receiver);
Reflect.set(target, prop, value);
Reflect.has(target, prop);  // Like 'in' operator
```

---

## Node.js Specifics

```javascript
// Module systems
// CommonJS (Node.js original)
const fs = require('fs');
module.exports = { myFunction };

// ES Modules (modern, .mjs or "type":"module" in package.json)
import { readFile } from 'fs/promises';
export function myFunction() { ... }
export default class MyClass { ... }

// Stream processing (memory efficient for large files)
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

await pipeline(
    createReadStream('input.csv'),
    createGzip(),
    createWriteStream('output.csv.gz')
);

// Worker threads (true CPU parallelism)
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
    const worker = new Worker(__filename, { workerData: { n: 40 } });
    worker.on('message', result => console.log(result));
} else {
    const fib = n => n <= 1 ? n : fib(n-1) + fib(n-2);
    parentPort.postMessage(fib(workerData.n));
}

// HTTP server
import http from 'http';
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello World' }));
});
server.listen(3000);
```

---

*JavaScript is a language with a complicated past but an excellent present. TypeScript is what JavaScript should have been.*
