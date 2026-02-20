# Cloud Fundamentals — AWS, GCP & Azure

> Cloud computing is the dominant deployment model for modern software. Understanding the core concepts and major providers is essential.

---

## Cloud Service Models

### IaaS (Infrastructure as a Service)
- Raw compute, storage, networking
- You manage: OS, runtime, apps, data
- Provider manages: virtualization, hardware, facilities
- Examples: EC2 (AWS), GCE (GCP), Azure VMs

### PaaS (Platform as a Service)
- Platform to build, run, deploy apps
- You manage: apps, data
- Provider manages: OS, middleware, runtime, infrastructure
- Examples: Heroku, Google App Engine, AWS Elastic Beanstalk

### SaaS (Software as a Service)
- Complete applications
- You manage: data, configuration
- Provider manages: everything else
- Examples: Gmail, Salesforce, Slack

### Serverless / FaaS
- Run code without managing servers
- Pay per invocation
- Auto-scales to zero
- Examples: Lambda (AWS), Cloud Functions (GCP), Azure Functions

---

## AWS (Amazon Web Services)

### Compute
```
EC2 (Elastic Compute Cloud):
- Virtual servers (instances)
- Types: General (m7i), Compute (c7i), Memory (r7i), Storage (i3), GPU (p4)
- Purchasing: On-Demand, Reserved (1-3yr), Spot (cheap, interruptible), Savings Plans
- Auto Scaling Groups: automatically add/remove instances

Lambda:
- Serverless functions
- Triggers: API Gateway, S3, DynamoDB, SQS, EventBridge, etc.
- Max execution: 15 minutes
- Languages: Python, Node.js, Java, Go, Ruby, .NET, custom runtime
- Cold starts: first invocation after period of inactivity

ECS (Elastic Container Service): Docker container orchestration (managed)
EKS (Elastic Kubernetes Service): Managed Kubernetes
Fargate: Serverless containers (no EC2 management)
```

### Storage
```
S3 (Simple Storage Service):
- Object storage: key-value (key=path, value=file)
- Virtually unlimited scale
- Storage classes:
  Standard → Standard-IA (Infrequent Access) → Glacier → Glacier Deep Archive
  Intelligent-Tiering: auto-move between classes
- Durability: 11 nines (99.999999999%)
- Versioning, lifecycle policies, replication
- Event notifications (Lambda, SQS, SNS triggers)

EBS (Elastic Block Store):
- Block storage for EC2 (like a virtual disk)
- Types: gp3 (general), io2 (high IOPS), st1 (throughput), sc1 (cold)
- Multi-Attach: share between multiple instances (io2 only)

EFS (Elastic File System):
- Managed NFS (Network File System)
- Shared filesystem mounted to multiple EC2 instances
- Auto-scales

RDS (Relational Database Service):
- Managed MySQL, PostgreSQL, Oracle, SQL Server, MariaDB
- Multi-AZ: standby replica in different AZ for HA
- Read Replicas: scale reads
- Aurora: AWS-built, compatible with MySQL/PostgreSQL, faster, cheaper storage

DynamoDB:
- Managed NoSQL (key-value + document)
- Single-digit millisecond latency
- Auto-scales throughput and storage
- Global Tables: multi-region active-active
- DynamoDB Streams: CDC events
```

### Networking
```
VPC (Virtual Private Cloud):
- Your own isolated network in AWS
- CIDR block: e.g., 10.0.0.0/16

Subnets:
- Public subnet: has route to Internet Gateway (publicly accessible)
- Private subnet: only internal access (use NAT Gateway for outbound)

Route Tables: Rules for routing traffic
Internet Gateway (IGW): Connect VPC to internet
NAT Gateway: Allow private subnets to reach internet (outbound only)

Security Groups: Stateful firewall (instance-level)
- Inbound + outbound rules
- Rules by IP, port, protocol, or other security groups

NACLs (Network ACLs): Stateless (subnet-level)
- Explicit allow AND deny
- Rule processing: lowest number first

VPC Peering: Private network connection between VPCs
AWS Transit Gateway: Hub for connecting multiple VPCs
VPN / Direct Connect: Connect on-premises to AWS

Route 53: DNS service
  - Public/private hosted zones
  - Routing policies: Simple, Weighted, Latency, Failover, Geolocation

CloudFront: CDN
  - Edge locations worldwide
  - Cache S3, ALB, API Gateway
  - Lambda@Edge for server-side code at edge

Elastic Load Balancing:
  ALB (Application Load Balancer): L7, HTTP/HTTPS, path-based routing
  NLB (Network Load Balancer): L4, TCP/UDP, ultra-high performance
  CLB (Classic): deprecated
```

### Messaging & Queuing
```
SQS (Simple Queue Service):
  Standard: at-least-once, unordered
  FIFO: exactly-once, ordered
  Visibility timeout: message hidden while being processed
  Dead Letter Queue (DLQ): failed messages after N retries

SNS (Simple Notification Service):
  Pub/Sub: topic → multiple subscribers
  Fanout: one message → SQS queues, Lambda, email, HTTP

EventBridge:
  Event bus (was CloudWatch Events)
  Event rules: pattern matching → targets
  Schema registry
  Scheduled events (cron)

Kinesis Data Streams:
  Real-time data streaming
  Shards: unit of throughput (1 MB/s in, 2 MB/s out)
  24hr to 7 day retention
  Consumer types: shared or enhanced fan-out
```

### Identity & Security
```
IAM (Identity and Access Management):
  Users, Groups, Roles, Policies
  Principle of least privilege
  Trust policies (who can assume the role)
  Identity policies (what can the role do)

  IRSA (IAM Roles for Service Accounts): IAM roles for K8s pods
  EC2 Instance Profiles: IAM roles for EC2 instances

IAM Policy example:
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "StringEquals": {"s3:ExistingObjectTag/env": "production"}
    }
  }]
}

Secrets Manager: Store secrets with rotation
Parameter Store: Config + secrets, cheaper than SM
KMS (Key Management Service): Encryption key management
CloudTrail: Audit log of all API calls
GuardDuty: Threat detection (ML-based)
Config: Resource configuration compliance
```

### Developer Tools
```
CloudFormation: Infrastructure as Code (JSON/YAML)
CDK (Cloud Development Kit): IaC in TypeScript/Python/Java/etc.
SAM (Serverless Application Model): Lambda-specific IaC

CodePipeline: CI/CD pipeline
CodeBuild: Build service
CodeDeploy: Deployment service

CloudWatch:
  Metrics: resource + application metrics
  Logs: centralized log storage + search
  Alarms: trigger actions on metric thresholds
  Insights: log analytics (query language)
  Container Insights: ECS/EKS monitoring

X-Ray: Distributed tracing
```

---

## GCP (Google Cloud Platform)

### Compute
```
Compute Engine: VMs (equivalent to EC2)
  Machine types: E2 (shared), N2/N2D (balanced), C2 (compute), M2 (memory)
  Preemptible/Spot VMs: cheap, short-lived

Cloud Run: Serverless containers (runs any Docker image)
  Scale to zero, pay per request
  Best for: HTTP-based services

Cloud Functions: Serverless functions (Python, Node, Go, Java, Ruby)

GKE (Google Kubernetes Engine): Managed Kubernetes
  Autopilot mode: fully managed nodes
  Standard mode: configure your own nodes
```

### Storage & Databases
```
Cloud Storage (GCS): Object storage (equivalent to S3)
  Storage classes: Standard, Nearline, Coldline, Archive

Persistent Disk: Block storage for Compute Engine

Cloud SQL: Managed MySQL, PostgreSQL, SQL Server
Cloud Spanner: Globally distributed relational DB (NewSQL)
  - SQL semantics + horizontal scaling + strong consistency
  - External consistency (linearizability)
  - Used for: global financial systems

Firestore: Managed NoSQL document database
  - Realtime sync
  - Offline support

Bigtable: HBase-compatible wide-column store
  - Single-digit ms latency
  - Scales to petabytes
  - Time-series, IoT, AdTech

BigQuery: Serverless data warehouse
  - Petabyte scale
  - ANSI SQL
  - Serverless: no cluster management
  - Pay per query or flat-rate
  - Columnar storage (Dremel)
  - Streaming inserts for real-time
```

### Networking
```
VPC: Global (single VPC spans all regions)
Cloud Load Balancing: Global, any anycast IP
Cloud CDN: CDN built on GCP's global network
Cloud Armor: DDoS protection + WAF
Cloud Interconnect / VPN: Connect on-premises
Cloud DNS: Managed DNS
```

### AI/ML Services
```
Vertex AI: Unified ML platform
  - AutoML: no-code ML
  - Custom training: full control
  - Vertex AI Pipelines: MLOps
  - Model Registry
  - Feature Store

Pre-trained APIs:
  Vision AI, Natural Language AI, Translation,
  Speech-to-Text, Text-to-Speech, Document AI

Generative AI:
  Gemini models via Vertex AI
  Google AI Studio
```

---

## Multi-Cloud & Cloud-Agnostic Concepts

### Regions & Availability Zones
```
Region: Geographic area (us-east-1, europe-west1, ap-southeast-1)
  - Low latency to users in that geography
  - Data residency compliance

Availability Zone (AZ): Isolated data centers within a region
  - Multiple power, cooling, networking
  - Design for AZ failure: deploy across 2+ AZs

Edge Location: CDN cache node, closer to users
```

### High Availability Architecture
```
Multi-AZ for databases: Synchronous replication to standby
Read replicas: Async replication for read scaling
Active-Active: Multiple regions serve traffic
Active-Passive: Primary + standby failover

RTO (Recovery Time Objective): Max acceptable downtime
RPO (Recovery Point Objective): Max acceptable data loss
```

### Cost Optimization
```
Right-sizing: Match instance size to actual usage
Reserved/Committed use: 1-3 year commitment for 30-60% discount
Spot/Preemptible: 70-90% discount for interruptible workloads
Auto-scaling: Don't pay for idle capacity
S3 lifecycle: Move old data to cheaper storage classes
NAT Gateway: Can be expensive for heavy egress (consider PrivateLink)

Cost monitoring tools:
AWS: Cost Explorer, Budgets, Trusted Advisor
GCP: Billing reports, Cost recommendations
Tools: Infracost, CloudHealth, Spot.io
```

### Infrastructure as Code
```
Terraform (HashiCorp, provider-agnostic):
  - HCL language
  - State management (remote state in S3/GCS)
  - Plan → Apply workflow
  - Providers for AWS, GCP, Azure, GitHub, Kubernetes...

Pulumi (code-based IaC):
  - TypeScript, Python, Go, Java, .NET
  - Real programming language (loops, functions, classes)
  - Same concepts as Terraform

CDK (AWS-specific):
  - TypeScript, Python, Java, .NET
  - Generates CloudFormation underneath

OpenTofu: Open-source Terraform fork (after HashiCorp license change)
```

---

## AWS CLI Reference

```bash
# Configure
aws configure
aws configure --profile production
export AWS_PROFILE=production

# EC2
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' --output table
aws ec2 start-instances --instance-ids i-1234567890abcdef0
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# S3
aws s3 ls s3://my-bucket/
aws s3 cp local-file.txt s3://my-bucket/
aws s3 sync ./local-dir s3://my-bucket/prefix/ --delete
aws s3 presign s3://my-bucket/file.txt --expires-in 3600

# Lambda
aws lambda invoke --function-name my-function output.json
aws lambda update-function-code --function-name my-function --zip-file fileb://function.zip
aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime]' --output table

# CloudWatch Logs
aws logs get-log-events --log-group-name /aws/lambda/my-function --log-stream-name STREAM
aws logs tail /aws/lambda/my-function --follow

# Systems Manager (SSM) — secure shell without SSH ports
aws ssm start-session --target i-1234567890abcdef0

# ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com
aws ecr create-repository --repository-name my-app
```

---

*Cloud is just someone else's computer — until you understand the trade-offs, latencies, failure modes, and economics. Then it's a precision tool.*
