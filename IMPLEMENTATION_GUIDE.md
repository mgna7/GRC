# ComplianceIQ - Microservices Implementation Guide

> Step-by-step guide to migrate from monolith to microservices architecture

## Overview

This guide provides a phased approach to transform ComplianceIQ into an enterprise-grade, multi-tenant SaaS platform using microservices architecture.

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Shared Libraries

Create shared code used across all services:

**Directory Structure:**
```
shared/
├── __init__.py
├── models/              # Pydantic models
│   ├── __init__.py
│   ├── user.py
│   ├── organization.py
│   └── common.py
├── middleware/          # Common middleware
│   ├── __init__.py
│   ├── auth.py
│   ├── tenant.py
│   └── logging.py
├── utils/               # Utilities
│   ├── __init__.py
│   ├── jwt.py
│   ├── encryption.py
│   ├── validators.py
│   └── database.py
└── config/              # Configuration
    ├── __init__.py
    ├── base.py
    └── service_config.py
```

### 1.2 Database Setup

Create separate databases:

```sql
-- Auth Database
CREATE DATABASE complianceiq_auth;

-- Core Database
CREATE DATABASE complianceiq_core;

-- Analysis Database
CREATE DATABASE complianceiq_analysis;

-- Audit Database
CREATE DATABASE complianceiq_audit;
```

### 1.3 Infrastructure Services

Start with Docker Compose for local development:

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

This starts:
- PostgreSQL instances (4 databases)
- Redis
- RabbitMQ
- Elasticsearch (optional)
- MinIO (optional)

---

## Phase 2: Core Services (Week 3-4)

### 2.1 Auth Service

**Priority:** HIGH
**Dependencies:** None

**Implementation Steps:**

1. Create database models:
```python
# services/auth/app/models/user.py
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
```

2. Implement JWT authentication
3. Create API endpoints
4. Add password reset workflow
5. Add email verification

**Test:**
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"SecurePass123!","organization_name":"Acme Corp"}'
```

### 2.2 Organization Service

**Priority:** HIGH
**Dependencies:** Auth Service

**Implementation Steps:**

1. Create database models:
```python
# services/organization/app/models/organization.py
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    subscription_plan = Column(String(50), default="trial")  # trial, basic, professional, enterprise
    subscription_status = Column(String(50), default="active")  # active, suspended, cancelled
    max_instances = Column(Integer, default=3)
    max_users = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    settings = Column(JSONB, default={})
```

2. Implement subscription management
3. Add usage tracking
4. Create team management

### 2.3 Instance Service

**Priority:** HIGH
**Dependencies:** Auth, Organization

**Implementation Steps:**

1. Migrate existing ServiceNow connector code
2. Add multi-tenant support (organization_id filter)
3. Implement encrypted credential storage
4. Add instance health checks
5. Create sync scheduling

---

## Phase 3: Analysis Services (Week 5-6)

### 3.1 Analysis Service

**Priority:** HIGH
**Dependencies:** Instance Service

**Implementation Steps:**

1. Migrate existing analysis engines
2. Add job queue (Celery + RabbitMQ)
3. Implement async analysis processing
4. Add progress tracking
5. Store results in analysis database

### 3.2 Insights Service

**Priority:** MEDIUM
**Dependencies:** Analysis Service

**Implementation Steps:**

1. Migrate insights retrieval logic
2. Add historical trend analysis
3. Implement result comparison
4. Add export functionality (PDF, CSV, Excel)
5. Create saved reports feature

### 3.3 Dashboard Service

**Priority:** HIGH
**Dependencies:** Analysis, Insights

**Implementation Steps:**

1. Aggregate metrics from multiple sources
2. Implement caching (Redis)
3. Add custom report builder
4. Create real-time analytics

---

## Phase 4: Supporting Services (Week 7-8)

### 4.1 Widget Service
- Migrate existing widget code
- Add templates
- Implement versioning

### 4.2 Notification Service
- Email integration (SendGrid/SMTP)
- SMS integration (Twilio)
- Webhook callbacks
- In-app notifications

### 4.3 Audit Service
- Comprehensive audit logging
- Security event tracking
- Compliance reporting

---

## Phase 5: Frontend (Week 9-10)

### 5.1 Modern UI Framework

**Recommendation:** React + TypeScript + Tailwind CSS

**Pages:**
1. **Landing Page** - Marketing site
2. **Sign Up / Login** - Authentication
3. **Dashboard** - Overview metrics
4. **Instances** - ServiceNow instance management
5. **Analysis** - Run and view analysis
6. **Insights** - Historical results and trends
7. **Widgets** - Widget configuration
8. **Reports** - Custom reports
9. **Team** - User and team management
10. **Settings** - Organization settings
11. **Billing** - Subscription and usage

**Technology Stack:**
```json
{
  "framework": "React 18",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "state": "Redux Toolkit or Zustand",
  "routing": "React Router v6",
  "http": "Axios",
  "charts": "Chart.js or Recharts",
  "forms": "React Hook Form",
  "ui": "Headless UI or Radix UI"
}
```

### 5.2 Component Library

Create reusable components:
- `<Button>`, `<Input>`, `<Select>`
- `<Card>`, `<Modal>`, `<Drawer>`
- `<Table>`, `<Chart>`, `<Badge>`
- `<Loader>`, `<ErrorBoundary>`
- `<Layout>`, `<Sidebar>`, `<Navbar>`

---

## Phase 6: DevOps & Deployment (Week 11-12)

### 6.1 Docker Compose

Create comprehensive docker-compose.yml:

```yaml
version: '3.9'

services:
  # Databases
  postgres-auth:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: complianceiq_auth
      POSTGRES_USER: complianceiq
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U complianceiq -d complianceiq_auth"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-core:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: complianceiq_core
      POSTGRES_USER: complianceiq
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  postgres-analysis:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: complianceiq_analysis
      POSTGRES_USER: complianceiq
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  postgres-audit:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: complianceiq_audit
      POSTGRES_USER: complianceiq
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  # Cache & Message Broker
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: complianceiq
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq

  # Microservices
  auth-service:
    build:
      context: ./services/auth
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-auth:5432/complianceiq_auth
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      JWT_ALGORITHM: RS256
      JWT_ACCESS_TOKEN_EXPIRE_MINUTES: 15
      JWT_REFRESH_TOKEN_EXPIRE_DAYS: 7
    ports:
      - "8001:8000"
    depends_on:
      postgres-auth:
        condition: service_healthy
      redis:
        condition: service_started

  user-service:
    build:
      context: ./services/user
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-core:5432/complianceiq_core
      AUTH_SERVICE_URL: http://auth-service:8000
    ports:
      - "8002:8000"
    depends_on:
      postgres-core:
        condition: service_healthy
      auth-service:
        condition: service_started

  organization-service:
    build:
      context: ./services/organization
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-core:5432/complianceiq_core
      AUTH_SERVICE_URL: http://auth-service:8000
      STRIPE_API_KEY: ${STRIPE_API_KEY}
    ports:
      - "8003:8000"
    depends_on:
      postgres-core:
        condition: service_healthy

  instance-service:
    build:
      context: ./services/instance
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-core:5432/complianceiq_core
      AUTH_SERVICE_URL: http://auth-service:8000
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    ports:
      - "8004:8000"
    depends_on:
      postgres-core:
        condition: service_healthy

  analysis-service:
    build:
      context: ./services/analysis
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-analysis:5432/complianceiq_analysis
      RABBITMQ_URL: amqp://complianceiq:${RABBITMQ_PASSWORD}@rabbitmq:5672/
      INSTANCE_SERVICE_URL: http://instance-service:8000
    ports:
      - "8005:8000"
    depends_on:
      postgres-analysis:
        condition: service_healthy
      rabbitmq:
        condition: service_started

  # Celery Workers
  celery-worker-analysis:
    build:
      context: ./services/analysis
      dockerfile: Dockerfile
    command: celery -A app.worker worker --loglevel=info
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres-analysis:5432/complianceiq_analysis
      RABBITMQ_URL: amqp://complianceiq:${RABBITMQ_PASSWORD}@rabbitmq:5672/
    depends_on:
      - rabbitmq
      - postgres-analysis

  # Frontend
  frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_GATEWAY_URL: http://localhost:8000
    depends_on:
      - kong

  # API Gateway
  kong:
    image: kong:latest
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "8000:8000"   # Proxy
      - "8443:8443"   # Proxy SSL
      - "8001:8001"   # Admin API
    volumes:
      - ./kong:/kong/declarative
    depends_on:
      - auth-service
      - user-service
      - organization-service
      - instance-service
      - analysis-service

volumes:
  postgres-auth-data:
  postgres-core-data:
  postgres-analysis-data:
  postgres-audit-data:
  redis-data:
  rabbitmq-data:
```

### 6.2 Kubernetes Manifests

Create K8s deployment files for production:

**Directory Structure:**
```
k8s/
├── namespaces/
│   └── complianceiq-prod.yaml
├── configmaps/
│   ├── auth-service-config.yaml
│   ├── core-services-config.yaml
│   └── analysis-services-config.yaml
├── secrets/
│   ├── database-secrets.yaml
│   ├── jwt-secrets.yaml
│   └── api-keys-secrets.yaml
├── deployments/
│   ├── auth-service.yaml
│   ├── user-service.yaml
│   ├── organization-service.yaml
│   ├── instance-service.yaml
│   ├── analysis-service.yaml
│   └── ... (other services)
├── services/
│   ├── auth-service.yaml
│   ├── user-service.yaml
│   └── ... (other services)
├── statefulsets/
│   ├── postgres-auth.yaml
│   ├── postgres-core.yaml
│   ├── postgres-analysis.yaml
│   ├── postgres-audit.yaml
│   ├── redis-cluster.yaml
│   └── rabbitmq-cluster.yaml
├── ingress/
│   ├── api-gateway-ingress.yaml
│   └── frontend-ingress.yaml
├── hpa/
│   ├── auth-service-hpa.yaml
│   ├── analysis-service-hpa.yaml
│   └── ... (other services)
└── pvc/
    ├── postgres-pvc.yaml
    └── storage-class.yaml
```

**Example Deployment:**

```yaml
# k8s/deployments/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: complianceiq-prod
  labels:
    app: auth-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        version: v1
    spec:
      containers:
      - name: auth-service
        image: complianceiq/auth-service:latest
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-db-secret
              key: connection-string
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: private-key
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: complianceiq-prod
spec:
  selector:
    app: auth-service
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: complianceiq-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Phase 7: Testing & Quality Assurance (Week 13-14)

### 7.1 Unit Tests

Each service should have comprehensive tests:

```bash
services/auth/tests/
├── __init__.py
├── test_models.py
├── test_services.py
├── test_api.py
└── test_integration.py
```

### 7.2 Integration Tests

Test inter-service communication:

```python
def test_user_registration_flow():
    # 1. Register user via Auth Service
    response = requests.post("http://auth-service:8000/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!",
        "organization_name": "Test Corp"
    })
    assert response.status_code == 201

    # 2. Verify user created in User Service
    user_id = response.json()["user_id"]
    response = requests.get(f"http://user-service:8000/api/v1/users/{user_id}")
    assert response.status_code == 200

    # 3. Verify organization created
    org_id = response.json()["organization_id"]
    response = requests.get(f"http://organization-service:8000/api/v1/organizations/{org_id}")
    assert response.status_code == 200
```

### 7.3 Load Testing

Use tools like K6 or Locust:

```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  let response = http.post('http://localhost:8000/api/v1/auth/login', JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123!'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Quick Start Commands

### Local Development (Docker Compose)

```bash
# Start infrastructure services
docker-compose -f docker-compose.infrastructure.yml up -d

# Start all microservices
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Rebuild a specific service
docker-compose build auth-service
docker-compose up -d auth-service
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f k8s/namespaces/

# Create secrets (from encrypted files or vault)
kubectl apply -f k8s/secrets/

# Create configmaps
kubectl apply -f k8s/configmaps/

# Deploy databases (StatefulSets)
kubectl apply -f k8s/statefulsets/

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres-auth -n complianceiq-prod --timeout=300s

# Deploy microservices
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/

# Deploy ingress
kubectl apply -f k8s/ingress/

# Deploy autoscaling
kubectl apply -f k8s/hpa/

# Check status
kubectl get pods -n complianceiq-prod
kubectl get svc -n complianceiq-prod
kubectl get ing -n complianceiq-prod

# View logs
kubectl logs -f deployment/auth-service -n complianceiq-prod

# Scale a service
kubectl scale deployment auth-service --replicas=5 -n complianceiq-prod
```

---

## Environment Variables

### Development (.env.local)

```env
# Database Passwords
DB_PASSWORD=dev_password_123

# Redis
REDIS_PASSWORD=redis_dev_password

# RabbitMQ
RABBITMQ_PASSWORD=rabbitmq_dev_password

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=RS256

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# External Services
SENDGRID_API_KEY=your-sendgrid-api-key
STRIPE_API_KEY=your-stripe-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# ServiceNow (for testing)
SERVICENOW_TEST_INSTANCE_URL=https://dev123456.service-now.com
SERVICENOW_TEST_USER=admin
SERVICENOW_TEST_TOKEN=your-servicenow-token
```

### Production (Kubernetes Secrets)

```bash
# Create secrets from files
kubectl create secret generic auth-db-secret \
  --from-literal=connection-string="postgresql+psycopg2://user:pass@host:5432/db" \
  -n complianceiq-prod

# Or from YAML (base64 encoded)
kubectl apply -f k8s/secrets/database-secrets.yaml
```

---

## Monitoring & Observability

### Prometheus Metrics

Each service exposes metrics at `/metrics`:

```
# TYPE http_requests_total counter
http_requests_total{method="POST",endpoint="/api/v1/auth/login",status="200"} 1523

# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1200
http_request_duration_seconds_bucket{le="0.5"} 1500
http_request_duration_seconds_sum 250.5
http_request_duration_seconds_count 1523
```

### Grafana Dashboards

Import pre-built dashboards for:
- Service health overview
- Request rates and latency
- Error rates
- Database connections
- Cache hit rates
- Queue depths

### Distributed Tracing (Jaeger)

Add tracing to track requests across services:

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider

tracer = trace.get_tracer(__name__)

@router.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    with tracer.start_as_current_span("auth.login") as span:
        span.set_attribute("user.email", credentials.email)
        # ... authentication logic
        return {"access_token": token}
```

---

## Migration Strategy

### Zero-Downtime Migration

1. **Parallel Run:** Deploy microservices alongside monolith
2. **Gradual Traffic Shift:** Use feature flags to route traffic
3. **Data Synchronization:** Keep databases in sync during transition
4. **Validation:** Compare responses between old and new systems
5. **Cutover:** Once validated, switch 100% traffic to microservices
6. **Decommission:** Remove monolith after stability period

### Data Migration

```python
# Migration script to split monolith database
def migrate_users_table():
    # Read from monolith DB
    monolith_users = monolith_db.query(User).all()

    # Write to auth DB
    for user in monolith_users:
        auth_user = AuthUser(
            id=user.id,
            email=user.email,
            password_hash=user.password_hash,
            organization_id=user.organization_id
        )
        auth_db.add(auth_user)

    auth_db.commit()
```

---

## Success Criteria

### Performance
- ✅ API response time < 200ms (p95)
- ✅ Support 1000+ concurrent users
- ✅ Handle 10,000+ requests per minute
- ✅ 99.9% uptime SLA

### Scalability
- ✅ Horizontal scaling for all services
- ✅ Auto-scaling based on load
- ✅ Support 100+ organizations
- ✅ Support 10,000+ ServiceNow instances

### Security
- ✅ JWT-based authentication
- ✅ Row-level security for multi-tenancy
- ✅ Encrypted credentials at rest
- ✅ TLS encryption in transit
- ✅ Regular security audits

### Maintainability
- ✅ 80%+ code coverage
- ✅ Automated CI/CD pipelines
- ✅ Comprehensive API documentation
- ✅ Clear logging and monitoring

---

## Next Steps

1. **Week 1:** Set up shared libraries and infrastructure
2. **Week 2-4:** Implement core services (Auth, User, Organization, Instance)
3. **Week 5-6:** Implement analysis services
4. **Week 7-8:** Implement supporting services
5. **Week 9-10:** Build modern frontend
6. **Week 11-12:** DevOps setup (Docker Compose + Kubernetes)
7. **Week 13-14:** Testing and quality assurance
8. **Week 15:** Production deployment and monitoring

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [12-Factor App](https://12factor.net/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Ready to build enterprise-grade SaaS? Let's get started! 🚀**
