# ComplianceIQ - Enterprise Multi-Tenant GRC Platform

> Production-ready microservices architecture for corporate clients

**ComplianceIQ** is an enterprise-grade, multi-tenant SaaS platform for Governance, Risk, and Compliance (GRC) analysis that integrates with ServiceNow. Built with a microservices architecture, it provides AI-powered insights, risk analysis, control effectiveness evaluation, and compliance gap detection for corporate clients.

---

## 🌟 Key Features

### For Corporate Clients

- **Multi-Tenant Architecture**: Secure data isolation per organization
- **User Account Management**: Role-based access control (RBAC) with fine-grained permissions
- **Multiple ServiceNow Instances**: Each organization can manage multiple ServiceNow instances
- **Subscription-Based**: Flexible plans (Trial, Basic, Professional, Enterprise)
- **Enterprise SSO**: OAuth2/SAML integration for single sign-on
- **Audit Logging**: Comprehensive audit trails for compliance
- **Real-Time Analytics**: Executive dashboards with live metrics
- **API-First Design**: RESTful APIs for seamless integration

### GRC Capabilities

- **Control Effectiveness Analysis**: AI-powered evaluation of control maturity and coverage
- **Risk Correlation Engine**: Automated mapping of risks to controls
- **Compliance Gap Detection**: Identify regulatory and policy gaps
- **Predictive Analytics**: Forecast trends and risk exposure
- **Custom Widgets**: Deploy analytics to ServiceNow dashboards
- **Historical Tracking**: Trend analysis and comparison reports

---

## 🏗️ Architecture Overview

### Microservices

ComplianceIQ consists of **12 independent microservices**:

| Service | Port | Description |
|---------|------|-------------|
| **Auth Service** | 8001 | User authentication, JWT tokens, password management |
| **User Service** | 8002 | User profiles, roles, permissions (RBAC) |
| **Organization Service** | 8003 | Multi-tenant management, subscriptions, billing |
| **Instance Service** | 8004 | ServiceNow instance connections and sync |
| **Analysis Service** | 8005 | Control, risk, and compliance analysis engines |
| **Insights Service** | 8006 | Historical results, trends, and exports |
| **Widget Service** | 8007 | Dashboard widget configuration and deployment |
| **Dashboard Service** | 8008 | Aggregated metrics and custom reports |
| **Notification Service** | 8009 | Email, SMS, webhooks, in-app notifications |
| **Audit Service** | 8010 | Audit logging and compliance reporting |
| **ML/AI Service** | 8011 | Machine learning models and predictions |
| **Webhook Service** | 8012 | Webhook management and event triggers |

### Infrastructure

- **API Gateway**: Kong (routing, rate limiting, authentication)
- **Databases**: PostgreSQL 16 (4 separate databases)
- **Cache**: Redis 7
- **Message Broker**: RabbitMQ 3
- **Object Storage**: MinIO (S3-compatible)
- **Monitoring**: Prometheus + Grafana
- **Search**: Elasticsearch 8 (optional)

### Technology Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Deployment**: Docker, Docker Compose, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI
- **Security**: JWT (RS256), bcrypt, TLS 1.3

---

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- Git
- (Optional) Node.js 18+ for frontend development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GRC-AI
   ```

2. **Configure environment**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Edit .env with your configuration
   # At minimum, change these:
   #   - DB_PASSWORD
   #   - REDIS_PASSWORD
   #   - JWT_SECRET_KEY
   #   - ENCRYPTION_KEY
   ```

3. **Start all services** (Windows)
   ```powershell
   .\scripts\start.ps1
   ```

   **Or on Linux/Mac**
   ```bash
   chmod +x scripts/start.sh
   ./scripts/start.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - API Docs: http://localhost:8001/docs (Auth Service)

### First Steps

1. **Register an organization**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@yourcompany.com",
       "password": "SecurePass123!@#",
       "organization_name": "Your Company Inc"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@yourcompany.com",
       "password": "SecurePass123!@#"
     }'
   ```

   Save the `access_token` from the response.

3. **Add a ServiceNow instance**
   ```bash
   curl -X POST http://localhost:8000/api/v1/instances \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "instance_name": "Production",
       "instance_url": "https://yourinstance.service-now.com",
       "api_user": "admin",
       "api_token": "your-servicenow-token"
     }'
   ```

4. **Run analysis**
   ```bash
   curl -X POST http://localhost:8000/api/v1/analysis/controls \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "instance_id": "YOUR_INSTANCE_ID",
       "controls": [...]
     }'
   ```

---

## 📚 Documentation

- **[Microservices Architecture](MICROSERVICES_ARCHITECTURE.md)** - Detailed architecture design
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation
- **[Architecture Flow Diagrams](ARCHITECTURE_FLOW.md)** - Data flow and sequence diagrams
- **API Documentation**: Available at `/docs` endpoint of each service

---

## 🔐 Security

### Authentication

- **JWT Tokens**: RS256 algorithm for access tokens
- **Refresh Tokens**: Secure token rotation with blacklist
- **Password Policy**: Strong passwords with complexity requirements
- **Account Locking**: Automatic lock after 5 failed login attempts
- **Email Verification**: Required for new accounts

### Authorization

- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Organization Isolation**: Row-level security for multi-tenancy
- **API Rate Limiting**: Per-tenant rate limits via Kong
- **Encrypted Credentials**: AES-256 encryption for ServiceNow tokens

### Compliance

- **Audit Logging**: All actions logged for compliance
- **GDPR Compliant**: Data privacy and right to deletion
- **SOC 2 Ready**: Security controls and monitoring
- **HIPAA Compatible**: Healthcare data protection (optional)

---

## 🎯 User Roles & Permissions

### Default Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Platform administrator | All permissions |
| **Organization Admin** | Organization owner | Full org access, manage users, billing |
| **Analyst** | GRC analyst | Create/view analysis, manage instances |
| **Viewer** | Read-only user | View dashboards and reports |
| **Guest** | Limited access | View shared reports only |

### Permission Model

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
billing:read
billing:update
```

---

## 📊 Subscription Plans

### Trial (14 days)
- 1 organization
- 5 users
- 3 ServiceNow instances
- Basic analysis
- Email support

### Basic ($99/month)
- 1 organization
- 10 users
- 10 ServiceNow instances
- All analysis features
- Priority email support

### Professional ($299/month)
- 1 organization
- 50 users
- 50 ServiceNow instances
- Advanced analytics
- API access
- Chat support

### Enterprise (Custom pricing)
- Multiple organizations
- Unlimited users
- Unlimited instances
- Custom ML models
- SSO/SAML
- Dedicated support
- SLA guarantees

---

## 🛠️ Development

### Project Structure

```
GRC-AI/
├── services/               # Microservices
│   ├── auth/               # Auth Service
│   │   ├── app/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── user/               # User Service
│   ├── organization/       # Organization Service
│   ├── instance/           # Instance Service
│   ├── analysis/           # Analysis Service
│   ├── insights/           # Insights Service
│   ├── widget/             # Widget Service
│   ├── dashboard/          # Dashboard Service
│   ├── notification/       # Notification Service
│   ├── audit/              # Audit Service
│   ├── ml/                 # ML/AI Service
│   ├── webhook/            # Webhook Service
│   └── frontend/           # React Frontend
├── shared/                 # Shared libraries
│   ├── models/             # Common Pydantic models
│   ├── middleware/         # Shared middleware
│   └── utils/              # Utilities (JWT, encryption, etc.)
├── k8s/                    # Kubernetes manifests
│   ├── deployments/
│   ├── services/
│   ├── configmaps/
│   ├── secrets/
│   └── ingress/
├── kong/                   # API Gateway config
│   └── kong.yml
├── scripts/                # Deployment scripts
│   ├── start.sh
│   ├── stop.sh
│   └── start.ps1
├── docker-compose.microservices.yml
├── .env.example
└── README.md
```

### Running Individual Services

```bash
# Auth Service
cd services/auth
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Repeat for other services
```

### Running Tests

```bash
# All services
pytest

# Specific service
cd services/auth
pytest tests/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🐳 Docker Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.microservices.yml logs -f

# Specific service
docker-compose -f docker-compose.microservices.yml logs -f auth-service

# Last 100 lines
docker-compose -f docker-compose.microservices.yml logs --tail=100 auth-service
```

### Restart Service

```bash
docker-compose -f docker-compose.microservices.yml restart auth-service
```

### Rebuild Service

```bash
docker-compose -f docker-compose.microservices.yml build auth-service
docker-compose -f docker-compose.microservices.yml up -d auth-service
```

### Database Access

```bash
# Auth database
docker exec -it complianceiq-postgres-auth psql -U complianceiq -d complianceiq_auth

# Core database
docker exec -it complianceiq-postgres-core psql -U complianceiq -d complianceiq_core
```

### Redis CLI

```bash
docker exec -it complianceiq-redis redis-cli -a YOUR_REDIS_PASSWORD
```

---

## ☸️ Kubernetes Deployment

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace complianceiq-prod

# Create secrets
kubectl create secret generic db-passwords \
  --from-literal=auth-db-password=YOUR_PASSWORD \
  --from-literal=core-db-password=YOUR_PASSWORD \
  --namespace complianceiq-prod

# Apply configurations
kubectl apply -f k8s/configmaps/ -n complianceiq-prod
kubectl apply -f k8s/secrets/ -n complianceiq-prod
kubectl apply -f k8s/statefulsets/ -n complianceiq-prod
kubectl apply -f k8s/deployments/ -n complianceiq-prod
kubectl apply -f k8s/services/ -n complianceiq-prod
kubectl apply -f k8s/ingress/ -n complianceiq-prod
kubectl apply -f k8s/hpa/ -n complianceiq-prod
```

### Scale Services

```bash
# Manual scaling
kubectl scale deployment auth-service --replicas=5 -n complianceiq-prod

# Horizontal Pod Autoscaler (HPA) will auto-scale based on CPU/memory
```

### View Status

```bash
kubectl get pods -n complianceiq-prod
kubectl get services -n complianceiq-prod
kubectl get ingress -n complianceiq-prod
```

---

## 📈 Monitoring & Observability

### Prometheus Metrics

Each service exposes metrics at `/metrics`:

```
http://localhost:8001/metrics  # Auth Service
http://localhost:8002/metrics  # User Service
...
```

### Grafana Dashboards

Access Grafana at http://localhost:3001

Pre-configured dashboards:
- Service health overview
- Request rates and latency
- Error rates and 5xx responses
- Database connection pools
- Cache hit rates
- Queue depths (RabbitMQ)

### Distributed Tracing

Jaeger tracing UI (if enabled):
- http://localhost:16686

### Logs

Structured JSON logging with correlation IDs for request tracing across services.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

[Specify your license]

---

## 🆘 Support

- **Documentation**: See `/docs` for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@complianceiq.com
- **Enterprise Support**: Available for Enterprise plan customers

---

## 🗺️ Roadmap

### Q1 2025
- ✅ Microservices architecture
- ✅ Multi-tenant support
- ✅ JWT authentication
- ✅ Basic GRC analysis

### Q2 2025
- [ ] Advanced ML models
- [ ] Real-time collaboration
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced reporting

### Q3 2025
- [ ] AI-powered insights
- [ ] Natural language queries
- [ ] Automated remediation
- [ ] Integration marketplace

### Q4 2025
- [ ] Predictive risk modeling
- [ ] Automated compliance reporting
- [ ] Custom workflow builder
- [ ] White-label solution

---

## 🎓 Training & Resources

- **Video Tutorials**: [YouTube Channel]
- **Webinars**: Monthly product updates
- **Certification Program**: GRC Analyst certification
- **Community Forum**: [Forum URL]

---

**Built with ❤️ for corporate GRC teams worldwide**

*ComplianceIQ - Intelligent Governance, Risk & Compliance*
