# System Design — The Complete Playbook

> System design is where engineering meets architecture, trade-offs, and reality. This is what separates seniors from juniors.

---

## Framework: How to Approach Any Design Problem

```
1. Clarify requirements          (5 min)
2. Estimate scale                (3 min)
3. Define API/interface          (5 min)
4. High-level design             (10 min)
5. Deep dive key components      (15 min)
6. Address trade-offs            (5 min)
7. Wrap up                       (2 min)
```

**Always ask:**
- Read vs write heavy?
- Consistency vs availability requirements?
- Latency requirements?
- Data volume / growth rate?
- Global vs single region?

---

## Numbers Every Engineer Should Know

### Latency Reference
```
L1 cache reference:         0.5 ns
Branch misprediction:       5 ns
L2 cache reference:         7 ns
Mutex lock/unlock:          25 ns
Main memory reference:      100 ns
Compress 1KB with Snappy:   3,000 ns = 3 µs
Send 1KB over 1 Gbps:       10,000 ns = 10 µs
SSD random read:            150,000 ns = 150 µs
Read 1MB sequentially:      250,000 ns = 250 µs
Round trip same datacenter: 500,000 ns = 0.5 ms
Read 1MB seq from SSD:      1,000,000 ns = 1 ms
HDD seek:                   10,000,000 ns = 10 ms
Network round trip CA→NL:   150,000,000 ns = 150 ms
```

**Key insight:** Memory is ~1000x faster than SSD, SSD is ~1000x faster than network.

### Capacity Estimates
```
1 million req/day = ~12 req/sec
100 million req/day = ~1,150 req/sec
1 billion req/day = ~11,500 req/sec

Twitter: ~500M tweets/day = ~5,800/sec
YouTube: ~500 hours video uploaded/minute
Instagram: ~100M photos/day

1 char = 1 byte
1 tweet = ~280 bytes
1 photo = ~200 KB
1 video minute = ~50 MB (compressed)
1 audio second = ~32 KB (MP3 128kbps)
```

---

## Fundamental Components

### Load Balancer
**Purpose:** Distribute requests across multiple servers

**Algorithms:**
- Round Robin, Weighted Round Robin
- Least Connections
- IP Hash (session stickiness)
- Consistent Hash

**Types:**
- **Hardware LB**: F5, Citrix (expensive, fast)
- **Software L4**: HAProxy, LVS (TCP/IP level)
- **Software L7**: Nginx, Traefik, AWS ALB (HTTP level, content routing)

**Features:**
- Health checks (passive + active)
- SSL termination
- Sticky sessions
- Connection draining

### Caching

**Why cache?** Network calls ~1ms, cache hits ~100µs (10x improvement)

**Cache levels:**
```
Browser cache        → saves network round trips
CDN cache            → reduces origin load, improves global latency
App server cache     → in-process (e.g., local HashMap)
Distributed cache    → Redis, Memcached (shared across servers)
Database cache       → query cache, buffer pool
```

**Cache strategies:**

**Cache-aside (Lazy Loading):**
```
1. App checks cache
2. Cache miss → load from DB
3. Store in cache
4. Return to caller
+ Tolerates cache failures
- Cold start, potential inconsistency
```

**Write-through:**
```
1. App writes to cache
2. Cache writes to DB synchronously
+ Always consistent
- Write latency increased
```

**Write-behind (Write-back):**
```
1. App writes to cache
2. Cache async writes to DB
+ Fast writes
- Data loss risk if cache fails
```

**Read-through:**
```
Cache sits in front of DB, handles all reads
Cache fills itself on miss
+ Simple app code
```

**Cache Eviction:**
- **LRU**: Least Recently Used
- **LFU**: Least Frequently Used
- **FIFO**: First In First Out
- **TTL**: Time-to-live expiry

**Cache Consistency:**
- **TTL-based**: tolerate stale data up to TTL
- **Cache invalidation**: write to DB → invalidate cache entry
- **Write-through**: keep cache in sync

**Problems:**
- **Cache thundering herd**: cache expires, many requests hit DB simultaneously
  - Solution: mutex/lock for cache fill, probabilistic early expiration
- **Cache penetration**: requests for non-existent keys bypass cache
  - Solution: cache null values, Bloom filter
- **Cache avalanche**: many keys expire simultaneously
  - Solution: randomize TTLs, circuit breaker

### Databases

**SQL:**
- ACID: Atomicity, Consistency, Isolation, Durability
- Good for: complex queries, joins, strong consistency
- Examples: PostgreSQL, MySQL, SQLite

**NoSQL:**
- BASE: Basically Available, Soft state, Eventually consistent
- Horizontal scaling
- Types:
  - **Document**: MongoDB, CouchDB — flexible schema
  - **Key-Value**: Redis, DynamoDB — simple, fast
  - **Wide-Column**: Cassandra, HBase — time-series, write-heavy
  - **Graph**: Neo4j, Amazon Neptune — relationship queries

**When to use SQL vs NoSQL:**
| Criteria | SQL | NoSQL |
|---|---|---|
| Schema | Fixed | Flexible |
| Relationships | Complex joins | Denormalized |
| Consistency | Strong | Eventual |
| Scale | Vertical (+ read replicas) | Horizontal |
| Query complexity | High | Limited |

### Message Queues

**Why:** Decouple producers from consumers, handle spikes, retry logic, async processing

**Key concepts:**
- **Topic/Queue**: where messages go
- **Producer**: publishes messages
- **Consumer**: reads and processes
- **Consumer group**: multiple consumers sharing load
- **Offset**: position in queue (Kafka)
- **ACK**: confirmation of processing

**Technologies:**
- **Kafka**: high throughput, ordered, persistent, replay, streaming
- **RabbitMQ**: complex routing, AMQP, traditional queue
- **SQS**: managed AWS queue, simple, auto-scaling
- **Redis Streams**: lightweight, good for small scale
- **Pub/Sub**: Google Cloud, fanout pattern

**Patterns:**
- **Work queue**: multiple workers consume from one queue (job distribution)
- **Pub/Sub**: one message to many subscribers (events)
- **Request/Reply**: async RPC
- **Dead letter queue**: messages that failed to process

### Rate Limiting

**Why:** Prevent abuse, ensure fair use, protect backends

**Algorithms:**
- **Fixed Window**: count per time window; window boundary burst problem
- **Sliding Window Log**: exact but memory-intensive
- **Sliding Window Counter**: approximation, efficient
- **Token Bucket**: bucket fills at rate, requests consume tokens; allows bursts
- **Leaky Bucket**: constant outflow rate, queues excess; smooth output

**Where:**
- API Gateway (global)
- Individual service level
- Per-user, per-IP, per-API-key

**Storage:** Redis is ideal (atomic INCR, TTL, distributed)

```python
# Token bucket in Redis (pseudo-code)
def is_allowed(user_id, rate, burst):
    tokens = redis.get(f"tokens:{user_id}") or burst
    last_time = redis.get(f"time:{user_id}") or now()
    elapsed = now() - last_time
    tokens = min(burst, tokens + elapsed * rate)
    if tokens >= 1:
        redis.set(f"tokens:{user_id}", tokens - 1)
        redis.set(f"time:{user_id}", now())
        return True
    return False
```

### Consistent Hashing

**Problem:** When servers are added/removed in a standard hash ring, most keys get remapped.

**Solution:** Map both servers and keys to a ring (0 to 2^32). Key goes to first server clockwise.

```
Ring: 0 ────── Server A ────── Server B ────── Server C ────── 2^32
         Key1↑     Key2↑            Key3↑

Adding Server D between A and B: only keys between A and D remapped
```

**Virtual nodes:** Each physical server maps to multiple ring positions → even distribution.

Used in: Cassandra, Amazon DynamoDB, Memcached clusters, CDNs.

---

## Databases Deep Dive

### Indexing

**B-Tree Index** (default in most DBs):
- Balanced tree, O(log n) search, range queries
- Good for: equality, range, sorting
- Overhead: updates must maintain tree

**Hash Index:**
- O(1) lookup, no range queries
- Good for exact equality
- Memory databases (Redis)

**Composite Index:**
```sql
CREATE INDEX idx_name ON users(last_name, first_name, age);
-- Efficient: WHERE last_name='Smith'
-- Efficient: WHERE last_name='Smith' AND first_name='John'
-- NOT efficient: WHERE first_name='John' (doesn't use leftmost column)
```

**Index on reads vs writes:**
- More indexes = faster reads, slower writes (must maintain each index)
- Rule: index columns used in WHERE, JOIN, ORDER BY, GROUP BY

**Covering Index:**
- Index contains all columns in query → no table lookup needed
- `EXPLAIN` shows "Index Only Scan"

### Replication

**Purpose:** high availability, read scaling, disaster recovery

**Master-Slave (Primary-Replica):**
- Writes go to master
- Reads can go to replicas
- Async replication → eventual consistency

**Multi-Master:**
- Multiple nodes accept writes
- Conflict resolution needed (last-write-wins, CRDTs)

**Synchronous vs Async Replication:**
- Sync: write confirmed after replica acknowledges → no data loss, higher latency
- Async: write confirmed after primary writes → possible data loss on primary failure

**Replication lag:**
- Replica may be behind master
- Read-after-write consistency: route reads to master for fresh data

### Sharding (Horizontal Partitioning)

**Why:** Single server can't hold all data

**Sharding strategies:**
- **Horizontal (range)**: shard by key range (user IDs 1-1M on shard 1, etc.)
  - Hot spots if access is uneven
- **Vertical**: split by feature (users DB, orders DB)
- **Hash sharding**: hash(key) mod N → shard
- **Directory-based**: lookup table maps key → shard

**Challenges:**
- Joins across shards are expensive
- Resharding when adding shards
- Hotspots

**Famous sharding approaches:**
- **Instagram**: PostgreSQL with logical sharding
- **Cassandra**: consistent hash ring
- **DynamoDB**: partition key determines shard

### Transactions & ACID

**Isolation Levels:**
| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | ✓ | ✓ | ✓ |
| Read Committed | ✗ | ✓ | ✓ |
| Repeatable Read | ✗ | ✗ | ✓ |
| Serializable | ✗ | ✗ | ✗ |

**2-Phase Commit (2PC):**
- Coordinator sends PREPARE to all participants
- All reply YES/NO
- If all YES, coordinator sends COMMIT
- Used for distributed transactions
- Weakness: coordinator failure leaves participants blocked

**Saga Pattern:**
- Long-running transaction as sequence of local transactions
- Each step publishes event
- Compensating transactions for rollback
- Avoids 2PC, better availability

---

## Distributed Systems Concepts

### CAP Theorem
You can only guarantee 2 of 3:
- **C**onsistency: every read gets the most recent write
- **A**vailability: every request gets a response
- **P**artition tolerance: system works despite network partition

In reality: network partitions happen, so choose C or A.
- **CP**: Zookeeper, HBase, MongoDB (in default config)
- **AP**: Cassandra, CouchDB, DynamoDB

**PACELC (more nuanced):**
When no partition: trade-off between **L**atency and **C**onsistency

### Consensus Algorithms

**Paxos:**
- Classic consensus algorithm
- Roles: Proposer, Acceptor, Learner
- Two phases: Prepare/Promise, Accept/Accepted
- Complex to implement correctly

**Raft:**
- Designed for understandability
- Leader election + log replication
- States: Leader, Follower, Candidate
- Heartbeat-based leader detection
- Used in: etcd, CockroachDB, TiKV

**ZAB (ZooKeeper Atomic Broadcast):**
- Leader broadcasts, majority quorum
- Used in Zookeeper

### Distributed Consistency Patterns

**Strong consistency:** All nodes see same data at same time
**Eventual consistency:** All nodes converge given no new updates
**Causal consistency:** Causally related ops seen in order
**Read-your-own-writes:** You see your own writes immediately
**Monotonic reads:** Won't see older version than you've seen

**Vector clocks:** Track causality in distributed systems
**CRDTs (Conflict-free Replicated Data Types):** Data structures that can be merged without conflicts

---

## Designing Specific Systems

### URL Shortener (bit.ly)
```
Requirements:
- Create short URL from long URL
- Redirect short URL to long URL
- Analytics?

Estimation:
- 100M URLs created/day = ~1200/sec writes
- 10:1 read:write → 12000/sec reads

Design:
1. API: POST /shorten {url}, GET /{code} → redirect
2. ID generation: base62 encode auto-increment ID, or hash
3. DB: simple key-value (code → long_url), cache hot codes
4. Redirect: 301 (permanent, cached by browser) vs 302 (track clicks)

Short URL generation:
- MD5 hash → take first 7 chars (collision possible)
- Counter + base62 (7 chars = 62^7 = 3.5T URLs)
- UUID → too long
```

### Instagram/Photo Service
```
Requirements:
- Upload photos
- Follow users
- News feed (photos from followed users)

Key challenges:
1. Photo storage: blob store (S3), generate URLs
2. Metadata: SQL for user data, follows, comments
3. Feed generation:
   - Pull (query at read time): simple, slow for large follow lists
   - Push (fanout on write): precompute feed, fast reads
   - Hybrid: push for normal users, pull for celebrities
4. CDN for photo delivery

Data model:
- users(id, name, email, ...)
- photos(id, user_id, url, timestamp, ...)
- follows(follower_id, followee_id)
- feed(user_id, photo_id, timestamp) -- precomputed
```

### Twitter/Feed System
```
Critical numbers:
- 300M DAU
- 500M tweets/day
- 200K/sec peak reads

Unique challenges:
- Celebrity problem: Obama follows → 100M feed updates
- Real-time trending topics
- Search (full-text index)

Feed:
- Hybrid push/pull
- Regular users: push (fanout)
- Celebrities: pull (too many followers for push)
- Threshold: if following > 1M, pull model

Timeline service:
- Redis sorted set per user (tweet IDs, timestamp as score)
- Lazy loading: only store last 800 tweets in cache
- On follow: backfill last 800 tweets from followee
```

### Distributed Cache (Redis)
```
- Hash sharding across Redis nodes
- Master-slave per shard for HA
- Eviction: LRU for caching use cases
- Persistence: RDB snapshots + AOF (append-only file)
- Redis Cluster: automatic sharding + replication
```

### Ride-Sharing (Uber)
```
Core challenges:
1. Location tracking: drivers update location every 4s
   → high write volume, Cassandra or custom spatial DB
2. Matching: find nearest available driver
   → geospatial index (quadtree, geohash, or S2)
3. Surge pricing: demand > supply in area
4. Trip state machine
5. Payments: idempotency critical (retry-safe)

Geospatial:
- Geohash: divide world into grid, encode as string
- Closer geohashes = more common prefix
- S2 library (Google): spherical geometry
- QuadTree: hierarchical spatial partitioning

Driver location:
- Redis with geospatial commands: GEOADD, GEODIST, GEORADIUS
- Or Cassandra: (geohash_prefix → driver_ids)
```

---

## Reliability Patterns

### Circuit Breaker
```
States: Closed (normal) → Open (failing) → Half-Open (testing)
- Closed: pass requests through, count failures
- Open: reject immediately, fail fast, don't overload failing service
- Half-Open: allow one request, if success → Closed, if fail → Open
```

### Bulkhead
- Isolate resources per service/client
- Pool isolation: separate thread pools per downstream service
- Failure in one doesn't exhaust resources for others

### Retry with Exponential Backoff
```python
def retry(fn, max_attempts=3, base_delay=1.0):
    for attempt in range(max_attempts):
        try:
            return fn()
        except TransientError as e:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            time.sleep(delay)
```

**Jitter:** Add randomness to avoid thundering herd on retry

### Idempotency
- Safe to call multiple times without different result
- Critical for: payments, email sending, external API calls
- Idempotency key: include unique ID in request, server deduplicates

### Saga Pattern for Distributed Transactions
```
Order → Reserve Inventory → Process Payment → Ship
If payment fails:
Compensation: Release Inventory → Cancel Order
```

---

## API Design

### REST
```
GET    /users          List users
GET    /users/123      Get user 123
POST   /users          Create user
PUT    /users/123      Replace user 123
PATCH  /users/123      Update fields of user 123
DELETE /users/123      Delete user 123

Status codes:
200 OK, 201 Created, 204 No Content
400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
500 Internal Server Error, 503 Service Unavailable
```

### GraphQL
- Single endpoint
- Client specifies exact data shape needed
- Reduces over-fetching and under-fetching
- N+1 query problem: use DataLoader for batching

### gRPC
- Protocol Buffers (binary serialization)
- HTTP/2 based (multiplexed, streaming)
- Strongly typed, code generation
- Great for internal microservice communication

---

*System design is a conversation. Know the components, know the trade-offs, think out loud.*
