# Data Engineering — Complete Reference

> Data engineering is the plumbing of the data world. Without good pipelines, analytics is guesswork and AI is impossible.

---

## Data Engineering Fundamentals

### The Modern Data Stack
```
Source Systems (OLTP):
  → Transactional databases (PostgreSQL, MySQL)
  → APIs (Stripe, Salesforce, HubSpot)
  → Event streams (Kafka, Kinesis)
  → Files (S3, SFTP)

Ingestion Layer:
  → Batch: Airbyte, Fivetran, Singer, custom scripts
  → Streaming: Kafka Connect, Debezium (CDC)

Storage Layer:
  → Data Lake: S3, GCS, Azure Blob (raw files: Parquet, Avro)
  → Data Warehouse: BigQuery, Snowflake, Redshift, DuckDB
  → Lakehouse: Delta Lake, Apache Iceberg (tables on object storage)

Transformation Layer:
  → dbt (SQL-based, version-controlled transforms)
  → Spark (large-scale distributed processing)
  → Python (pandas, Polars for small-medium data)

Serving Layer:
  → BI: Looker, Tableau, Metabase
  → Analytics API: semantic layer
  → ML features: feature store

Orchestration:
  → Apache Airflow, Prefect, Dagster, Mage
```

### Data Concepts
```
OLTP (Online Transactional Processing):
  Optimized for writes, normalized schema, row-oriented
  PostgreSQL, MySQL — your production databases

OLAP (Online Analytical Processing):
  Optimized for reads/aggregations, denormalized, column-oriented
  BigQuery, Snowflake, Redshift — your data warehouse

Star Schema:
  Fact table (measurements, events)
  Dimension tables (who, what, where, when)
  Example:
    fact_orders: order_id, user_id, product_id, date_id, amount, quantity
    dim_users: user_id, name, country, signup_date
    dim_products: product_id, name, category, price
    dim_date: date_id, date, day_of_week, month, quarter, year

Data Vault:
  Hub: unique business keys
  Link: relationships between hubs
  Satellite: descriptive attributes (with history)
  Good for: compliance, auditing, change tracking
```

---

## Apache Spark

### Core Concepts
```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import *
from pyspark.sql.window import Window

# Create session
spark = SparkSession.builder \
    .appName("DataPipeline") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

# Read data
df = spark.read \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .csv("s3://bucket/data/*.csv")

# Or with explicit schema (faster, no full scan)
schema = StructType([
    StructField("user_id", StringType(), nullable=False),
    StructField("event_type", StringType(), nullable=True),
    StructField("timestamp", TimestampType(), nullable=True),
    StructField("amount", DoubleType(), nullable=True),
])
df = spark.read.schema(schema).parquet("s3://bucket/events/")

# Transformations (lazy — nothing executes yet)
result = df \
    .filter(F.col("event_type") == "purchase") \
    .filter(F.col("amount") > 0) \
    .withColumn("date", F.to_date("timestamp")) \
    .groupBy("user_id", "date") \
    .agg(
        F.sum("amount").alias("daily_spend"),
        F.count("*").alias("purchase_count"),
        F.avg("amount").alias("avg_purchase")
    ) \
    .withColumn("spend_rank",
        F.rank().over(
            Window.partitionBy("date").orderBy(F.desc("daily_spend"))
        )
    ) \
    .filter(F.col("spend_rank") <= 100)  # Top 100 spenders per day

# Action — triggers execution
result.write \
    .mode("overwrite") \
    .partitionBy("date") \
    .parquet("s3://bucket/output/top_spenders/")

# Show plan
result.explain(mode="formatted")

# Useful operations
df.printSchema()
df.show(10, truncate=False)
df.describe().show()
df.count()
df.cache()         # Cache in memory for reuse
df.persist()       # With storage level control
df.unpersist()

# Join types
df1.join(df2, on="user_id", how="inner")
df1.join(df2, on="user_id", how="left")
df1.join(df2, df1.id == df2.user_id, how="left_outer")

# Broadcast join (for small lookup tables)
from pyspark.sql.functions import broadcast
big_df.join(broadcast(small_df), on="key")
```

### Streaming with Spark Structured Streaming
```python
# Read from Kafka
stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "events") \
    .option("startingOffsets", "latest") \
    .load()

# Parse JSON
from pyspark.sql.functions import from_json, col

schema = StructType([
    StructField("user_id", StringType()),
    StructField("event", StringType()),
    StructField("ts", LongType()),
])

events = stream \
    .select(from_json(col("value").cast("string"), schema).alias("data")) \
    .select("data.*") \
    .withColumn("timestamp", F.from_unixtime("ts"))

# Windowed aggregation
windowed = events \
    .withWatermark("timestamp", "10 minutes") \
    .groupBy(
        F.window("timestamp", "5 minutes"),
        "event"
    ) \
    .count()

# Write to sink
query = windowed.writeStream \
    .outputMode("update") \
    .format("parquet") \
    .option("path", "s3://bucket/streaming-output/") \
    .option("checkpointLocation", "s3://bucket/checkpoints/events/") \
    .trigger(processingTime="1 minute") \
    .start()

query.awaitTermination()
```

---

## dbt (Data Build Tool)

### Project Structure
```
dbt_project/
├── dbt_project.yml
├── profiles.yml
├── models/
│   ├── staging/          # 1:1 with source, light cleaning
│   │   ├── _sources.yml
│   │   ├── stg_orders.sql
│   │   └── stg_users.sql
│   ├── intermediate/     # Business logic, joins
│   │   └── int_order_items.sql
│   └── mart/             # Final analytical models
│       ├── fct_orders.sql
│       └── dim_users.sql
├── tests/
├── macros/
└── seeds/                # Small CSV reference data
```

### Models
```sql
-- models/staging/stg_orders.sql
-- Staging: clean up raw data, rename columns, cast types
{{ config(materialized='view') }}

with source as (
    select * from {{ source('production', 'orders') }}
),

cleaned as (
    select
        id::varchar as order_id,
        user_id::varchar as user_id,
        lower(trim(status)) as status,
        created_at::timestamp as created_at,
        cast(amount_cents as decimal(12,2)) / 100 as amount_usd,
        coalesce(discount_cents, 0)::decimal(12,2) / 100 as discount_usd
    from source
    where created_at is not null  -- Remove bad rows
      and id is not null
)

select * from cleaned
```

```sql
-- models/mart/fct_orders.sql
-- Fact table: one row per order
{{ config(
    materialized='incremental',
    unique_key='order_id',
    on_schema_change='append_new_columns',
    cluster_by=['created_date']
) }}

with orders as (
    select * from {{ ref('stg_orders') }}
    {% if is_incremental() %}
    -- Only process new records on incremental runs
    where created_at > (select max(created_at) from {{ this }})
    {% endif %}
),

users as (
    select * from {{ ref('dim_users') }}
),

final as (
    select
        o.order_id,
        o.user_id,
        u.user_name,
        u.country,
        o.status,
        o.created_at,
        date_trunc('day', o.created_at) as created_date,
        o.amount_usd,
        o.discount_usd,
        o.amount_usd - o.discount_usd as net_amount_usd,
        -- Window function for customer order sequence
        row_number() over (
            partition by o.user_id
            order by o.created_at
        ) as customer_order_number
    from orders o
    left join users u using (user_id)
)

select * from final
```

### Tests and Documentation
```yaml
# models/mart/schema.yml
version: 2

models:
  - name: fct_orders
    description: "One row per order with enriched user data"
    columns:
      - name: order_id
        description: "Unique order identifier"
        tests:
          - unique
          - not_null

      - name: status
        description: "Order status"
        tests:
          - not_null
          - accepted_values:
              values: ['pending', 'processing', 'completed', 'cancelled', 'refunded']

      - name: amount_usd
        description: "Order amount in USD"
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0"

      - name: user_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_users')
              field: user_id
```

```bash
# dbt commands
dbt run                        # Run all models
dbt run --select staging       # Run models in staging folder
dbt run --select fct_orders+   # fct_orders and all downstream
dbt run --select +fct_orders   # fct_orders and all upstream

dbt test                       # Run all tests
dbt test --select fct_orders

dbt docs generate              # Generate documentation
dbt docs serve                 # Serve documentation site

dbt seed                       # Load CSV seed files
dbt source freshness           # Check if sources are up to date

dbt run --full-refresh         # Rebuild incremental models from scratch
```

---

## Data Pipeline Orchestration (Airflow)

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.providers.amazon.aws.operators.glue import GlueJobOperator
from airflow.sensors.s3_key_sensor import S3KeySensor
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
    'email': ['data-alerts@company.com'],
    'sla': timedelta(hours=2),
}

with DAG(
    dag_id='daily_etl',
    default_args=default_args,
    description='Daily ETL pipeline for orders data',
    schedule='0 6 * * *',  # 6 AM daily
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['production', 'orders'],
) as dag:

    # Wait for upstream data
    wait_for_data = S3KeySensor(
        task_id='wait_for_s3_data',
        bucket_name='my-bucket',
        bucket_key='raw/orders/{{ ds }}/*.parquet',
        timeout=3600,
        poke_interval=60,
    )

    def extract_and_validate(**context):
        date = context['ds']
        df = read_s3_parquet(f"raw/orders/{date}/")
        assert len(df) > 0, f"No data for {date}"
        assert df['order_id'].is_unique, "Duplicate order IDs found"
        context['task_instance'].xcom_push(key='row_count', value=len(df))

    validate = PythonOperator(
        task_id='validate_raw_data',
        python_callable=extract_and_validate,
    )

    transform = GlueJobOperator(
        task_id='run_spark_transform',
        job_name='orders-transform',
        script_args={'--date': '{{ ds }}'},
    )

    load = PostgresOperator(
        task_id='load_to_warehouse',
        postgres_conn_id='warehouse',
        sql='sql/load_orders.sql',
        parameters={'date': '{{ ds }}'},
    )

    def notify_success(**context):
        rows = context['task_instance'].xcom_pull(task_ids='validate_raw_data', key='row_count')
        slack.send(f"Daily ETL completed: {rows:,} orders processed for {context['ds']}")

    notify = PythonOperator(
        task_id='notify_success',
        python_callable=notify_success,
    )

    wait_for_data >> validate >> transform >> load >> notify
```

---

## Data Quality

```python
from great_expectations.core import ExpectationSuite
import great_expectations as gx

# Define expectations
context = gx.get_context()
suite = context.add_expectation_suite("orders_suite")

validator = context.sources.pandas_default.read_dataframe(df, asset_name="orders")

validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_be_in_set("status",
    ["pending", "completed", "cancelled"])
validator.expect_column_values_to_be_between("amount_usd", 0, 100000)
validator.expect_column_pair_values_a_to_be_greater_than_b(
    "completed_at", "created_at")
validator.expect_table_row_count_to_be_between(1000, 1000000)

# Run validation
results = validator.validate()
if not results.success:
    raise DataQualityError(results.to_json_dict())
```

---

## File Formats

```
CSV:
  + Universal, human-readable, simple
  - Slow, no schema enforcement, large files, no nested types

JSON/JSONL:
  + Flexible, nested structures, human-readable
  - Slow, large files (verbose), no schema

Parquet (recommended for OLAP):
  + Columnar → fast aggregations, great compression
  + Schema enforcement
  + Predicate pushdown, column pruning
  + Native support in Spark, BigQuery, etc.
  - Not human-readable, binary

Avro:
  + Row-oriented → good for write-heavy, record streaming
  + Schema evolution support
  + Compact binary
  - Less columnar query performance

ORC:
  + Columnar like Parquet, good Hive/Presto support
  - Less popular than Parquet

Delta Lake / Apache Iceberg:
  + Parquet files + transaction log
  + ACID transactions on object storage
  + Time travel, schema evolution
  + Merge/upsert support
  Best choice for Lakehouse architecture
```

---

*Data engineering is invisible when done right. The business analyst runs a query in seconds, not hours. The ML model has clean features. The dashboard shows correct numbers. That's the work.*
