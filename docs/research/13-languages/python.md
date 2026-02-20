# Python — The Full Picture

> Python looks simple on the surface. But once you understand its execution model, memory management, and ecosystem, it becomes a precision tool.

---

## Python Execution Model

### CPython Internals
```
Source code (.py)
    ↓ tokenize
Tokens
    ↓ parse
AST (Abstract Syntax Tree)
    ↓ compile
Bytecode (.pyc, __pycache__)
    ↓ execute
CPython VM (stack-based interpreter)
```

```python
import ast, dis

code = "x = [i**2 for i in range(10)]"
tree = ast.parse(code)
print(ast.dump(tree, indent=2))

# See bytecode
exec(compile(code, '<string>', 'exec'))
dis.dis(compile(code, '<string>', 'exec'))
```

### The GIL (Global Interpreter Lock)
- CPython mutex: only one thread executes Python bytecode at a time
- Prevents memory corruption in the interpreter
- **Impact:** CPU-bound threads don't truly run in parallel
- **No impact on:** I/O-bound code (GIL released during I/O), C extensions

```python
# CPU-bound: use multiprocessing (not threading)
from multiprocessing import Pool
with Pool(4) as p:
    results = p.map(cpu_intensive_fn, data)

# I/O-bound: use threading or asyncio
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(fetch_url, url) for url in urls]
    results = [f.result() for f in futures]

# GIL removal: Python 3.13+ makes GIL optional
# NOGIL fork, free-threaded builds becoming reality
```

### Reference Counting & GC
```python
import sys
import gc

x = [1, 2, 3]
print(sys.getrefcount(x))  # 2 (x + getrefcount arg)

y = x
print(sys.getrefcount(x))  # 3

del y
print(sys.getrefcount(x))  # 2

# Cyclic references → garbage collector
a = []
a.append(a)  # Reference cycle
del a
gc.collect()  # Manually trigger GC

# __del__ called when refcount reaches 0 (or GC collects)
# Avoid relying on __del__ for resource cleanup (use context managers)
```

---

## Data Model (Dunder Methods)

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    # String representations
    def __repr__(self):  # For developers: eval(repr(obj)) should recreate obj
        return f"Vector({self.x}, {self.y})"
    def __str__(self):   # For users: print(obj)
        return f"({self.x}, {self.y})"

    # Arithmetic
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    def __mul__(self, scalar):  # v * 3
        return Vector(self.x * scalar, self.y * scalar)
    def __rmul__(self, scalar): # 3 * v (right multiply)
        return self.__mul__(scalar)
    def __neg__(self):
        return Vector(-self.x, -self.y)
    def __abs__(self):  # abs(v) = magnitude
        return (self.x**2 + self.y**2) ** 0.5

    # Comparison
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    def __lt__(self, other):
        return abs(self) < abs(other)

    # Container protocol
    def __len__(self):
        return 2
    def __getitem__(self, index):
        return (self.x, self.y)[index]
    def __iter__(self):
        yield self.x
        yield self.y

    # Context manager
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        return False  # Don't suppress exceptions

    # Callable
    def __call__(self, *args):
        return f"Vector called with {args}"

    # Boolean
    def __bool__(self):
        return bool(self.x or self.y)

    # Hash (needed if __eq__ defined)
    def __hash__(self):
        return hash((self.x, self.y))
```

---

## Iterators & Generators

```python
# Iterator protocol
class Range:
    def __init__(self, start, stop):
        self.current = start
        self.stop = stop

    def __iter__(self):
        return self       # Return iterator

    def __next__(self):
        if self.current >= self.stop:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

# Generator function (lazy evaluation)
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
[next(gen) for _ in range(10)]  # First 10 Fibonacci numbers

# Generator expression
squares = (x**2 for x in range(1000000))  # No memory allocation upfront

# yield from (delegating to sub-generator)
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

list(flatten([1, [2, 3, [4, 5]], 6]))  # [1, 2, 3, 4, 5, 6]

# send() to generators (coroutine-like)
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

acc = accumulator()
next(acc)       # Prime the generator
acc.send(10)    # 10
acc.send(20)    # 30
acc.send(5)     # 35
```

---

## Decorators

```python
import functools
import time

# Basic decorator
def timer(fn):
    @functools.wraps(fn)  # Preserve original function metadata
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{fn.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)

# Decorator with arguments
def retry(max_attempts=3, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
        return wrapper
    return decorator

@retry(max_attempts=3, exceptions=(ConnectionError,))
def fetch_data(url):
    ...

# Class decorator
def singleton(cls):
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

# Decorator class
class Cache:
    def __init__(self, fn):
        self.fn = fn
        self.cache = {}
        functools.update_wrapper(self, fn)

    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.fn(*args)
        return self.cache[args]

@Cache
def expensive(n):
    return n ** 2
```

---

## Context Managers

```python
# Class-based
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        return False  # True = suppress exceptions

with Timer() as t:
    do_work()
print(f"Elapsed: {t.elapsed:.4f}s")

# Generator-based (contextlib)
from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    print(f"Opening {name}")
    resource = acquire(name)
    try:
        yield resource
    finally:
        release(resource)
        print(f"Closed {name}")

with managed_resource("file.db") as f:
    f.write("data")

# suppress specific exceptions
from contextlib import suppress
with suppress(FileNotFoundError):
    os.remove("maybe-exists.txt")

# redirect_stdout
from contextlib import redirect_stdout
import io
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("This goes to buffer")
output = buffer.getvalue()
```

---

## Async/Await

```python
import asyncio
import aiohttp

# Basic async function
async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

# Concurrent fetches
async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# asyncio.gather vs asyncio.create_task vs asyncio.wait
# gather: run all, return when all complete (or first failure)
# create_task: schedule, returns immediately
# wait: more control over completion conditions

# Timeout
async def fetch_with_timeout(url, timeout=5.0):
    try:
        async with asyncio.timeout(timeout):  # Python 3.11+
            async with aiohttp.ClientSession() as session:
                return await fetch(session, url)
    except asyncio.TimeoutError:
        return None

# Event loop
asyncio.run(fetch_all(urls))   # Python 3.7+ entry point

# Async generators
async def paginated_fetch(url):
    page = 1
    while True:
        data = await fetch(url, params={"page": page})
        if not data:
            break
        for item in data:
            yield item
        page += 1

async def main():
    async for item in paginated_fetch("https://api.example.com/items"):
        process(item)

# Async context managers
class AsyncDB:
    async def __aenter__(self):
        self.conn = await create_connection()
        return self.conn

    async def __aexit__(self, *args):
        await self.conn.close()

async with AsyncDB() as db:
    await db.execute("SELECT ...")
```

---

## Type Hints & Annotations

```python
from typing import (
    Any, Optional, Union, List, Dict, Tuple, Set,
    Callable, TypeVar, Generic, Protocol,
    TypedDict, Literal, Final, ClassVar
)
from collections.abc import Sequence, Mapping, Iterator, AsyncIterator
# Python 3.9+: use built-in list[], dict[], tuple[]

# Basic
def greet(name: str) -> str:
    return f"Hello, {name}!"

# Optional
def find_user(user_id: int) -> Optional[User]:  # User | None in 3.10+
    ...

# Union
def parse(data: str | bytes) -> dict:  # Python 3.10+
    ...

# Generics
T = TypeVar('T')

def first(items: list[T]) -> T:
    return items[0]

# TypeVar with bounds
Comparable = TypeVar('Comparable', bound='Comparable')  # Has __lt__

# Generic class
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Protocol (structural typing — duck typing with types)
class Drawable(Protocol):
    def draw(self) -> None: ...

def render(shape: Drawable) -> None:
    shape.draw()

# TypedDict
class UserInfo(TypedDict):
    name: str
    age: int
    email: str | None

# dataclass
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    label: str = ""
    metadata: dict = field(default_factory=dict)

    def distance_to(self, other: 'Point') -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5

# Callable
Handler = Callable[[Request, Response], Awaitable[None]]

# Literal
Direction = Literal['north', 'south', 'east', 'west']

# mypy / pyright for static checking
# mypy --strict src/
```

---

## Performance Optimization

### Profiling
```python
# cProfile
import cProfile, pstats

with cProfile.Profile() as pr:
    slow_function()

stats = pstats.Stats(pr)
stats.sort_stats('cumulative')
stats.print_stats(20)

# line_profiler
@profile  # Requires: kernprof -l -v script.py
def hot_function(data):
    ...

# memory_profiler
from memory_profiler import profile
@profile
def memory_heavy():
    ...
```

### Optimization Techniques
```python
# Use built-ins (implemented in C)
sum(x**2 for x in range(1000))  # Fast
total = 0
for x in range(1000):           # Slower
    total += x**2

# List comprehensions vs map/filter
[x**2 for x in range(1000)]        # Fast
list(map(lambda x: x**2, range(1000)))  # Slightly slower (function call overhead)

# Local variable access is faster than global
def process(data):
    append = [].append  # Cache method lookup
    for item in data:
        append(item)    # Faster than result.append(item)

# __slots__ for memory optimization
class Point:
    __slots__ = ('x', 'y')  # No __dict__, 3-5x less memory
    def __init__(self, x, y):
        self.x, self.y = x, y

# NumPy for numerical computation
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
arr * 2            # Vectorized, C speed
np.sqrt(arr)       # Vectorized

# Avoid repeated attribute lookups
import math
sqrt = math.sqrt   # Cache once
results = [sqrt(x) for x in data]  # Faster

# String concatenation
"".join(parts)     # O(n), fast
result = ""
for p in parts:
    result += p    # O(n²), slow (creates new string each time)
```

### Concurrency Patterns
```python
# Thread pool for I/O
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(fetch_url, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            result = future.result()
        except Exception as e:
            print(f"Error fetching {url}: {e}")

# Process pool for CPU
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_bound_fn, large_dataset))

# asyncio for high-concurrency I/O
# Handles thousands of concurrent connections with one thread
async def handle_requests(urls):
    connector = aiohttp.TCPConnector(limit=100)  # Max concurrent connections
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [asyncio.create_task(fetch(session, url)) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)
```

---

## Standard Library Hidden Gems

```python
from collections import defaultdict, Counter, OrderedDict, deque, namedtuple, ChainMap
from itertools import chain, product, permutations, combinations, groupby, islice, takewhile
from functools import lru_cache, cache, partial, reduce, wraps
from pathlib import Path
from contextlib import contextmanager, suppress, redirect_stdout
from dataclasses import dataclass, field, asdict, astuple
from typing import NamedTuple
import heapq
import bisect

# Counter
c = Counter("mississippi")  # {'s': 4, 'i': 4, 'p': 2, 'm': 1}
c.most_common(2)             # [('s', 4), ('i', 4)]
c + Counter("banana")        # Merge

# defaultdict
adjacency = defaultdict(list)
adjacency['a'].append('b')   # No KeyError

# deque (O(1) append/pop from both ends)
d = deque([1, 2, 3], maxlen=5)  # Circular buffer with maxlen
d.appendleft(0)
d.rotate(1)

# heapq (min-heap)
heap = [3, 1, 4, 1, 5, 9]
heapq.heapify(heap)
heapq.heappush(heap, 2)
smallest = heapq.heappop(heap)
top_3 = heapq.nsmallest(3, heap)
heapq.heappushpop(heap, item)  # More efficient than push+pop

# bisect (binary search on sorted list)
import bisect
data = [1, 3, 5, 7, 9]
bisect.insort(data, 6)              # Insert maintaining sort
pos = bisect.bisect_left(data, 5)  # Find insertion point

# itertools
list(chain([1, 2], [3, 4], [5]))    # Flatten
list(product('AB', '12'))           # [('A','1'),('A','2'),('B','1'),('B','2')]
list(permutations([1,2,3], 2))      # [(1,2),(1,3),(2,1),...]
list(combinations([1,2,3], 2))      # [(1,2),(1,3),(2,3)]
list(islice(fibonacci(), 10))       # First 10 from infinite generator

for key, group in groupby(sorted_data, key=lambda x: x['category']):
    items = list(group)

# functools.lru_cache
@lru_cache(maxsize=None)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

@cache  # Python 3.9+ equivalent to lru_cache(maxsize=None)
def expensive(n):
    return n ** 2

# partial
from functools import partial
double = partial(lambda x, n: x * n, n=2)
double(5)  # 10

# pathlib
p = Path(".")
list(p.glob("**/*.py"))    # Recursive glob
(p / "subdir" / "file.py").read_text()
Path("output.txt").write_text("hello")
path.parent, path.stem, path.suffix  # Path components
```

---

## Python Packaging

```toml
# pyproject.toml (modern standard)
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "1.0.0"
description = "A useful library"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff"]
docs = ["mkdocs", "mkdocs-material"]

[project.scripts]
my-tool = "mypackage.cli:main"

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "B", "UP"]

[tool.mypy]
strict = true
```

```bash
# Virtual environments
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# uv — fast package manager
uv venv
uv add requests
uv run python script.py
uv sync  # Install from pyproject.toml

# Build and publish
python -m build
twine upload dist/*
```

---

*Python is a language that rewards depth. The more you know about its internals, the better your code becomes.*
