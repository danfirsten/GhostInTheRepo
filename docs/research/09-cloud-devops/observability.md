# Observability — Complete Reference

> You can't fix what you can't see. Observability is the difference between "the site is down" and "the payments service has a 30% error rate on POST /checkout due to a timeout from the database pool being exhausted."

---

## The Three Pillars

```
Metrics: Numeric measurements over time
  → CPU: 82%, requests/sec: 1543, error rate: 0.3%
  → What is the system doing right now? How is it trending?
  → Good for: alerting, capacity planning, SLOs

Logs: Timestamped records of events
  → "2024-01-15T10:30:45Z ERROR payment failed user=usr_123 reason=card_declined"
  → What exactly happened? What was the context?
  → Good for: debugging, audit trails, root cause analysis

Traces: Request paths through distributed systems
  → Incoming request → spans: auth (12ms) + DB query (45ms) + downstream API (230ms)
  → Where is the latency? Which service is the bottleneck?
  → Good for: distributed debugging, performance optimization

Correlation is the key:
  Metrics show something is wrong →
  Logs show what happened →
  Traces show where it happened
```

---

## Metrics (Prometheus + Grafana)

### Prometheus Fundamentals
```
Pull model: Prometheus scrapes /metrics endpoint
Push model: via Pushgateway (for batch jobs)

Data model: {metric_name}{label=value, label=value} value timestamp

Metric types:
  Counter:   Monotonically increasing (requests_total, errors_total)
  Gauge:     Arbitrary value (memory_bytes, active_connections)
  Histogram: Sampled observations in buckets (request_duration_seconds)
  Summary:   Pre-computed quantiles (less flexible, prefer histograms)
```

### Instrumenting Code
```python
from prometheus_client import Counter, Gauge, Histogram, Info
from prometheus_client import start_http_server
import time

# Counters: total events (rate/increase queries)
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']  # Labels
)

http_errors_total = Counter(
    'http_errors_total',
    'Total HTTP errors',
    ['method', 'endpoint', 'error_type']
)

# Gauge: current state
active_users = Gauge('active_users', 'Currently active users')
queue_size = Gauge('job_queue_size', 'Jobs waiting in queue', ['queue_name'])

# Histogram: latency distribution
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=[.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10]
)

db_query_duration = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['operation', 'table']
)

# Usage in FastAPI middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    http_requests_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()

    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)

    return response

# Gauge context manager
with active_users.track_inprogress():
    handle_request()

# Histogram timer
with db_query_duration.labels(operation='select', table='users').time():
    users = db.query(User).all()
```

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'myapp'
    static_configs:
      - targets: ['app:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Kubernetes service discovery
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### PromQL (Prometheus Query Language)
```
# Rate of requests (per second, over 5m window)
rate(http_requests_total[5m])

# Error rate percentage
rate(http_requests_total{status_code=~"5.."}[5m])
  / rate(http_requests_total[5m]) * 100

# 99th percentile latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Latency by service
histogram_quantile(0.99,
  sum by (le, service) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)

# Average active connections across all instances
avg(active_connections)

# Sum of queue sizes
sum(job_queue_size) by (queue_name)

# CPU usage per container
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage percentage
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Increase over time (for counters)
increase(http_requests_total[1h])  # Total requests in last hour
```

### Alerting Rules
```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          (
            rate(http_requests_total{status_code=~"5.."}[5m])
            / rate(http_requests_total[5m])
          ) * 100 > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate: {{ $value }}%"
          description: "Error rate above 1% for 5 minutes on {{ $labels.instance }}"

      # Latency SLO violation
      - alert: HighLatencyP99
        expr: |
          histogram_quantile(0.99,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "P99 latency above 500ms: {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
```

---

## Logging

### Structured Logging
```python
import structlog
import logging
import sys
from contextvars import ContextVar

# Request ID context variable
request_id_var: ContextVar[str] = ContextVar('request_id', default='')

# Configure structlog
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,        # Add context vars
        structlog.processors.add_log_level,              # Add level
        structlog.processors.TimeStamper(fmt="iso"),     # ISO timestamp
        structlog.processors.StackInfoRenderer(),        # Stack traces
        structlog.processors.format_exc_info,            # Exceptions
        structlog.processors.JSONRenderer()              # JSON output
    ],
    wrapper_class=structlog.BoundLogger,
    logger_factory=structlog.PrintLoggerFactory(sys.stdout),
)

log = structlog.get_logger()

# FastAPI request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        user_id=request.state.user_id if hasattr(request.state, 'user_id') else None,
    )

    log.info("request_started")
    start = time.time()

    try:
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000
        log.info("request_completed",
                 status_code=response.status_code,
                 duration_ms=round(duration_ms, 2))
        return response
    except Exception as e:
        log.exception("request_failed", error=str(e))
        raise
    finally:
        structlog.contextvars.clear_contextvars()

# Application logging
async def process_payment(order_id: str, amount: Decimal):
    log.info("payment_processing", order_id=order_id, amount=str(amount))

    try:
        result = await payment_gateway.charge(order_id, amount)
        log.info("payment_success",
                 order_id=order_id,
                 transaction_id=result.transaction_id)
        return result
    except PaymentDeclined as e:
        log.warning("payment_declined",
                    order_id=order_id,
                    reason=e.reason,
                    amount=str(amount))
        raise
    except Exception as e:
        log.exception("payment_error", order_id=order_id)
        raise

# Output (JSON):
# {"timestamp": "2024-01-15T10:30:45Z", "level": "info", "event": "payment_success",
#  "request_id": "abc-123", "order_id": "ord-456", "transaction_id": "tx-789"}
```

### Log Aggregation (ELK Stack)
```yaml
# docker-compose.yml for ELK
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

```
# Logstash pipeline
input {
  beats { port => 5044 }
}

filter {
  json { source => "message" }
  date { match => ["timestamp", "ISO8601"] }
  mutate { remove_field => ["message", "@version"] }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

---

## Distributed Tracing (OpenTelemetry)

### Instrumentation
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
import httpx

# Setup
provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(
        OTLPSpanExporter(endpoint="http://jaeger:4317")
    )
)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Auto-instrument frameworks
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument(engine=engine)
RedisInstrumentor().instrument()

# Manual spans for custom operations
async def process_order(order_id: str):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        span.set_attribute("service.name", "order-service")

        # Child span for payment
        with tracer.start_as_current_span("charge_payment") as payment_span:
            result = await charge_payment(order_id)
            payment_span.set_attribute("payment.method", result.method)
            payment_span.set_attribute("payment.amount", float(result.amount))

        # Child span for fulfillment
        with tracer.start_as_current_span("trigger_fulfillment"):
            await trigger_fulfillment(order_id)

        span.set_attribute("order.status", "confirmed")
        return {"status": "confirmed"}

# Propagate trace context in HTTP calls
async def call_service(url: str, order_id: str):
    # OpenTelemetry automatically injects trace context headers
    async with httpx.AsyncClient() as client:
        return await client.get(url, params={"order_id": order_id})
```

### Jaeger Setup (Docker)
```yaml
# docker-compose.yml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # UI
      - "4317:4317"    # OTLP gRPC
      - "4318:4318"    # OTLP HTTP
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

---

## SLIs, SLOs, SLAs

### Definitions
```
SLI (Service Level Indicator):
  Metric that measures service behavior
  Examples:
    Request success rate = successful_requests / total_requests
    Latency = P99 request duration
    Availability = time_up / total_time

SLO (Service Level Objective):
  Target value for an SLI
  Examples:
    Success rate >= 99.9% over 30 days
    P99 latency < 200ms over 1 hour
    Availability >= 99.95% over 30 days

SLA (Service Level Agreement):
  Legal contract defining SLOs (with penalties)
  Typically more lenient than internal SLOs

Error budget:
  1 - SLO = allowed failures
  99.9% availability = 0.1% error budget
  = 43.8 minutes/month downtime allowed

  When error budget depleted:
    → Slow down feature releases
    → Focus on reliability work
```

### Alerting on SLOs (Multi-Window, Multi-Burn-Rate)
```yaml
# High-urgency: fast burn rate (1 hour burn-rate > 14x)
- alert: HighBurnRateHighUrgency
  expr: |
    (
      job:slo_requests_error_rate:ratio_rate1h > (14 * 0.001)
      and
      job:slo_requests_error_rate:ratio_rate5m > (14 * 0.001)
    )
  labels:
    severity: critical
    pagerduty: true

# Low-urgency: slow burn rate (6 hour burn-rate > 6x)
- alert: HighBurnRateLowUrgency
  expr: |
    (
      job:slo_requests_error_rate:ratio_rate6h > (6 * 0.001)
      and
      job:slo_requests_error_rate:ratio_rate30m > (6 * 0.001)
    )
  labels:
    severity: warning
    slack: true
```

---

## Dashboards (Grafana)

### Key Dashboards to Build
```
1. Service Overview:
   - Request rate (RPS)
   - Error rate (%)
   - Latency percentiles (P50, P95, P99)
   - Active instances
   - Error budget remaining

2. Infrastructure:
   - CPU/Memory/Disk per node
   - Network I/O
   - Kubernetes pod restarts
   - PVC usage

3. Database:
   - Connections (used/max)
   - Query latency
   - Slow queries
   - Replication lag
   - Cache hit rate

4. Business metrics:
   - Orders/minute
   - Revenue/hour
   - User signups
   - Checkout conversion rate

USE Method (Utilization, Saturation, Errors):
  For every resource: CPU, memory, disk, network
  → Utilization: % time resource is busy
  → Saturation: amount of queued work
  → Errors: error count

RED Method (Rate, Errors, Duration):
  For every service/endpoint
  → Rate: requests/second
  → Errors: failed requests/second
  → Duration: distribution of response times
```

---

*Observability isn't a feature — it's table stakes for production systems. You can't debug what you can't observe, and you can't improve what you don't measure.*
