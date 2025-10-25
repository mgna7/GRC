# 🐳 Docker Build & Deployment Guide

> **Complete guide for building, scanning, and deploying ComplianceIQ microservices**

---

## ✅ What's Been Fixed

### 1. Docker Build Context Issue - **RESOLVED** ✅

**Problem:**
```
ERROR [auth-service 6/7] COPY ../../shared /app/shared
failed to compute cache key: "/shared": not found
```

**Root Cause:**
- Build context was set to `./services/auth` (subdirectory)
- Docker couldn't access `../../shared` (parent directory)

**Solution:**
- Changed build context from `./services/auth` to `.` (root directory)
- Updated all Dockerfile COPY paths to be relative to project root
- Updated docker-compose.microservices.yml for all services

**Before:**
```yaml
auth-service:
  build:
    context: ./services/auth
    dockerfile: Dockerfile
```

**After:**
```yaml
auth-service:
  build:
    context: .
    dockerfile: services/auth/Dockerfile
```

---

## 📁 Created Dockerfiles

All services now have production-ready Dockerfiles with security best practices:

### ✅ Created Dockerfiles

1. **[services/auth/Dockerfile](services/auth/Dockerfile)** - Authentication service
2. **[services/user/Dockerfile](services/user/Dockerfile)** - User management service
3. **[services/organization/Dockerfile](services/organization/Dockerfile)** - Organization service
4. **[services/instance/Dockerfile](services/instance/Dockerfile)** - ServiceNow instance service
5. **[services/analysis/Dockerfile](services/analysis/Dockerfile)** - Analysis engine service
6. **[services/insights/Dockerfile](services/insights/Dockerfile)** - Insights service
7. **[services/widget/Dockerfile](services/widget/Dockerfile)** - Widget service
8. **[services/dashboard/Dockerfile](services/dashboard/Dockerfile)** - Dashboard service
9. **[services/notification/Dockerfile](services/notification/Dockerfile)** - Notification service
10. **[services/audit/Dockerfile](services/audit/Dockerfile)** - Audit logging service

### 🔒 Security Features in Every Dockerfile

1. **Specific Base Image Tag**: `python:3.11.9-slim-bookworm` (not `latest`)
2. **Non-root User**: All containers run as `appuser` (not root)
3. **Minimal Packages**: Only essential dependencies installed
4. **Layer Optimization**: Reduced image size and build time
5. **Health Checks**: Built-in health endpoints
6. **Metadata Labels**: Service name, version, maintainer

### Example Dockerfile Structure

```dockerfile
FROM python:3.11.9-slim-bookworm

LABEL maintainer="ComplianceIQ Team"
LABEL service="auth-service"
LABEL version="1.0.0"

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY services/auth/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip==24.0 && \
    pip install --no-cache-dir -r requirements.txt

# Copy shared libraries and app code
COPY shared /app/shared
COPY services/auth/app /app/app

# Set ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 🚀 Building Services

### Build All Services

```bash
# Build all services at once
docker-compose -f docker-compose.microservices.yml build

# Build with no cache (clean build)
docker-compose -f docker-compose.microservices.yml build --no-cache

# Build specific service
docker-compose -f docker-compose.microservices.yml build auth-service

# Build in parallel (faster)
docker-compose -f docker-compose.microservices.yml build --parallel
```

### Build Individual Service

```bash
# From project root
docker build -f services/auth/Dockerfile -t complianceiq-auth-service:latest .
docker build -f services/user/Dockerfile -t complianceiq-user-service:latest .
docker build -f services/organization/Dockerfile -t complianceiq-organization-service:latest .
```

### Verify Builds

```bash
# List built images
docker images | grep complianceiq

# Check image details
docker inspect complianceiq-auth-service:latest

# Check image size
docker images complianceiq-auth-service:latest
```

---

## 🔍 Vulnerability Scanning

### Quick Scan

```powershell
# Windows
.\scripts\scan-all-images.ps1

# Linux/Mac
./scripts/scan-all-images.sh
```

### Detailed Scan Options

```powershell
# Only HIGH and CRITICAL vulnerabilities
.\scripts\scan-all-images.ps1 -Severity "HIGH,CRITICAL"

# Generate JSON reports
.\scripts\scan-all-images.ps1 -OutputFormat json

# Ignore unfixed vulnerabilities
.\scripts\scan-all-images.ps1 -IgnoreUnfixed

# Exit with error if vulnerabilities found (for CI/CD)
.\scripts\scan-all-images.ps1 -ExitOnError

# Custom output directory
.\scripts\scan-all-images.ps1 -OutputDir ".\security-scans"
```

### Scan Individual Service

```bash
# Install Trivy first (if not already installed)
# Windows: choco install trivy
# Linux: See SECURITY_SCANNING.md
# macOS: brew install trivy

# Scan specific service
trivy image complianceiq-auth-service:latest

# Only HIGH/CRITICAL vulnerabilities
trivy image --severity HIGH,CRITICAL complianceiq-auth-service:latest

# Generate JSON report
trivy image --format json --output auth-scan.json complianceiq-auth-service:latest

# Generate SBOM (Software Bill of Materials)
trivy image --format cyclonedx --output auth-sbom.json complianceiq-auth-service:latest
```

### Docker Scout (Alternative)

```bash
# Scan with Docker Scout
docker scout cves complianceiq-auth-service:latest

# Get recommendations
docker scout recommendations complianceiq-auth-service:latest

# Compare with base image
docker scout compare --to python:3.11.9-slim-bookworm complianceiq-auth-service:latest
```

---

## 🛡️ Security Best Practices

### 1. Always Use Specific Image Tags

❌ **Bad:**
```dockerfile
FROM python:3.11
FROM python:latest
```

✅ **Good:**
```dockerfile
FROM python:3.11.9-slim-bookworm
```

### 2. Run as Non-Root User

✅ **Implemented in all our Dockerfiles:**
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 3. Minimize Layer Count

```dockerfile
# Bad - multiple RUN commands
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2

# Good - single RUN command
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*
```

### 4. Use .dockerignore

✅ **Already created at project root**

Excludes:
- `.git`, `.vscode`, `.idea`
- `__pycache__`, `*.pyc`
- `node_modules`
- `.env` files
- Test files
- Documentation

### 5. Regular Security Scans

```bash
# Weekly automated scan (add to cron/Task Scheduler)
# Windows Task Scheduler
# Linux crontab: 0 2 * * 0 /path/to/scan-all-images.sh
```

### 6. Update Base Images Monthly

```bash
# Update Python base image
docker pull python:3.11.9-slim-bookworm

# Rebuild all services
docker-compose -f docker-compose.microservices.yml build --no-cache

# Rescan for vulnerabilities
.\scripts\scan-all-images.ps1
```

---

## 🏗️ Production Deployment

### Option 1: Docker Compose (Single Server)

```bash
# Production docker-compose
docker-compose -f docker-compose.microservices.yml up -d

# Check status
docker-compose -f docker-compose.microservices.yml ps

# View logs
docker-compose -f docker-compose.microservices.yml logs -f

# Stop all services
docker-compose -f docker-compose.microservices.yml down
```

### Option 2: Kubernetes (Cluster)

**Step 1: Tag Images for Registry**

```bash
# Tag for Docker Hub
docker tag complianceiq-auth-service:latest your-dockerhub-user/complianceiq-auth-service:1.0.0

# Tag for AWS ECR
docker tag complianceiq-auth-service:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/complianceiq-auth-service:1.0.0

# Tag for Google Container Registry
docker tag complianceiq-auth-service:latest gcr.io/your-project/complianceiq-auth-service:1.0.0

# Tag for Azure Container Registry
docker tag complianceiq-auth-service:latest yourregistry.azurecr.io/complianceiq-auth-service:1.0.0
```

**Step 2: Push to Registry**

```bash
# Docker Hub
docker login
docker push your-dockerhub-user/complianceiq-auth-service:1.0.0

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/complianceiq-auth-service:1.0.0

# Google GCR
gcloud auth configure-docker
docker push gcr.io/your-project/complianceiq-auth-service:1.0.0

# Azure ACR
az acr login --name yourregistry
docker push yourregistry.azurecr.io/complianceiq-auth-service:1.0.0
```

**Step 3: Deploy to Kubernetes**

```bash
# Apply Kubernetes manifests (when ready)
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n complianceiq

# Check service status
kubectl get svc -n complianceiq
```

---

## 📊 Image Size Optimization

### Check Image Sizes

```bash
docker images | grep complianceiq
```

### Expected Sizes (Approximate)

| Service | Base Size | With Dependencies |
|---------|-----------|-------------------|
| auth-service | ~150 MB | ~300 MB |
| user-service | ~150 MB | ~280 MB |
| organization-service | ~150 MB | ~280 MB |
| instance-service | ~150 MB | ~290 MB |
| analysis-service | ~150 MB | ~400 MB (ML libs) |
| insights-service | ~150 MB | ~280 MB |
| widget-service | ~150 MB | ~280 MB |
| dashboard-service | ~150 MB | ~290 MB |
| notification-service | ~150 MB | ~270 MB |
| audit-service | ~150 MB | ~280 MB |

### Optimization Tips

1. **Use slim base images** ✅ (already using `slim-bookworm`)
2. **Multi-stage builds** (for future optimization)
3. **Remove build dependencies after install**
4. **Minimize layers** ✅ (already optimized)

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Scan

on:
  push:
    branches: [ main, develop ]

jobs:
  build-and-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build auth-service
        run: docker build -f services/auth/Dockerfile -t complianceiq-auth-service:${{ github.sha }} .

      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'complianceiq-auth-service:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Push to registry
        run: |
          docker tag complianceiq-auth-service:${{ github.sha }} your-registry/complianceiq-auth-service:latest
          docker push your-registry/complianceiq-auth-service:latest
```

---

## 📚 Additional Resources

- **[SECURITY_SCANNING.md](SECURITY_SCANNING.md)** - Comprehensive vulnerability scanning guide
- **[START_HERE.md](START_HERE.md)** - Quick start guide
- **[PORT_REFERENCE.md](PORT_REFERENCE.md)** - Port mapping reference
- **[README.md](README.md)** - Main project documentation

---

## 🐛 Troubleshooting

### Build Fails with "shared not found"

**Solution:** Make sure you're running `docker build` from the **project root**, not from a service subdirectory.

```bash
# ❌ Wrong (from service directory)
cd services/auth
docker build -t auth-service .

# ✅ Correct (from project root)
docker build -f services/auth/Dockerfile -t complianceiq-auth-service .
```

### Port Already in Use

**Solution:** Check [PORT_REFERENCE.md](PORT_REFERENCE.md) for port mappings and ensure no conflicts.

```bash
# Windows - Check port usage
netstat -ano | findstr "9001"

# Linux/Mac - Check port usage
lsof -i :9001

# Stop conflicting service or change port in docker-compose.microservices.yml
```

### Out of Disk Space

**Solution:** Clean up unused Docker resources.

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all stopped containers
docker container prune

# Nuclear option - clean everything
docker system prune -a --volumes
```

### Permission Denied

**Solution:** Run Docker commands with appropriate permissions.

```bash
# Windows - Run PowerShell as Administrator

# Linux - Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## ✅ Build Checklist

Before deploying to production:

- [ ] All services have Dockerfiles
- [ ] All images built successfully
- [ ] Vulnerability scan completed (no HIGH/CRITICAL issues)
- [ ] Health checks working
- [ ] Environment variables configured in `.env`
- [ ] Ports mapped correctly
- [ ] Database migrations tested
- [ ] Integration tests passed
- [ ] Images pushed to registry
- [ ] Documentation updated

---

**Last Updated**: 2025-01-15
**Maintained By**: ComplianceIQ DevOps Team
