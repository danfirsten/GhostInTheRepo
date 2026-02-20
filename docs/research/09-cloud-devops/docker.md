# Docker & Containerization — Complete Reference

> Containers changed software delivery forever. Understanding them deeply means understanding Linux namespaces, cgroups, and union filesystems.

---

## How Containers Work

Containers are NOT virtual machines. They're **isolated processes** running on the host kernel.

### Linux Namespaces (Isolation)
Docker uses these Linux kernel namespaces to isolate containers:

| Namespace | What it isolates |
|---|---|
| `pid` | Process IDs (container sees its own PID 1) |
| `net` | Network interfaces, routes, firewall rules |
| `mnt` | Filesystem mount points |
| `uts` | Hostname and domain name |
| `ipc` | IPC objects (semaphores, message queues) |
| `user` | User/group IDs |
| `cgroup` | Control group root directory |
| `time` | System time (Linux 5.6+) |

### cgroups (Resource Limits)
Control Groups limit/account for resource usage:
- **cpu**: CPU time shares
- **memory**: RAM and swap limits
- **blkio**: Block I/O limits
- **cpuset**: Pin to specific CPUs
- **pids**: Maximum number of processes

### Union Filesystem (OverlayFS)
Layers of read-only filesystem stacked together, with a writable layer on top:
```
Container writable layer    ← your changes
Image layer 3 (npm install)
Image layer 2 (package.json)
Image layer 1 (node:18)
Base layer (debian/ubuntu)
```
Each instruction in a Dockerfile creates a new layer.

---

## Dockerfile Mastery

### Basic Syntax
```dockerfile
# Base image
FROM node:18-alpine

# Metadata
LABEL maintainer="you@email.com"
LABEL version="1.0"

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
COPY . .

# Run commands (creates new layer)
RUN npm ci --production

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (documentation only, doesn't actually open port)
EXPOSE 3000

# Default user
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Command to run
CMD ["node", "server.js"]
```

### Production Dockerfile Best Practices

```dockerfile
# Multi-stage build — crucial for small images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # Install ALL deps (including dev)
COPY . .
RUN npm run build               # Build TypeScript/etc

# Production image
FROM node:18-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy build output from builder stage
COPY --from=builder /app/dist ./dist

# Set permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Why multi-stage?**
- Build tools (gcc, npm, webpack) not in final image
- Dev dependencies not in final image
- Image: 1.2GB → 80MB

### Layer Caching Optimization
```dockerfile
# BAD — any code change invalidates npm install
COPY . .
RUN npm install

# GOOD — npm install only re-runs when package.json changes
COPY package*.json ./
RUN npm install
COPY . .       # Put this LAST
```

### .dockerignore
```
node_modules/
.git/
*.log
.env
.env.*
dist/
coverage/
.DS_Store
README.md
Dockerfile
.dockerignore
```

### Dockerfile Instructions Reference
```dockerfile
FROM image[:tag|@digest]    # Base image
RUN command                 # Execute command (creates layer)
CMD ["exec", "param"]       # Default command (overrideable at runtime)
ENTRYPOINT ["exec"]         # Fixed executable (CMD becomes default args)
EXPOSE port                 # Document port
ENV KEY=value               # Environment variable (persistent)
ARG NAME=default            # Build-time argument (not in image)
COPY src dst                # Copy files
ADD src dst                 # Copy + auto-extract archives + URL support
WORKDIR /path               # Set working directory
USER user[:group]           # Set user
VOLUME /path                # Declare volume mount point
HEALTHCHECK [options] CMD   # Container health check
LABEL key=value             # Metadata
STOPSIGNAL signal           # Signal to stop container (default SIGTERM)
ONBUILD instruction         # Trigger when image is used as base
SHELL ["executable", "params"] # Override default shell
```

### CMD vs ENTRYPOINT
```dockerfile
# CMD only: can be completely replaced with `docker run image my_cmd`
CMD ["python", "app.py"]

# ENTRYPOINT only: params appended, not replaced
ENTRYPOINT ["python", "app.py"]

# Both: ENTRYPOINT = executable, CMD = default args
ENTRYPOINT ["python"]
CMD ["app.py"]       # docker run image → python app.py
                     # docker run image other.py → python other.py
```

---

## Docker CLI Mastery

### Images
```bash
docker build -t myapp:1.0 .                  # Build with tag
docker build -t myapp:1.0 -f Dockerfile.prod . # Custom Dockerfile
docker build --no-cache -t myapp .           # No layer cache
docker build --target builder -t myapp .    # Stop at build stage

docker pull nginx:alpine
docker push myrepo/myapp:1.0

docker images                                # List images
docker images -a                             # Including intermediates
docker image ls --filter dangling=true       # Untagged layers
docker image prune                           # Remove dangling images
docker image prune -a                        # Remove ALL unused images

docker tag myapp:1.0 myrepo/myapp:1.0       # Add tag
docker rmi myapp:1.0                         # Remove image
docker history myapp:1.0                     # Show layers
docker inspect myapp:1.0                     # Full metadata
docker save -o myapp.tar myapp:1.0          # Export to file
docker load -i myapp.tar                    # Import from file
```

### Containers
```bash
docker run nginx                              # Run (foreground)
docker run -d nginx                          # Detached (background)
docker run -d -p 8080:80 nginx              # Port mapping host:container
docker run -d -p 8080:80 --name web nginx   # Named container
docker run -it ubuntu bash                  # Interactive TTY
docker run --rm ubuntu echo hello           # Remove on exit
docker run -e ENV_VAR=value nginx           # Set env var
docker run --env-file .env nginx            # Load env from file
docker run -v /host/path:/container/path nginx  # Volume mount
docker run -v myvolume:/data nginx          # Named volume
docker run --memory 512m nginx              # Memory limit
docker run --cpus 1.5 nginx                 # CPU limit
docker run --network mynet nginx            # Custom network
docker run --user 1000:1000 nginx           # Run as user

docker ps                                    # Running containers
docker ps -a                                 # All containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker stop container_name                   # SIGTERM + wait + SIGKILL
docker kill container_name                   # SIGKILL immediately
docker rm container_name                     # Remove stopped container
docker rm -f container_name                  # Force remove running

docker logs container_name                   # View logs
docker logs -f container_name               # Follow logs
docker logs --tail 100 container_name       # Last 100 lines
docker logs --since 5m container_name       # Since 5 minutes ago

docker exec -it container_name bash          # Shell into running container
docker exec container_name env               # Run command in container

docker cp container_name:/path ./local       # Copy from container
docker cp ./local container_name:/path       # Copy to container

docker stats                                  # Real-time resource usage
docker top container_name                    # Processes in container
docker inspect container_name               # Full metadata (JSON)
docker diff container_name                  # Changed files
docker commit container_name new_image      # Save container as image
```

### Volumes
```bash
docker volume create myvolume
docker volume ls
docker volume inspect myvolume
docker volume rm myvolume
docker volume prune               # Remove unused volumes

# Types:
# Named volume: docker managed, best for persistent data
docker run -v myvolume:/data image

# Bind mount: map host directory (dev, config)
docker run -v /host/dir:/container/dir image
docker run -v $(pwd):/app image           # Current dir

# tmpfs: in memory (sensitive data, no persistence)
docker run --tmpfs /tmp image
```

### Networks
```bash
docker network create mynet
docker network create --driver bridge mynet
docker network create --subnet 172.20.0.0/16 mynet
docker network ls
docker network inspect mynet
docker network connect mynet container_name
docker network disconnect mynet container_name
docker network rm mynet

# Drivers:
# bridge: default, isolated network on host
# host: share host network stack (no isolation)
# none: no network
# overlay: multi-host (Swarm/Kubernetes)
# macvlan: assign MAC addresses (appear as physical devices)

# Container DNS: containers on same network resolve by name
# docker run --name db postgres  →  other containers can ping "db"
```

---

## Docker Compose

### docker-compose.yml Structure
```yaml
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        BUILD_DATE: ${BUILD_DATE}
    image: myapp:latest
    container_name: myapp-web
    ports:
      - "8080:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:pass@db:5432/mydb
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    volumes:
      - ./uploads:/app/uploads
      - app-logs:/var/log/app
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  app-logs:
```

### Compose Commands
```bash
docker compose up                   # Start services
docker compose up -d                # Detached
docker compose up --build           # Build before starting
docker compose up -d web db         # Only specific services

docker compose down                 # Stop and remove containers
docker compose down -v              # Also remove volumes
docker compose down --rmi all       # Also remove images

docker compose ps                   # Status
docker compose logs                 # All logs
docker compose logs -f web          # Follow specific service
docker compose exec web bash        # Shell into service
docker compose run web npm test     # One-off command

docker compose build                # Build images
docker compose pull                 # Pull base images
docker compose restart web          # Restart service
docker compose scale web=3          # Scale service (legacy)
docker compose config               # Validate config

# Multiple compose files (override pattern)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## Container Security

### Run as Non-Root
```dockerfile
RUN groupadd -r app && useradd -r -g app app
USER app
```

### Read-Only Filesystem
```bash
docker run --read-only --tmpfs /tmp nginx
```

### Security Options
```bash
# Drop capabilities
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# No new privileges
docker run --security-opt no-new-privileges nginx

# Seccomp profile
docker run --security-opt seccomp=/path/to/profile.json nginx

# AppArmor
docker run --security-opt apparmor=docker-default nginx
```

### Image Scanning
```bash
# Trivy (free, fast)
trivy image myapp:latest

# Docker Scout
docker scout cves myapp:latest

# Grype
grype myapp:latest
```

---

## Registry & Image Management

```bash
# Docker Hub
docker login
docker push username/myapp:1.0

# Private registry (self-hosted)
docker run -d -p 5000:5000 --name registry registry:2
docker tag myapp:1.0 localhost:5000/myapp:1.0
docker push localhost:5000/myapp:1.0

# AWS ECR
aws ecr get-login-password | docker login --username AWS \
  --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:1.0

# GitHub Container Registry
docker login ghcr.io
docker push ghcr.io/username/myapp:1.0
```

---

## Debugging Containers

```bash
# Get shell in running container
docker exec -it container bash

# Start stopped container with override
docker run -it --entrypoint bash myapp:broken

# Inspect container filesystem
docker run -it --rm -v /var/lib/docker:/docker alpine sh
cd /docker/overlay2/HASH/merged

# Inspect with nsenter (enter namespaces directly)
PID=$(docker inspect --format '{{.State.Pid}}' container)
nsenter -t $PID -n   # Enter network namespace

# Copy files out
docker cp container:/var/log/app.log .

# Check resource usage
docker stats --no-stream
docker top container

# Debug networking
docker run -it --network container:target nicolaka/netshoot

# Read-only image layers
docker run --rm -v /var/lib/docker:/docker alpine \
  ls /docker/overlay2/
```

---

## OCI, containerd, and the Runtime Stack

```
Docker CLI
    ↓
Docker Daemon (dockerd)
    ↓
containerd (container lifecycle management)
    ↓
containerd-shim
    ↓
runc (OCI runtime — creates actual containers)
    ↓
Linux kernel (namespaces + cgroups)
```

**Alternatives to Docker:**
- **Podman**: daemonless, rootless, Docker-compatible CLI
- **BuildKit**: Docker's modern build engine (included in Docker 20+)
- **Buildah**: build OCI images without daemon
- **Kaniko**: build inside Kubernetes (no daemon needed)
- **nerdctl**: Docker-compatible CLI for containerd

---

*Containers are simple — they're just processes with extra isolation. Once you know the Linux primitives, you own the stack.*
