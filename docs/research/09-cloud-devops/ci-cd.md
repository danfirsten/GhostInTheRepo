# CI/CD Pipelines — Complete Reference

> The deployment pipeline is the heartbeat of your engineering velocity. A great pipeline is your most important safety net.

---

## Core Concepts

### Continuous Integration (CI)
- Every code commit triggers automated build + tests
- Catch integration bugs early
- Maintain always-deployable mainline

### Continuous Delivery (CD)
- Software is always in a releasable state
- Every change can be deployed with one click
- Human approval gate before production

### Continuous Deployment
- Every passing change automatically deploys to production
- Requires very high test coverage and observability

### Pipeline Stages
```
Code Commit
    ↓
Source Control Hook (Webhook)
    ↓
Build (compile, bundle)
    ↓
Test (unit, integration, security scan)
    ↓
Artifact Creation (Docker image, binary, package)
    ↓
Deploy to Staging
    ↓
Automated Integration Tests
    ↓
[Approval Gate]
    ↓
Deploy to Production
    ↓
Post-Deploy Smoke Tests
    ↓
Monitoring / Alerts
```

---

## GitHub Actions

### Workflow Structure
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12']
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          mypy src/

      - name: Test
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb
        run: |
          pytest tests/ --cov=src --cov-report=xml -v

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  build:
    name: Build Docker Image
    needs: [test, security]
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU (multi-platform builds)
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha,prefix=sha-

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/myapp \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }} \
            -n staging
        env:
          KUBECONFIG: ${{ secrets.STAGING_KUBECONFIG }}

  deploy-production:
    name: Deploy to Production
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy
        run: kubectl set image deployment/myapp ...
```

### Reusable Workflows
```yaml
# .github/workflows/deploy.yml (reusable)
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
    secrets:
      KUBECONFIG:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - name: Deploy
        run: kubectl set image deployment/myapp app=${{ inputs.image-tag }}
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}

# Caller workflow
jobs:
  deploy-prod:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
      image-tag: ghcr.io/org/app:1.0.0
    secrets:
      KUBECONFIG: ${{ secrets.PROD_KUBECONFIG }}
```

---

## GitLab CI

```yaml
# .gitlab-ci.yml
default:
  image: python:3.12

stages:
  - lint
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""

.python-cache: &python-cache
  cache:
    key: "${CI_COMMIT_REF_SLUG}"
    paths:
      - .venv/

lint:
  stage: lint
  <<: *python-cache
  script:
    - pip install ruff mypy
    - ruff check .
    - mypy src/

test:
  stage: test
  <<: *python-cache
  services:
    - postgres:15
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://postgres:test@postgres/testdb
  script:
    - pip install -r requirements.txt -r requirements-dev.txt
    - pytest tests/ --cov=src --junitxml=report.xml
  artifacts:
    when: always
    reports:
      junit: report.xml
    paths:
      - coverage.xml

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - |
      docker build \
        --cache-from $CI_REGISTRY_IMAGE:latest \
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA \
        --tag $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
    - develop

deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.myapp.com
  script:
    - kubectl set image deployment/myapp app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - develop

deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://myapp.com
  script:
    - kubectl set image deployment/myapp app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  when: manual       # Require manual approval
  only:
    - main
```

---

## Deployment Strategies

### Rolling Update
```
Gradually replace old pods with new ones.

                           [v1][v1][v1][v1]
Rolling update starts:     [v2][v1][v1][v1]
                           [v2][v2][v1][v1]
                           [v2][v2][v2][v1]
Rolling complete:          [v2][v2][v2][v2]

Kubernetes:
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1

Advantages: Zero downtime, gradual rollout
Disadvantages: Brief period of mixed versions
```

### Blue-Green Deployment
```
Maintain two identical environments.
Switch traffic at once.

       ┌─────────────────────────────┐
       │         Load Balancer        │
       └──────────┬──────────────────┘
                  │ 100% traffic
       ┌──────────▼──────────┐
       │    Blue (v1)         │ ← active
       └──────────────────────┘
       ┌──────────────────────┐
       │    Green (v2)        │ ← idle (deploy here)
       └──────────────────────┘

After testing green: switch LB to point to green
If issue: switch back to blue immediately
```

### Canary Deployment
```
Route small % of traffic to new version.
Gradually increase if stable.

       ┌─────────────────────────────┐
       │         Load Balancer        │
       └───────┬─────────────────────┘
        95%    │          5%
  ┌────▼────┐  │  ┌────▼────────┐
  │   v1    │  │  │  v2 (canary)│
  └─────────┘  │  └─────────────┘
```

```yaml
# Kubernetes: 95/5 canary with Nginx Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "5"
spec:
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /
        backend:
          service:
            name: app-v2
            port:
              number: 80
```

### Feature Flags
```python
# LaunchDarkly / Unleash / custom
def handle_checkout(user_id, cart):
    if feature_flags.is_enabled('new_checkout_flow', user_id):
        return new_checkout(user_id, cart)
    else:
        return old_checkout(user_id, cart)

# Decouple deployment from release
# 1. Deploy code with feature flag OFF
# 2. Test in production with flag ON for internal users
# 3. Gradually roll out to % of users
# 4. Full rollout or rollback without deployment
```

---

## Testing in CI

### Test Pyramid
```
       /\
      /E2E\       Small number, slow, expensive
     /      \
    / Integration \   Medium number
   /               \
  /   Unit Tests    \  Large number, fast, cheap
 /___________________\
```

### Fast Test Suite Tips
```yaml
# Parallelize tests
test:
  parallel: 4  # GitLab: split across 4 jobs
  script:
    - pytest tests/ --split-index $CI_NODE_INDEX --splits $CI_NODE_TOTAL

# Cache dependencies
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pip
      node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('requirements.txt', 'package-lock.json') }}

# Only run changed tests (pytest-testmon, nx affected)
- name: Run affected tests only
  run: pytest --testmon

# Fail fast: stop if any test fails
pytest -x tests/

# Run tests in parallel (pytest-xdist)
pytest -n auto tests/
```

---

## ArgoCD — GitOps

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests
    targetRevision: HEAD
    path: apps/myapp/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # Delete resources not in git
      selfHeal: true   # Auto-revert manual changes
    syncOptions:
      - CreateNamespace=true
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas  # Managed by HPA
```

### GitOps Workflow
```
1. Developer opens PR → CI pipeline runs tests
2. PR merged to main → Update image tag in Helm values / kustomize
3. ArgoCD detects drift from Git state
4. ArgoCD syncs cluster to match Git
5. Rollback = git revert → ArgoCD deploys previous state

Benefits:
- Git is source of truth (auditable)
- Any drift auto-corrected
- Rollback is just git revert
- No kubectl in CI (less attack surface)
```

---

## Secrets Management

### Never Put Secrets in CI Variables as Plaintext
```
Bad: CI_DB_PASSWORD: "mysecretpassword" in pipeline file
Good: Use CI/CD secret variables (encrypted at rest)
Better: Pull from Vault/AWS Secrets Manager at runtime
```

### Vault Integration
```yaml
# GitHub Actions with Vault
- uses: hashicorp/vault-action@v3
  with:
    url: https://vault.company.com
    role: ci-pipeline
    method: jwt
    secrets: |
      secret/data/production db_password | DB_PASSWORD ;
      secret/data/production api_key | API_KEY

# Now $DB_PASSWORD and $API_KEY are available as env vars (masked in logs)
```

### OIDC (Keyless Auth)
```yaml
# AWS: assume IAM role without static credentials
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789:role/github-actions
    aws-region: us-east-1
    role-session-name: github-actions-session

# GCP: workload identity federation
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: projects/123/providers/github
    service_account: deploy@project.iam.gserviceaccount.com
```

---

## Pipeline Best Practices

```
Speed:
□ Cache dependencies aggressively
□ Parallelize independent jobs
□ Use build cache for Docker images
□ Only run expensive tests on main, quick tests on PR

Safety:
□ Pin action versions (@v3 not @latest)
□ Minimal permissions (GITHUB_TOKEN scopes)
□ No secrets in environment variables when possible
□ Scan images for vulnerabilities before deploy
□ Test in staging before production

Reliability:
□ Retry flaky tests / steps
□ Meaningful test names and failure output
□ Artifact retention for debugging failed builds
□ Timeout on all jobs

Observability:
□ Publish test reports (JUnit XML)
□ Notify on failure (Slack/PagerDuty)
□ Track deployment frequency and lead time (DORA metrics)
□ Deployment history with image digests for rollback
```

---

*The pipeline should be your fastest employee — always testing, always deploying, never missing a step.*
