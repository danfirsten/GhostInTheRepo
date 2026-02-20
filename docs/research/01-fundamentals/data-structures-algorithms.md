# Data Structures & Algorithms — Complete Reference

> The foundation. You cannot be a great engineer without owning this material cold.

---

## Complexity Analysis

### Big-O Notation
Describes worst-case asymptotic growth of time/space as input `n` approaches infinity.

| Complexity | Name | Example |
|---|---|---|
| O(1) | Constant | Hash table lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Array scan |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Recursive Fibonacci |
| O(n!) | Factorial | Traveling salesman brute force |

**Big-Omega (Ω)** = best case. **Big-Theta (Θ)** = tight bound (average = worst).

### Master Theorem
For recurrences of the form `T(n) = aT(n/b) + f(n)`:
- If `f(n) = O(n^(log_b(a) - ε))` → `T(n) = Θ(n^log_b(a))`
- If `f(n) = Θ(n^log_b(a))` → `T(n) = Θ(n^log_b(a) · log n)`
- If `f(n) = Ω(n^(log_b(a) + ε))` → `T(n) = Θ(f(n))`

---

## Arrays

### Static Array
- Contiguous block of memory
- Random access: O(1) by index
- Insert/delete at end: O(1) amortized
- Insert/delete at middle: O(n) — must shift elements

### Dynamic Array (ArrayList, Python list, C++ vector)
- Doubles capacity when full (amortized O(1) append)
- Underlying: `realloc` + memcopy to new buffer
- Cache-friendly due to contiguity

**Key operations:**
```
access: O(1)
search: O(n) unsorted, O(log n) sorted
insert at end: O(1) amortized
insert at i: O(n)
delete: O(n)
```

---

## Linked Lists

### Singly Linked List
Each node: `{ value, next pointer }`
- Insert at head: O(1)
- Search: O(n)
- No random access
- Cache-unfriendly (pointer chasing)

### Doubly Linked List
Each node: `{ value, prev, next }`
- O(1) insert/delete when you have a pointer to the node
- Used in: LRU cache, browser history, deques

### Common Patterns
- Floyd's cycle detection (fast/slow pointers)
- Reversing in-place (3-pointer approach)
- Merge two sorted lists
- Find middle node (fast/slow pointers)

---

## Stacks & Queues

### Stack (LIFO)
- `push`, `pop`, `peek` — all O(1)
- Implemented via array or linked list
- Uses: function call stack, undo operations, expression evaluation, DFS

### Queue (FIFO)
- `enqueue`, `dequeue` — O(1) with circular array or linked list
- Uses: BFS, task scheduling, message passing

### Deque (Double-Ended Queue)
- O(1) insert/remove at both ends
- `collections.deque` in Python, `ArrayDeque` in Java

### Monotonic Stack
A stack that maintains elements in sorted order (increasing or decreasing).
- Find next greater element: O(n)
- Largest rectangle in histogram
- Trapping rainwater

---

## Hash Tables

### How They Work
1. Key → hash function → index
2. Each slot: array position
3. Collision resolution:
   - **Chaining**: each slot is a linked list
   - **Open addressing**: probe for next free slot (linear, quadratic, double hashing)

### Complexity
```
insert: O(1) average, O(n) worst
lookup: O(1) average
delete: O(1) average
```

### Load Factor
`α = n/m` (items/buckets). When α > 0.75, rehash (double and redistribute).

### Hash Functions
Good properties: deterministic, uniform distribution, fast.
- **djb2**: `hash = hash * 33 ^ c`
- **MurmurHash3**: fast, good distribution for non-crypto
- **SHA-256**: cryptographic, not for general hash tables

### Real-World Details
- Python `dict`: open addressing, compact layout since 3.6+
- Java `HashMap`: chaining, converts to red-black tree at 8 items per bucket
- Tombstone deletion for open addressing

---

## Trees

### Binary Tree
Each node: `{ value, left, right }`

**Traversals:**
- Inorder (L, Root, R) — gives sorted order for BST
- Preorder (Root, L, R) — serialize/copy tree
- Postorder (L, R, Root) — delete tree, expression trees
- Level-order (BFS) — shortest path in unweighted tree

### Binary Search Tree (BST)
Invariant: left < node < right
```
search: O(h)   — h = height
insert: O(h)
delete: O(h)
```
Worst case: O(n) for degenerate (sorted input). Solution: balanced BSTs.

### AVL Tree
Self-balancing BST. Balance factor = |height(left) - height(right)| ≤ 1.
- Rebalance via rotations: LL, RR, LR, RL
- Guaranteed O(log n) ops

### Red-Black Tree
5 properties:
1. Every node is red or black
2. Root is black
3. Leaves (NIL) are black
4. Red nodes have black children
5. All paths from node to leaves have same number of black nodes

- Used in: Linux CFS scheduler, Java `TreeMap`, `std::map` (C++)
- Looser balance than AVL → faster insertions

### B-Tree / B+ Tree
- Generalization of BST with multiple keys per node
- Designed for disk access (large nodes = disk pages)
- B+ Tree: all data in leaves, leaves linked (fast range scans)
- Used in: PostgreSQL, MySQL InnoDB, file systems

### Trie (Prefix Tree)
Each node represents a character. Path from root = prefix.
- Insert/search: O(m) where m = key length
- Space: O(ALPHABET_SIZE × m × n)
- Use: autocomplete, spell checking, IP routing (Patricia trie)

### Segment Tree
- Built on array. Root = range [0, n-1]
- Range queries (sum, min, max): O(log n)
- Point updates: O(log n)
- Lazy propagation: range updates O(log n)

### Fenwick Tree (Binary Indexed Tree)
- Simpler than segment tree for prefix sums
- O(log n) query and update
- Less memory, faster in practice

### Heap
Complete binary tree satisfying heap property:
- **Max-heap**: parent ≥ children
- **Min-heap**: parent ≤ children
- Stored as array: parent of i = `(i-1)/2`, children = `2i+1`, `2i+2`

```
insert: O(log n) — bubble up
extract-min/max: O(log n) — bubble down
peek: O(1)
heapify: O(n) — build from array
```

Uses: priority queue, heap sort, Dijkstra's algorithm

---

## Graphs

### Representations
- **Adjacency Matrix**: O(V²) space, O(1) edge check, O(V) neighbor iteration
- **Adjacency List**: O(V+E) space, O(degree) neighbor iteration (preferred for sparse graphs)
- **Edge List**: just list of edges, useful for certain algorithms

### Graph Properties
- **Directed (digraph)** vs **Undirected**
- **Weighted** vs **Unweighted**
- **DAG**: Directed Acyclic Graph (topological ordering exists)
- **Connected**: path exists between all vertices
- **Bipartite**: 2-colorable, no odd cycles

### Traversals

#### BFS (Breadth-First Search)
```python
from collections import deque
def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```
- Time: O(V+E), Space: O(V)
- Finds shortest path in unweighted graph
- Level-by-level exploration

#### DFS (Depth-First Search)
```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited
```
- Time: O(V+E), Space: O(V)
- Cycle detection, topological sort, connected components

### Shortest Path Algorithms

#### Dijkstra's Algorithm
- Single-source shortest path, non-negative weights
- Uses min-heap (priority queue)
- Time: O((V+E) log V)

```python
import heapq
def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]: continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    return dist
```

#### Bellman-Ford
- Handles negative weights
- Detects negative cycles
- Time: O(VE)
- Relax all edges V-1 times

#### Floyd-Warshall
- All-pairs shortest path
- Time: O(V³), Space: O(V²)
- Dynamic programming: `dp[i][j][k] = min(dp[i][j][k-1], dp[i][k][k-1] + dp[k][j][k-1])`

#### A* Search
- Informed search using heuristic h(n)
- `f(n) = g(n) + h(n)` where g = cost so far, h = estimated cost to goal
- Optimal if h is admissible (never overestimates)

### Minimum Spanning Tree

#### Kruskal's Algorithm
- Sort edges by weight, greedily add if no cycle (Union-Find)
- Time: O(E log E)

#### Prim's Algorithm
- Start from vertex, greedily pick minimum edge crossing cut
- Time: O(E log V) with binary heap

### Topological Sort
- Only for DAGs
- DFS-based: add to result on finish
- Kahn's algorithm: BFS using in-degree counts

### Strongly Connected Components (SCC)
- **Kosaraju**: 2-pass DFS (original + transposed graph)
- **Tarjan**: single DFS with low-link values

---

## Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes |
| Radix Sort | O(nk) | O(nk) | O(nk) | O(n+k) | Yes |
| Tim Sort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

### Quick Sort Deep Dive
- Pick pivot, partition: elements < pivot left, > pivot right
- Average O(n log n), worst O(n²) on sorted input
- Optimization: random pivot, median-of-three, introsort (Python's sort hybrid)
- In-place, cache-friendly → faster than merge sort in practice

### Merge Sort Deep Dive
- Divide and conquer, always O(n log n)
- External sort champion (works well with disk)
- Stable sort (preserves relative order)
- Java's `Arrays.sort` for objects uses modified merge sort

---

## Dynamic Programming

### Core Idea
Break problem into overlapping subproblems. Store results (memoization or tabulation).

**Memoization (top-down)**: Recursive + cache
**Tabulation (bottom-up)**: Iterative, fill table

### Classic Problems

#### Fibonacci
```python
# Tabulation
def fib(n):
    dp = [0, 1]
    for i in range(2, n+1):
        dp.append(dp[-1] + dp[-2])
    return dp[n]
# Space-optimized: O(1)
```

#### Longest Common Subsequence (LCS)
```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

#### 0/1 Knapsack
```python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0]*(capacity+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(capacity+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])
    return dp[n][capacity]
```

#### Coin Change (unbounded knapsack variant)
```python
def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for c in coins:
        for i in range(c, amount + 1):
            dp[i] = min(dp[i], dp[i-c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1
```

#### Edit Distance (Levenshtein)
```python
def editDistance(w1, w2):
    m, n = len(w1), len(w2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if w1[i-1] == w2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]
```

---

## Advanced Data Structures

### Union-Find (Disjoint Set Union)
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):  # Path compression
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):  # Union by rank
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True
```
- Nearly O(1) amortized (inverse Ackermann function α(n))

### Skip List
- Probabilistic data structure
- Multiple layers of linked lists
- O(log n) average search, insert, delete
- Alternative to balanced BSTs

### Bloom Filter
- Probabilistic set membership
- Multiple hash functions → bit array
- False positives possible, never false negatives
- Space-efficient (no stored keys)
- Used in: databases (check if key exists before disk read), CDNs

### LRU Cache
Combine HashMap + Doubly Linked List:
- HashMap: key → node pointer (O(1) access)
- DLL: maintain order (O(1) move to front)
- Evict from tail

```python
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache: return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
```

---

## Algorithm Patterns

### Two Pointers
- Left/right converging (two-sum in sorted array)
- Fast/slow (cycle detection, find middle)
- Sliding window (substring problems)

### Binary Search (generalized)
```python
def binary_search(lo, hi, predicate):
    # Find leftmost position where predicate is True
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
```
Use when: answer space is monotone, search on sorted array, bisect on answer.

### Backtracking
- Explore all possibilities, prune dead ends
- Template: choose → explore → unchoose
- Problems: N-Queens, Sudoku, permutations, combinations, word search

### Divide and Conquer
- Split problem, solve halves, merge
- Merge sort, quick sort, closest pair of points, Strassen matrix mult

### Greedy
- Make locally optimal choice at each step
- Proof: exchange argument or matroid theory
- Activity selection, Huffman coding, fractional knapsack, Dijkstra's

### Bit Manipulation
```
x & (x-1)    # Clear lowest set bit
x & (-x)     # Isolate lowest set bit
x ^ x = 0   # XOR self = 0
x ^ 0 = x   # XOR with 0 = x
n & 1        # Check if odd
n >> 1       # Divide by 2
n << 1       # Multiply by 2
~n + 1 = -n  # Two's complement negation
```
Single number (XOR all), count set bits (Brian Kernighan), power of 2 check.

---

## Interview Problem Categories

1. **Arrays/Strings**: Two-sum, sliding window, matrix rotation
2. **Linked Lists**: Reverse, detect cycle, merge sorted
3. **Trees**: All traversals, LCA, diameter, validate BST
4. **Graphs**: Islands, word ladder, clone graph, course schedule
5. **DP**: Climb stairs, unique paths, longest increasing subsequence
6. **Backtracking**: Combinations, permutations, word search
7. **Heap/PQ**: Top K elements, merge K sorted lists, median stream
8. **Binary Search**: Search rotated array, find peak, capacity problems
9. **Stack/Queue**: Valid parentheses, evaluate expression, decode string
10. **Bit manipulation**: Single number, count bits, subsets

---

*Master these, and no algorithm problem can surprise you.*
