# Infrastructure as Code — Complete Reference

> Infrastructure should be treated like code: versioned, reviewed, tested, and automated. Manual infrastructure is a liability.

---

## Why Infrastructure as Code?

```
Problems with manual infrastructure:
  → "Works on my machine" (config drift)
  → Undocumented changes (who changed this?!)
  → Impossible to reproduce after disaster
  → Slow to scale (can't deploy 50 servers by hand)
  → Human error in production

IaC benefits:
  → Reproducible: same code = same infrastructure every time
  → Versionable: git history of every change
  → Reviewable: PRs for infrastructure changes
  → Testable: validate before applying
  → Automated: CI/CD for infrastructure
  → Auditable: who changed what when
```

---

## Terraform

### Core Concepts
```hcl
# main.tf
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state (critical for team use)
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"  # For state locking
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = "myapp"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

# Outputs
output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}
```

### Networking (VPC)
```hcl
# vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.environment}-vpc" }
}

# Public subnets (for load balancers, NAT gateways)
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = { Name = "${var.environment}-public-${count.index + 1}" }
}

# Private subnets (for app servers, databases)
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = { Name = "${var.environment}-private-${count.index + 1}" }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.environment}-igw" }
}

# NAT Gateway (one per AZ for HA)
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  depends_on    = [aws_internet_gateway.main]
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### Compute and Load Balancing
```hcl
# ec2.tf
# Security group
resource "aws_security_group" "app" {
  name   = "${var.environment}-app-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]  # Only from ALB
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch template (immutable AMI-based deployment)
resource "aws_launch_template" "app" {
  name_prefix   = "${var.environment}-app-"
  image_id      = data.aws_ami.app.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.app.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.app.name
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    /opt/myapp/start.sh
    EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "app" {
  name                      = "${var.environment}-app-asg"
  vpc_zone_identifier       = aws_subnet.private[*].id
  target_group_arns         = [aws_lb_target_group.app.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  min_size         = var.asg_min
  max_size         = var.asg_max
  desired_capacity = var.asg_desired

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-app"
    propagate_at_launch = true
  }
}

# Auto scaling policies
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    enabled = true
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

### Database (RDS)
```hcl
# rds.tf
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  identifier = "${var.environment}-postgres"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = 100
  max_allocated_storage = 500  # Enable autoscaling
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "myapp"
  username = "dbadmin"
  password = random_password.db.result  # Generated

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = var.environment == "prod"
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  deletion_protection     = var.environment == "prod"

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn

  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = "${var.environment}-final-snapshot"
}

resource "random_password" "db" {
  length  = 32
  special = false  # Avoid special chars in connection strings
}

# Store in Secrets Manager
resource "aws_secretsmanager_secret" "db" {
  name = "${var.environment}/myapp/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = "myapp"
    username = aws_db_instance.main.username
    password = random_password.db.result
  })
}
```

### Terraform Workflow
```bash
# Initialize (download providers)
terraform init

# Plan (dry run — what will change)
terraform plan -var-file=prod.tfvars

# Apply
terraform apply -var-file=prod.tfvars
terraform apply -auto-approve  # For CI/CD

# Destroy
terraform destroy -target=aws_instance.test  # Specific resource

# State management
terraform state list
terraform state show aws_s3_bucket.main
terraform state mv aws_instance.old aws_instance.new  # Rename without recreating
terraform import aws_s3_bucket.existing my-bucket-name  # Import existing

# Format and validate
terraform fmt -recursive
terraform validate

# Workspaces (one state per workspace)
terraform workspace new staging
terraform workspace select prod
terraform workspace list
```

### Terraform Modules
```hcl
# modules/web-service/main.tf
variable "name" { type = string }
variable "image" { type = string }
variable "port" { type = number }
variable "min_instances" { type = number; default = 2 }

resource "aws_ecs_service" "this" {
  name            = var.name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.min_instances
  # ...
}

output "service_name" { value = aws_ecs_service.this.name }

# Root module using the module
module "api_service" {
  source = "./modules/web-service"

  name          = "api-service"
  image         = "my-api:${var.image_tag}"
  port          = 8080
  min_instances = 3
}

module "web_service" {
  source = "./modules/web-service"

  name  = "web-service"
  image = "my-web:${var.image_tag}"
  port  = 3000
}
```

---

## Ansible

### Playbooks
```yaml
# deploy.yml
---
- name: Deploy Application
  hosts: app_servers
  become: yes
  vars:
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
    app_dir: /opt/myapp
    app_user: myapp

  tasks:
    - name: Ensure app user exists
      user:
        name: "{{ app_user }}"
        system: yes
        shell: /bin/false

    - name: Create app directory
      file:
        path: "{{ app_dir }}"
        state: directory
        owner: "{{ app_user }}"
        mode: '0755'

    - name: Download application binary
      get_url:
        url: "https://releases.example.com/myapp-{{ app_version }}"
        dest: "{{ app_dir }}/myapp"
        mode: '0755'
        checksum: "sha256:{{ app_checksum }}"
      notify: Restart application  # Trigger handler if changed

    - name: Deploy configuration
      template:
        src: config.j2
        dest: "{{ app_dir }}/config.yaml"
        owner: "{{ app_user }}"
        mode: '0600'
      notify: Restart application

    - name: Ensure application is running
      systemd:
        name: myapp
        state: started
        enabled: yes
        daemon_reload: yes

  handlers:
    - name: Restart application
      systemd:
        name: myapp
        state: restarted

- name: Configure Nginx
  hosts: app_servers
  become: yes
  roles:
    - nginx
```

### Inventory
```ini
# inventory/production
[app_servers]
app1.example.com ansible_host=10.0.1.10
app2.example.com ansible_host=10.0.1.11

[db_servers]
db1.example.com ansible_host=10.0.2.10

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/prod_key

[app_servers:vars]
app_port=8080
```

```bash
# Run playbook
ansible-playbook -i inventory/production deploy.yml

# Run with extra vars
ansible-playbook deploy.yml -e "app_version=1.5.0 environment=prod"

# Dry run
ansible-playbook deploy.yml --check --diff

# Run specific tags
ansible-playbook deploy.yml --tags deploy

# Target specific hosts
ansible-playbook deploy.yml --limit app1.example.com

# Ad-hoc commands
ansible app_servers -m ping
ansible all -m shell -a "uptime"
ansible app_servers -m service -a "name=nginx state=restarted" --become
```

---

## Pulumi (Infrastructure as Real Code)

```typescript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const environment = config.require("environment");

// Create VPC
const vpc = new aws.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: { Name: `${environment}-vpc`, Environment: environment }
});

// Create subnets with proper typing
const azs = ["us-east-1a", "us-east-1b", "us-east-1c"];
const publicSubnets = azs.map((az, i) => new aws.ec2.Subnet(`public-${i}`, {
    vpcId: vpc.id,
    cidrBlock: `10.0.${i}.0/24`,
    availabilityZone: az,
    mapPublicIpOnLaunch: true,
}));

// RDS with password rotation
const dbPassword = new aws.secretsmanager.Secret("db-password");
const db = new aws.rds.Instance("main", {
    engine: "postgres",
    engineVersion: "15.4",
    instanceClass: "db.t3.medium",
    // ...
});

// Export values
export const vpcId = vpc.id;
export const publicSubnetIds = publicSubnets.map(s => s.id);
export const dbEndpoint = db.endpoint;
```

```bash
pulumi stack init production
pulumi config set environment production
pulumi preview   # Dry run
pulumi up        # Apply
pulumi destroy   # Tear down
pulumi stack output dbEndpoint  # Read exported value
```

---

## IaC Best Practices

```
State Management:
□ Remote state with locking (S3 + DynamoDB for Terraform)
□ Never edit state manually
□ State per environment (dev, staging, prod)

Code Organization:
□ One module = one responsibility
□ Parameterize everything environment-specific
□ Use variables with validation
□ Pin provider versions

Safety:
□ Always plan before apply
□ Code review for infrastructure changes
□ Separate production state from dev
□ Enable deletion protection for critical resources
□ Never hardcode secrets (use Secrets Manager / Vault)

Testing:
□ terraform validate + fmt in CI
□ Linting: tflint, terrascan, checkov
□ Policy as code: Sentinel (Terraform Cloud), OPA
□ Integration tests: Terratest

Drift:
□ Alert on manual changes (CloudTrail → EventBridge → alert)
□ Regularly run plan in CI to detect drift
□ Force all changes through IaC
```

---

*The ideal infrastructure has zero humans touching production directly. IaC is how you get there.*
