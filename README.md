# ComplianceIQ - GRC AI Analysis Tool

> AI-Powered Governance, Risk, and Compliance Intelligence Platform for ServiceNow

ComplianceIQ is a comprehensive GRC (Governance, Risk, and Compliance) analysis tool that integrates with ServiceNow to provide real-time AI-powered insights, risk analysis, control effectiveness evaluation, and compliance gap detection. Built with FastAPI, PostgreSQL, and modern ML frameworks.

---

## Quick Start

**Want to get started in 5 minutes?** See [START_HERE.md](START_HERE.md) for step-by-step setup instructions.

For complete port reference, see [PORT_REFERENCE.md](PORT_REFERENCE.md).

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Core Capabilities

- **Multi-Instance ServiceNow Integration**: Manage and analyze multiple ServiceNow instances simultaneously
- **AI-Powered Control Effectiveness Analysis**: Evaluate control maturity, coverage, and procedural strength
- **Risk Correlation Engine**: Automatically map risks to controls using intelligent category matching
- **Compliance Gap Detection**: Identify regulatory and policy compliance gaps with evidence analysis
- **Predictive Analytics**: Forecast control effectiveness and risk trends
- **Real-Time Dashboard**: Executive dashboard with live metrics and KPIs
- **Widget Deployment**: Push analytics configurations directly to ServiceNow dashboards
- **Historical Tracking**: Maintain timestamped analysis results for trend analysis
- **Secure Multi-Tenant Architecture**: Isolated data and analysis per ServiceNow instance

### Analysis Modules

1. **Control Effectiveness Analyzer**
   - Evaluates control procedures, coverage, and maturity levels
   - Generates effectiveness scores (0.0 - 1.0)
   - Provides actionable recommendations

2. **Risk Correlation Engine**
   - Maps risks to controls based on category alignment
   - Calculates coverage metrics
   - Identifies unmitigated risks

3. **Compliance Gap Analyzer**
   - Scans for compliance deficiencies
   - Evaluates evidence strength
   - Prioritizes remediation actions

4. **Predictive Analytics**
   - Forecasts control effectiveness trends
   - Calculates risk exposure over time
   - Supports proactive decision-making

5. **NLP Regulatory Scanner** (Placeholder)
   - Natural language processing for regulatory text
   - Automated compliance mapping
   - Regulatory change detection

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Layer                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Web Browser    │        │   REST Clients   │          │
│  │  (Dashboard UI)  │        │   (API Consumers)│          │
│  └────────┬─────────┘        └────────┬─────────┘          │
└───────────┼──────────────────────────┼────────────────────┘
            │                           │
            │   HTTP/HTTPS              │ REST API
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             FastAPI Application                      │  │
│  │  ┌──────────────┐        ┌──────────────────────┐   │  │
│  │  │  Web Router  │        │    API Router        │   │  │
│  │  │  (Templates) │        │  (REST Endpoints)    │   │  │
│  │  └──────┬───────┘        └──────┬───────────────┘   │  │
│  │         │                       │                    │  │
│  │         └───────────┬───────────┘                    │  │
│  │                     ▼                                │  │
│  │         ┌───────────────────────┐                    │  │
│  │         │  Security Middleware  │                    │  │
│  │         │  (Session + API Key)  │                    │  │
│  │         └───────────┬───────────┘                    │  │
│  └─────────────────────┼────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │   ServiceNow     │  │   Analysis       │               │
│  │   Connector      │  │   Service        │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                     │                          │
│  ┌────────┴─────────┐  ┌────────┴─────────┐               │
│  │   Dashboard      │  │   Operations     │               │
│  │   Service        │  │   Service        │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                     │                          │
│  ┌────────┴─────────┐  ┌────────┴─────────┐               │
│  │   Insights       │  │   Widget         │               │
│  │   Service        │  │   Service        │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐           │  │
│  │  │ ServiceNow      │  │  Control Data   │           │  │
│  │  │ Instances       │  │  (Synced)       │           │  │
│  │  └────────┬────────┘  └────────┬────────┘           │  │
│  │           │                    │                     │  │
│  │  ┌────────┴────────┐  ┌────────┴────────┐           │  │
│  │  │  Risk Data      │  │ Analysis        │           │  │
│  │  │  (Synced)       │  │ Results         │           │  │
│  │  └─────────────────┘  └─────────────────┘           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐           │  │
│  │  │ Widget Config   │  │  ML Models      │           │  │
│  │  └─────────────────┘  └─────────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│               External Integration                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       ServiceNow Instance (External)                 │  │
│  │  - GRC Tables (Controls, Risks, Compliance)          │  │
│  │  - REST API Endpoints                                │  │
│  │  - Dashboard Widgets                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.110.0 (Python 3.11)
- **ASGI Server**: Uvicorn 0.27.0
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL 16
- **Database Driver**: psycopg2-binary 2.9.9
- **Validation**: Pydantic 2.7.4

### Machine Learning / AI
- **ML Framework**: TensorFlow 2.16.1
- **ML Library**: scikit-learn 1.4.2

### Frontend
- **Template Engine**: Jinja2 3.1.4
- **JavaScript**: Vanilla ES6+
- **CSS**: Custom design system

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Logging**: python-json-logger 2.0.7
- **Configuration**: pydantic-settings 2.3.2

---

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **Python**: 3.11 (if running locally without Docker)
- **PostgreSQL**: 16 (if running locally without Docker)
- **ServiceNow Instance**: Personal Developer Instance (PDI) or enterprise instance

---

## Installation

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GRC-AI
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Verify installation**
   ```bash
   docker-compose ps
   # Both postgres and backend should be running
   ```

5. **Access the application**
   - Main API Gateway: http://localhost:9000
   - Auth Service API: http://localhost:9001/docs
   - Frontend: http://localhost:3500
   - Auth Database: localhost:54330

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Start PostgreSQL**
   ```bash
   # Install and start PostgreSQL 16
   # Create database: complianceiq
   ```

3. **Configure environment**
   ```bash
   export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/complianceiq"
   export ADMIN_EMAIL="admin@complianceiq.local"
   export ADMIN_PASSWORD="ChangeMe123!"
   export SERVICE_ACCOUNT_TOKEN="your-secure-token"
   ```

4. **Run the application**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application Settings
APP_NAME=ComplianceIQ Backend
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-secret-key-change-me-in-production
API_PREFIX=/api/v1

# Authentication
SERVICE_ACCOUNT_TOKEN=your-service-account-token
ADMIN_EMAIL=admin@complianceiq.local
ADMIN_PASSWORD=SecurePassword123!

# Database
DATABASE_URL=postgresql+psycopg2://complianceiq:complianceiq@postgres:5432/complianceiq

# CORS
ALLOWED_ORIGINS=["http://localhost:8100","https://yourdomain.com"]

# ServiceNow
SERVICENOW_TIMEOUT_SECONDS=15

# Optional: Default ServiceNow PDI Instance
DEFAULT_SERVICENOW_INSTANCE_NAME=PDI
DEFAULT_SERVICENOW_INSTANCE_URL=https://dev123456.service-now.com/
DEFAULT_SERVICENOW_API_USER=admin
DEFAULT_SERVICENOW_API_TOKEN=your-servicenow-token
```

### Docker Compose Configuration

Edit [docker-compose.microservices.yml](docker-compose.microservices.yml) to customize:
- Port mappings (current: 9000-9012 for services, 54330-54360 for DBs)
- PostgreSQL credentials
- Resource limits
- Volume mounts

See [PORT_REFERENCE.md](PORT_REFERENCE.md) for complete port mapping details.

---

## Usage

### Web Interface

1. **Login**
   - Navigate to http://localhost:3500
   - Use credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`

2. **Add ServiceNow Instance**
   - Go to Settings page
   - Fill in the form:
     - Instance Name (e.g., "Production")
     - Instance URL (e.g., "https://dev12345.service-now.com")
     - API User
     - API Token
     - Metadata (optional JSON)
   - Click "Add Instance"

3. **View Dashboard**
   - Navigate to Dashboard
   - Select an instance from the dropdown
   - View metrics: Total Controls, Total Risks, Active Widgets
   - Review compliance analytics and exceptions
   - View risk timeline

4. **Trigger Analysis**
   - From Dashboard, click "Replay Control Analysis" or "Replay Risk Analysis"
   - Analysis results will appear in the insights panel

### API Usage

#### Authentication

All API requests require either:
- **Session Cookie**: Obtained via `/login` (for browser-based clients)
- **API Key Header**: `X-API-Key: your-service-account-token` (for service-to-service)

#### Example API Calls

**1. Register User (Auth Service)**
```bash
curl -X POST http://localhost:9001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@complianceiq.com",
    "password": "SecurePassword123!",
    "full_name": "Admin User"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:9001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@complianceiq.com",
    "password": "SecurePassword123!"
  }'
```

**3. Access Protected Endpoint**
```bash
curl http://localhost:9001/api/v1/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

**4. Refresh Token**
```bash
curl -X POST http://localhost:9001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<your-refresh-token>"
  }'
```

**Note:** All service endpoints follow the pattern: `http://localhost:900X/api/v1/...` where X is the service number. See [PORT_REFERENCE.md](PORT_REFERENCE.md) for complete port mapping.

---

## API Documentation

### Interactive API Docs

Each microservice has its own API documentation:

- **Auth Service**: http://localhost:9001/docs
- **User Service**: http://localhost:9002/docs
- **Organization Service**: http://localhost:9003/docs
- **Instance Service**: http://localhost:9004/docs
- **Analysis Service**: http://localhost:9005/docs
- **Insights Service**: http://localhost:9006/docs
- **Widget Service**: http://localhost:9007/docs
- **Dashboard Service**: http://localhost:9008/docs
- **Notification Service**: http://localhost:9009/docs
- **Audit Service**: http://localhost:9010/docs

See [PORT_REFERENCE.md](PORT_REFERENCE.md) for complete list.

### API Endpoints (Microservices)

| Service | Method | Endpoint | Description | Port |
|---------|--------|----------|-------------|------|
| **Auth Service** |
| | POST | `/api/v1/auth/register` | Register new user | 9001 |
| | POST | `/api/v1/auth/login` | Login user | 9001 |
| | POST | `/api/v1/auth/refresh` | Refresh access token | 9001 |
| | GET | `/api/v1/auth/me` | Get current user | 9001 |
| | POST | `/api/v1/auth/verify-email` | Verify email | 9001 |
| | POST | `/api/v1/auth/forgot-password` | Request password reset | 9001 |
| | POST | `/api/v1/auth/reset-password` | Reset password | 9001 |
| | POST | `/api/v1/auth/logout` | Logout user | 9001 |
| **User Service** |
| | GET | `/api/v1/users` | List users | 9002 |
| | GET | `/api/v1/users/{id}` | Get user details | 9002 |
| | PUT | `/api/v1/users/{id}` | Update user | 9002 |
| | DELETE | `/api/v1/users/{id}` | Delete user | 9002 |
| **Organization Service** |
| | POST | `/api/v1/organizations` | Create organization | 9003 |
| | GET | `/api/v1/organizations` | List organizations | 9003 |
| | GET | `/api/v1/organizations/{id}` | Get organization | 9003 |
| | PUT | `/api/v1/organizations/{id}` | Update organization | 9003 |
| **Instance Service** |
| | POST | `/api/v1/instances` | Connect ServiceNow instance | 9004 |
| | GET | `/api/v1/instances` | List instances | 9004 |
| | GET | `/api/v1/instances/{id}` | Get instance | 9004 |
| | PUT | `/api/v1/instances/{id}` | Update instance | 9004 |
| | DELETE | `/api/v1/instances/{id}` | Delete instance | 9004 |
| **Analysis Service** |
| | POST | `/api/v1/analysis/controls` | Analyze controls | 9005 |
| | POST | `/api/v1/analysis/risks` | Analyze risks | 9005 |
| | POST | `/api/v1/analysis/compliance` | Analyze compliance | 9005 |
| **Insights Service** |
| | GET | `/api/v1/insights` | List insights | 9006 |
| | GET | `/api/v1/insights/{id}` | Get insight details | 9006 |
| **Dashboard Service** |
| | GET | `/api/v1/dashboard/summary` | Get summary metrics | 9008 |
| | GET | `/api/v1/dashboard/metrics` | Get detailed metrics | 9008 |

**All endpoints require JWT authentication** (except register, login, forgot-password)

See individual service documentation at `http://localhost:900X/docs` where X is the service number.

---

## Database Schema

### Core Tables

**servicenow_instances**
```sql
- id (UUID, PK)
- instance_name (VARCHAR, UNIQUE)
- instance_url (VARCHAR, UNIQUE)
- api_user (VARCHAR)
- api_token_hash (VARCHAR) -- SHA-256 hash
- instance_metadata (JSONB)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**control_data**
```sql
- id (UUID, PK)
- instance_id (UUID, FK -> servicenow_instances.id)
- control_id (VARCHAR)
- name (VARCHAR)
- description (TEXT)
- attributes (JSONB) -- procedures, coverage, maturity_level, categories
- synced_at (TIMESTAMP)
```

**risk_data**
```sql
- id (UUID, PK)
- instance_id (UUID, FK -> servicenow_instances.id)
- risk_id (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- attributes (JSONB) -- likelihood, impact, tags
- synced_at (TIMESTAMP)
```

**analysis_results**
```sql
- id (UUID, PK)
- instance_id (UUID, FK -> servicenow_instances.id)
- analysis_type (VARCHAR) -- 'control', 'risk', 'compliance'
- summary (TEXT)
- payload (JSONB) -- scores, insights, gaps, metrics
- generated_at (TIMESTAMP)
```

**widget_configurations**
```sql
- id (UUID, PK)
- instance_id (UUID, FK -> servicenow_instances.id)
- widget_name (VARCHAR)
- configuration (JSONB)
- pushed_at (TIMESTAMP)
```

**ml_models**
```sql
- id (UUID, PK)
- instance_id (UUID, FK -> servicenow_instances.id)
- model_name (VARCHAR)
- version (VARCHAR)
- storage_uri (VARCHAR)
- model_metadata (JSONB)
- trained_at (TIMESTAMP)
```

### Relationships

- All tables have foreign key relationships to `servicenow_instances`
- Cascade delete: Deleting an instance removes all associated data
- JSONB columns provide schema flexibility for custom attributes

---

## Security

### Authentication Methods

1. **Session-Based (Web UI)**
   - Username/password login
   - Secure session cookies (`ciq_session`)
   - CSRF protection via session validation

2. **API Key (REST API)**
   - Header: `X-API-Key: <token>`
   - Service account token from environment variables
   - Validates against `SERVICE_ACCOUNT_TOKEN`

### Security Best Practices

- **Token Storage**: ServiceNow API tokens stored as SHA-256 hashes
- **Environment Variables**: Sensitive credentials never hardcoded
- **HTTPS**: Enable in production with reverse proxy (nginx/traefik)
- **CORS**: Configure `ALLOWED_ORIGINS` for production domains
- **Session Security**: Set `https_only=True` in production
- **Database Access**: Use least-privilege database users
- **Secret Rotation**: Regularly rotate `SECRET_KEY` and API tokens

### Production Hardening

```env
# Production .env
DEBUG=false
ENVIRONMENT=production
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALLOWED_ORIGINS=["https://complianceiq.yourdomain.com"]

# Enable HTTPS-only cookies in app/main.py
SessionMiddleware(..., https_only=True)
```

---

## Development

### Project Structure

```
GRC-AI/
├── app/
│   ├── api/                    # REST API layer
│   │   ├── routes/             # API endpoints
│   │   ├── router.py           # API router aggregator
│   │   └── dependencies.py     # Dependency injection
│   ├── web/                    # Web UI layer
│   │   ├── templates/          # Jinja2 HTML templates
│   │   ├── static/             # CSS, JavaScript
│   │   └── router.py           # Web routes
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic
│   ├── db/                     # Database configuration
│   ├── core/                   # Application core (config, security)
│   └── main.py                 # FastAPI application factory
├── scripts/                    # Deployment scripts
├── tests/                      # Test suite
├── Dockerfile                  # Container image
├── docker-compose.yml          # Multi-container orchestration
├── requirements.txt            # Python dependencies
└── .env                        # Environment configuration
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

### Code Quality

```bash
# Format code
black app/

# Lint code
pylint app/

# Type checking
mypy app/
```

### Adding New Features

1. **Create Model** (if needed): `app/models/your_model.py`
2. **Create Schema**: `app/schemas/your_schema.py`
3. **Create Service**: `app/services/your_service.py`
4. **Create Route**: `app/api/routes/your_route.py`
5. **Register Route**: Import in `app/api/router.py`
6. **Write Tests**: `tests/test_your_feature.py`

---

## Deployment

### Docker Deployment

**Production docker-compose.yml**
```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: complianceiq
      POSTGRES_USER: complianceiq
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s

  backend:
    image: complianceiq-backend:latest
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+psycopg2://complianceiq:${DB_PASSWORD}@postgres:5432/complianceiq
      SERVICE_ACCOUNT_TOKEN: ${SERVICE_ACCOUNT_TOKEN}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: production
      DEBUG: false
    ports:
      - "8000:8000"

  nginx:
    image: nginx:alpine
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
```

### Kubernetes Deployment

```yaml
# Example Kubernetes manifests
apiVersion: apps/v1
kind: Deployment
metadata:
  name: complianceiq-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: complianceiq
  template:
    metadata:
      labels:
        app: complianceiq
    spec:
      containers:
      - name: backend
        image: complianceiq-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: complianceiq-secrets
              key: database-url
```

### Health Checks

- **Database**: `pg_isready` command in postgres container
- **Backend**: FastAPI automatic `/docs` endpoint
- **Custom Health**: Add `/health` endpoint if needed

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: FATAL: password authentication failed for user "complianceiq"
```
**Solution**: Check `DATABASE_URL` in `.env` matches postgres credentials

**2. Port Already in Use**
```
Error: Bind for 0.0.0.0:8100 failed: port is already allocated
```
**Solution**: Change port mapping in `docker-compose.yml` or stop conflicting service

**3. Session Cookie Not Set**
```
Error: 401 Unauthorized on dashboard
```
**Solution**: Ensure you've logged in via `/login` endpoint first

**4. ServiceNow Connection Timeout**
```
Error: Connection timeout to ServiceNow instance
```
**Solution**: Check `SERVICENOW_TIMEOUT_SECONDS` and instance URL accessibility

**5. Migration Issues**
```
Error: Table already exists
```
**Solution**: Drop database and recreate or use Alembic migrations

### Logs

**View Docker logs**
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

**Log format**: JSON-structured logs with timestamp, level, message

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

[Specify your license here, e.g., MIT, Apache 2.0, etc.]

---

## Support

For issues, questions, or contributions:
- **GitHub Issues**: [Repository Issues Page]
- **Email**: admin@complianceiq.local
- **Getting Started**: [START_HERE.md](START_HERE.md)
- **Port Reference**: [PORT_REFERENCE.md](PORT_REFERENCE.md)
- **API Documentation**: http://localhost:9001/docs (Auth Service)

---

## Acknowledgments

- FastAPI framework and community
- ServiceNow developer resources
- TensorFlow and scikit-learn teams

---

**Built with FastAPI, PostgreSQL, and AI/ML frameworks**

*ComplianceIQ - Intelligent GRC Analysis for Modern Enterprises*
