# ComplianceIQ - Microservices Architecture Design

> Enterprise-Grade Multi-Tenant SaaS Platform for GRC Analysis

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Microservices Breakdown](#microservices-breakdown)
3. [Technology Stack](#technology-stack)
4. [Database Strategy](#database-strategy)
5. [Authentication & Authorization](#authentication--authorization)
6. [Multi-Tenancy Model](#multi-tenancy-model)
7. [API Gateway Pattern](#api-gateway-pattern)
8. [Service Communication](#service-communication)
9. [Deployment Strategy](#deployment-strategy)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐│
│  │  Web Application │     │  Mobile Apps     │     │  External APIs  ││
│  │  (React/Vue)     │     │  (iOS/Android)   │     │  (Partners)     ││
│  └────────┬─────────┘     └────────┬─────────┘     └────────┬────────┘│
└───────────┼────────────────────────┼────────────────────────┼─────────┘
            │                        │                        │
            └────────────────────────┼────────────────────────┘
                                     │ HTTPS/WSS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Kong / Nginx / Traefik                         │ │
│  │  - SSL/TLS Termination                                            │ │
│  │  - Rate Limiting (per tenant)                                     │ │
│  │  - JWT Token Validation                                           │ │
│  │  - Request Routing                                                │ │
│  │  - Load Balancing                                                 │ │
│  │  - API Versioning                                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 ├─────────────┬─────────────┬─────────────┬─────────────┐
                 ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                                │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Auth       │  │   User       │  │Organization  │  │  Instance  │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  │              │  │              │  │              │  │            │ │
│  │ :8001        │  │ :8002        │  │ :8003        │  │ :8004      │ │
│  │              │  │              │  │              │  │            │ │
│  │- Register    │  │- Profile     │  │- Tenant Mgmt │  │- SN Connect│ │
│  │- Login       │  │- Roles       │  │- Billing     │  │- Instance  │ │
│  │- JWT Issue   │  │- Preferences │  │- Team Mgmt   │  │  CRUD      │ │
│  │- Refresh     │  │- MFA         │  │- Limits      │  │- Sync Data │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Analysis    │  │   Insights   │  │   Widget     │  │ Dashboard  │ │
│  │  Service     │  │   Service    │  │   Service    │  │  Service   │ │
│  │              │  │              │  │              │  │            │ │
│  │ :8005        │  │ :8006        │  │ :8007        │  │ :8008      │ │
│  │              │  │              │  │              │  │            │ │
│  │- Control     │  │- Get Results │  │- Config      │  │- Metrics   │ │
│  │  Analysis    │  │- History     │  │- Deploy      │  │- Analytics │ │
│  │- Risk        │  │- Export      │  │- Templates   │  │- Reports   │ │
│  │  Analysis    │  │- Compare     │  │- Manage      │  │- Export    │ │
│  │- Compliance  │  │- Search      │  │              │  │            │ │
│  │- Predictive  │  │              │  │              │  │            │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Notification │  │   Audit      │  │   ML/AI      │  │  Webhook   │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  │              │  │              │  │              │  │            │ │
│  │ :8009        │  │ :8010        │  │ :8011        │  │ :8012      │ │
│  │              │  │              │  │              │  │            │ │
│  │- Email       │  │- Event Log   │  │- Model Train │  │- Events    │ │
│  │- SMS         │  │- Compliance  │  │- Predictions │  │- Triggers  │ │
│  │- Webhooks    │  │- Activity    │  │- NLP Scanner │  │- Callbacks │ │
│  │- In-App      │  │- Reports     │  │- Insights    │  │            │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MESSAGE BROKER LAYER                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │        RabbitMQ / Apache Kafka / Redis Streams                    │ │
│  │  - Async Communication                                            │ │
│  │  - Event Streaming                                                │ │
│  │  - Job Queues                                                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                      │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  PostgreSQL  │  │  PostgreSQL  │  │  PostgreSQL  │  │ PostgreSQL │ │
│  │  (Auth DB)   │  │  (Core DB)   │  │  (Analysis)  │  │ (Audit DB) │ │
│  │              │  │              │  │              │  │            │ │
│  │- users       │  │- orgs        │  │- controls    │  │- audit_log │ │
│  │- sessions    │  │- instances   │  │- risks       │  │- events    │ │
│  │- tokens      │  │- teams       │  │- results     │  │- compliance│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │    Redis     │  │  MinIO/S3    │  │ Elasticsearch│                 │
│  │    (Cache)   │  │  (Storage)   │  │  (Search)    │                 │
│  │              │  │              │  │              │                 │
│  │- Sessions    │  │- Reports     │  │- Full-text   │                 │
│  │- Rate Limit  │  │- Exports     │  │- Analytics   │                 │
│  │- Temp Data   │  │- ML Models   │  │- Logs        │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  ServiceNow  │  │   SendGrid   │  │    Stripe    │                 │
│  │     API      │  │   (Email)    │  │  (Billing)   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Microservices Breakdown

### 2.1 Auth Service (Port 8001)

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- Refresh token management
- Password reset workflows
- MFA/2FA support
- OAuth2/SAML integration for enterprise SSO

**Database:** PostgreSQL (auth_db)
- users
- refresh_tokens
- password_reset_tokens
- mfa_settings

**API Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/mfa/enable
POST   /api/v1/auth/mfa/verify
```

**Technology:**
- FastAPI
- PassLib (bcrypt)
- PyJWT
- Redis (token blacklist)

---

### 2.2 User Service (Port 8002)

**Responsibilities:**
- User profile management
- Role and permission management (RBAC)
- User preferences
- Team member management
- User activity tracking

**Database:** PostgreSQL (core_db)
- user_profiles
- roles
- permissions
- user_roles
- user_preferences

**API Endpoints:**
```
GET    /api/v1/users/me
PUT    /api/v1/users/me
GET    /api/v1/users/{user_id}
GET    /api/v1/users
POST   /api/v1/users/{user_id}/roles
DELETE /api/v1/users/{user_id}/roles/{role_id}
GET    /api/v1/roles
POST   /api/v1/roles
```

**Technology:**
- FastAPI
- SQLAlchemy
- Pydantic

---

### 2.3 Organization Service (Port 8003)

**Responsibilities:**
- Multi-tenant organization management
- Subscription and billing management
- Usage limits and quotas
- Team management
- Organization settings

**Database:** PostgreSQL (core_db)
- organizations
- subscriptions
- usage_metrics
- teams
- team_members
- organization_settings

**API Endpoints:**
```
POST   /api/v1/organizations
GET    /api/v1/organizations/{org_id}
PUT    /api/v1/organizations/{org_id}
DELETE /api/v1/organizations/{org_id}
GET    /api/v1/organizations/{org_id}/members
POST   /api/v1/organizations/{org_id}/members
GET    /api/v1/organizations/{org_id}/subscription
PUT    /api/v1/organizations/{org_id}/subscription
GET    /api/v1/organizations/{org_id}/usage
```

**Technology:**
- FastAPI
- SQLAlchemy
- Stripe SDK (billing)

---

### 2.4 Instance Service (Port 8004)

**Responsibilities:**
- ServiceNow instance connection management
- Instance credential storage (encrypted)
- Data synchronization
- Instance health monitoring
- Connection testing

**Database:** PostgreSQL (core_db)
- servicenow_instances
- instance_credentials (encrypted)
- sync_history
- instance_health_checks

**API Endpoints:**
```
POST   /api/v1/instances
GET    /api/v1/instances
GET    /api/v1/instances/{instance_id}
PUT    /api/v1/instances/{instance_id}
DELETE /api/v1/instances/{instance_id}
POST   /api/v1/instances/{instance_id}/test-connection
POST   /api/v1/instances/{instance_id}/sync
GET    /api/v1/instances/{instance_id}/sync-history
GET    /api/v1/instances/{instance_id}/health
```

**Technology:**
- FastAPI
- SQLAlchemy
- Cryptography (Fernet)
- Requests (ServiceNow API)

---

### 2.5 Analysis Service (Port 8005)

**Responsibilities:**
- Control effectiveness analysis
- Risk correlation analysis
- Compliance gap detection
- Predictive analytics
- Custom analysis workflows

**Database:** PostgreSQL (analysis_db)
- control_data
- risk_data
- compliance_data
- analysis_jobs
- analysis_results

**API Endpoints:**
```
POST   /api/v1/analysis/controls
POST   /api/v1/analysis/risks
POST   /api/v1/analysis/compliance
POST   /api/v1/analysis/predictive
GET    /api/v1/analysis/jobs
GET    /api/v1/analysis/jobs/{job_id}
DELETE /api/v1/analysis/jobs/{job_id}
POST   /api/v1/analysis/{instance_id}/replay
```

**Technology:**
- FastAPI
- SQLAlchemy
- Celery (async jobs)
- scikit-learn
- TensorFlow (future ML models)

---

### 2.6 Insights Service (Port 8006)

**Responsibilities:**
- Retrieve cached analysis results
- Historical trend analysis
- Result comparison
- Export results (PDF, CSV, Excel)
- Search and filter results

**Database:** PostgreSQL (analysis_db)
- insights
- insight_history
- saved_reports

**API Endpoints:**
```
GET    /api/v1/insights/{instance_id}
GET    /api/v1/insights/{instance_id}/history
GET    /api/v1/insights/{instance_id}/trends
GET    /api/v1/insights/compare
POST   /api/v1/insights/{insight_id}/export
GET    /api/v1/insights/search
POST   /api/v1/insights/{insight_id}/save
GET    /api/v1/insights/saved
```

**Technology:**
- FastAPI
- SQLAlchemy
- ReportLab (PDF)
- Pandas (CSV/Excel)

---

### 2.7 Widget Service (Port 8007)

**Responsibilities:**
- Dashboard widget configuration
- Widget templates
- Widget deployment to ServiceNow
- Widget version management

**Database:** PostgreSQL (core_db)
- widget_configurations
- widget_templates
- widget_versions

**API Endpoints:**
```
POST   /api/v1/widgets
GET    /api/v1/widgets
GET    /api/v1/widgets/{widget_id}
PUT    /api/v1/widgets/{widget_id}
DELETE /api/v1/widgets/{widget_id}
POST   /api/v1/widgets/{widget_id}/deploy
GET    /api/v1/widgets/templates
POST   /api/v1/widgets/templates
```

**Technology:**
- FastAPI
- SQLAlchemy
- Requests (ServiceNow API)

---

### 2.8 Dashboard Service (Port 8008)

**Responsibilities:**
- Aggregate metrics across instances
- Real-time analytics
- Executive dashboards
- Custom reports
- Data visualization

**Database:** PostgreSQL (analysis_db)
- dashboard_metrics
- custom_reports
- report_schedules

**API Endpoints:**
```
GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/instances/{instance_id}/metrics
GET    /api/v1/dashboard/organization/metrics
GET    /api/v1/dashboard/analytics
POST   /api/v1/dashboard/reports
GET    /api/v1/dashboard/reports
GET    /api/v1/dashboard/reports/{report_id}
```

**Technology:**
- FastAPI
- SQLAlchemy
- Redis (caching)

---

### 2.9 Notification Service (Port 8009)

**Responsibilities:**
- Email notifications
- SMS alerts
- Webhook callbacks
- In-app notifications
- Notification preferences

**Database:** PostgreSQL (core_db)
- notifications
- notification_preferences
- notification_templates
- notification_history

**API Endpoints:**
```
POST   /api/v1/notifications/send
GET    /api/v1/notifications
GET    /api/v1/notifications/{notification_id}
PUT    /api/v1/notifications/{notification_id}/read
DELETE /api/v1/notifications/{notification_id}
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
```

**Technology:**
- FastAPI
- Celery
- SendGrid/SMTP
- Twilio (SMS)
- Redis (queue)

---

### 2.10 Audit Service (Port 8010)

**Responsibilities:**
- Comprehensive audit logging
- Compliance event tracking
- User activity monitoring
- Security event logging
- Audit report generation

**Database:** PostgreSQL (audit_db)
- audit_logs
- security_events
- compliance_events
- audit_reports

**API Endpoints:**
```
POST   /api/v1/audit/log
GET    /api/v1/audit/logs
GET    /api/v1/audit/logs/{log_id}
GET    /api/v1/audit/security-events
GET    /api/v1/audit/compliance-events
POST   /api/v1/audit/reports
GET    /api/v1/audit/reports
```

**Technology:**
- FastAPI
- SQLAlchemy
- Elasticsearch (search)

---

### 2.11 ML/AI Service (Port 8011)

**Responsibilities:**
- Machine learning model training
- Predictive analytics
- NLP-based regulatory scanning
- Anomaly detection
- Model versioning

**Database:**
- PostgreSQL (ml_models metadata)
- MinIO/S3 (model storage)

**API Endpoints:**
```
POST   /api/v1/ml/train
GET    /api/v1/ml/models
GET    /api/v1/ml/models/{model_id}
POST   /api/v1/ml/predict
POST   /api/v1/ml/evaluate
DELETE /api/v1/ml/models/{model_id}
```

**Technology:**
- FastAPI
- TensorFlow
- scikit-learn
- MLflow
- Celery

---

### 2.12 Webhook Service (Port 8012)

**Responsibilities:**
- Webhook registration and management
- Event triggering
- Callback handling
- Retry logic
- Webhook security (HMAC)

**Database:** PostgreSQL (core_db)
- webhooks
- webhook_events
- webhook_deliveries

**API Endpoints:**
```
POST   /api/v1/webhooks
GET    /api/v1/webhooks
GET    /api/v1/webhooks/{webhook_id}
PUT    /api/v1/webhooks/{webhook_id}
DELETE /api/v1/webhooks/{webhook_id}
GET    /api/v1/webhooks/{webhook_id}/deliveries
POST   /api/v1/webhooks/{webhook_id}/test
```

**Technology:**
- FastAPI
- Celery
- Requests
- HMAC signing

---

## 3. Technology Stack

### Core Technologies
- **Programming Language:** Python 3.11+
- **Framework:** FastAPI 0.110.0+
- **ASGI Server:** Uvicorn
- **API Gateway:** Kong / Nginx / Traefik
- **Service Mesh:** Istio (optional, for K8s)

### Data Storage
- **Primary Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Object Storage:** MinIO / AWS S3
- **Search Engine:** Elasticsearch 8
- **Message Broker:** RabbitMQ / Apache Kafka

### DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions / GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger / Zipkin
- **Service Discovery:** Consul / Kubernetes DNS

### Security
- **Authentication:** JWT (RS256)
- **Authorization:** RBAC (Role-Based Access Control)
- **Secrets Management:** HashiCorp Vault / Kubernetes Secrets
- **Encryption:** TLS 1.3, AES-256
- **API Security:** OAuth2, API Keys, Rate Limiting

---

## 4. Database Strategy

### Database Per Service Pattern

Each microservice has its own database to ensure:
- **Loose Coupling:** Services are independent
- **Scalability:** Scale databases independently
- **Fault Isolation:** Database failures are contained
- **Technology Flexibility:** Use different databases if needed

```
┌──────────────────────┐
│   Auth Service       │──────> PostgreSQL (auth_db)
└──────────────────────┘

┌──────────────────────┐
│   User Service       │──────> PostgreSQL (core_db)
│   Organization Svc   │──────> Same DB (shared core data)
│   Instance Service   │──────> Same DB
│   Widget Service     │──────> Same DB
└──────────────────────┘

┌──────────────────────┐
│   Analysis Service   │──────> PostgreSQL (analysis_db)
│   Insights Service   │──────> Same DB (shared analysis data)
│   Dashboard Service  │──────> Same DB
└──────────────────────┘

┌──────────────────────┐
│   Audit Service      │──────> PostgreSQL (audit_db)
└──────────────────────┘

┌──────────────────────┐
│   All Services       │──────> Redis (shared cache)
└──────────────────────┘
```

### Multi-Tenancy Strategy

**Approach:** Shared Database with Tenant Isolation

Every table has an `organization_id` column:
- Ensures data isolation
- Cost-effective for many tenants
- Row-Level Security (RLS) policies
- Efficient for most SaaS applications

```sql
-- Example table structure
CREATE TABLE servicenow_instances (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    instance_name VARCHAR(255) NOT NULL,
    instance_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, instance_name)
);

-- Row-Level Security
ALTER TABLE servicenow_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON servicenow_instances
    USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

---

## 5. Authentication & Authorization

### JWT Token Strategy

**Access Token:**
- Short-lived (15 minutes)
- Contains: user_id, organization_id, roles, permissions
- Signed with RS256 (asymmetric)
- Validated by API Gateway

**Refresh Token:**
- Long-lived (7 days)
- Stored in Redis with user_id as key
- Used to obtain new access token
- Can be revoked

**Token Structure:**
```json
{
  "user_id": "uuid",
  "organization_id": "uuid",
  "email": "user@company.com",
  "roles": ["admin", "analyst"],
  "permissions": ["instances:read", "analysis:write"],
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "complianceiq-auth-service"
}
```

### Role-Based Access Control (RBAC)

**Default Roles:**
- **Super Admin:** Full system access (ComplianceIQ internal)
- **Organization Admin:** Full org access
- **Organization Member:** Read access to org resources
- **Analyst:** Perform analysis, read instances
- **Viewer:** Read-only access

**Permissions:**
```
organizations:create
organizations:read
organizations:update
organizations:delete
instances:create
instances:read
instances:update
instances:delete
analysis:create
analysis:read
analysis:delete
insights:read
insights:export
widgets:create
widgets:read
widgets:update
widgets:delete
users:create
users:read
users:update
users:delete
```

---

## 6. Multi-Tenancy Model

### Organization Hierarchy

```
Organization (Tenant)
├── Subscription (Plan, Limits, Billing)
├── Users (Members with roles)
├── Teams (Sub-groups within org)
├── ServiceNow Instances (Multiple per org)
│   ├── Control Data
│   ├── Risk Data
│   ├── Analysis Results
│   └── Widgets
└── Settings (Preferences, Integrations)
```

### Data Isolation

**Row-Level Security:**
- Every query automatically filtered by `organization_id`
- Enforced at database level
- Application sets session variable

**API Level:**
- JWT token contains `organization_id`
- Middleware validates access
- Services filter by tenant

---

## 7. API Gateway Pattern

### Responsibilities

1. **Authentication:** Validate JWT tokens
2. **Rate Limiting:** Per tenant/user limits
3. **Load Balancing:** Distribute requests
4. **Request Routing:** Route to correct service
5. **SSL Termination:** Handle HTTPS
6. **API Versioning:** Support /v1, /v2
7. **CORS:** Manage cross-origin requests
8. **Logging:** Centralized request logs

### Example Kong Configuration

```yaml
services:
  - name: auth-service
    url: http://auth-service:8001
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth

  - name: instance-service
    url: http://instance-service:8004
    routes:
      - name: instance-routes
        paths:
          - /api/v1/instances
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
```

---

## 8. Service Communication

### Synchronous (REST)
- Direct HTTP calls between services
- For immediate responses
- Service discovery via DNS

### Asynchronous (Events)
- RabbitMQ / Kafka for event streaming
- For decoupled operations
- Example events:
  - `user.registered`
  - `instance.created`
  - `analysis.completed`
  - `sync.started`
  - `widget.deployed`

### Event-Driven Architecture

```
Analysis Service                    Notification Service
       │                                    │
       │ 1. Complete analysis               │
       │                                    │
       │ 2. Publish event                   │
       ├───────────────────────────────────>│
       │    "analysis.completed"            │
       │                                    │
       │                            3. Consume event
       │                                    │
       │                       4. Send email notification
       │                                    │
```

---

## 9. Deployment Strategy

### Docker Compose (Development & Staging)

```yaml
version: '3.9'

services:
  # Infrastructure
  postgres-auth:
    image: postgres:16-alpine

  postgres-core:
    image: postgres:16-alpine

  postgres-analysis:
    image: postgres:16-alpine

  postgres-audit:
    image: postgres:16-alpine

  redis:
    image: redis:7-alpine

  rabbitmq:
    image: rabbitmq:3-management-alpine

  # Microservices
  auth-service:
    build: ./services/auth
    ports:
      - "8001:8000"

  user-service:
    build: ./services/user
    ports:
      - "8002:8000"

  # ... other services

  # API Gateway
  kong:
    image: kong:latest
    ports:
      - "80:8000"
      - "443:8443"
      - "8001:8001"
```

### Kubernetes (Production)

```
Namespace: complianceiq-prod

Deployments:
  - auth-service (replicas: 3)
  - user-service (replicas: 3)
  - organization-service (replicas: 3)
  - instance-service (replicas: 3)
  - analysis-service (replicas: 5)
  - insights-service (replicas: 3)
  - widget-service (replicas: 2)
  - dashboard-service (replicas: 3)
  - notification-service (replicas: 2)
  - audit-service (replicas: 2)
  - ml-service (replicas: 2)
  - webhook-service (replicas: 2)

StatefulSets:
  - postgres-auth (replicas: 3 with replication)
  - postgres-core (replicas: 3 with replication)
  - postgres-analysis (replicas: 3 with replication)
  - postgres-audit (replicas: 3 with replication)
  - redis-cluster (replicas: 6)
  - rabbitmq-cluster (replicas: 3)

Services:
  - Each deployment has a ClusterIP service
  - External LoadBalancer for API Gateway

Ingress:
  - TLS termination
  - Path-based routing
  - Rate limiting

ConfigMaps & Secrets:
  - Database connection strings
  - Service endpoints
  - API keys
  - JWT signing keys
```

---

## Summary

This microservices architecture provides:

✅ **Scalability:** Each service scales independently
✅ **Resilience:** Failure isolation between services
✅ **Maintainability:** Small, focused codebases
✅ **Multi-Tenancy:** Secure data isolation per organization
✅ **Enterprise-Ready:** RBAC, audit logging, compliance
✅ **Cloud-Native:** Kubernetes-ready deployment
✅ **Extensibility:** Add new services without impacting existing ones

This design follows industry best practices for SaaS platforms and is production-ready for corporate clients.
