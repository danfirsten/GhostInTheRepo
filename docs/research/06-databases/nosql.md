# NoSQL & Distributed Stores — Complete Reference

> Different data needs different databases. Choosing the wrong database is a decade-long regret.

---

## When to Use NoSQL

```
Use relational (PostgreSQL) for:
  → Complex queries, joins, aggregations
  → ACID transactions across multiple entities
  → Well-defined schema, structured data
  → Financial systems, inventory, HR

Use NoSQL when:
  → Massive scale (billions of records, thousands of writes/sec)
  → Flexible schema (data shape varies per record)
  → Specific access patterns (key lookups, time series, graphs)
  → Horizontal scaling is critical

Types:
  Document (MongoDB, Firestore)         — JSON documents, flexible schema
  Key-Value (Redis, DynamoDB)           — Ultra-fast lookups
  Wide-Column (Cassandra, Bigtable)     — Time series, high-write workloads
  Graph (Neo4j, Amazon Neptune)         — Relationship traversal
  Time Series (InfluxDB, TimescaleDB)   — Metrics, IoT, monitoring
  Search (Elasticsearch, OpenSearch)    — Full-text search, analytics
```

---

## MongoDB

### Core Concepts
```
Collection = Table
Document = Row (BSON — Binary JSON)
Field = Column (but each document can have different fields)
_id = Primary key (ObjectId by default)

ObjectId: 12 bytes
  4 bytes: timestamp
  5 bytes: random machine identifier
  3 bytes: incrementing counter
→ Approximately sortable by creation time
```

### CRUD Operations
```javascript
// MongoDB Shell / Node.js Driver

// Insert
db.users.insertOne({ name: "Alice", age: 30, tags: ["admin"] })
db.users.insertMany([
  { name: "Bob", age: 25 },
  { name: "Carol", age: 35, active: true }
])

// Find
db.users.find({})                            // All documents
db.users.find({ age: { $gt: 25 } })         // age > 25
db.users.findOne({ name: "Alice" })          // First match

// Comparison operators
$eq, $ne, $gt, $gte, $lt, $lte
$in: { age: { $in: [25, 30, 35] } }
$nin: { status: { $nin: ["inactive"] } }

// Logical operators
{ $and: [{ age: { $gt: 20 } }, { active: true }] }
{ $or:  [{ age: { $lt: 20 } }, { age: { $gt: 60 } }] }
{ $not: { age: { $eq: 25 } } }

// Array operators
{ tags: { $all: ["admin", "user"] } }        // Contains all
{ tags: { $elemMatch: { $gt: 10, $lt: 20 } } }
{ tags: { $size: 2 } }                       // Array length == 2

// Projection (field selection)
db.users.find({ active: true }, { name: 1, email: 1, _id: 0 })

// Sort, limit, skip
db.users.find({}).sort({ age: -1 }).limit(10).skip(20)

// Update
db.users.updateOne(
  { name: "Alice" },
  { $set: { age: 31, updatedAt: new Date() } }
)
db.users.updateMany({ active: false }, { $unset: { session: "" } })

// Update operators
$set, $unset, $inc, $mul, $rename, $min, $max
$push: { tags: { $each: ["moderator"] } }    // Add to array
$pull: { tags: "admin" }                     // Remove from array
$addToSet: { tags: "editor" }               // Add if not exists

// Upsert
db.users.updateOne(
  { email: "alice@example.com" },
  { $setOnInsert: { created: new Date() }, $set: { name: "Alice" } },
  { upsert: true }
)

// Delete
db.users.deleteOne({ _id: ObjectId("...") })
db.users.deleteMany({ active: false })
```

### Aggregation Pipeline
```javascript
db.orders.aggregate([
  // Stage 1: Filter
  { $match: { status: "completed", date: { $gte: new Date("2024-01-01") } } },

  // Stage 2: Add computed field
  { $addFields: {
    total: { $multiply: ["$price", "$quantity"] }
  }},

  // Stage 3: Group
  { $group: {
    _id: "$customerId",
    orderCount: { $sum: 1 },
    revenue: { $sum: "$total" },
    avgOrderValue: { $avg: "$total" }
  }},

  // Stage 4: Lookup (JOIN equivalent)
  { $lookup: {
    from: "customers",
    localField: "_id",
    foreignField: "_id",
    as: "customer"
  }},

  // Stage 5: Unwind array
  { $unwind: "$customer" },

  // Stage 6: Sort
  { $sort: { revenue: -1 } },

  // Stage 7: Limit
  { $limit: 10 },

  // Stage 8: Project final shape
  { $project: {
    _id: 0,
    customerId: "$_id",
    name: "$customer.name",
    orderCount: 1,
    revenue: 1
  }}
])
```

### Indexes
```javascript
// Single field
db.users.createIndex({ email: 1 })           // Ascending
db.users.createIndex({ email: 1 }, { unique: true })

// Compound
db.users.createIndex({ company: 1, name: 1 })

// Text index (full-text search)
db.articles.createIndex({ title: "text", body: "text" })
db.articles.find({ $text: { $search: "mongodb indexing" } })

// Wildcard
db.records.createIndex({ "metadata.$**": 1 })

// TTL (auto-expire documents)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

// Partial (index subset of documents)
db.users.createIndex({ age: 1 }, { partialFilterExpression: { active: true } })

// Explain query plan
db.users.find({ email: "alice@example.com" }).explain("executionStats")
// Look for: IXSCAN (good) vs COLLSCAN (bad)
```

### Schema Design Patterns
```javascript
// Embedding (denormalization) — good for "has-one" relationships
{
  _id: ObjectId,
  name: "Alice",
  address: {                     // Embedded document
    street: "123 Main St",
    city: "New York"
  },
  orders: [                      // Embedded array (if small, bounded)
    { orderId: "O1", total: 50 }
  ]
}

// Reference (normalization) — good for "has-many" or shared data
{
  _id: ObjectId,
  userId: ObjectId("..."),       // Reference to users collection
  productId: ObjectId("..."),    // Reference to products
  quantity: 2
}

// Bucket pattern (time series)
{
  device: "sensor-1",
  date: ISODate("2024-01-01"),
  measurements: [               // 1 hour of readings in one doc
    { ts: ISODate("..."), value: 23.5 },
    { ts: ISODate("..."), value: 23.7 }
  ],
  count: 60
}

// Computed pattern — cache expensive aggregations
{
  productId: "P1",
  name: "Widget",
  totalSales: 15234,            // Computed on write, avoid recalculating
  lastUpdated: ISODate("...")
}
```

---

## Redis

### Data Structures and Commands
```bash
# String (atomic, up to 512MB)
SET key value EX 3600         # Set with expiry (seconds)
GET key
GETSET key newvalue            # Get old, set new (atomic)
INCR counter                   # Atomic increment
INCRBY counter 5
MSET k1 v1 k2 v2              # Multi-set
MGET k1 k2                    # Multi-get

# List (linked list, O(1) push/pop from ends)
LPUSH list item1 item2         # Push to left (head)
RPUSH list item1 item2         # Push to right (tail)
LPOP list                      # Pop from left
RPOP list                      # Pop from right
LRANGE list 0 -1               # Get all elements
LLEN list                      # Length
BLPOP list 5                   # Blocking pop (5s timeout)

# Hash (key-value map within a key)
HSET user:1 name Alice age 30
HGET user:1 name
HGETALL user:1
HMSET user:1 name Alice age 30 email alice@example.com
HINCRBY user:1 age 1
HDEL user:1 email
HEXISTS user:1 name

# Set (unique, unordered)
SADD tags:post:1 golang redis nosql
SMEMBERS tags:post:1
SISMEMBER tags:post:1 redis    # Check membership
SCARD tags:post:1              # Cardinality
SUNION set1 set2               # Union
SINTER set1 set2               # Intersection
SDIFF set1 set2                # Difference

# Sorted Set (unique members with scores, ordered by score)
ZADD leaderboard 100 alice 200 bob 150 carol
ZRANGE leaderboard 0 -1 WITHSCORES    # Low to high
ZREVRANGE leaderboard 0 9 WITHSCORES  # High to low, top 10
ZRANK leaderboard alice               # Rank (0-indexed)
ZSCORE leaderboard alice              # Get score
ZINCRBY leaderboard 50 alice          # Increment score
ZRANGEBYSCORE leaderboard 100 200     # By score range

# HyperLogLog (approximate unique count)
PFADD visitors user1 user2 user3
PFCOUNT visitors              # Approximate unique count
PFMERGE total visitors-page1 visitors-page2

# Streams (append-only log)
XADD events * action click userid 123     # * = auto-generate ID
XREAD COUNT 10 STREAMS events 0           # Read from beginning
XREAD BLOCK 0 STREAMS events $            # Block waiting for new
XLEN events
```

### Redis Patterns
```python
import redis
import json
import time

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Cache-aside pattern
def get_user(user_id):
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)

    user = db.get_user(user_id)  # Database call
    r.setex(key, 3600, json.dumps(user))  # Cache 1 hour
    return user

# Rate limiting (sliding window)
def is_rate_limited(user_id, limit=100, window=60):
    key = f"rate:{user_id}"
    pipe = r.pipeline()
    now = time.time()
    pipe.zremrangebyscore(key, 0, now - window)  # Remove old entries
    pipe.zadd(key, {str(now): now})              # Add current request
    pipe.zcard(key)                               # Count requests
    pipe.expire(key, window)
    results = pipe.execute()
    return results[2] > limit

# Distributed lock
import uuid

def acquire_lock(name, timeout=10):
    lock_id = str(uuid.uuid4())
    # SET NX (only set if not exists) with expiry
    result = r.set(f"lock:{name}", lock_id, nx=True, ex=timeout)
    return lock_id if result else None

def release_lock(name, lock_id):
    # Lua script for atomic check-and-delete
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return r.eval(script, 1, f"lock:{name}", lock_id)

# Pub/Sub
# Publisher
r.publish("notifications", json.dumps({"type": "new_order", "id": 123}))

# Subscriber
pubsub = r.pubsub()
pubsub.subscribe("notifications")
for message in pubsub.listen():
    if message["type"] == "message":
        data = json.loads(message["data"])
        handle_notification(data)

# Job queue (simple)
def enqueue(queue, job):
    r.rpush(queue, json.dumps(job))

def dequeue(queue, timeout=0):
    result = r.blpop(queue, timeout=timeout)
    if result:
        return json.loads(result[1])
```

---

## Apache Cassandra

### Data Model
```
Cassandra is a wide-column store: think of it as a distributed sorted map.

Keyspace → Schema (like a database)
Table → Collection of rows
Primary Key: Partition Key + Clustering Columns

Partition Key: determines which node stores the data (hash)
Clustering Columns: sort order within a partition

Design philosophy: denormalize, query-first design
  → One table per query pattern
  → No joins
  → Reads are cheap, writes are cheap, but data modeling is hard
```

### CQL (Cassandra Query Language)
```sql
-- Create keyspace
CREATE KEYSPACE myapp
WITH REPLICATION = { 'class': 'NetworkTopologyStrategy', 'dc1': 3 };

-- Create table (design for query pattern: "get user's posts by date")
CREATE TABLE user_posts (
    user_id UUID,
    created_at TIMESTAMP,
    post_id UUID,
    title TEXT,
    content TEXT,
    tags SET<TEXT>,
    PRIMARY KEY (user_id, created_at, post_id)
) WITH CLUSTERING ORDER BY (created_at DESC, post_id ASC);

-- Partition key: user_id
-- Clustering: created_at DESC, post_id ASC

-- Insert
INSERT INTO user_posts (user_id, created_at, post_id, title)
VALUES (uuid(), toTimestamp(now()), uuid(), 'Hello World');

-- Query MUST include partition key
SELECT * FROM user_posts WHERE user_id = ?;
SELECT * FROM user_posts WHERE user_id = ? AND created_at > ?;
SELECT * FROM user_posts WHERE user_id = ? LIMIT 20;

-- ALLOW FILTERING (use sparingly — full scan)
SELECT * FROM user_posts WHERE title = 'Hello' ALLOW FILTERING;

-- TTL
INSERT INTO sessions (id, data) VALUES (?, ?) USING TTL 86400;

-- Counter
CREATE TABLE page_views (page_id TEXT PRIMARY KEY, views COUNTER);
UPDATE page_views SET views = views + 1 WHERE page_id = '/home';
```

### Cassandra Consistency
```
Replication factor = N copies of each row

Write consistency levels:
  ONE: 1 replica acknowledges
  QUORUM: majority (N/2+1) acknowledge
  ALL: all N replicas acknowledge
  LOCAL_QUORUM: quorum in local datacenter

Read consistency levels:
  ONE: read from 1 replica (fastest, may be stale)
  QUORUM: read from N/2+1 replicas (compare versions, return latest)
  ALL: read all replicas

Strong consistency: W + R > N
  N=3, W=QUORUM(2), R=QUORUM(2): 2+2 > 3 ✓
  N=3, W=ONE, R=ONE: 1+1 < 3 ✗ (eventual consistency)
```

---

## Elasticsearch

### Core Concepts
```
Index = Database (or Table in some contexts)
Document = Row (JSON)
Field = Column
Shard = Physical partition (default: 5 primary shards)
Replica = Copy of shard for HA and read scaling

Inverted index: maps terms → documents containing them
  Normal: document → words
  Inverted: word → documents that contain it
  → Enables O(1) full-text search
```

### Queries
```json
// GET /index/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "elasticsearch indexing" } }
      ],
      "filter": [
        { "term": { "status": "published" } },
        { "range": { "published_at": { "gte": "2024-01-01" } } }
      ],
      "should": [
        { "term": { "tags": "performance" } }
      ],
      "must_not": [
        { "term": { "status": "deleted" } }
      ]
    }
  },
  "highlight": {
    "fields": { "title": {}, "body": {} }
  },
  "sort": [
    { "_score": "desc" },
    { "published_at": "desc" }
  ],
  "from": 0,
  "size": 10,
  "_source": ["title", "author", "published_at"]
}
```

```bash
# Index a document
curl -X PUT localhost:9200/articles/_doc/1 -H 'Content-Type: application/json' -d '{
  "title": "Introduction to Elasticsearch",
  "author": "Alice",
  "published_at": "2024-01-01",
  "tags": ["search", "nosql"]
}'

# Search
curl localhost:9200/articles/_search?q=elasticsearch

# Aggregations (analytics)
curl -X POST localhost:9200/orders/_search -d '{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": { "field": "status" }
    },
    "revenue_per_day": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "total": { "sum": { "field": "amount" } }
      }
    }
  }
}'
```

---

## DynamoDB

### Key Design Principles
```
Single-table design: put all entities in ONE table
  → Avoid N+1 queries by co-locating related data
  → Model for your access patterns, not your entities

Primary Key:
  Simple: Partition Key (PK) only
  Composite: Partition Key + Sort Key (SK)

Secondary Indexes:
  GSI (Global Secondary Index): different PK+SK, different node
  LSI (Local Secondary Index): same PK, different SK, same node

Capacity:
  Provisioned: set read/write capacity units
  On-demand: pay per request, auto-scales
```

### Access Patterns → Table Design
```python
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('MyTable')

# Single-table design for a social app:
# Entity types stored in same table:
#   User:   PK=USER#123,         SK=PROFILE
#   Post:   PK=USER#123,         SK=POST#2024-01-01T12:00:00
#   Follow: PK=FOLLOWER#456,     SK=FOLLOWING#123
#   Like:   PK=POST#789,         SK=USER#123

# Put item
table.put_item(Item={
    'PK': 'USER#123',
    'SK': 'PROFILE',
    'name': 'Alice',
    'email': 'alice@example.com',
    'created_at': '2024-01-01'
})

# Get item (primary key lookup — O(1))
response = table.get_item(Key={'PK': 'USER#123', 'SK': 'PROFILE'})
user = response.get('Item')

# Query (all items with PK='USER#123', SK starts with 'POST#')
response = table.query(
    KeyConditionExpression='PK = :pk AND begins_with(SK, :sk_prefix)',
    ExpressionAttributeValues={
        ':pk': 'USER#123',
        ':sk_prefix': 'POST#'
    },
    ScanIndexForward=False,  # Newest first (reverse sort order)
    Limit=20
)
posts = response['Items']

# Update with condition
table.update_item(
    Key={'PK': 'USER#123', 'SK': 'PROFILE'},
    UpdateExpression='SET #name = :name, updated_at = :ts',
    ConditionExpression='attribute_exists(PK)',  # Only if exists
    ExpressionAttributeNames={'#name': 'name'},  # 'name' is reserved
    ExpressionAttributeValues={
        ':name': 'Alice Smith',
        ':ts': '2024-06-01'
    }
)

# Transactional write (up to 25 items, atomic)
dynamodb.meta.client.transact_write(
    TransactItems=[
        {'Put': {'TableName': 'MyTable', 'Item': {'PK': 'ORDER#1', 'SK': 'STATUS', 'status': 'processing'}}},
        {'Update': {
            'TableName': 'MyTable',
            'Key': {'PK': 'INVENTORY#product1', 'SK': 'COUNT'},
            'UpdateExpression': 'SET quantity = quantity - :n',
            'ConditionExpression': 'quantity >= :n',
            'ExpressionAttributeValues': {':n': 1}
        }}
    ]
)
```

---

## Choosing the Right Database

```
Question 1: What are your access patterns?
  → Key-value lookups: Redis, DynamoDB
  → Complex queries: PostgreSQL, Elasticsearch
  → Time series: InfluxDB, TimescaleDB
  → Relationships: Neo4j, PostgreSQL
  → Full-text search: Elasticsearch, Meilisearch

Question 2: What's your scale?
  → < 10M rows, moderate traffic: PostgreSQL
  → 100M+ rows, high write throughput: Cassandra, DynamoDB
  → Real-time hot data: Redis

Question 3: What's your consistency requirement?
  → Strong ACID: PostgreSQL
  → Eventual is OK: Cassandra, DynamoDB
  → Need distributed transactions: PostgreSQL (or Spanner/CockroachDB)

Question 4: What's your operational complexity budget?
  → Low: managed services (RDS, DynamoDB, Atlas)
  → High: self-managed clusters (more control, more ops work)

Common combinations:
  PostgreSQL + Redis          → Primary DB + cache/queue
  PostgreSQL + Elasticsearch  → Structured + full-text search
  DynamoDB + ElastiCache      → Serverless scale + cache
  Cassandra + Elasticsearch   → High-write + search
```

---

*The best database is the one that fits your access patterns. Learn them all — use the right tool.*
