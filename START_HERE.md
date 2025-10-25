# ComplianceIQ - GRC AI Analysis Platform

## Quick Start Guide

Welcome to ComplianceIQ! This guide will get you up and running quickly.

---

## Important: Two Docker Compose Files

This project has **TWO different setups**:

### 1. `docker-compose.yml` (Legacy/Simple)
- **Use for:** Quick testing only
- **Contains:** 1 database + 1 backend service
- **Does NOT include:** Frontend, microservices, API gateway
- **Port:** Backend on 8100

### 2. `docker-compose.microservices.yml` (Full Platform) ⭐ RECOMMENDED
- **Use for:** Full application with all features
- **Contains:** 10 microservices + frontend + infrastructure
- **Includes:** Frontend UI, API Gateway, all services
- **Ports:** Frontend (3500), API Gateway (9000), Services (9001-9010)

**For this guide, we use `docker-compose.microservices.yml`**

---

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum: 8GB RAM, 50GB disk space

2. **PowerShell** (Windows) or **Bash** (Linux/Mac)

3. **Git** (to clone the repository)

---

## Step-by-Step Launch

### Option 1: Automated Startup (Recommended)

**Use the automated script to start everything:**

```powershell
# Navigate to project directory
cd F:\Servicenow\GRC-AI

# Run the startup script
.\start-all.ps1

# Optional: Build images first (if not already built)
.\start-all.ps1 -Build

# Optional: Clean start (removes all containers and volumes)
.\start-all.ps1 -Clean -Build
```

The script will:
1. Check if images need building
2. Start infrastructure (databases, cache, message queue)
3. Start all backend services
4. Start API Gateway
5. Start frontend
6. Display service URLs and health status

**Expected output:**
```
=== ComplianceIQ Platform Startup ===

Step 1: Checking images...
Images already built. Use -Build to rebuild.

Step 2: Starting infrastructure services...
Waiting for databases to initialize (15 seconds)...

Step 3: Starting backend services...
Waiting for backend services to start (10 seconds)...

Step 4: Starting API Gateway (Kong)...

Step 5: Starting frontend...

=== Startup Complete ===

Application URLs:
  Frontend:          http://localhost:3500
  API Gateway:       http://localhost:9000
  ...
```

### Option 2: Manual Startup

**1. Build all services (first time only):**

```powershell
cd F:\Servicenow\GRC-AI

# Build all images (takes 5-10 minutes)
docker-compose -f docker-compose.microservices.yml build

# Or build in parallel (faster)
docker-compose -f docker-compose.microservices.yml build --parallel
```

**2. Start infrastructure:**

```powershell
# Start databases, cache, and message queue
docker-compose -f docker-compose.microservices.yml up -d postgres-auth postgres-core postgres-analysis postgres-audit redis rabbitmq

# Wait for databases to initialize
Start-Sleep -Seconds 15
```

**3. Start backend services:**

```powershell
docker-compose -f docker-compose.microservices.yml up -d auth-service user-service organization-service instance-service analysis-service insights-service widget-service dashboard-service notification-service audit-service celery-worker-analysis

# Wait for services to start
Start-Sleep -Seconds 10
```

**4. Start API Gateway and Frontend:**

```powershell
# Start Kong API Gateway
docker-compose -f docker-compose.microservices.yml up -d kong

# Start Frontend
docker-compose -f docker-compose.microservices.yml up -d frontend
```

**5. Verify everything is running:**

```powershell
# Check service status
docker-compose -f docker-compose.microservices.yml ps

# Run health checks
.\health-check.ps1
```

---

## Access the Application

### Frontend UI
🌐 **http://localhost:3500**

Open this in your browser to access the React frontend.

### API Gateway
🌐 **http://localhost:9000**

All backend services are accessible through Kong.

### Backend Services (with Swagger Docs)

| Service | URL | Swagger API Docs |
|---------|-----|-----------------|
| Auth | http://localhost:9001 | http://localhost:9001/docs |
| User | http://localhost:9002 | http://localhost:9002/docs |
| Organization | http://localhost:9003 | http://localhost:9003/docs |
| Instance | http://localhost:9004 | http://localhost:9004/docs |
| Analysis | http://localhost:9005 | http://localhost:9005/docs |
| Insights | http://localhost:9006 | http://localhost:9006/docs |
| Widget | http://localhost:9007 | http://localhost:9007/docs |
| Dashboard | http://localhost:9008 | http://localhost:9008/docs |
| Notification | http://localhost:9009 | http://localhost:9009/docs |
| Audit | http://localhost:9010 | http://localhost:9010/docs |

### Infrastructure

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

### Test Backend Health

```powershell
# Test a single service
curl http://localhost:9001/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "auth-service",
#   "version": "1.0.0",
#   "environment": "development"
# }

# Test via API Gateway
curl http://localhost:9000/api/v1/auth/health
```

### Test Frontend

Open browser to: **http://localhost:3500**

You should see:
- ComplianceIQ logo/header
- Service status
- Version information

### Run All Health Checks

```powershell
.\health-check.ps1
```

**Expected output:**
```
=== ComplianceIQ Service Health Check ===

[OK]   Auth Service
[OK]   User Service
[OK]   Organization Service
[OK]   Instance Service
[OK]   Analysis Service
[OK]   Insights Service
[OK]   Widget Service
[OK]   Dashboard Service
[OK]   Notification Service
[OK]   Audit Service
[OK]   Frontend
[OK]   API Gateway
[OK]   RabbitMQ

=== Summary ===
Healthy:   13 / 13
Unhealthy: 0 / 13
```

---

## Troubleshooting

### Issue: "Unable to launch frontend"

**Problem:** You're using `docker-compose.yml` instead of `docker-compose.microservices.yml`

**Solution:**
```powershell
# WRONG - This only has backend, no frontend
docker-compose up -d

# CORRECT - This has the full platform with frontend
docker-compose -f docker-compose.microservices.yml up -d
```

### Issue: "Orphan containers" warning

**Problem:**
```
Found orphan containers ([complianceiq-celery-worker-analysis...])
```

**Solution:**
```powershell
# Clean up orphan containers
docker-compose -f docker-compose.microservices.yml down --remove-orphans

# Then start fresh
.\start-all.ps1
```

### Issue: Service won't start

**Check logs:**
```powershell
# View logs for specific service
docker-compose -f docker-compose.microservices.yml logs frontend

# Follow logs in real-time
docker-compose -f docker-compose.microservices.yml logs -f frontend

# View all logs
docker-compose -f docker-compose.microservices.yml logs
```

**Check container status:**
```powershell
docker-compose -f docker-compose.microservices.yml ps
```

**Common issues:**
1. **Port already in use** - Another application using the same port
2. **Database not ready** - Wait longer (15-30 seconds)
3. **Image not built** - Run build command first
4. **Out of memory** - Increase Docker Desktop memory limit

### Issue: Port conflicts

**Find what's using a port:**
```powershell
# Check port 3500 (frontend)
netstat -ano | findstr :3500

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Issue: Build failures

**Clean rebuild:**
```powershell
# Remove all containers and volumes
docker-compose -f docker-compose.microservices.yml down -v

# Clean build without cache
docker-compose -f docker-compose.microservices.yml build --no-cache

# Start fresh
.\start-all.ps1
```

### Issue: Frontend shows blank page

**Checklist:**
1. Verify container is running:
   ```powershell
   docker-compose -f docker-compose.microservices.yml ps frontend
   ```

2. Check frontend logs:
   ```powershell
   docker-compose -f docker-compose.microservices.yml logs frontend
   ```

3. Test port accessibility:
   ```powershell
   curl http://localhost:3500
   ```

4. Check browser console (F12 > Console)

---

## Stopping the Application

### Stop all services:
```powershell
# Stop all services (keep data)
docker-compose -f docker-compose.microservices.yml down

# Stop all services and remove volumes (delete data)
docker-compose -f docker-compose.microservices.yml down -v
```

### Stop a specific service:
```powershell
# Stop frontend only
docker-compose -f docker-compose.microservices.yml stop frontend

# Restart it
docker-compose -f docker-compose.microservices.yml start frontend
```

---

## Next Steps

### 1. Explore the API Documentation

Visit the Swagger docs for any service:
- http://localhost:9001/docs (Auth Service)
- http://localhost:9002/docs (User Service)
- etc.

### 2. Connect to ServiceNow

See [SERVICENOW_INTEGRATION.md](SERVICENOW_INTEGRATION.md) for:
- Setting up OAuth connections
- Configuring instance credentials
- Importing GRC data

### 3. Security Scanning

See [SECURITY_SCANNING.md](SECURITY_SCANNING.md) for:
- Installing Trivy
- Scanning Docker images for vulnerabilities
- Remediation strategies

### 4. Development

See [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) for:
- Adding new features
- Creating migrations
- Testing locally

---

## Project Structure

```
F:\Servicenow\GRC-AI\
├── docker-compose.yml                  # Simple setup (legacy)
├── docker-compose.microservices.yml    # Full platform (use this)
├── start-all.ps1                       # Automated startup script
├── health-check.ps1                    # Health check script
├── services/                           # All microservices
│   ├── auth/                          # Authentication service
│   ├── user/                          # User management
│   ├── organization/                  # Organization management
│   ├── instance/                      # ServiceNow instances
│   ├── analysis/                      # AI analysis service
│   ├── insights/                      # Insights service
│   ├── widget/                        # Widget service
│   ├── dashboard/                     # Dashboard service
│   ├── notification/                  # Notification service
│   ├── audit/                         # Audit logging
│   └── frontend/                      # React frontend
├── shared/                            # Shared code
├── kong/                              # API Gateway config
├── scripts/                           # Utility scripts
└── docs/                              # Documentation
```

---

## Key Files

| File | Purpose |
|------|---------|
| [docker-compose.microservices.yml](docker-compose.microservices.yml) | Full platform configuration |
| [start-all.ps1](start-all.ps1) | Automated startup script |
| [health-check.ps1](health-check.ps1) | Health check script |
| [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) | Detailed launch instructions |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Setup completion summary |
| [SECURITY_SCANNING.md](SECURITY_SCANNING.md) | Vulnerability scanning guide |
| [PORT_REFERENCE.md](PORT_REFERENCE.md) | Port mappings reference |

---

## Environment Variables

Default development credentials are configured in `docker-compose.microservices.yml`.

**To override for production**, create `.env` file:

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

## Common Commands

```powershell
# Start everything
.\start-all.ps1

# Start with rebuild
.\start-all.ps1 -Build

# Clean start
.\start-all.ps1 -Clean -Build

# Check health
.\health-check.ps1

# View logs (all services)
docker-compose -f docker-compose.microservices.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.microservices.yml logs -f frontend

# Check status
docker-compose -f docker-compose.microservices.yml ps

# Stop everything
docker-compose -f docker-compose.microservices.yml down

# Stop and remove all data
docker-compose -f docker-compose.microservices.yml down -v

# Restart a service
docker-compose -f docker-compose.microservices.yml restart frontend

# Rebuild a service
docker-compose -f docker-compose.microservices.yml build frontend
docker-compose -f docker-compose.microservices.yml up -d frontend
```

---

## Architecture Overview

### Microservices

- **auth-service** (9001) - Authentication & authorization
- **user-service** (9002) - User management
- **organization-service** (9003) - Organization management
- **instance-service** (9004) - ServiceNow instance management
- **analysis-service** (9005) - AI/ML analysis with Celery
- **insights-service** (9006) - Insights generation
- **widget-service** (9007) - Widget management
- **dashboard-service** (9008) - Dashboard management
- **notification-service** (9009) - Notifications
- **audit-service** (9010) - Audit logging

### Frontend

- **frontend** (3500) - React/Vite application

### Infrastructure

- **postgres-auth** (5433) - Auth database
- **postgres-core** (5434) - Core database
- **postgres-analysis** (5435) - Analytics database
- **postgres-audit** (5436) - Audit database
- **redis** (6379) - Cache
- **rabbitmq** (5672, 15672) - Message queue
- **kong** (9000, 9443, 9444) - API Gateway

---

## Support & Documentation

### Full Documentation

- **[LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)** - Complete launch instructions
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup summary
- **[DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md)** - Build reference
- **[DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md)** - Build issue resolution
- **[SECURITY_SCANNING.md](SECURITY_SCANNING.md)** - Security scanning
- **[PORT_REFERENCE.md](PORT_REFERENCE.md)** - Port mappings

### Getting Help

1. Check [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) for detailed instructions
2. Review logs: `docker-compose -f docker-compose.microservices.yml logs -f`
3. Check service status: `docker-compose -f docker-compose.microservices.yml ps`
4. Run health checks: `.\health-check.ps1`

---

## Summary

**Quick Start:**
```powershell
# One command to start everything
.\start-all.ps1

# Access frontend
Start-Process http://localhost:3500
```

**Health Check:**
```powershell
.\health-check.ps1
```

**Stop:**
```powershell
docker-compose -f docker-compose.microservices.yml down
```

---

**Status:** ✅ All services ready
**Last Updated:** 2025-10-25
**Version:** 1.0.0

---

## Quick Reference Card

| What | Command |
|------|---------|
| **Start All** | `.\start-all.ps1` |
| **Start (rebuild)** | `.\start-all.ps1 -Build` |
| **Health Check** | `.\health-check.ps1` |
| **View Logs** | `docker-compose -f docker-compose.microservices.yml logs -f` |
| **Check Status** | `docker-compose -f docker-compose.microservices.yml ps` |
| **Stop All** | `docker-compose -f docker-compose.microservices.yml down` |
| **Frontend** | http://localhost:3500 |
| **API Gateway** | http://localhost:9000 |
| **Auth Docs** | http://localhost:9001/docs |

---

**Ready to go!** 🚀
