# Concurrency & Synchronization — Complete Reference

> Concurrency is about dealing with multiple things at once. Parallelism is about doing multiple things at once. Both are hard, and understanding the difference is critical.

---

## Concepts

### Concurrency vs Parallelism
```
Concurrency: Structure of dealing with multiple things at once
  → Single core switching between tasks (interleaving)
  → OR multiple cores actually running simultaneously
  → Focus: correct coordination

Parallelism: Physically running multiple things simultaneously
  → Requires multiple CPU cores
  → Focus: performance speedup

Examples:
  I/O bound server handling 1000 connections: concurrency (one thread, async)
  Matrix multiplication on 8 cores: parallelism
  Web scraper: both (many I/O ops scheduled concurrently on multiple threads)
```

### Race Condition
```
Two or more threads access shared data and the outcome depends on timing.

Bank account:
Thread 1: read balance (100)
Thread 2: read balance (100)
Thread 1: subtract 50, write 50
Thread 2: add 100, write 200  ← WRONG, should be 150

Non-atomic compound operations:
  Check-then-act: if (balance > amount) { withdraw() } ← race
  Read-modify-write: counter++ → read, increment, write ← race
```

### Deadlock
```
Thread A holds Lock X, waiting for Lock Y
Thread B holds Lock Y, waiting for Lock X
→ Neither can proceed → deadlock

Conditions (all must hold):
1. Mutual exclusion: resource can only be held by one thread
2. Hold and wait: holding resource while waiting for another
3. No preemption: resources can't be forcibly taken
4. Circular wait: circular chain of threads waiting

Prevention strategies:
- Order locks (always acquire in same order)
- Use tryLock with timeout
- Resource allocation graph algorithm
```

### Livelock
```
Threads keep changing state in response to each other without making progress.
Like two people in a hallway both moving in the same direction trying to pass.
Solution: introduce randomness
```

### Starvation
```
A thread never gets access to a resource because other threads always have priority.
Solution: fair scheduling, aging (gradually increase priority of waiting threads)
```

---

## Thread Primitives

### Mutex (Mutual Exclusion Lock)
```python
import threading

lock = threading.Lock()
shared_counter = 0

def increment():
    global shared_counter
    with lock:              # Acquire + release automatically
        shared_counter += 1

# threads = [threading.Thread(target=increment) for _ in range(1000)]
# for t in threads: t.start()
# for t in threads: t.join()
# shared_counter == 1000  (guaranteed)

# Timeout variant
if lock.acquire(timeout=5.0):
    try:
        # critical section
    finally:
        lock.release()
else:
    # Couldn't acquire within timeout
```

### RWLock (Reader-Writer Lock)
```python
import threading

class RWLock:
    """Multiple readers or one writer."""
    def __init__(self):
        self._readers = 0
        self._read_lock = threading.Lock()
        self._write_lock = threading.Lock()

    def acquire_read(self):
        with self._read_lock:
            self._readers += 1
            if self._readers == 1:
                self._write_lock.acquire()  # First reader blocks writers

    def release_read(self):
        with self._read_lock:
            self._readers -= 1
            if self._readers == 0:
                self._write_lock.release()  # Last reader releases writers

    def acquire_write(self):
        self._write_lock.acquire()  # Exclusive write access

    def release_write(self):
        self._write_lock.release()
```

### Semaphore
```python
import threading

# Counting semaphore: limit concurrent access to N
sem = threading.Semaphore(5)  # Max 5 concurrent

def use_limited_resource():
    with sem:  # Decrements, blocks if 0
        do_work()  # At most 5 here at once

# Binary semaphore (value 0 or 1) = mutex

# Signaling between threads
ready = threading.Semaphore(0)  # Start at 0

def producer():
    produce_data()
    ready.release()  # Signal consumer

def consumer():
    ready.acquire()  # Wait until signaled
    consume_data()
```

### Condition Variable
```python
import threading
from collections import deque

# Producer-consumer with condition variable
queue = deque()
not_empty = threading.Condition()
not_full = threading.Condition()
MAX_SIZE = 10

def producer():
    while True:
        item = produce()
        with not_full:
            while len(queue) >= MAX_SIZE:
                not_full.wait()    # Release lock + wait for signal
            queue.append(item)
            not_empty.notify_all() # Wake consumers

def consumer():
    while True:
        with not_empty:
            while len(queue) == 0:
                not_empty.wait()   # Release lock + wait
            item = queue.popleft()
            not_full.notify_all()  # Wake producers
        process(item)
```

### Barrier
```python
import threading

# All threads meet at barrier before proceeding
barrier = threading.Barrier(5)  # 5 threads

def worker(tid):
    # Phase 1
    do_phase1(tid)
    barrier.wait()  # All wait here until all 5 reach this point
    # Phase 2 (all start simultaneously)
    do_phase2(tid)
```

---

## Python Threading

```python
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Basic threading
def task(name, delay):
    print(f"Thread {name} starting")
    time.sleep(delay)
    return f"Result from {name}"

# Create and start thread
t = threading.Thread(target=task, args=("A", 2), daemon=True)
t.start()
t.join(timeout=5)  # Wait up to 5 seconds

# Thread pool (preferred for most cases)
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(task, f"T{i}", 1): i for i in range(10)}

    for future in as_completed(futures):
        idx = futures[future]
        try:
            result = future.result()
        except Exception as e:
            print(f"Thread {idx} raised {e}")

# Thread-local storage (each thread has its own copy)
local = threading.local()

def set_user(user_id):
    local.user_id = user_id

def get_user():
    return getattr(local, 'user_id', None)

# Event for signaling
shutdown = threading.Event()

def worker():
    while not shutdown.is_set():
        do_work()
        shutdown.wait(timeout=1.0)  # Sleep 1s or until shutdown

# Signal shutdown
shutdown.set()
```

---

## Python Multiprocessing

```python
from multiprocessing import Process, Pool, Queue, Pipe, Manager, Value, Array
import multiprocessing as mp

# Basic process
def worker(n):
    return n * n

if __name__ == '__main__':
    # Pool (process pool)
    with Pool(processes=4) as pool:
        results = pool.map(worker, range(100))     # Blocking, ordered
        results = pool.imap(worker, range(100))    # Lazy iterator
        async_r = pool.map_async(worker, range(100))  # Non-blocking

    # Process communication via Queue
    q = Queue()

    def producer(queue):
        for i in range(10):
            queue.put(i)
        queue.put(None)  # Sentinel

    def consumer(queue):
        while True:
            item = queue.get()
            if item is None:
                break
            process(item)

    # Shared memory
    shared_value = Value('i', 0)   # Integer
    shared_array = Array('d', 100)  # 100 doubles

    with shared_value.get_lock():
        shared_value.value += 1

    # Manager (arbitrary shared objects, slower but flexible)
    with Manager() as manager:
        shared_dict = manager.dict()
        shared_list = manager.list()

    # Pipe (two-way communication)
    parent_conn, child_conn = Pipe()

    def child(conn):
        msg = conn.recv()
        conn.send(f"Echo: {msg}")

    p = Process(target=child, args=(child_conn,))
    p.start()
    parent_conn.send("Hello")
    response = parent_conn.recv()
    p.join()
```

---

## Asyncio (Python)

### Event Loop Architecture
```python
import asyncio
import aiohttp
import aiofiles
from asyncio import Queue, Semaphore, Lock, Event

# Coroutines and tasks
async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    # Create multiple tasks (run concurrently)
    async with aiohttp.ClientSession() as session:
        tasks = [
            asyncio.create_task(fetch(session, f"http://example.com/{i}"))
            for i in range(100)
        ]
        # Wait for all tasks
        results = await asyncio.gather(*tasks, return_exceptions=True)

# asyncio.Queue (producer-consumer)
async def producer(queue):
    for i in range(10):
        await queue.put(i)
        await asyncio.sleep(0.1)  # Yield to event loop

async def consumer(queue, name):
    while True:
        item = await queue.get()
        await process(item)
        queue.task_done()

async def main():
    queue = Queue(maxsize=5)
    producers = [asyncio.create_task(producer(queue)) for _ in range(2)]
    consumers = [asyncio.create_task(consumer(queue, f"C{i}")) for i in range(3)]
    await queue.join()  # Wait until all items processed
    for t in consumers: t.cancel()

# Semaphore (limit concurrent operations)
semaphore = Semaphore(10)  # Max 10 concurrent

async def limited_task(url):
    async with semaphore:
        return await fetch_url(url)

# Lock
lock = Lock()

async def critical_section():
    async with lock:
        # Only one coroutine here at a time
        await update_shared_state()

# Event (signaling)
ready = Event()

async def setup():
    await do_setup()
    ready.set()

async def worker():
    await ready.wait()  # Blocks until event is set
    do_work()
```

### Async Generators & Comprehensions
```python
async def fetch_pages(session, urls):
    for url in urls:
        async with session.get(url) as resp:
            yield await resp.json()  # async generator

async def main():
    async with aiohttp.ClientSession() as session:
        async for page in fetch_pages(session, urls):
            process(page)

    # Async comprehension
    results = [result async for result in fetch_pages(session, urls)]
    results = {url: page async for url, page in pairs}
```

---

## Java Concurrency

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

// Executor Service (thread pool)
ExecutorService executor = Executors.newFixedThreadPool(10);
Future<String> future = executor.submit(() -> "result");
String result = future.get(5, TimeUnit.SECONDS);

// CompletableFuture (async)
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> transform(data))
    .thenAccept(result -> save(result))
    .exceptionally(ex -> { log(ex); return null; });

// Combine futures
CompletableFuture<String> f1 = fetchUser();
CompletableFuture<String> f2 = fetchProfile();
CompletableFuture.allOf(f1, f2)
    .thenRun(() -> combine(f1.join(), f2.join()));

// Atomic operations (lock-free)
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();
counter.compareAndSet(expected, update);  // CAS

AtomicReference<Node> head = new AtomicReference<>();
head.compareAndSet(null, newNode);

// ReentrantLock (more flexible than synchronized)
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();  // Always in finally
}

// ReadWriteLock
ReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();
try { read(); } finally { rwLock.readLock().unlock(); }

rwLock.writeLock().lock();
try { write(); } finally { rwLock.writeLock().unlock(); }

// Concurrent collections
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);
queue.put(task);        // Blocks if full
queue.take();           // Blocks if empty
queue.offer(task, 5, TimeUnit.SECONDS);  // Timeout
```

---

## Go Concurrency (Goroutines & Channels)

```go
package main

import (
    "sync"
    "sync/atomic"
)

// Goroutine: lightweight thread (2KB stack, grows as needed)
go func() {
    doWork()
}()

// Channel: goroutine communication + synchronization
ch := make(chan int, 10)  // Buffered channel

go func() {
    ch <- 42  // Send
}()
value := <-ch  // Receive

// Close channel (signal no more values)
close(ch)
for v := range ch { process(v) }  // Receive until closed

// Select: multiplex channels
select {
case msg := <-ch1:
    handle(msg)
case msg := <-ch2:
    handle(msg)
case <-time.After(5 * time.Second):
    timeout()
default:
    // Non-blocking
}

// WaitGroup
var wg sync.WaitGroup
for i := 0; i < 10; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        doWork(id)
    }(i)
}
wg.Wait()

// Mutex
var mu sync.Mutex
mu.Lock()
defer mu.Unlock()
// critical section

// Once (do something exactly once)
var once sync.Once
once.Do(func() { initialize() })

// Atomic operations
var counter int64
atomic.AddInt64(&counter, 1)
atomic.LoadInt64(&counter)
atomic.CompareAndSwapInt64(&counter, old, new)

// Pipeline pattern
func generator(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            out <- n
        }
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            out <- n * n
        }
    }()
    return out
}

// c := square(square(generator(1, 2, 3, 4)))
// for n := range c { fmt.Println(n) }
```

---

## Memory Consistency Models

### Sequential Consistency
Operations appear to execute in some sequential order consistent with program order. All processors see the same order.

### Weak Memory Models (Actual Hardware)
```
Modern CPUs reorder instructions for performance:
- Stores may be visible to other CPUs out of order
- Reads may see stale values

x86-64 is relatively strong: TSO (Total Store Order)
  - Reads not reordered
  - Stores not reordered with other stores
  - Loads can bypass pending stores

ARM is weaker:
  - Both reads and writes can be reordered

Memory barriers prevent reordering:
  mfence (x86): full barrier
  dmb (ARM): data memory barrier
  __sync_synchronize() (GCC)
  std::atomic_thread_fence() (C++11)
```

### Java Memory Model
```java
// volatile: ensure visibility across threads (not atomicity)
private volatile boolean running = true;

// synchronized: visibility + mutual exclusion
synchronized void update(int x) { this.value = x; }

// happens-before: if A happens-before B, A's writes visible to B
// Rules:
// - Within a thread: program order
// - Lock release → lock acquire (same lock)
// - Thread start → thread actions
// - volatile write → volatile read (same variable)
// - Thread join → return from join
```

---

## Lock-Free Data Structures

### Lock-Free Stack (CAS-based)
```python
import threading
from dataclasses import dataclass
from typing import Optional, Generic, TypeVar

T = TypeVar('T')

@dataclass
class Node(Generic[T]):
    value: T
    next: Optional['Node[T]'] = None

class LockFreeStack(Generic[T]):
    """Thread-safe stack using compare-and-swap."""
    def __init__(self):
        self._head = None
        self._lock = threading.Lock()  # Python doesn't have true CAS, use lock

    def push(self, value: T) -> None:
        # In C++/Java with true atomics:
        # new_node = Node(value)
        # do: new_node.next = head; while not CAS(&head, new_node.next, new_node)
        with self._lock:
            node = Node(value, self._head)
            self._head = node

    def pop(self) -> Optional[T]:
        with self._lock:
            if self._head is None:
                return None
            value = self._head.value
            self._head = self._head.next
            return value
```

### ABA Problem
```
Thread 1: reads head = A
Thread 2: pops A, pushes B, pushes A  (same pointer, different state)
Thread 1: CAS(head, A, new) succeeds — WRONG, B is lost

Solution:
- Add version counter to pointer
- Compare (pointer, version) not just pointer
- AtomicStampedReference in Java
```

---

*Concurrency is hard. The goal is not to make it easy — it's to make it correct. Master the primitives and patterns, and the rest follows.*
