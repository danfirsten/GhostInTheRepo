# Kubernetes — Complete Reference

> Kubernetes is the operating system of the cloud. Every engineer deploying software at scale needs to understand it.

---

## Architecture

### Control Plane
```
kube-apiserver      — REST API server, all interactions go through here
etcd                — Distributed KV store, cluster state + config
kube-scheduler      — Assigns Pods to Nodes based on resources/constraints
kube-controller-manager — Runs controllers (deployment, replica set, etc.)
cloud-controller-manager — Cloud-provider specific controllers
```

### Worker Nodes
```
kubelet             — Agent on each node, ensures containers are running
kube-proxy          — Network proxy, implements Service abstraction
Container runtime   — containerd, CRI-O (runs containers)
```

### Control Loop Pattern
All Kubernetes controllers follow the same pattern:
```
Observe current state → Compare to desired state → Take action to reconcile
```

---

## Core Objects

### Pod
Smallest deployable unit. One or more containers sharing network namespace and volumes.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
    env: production
spec:
  containers:
  - name: app
    image: myapp:1.0
    ports:
    - containerPort: 3000
    resources:
      requests:             # Minimum guaranteed
        cpu: "100m"         # 100 millicores = 0.1 CPU
        memory: "128Mi"
      limits:               # Maximum allowed
        cpu: "500m"
        memory: "512Mi"
    env:
    - name: DB_URL
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: url
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: environment
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 15
      periodSeconds: 20
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /ready
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 10
    volumeMounts:
    - name: data
      mountPath: /app/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 1; done']
  restartPolicy: Always
  serviceAccountName: my-service-account
```

### Deployment
Manages ReplicaSets for rolling updates and rollbacks.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1     # At most 1 pod unavailable during update
      maxSurge: 1           # At most 1 extra pod during update
  template:
    metadata:
      labels:
        app: my-app
        version: "1.0"
    spec:
      containers:
      - name: app
        image: myapp:1.0
        # ... (same as Pod spec)
      affinity:
        podAntiAffinity:          # Spread pods across nodes
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values: ["my-app"]
            topologyKey: kubernetes.io/hostname
      topologySpreadConstraints:   # Even distribution
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: my-app
```

### Service
Stable network endpoint for pods.

```yaml
# ClusterIP — internal only
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80          # Service port
    targetPort: 3000  # Container port
  type: ClusterIP     # Default

---
# NodePort — accessible on every node at static port
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 3000
    nodePort: 30080   # 30000-32767

---
# LoadBalancer — cloud provider creates external LB
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000

---
# Headless — no load balancing, returns pod IPs directly
spec:
  clusterIP: None
  # Used for StatefulSets (stable DNS: pod-0.service.namespace.svc.cluster.local)
```

### Ingress
L7 HTTP routing to services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### ConfigMap & Secret
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  config.yaml: |
    server:
      port: 3000
      timeout: 30s

---
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: dXNlcm5hbWU=   # base64 encoded
  password: c3VwZXJzZWNyZXQ=
stringData:                  # Auto base64 encodes
  url: "postgresql://user:pass@db:5432/mydb"
```

### StatefulSet
For stateful workloads (databases, Kafka, Zookeeper).

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless    # Headless service required
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:             # Each pod gets its own PVC
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

Pods are named: `postgres-0`, `postgres-1`, `postgres-2`
DNS: `postgres-0.postgres-headless.namespace.svc.cluster.local`

### DaemonSet
One pod per node (or subset). For: log collection, monitoring, network plugins.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    spec:
      tolerations:               # Run on master nodes too
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluentd:v1.15
```

### Job & CronJob
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: migration
        image: myapp:1.0
        command: ["npm", "run", "migrate"]

---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup
spec:
  schedule: "0 2 * * *"       # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: cleanup
            image: myapp:1.0
            command: ["node", "cleanup.js"]
```

---

## Storage

### PersistentVolume & PersistentVolumeClaim
```yaml
# Admin creates PV
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce       # RWO: one node at a time
    # ReadWriteMany       # RWX: multiple nodes (NFS, EFS)
    # ReadOnlyMany        # ROX: multiple nodes read-only
  persistentVolumeReclaimPolicy: Retain  # or Delete, Recycle
  storageClassName: standard
  hostPath:
    path: /data/my-pv

---
# Developer creates PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard  # Must match StorageClass
```

### StorageClass (Dynamic Provisioning)
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

---

## Scheduling

### Taints & Tolerations
```yaml
# Taint a node (repel pods)
kubectl taint nodes node1 gpu=true:NoSchedule

# Pod must tolerate to be scheduled
tolerations:
- key: "gpu"
  operator: "Equal"
  value: "true"
  effect: "NoSchedule"   # or PreferNoSchedule, NoExecute
```

### Node Selector & Node Affinity
```yaml
# Simple node selector
nodeSelector:
  kubernetes.io/arch: amd64
  node-type: compute

# Affinity (more expressive)
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:    # Hard requirement
      nodeSelectorTerms:
      - matchExpressions:
        - key: node-type
          operator: In
          values: ["gpu", "high-memory"]
    preferredDuringSchedulingIgnoredDuringExecution:   # Soft preference
    - weight: 100
      preference:
        matchExpressions:
        - key: zone
          operator: In
          values: ["us-east-1a"]
```

### Resource Quotas & LimitRanges
```yaml
# Namespace resource quota
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    pods: "50"
    services: "20"
    persistentvolumeclaims: "20"

---
# Default limits per container
apiVersion: v1
kind: LimitRange
metadata:
  name: limits
spec:
  limits:
  - default:
      cpu: 500m
      memory: 256Mi
    defaultRequest:
      cpu: 100m
      memory: 128Mi
    type: Container
```

---

## RBAC (Role-Based Access Control)

```yaml
# Role (namespace-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "update", "patch"]

---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
- kind: ServiceAccount
  name: my-service-account
  namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

---
# ClusterRole (cluster-scoped)
# ClusterRoleBinding
```

### ServiceAccount
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/my-role  # IRSA (AWS)
```

---

## Network Policies

```yaml
# Deny all ingress to pod
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes:
  - Ingress

---
# Allow only from specific pods
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: monitoring
    ports:
    - protocol: TCP
      port: 8080
```

---

## Helm — Package Manager for Kubernetes

```bash
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm search repo nginx
helm show values bitnami/nginx > values.yaml

helm install my-release bitnami/nginx
helm install my-release bitnami/nginx -f custom-values.yaml
helm install my-release bitnami/nginx --set service.type=LoadBalancer

helm list
helm status my-release
helm upgrade my-release bitnami/nginx --set image.tag=latest
helm rollback my-release 1
helm uninstall my-release

helm template my-release bitnami/nginx > output.yaml  # Render without installing
helm lint ./mychart/
```

### Creating a Helm Chart
```
mychart/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default values
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl    # Template helpers
│   └── NOTES.txt       # Post-install notes
└── charts/             # Dependencies
```

---

## kubectl Mastery

```bash
# Context & cluster management
kubectl config get-contexts
kubectl config use-context my-cluster
kubectl config set-context --current --namespace=production

# Basic CRUD
kubectl get pods
kubectl get pods -n kube-system
kubectl get pods -A                          # All namespaces
kubectl get pods -o wide                     # More details
kubectl get pods -o yaml                     # Full YAML
kubectl get pods -l app=my-app               # Label selector
kubectl get pods --field-selector status.phase=Running
kubectl get all                              # All resource types
kubectl get events --sort-by='.lastTimestamp'

kubectl describe pod my-pod                  # Detailed info
kubectl describe deployment my-app

kubectl logs my-pod                          # Logs
kubectl logs my-pod -f                       # Follow
kubectl logs my-pod --previous               # Crashed container logs
kubectl logs my-pod -c my-container          # Multi-container pod
kubectl logs -l app=my-app --tail=100        # Label selector

kubectl exec -it my-pod -- bash             # Shell
kubectl exec -it my-pod -c container -- sh  # Specific container
kubectl port-forward my-pod 8080:3000       # Port forward
kubectl port-forward svc/my-service 8080:80

kubectl apply -f manifest.yaml               # Apply (create or update)
kubectl apply -f ./manifests/                # Directory
kubectl apply -k ./kustomize/               # Kustomize
kubectl delete -f manifest.yaml
kubectl delete pod my-pod --grace-period=0  # Force delete

kubectl scale deployment my-app --replicas=5
kubectl rollout status deployment/my-app
kubectl rollout history deployment/my-app
kubectl rollout undo deployment/my-app
kubectl rollout undo deployment/my-app --to-revision=2
kubectl set image deployment/my-app container=myapp:2.0

kubectl label pod my-pod env=prod
kubectl annotate pod my-pod description="main web server"
kubectl taint nodes node1 dedicated=gpu:NoSchedule

# Resource usage
kubectl top nodes
kubectl top pods
kubectl top pods --sort-by=cpu

# Useful aliases
alias k=kubectl
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kgd='kubectl get deployments'
alias kdp='kubectl describe pod'

# Shell completion
source <(kubectl completion bash)   # Add to .bashrc
```

---

## Operators & CRDs

```yaml
# Custom Resource Definition
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.mycompany.com
spec:
  group: mycompany.com
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              replicas:
                type: integer
  scope: Namespaced
  names:
    plural: databases
    singular: database
    kind: Database
```

**Famous Operators:**
- **cert-manager**: TLS certificate management
- **External Secrets Operator**: sync secrets from Vault/AWS/etc.
- **Prometheus Operator**: monitoring stack
- **Argo CD**: GitOps deployment
- **Strimzi**: Kafka on Kubernetes
- **Zalando Postgres Operator**: managed PostgreSQL

---

## Production Checklist

```
Infrastructure:
□ Multiple nodes across availability zones
□ Node autoscaling (Cluster Autoscaler or Karpenter)
□ Resource requests/limits on all containers
□ Pod Disruption Budgets
□ Horizontal Pod Autoscaler (HPA)

Security:
□ RBAC configured
□ Secrets encrypted at rest (KMS)
□ Network policies
□ Non-root containers
□ Read-only filesystem where possible
□ Pod Security Standards (Restricted)
□ Image scanning in CI

Observability:
□ Centralized logging (Fluentd/Fluent Bit → Elasticsearch/Loki)
□ Metrics (Prometheus + Grafana)
□ Distributed tracing (Jaeger/Tempo)
□ Alertmanager rules for critical paths

Reliability:
□ Readiness + Liveness probes
□ Anti-affinity rules (spread pods across nodes/zones)
□ Rolling update strategy
□ Rollback tested
□ Persistent volume backups (Velero)
```

---

*Kubernetes is distributed systems made operational. Once you understand the control loop, everything else follows.*
