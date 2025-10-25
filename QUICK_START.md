# ComplianceIQ - Quick Start Guide

> Get up and running in 10 minutes

This guide will help you get ComplianceIQ running on your local machine for development and testing.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Docker Desktop** installed (Windows/Mac) or Docker Engine (Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Version: 20.10 or higher

- ✅ **Docker Compose** (included with Docker Desktop)
  - Version: 1.29 or higher

- ✅ **Git** for cloning the repository
  - Download: https://git-scm.com/downloads

- ✅ **8GB RAM** minimum (16GB recommended)
- ✅ **20GB free disk space**

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/ComplianceIQ.git
cd ComplianceIQ
```

---

## Step 2: Configure Environment

### Create .env file

```bash
# Copy the example environment file
cp .env.example .env
```

### Edit .env file

Open `.env` in your favorite text editor and update these values:

```env
# Minimum required changes for local development:

# Database password (change from default)
DB_PASSWORD=my_secure_database_password_123

# Redis password (change from default)
REDIS_PASSWORD=my_secure_redis_password_123

# RabbitMQ password (change from default)
RABBITMQ_PASSWORD=my_secure_rabbitmq_password_123

# JWT secret (generate a random string)
# Run: openssl rand -hex 32
JWT_SECRET_KEY=your-random-64-character-hex-string-here

# Encryption key (for ServiceNow credentials)
# Run: openssl rand -base64 32
ENCRYPTION_KEY=your-random-base64-key-here
```

**Generating secure keys:**

**Windows (PowerShell):**
```powershell
# JWT Secret
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })

# Encryption Key
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Linux/Mac:**
```bash
# JWT Secret
openssl rand -hex 32

# Encryption Key
openssl rand -base64 32
```

---

## Step 3: Start the Platform

### Windows (PowerShell)

```powershell
.\scripts\start.ps1
```

### Linux / Mac

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### What happens during startup:

1. **Infrastructure services start** (databases, Redis, RabbitMQ, MinIO)
2. **Wait 30 seconds** for databases to be healthy
3. **Microservices start** (Auth, User, Organization, Instance, Analysis, etc.)
4. **Wait 15 seconds** for services to be ready
5. **API Gateway starts** (Kong)
6. **Frontend starts** (React application)

**Total startup time: ~2-3 minutes**

---

## Step 4: Verify Installation

### Check running services

```bash
docker-compose -f docker-compose.microservices.yml ps
```

You should see all services in "Up" status.

### Access the application

Open your browser and visit:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Docs (Auth Service)**: http://localhost:8001/docs

---

## Step 5: Create Your First Account

### Option A: Using the Web UI

1. Open http://localhost:3000 in your browser
2. Click "Sign Up"
3. Fill in the registration form:
   - Email: `admin@yourcompany.com`
   - Password: `SecurePass123!@#`
   - Organization Name: `Your Company Inc`
   - First Name: `John`
   - Last Name: `Doe`
4. Click "Create Account"
5. You'll be automatically logged in

### Option B: Using cURL (API)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePass123!@#",
    "organization_name": "Your Company Inc",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@yourcompany.com",
    "organization_id": "987fcdeb-51a2-43d9-8765-123456789abc",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Save your `access_token` - you'll need it for API requests!**

---

## Step 6: Add a ServiceNow Instance

### Option A: Using the Web UI

1. Log in to http://localhost:3000
2. Navigate to "Instances" in the sidebar
3. Click "Add Instance"
4. Fill in the form:
   - Instance Name: `Production`
   - Instance URL: `https://dev123456.service-now.com`
   - API User: `admin`
   - API Token: `your-servicenow-token`
5. Click "Test Connection"
6. Click "Save"

### Option B: Using cURL (API)

```bash
# Replace YOUR_ACCESS_TOKEN with the token from Step 5
curl -X POST http://localhost:8000/api/v1/instances \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "instance_name": "Production",
    "instance_url": "https://dev123456.service-now.com",
    "api_user": "admin",
    "api_token": "your-servicenow-token",
    "metadata": {
      "environment": "production",
      "region": "us-west-2"
    }
  }'
```

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "instance_name": "Production",
  "instance_url": "https://dev123456.service-now.com",
  "is_active": true,
  "created_at": "2025-01-15T10:35:00Z"
}
```

---

## Step 7: Run Your First Analysis

### Control Effectiveness Analysis

```bash
curl -X POST http://localhost:8000/api/v1/analysis/controls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "instance_id": "YOUR_INSTANCE_ID",
    "controls": [
      {
        "control_id": "CTRL-001",
        "name": "Access Control Policy",
        "description": "Multi-factor authentication for all users",
        "procedures": "1. Enable MFA for all users\n2. Configure authentication policies\n3. Monitor compliance",
        "coverage": "All users and systems",
        "maturity_level": "Optimized",
        "categories": ["Access Management", "Security"]
      },
      {
        "control_id": "CTRL-002",
        "name": "Data Encryption",
        "description": "Encrypt data at rest and in transit",
        "procedures": "Use AES-256 encryption",
        "coverage": "All sensitive data",
        "maturity_level": "Managed",
        "categories": ["Data Security", "Encryption"]
      }
    ]
  }'
```

**Response:**
```json
{
  "average_effectiveness": 0.85,
  "total_controls": 2,
  "high_effectiveness": 1,
  "medium_effectiveness": 1,
  "low_effectiveness": 0,
  "insights": [
    {
      "control_id": "CTRL-001",
      "effectiveness_score": 1.0,
      "status": "high",
      "recommendation": "Control is well-implemented and effective"
    },
    {
      "control_id": "CTRL-002",
      "effectiveness_score": 0.7,
      "status": "medium",
      "recommendation": "Consider documenting procedures in more detail"
    }
  ],
  "generated_at": "2025-01-15T10:40:00Z"
}
```

---

## Step 8: View Dashboard

### Web UI

1. Log in to http://localhost:3000
2. Navigate to "Dashboard"
3. Select your instance from the dropdown
4. View metrics:
   - Total Controls
   - Total Risks
   - Average Effectiveness
   - Compliance Score
   - Recent Analysis
   - Trends and Charts

### API

```bash
curl -X GET http://localhost:8000/api/v1/dashboard/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Common Tasks

### View Logs

```bash
# All services
docker-compose -f docker-compose.microservices.yml logs -f

# Specific service (e.g., auth-service)
docker-compose -f docker-compose.microservices.yml logs -f auth-service

# Last 50 lines
docker-compose -f docker-compose.microservices.yml logs --tail=50 auth-service
```

### Restart a Service

```bash
docker-compose -f docker-compose.microservices.yml restart auth-service
```

### Stop All Services

**Windows:**
```powershell
.\scripts\stop.ps1
```

**Linux/Mac:**
```bash
./scripts/stop.sh
```

### Remove All Data (Fresh Start)

```bash
# WARNING: This deletes all data!
docker-compose -f docker-compose.microservices.yml down -v
```

---

## Troubleshooting

### Problem: Services won't start

**Solution 1: Check Docker is running**
```bash
docker --version
docker-compose --version
```

**Solution 2: Check ports are available**

Ensure these ports are not in use:
- 8000, 8001-8012 (Services)
- 5432-5436 (Databases)
- 6379 (Redis)
- 5672, 15672 (RabbitMQ)
- 9000, 9001 (MinIO)
- 3000 (Frontend)

**Solution 3: Check Docker resources**

Go to Docker Desktop → Settings → Resources:
- Memory: At least 8GB (16GB recommended)
- CPUs: At least 4 cores
- Disk: At least 20GB free

### Problem: Database connection errors

**Solution: Wait longer for databases**

Edit `scripts/start.sh` or `scripts/start.ps1` and increase sleep time:
```bash
# Change from 30 to 60 seconds
sleep 60
```

### Problem: "Permission denied" on Linux

**Solution: Make scripts executable**
```bash
chmod +x scripts/*.sh
```

### Problem: Frontend can't connect to API

**Solution 1: Check API Gateway is running**
```bash
docker-compose -f docker-compose.microservices.yml ps kong
```

**Solution 2: Check CORS settings**

In `.env`, ensure:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Problem: 401 Unauthorized errors

**Solution: Check token is valid and not expired**

Tokens expire after 15 minutes. Get a new token:
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

---

## Next Steps

Now that you have ComplianceIQ running:

1. **Read the Documentation**
   - [Microservices Architecture](MICROSERVICES_ARCHITECTURE.md)
   - [Implementation Guide](IMPLEMENTATION_GUIDE.md)
   - [API Reference](http://localhost:8001/docs)

2. **Explore the API**
   - Auth Service: http://localhost:8001/docs
   - User Service: http://localhost:8002/docs
   - Instance Service: http://localhost:8004/docs
   - Analysis Service: http://localhost:8005/docs

3. **Customize the Platform**
   - Add more ServiceNow instances
   - Configure subscription plans
   - Set up email notifications
   - Create custom roles and permissions

4. **Deploy to Production**
   - Review [Kubernetes deployment guide](IMPLEMENTATION_GUIDE.md#kubernetes-deployment)
   - Configure production environment variables
   - Set up monitoring and alerting
   - Enable HTTPS and SSL certificates

---

## Additional Resources

- **API Documentation**: http://localhost:8000/docs (via API Gateway)
- **RabbitMQ Management**: http://localhost:15672 (user: complianceiq)
- **MinIO Console**: http://localhost:9001 (user: complianceiq)
- **Grafana Dashboards**: http://localhost:3001 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090

---

## Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the `/docs` folder
- **Email Support**: support@complianceiq.com
- **Community Forum**: [Forum URL]

---

**Congratulations! You're now ready to use ComplianceIQ!** 🎉

For production deployment, see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
