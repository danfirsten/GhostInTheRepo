# Distributed Systems — Complete Reference

> Distributed systems are hard because the failures you need to handle are the same failures that hide from you.

---

## Why Distributed Systems Are Hard

### The Fallacies of Distributed Computing (Peter Deutsch, 1994)
1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

**Every one of these assumptions is false in production.**

### What Can Go Wrong
- Nodes crash
- Nodes are slow (not dead, just delayed)
- Networks partition
- Packets are lost, reordered, or duplicated
- Clocks drift between machines
- Disk corrupts data (bit rot)
- Software has bugs

---

## Time in Distributed Systems

### Why Clocks Are Unreliable
- **Clock drift**: hardware clocks run at slightly different rates
- **NTP corrections**: time jumps forward or backward
- **Leap seconds**: cause havoc in time-based logic
- **No global "now"**: speed of light means events can't be instantaneously ordered

### Logical Clocks

**Lamport Timestamps:**
```
Rule 1: Increment local time before each event
Rule 2: On send, attach current time
Rule 3: On receive, max(local, received) + 1
```
- Establishes happens-before ordering
- Limitation: can't detect concurrent events (same timestamp ≠ same time)

**Vector Clocks:**
```python
# Each node maintains vector of counts
# Node A: [a, b, c] = [count_A, count_B, count_C]
# Increment own counter on event
# Merge on receive: max of each element

# Causally compare:
# A → B if A[i] ≤ B[i] for all i, and A[j] < B[j] for some j
# A ∥ B if neither A→B nor B→A (concurrent)
```

**Hybrid Logical Clocks (HLC):**
- Combines physical time + logical time
- `l.e` = physical, `c.e` = counter
- Preserves causality while staying close to wall clock
- Used in CockroachDB

---

## Replication

### Why Replicate?
- **Fault tolerance**: survive node failures
- **Performance**: serve reads from nearest replica
- **Durability**: data survives disk failure

### Replication Strategies

**Primary-Backup (Single-Leader):**
```
Client → Primary → Replica 1
                 → Replica 2

Synchronous: Primary waits for replicas to ack before responding
  + No data loss
  - Higher write latency

Asynchronous: Primary responds immediately, replicates in background
  + Low write latency
  - Data loss on primary failure before replication
```

**Multi-Leader:**
- Multiple nodes accept writes
- Conflict resolution needed
- Use case: multi-datacenter (one leader per DC)
- Problem: write conflicts (same data edited simultaneously)

**Leaderless (Dynamo-style):**
```
W writes + R reads > N replicas = strong consistency
W = R = N/2 + 1 = quorum

sloppy quorum: writes go to available nodes, hinted handoff when target rejoins
anti-entropy: background process reconciles replica differences
read repair: on read, detect stale replicas, update them
```

### Replication Log Methods

**Statement-based:** Forward SQL statements to replicas
- Problem: non-deterministic functions (NOW(), RAND()), stored procedures

**Write-ahead log (WAL) shipping:** Forward binary log
- Tied to storage format version (upgrade complexity)

**Row-based (logical) replication:** Log changes per row
- Independent of storage format
- Larger log volume

**Trigger-based:** Application-level replication
- Flexible, but higher overhead

---

## Consensus

### The Problem
Getting multiple nodes to agree on a single value, even when some nodes fail.

**Impossibility result (FLP, 1985):**
In an asynchronous system, consensus is impossible if even one node can crash.

**Practical resolution:** Synchrony assumptions (timeouts) or randomization.

### Paxos
```
Roles:
- Proposer: proposes values
- Acceptor: accepts or rejects proposals
- Learner: learns the chosen value

Phase 1a (Prepare):
  Proposer → Acceptors: Prepare(n)   [n = proposal number]
Phase 1b (Promise):
  Acceptor → Proposer: Promise(n, [previous_accepted_n, previous_accepted_v])
  (Accept no proposals with number < n)
Phase 2a (Accept):
  Proposer → Acceptors: Accept(n, v)   [v = highest previously accepted value or new value]
Phase 2b (Accepted):
  Acceptor → Learner: Accepted(n, v)   [if they haven't promised higher]
```

**Multi-Paxos:** Run Paxos repeatedly, elect stable leader to skip Phase 1 each round.

### Raft
Designed for understandability. Three components:
1. **Leader election**
2. **Log replication**
3. **Safety**

**Leader election:**
```
States: Follower → Candidate → Leader
- All nodes start as Follower
- No heartbeat from Leader → become Candidate (increment term, vote for self)
- Send RequestVote to others
- Win majority → become Leader
- Term = logical epoch, prevents stale leaders
```

**Log replication:**
```
Leader receives client request
→ Appends to local log
→ Sends AppendEntries to all followers
→ Waits for majority to acknowledge
→ Commits entry (applies to state machine)
→ Responds to client
→ Notifies followers of commit in next RPC
```

**Safety properties:**
- Election safety: at most one leader per term
- Log matching: if two logs have same index+term entry, all preceding entries identical
- Leader completeness: committed entries appear in all future leader logs

### ZAB (ZooKeeper Atomic Broadcast)
- Similar to Raft
- Recovery mode → broadcast mode
- Transaction ID = (epoch, counter)
- Used in Apache ZooKeeper

---

## Distributed Transactions

### Two-Phase Commit (2PC)
```
Phase 1 (Prepare):
  Coordinator → Participants: PREPARE
  Participant: Write to log, lock resources, reply YES/NO

Phase 2 (Commit/Abort):
  If all YES → COMMIT
  If any NO → ABORT

  Coordinator → Participants: COMMIT/ABORT
  Participants: Execute, release locks
```

**Problems:**
- Coordinator single point of failure
- Blocking: participants locked waiting for coordinator
- Not partition-tolerant

### Three-Phase Commit (3PC)
- Adds pre-commit phase to avoid blocking
- Doesn't help with partitions (can still diverge)

### Saga Pattern
Long-running transactions as sequence of local transactions + compensations:

```
Order → Reserve Inventory → Charge Payment → Ship Order
        ↑ Compensate ↑      ↑ Compensate ↑   ↑ Compensate ↑
     Cancel Order     Release Inventory   Refund Payment

Choreography: services react to events (no central coordinator)
Orchestration: central saga orchestrator calls each step
```

**Idempotency:** Each step must be safe to retry.

---

## Consistency Models

```
Strict Consistency ← Impossible in practice (requires instantaneous communication)
     ↓
Linearizability (Atomic Consistency)
  - Operations appear instantaneous
  - Real-time ordering preserved
  - Used in: leader election, distributed locks, CAS operations
     ↓
Sequential Consistency
  - All operations in some sequential order
  - Each process's operations appear in program order
  - Not real-time ordered
     ↓
Causal Consistency
  - Causally related ops seen in order
  - Concurrent ops may differ across nodes
     ↓
PRAM / Pipeline Consistency
  - Operations from single process seen in order
     ↓
Eventual Consistency ← Most relaxed: all replicas converge eventually
```

### Linearizability Implementation
- Requires all reads/writes go through single leader
- Or: multi-leader with Paxos/Raft consensus
- Cost: high latency (can't serve reads from local replica without coordination)

### Read Your Own Writes
```
After writing to leader, read from replica may return old value.
Solutions:
1. Read from leader for user's own profile
2. Track replication lag, read from replica only if lag < threshold
3. Client remembers timestamp, wait for replica to catch up
```

### Monotonic Reads
```
User refreshes page, sees comment posted earlier — but comment disappears on refresh.
Solution: Route each user's reads to same replica.
```

---

## CAP Theorem in Practice

**CP systems (Consistency + Partition Tolerance):**
- HBase, Zookeeper, Etcd
- Refuse writes during partition
- Useful when: data must be correct (financial, configuration)

**AP systems (Availability + Partition Tolerance):**
- Cassandra, CouchDB, DynamoDB (in default config)
- Accept writes, reconcile on reconnect
- Useful when: some staleness is OK (DNS, caching, sessions)

**PACELC (Extended CAP):**
- During Partition: C or A?
- Else (normal ops): Latency or Consistency?
- More realistic model

---

## Distributed Data Structures

### CRDTs (Conflict-Free Replicated Data Types)
Data structures that can be merged without coordination:

**G-Counter (Grow-only counter):**
```
State: vector of counts [c₀, c₁, c₂, ...]
Increment: increment own element
Query: sum all elements
Merge: max of each element
```

**PN-Counter (increment + decrement):**
- Two G-counters: positive, negative
- Value = sum(positive) - sum(negative)

**G-Set (Grow-only set):**
- Add only, no remove
- Merge: union

**LWW-Element-Set (Last-Write-Wins Set):**
- Each element has timestamp
- On add/remove, update timestamp
- Merge: keep element with higher timestamp

**OR-Set (Observed-Remove Set):**
- Unique tag per add operation
- Remove marks specific tags as removed
- Solves "add wins" vs "remove wins" deterministically

Used in: Redis CRDT, Riak, collaborative editors.

---

## Distributed Coordination

### Distributed Lock
```
Requirements:
1. Mutual exclusion
2. No deadlock (even if client crashes)
3. Fault tolerance (lock service failure)

Redis SET NX PX:
SET lock_key uuid NX PX 30000
# NX = only if not exists
# PX 30000 = expire in 30 seconds (auto-release on crash)
# Store UUID to prevent releasing someone else's lock

Release (Lua for atomicity):
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end

Redlock: acquire lock on N/2+1 Redis nodes (majority)
```

### Service Discovery
```
Client-side discovery:
  Client → Registry (get instances) → pick instance → connect directly
  Examples: Eureka (Netflix), Consul with client-side LB

Server-side discovery:
  Client → Load Balancer → Registry → backend instance
  Examples: AWS ALB + ECS, Kubernetes Services

DNS-based: A/SRV records updated dynamically
  - Consul, Kubernetes headless services
```

### Leader Election
```
Apache ZooKeeper:
- Create ephemeral sequential znode under /election
- List children, find lowest
- If I'm lowest → I'm leader
- Else → watch next-lowest, take over if it disappears

etcd lease-based:
- Try to create key with lease
- If success → leader (holds key until lease expires)
- Others watch for key deletion
```

---

## Message Passing

### Apache Kafka Deep Dive

**Architecture:**
```
Producers → Topics (partitioned) → Consumer Groups

Topic: logical stream of records
Partition: ordered, immutable log; unit of parallelism
Offset: position in partition
Consumer Group: set of consumers sharing work
  - Each partition consumed by exactly one consumer per group
  - Can have multiple groups (pub/sub semantics)
```

**Replication:**
```
Each partition has: 1 leader + N-1 followers
Leader handles reads + writes
Followers replicate from leader
ISR (In-Sync Replicas): followers that are caught up
Controller (broker): manages leader elections
```

**Delivery semantics:**
```
At-most-once: don't retry on failure (possible data loss)
At-least-once: retry until ack (possible duplicates)
Exactly-once: idempotent producer + transactions (Kafka 0.11+)
```

**Kafka Streams:**
```java
StreamsBuilder builder = new StreamsBuilder();
KStream<String, String> source = builder.stream("input-topic");
KStream<String, Long> wordCounts = source
    .flatMapValues(v -> Arrays.asList(v.split("\\s+")))
    .groupBy((key, word) -> word)
    .count()
    .toStream();
wordCounts.to("output-topic");
```

---

## Observability in Distributed Systems

### The Three Pillars

**Metrics:** Aggregated numbers over time
- Prometheus: pull-based, time-series DB, PromQL
- StatsD: push-based, UDP
- OpenMetrics: standard format

**Logs:** Structured events with context
- Structured logging (JSON) > text
- Correlation ID to trace requests across services
- ELK stack: Elasticsearch + Logstash + Kibana
- Loki: Prometheus for logs

**Traces:** Request flow across services
- OpenTelemetry: standard instrumentation API
- Jaeger, Zipkin: trace collection + visualization
- Spans: unit of work, child spans form tree

**Context Propagation:**
```python
# W3C Trace Context (standard)
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
              │  └── trace-id (128 bit)              └── span-id      └── flags
              └── version
```

### Distributed Tracing Example
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

tracer = trace.get_tracer(__name__)

def handle_request(request_id):
    with tracer.start_as_current_span("handle_request") as span:
        span.set_attribute("request.id", request_id)

        with tracer.start_as_current_span("db_query"):
            result = db.query(...)

        with tracer.start_as_current_span("external_api_call"):
            response = call_external_api(...)

        return result
```

---

## Resilience Patterns

### Bulkhead Pattern
```
Isolate resources per service to contain failures:

❌ Thread Pool Sharing
[Service A] →  |              |
[Service B] →  | Shared Pool  | → DB
[Service C] →  |    100       |
(Service A hangs → all 100 threads busy → B and C also degraded)

✅ Separate Thread Pools
[Service A] → |Pool 40| → DB-A
[Service B] → |Pool 30| → DB-B
[Service C] → |Pool 30| → DB-C
(Service A hangs → only A's 40 threads busy → B, C unaffected)
```

### Timeout & Retry
```
Always set timeouts:
- Connection timeout: time to establish connection
- Read timeout: time to receive response after connecting
- Socket timeout: time between data packets

Retry logic:
- Exponential backoff: 1s, 2s, 4s, 8s...
- Jitter: add randomness (1s ± 0.5s, 2s ± 1s...)
- Max retries: don't retry indefinitely
- Idempotency: only retry idempotent operations safely
```

### Circuit Breaker
```python
class CircuitBreaker:
    CLOSED, OPEN, HALF_OPEN = 'closed', 'open', 'half_open'

    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.state = self.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.threshold = failure_threshold
        self.timeout = recovery_timeout

    def call(self, fn, *args, **kwargs):
        if self.state == self.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = self.HALF_OPEN
            else:
                raise CircuitOpenError("Circuit is OPEN")

        try:
            result = fn(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = self.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.threshold:
            self.state = self.OPEN
```

---

*The hard part of distributed systems isn't the algorithms — it's accepting that any of your assumptions can be violated at any time.*
