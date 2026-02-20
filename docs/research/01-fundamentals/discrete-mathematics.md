# Discrete Mathematics — Complete Reference

> Discrete mathematics is the foundation of computer science: logic, proofs, combinatorics, graph theory, and number theory. The tools you use every day but rarely name.

---

## Logic and Proofs

### Propositional Logic
```
Propositions: statements that are true or false
  p: "It is raining"    q: "I have an umbrella"

Connectives:
  ¬p        NOT p             (negation)
  p ∧ q     p AND q           (conjunction)
  p ∨ q     p OR q            (disjunction)
  p → q     IF p THEN q       (implication)
  p ↔ q     p IF AND ONLY IF q (biconditional)
  p ⊕ q     p XOR q           (exclusive or)

Truth table for implication (p → q):
  p=T, q=T → T   (rain, umbrella: ok)
  p=T, q=F → F   (rain, no umbrella: problem!)
  p=F, q=T → T   (no rain, umbrella: fine)
  p=F, q=F → T   (no rain, no umbrella: fine)
  "False implies anything is vacuously true"

Laws:
  Double negation: ¬(¬p) = p
  De Morgan:       ¬(p ∧ q) = ¬p ∨ ¬q
                   ¬(p ∨ q) = ¬p ∧ ¬q
  Contrapositive:  (p → q) ≡ (¬q → ¬p)
  Contrapositive is logically equivalent to original implication!
```

### Proof Techniques
```
Direct proof:
  To prove P → Q:
  Assume P, derive Q through logical steps.

  Example: Prove "if n is even, then n² is even"
  Assume n = 2k (definition of even)
  n² = (2k)² = 4k² = 2(2k²) → even ✓

Proof by contradiction:
  To prove P, assume ¬P and derive a contradiction.

  Example: Prove √2 is irrational
  Assume √2 = p/q in lowest terms (p/q is rational)
  Then 2 = p²/q² → p² = 2q² → p is even → p = 2k
  → (2k)² = 2q² → 4k² = 2q² → q² = 2k² → q is even
  But p,q in lowest terms can't both be even. Contradiction! ✓

Mathematical induction:
  To prove P(n) for all n ≥ base:
  1. Base case: prove P(base)
  2. Inductive step: assume P(k), prove P(k+1)

  Example: Prove 1+2+...+n = n(n+1)/2
  Base: n=1: 1 = 1(2)/2 = 1 ✓
  Assume true for k: 1+2+...+k = k(k+1)/2
  Prove for k+1:
    1+2+...+k+(k+1) = k(k+1)/2 + (k+1)
                    = (k+1)(k/2 + 1)
                    = (k+1)(k+2)/2  ✓

Proof by contrapositive:
  Instead of proving P → Q, prove ¬Q → ¬P

  Example: Prove "if n² is even, then n is even"
  Contrapositive: "if n is odd, then n² is odd"
  Assume n = 2k+1 → n² = 4k²+4k+1 = 2(2k²+2k)+1 → odd ✓
```

---

## Set Theory

### Fundamentals
```
Set: unordered collection of distinct elements
  A = {1, 2, 3, 4, 5}
  B = {3, 4, 5, 6, 7}
  ∅ = {} (empty set)
  ℕ = {0, 1, 2, 3, ...} (natural numbers)
  ℤ = {..., -2, -1, 0, 1, 2, ...} (integers)
  ℝ = real numbers
  ℚ = rational numbers

Membership: 3 ∈ A,  6 ∉ A
Subset: A ⊆ B means every element of A is in B
Power set: P(A) = set of all subsets of A
  P({1,2}) = {∅, {1}, {2}, {1,2}}  → |P(A)| = 2^|A|

Operations:
  Union:        A ∪ B = {x : x ∈ A OR x ∈ B} = {1,2,3,4,5,6,7}
  Intersection: A ∩ B = {x : x ∈ A AND x ∈ B} = {3,4,5}
  Difference:   A \ B = {x : x ∈ A AND x ∉ B} = {1,2}
  Complement:   Ā = {x ∈ U : x ∉ A} (relative to universal set U)
  Symmetric diff: A △ B = (A\B) ∪ (B\A) = {1,2,6,7}

Cartesian product: A × B = {(a,b) : a ∈ A, b ∈ B}
  {1,2} × {3,4} = {(1,3),(1,4),(2,3),(2,4)}

Cardinality:
  |A| = 5, |B| = 5, |A ∪ B| = 7, |A ∩ B| = 3
  Inclusion-exclusion: |A ∪ B| = |A| + |B| - |A ∩ B|
```

---

## Combinatorics

### Counting Principles
```
Rule of Product (AND):
  If choice A has m options and choice B has n options:
  Together: m × n options

  Example: 3 shirts × 4 pants = 12 outfits

Rule of Sum (OR):
  If mutually exclusive choices:
  Total = sum of options

  Example: 3 types of ID cards OR 2 types of passports = 5 options

Permutations (ordered arrangements):
  P(n, k) = n! / (n-k)!   (choose k from n, order matters)
  P(5, 3) = 5!/2! = 60    (5 people, choose 3 for positions)
  P(n, n) = n!             (arrange all n elements)

Combinations (unordered selections):
  C(n, k) = n! / (k! × (n-k)!)   (choose k from n, order doesn't matter)
  C(5, 2) = 10   (choose 2 from 5, order irrelevant)
  C(n, k) = C(n, n-k)   (choosing k to include = choosing n-k to exclude)

Binomial theorem:
  (x + y)^n = Σ C(n,k) x^k y^(n-k)  for k=0 to n
  (1+x)^n = 1 + nx + C(n,2)x² + ... + xⁿ

Pigeonhole principle:
  If n items in k containers and n > k:
  At least one container has ≥ ⌈n/k⌉ items

  Example: 13 people → at least 2 share a birth month (12 months)
  Example: In any group of 5 integers, at least 2 have same remainder mod 4
```

---

## Graph Theory

### Definitions
```
Graph G = (V, E):
  V: vertices (nodes)
  E: edges connecting pairs of vertices

Types:
  Undirected: edges (u,v) = (v,u) — no direction
  Directed (digraph): edges (u,v) ≠ (v,u) — has direction
  Weighted: edges have numeric weights
  Simple: no self-loops, no multiple edges between same vertices
  Multigraph: multiple edges allowed

Terms:
  Degree(v): number of edges incident to v
  In-degree, Out-degree: for directed graphs
  Path: sequence of vertices with edges between consecutive pairs
  Cycle: path that starts and ends at same vertex
  Connected: every vertex reachable from every other
  Tree: connected undirected graph with no cycles (n vertices, n-1 edges)
  DAG: Directed Acyclic Graph (no cycles)

Handshaking lemma:
  Sum of all degrees = 2|E|
  (Each edge contributes 2 to total degree count)
```

### Special Graphs
```
Complete graph Kn: every pair of vertices connected
  |E| = n(n-1)/2
  K3 = triangle

Bipartite graph: vertices split into two groups L, R
  All edges go between groups (none within)
  Test: 2-colorable (BFS/DFS coloring)

Tree: connected + no cycles → n vertices, n-1 edges

Spanning tree: tree that includes all vertices of graph

Planar graph: can be drawn without edge crossings
  Euler's formula: V - E + F = 2 (F = faces including outer face)
  For planar: E ≤ 3V - 6  (useful bound)
```

### Graph Algorithms Summary
```
BFS (Breadth-First Search):
  Level-by-level exploration using queue
  Finds shortest path (unweighted)
  O(V + E)

DFS (Depth-First Search):
  Deep exploration using stack/recursion
  Finds cycles, topological sort, SCCs
  O(V + E)

Dijkstra (single-source shortest path, non-negative weights):
  Priority queue, greedy approach
  O((V + E) log V) with binary heap

Bellman-Ford (single-source, allows negative weights):
  Relax all edges V-1 times
  Detects negative cycles
  O(VE)

Floyd-Warshall (all-pairs shortest path):
  Dynamic programming, O(V³)
  dp[i][j][k] = shortest path from i to j using only 0..k as intermediates

Topological Sort (for DAGs):
  DFS: add to result after processing all neighbors
  Kahn's algorithm: repeatedly remove vertices with in-degree 0
  O(V + E)

Minimum Spanning Tree:
  Kruskal: sort edges, add if no cycle (Union-Find) — O(E log E)
  Prim: greedily add cheapest edge to growing tree — O(E log V)
```

---

## Number Theory

### Divisibility and Primes
```
a | b means "a divides b" (b = ka for some integer k)
gcd(a,b): greatest common divisor
lcm(a,b): least common multiple
gcd(a,b) × lcm(a,b) = a × b

Euclidean algorithm (fast gcd):
  gcd(a, 0) = a
  gcd(a, b) = gcd(b, a mod b)

  gcd(48, 18) = gcd(18, 12) = gcd(12, 6) = gcd(6, 0) = 6

Extended Euclidean algorithm:
  Finds x, y such that ax + by = gcd(a, b)
  (Used to compute modular inverses)

Prime: integer > 1 divisible only by 1 and itself
  Sieve of Eratosthenes: find all primes up to n in O(n log log n)

  Fundamental Theorem of Arithmetic:
  Every integer > 1 has unique prime factorization

Modular arithmetic:
  a ≡ b (mod m) means m | (a - b)
  (a + b) mod m = ((a mod m) + (b mod m)) mod m
  (a × b) mod m = ((a mod m) × (b mod m)) mod m

Fermat's Little Theorem (p prime, p ∤ a):
  a^(p-1) ≡ 1 (mod p)
  Used in RSA and primality testing

Euler's theorem (general version):
  a^φ(n) ≡ 1 (mod n)  [gcd(a,n) = 1]
  φ(n) = Euler's totient function = count of integers 1..n coprime to n
  φ(p) = p-1 for prime p
  φ(p*q) = (p-1)(q-1) for distinct primes p, q [basis of RSA!]
```

---

## Boolean Algebra

### Logic Gates and Circuits
```
NOT:  ¬A = 1-A
AND:  A·B  (also written A ∧ B or AB)
OR:   A+B  (also written A ∨ B)
XOR:  A ⊕ B = A·¬B + ¬A·B = (A+B)·¬(A·B)
NAND: ¬(A·B) = ¬A + ¬B  [universal gate — can build any function]
NOR:  ¬(A+B) = ¬A·¬B    [universal gate]

Laws (identical to set theory):
  Commutative: A·B = B·A,  A+B = B+A
  Associative: A·(B·C) = (A·B)·C
  Distributive: A·(B+C) = A·B + A·C
               A+(B·C) = (A+B)·(A+C)
  De Morgan:   ¬(A·B) = ¬A + ¬B
               ¬(A+B) = ¬A · ¬B
  Identity:    A·1 = A,  A+0 = A
  Annihilation: A·0 = 0,  A+1 = 1
  Idempotent:  A·A = A,  A+A = A
  Complement:  A·¬A = 0,  A+¬A = 1

Simplification example:
  f = A·B + A·¬B + ¬A·B
    = A·(B+¬B) + ¬A·B
    = A + ¬A·B
    = A + B  (absorption law: A + ¬A·B = A + B)

Karnaugh map (K-map): visual minimization method
  Group 1s in powers of 2 (1, 2, 4, 8, ...)
  Each group eliminates one variable
  Larger groups = simpler expression
```

---

## Relations and Functions

### Relations
```
Binary relation R on A×B: subset of A×B
  xRy means (x,y) ∈ R

Properties of relations on A×A:
  Reflexive:    xRx for all x ∈ A
  Symmetric:    xRy → yRx
  Antisymmetric: xRy and yRx → x=y
  Transitive:   xRy and yRz → xRz

Equivalence relation: reflexive + symmetric + transitive
  Examples: equality (=), congruence mod n, same birthday
  Partitions set into equivalence classes

Partial order: reflexive + antisymmetric + transitive
  Examples: ≤, ⊆ (subset), | (divides)
  Can be visualized as Hasse diagram

Total order: partial order where every pair is comparable
  Examples: ≤ on integers (every a,b: a≤b or b≤a)
```

---

*Discrete mathematics isn't abstract — it's the language that algorithms and data structures are written in. Every time you think about recursion, you're using induction. Every time you use a hash table, you're applying number theory.*
