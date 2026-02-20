# SQL & Relational Databases — Complete Reference

> SQL is 50 years old and still powers the majority of critical systems. Learn it deeply, not just the basics.

---

## Relational Model Fundamentals

### Relations & Normalization

**Normal Forms:**

**1NF (First Normal Form):**
- Atomic values (no repeating groups, no arrays in cells)
- Each column has one value per row

**2NF (Second Normal Form):**
- 1NF + no partial dependencies (non-key columns depend on entire primary key)
- Applies only when composite PK exists

**3NF (Third Normal Form):**
- 2NF + no transitive dependencies (non-key columns don't depend on other non-key columns)
- `Customer → City → ZipCode` violates 3NF (ZipCode determined by City, not PK)

**BCNF (Boyce-Codd Normal Form):**
- Stricter than 3NF
- For every functional dependency A→B, A must be a superkey

**When to denormalize:** Performance. Reads are faster with fewer joins. Trade storage for speed.

---

## SQL Syntax Reference

### DDL (Data Definition Language)
```sql
-- Create table
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,      -- Auto-increment
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    profile_id  BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','mod'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE UNIQUE INDEX idx_users_username_lower ON users(LOWER(username));
CREATE INDEX idx_users_active_role ON users(is_active, role) WHERE is_active = true;

-- Modify table
ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
ALTER TABLE users DROP COLUMN old_column;
ALTER TABLE users ALTER COLUMN username TYPE TEXT;
ALTER TABLE users RENAME COLUMN old_name TO new_name;
ALTER TABLE users ADD CONSTRAINT uq_email UNIQUE(email);
ALTER TABLE users DROP CONSTRAINT uq_email;

-- Drop
DROP TABLE IF EXISTS users;
DROP TABLE users CASCADE;  -- Also drops dependent objects

-- Views
CREATE VIEW active_users AS
    SELECT id, username, email FROM users WHERE is_active = true;

CREATE MATERIALIZED VIEW user_stats AS
    SELECT role, COUNT(*) as count FROM users GROUP BY role;
REFRESH MATERIALIZED VIEW user_stats;  -- Must manually refresh
```

### DML (Data Manipulation Language)
```sql
-- INSERT
INSERT INTO users (username, email, password_hash)
VALUES ('alice', 'alice@example.com', '$2a$12$hash');

-- Multi-row insert
INSERT INTO logs (user_id, action, timestamp) VALUES
    (1, 'login',  NOW()),
    (1, 'view',   NOW()),
    (2, 'logout', NOW());

-- INSERT ... ON CONFLICT (upsert)
INSERT INTO users (id, username, email)
VALUES (1, 'alice', 'alice@new.com')
ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

ON CONFLICT (id) DO NOTHING;  -- Ignore if exists

-- SELECT
SELECT id, username, email
FROM users
WHERE is_active = true
    AND created_at >= NOW() - INTERVAL '30 days'
    AND role IN ('user', 'admin')
    AND username LIKE 'a%'
    AND email ILIKE '%@gmail.com'  -- Case-insensitive LIKE (PostgreSQL)
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;

-- UPDATE
UPDATE users
SET email = 'newemail@example.com',
    updated_at = NOW()
WHERE id = 42
RETURNING id, email;  -- Return modified rows (PostgreSQL)

-- DELETE
DELETE FROM users
WHERE last_login < NOW() - INTERVAL '2 years'
    AND is_active = false
RETURNING id, username;  -- Return deleted rows
```

---

## Joins

```sql
-- INNER JOIN: only matching rows from both tables
SELECT u.username, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: all from left, matching from right (NULL if no match)
SELECT u.username, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- RIGHT JOIN: all from right (rarely used, prefer LEFT JOIN)

-- FULL OUTER JOIN: all from both tables
SELECT u.username, o.id
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;

-- CROSS JOIN: Cartesian product (all combinations)
SELECT colors.name, sizes.name
FROM colors CROSS JOIN sizes;

-- Self join (hierarchical data)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Multi-table joins
SELECT u.username, p.name as product, o.quantity
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed';
```

---

## Aggregations & Window Functions

### GROUP BY & Aggregates
```sql
-- Basic aggregation
SELECT
    category,
    COUNT(*) as total,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY category
HAVING COUNT(*) > 100    -- Filter AFTER grouping (WHERE is before)
ORDER BY total_amount DESC;

-- GROUP BY with ROLLUP (adds subtotals)
SELECT category, subcategory, SUM(amount)
FROM sales
GROUP BY ROLLUP(category, subcategory);

-- GROUPING SETS (multiple group by at once)
SELECT category, region, SUM(amount)
FROM sales
GROUP BY GROUPING SETS ((category), (region), ());
```

### Window Functions (Analytic Functions)
```sql
-- Row number per group
SELECT
    user_id,
    order_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as order_num
FROM orders;

-- Running total
SELECT
    date,
    daily_revenue,
    SUM(daily_revenue) OVER (ORDER BY date) as cumulative_revenue,
    SUM(daily_revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day
FROM daily_stats;

-- Rank functions
SELECT
    user_id,
    score,
    RANK() OVER (ORDER BY score DESC) as rank,       -- Gaps for ties
    DENSE_RANK() OVER (ORDER BY score DESC) as dense, -- No gaps
    NTILE(4) OVER (ORDER BY score DESC) as quartile
FROM leaderboard;

-- LAG/LEAD (access adjacent rows)
SELECT
    date,
    revenue,
    LAG(revenue) OVER (ORDER BY date) as prev_revenue,
    LEAD(revenue) OVER (ORDER BY date) as next_revenue,
    revenue - LAG(revenue) OVER (ORDER BY date) as day_over_day
FROM daily_stats;

-- First/Last value
SELECT
    user_id,
    order_id,
    FIRST_VALUE(order_id) OVER (PARTITION BY user_id ORDER BY created_at) as first_order,
    LAST_VALUE(order_id) OVER (PARTITION BY user_id ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_order
FROM orders;

-- Frame specs:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (default for SUM)
-- ROWS BETWEEN N PRECEDING AND CURRENT ROW
-- RANGE BETWEEN INTERVAL '1 day' PRECEDING AND CURRENT ROW
```

---

## CTEs (Common Table Expressions)

```sql
-- Basic CTE
WITH active_users AS (
    SELECT id, username FROM users WHERE is_active = true
),
recent_orders AS (
    SELECT user_id, SUM(amount) as total
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT u.username, COALESCE(o.total, 0) as monthly_spend
FROM active_users u
LEFT JOIN recent_orders o ON u.id = o.user_id
ORDER BY monthly_spend DESC;

-- Recursive CTE (hierarchical data, graph traversal)
WITH RECURSIVE category_tree AS (
    -- Base case
    SELECT id, name, parent_id, 0 AS depth, name::TEXT AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case
    SELECT c.id, c.name, c.parent_id, ct.depth + 1, (ct.path || ' > ' || c.name)
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 10  -- Prevent infinite loops
)
SELECT * FROM category_tree ORDER BY path;

-- Finding all ancestors
WITH RECURSIVE ancestors AS (
    SELECT id, parent_id, name
    FROM categories
    WHERE id = 42  -- Starting node

    UNION ALL

    SELECT c.id, c.parent_id, c.name
    FROM categories c
    JOIN ancestors a ON c.id = a.parent_id
)
SELECT * FROM ancestors;
```

---

## Subqueries

```sql
-- Scalar subquery (returns single value)
SELECT username,
       (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;

-- IN subquery
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- NOT IN (careful: returns false if subquery contains NULL)
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders WHERE total > 1000);
-- Safer: use NOT EXISTS

-- EXISTS
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id AND o.total > 1000
);

-- Correlated subquery (references outer query — runs per row)
SELECT * FROM products p
WHERE price > (
    SELECT AVG(price) FROM products WHERE category = p.category
);

-- Derived table (subquery in FROM)
SELECT dept, avg_salary FROM (
    SELECT department as dept, AVG(salary) as avg_salary
    FROM employees
    GROUP BY department
) dept_stats
WHERE avg_salary > 50000;
```

---

## Advanced SQL Features

### JSON in PostgreSQL
```sql
-- JSON types: json (text, re-parsed each access) vs jsonb (binary, indexed)
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL
);

INSERT INTO events (data) VALUES ('{"user_id": 1, "action": "login", "metadata": {"ip": "1.2.3.4"}}');

-- Access
SELECT data->>'user_id' as user_id FROM events;        -- Text value
SELECT data->'metadata' as metadata FROM events;        -- JSON value
SELECT data#>>'{metadata,ip}' FROM events;              -- Nested path

-- Filter
SELECT * FROM events WHERE data->>'action' = 'login';
SELECT * FROM events WHERE data @> '{"action": "login"}';  -- Contains

-- Update
UPDATE events SET data = jsonb_set(data, '{user_id}', '42');
UPDATE events SET data = data || '{"extra": true}';    -- Merge

-- JSON indexing
CREATE INDEX idx_events_data ON events USING GIN(data);
CREATE INDEX idx_events_action ON events ((data->>'action'));
```

### Full-Text Search
```sql
-- PostgreSQL FTS
ALTER TABLE articles ADD COLUMN tsv TSVECTOR;
UPDATE articles SET tsv = to_tsvector('english', title || ' ' || content);
CREATE INDEX articles_fts ON articles USING GIN(tsv);

-- Search
SELECT title FROM articles
WHERE tsv @@ to_tsquery('english', 'postgres & database')
ORDER BY ts_rank(tsv, to_tsquery('english', 'postgres & database')) DESC;

-- Trigger to keep tsv updated
CREATE TRIGGER articles_tsv_update
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION
        tsvector_update_trigger(tsv, 'pg_catalog.english', title, content);
```

### Partitioning
```sql
-- Range partitioning (PostgreSQL)
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT,
    amount DECIMAL,
    created_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- List partitioning
CREATE TABLE products PARTITION BY LIST (region);
CREATE TABLE products_us PARTITION OF products FOR VALUES IN ('us-east', 'us-west');
CREATE TABLE products_eu PARTITION OF products FOR VALUES IN ('eu-west', 'eu-central');
```

---

## Transactions & Locking

```sql
-- Transaction
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    -- Check balance
    DO $$
    BEGIN
        IF (SELECT balance FROM accounts WHERE id = 1) < 0 THEN
            RAISE EXCEPTION 'Insufficient funds';
        END IF;
    END $$;
COMMIT;
-- On error, ROLLBACK automatically

-- Savepoints
BEGIN;
    UPDATE ...;
    SAVEPOINT sp1;
    UPDATE ...;
    ROLLBACK TO SAVEPOINT sp1;  -- Undo back to savepoint
    UPDATE ...;
COMMIT;

-- Isolation levels
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- Default (PostgreSQL)
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Explicit locking
SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;         -- Lock rows
SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE NOWAIT;  -- Error if locked
SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE SKIP LOCKED;  -- Skip locked rows
SELECT * FROM products FOR SHARE;  -- Shared lock (allow others to read, not write)
```

---

## Query Performance & EXPLAIN

```sql
-- Basic explain
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';

-- With actual execution stats
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'alice@example.com';

-- Reading EXPLAIN output:
-- Seq Scan: full table scan — no index used (often bad for large tables)
-- Index Scan: index used to find rows, then fetch from table
-- Index Only Scan: all needed data in index (fastest)
-- Bitmap Heap Scan: use index to build bitmap, then fetch pages
-- Hash Join: build hash table of one side, probe with other
-- Nested Loop: for each row in outer, scan inner (good for small inner)
-- Merge Join: merge two pre-sorted inputs

-- Cost: (startup cost..total cost) rows=N width=N
-- Actual: (actual startup..total time) rows=N loops=N
-- Buffers: hit=N (from cache), read=N (from disk), dirtied=N, written=N
```

### Indexing Strategy
```sql
-- When to index:
-- 1. Columns in WHERE clauses
-- 2. Columns in JOIN conditions
-- 3. Columns in ORDER BY when using LIMIT
-- 4. Columns in GROUP BY

-- Partial index (reduces size, faster for common queries)
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;
CREATE INDEX idx_pending_orders ON orders(created_at) WHERE status = 'pending';

-- Composite index (order matters!)
-- For WHERE a = 1 AND b = 2: (a, b) or (b, a) both work
-- For WHERE a = 1 AND b > 2: (a, b) is optimal
-- For WHERE a = 1 ORDER BY b: (a, b) avoids sort
CREATE INDEX idx_user_orders ON orders(user_id, status, created_at DESC);

-- Expression index
CREATE INDEX idx_lower_email ON users(LOWER(email));
-- Now: WHERE LOWER(email) = 'alice@example.com' uses index

-- Include columns (covering index — PostgreSQL 11+)
CREATE INDEX idx_orders_user ON orders(user_id) INCLUDE (amount, status);
-- Now: SELECT amount, status FROM orders WHERE user_id = ? → Index Only Scan

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'orders'
ORDER BY n_distinct;

-- Find unused indexes
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## PostgreSQL-Specific Features

```sql
-- Arrays
CREATE TABLE tags_test (id INT, tags TEXT[]);
INSERT INTO tags_test VALUES (1, ARRAY['postgresql', 'database', 'sql']);
SELECT * FROM tags_test WHERE 'postgresql' = ANY(tags);
SELECT * FROM tags_test WHERE tags @> ARRAY['sql'];  -- Contains
SELECT array_length(tags, 1) FROM tags_test;
UPDATE tags_test SET tags = tags || ARRAY['new-tag'];  -- Append

-- Lateral joins (cross-apply equivalent)
SELECT u.username, recent.order_id
FROM users u
LEFT JOIN LATERAL (
    SELECT order_id, amount
    FROM orders
    WHERE user_id = u.id
    ORDER BY created_at DESC
    LIMIT 3
) recent ON true;

-- Generate series
SELECT * FROM generate_series('2024-01-01'::DATE, '2024-12-31'::DATE, '1 day');
SELECT * FROM generate_series(1, 100);

-- FILTER clause (selective aggregation)
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    SUM(amount) FILTER (WHERE status = 'completed') as completed_revenue
FROM orders;

-- Conditional aggregation (works in all DBs)
SELECT
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed
FROM orders;

-- Returning clause
UPDATE users SET is_active = false WHERE last_login < NOW() - INTERVAL '1 year'
RETURNING id, username, email;
```

---

## PostgreSQL Administration

```bash
# Connect
psql -h localhost -U postgres -d mydb
psql "postgresql://user:pass@host:5432/db"

# Common psql commands
\l          -- List databases
\c dbname   -- Connect to database
\dt         -- List tables
\d table    -- Describe table
\di         -- List indexes
\dv         -- List views
\df         -- List functions
\du         -- List roles
\x          -- Toggle expanded output
\timing     -- Show query execution time
\e          -- Open editor
\i file.sql -- Execute SQL file
\copy       -- Client-side copy (vs COPY which is server-side)
\q          -- Quit

# pg_dump/restore
pg_dump mydb > backup.sql
pg_dump -Fc mydb > backup.dump    # Custom format (faster restore)
pg_dump -Fd mydb -f backup_dir/   # Directory format

pg_restore -d mydb backup.dump
psql mydb < backup.sql

# Useful system queries
-- Active connections
SELECT pid, usename, application_name, state, query
FROM pg_stat_activity
WHERE state != 'idle';

-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Lock conflicts
SELECT pid, query, pg_blocking_pids(pid) as blocked_by
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- Kill query
SELECT pg_cancel_backend(pid);   -- Send SIGINT (cancel query)
SELECT pg_terminate_backend(pid); -- Send SIGTERM (terminate connection)

-- Slow queries (requires pg_stat_statements)
SELECT query, calls, total_exec_time/calls as avg_ms, rows
FROM pg_stat_statements
ORDER BY avg_ms DESC LIMIT 20;
```

---

*SQL is not just a query language — it's a way of thinking about data relationships. Master it and you'll move faster than any ORM.*
