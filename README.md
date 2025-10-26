# ComplianceIQ Installation Guide

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **Python**: 3.11 (if running locally without Docker)
- **PostgreSQL**: 16 (if running locally without Docker)
- **ServiceNow Instance**: Personal Developer Instance (PDI) or enterprise instance

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
   docker-compose -f docker-compose.microservices.yml build
   docker-compose -f docker-compose.microservices.yml up -d
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


