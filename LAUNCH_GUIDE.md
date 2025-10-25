# ComplianceIQ Launch Guide

## Overview

This project has **TWO different Docker Compose setups**:

1. **docker-compose.yml** - Simple monolithic setup (Legacy/Testing)
2. **docker-compose.microservices.yml** - Full microservices architecture (Production-ready)

---

## Which Setup Should You Use?

### Use `docker-compose.yml` if:
- Quick testing only
- Simple development environment
- You only need the basic backend API

### Use `docker-compose.microservices.yml` if:
- Running the full application
- Need all microservices
- Want the frontend UI
- Production-like environment

**RECOMMENDED: Use `docker-compose.microservices.yml` for the complete platform.**

---

## Architecture Comparison

### docker-compose.yml (Simple Setup)
```
┌─────────────┐
│  postgres   │ (Port 5432)
└──────┬──────┘
       │
┌──────┴──────┐
│   backend   │ (Port 8100)
└─────────────┘
```

**Services:**
- 1 PostgreSQL database
- 1 Backend service

**Limitations:**
- No frontend
- No microservices
- No API gateway
- Single database
- No message queue
- No caching

---

### docker-compose.microservices.yml (Full Platform)
```
                    ┌──────────────┐
                    │   Frontend   │ (Port 3500)
                    │ React + Vite │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  API Gateway │ (Port 9000)
                    │     Kong     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌───────┴────────┐
│ Auth Service   │  │User Service │  │  Org Service   │
│   (9001)       │  │   (9002)    │  │    (9003)      │
└───────┬────────┘  └──────┬──────┘  └───────┬────────┘
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌───────┴────────┐
│Instance Svc    │  │Analysis Svc │  │ Insights Svc   │
│   (9004)       │  │   (9005)    │  │    (9006)      │
└───────┬────────┘  └──────┬──────┘  └───────┬────────┘
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌───────┴────────┐
│ Widget Svc     │  │Dashboard Svc│  │Notification Svc│
│   (9007)       │  │   (9008)    │  │    (9009)      │
└───────┬────────┘  └──────┬──────┘  └───────┬────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌───────┴────────┐
│  PostgreSQL    │  │    Redis    │  │   RabbitMQ     │
│  4 Databases   │  │   Cache     │  │Message Queue   │
│ (5433-5436)    │  │   (6379)    │  │  (5672/15672)  │
└────────────────┘  └─────────────┘  └────────────────┘
```

**Services:**
- 10 Backend microservices (Python/FastAPI)
- 1 Frontend (React/Vite)
- 4 PostgreSQL databases
- 1 Redis cache
- 1 RabbitMQ message broker
- 1 Kong API Gateway
- 1 Celery worker (async tasks)
- Optional: Prometheus, Grafana (monitoring)

---

## Complete Launch Instructions

### Prerequisites

1. **Docker Desktop** must be running
2. **All services must be built first**

### Step 1: Build All Services

**IMPORTANT: Build services BEFORE starting them**

```powershell
# Navigate to project directory
cd F:\Servicenow\GRC-AI

# Build all microservices (takes 5-10 minutes)
docker-compose -f docker-compose.microservices.yml build

# Or build in parallel (faster)
docker-compose -f docker-compose.microservices.yml build --parallel
```

**What gets built:**
- auth-service
- user-service
- organization-service
- instance-service
- analysis-service (with Celery)
- insights-service
- widget-service
- dashboard-service
- notification-service
- audit-service
- frontend (React app)

### Step 2: Start Infrastructure Services

Start databases, cache, and message queue first:

```powershell
# Start infrastructure
docker-compose -f docker-compose.microservices.yml up -d postgres-auth postgres-core postgres-analysis postgres-audit redis rabbitmq

# Wait for databases to be ready (10-15 seconds)
Start-Sleep -Seconds 15

# Verify infrastructure is healthy
docker-compose -f docker-compose.microservices.yml ps
```

**Expected output:**
```
NAME                              STATUS
complianceiq-postgres-auth        Up (healthy)
complianceiq-postgres-core        Up (healthy)
complianceiq-postgres-analysis    Up (healthy)
complianceiq-postgres-audit       Up (healthy)
complianceiq-redis                Up
complianceiq-rabbitmq             Up (healthy)
```

### Step 3: Start Backend Services

```powershell
# Start all backend services
docker-compose -f docker-compose.microservices.yml up -d auth-service user-service organization-service instance-service analysis-service insights-service widget-service dashboard-service notification-service audit-service

# Wait for services to start (5-10 seconds)
Start-Sleep -Seconds 10

# Verify backend services
docker-compose -f docker-compose.microservices.yml ps
```

### Step 4: Start API Gateway

```powershell
# Start Kong API Gateway
docker-compose -f docker-compose.microservices.yml up -d kong

# Wait for Kong to start
Start-Sleep -Seconds 5
```

### Step 5: Start Frontend

```powershell
# Start the frontend
docker-compose -f docker-compose.microservices.yml up -d frontend

# Check frontend logs
docker-compose -f docker-compose.microservices.yml logs -f frontend
```

### Step 6: Verify Everything is Running

```powershell
# Check all services
docker-compose -f docker-compose.microservices.yml ps

# Check for any errors
docker-compose -f docker-compose.microservices.yml logs --tail=50
```

---

## Quick Start (All at Once)

If you've already built the images, you can start everything at once:

```powershell
# Start all services
docker-compose -f docker-compose.microservices.yml up -d

# View logs
docker-compose -f docker-compose.microservices.yml logs -f
```

**Or use the automated script:**

```powershell
# PowerShell
.\scripts\start.ps1
```

---

## Access the Application

### Frontend UI
- **URL:** http://localhost:3500
- **Description:** React application UI

### API Gateway (Kong)
- **Proxy:** http://localhost:9000
- **Admin API:** http://localhost:9444

### Backend Services (Direct Access)

| Service | URL | Swagger Docs |
|---------|-----|-------------|
| Auth Service | http://localhost:9001 | http://localhost:9001/docs |
| User Service | http://localhost:9002 | http://localhost:9002/docs |
| Organization Service | http://localhost:9003 | http://localhost:9003/docs |
| Instance Service | http://localhost:9004 | http://localhost:9004/docs |
| Analysis Service | http://localhost:9005 | http://localhost:9005/docs |
| Insights Service | http://localhost:9006 | http://localhost:9006/docs |
| Widget Service | http://localhost:9007 | http://localhost:9007/docs |
| Dashboard Service | http://localhost:9008 | http://localhost:9008/docs |
| Notification Service | http://localhost:9009 | http://localhost:9009/docs |
| Audit Service | http://localhost:9010 | http://localhost:9010/docs |

### Infrastructure Services

| Service | URL | Credentials |
|---------|-----|------------|
| RabbitMQ Management | http://localhost:15672 | complianceiq / rabbitmq_dev_password |
| PostgreSQL Auth | localhost:5433 | complianceiq / complianceiq_dev |
| PostgreSQL Core | localhost:5434 | complianceiq / complianceiq_dev |
| PostgreSQL Analysis | localhost:5435 | complianceiq / complianceiq_dev |
| PostgreSQL Audit | localhost:5436 | complianceiq / complianceiq_dev |
| Redis | localhost:6379 | Password: redis_dev_password |

---

## Testing the Services

### Test Backend Service Health

```powershell
# Test auth service
curl http://localhost:9001/health

# Test via API Gateway
curl http://localhost:9000/api/v1/auth/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "environment": "development"
}
```

### Test Frontend

Open browser: http://localhost:3500

You should see the ComplianceIQ frontend with:
- Service name
- Version
- Status indicator
- Environment info

---

## Troubleshooting

### Issue: Frontend won't start

**Problem:** Using `docker-compose.yml` instead of `docker-compose.microservices.yml`

**Solution:**
```powershell
# WRONG - Old compose file (no frontend)
docker-compose up -d

# CORRECT - Microservices compose file
docker-compose -f docker-compose.microservices.yml up -d
```

### Issue: Orphan containers warning

**Problem:**
```
Found orphan containers ([complianceiq-celery-worker-analysis complianceiq-analysis-service...])
```

**Solution:**
```powershell
# Clean up orphan containers
docker-compose -f docker-compose.microservices.yml down --remove-orphans

# Then start fresh
docker-compose -f docker-compose.microservices.yml up -d
```

### Issue: Service won't start or keeps restarting

**Check logs:**
```powershell
# View logs for specific service
docker-compose -f docker-compose.microservices.yml logs frontend

# View logs for all services
docker-compose -f docker-compose.microservices.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.microservices.yml logs -f frontend
```

**Common issues:**
1. **Database not ready** - Wait longer for databases to initialize
2. **Port already in use** - Another service using the same port
3. **Image not built** - Run build command first
4. **Missing dependencies** - Check Dockerfile and requirements.txt

### Issue: Port conflicts

**Check what's using a port:**
```powershell
# Windows
netstat -ano | findstr :3500

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Build failures

**Clean rebuild:**
```powershell
# Remove all containers and volumes
docker-compose -f docker-compose.microservices.yml down -v

# Clean build (no cache)
docker-compose -f docker-compose.microservices.yml build --no-cache

# Start fresh
docker-compose -f docker-compose.microservices.yml up -d
```

### Issue: Frontend shows blank page

**Check these:**
1. Is frontend container running?
   ```powershell
   docker-compose -f docker-compose.microservices.yml ps frontend
   ```

2. Check frontend logs:
   ```powershell
   docker-compose -f docker-compose.microservices.yml logs frontend
   ```

3. Verify port 3500 is accessible:
   ```powershell
   curl http://localhost:3500
   ```

4. Check browser console for errors (F12 > Console tab)

### Issue: Cannot connect to backend services

**Check network:**
```powershell
# Verify all services are on the same network
docker network inspect grc-ai_complianceiq-network
```

**Check API Gateway:**
```powershell
# Test Kong is running
curl http://localhost:9000

# Check Kong admin
curl http://localhost:9444
```

---

## Environment Variables

### Default Values (Development)

The microservices setup uses these default credentials:

**Databases:**
- Username: `complianceiq`
- Password: `complianceiq_dev`

**Redis:**
- Password: `redis_dev_password`

**RabbitMQ:**
- Username: `complianceiq`
- Password: `rabbitmq_dev_password`

### Override for Production

Create `.env` file:

```env
# Database
DB_PASSWORD=YOUR_SECURE_PASSWORD

# Redis
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# RabbitMQ
RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD

# JWT
JWT_SECRET=YOUR_JWT_SECRET_KEY

# Environment
ENVIRONMENT=production
```

Then start with:
```powershell
docker-compose -f docker-compose.microservices.yml --env-file .env up -d
```

---

## Service Dependencies

### Startup Order

1. **Infrastructure** (Start first)
   - postgres-auth, postgres-core, postgres-analysis, postgres-audit
   - redis
   - rabbitmq

2. **Core Services** (Start second)
   - auth-service (required by all others)

3. **Business Services** (Start third)
   - user-service, organization-service, instance-service
   - analysis-service (with celery-worker)
   - insights-service, widget-service, dashboard-service
   - notification-service, audit-service

4. **API Gateway** (Start fourth)
   - kong

5. **Frontend** (Start last)
   - frontend

### Service Relationships

```
Frontend → Kong → All Backend Services → Databases/Cache/Queue

auth-service → postgres-auth, redis
user-service → postgres-core, auth-service
organization-service → postgres-core, auth-service
instance-service → postgres-core, auth-service, organization-service
analysis-service → postgres-analysis, rabbitmq, redis, instance-service
insights-service → postgres-analysis, auth-service, analysis-service
widget-service → postgres-analysis, auth-service
dashboard-service → postgres-analysis, auth-service, instance-service
notification-service → postgres-core, rabbitmq, auth-service
audit-service → postgres-audit, rabbitmq, auth-service
```

---

## Complete Startup Script

Create `start-all.ps1`:

```powershell
# ComplianceIQ Complete Startup Script

Write-Host "=== ComplianceIQ Platform Startup ===" -ForegroundColor Cyan

# Step 1: Build (if needed)
Write-Host "`n1. Checking if images need to be built..." -ForegroundColor Yellow
$images = docker images -q grc-ai-frontend
if ([string]::IsNullOrEmpty($images)) {
    Write-Host "Building images (this may take 5-10 minutes)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.microservices.yml build
} else {
    Write-Host "Images already built. Skipping..." -ForegroundColor Green
}

# Step 2: Start infrastructure
Write-Host "`n2. Starting infrastructure services..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d postgres-auth postgres-core postgres-analysis postgres-audit redis rabbitmq

Write-Host "Waiting for databases to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 3: Start backend services
Write-Host "`n3. Starting backend services..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d auth-service user-service organization-service instance-service analysis-service insights-service widget-service dashboard-service notification-service audit-service celery-worker-analysis

Write-Host "Waiting for backend services to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Start API Gateway
Write-Host "`n4. Starting API Gateway (Kong)..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d kong

Start-Sleep -Seconds 5

# Step 5: Start frontend
Write-Host "`n5. Starting frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d frontend

Start-Sleep -Seconds 5

# Step 6: Check status
Write-Host "`n6. Checking service status..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml ps

# Step 7: Summary
Write-Host "`n=== Startup Complete ===" -ForegroundColor Green
Write-Host "`nApplication URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:     http://localhost:3500" -ForegroundColor White
Write-Host "  API Gateway:  http://localhost:9000" -ForegroundColor White
Write-Host "  Auth Service: http://localhost:9001/docs" -ForegroundColor White
Write-Host "  RabbitMQ:     http://localhost:15672 (complianceiq/rabbitmq_dev_password)" -ForegroundColor White
Write-Host "`nTo view logs: docker-compose -f docker-compose.microservices.yml logs -f" -ForegroundColor Yellow
Write-Host "To stop all:  docker-compose -f docker-compose.microservices.yml down" -ForegroundColor Yellow
```

Save and run:
```powershell
.\start-all.ps1
```

---

## Stopping Services

### Stop All Services

```powershell
# Stop all services (keep volumes)
docker-compose -f docker-compose.microservices.yml down

# Stop all services and remove volumes
docker-compose -f docker-compose.microservices.yml down -v

# Stop all services and remove orphans
docker-compose -f docker-compose.microservices.yml down --remove-orphans
```

### Stop Specific Service

```powershell
# Stop frontend only
docker-compose -f docker-compose.microservices.yml stop frontend

# Start it again
docker-compose -f docker-compose.microservices.yml start frontend
```

---

## Health Checks

### Quick Health Check Script

```powershell
# health-check.ps1

$services = @(
    @{Name="Auth"; URL="http://localhost:9001/health"},
    @{Name="User"; URL="http://localhost:9002/health"},
    @{Name="Organization"; URL="http://localhost:9003/health"},
    @{Name="Instance"; URL="http://localhost:9004/health"},
    @{Name="Analysis"; URL="http://localhost:9005/health"},
    @{Name="Insights"; URL="http://localhost:9006/health"},
    @{Name="Widget"; URL="http://localhost:9007/health"},
    @{Name="Dashboard"; URL="http://localhost:9008/health"},
    @{Name="Notification"; URL="http://localhost:9009/health"},
    @{Name="Audit"; URL="http://localhost:9010/health"},
    @{Name="Frontend"; URL="http://localhost:3500"}
)

Write-Host "=== Service Health Check ===" -ForegroundColor Cyan

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $($service.Name) - Healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "[FAIL] $($service.Name) - Not responding" -ForegroundColor Red
    }
}
```

---

## Summary

### Key Differences

| Feature | docker-compose.yml | docker-compose.microservices.yml |
|---------|-------------------|----------------------------------|
| **Services** | 2 (postgres, backend) | 20+ (full platform) |
| **Frontend** | No | Yes (React/Vite) |
| **API Gateway** | No | Yes (Kong) |
| **Databases** | 1 | 4 (separate DBs) |
| **Microservices** | No | Yes (10 services) |
| **Message Queue** | No | Yes (RabbitMQ) |
| **Cache** | No | Yes (Redis) |
| **Use Case** | Quick testing | Production-ready |

### Recommended Commands

**Build:**
```powershell
docker-compose -f docker-compose.microservices.yml build
```

**Start:**
```powershell
docker-compose -f docker-compose.microservices.yml up -d
```

**Stop:**
```powershell
docker-compose -f docker-compose.microservices.yml down
```

**Logs:**
```powershell
docker-compose -f docker-compose.microservices.yml logs -f frontend
```

**Status:**
```powershell
docker-compose -f docker-compose.microservices.yml ps
```

---

**Last Updated:** 2025-10-25
**Status:** Production Ready
