# ComplianceIQ - Port Reference Guide

> Complete list of all ports used by the platform

---

## 🎯 Port Overview

All ports have been configured to **avoid conflicts** with commonly used ports (3000, 8000, 8080, 5432, 6379, etc.)

---

## 📊 Main Service Ports

### User-Facing Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **API Gateway (Kong)** | **9000** | http://localhost:9000 | **Main entry point** - Route all API calls here |
| **Frontend** | **3500** | http://localhost:3500 | React web application |
| **Grafana** | **3600** | http://localhost:3600 | Monitoring dashboards |

---

## 🔐 Microservices Ports

### Core Services

| Service | Port | API Docs | Description |
|---------|------|----------|-------------|
| **Auth Service** | **9001** | http://localhost:9001/docs | Authentication & JWT tokens |
| **User Service** | **9002** | http://localhost:9002/docs | User profiles & RBAC |
| **Organization Service** | **9003** | http://localhost:9003/docs | Multi-tenant management |
| **Instance Service** | **9004** | http://localhost:9004/docs | ServiceNow connectors |
| **Analysis Service** | **9005** | http://localhost:9005/docs | GRC analysis engines |
| **Insights Service** | **9006** | http://localhost:9006/docs | Historical results |
| **Widget Service** | **9007** | http://localhost:9007/docs | Dashboard widgets |
| **Dashboard Service** | **9008** | http://localhost:9008/docs | Metrics aggregation |
| **Notification Service** | **9009** | http://localhost:9009/docs | Email, SMS, webhooks |
| **Audit Service** | **9010** | http://localhost:9010/docs | Audit logging |
| **ML/AI Service** | **9011** | http://localhost:9011/docs | Machine learning |
| **Webhook Service** | **9012** | http://localhost:9012/docs | Webhook management |

---

## 🗄️ Database Ports

| Database | Port | Connection String | Purpose |
|----------|------|-------------------|---------|
| **Auth DB** | **5433** | `postgresql://complianceiq:***@localhost:5433/complianceiq_auth` | User accounts, tokens |
| **Core DB** | **5434** | `postgresql://complianceiq:***@localhost:5434/complianceiq_core` | Organizations, instances |
| **Analysis DB** | **5435** | `postgresql://complianceiq:***@localhost:5435/complianceiq_analysis` | Analysis results |
| **Audit DB** | **5436** | `postgresql://complianceiq:***@localhost:5436/complianceiq_audit` | Audit logs |

**Password:** Check `.env` file for `DB_PASSWORD`

---

## 🔧 Infrastructure Ports

| Service | Port(s) | URL | Credentials |
|---------|---------|-----|-------------|
| **Redis** | **6380** | redis://localhost:6380 | Password in `.env` |
| **RabbitMQ** | **5673** (AMQP)<br>**15673** (Management) | http://localhost:15673 | user: `complianceiq`<br>See `.env` for password |
| **MinIO** | **9100** (API)<br>**9101** (Console) | http://localhost:9101 | user: `complianceiq`<br>See `.env` for password |
| **Prometheus** | **9090** | http://localhost:9090 | No authentication |

---

## 🔌 API Gateway Ports

| Type | Port | Description |
|------|------|-------------|
| **HTTP Proxy** | **9000** | Main API endpoint |
| **HTTPS Proxy** | **9443** | SSL/TLS endpoint (requires cert) |
| **Admin API** | **9444** | Kong admin interface |

---

## 📡 Quick Access URLs

### For End Users

```
Main API:     http://localhost:9000
Frontend:     http://localhost:3500
Auth API:     http://localhost:9001/docs
```

### For Developers

```
Auth Service:          http://localhost:9001/docs
User Service:          http://localhost:9002/docs
Organization Service:  http://localhost:9003/docs
Instance Service:      http://localhost:9004/docs
Analysis Service:      http://localhost:9005/docs
```

### For DevOps

```
RabbitMQ Management:  http://localhost:15673
MinIO Console:        http://localhost:9101
Grafana:              http://localhost:3600
Prometheus:           http://localhost:9090
Kong Admin:           http://localhost:9444
```

---

## 🔍 Port Conflict Resolution

### If you get "port already in use" errors:

**Option 1: Stop conflicting services**
```powershell
# Find what's using a port (Windows)
netstat -ano | findstr "9000"

# Kill the process
taskkill /PID <process_id> /F
```

**Option 2: Change ports**

Edit `docker-compose.microservices.yml`:

```yaml
# Example: Change Auth Service from 9001 to 9021
auth-service:
  ports:
    - "9021:8000"  # Change 9001 to 9021
```

Then update:
- `.env` file (ALLOWED_ORIGINS)
- Kong configuration (`kong/kong.yml`)
- START_HERE.md references

---

## 🌐 URL Pattern

### Service URLs

```
Service Port Pattern: 900X
- Auth:         9001
- User:         9002
- Organization: 9003
- Instance:     9004
- Analysis:     9005
- Insights:     9006
- Widget:       9007
- Dashboard:    9008
- Notification: 9009
- Audit:        9010
- ML/AI:        9011
- Webhook:      9012
```

### Database Ports

```
Database Port Pattern: 543X
- Auth:     5433
- Core:     5434
- Analysis: 5435
- Audit:    5436
```

### Infrastructure Ports

```
Infrastructure: Various
- Redis:      6380
- RabbitMQ:   5673 (AMQP), 15673 (UI)
- MinIO:      9100 (API), 9101 (Console)
- Prometheus: 9090
```

---

## 📝 Environment Variables

All connection strings and URLs are configured in `.env`:

```env
# Main API Gateway
API_GATEWAY_URL=http://localhost:9000

# CORS (allowed origins)
ALLOWED_ORIGINS=http://localhost:3500,http://localhost:9000

# Database URLs
DATABASE_URL_AUTH=postgresql+psycopg2://complianceiq:***@postgres-auth:5432/complianceiq_auth
# (Internal Docker network uses service names, not localhost)

# Redis
REDIS_URL=redis://:***@redis:6379/0

# RabbitMQ
RABBITMQ_URL=amqp://complianceiq:***@rabbitmq:5672/
```

**Note:** Inside Docker network, services use container names (e.g., `postgres-auth`, `redis`).
From your host machine, use `localhost` with mapped ports.

---

## 🔒 Security Notes

### Exposed Ports

Only these ports are exposed to your host machine:
- **9000-9012**: API services (public)
- **3500**: Frontend (public)
- **54330-54360**: Databases (development only)
- **63790**: Redis (development only)
- **156720, 90010, 3600, 90900**: Admin UIs (internal only)

### Production Recommendations

For production deployment:

1. **Do NOT expose database ports** (54330-54360)
2. **Do NOT expose Redis port** (63790)
3. **Use internal Docker network** for service-to-service communication
4. **Only expose:**
   - API Gateway (9000, 9443 with HTTPS)
   - Frontend (3500 or 443 with HTTPS)
5. **Admin UIs should be:**
   - Behind VPN
   - Require authentication
   - Not publicly accessible

---

## 🧪 Testing Ports

### Check if a port is open:

**Windows:**
```powershell
Test-NetConnection -ComputerName localhost -Port 9000
```

**Linux/Mac:**
```bash
nc -zv localhost 9000
```

### Check what's using a port:

**Windows:**
```powershell
netstat -ano | findstr "9000"
```

**Linux/Mac:**
```bash
lsof -i :9000
```

### Test HTTP endpoint:

```powershell
curl http://localhost:9000
curl http://localhost:9001/health
curl http://localhost:9001/docs
```

---

## 📊 Port Status Check

Run this command to check all services:

```powershell
docker-compose -f docker-compose.microservices.yml ps
```

Expected output:
```
NAME                          STATUS    PORTS
complianceiq-auth-service     Up        0.0.0.0:9001->8000/tcp
complianceiq-kong             Up        0.0.0.0:9000->8000/tcp, ...
complianceiq-postgres-auth    Up        0.0.0.0:54330->5432/tcp
... (all services should show "Up")
```

---

## 🔄 Changing Ports Later

When you're ready to use standard ports:

1. **Edit `docker-compose.microservices.yml`:**
   ```yaml
   # Change from:
   ports:
     - "9000:8000"

   # To:
   ports:
     - "8000:8000"
   ```

2. **Update `.env`:**
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
   ```

3. **Update `kong/kong.yml`:**
   ```yaml
   # Update service URLs if needed
   ```

4. **Restart services:**
   ```powershell
   docker-compose -f docker-compose.microservices.yml down
   docker-compose -f docker-compose.microservices.yml up -d
   ```

---

## 📞 Quick Reference Card

**Print this and keep it handy:**

```
╔════════════════════════════════════════════════╗
║     ComplianceIQ Port Quick Reference          ║
╠════════════════════════════════════════════════╣
║  Main API:    http://localhost:9000            ║
║  Auth API:    http://localhost:9001/docs       ║
║  Frontend:    http://localhost:3500            ║
║                                                ║
║  RabbitMQ:    http://localhost:15673           ║
║  MinIO:       http://localhost:9101            ║
║  Grafana:     http://localhost:3600            ║
║                                                ║
║  Auth DB:     localhost:5433                   ║
║  Core DB:     localhost:5434                   ║
║  Analysis DB: localhost:5435                   ║
║                                                ║
║  Credentials: See .env file                    ║
╚════════════════════════════════════════════════╝
```

---

## ✅ Checklist

- [ ] All ports documented
- [x] All ports using 4-digit numbers only
- [x] No conflicts with common ports (3000, 8000, 5432, 6379)
- [x] `.env` file configured
- [ ] Services can communicate internally
- [ ] Host machine can access exposed ports
- [ ] API docs accessible at `/docs` endpoints
- [ ] Admin UIs accessible (RabbitMQ, MinIO, Grafana)

---

**For more information, see [START_HERE.md](START_HERE.md)**
