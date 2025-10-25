# ComplianceIQ Documentation Index

**Complete guide to all documentation for the ComplianceIQ platform**

---

## 🚀 Getting Started

**Start here if you're new to the platform:**

1. **[START_HERE.md](START_HERE.md)** - Quick start guide
   - Prerequisites
   - One-command launch
   - Access URLs
   - Basic troubleshooting

2. **[COMPLETE_SETUP_SUMMARY.md](COMPLETE_SETUP_SUMMARY.md)** - Complete setup summary
   - All issues resolved
   - Service list
   - Launch options
   - Quick reference

---

## 📖 Detailed Guides

### Launch & Deployment

- **[LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)** - Detailed launch instructions
  - Two Docker Compose files explained
  - Architecture diagrams
  - Step-by-step startup
  - Service dependencies
  - Troubleshooting guide

- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup completion summary
  - Issues resolved
  - Service status
  - Next steps
  - Development workflow

### Build & Configuration

- **[DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md)** - Docker build reference
  - Multi-stage builds
  - Build optimization
  - Production deployment
  - Best practices

- **[DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md)** - Build issue resolution
  - Common build errors
  - Solutions applied
  - Troubleshooting steps

### Security

- **[SECURITY_SCANNING.md](SECURITY_SCANNING.md)** - Vulnerability scanning guide
  - Trivy installation
  - Docker Scout usage
  - Grype alternative
  - CI/CD integration
  - Remediation strategies

---

## 🔧 Reference

- **[PORT_REFERENCE.md](PORT_REFERENCE.md)** - Port mappings
  - All service ports
  - Database ports
  - Infrastructure ports

- **[README.md](README.md)** - Project overview
  - Architecture
  - Technology stack
  - Features
  - Contributing

---

## 📜 Scripts

### Automated Scripts

**[start-all.ps1](start-all.ps1)** - Automated startup script
```powershell
.\start-all.ps1              # Normal start
.\start-all.ps1 -Build       # Build images first
.\start-all.ps1 -Clean       # Clean start
.\start-all.ps1 -Clean -Build # Clean + rebuild
```

**[health-check.ps1](health-check.ps1)** - Health check script
```powershell
.\health-check.ps1
```

### Utility Scripts

- **[scripts/create-service-structure.ps1](scripts/create-service-structure.ps1)** - Create service boilerplate
- **[scripts/create-service-main-files.ps1](scripts/create-service-main-files.ps1)** - Create FastAPI apps
- **[scripts/scan-all-images.ps1](scripts/scan-all-images.ps1)** - Scan all images for vulnerabilities
- **[scripts/scan-all-images.sh](scripts/scan-all-images.sh)** - Scan script (Bash)

---

## 📁 Configuration Files

### Docker Compose

**[docker-compose.yml](docker-compose.yml)** - Simple setup (legacy)
- 1 postgres + 1 backend
- For quick testing only

**[docker-compose.microservices.yml](docker-compose.microservices.yml)** - Full platform ⭐
- 10 microservices + frontend + infrastructure
- **Use this for the complete platform**

### Environment

**[.env.example](.env.example)** - Environment variables template
- Database credentials
- Redis/RabbitMQ passwords
- JWT secrets
- ServiceNow configuration

---

## 🏗️ Service Documentation

### Backend Services (FastAPI)

Each service has the following structure:

```
services/SERVICE_NAME/
├── Dockerfile                  # Docker build config
├── requirements.txt            # Python dependencies
└── app/
    ├── __init__.py
    ├── main.py                # FastAPI application
    ├── models.py              # Database models
    ├── routes.py              # API routes
    ├── schemas.py             # Pydantic schemas
    ├── service.py             # Business logic
    └── config.py              # Configuration
```

**Services:**
- [services/auth/](services/auth/) - Authentication service
- [services/user/](services/user/) - User management
- [services/organization/](services/organization/) - Organization management
- [services/instance/](services/instance/) - ServiceNow instances
- [services/analysis/](services/analysis/) - AI analysis with Celery
- [services/insights/](services/insights/) - Insights generation
- [services/widget/](services/widget/) - Widget management
- [services/dashboard/](services/dashboard/) - Dashboard management
- [services/notification/](services/notification/) - Notifications
- [services/audit/](services/audit/) - Audit logging

### Frontend (React)

**[services/frontend/](services/frontend/)** - React/Vite application

```
services/frontend/
├── Dockerfile                 # Multi-stage build
├── package.json               # Dependencies
├── vite.config.ts             # Vite config
├── tsconfig.json              # TypeScript config
├── public/
│   └── index.html
└── src/
    ├── main.tsx               # Entry point
    ├── App.tsx                # Main component
    └── App.css                # Styling
```

---

## 🎯 Quick Navigation

### I want to...

**Launch the platform**
→ [START_HERE.md](START_HERE.md) or run `.\start-all.ps1`

**Understand the architecture**
→ [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Architecture section

**Fix a build issue**
→ [DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md)

**Scan for vulnerabilities**
→ [SECURITY_SCANNING.md](SECURITY_SCANNING.md)

**Troubleshoot a service**
→ [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Troubleshooting section

**Add a new feature**
→ [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Development workflow

**Check what ports are used**
→ [PORT_REFERENCE.md](PORT_REFERENCE.md)

**Understand Docker Compose files**
→ [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Two compose files explained

---

## 📊 Document Relationships

```
START_HERE.md (Quick start)
    ↓
COMPLETE_SETUP_SUMMARY.md (All issues & solutions)
    ↓
LAUNCH_GUIDE.md (Detailed instructions)
    ↓
SETUP_COMPLETE.md (Post-setup next steps)
    ↓
DOCKER_BUILD_GUIDE.md (Build reference)
SECURITY_SCANNING.md (Security)
PORT_REFERENCE.md (Reference)
```

---

## 🔍 Finding Information

### By Topic

**Architecture:**
- [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Complete architecture diagrams
- [README.md](README.md) - Technology stack

**Installation:**
- [START_HERE.md](START_HERE.md) - Quick start
- [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Detailed steps

**Configuration:**
- [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Environment variables
- [docker-compose.microservices.yml](docker-compose.microservices.yml) - Service config

**Troubleshooting:**
- [START_HERE.md](START_HERE.md) - Common issues
- [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Detailed troubleshooting
- [DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md) - Build issues

**Security:**
- [SECURITY_SCANNING.md](SECURITY_SCANNING.md) - Complete guide
- [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Security best practices

**Development:**
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Development workflow
- [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Build optimization

### By Role

**New User:**
1. [START_HERE.md](START_HERE.md)
2. Run `.\start-all.ps1`
3. Open http://localhost:3500

**Developer:**
1. [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Development workflow
2. [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Build guide
3. Service-specific README files

**DevOps/SRE:**
1. [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Full deployment guide
2. [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Production deployment
3. [SECURITY_SCANNING.md](SECURITY_SCANNING.md) - Security scanning

**Security Engineer:**
1. [SECURITY_SCANNING.md](SECURITY_SCANNING.md) - Vulnerability scanning
2. [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Security best practices
3. Run `.\scripts\scan-all-images.ps1`

---

## 📝 Document Purpose Summary

| Document | Purpose | Audience |
|----------|---------|----------|
| **START_HERE.md** | Quick start guide | Everyone |
| **COMPLETE_SETUP_SUMMARY.md** | Complete setup summary | Everyone |
| **LAUNCH_GUIDE.md** | Detailed launch instructions | DevOps, Developers |
| **SETUP_COMPLETE.md** | Post-setup next steps | Developers |
| **DOCKER_BUILD_GUIDE.md** | Build reference | DevOps, Developers |
| **DOCKER_BUILD_FIX.md** | Build troubleshooting | Developers, DevOps |
| **SECURITY_SCANNING.md** | Security scanning guide | Security, DevOps |
| **PORT_REFERENCE.md** | Port mappings | Everyone |
| **README.md** | Project overview | Everyone |
| **DOCUMENTATION_INDEX.md** | This document | Everyone |

---

## 🔗 External Resources

### Tools

- **Docker Desktop:** https://www.docker.com/products/docker-desktop
- **Trivy Security Scanner:** https://github.com/aquasecurity/trivy
- **Docker Scout:** https://docs.docker.com/scout/
- **Grype:** https://github.com/anchore/grype

### Frameworks & Libraries

- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://reactjs.org/
- **Vite:** https://vitejs.dev/
- **Kong API Gateway:** https://konghq.com/
- **PostgreSQL:** https://www.postgresql.org/
- **Redis:** https://redis.io/
- **RabbitMQ:** https://www.rabbitmq.com/
- **Celery:** https://docs.celeryq.dev/

---

## 📞 Getting Help

### Troubleshooting Steps

1. **Check logs:**
   ```powershell
   docker-compose -f docker-compose.microservices.yml logs -f SERVICE_NAME
   ```

2. **Run health check:**
   ```powershell
   .\health-check.ps1
   ```

3. **Check service status:**
   ```powershell
   docker-compose -f docker-compose.microservices.yml ps
   ```

4. **Review documentation:**
   - [START_HERE.md](START_HERE.md) - Common issues
   - [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Detailed troubleshooting

---

## 🎓 Learning Path

### Beginner

1. Read [START_HERE.md](START_HERE.md)
2. Run `.\start-all.ps1`
3. Explore frontend at http://localhost:3500
4. Check API docs at http://localhost:9001/docs

### Intermediate

1. Read [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)
2. Understand service architecture
3. Read [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
4. Try adding a simple feature

### Advanced

1. Read [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md)
2. Read [SECURITY_SCANNING.md](SECURITY_SCANNING.md)
3. Set up production environment
4. Implement CI/CD pipeline

---

## ✅ Document Status

| Document | Status | Last Updated |
|----------|--------|-------------|
| START_HERE.md | ✅ Complete | 2025-10-25 |
| COMPLETE_SETUP_SUMMARY.md | ✅ Complete | 2025-10-25 |
| LAUNCH_GUIDE.md | ✅ Complete | 2025-10-25 |
| SETUP_COMPLETE.md | ✅ Complete | 2025-10-25 |
| DOCKER_BUILD_GUIDE.md | ✅ Complete | 2025-10-25 |
| DOCKER_BUILD_FIX.md | ✅ Complete | 2025-10-25 |
| SECURITY_SCANNING.md | ✅ Complete | 2025-10-25 |
| PORT_REFERENCE.md | ✅ Complete | 2025-10-25 |
| README.md | ✅ Complete | 2025-10-25 |
| DOCUMENTATION_INDEX.md | ✅ Complete | 2025-10-25 |

---

## 🏁 Summary

**The ComplianceIQ platform has complete documentation covering:**

- ✅ Quick start guide
- ✅ Detailed launch instructions
- ✅ Build and configuration guides
- ✅ Security scanning
- ✅ Troubleshooting
- ✅ Development workflow
- ✅ Automated scripts
- ✅ Reference materials

**To get started:**

```powershell
# Read the quick start
cat START_HERE.md

# Launch the platform
.\start-all.ps1

# Access the application
http://localhost:3500
```

---

**All documentation is up-to-date and ready to use!**

**Last Updated:** 2025-10-25
**Version:** 1.0.0
