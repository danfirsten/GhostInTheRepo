# Database Internals — Complete Reference

> Understanding what happens inside the database gives you superpowers: you can optimize queries, design schemas that scale, and debug performance mysteries.

---

## Storage Engines

### B+ Tree (PostgreSQL, MySQL InnoDB)
```
B+ Tree properties:
  - All data in leaf nodes
  - Internal nodes contain only keys (routing)
  - Leaf nodes linked in sorted order (range scans)
  - Balanced: all leaves at same depth
  - Node size = disk page (typically 8KB–16KB)

Node capacity:
  Internal node: ~400 keys per 8KB page (keys only, no values)
  Leaf node: ~100 rows per 8KB page (keys + data)
  Height for 1 billion rows: log_400(10^9) ≈ 3.7 → 4 levels
  → Only 4 disk reads for any lookup!

Insert:
  1. Find correct leaf (tree traversal)
  2. Insert key + data into leaf
  3. If leaf full → split: promote median key to parent
  4. If parent full → split propagates up
  Cost: O(log n), 1-2 writes usually

Delete:
  1. Find + remove from leaf
  2. If underflow → rebalance (borrow or merge siblings)

Range scan:
  1. Binary search to first key in range
  2. Follow leaf page linked list → read consecutive pages
  → Very fast! Sequential I/O after first lookup
```

### LSM Tree (RocksDB, Cassandra, LevelDB)
```
Log-Structured Merge Tree:
  Optimized for high write throughput at the cost of read amplification

Write path:
  1. Write to WAL (Write-Ahead Log) — append-only, fast
  2. Write to MemTable (in-memory sorted tree)
  3. When MemTable full → flush to L0 SSTable on disk
  4. Background compaction merges SSTables

SSTable (Sorted String Table):
  - Immutable, sorted key-value file
  - Bloom filter at front (O(1) "definitely not here" check)
  - Data block + index block
  - L0: unsorted set of SSTables (overlapping key ranges)
  - L1+: sorted, non-overlapping (size-tiered or leveled)

Compaction (leveled):
  - Merge SSTables from Lk with overlapping ones in Lk+1
  - Each level ~10x larger than previous
  - Eliminates tombstones, deduplicates versions

Read path:
  1. Check MemTable
  2. Check bloom filters for each SSTable level
  3. Binary search in SSTable index
  4. Read data block
  → May check many SSTables → read amplification

Write amplification:
  Data is rewritten during compaction (10-50x write amplification)

vs B+ Tree:
  B+ Tree: good for reads, random writes require random I/O
  LSM: good for writes (sequential), reads need more work
```

---

## Query Processing

### Query Execution Pipeline
```
SQL Query text
    ↓
Parser → AST (Abstract Syntax Tree)
    ↓
Semantic Analysis → Validated AST (checks table/column names, types)
    ↓
Query Rewriter → Optimized AST (views expanded, predicates pushed down)
    ↓
Query Planner (Optimizer) → Query Plan Tree
    ↓
Query Executor → Results

Query Plan nodes (PostgreSQL):
  SeqScan       — Full table scan
  IndexScan     — Index + table heap access
  IndexOnlyScan — Index only (covering index)
  BitmapScan    — Bitmap index scan for large result sets
  HashJoin      — Hash one relation, probe with other (large tables)
  MergeJoin     — Sort both sides, merge (sorted input or small tables)
  NestedLoop    — For each row in outer, scan inner (small tables or indexed)
  Sort          — ORDER BY, pre-sort for MergeJoin
  HashAggregate — GROUP BY with hashing
  Materialize   — Cache intermediate result
```

### Understanding EXPLAIN
```sql
-- PostgreSQL EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;

-- Sample output:
Limit  (cost=89.32..89.35 rows=10 width=40) (actual time=2.3..2.3 rows=10 loops=1)
  -> Sort  (cost=89.32..91.32 rows=800 width=40) (actual time=2.3..2.3 rows=10 loops=1)
        Sort Key: count(o.id) DESC
        Sort Method: top-N heapsort  Memory: 25kB
    -> HashAggregate  (cost=60.00..68.00 rows=800 width=40) (actual time=1.8..2.0 rows=850 loops=1)
          Group Key: u.id
          -> Hash Left Join  (cost=10.00..40.00 rows=4000 width=32) (actual time=0.3..1.4 rows=5000 loops=1)
                Hash Cond: (o.user_id = u.id)
                -> Seq Scan on orders o  (cost=0..20.00 rows=4000 width=8) (actual time=0.05..0.5 rows=4000 loops=1)
                -> Hash  (cost=8.00..8.00 rows=160 width=28) (actual time=0.2..0.2 rows=160 loops=1)
                      Buckets: 1024  Batches: 1  Memory Usage: 18kB
                    -> Index Scan using users_created_at_idx on users u
                       (cost=0.14..8.00 rows=160 width=28) (actual time=0.02..0.2 rows=160 loops=1)
                          Index Cond: (created_at > '2024-01-01')

Interpretation:
  cost=X..Y     — startup cost .. total cost (planner estimate)
  actual time=X..Y — real time (ms) with ANALYZE
  rows=N         — estimated vs actual (large difference = stale statistics)
  loops=N        — how many times node was executed

Warning signs:
  cost estimate vs actual rows wildly different → run ANALYZE
  Seq Scan on large table → need an index
  Sort with Memory: XXX MB → temp disk sort needed, increase work_mem
  NestedLoop with large tables → may need HashJoin
```

### Statistics and the Planner
```sql
-- PostgreSQL collects statistics to estimate selectivity

-- Check statistics
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'orders';
-- n_distinct: -0.1 means 10% distinct values
-- correlation: 1.0 = perfectly sequential (index scan fast),
--              0.0 = random order (index scan slow, Seq scan better)

-- Update statistics
ANALYZE orders;
VACUUM ANALYZE orders;  -- Also reclaim dead tuples

-- Adjust statistics target (more buckets = better estimates)
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500;
ANALYZE orders;

-- Check table size
SELECT
    pg_size_pretty(pg_total_relation_size('orders')) AS total,
    pg_size_pretty(pg_relation_size('orders')) AS table,
    pg_size_pretty(pg_indexes_size('orders')) AS indexes;
```

---

## Transaction Internals

### MVCC (Multi-Version Concurrency Control)
```
PostgreSQL uses MVCC — no read locks needed.

Each row has:
  xmin: transaction ID that created this version
  xmax: transaction ID that deleted this version (0 if current)
  ctid: physical location (page, row) in heap

When you update a row:
  1. Old version: xmax set to current txn ID
  2. New version: xmin set to current txn ID, xmax = 0
  3. Both versions physically exist until VACUUM cleans old ones

When you read a row, only see versions where:
  xmin <= snapshot_xid AND xmax = 0 (or > snapshot_xid)
  → Your snapshot was taken before any transaction that later modified it

This means:
  SELECT never blocks on writes
  Writes never block reads
  But... dead tuples accumulate → VACUUM is critical!

VACUUM:
  - Marks dead tuples as reusable space
  - Updates visibility map
  - Prevents transaction ID wraparound
  AUTOVACUUM runs automatically (default settings usually fine)
  Manual: VACUUM ANALYZE table_name;
  Full rebuild: VACUUM FULL table_name; (takes lock!)
```

### Write-Ahead Logging (WAL)
```
Before any data page is written to disk:
  WAL record must be written to WAL log

WAL guarantees durability and enables:
  - Crash recovery (replay WAL after crash)
  - Replication (stream WAL to replicas)
  - Point-in-time recovery

WAL record contains:
  LSN (Log Sequence Number)
  Type: insert, update, delete, checkpoint, ...
  Table OID + page number
  Before/after image of changed data

Checkpoint:
  Periodically flush all dirty pages to disk
  Mark checkpoint in WAL
  Recovery only needs to replay from last checkpoint

Replication (WAL streaming):
  Primary writes WAL
  Replica receives WAL stream, replays it
  Replica can serve read queries (hot standby)
```

### Isolation Levels (PostgreSQL implementation)
```
Read Uncommitted = Reads committed (PostgreSQL doesn't implement dirty reads)

Read Committed (default):
  Snapshot taken at each statement start
  One transaction can see changes committed by others during its runtime
  Anomaly: non-repeatable reads, phantom reads

Repeatable Read:
  Snapshot taken at transaction start
  Always sees same data within transaction
  Anomaly: phantom reads (new rows might appear)

Serializable:
  Full ANSI serializable using SSI (Serializable Snapshot Isolation)
  Tracks read/write dependencies
  Aborts transactions that would create serialization anomalies
  Serialization failure → retry the transaction

-- Set isolation level
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... queries ...
COMMIT;

-- Lock troubleshooting
SELECT pg_blocking_pids(pid) as blocked_by, *
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- Lock types
SELECT locktype, relation::regclass, mode, granted
FROM pg_locks WHERE NOT granted;
```

---

## Indexing Deep Dive

### B-Tree Index Internals
```sql
-- B-tree index structure:
-- Root page → branch pages → leaf pages (contain ctids)

-- Index scan vs Sequential scan decision:
-- PostgreSQL compares:
--   estimated cost of IndexScan = (index pages read) + (random heap pages)
--   estimated cost of SeqScan = total table pages

-- When index scan is NOT used (even if index exists):
--   Table is small (seq scan faster due to overhead)
--   Column has low selectivity (30%+ rows match → seq scan cheaper)
--   Random heap access more expensive than sequential

-- Correlation matters for index efficiency:
-- If rows are physically ordered by indexed column (correlation ≈ 1):
--   → Index scan accesses pages sequentially = fast
-- If rows are randomly ordered (correlation ≈ 0):
--   → Index scan causes many random I/Os = may be slower than seq scan

-- Force index use (for testing)
SET enable_seqscan = OFF;
```

### Composite Index Strategy
```sql
-- Column order matters!
-- Index on (a, b, c) supports:
--   WHERE a = ?
--   WHERE a = ? AND b = ?
--   WHERE a = ? AND b = ? AND c = ?
--   ORDER BY a, b, c (with matching sort)
-- Does NOT support:
--   WHERE b = ?  (doesn't start with a)
--   WHERE b = ? AND c = ?

-- Selectivity rule: most selective first (for equality predicates)
-- Range rule: put range column last
CREATE INDEX ON events (user_id, event_type, created_at);
-- Supports: WHERE user_id = ? AND event_type = ? AND created_at BETWEEN ...

-- Covering index (include all needed columns)
CREATE INDEX ON orders (status) INCLUDE (total, created_at);
-- Index-only scan possible for: SELECT total, created_at WHERE status = ?

-- Partial index (smaller, faster for specific queries)
CREATE INDEX ON users (email) WHERE active = true;
-- Only indexes active users
-- SELECT * FROM users WHERE email = ? AND active = true → uses this index

-- Expression index
CREATE INDEX ON users (lower(email));
-- SELECT * FROM users WHERE lower(email) = 'alice@example.com'
```

---

## Replication

### PostgreSQL Streaming Replication
```
Primary → WAL records → Replica

Setup:
1. Primary postgresql.conf:
   wal_level = replica
   max_wal_senders = 3
   wal_keep_size = 1GB

2. Primary pg_hba.conf (allow replication connections):
   host replication replicator 10.0.0.0/8 md5

3. Create replication user:
   CREATE USER replicator REPLICATION PASSWORD 'secret';

4. Replica: pg_basebackup (initial copy)
   pg_basebackup -h primary-host -U replicator -D /var/lib/postgresql/data -Fp -Xs -P

5. Replica postgresql.conf:
   primary_conninfo = 'host=primary-host user=replicator password=secret'
   recovery_target_timeline = 'latest'
   hot_standby = on  # Allow reads on replica

Synchronous replication:
   synchronous_commit = on  # (remote_write, remote_apply)
   synchronous_standby_names = 'replica1'
   → Write doesn't return until replica acknowledges
   → Stronger durability, higher latency

Lag monitoring:
   SELECT write_lag, flush_lag, replay_lag
   FROM pg_stat_replication;
```

### Read Scaling with Replicas
```python
# Connection pooling with read/write splitting (Python example)
import psycopg2

class DBPool:
    def __init__(self):
        self.primary = psycopg2.connect(host="primary", ...)
        self.replicas = [
            psycopg2.connect(host="replica1", ...),
            psycopg2.connect(host="replica2", ...),
        ]
        self._replica_idx = 0

    def get_writer(self):
        return self.primary

    def get_reader(self):
        # Round-robin across replicas
        replica = self.replicas[self._replica_idx % len(self.replicas)]
        self._replica_idx += 1
        return replica
```

---

## Connection Pooling

### PgBouncer
```ini
; pgbouncer.ini
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction    ; session | transaction | statement
max_client_conn = 1000
default_pool_size = 20     ; Max connections to PostgreSQL
reserve_pool_size = 5
listen_port = 6432

; Pool modes:
; session:     Client occupies server connection for entire session
;              Compatible with all PostgreSQL features
; transaction: Client gets server connection only during transaction
;              Most common, doesn't support prepared statements
; statement:   Per-statement (basically deprecated)

; Connection limits:
; PostgreSQL has max_connections (default 100)
; Each connection uses ~5-10MB RAM
; With PgBouncer: 1000 clients → 20 server connections
```

---

*Databases are software engineering concentrated. Every optimization trade-off, every distributed systems problem appears here. Understanding internals makes you 10x better at using them.*
