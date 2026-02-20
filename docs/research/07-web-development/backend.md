# Backend Engineering — Complete Reference

> Backend engineering is where business logic lives. It's about correctness, performance, and reliability at scale.

---

## HTTP Deep Dive

### HTTP/1.1 → HTTP/2 → HTTP/3

**HTTP/1.1 Problems:**
- Head-of-line blocking: requests queued on single TCP connection
- Only 1 request per connection at a time
- Workaround: multiple TCP connections (6-8 per origin)

**HTTP/2 Improvements:**
- Binary framing layer (vs text-based HTTP/1.1)
- **Multiplexing**: multiple streams over single TCP connection
- **Header compression** (HPACK): reduces header overhead
- **Server Push**: server can send resources before requested
- **Stream prioritization**

**HTTP/2 Problems:**
- TCP head-of-line blocking: single lost packet blocks ALL streams

**HTTP/3 (QUIC):**
- Built on UDP with QUIC (Google)
- Per-stream flow control: packet loss only blocks its stream
- 0-RTT connection establishment
- Connection migration (IP change doesn't break connection)
- TLS 1.3 integrated

### HTTP Methods
```
GET     — Retrieve resource. Safe + idempotent. No body.
POST    — Create resource or trigger action. Not idempotent.
PUT     — Replace resource entirely. Idempotent.
PATCH   — Partial update. Idempotent (if designed right).
DELETE  — Remove resource. Idempotent.
HEAD    — GET without body (check existence/headers).
OPTIONS — Get supported methods (CORS preflight).
CONNECT — Establish tunnel (used for HTTPS through proxy).
TRACE   — Echo request (diagnostic, usually disabled).
```

### HTTP Status Codes
```
1xx Informational
  100 Continue, 101 Switching Protocols, 102 Processing

2xx Success
  200 OK
  201 Created (POST/PUT that creates resource)
  202 Accepted (async processing)
  204 No Content (DELETE, PUT with no response body)
  206 Partial Content (Range requests)

3xx Redirection
  301 Moved Permanently (update bookmarks, cacheable)
  302 Found (temporary redirect)
  304 Not Modified (conditional GET, use cached version)
  307 Temporary Redirect (preserves HTTP method)
  308 Permanent Redirect (preserves HTTP method)

4xx Client Errors
  400 Bad Request (invalid syntax, validation error)
  401 Unauthorized (not authenticated — poor naming)
  403 Forbidden (authenticated but not authorized)
  404 Not Found
  405 Method Not Allowed
  409 Conflict (duplicate resource, optimistic lock)
  410 Gone (permanently deleted, unlike 404)
  422 Unprocessable Entity (validation error, semantic issue)
  429 Too Many Requests (rate limit)

5xx Server Errors
  500 Internal Server Error (generic crash)
  502 Bad Gateway (upstream server error)
  503 Service Unavailable (overloaded/maintenance)
  504 Gateway Timeout (upstream timeout)
```

### HTTP Headers Reference
```
Request headers:
  Authorization: Bearer token
  Content-Type: application/json
  Accept: application/json
  Accept-Encoding: gzip, deflate, br
  Accept-Language: en-US,en;q=0.9
  User-Agent: Mozilla/5.0...
  Cookie: session=abc123
  Origin: https://myapp.com
  X-Request-ID: uuid (correlation ID)
  If-Modified-Since: Wed, 01 Jan 2024 00:00:00 GMT
  If-None-Match: "etag-value"
  Range: bytes=0-1023

Response headers:
  Content-Type: application/json; charset=utf-8
  Content-Length: 1234
  Content-Encoding: gzip
  Cache-Control: public, max-age=3600
  ETag: "abc123"
  Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT
  Location: /users/123 (after 201/redirect)
  Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  Access-Control-Allow-Origin: https://myapp.com (CORS)
  Retry-After: 60 (with 429 or 503)
```

---

## REST API Design

### Resource Naming
```
# Use nouns, not verbs (actions come from HTTP method)
✓ GET /articles           — list articles
✓ POST /articles          — create article
✓ GET /articles/123       — get article 123
✓ PUT /articles/123       — replace article 123
✓ PATCH /articles/123     — partially update
✓ DELETE /articles/123    — delete

# Nested resources (relationships)
✓ GET /users/123/orders       — user's orders
✓ POST /users/123/orders      — create order for user
✓ GET /users/123/orders/456   — specific order for user

# Actions as sub-resources
✓ POST /articles/123/publish  — publish action
✓ POST /orders/456/cancel

# Query parameters for filtering/sorting/pagination
GET /articles?status=published&author=alice&sort=-created_at&page=2&limit=25

# Versioning
GET /api/v1/articles  — URL versioning (most visible, easy to route)
Accept: application/vnd.myapi.v1+json  — Content-type versioning
X-API-Version: 1  — Header versioning
```

### Response Format
```json
{
  "data": {
    "id": "123",
    "type": "article",
    "attributes": {
      "title": "Hello World",
      "status": "published"
    }
  },
  "meta": {
    "page": 1,
    "total": 42,
    "per_page": 10
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {"field": "email", "message": "Invalid email format"},
      {"field": "age", "message": "Must be >= 18"}
    ]
  },
  "request_id": "uuid-here"
}
```

---

## API Security

### Authentication Patterns

#### API Keys
```
# Simple, good for server-to-server
Authorization: Bearer sk_live_abc123...
X-API-Key: sk_live_abc123...

# Store hashed (SHA-256) in DB, compare hash on request
# Include key prefix for identification
```

#### JWT Best Practices
```python
import jwt
from datetime import datetime, timedelta

# Sign with strong secret or RS256/ES256
ACCESS_TOKEN_EXPIRY = 15  # minutes
REFRESH_TOKEN_EXPIRY = 7  # days

def create_tokens(user_id: str) -> dict:
    access_payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRY),
        "type": "access"
    }
    refresh_payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRY),
        "type": "refresh"
    }
    return {
        "access_token": jwt.encode(access_payload, SECRET_KEY, algorithm="HS256"),
        "refresh_token": jwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")
    }
```

### Rate Limiting Implementation
```python
import time
import redis

redis_client = redis.Redis()

def is_rate_limited(identifier: str, limit: int, window: int) -> bool:
    """
    Sliding window rate limiter.
    identifier: user_id, IP, API key, etc.
    limit: max requests
    window: time window in seconds
    """
    key = f"rate:{identifier}"
    now = time.time()
    pipe = redis_client.pipeline()

    # Remove old entries
    pipe.zremrangebyscore(key, 0, now - window)
    # Count current window
    pipe.zcard(key)
    # Add current request
    pipe.zadd(key, {str(now): now})
    # Expire key
    pipe.expire(key, window)

    results = pipe.execute()
    count = results[1]
    return count >= limit
```

---

## Web Servers & Proxies

### Nginx Configuration
```nginx
user nginx;
worker_processes auto;        # One per CPU core
worker_rlimit_nofile 65535;   # Max open files per worker

events {
    worker_connections 4096;
    use epoll;                # Efficient on Linux
    multi_accept on;          # Accept multiple connections per wakeup
}

http {
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time';
    access_log /var/log/nginx/access.log main buffer=16k;

    # Performance
    sendfile on;              # Zero-copy file transfer
    tcp_nopush on;            # Optimize TCP for large files
    tcp_nodelay on;           # Minimize latency for small packets
    keepalive_timeout 65;     # Keep connections open
    keepalive_requests 1000;  # Max requests per connection
    gzip on;
    gzip_types text/html text/css application/javascript application/json;
    gzip_min_length 1024;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000";

    # Upstream (load balanced)
    upstream backend {
        least_conn;
        server 10.0.0.1:3000 weight=3;
        server 10.0.0.2:3000 weight=2;
        server 10.0.0.3:3000 backup;    # Only if others fail
        keepalive 32;                    # Keep connections to upstream
    }

    # SSL termination
    server {
        listen 80;
        server_name example.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name example.com;

        ssl_certificate     /etc/ssl/certs/example.crt;
        ssl_certificate_key /etc/ssl/private/example.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_session_cache shared:SSL:10m;
        ssl_stapling on;

        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 30s;
            proxy_connect_timeout 5s;
        }

        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location / {
            proxy_pass http://frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;  # WebSocket support
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## Caching

### Redis Patterns
```python
import redis
import json
from functools import wraps

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Cache-aside pattern
def get_user(user_id: str) -> dict:
    cache_key = f"user:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    r.setex(cache_key, 300, json.dumps(user))  # 5 min TTL
    return user

# Decorator
def cache(key_fn, ttl=300):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            cached = r.get(key)
            if cached:
                return json.loads(cached)
            result = fn(*args, **kwargs)
            r.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache(lambda user_id: f"user:{user_id}", ttl=600)
def get_user_profile(user_id: str) -> dict:
    return db.fetch_user(user_id)

# Atomic increment (rate limiting, counters)
count = r.incr(f"pageviews:{date}")
r.expire(f"pageviews:{date}", 86400)

# Pub/Sub
pubsub = r.pubsub()
pubsub.subscribe('notifications')
r.publish('notifications', json.dumps({"event": "new_order", "id": 123}))

# Sorted sets (leaderboards, rate limiting)
r.zadd("leaderboard", {"alice": 1500, "bob": 1200, "carol": 1800})
r.zrevrange("leaderboard", 0, 9, withscores=True)  # Top 10

# Distributed lock
def acquire_lock(name: str, timeout: int = 30) -> str | None:
    token = str(uuid.uuid4())
    acquired = r.set(f"lock:{name}", token, nx=True, ex=timeout)
    return token if acquired else None

def release_lock(name: str, token: str) -> bool:
    # Lua script for atomic check-and-delete
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return bool(r.eval(script, 1, f"lock:{name}", token))
```

---

## Background Jobs & Task Queues

### Architecture
```
API Server → Queue → Workers
           (Redis/   (celery/
           RabbitMQ) sidekiq/etc.)

Use cases:
- Email sending (slow, external dependency)
- Image processing
- PDF generation
- Webhook delivery
- Report generation
- Data sync
```

### Celery (Python)
```python
# tasks.py
from celery import Celery
app = Celery('myapp', broker='redis://localhost/0')

@app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # 60 seconds
    autoretry_for=(ConnectionError, Timeout),
    retry_backoff=True,      # Exponential backoff
    retry_backoff_max=600    # Max 10 min between retries
)
def send_email(self, user_id: int, template: str):
    try:
        user = User.get(user_id)
        email_service.send(user.email, template)
    except SomeTransientError as exc:
        raise self.retry(exc=exc)

@app.task
def process_image(image_id: int):
    image = Image.get(image_id)
    thumbnail = make_thumbnail(image.path)
    image.thumbnail_path = thumbnail
    image.save()

# Chain, chord, group
from celery import chain, chord, group

# Sequential tasks
chain(download_file.s(url), process_file.s(), upload_result.s())()

# Parallel tasks + callback
chord(group(process_chunk.s(c) for c in chunks))(merge_results.s())

# Run
send_email.delay(user_id=123, template='welcome')
send_email.apply_async(
    args=[123, 'welcome'],
    countdown=60,        # Run in 60 seconds
    eta=datetime(...)    # Run at specific time
)
```

---

## WebSockets

```python
# FastAPI WebSocket
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(room, []).append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        self.active_connections[room].remove(websocket)

    async def broadcast(self, room: str, message: dict):
        for ws in self.active_connections.get(room, []):
            await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    await manager.connect(room, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(room, {"user": "someone", "message": data})
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)
```

---

## Observability

### Structured Logging
```python
import logging
import json
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar('request_id', default='')

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "request_id": request_id_var.get(),
            "logger": record.name,
        }
        if record.exc_info:
            log["exception"] = self.formatException(record.exc_info)
        return json.dumps(log)

# Middleware to set request ID
async def logging_middleware(request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    token = request_id_var.set(request_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        request_id_var.reset(token)
```

### Metrics (Prometheus)
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests',
    ['method', 'endpoint', 'status'])

REQUEST_LATENCY = Histogram('http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0])

ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')

# Usage
REQUEST_COUNT.labels(method='GET', endpoint='/api/users', status=200).inc()
with REQUEST_LATENCY.labels(method='GET', endpoint='/api/users').time():
    result = handle_request()

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

---

## Production Checklist

```
API Design:
□ Consistent error format with codes
□ Request ID propagation
□ API versioning
□ Pagination on list endpoints
□ Input validation with clear error messages

Security:
□ Authentication on all non-public endpoints
□ Authorization checks (don't just authenticate)
□ Input sanitization
□ SQL injection prevention (parameterized queries)
□ Rate limiting
□ HTTPS only
□ Secrets in environment variables, not code

Performance:
□ Database indexes for common queries
□ Connection pooling configured
□ Caching for expensive queries
□ N+1 query prevention
□ Async I/O where blocking

Reliability:
□ Health check endpoint (/health, /ready)
□ Graceful shutdown handling (SIGTERM)
□ Circuit breakers for external dependencies
□ Timeouts on all outbound calls
□ Retry with backoff

Observability:
□ Structured logging with request IDs
□ Request duration metrics
□ Error rate metrics
□ Dependencies metrics (DB query time, etc.)
□ Alerts on error rates and latency
```

---

*Backend engineering is 90% about handling failure gracefully. The happy path is the easy part.*
