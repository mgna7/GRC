# 🔒 Security & Vulnerability Scanning Guide

> **Comprehensive guide for scanning Docker images for vulnerabilities and security best practices**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Scanning Tools](#scanning-tools)
3. [Quick Start](#quick-start)
4. [Trivy Scanner](#trivy-scanner)
5. [Docker Scout](#docker-scout)
6. [Grype Scanner](#grype-scanner)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Remediation Guide](#remediation-guide)

---

## Overview

### Why Scan Docker Images?

- **Vulnerability Detection**: Identify known CVEs in base images and dependencies
- **Compliance**: Meet security compliance requirements (SOC2, ISO 27001, etc.)
- **Supply Chain Security**: Prevent compromised dependencies
- **Zero-Day Protection**: Early detection of security issues

### Our Security Strategy

1. **Use specific, tagged base images** (not `latest`)
2. **Scan images before deployment**
3. **Regular updates** of base images and dependencies
4. **Non-root containers** for runtime security
5. **Minimal attack surface** (slim images, no unnecessary packages)

---

## Scanning Tools

### Recommended Tools

| Tool | Type | Cost | Strength | CI/CD Ready |
|------|------|------|----------|-------------|
| **Trivy** | CLI | Free | Comprehensive, fast | ✅ Yes |
| **Docker Scout** | CLI/GUI | Free tier | Docker native | ✅ Yes |
| **Grype** | CLI | Free | Fast, accurate | ✅ Yes |
| **Snyk** | CLI/SaaS | Free tier | Developer-friendly | ✅ Yes |
| **Clair** | API | Free | Container-focused | ✅ Yes |

**Our Choice**: **Trivy** (primary) + **Docker Scout** (secondary)

---

## Quick Start

### Install Trivy (Recommended)

**Windows (PowerShell):**
```powershell
# Using Chocolatey
choco install trivy

# Or using Windows binary
Invoke-WebRequest -Uri "https://github.com/aquasecurity/trivy/releases/download/v0.49.1/trivy_0.49.1_Windows-64bit.zip" -OutFile trivy.zip
Expand-Archive trivy.zip -DestinationPath C:\trivy
# Add C:\trivy to PATH
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Or using binary
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

**macOS:**
```bash
brew install trivy
```

### Scan Your First Image

```bash
# Scan auth service image
trivy image complianceiq-auth-service:latest
```

---

## Trivy Scanner

### Features

- ✅ Detects vulnerabilities in OS packages and application dependencies
- ✅ Scans container images, filesystems, and Git repositories
- ✅ Supports SBOM (Software Bill of Materials) generation
- ✅ Compliance checks (CIS Benchmarks, NIST, etc.)
- ✅ Secret detection
- ✅ License scanning

### Basic Usage

#### 1. Scan Specific Service

```bash
# Scan auth service
trivy image complianceiq-auth-service:latest

# Scan with severity filtering (HIGH and CRITICAL only)
trivy image --severity HIGH,CRITICAL complianceiq-auth-service:latest

# Output as JSON
trivy image --format json --output auth-scan-results.json complianceiq-auth-service:latest
```

#### 2. Scan All Services

**PowerShell:**
```powershell
.\scripts\scan-all-images.ps1
```

**Bash:**
```bash
./scripts/scan-all-images.sh
```

#### 3. Generate SBOM (Software Bill of Materials)

```bash
# Generate CycloneDX SBOM
trivy image --format cyclonedx --output auth-sbom.json complianceiq-auth-service:latest

# Generate SPDX SBOM
trivy image --format spdx-json --output auth-sbom-spdx.json complianceiq-auth-service:latest
```

#### 4. Scan for Secrets

```bash
# Scan image for exposed secrets
trivy image --scanners secret complianceiq-auth-service:latest
```

#### 5. Scan Configuration Files

```bash
# Scan Dockerfile for misconfigurations
trivy config ./services/auth/Dockerfile

# Scan docker-compose
trivy config ./docker-compose.microservices.yml
```

### Advanced Usage

#### Exit on Severity

```bash
# Fail build if HIGH or CRITICAL vulnerabilities found
trivy image --exit-code 1 --severity HIGH,CRITICAL complianceiq-auth-service:latest
```

#### Ignore Unfixed Vulnerabilities

```bash
# Only report vulnerabilities with available fixes
trivy image --ignore-unfixed complianceiq-auth-service:latest
```

#### Custom Policy

Create `.trivyignore` file to suppress specific CVEs:

```
# .trivyignore
CVE-2023-12345  # False positive - not applicable to our use case
CVE-2023-67890  # Accepted risk - documented in security review SR-2024-001
```

---

## Docker Scout

### Features

- ✅ Docker-native vulnerability scanning
- ✅ Base image recommendations
- ✅ Policy-based security
- ✅ Integration with Docker Hub

### Installation

**Already included with Docker Desktop 4.17+**

Verify:
```bash
docker scout version
```

### Usage

#### 1. Enable Docker Scout

```bash
# Login to Docker Hub
docker login

# Enable Docker Scout (free tier)
docker scout quickview
```

#### 2. Scan Image

```bash
# Scan auth service
docker scout cves complianceiq-auth-service:latest

# Get recommendations
docker scout recommendations complianceiq-auth-service:latest

# Compare with base image
docker scout compare --to python:3.11.9-slim-bookworm complianceiq-auth-service:latest
```

#### 3. Generate SBOM

```bash
docker scout sbom complianceiq-auth-service:latest
```

---

## Grype Scanner

### Installation

**Windows:**
```powershell
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b C:\grype
```

**Linux/macOS:**
```bash
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
```

### Usage

```bash
# Scan image
grype complianceiq-auth-service:latest

# JSON output
grype -o json complianceiq-auth-service:latest > grype-results.json

# Filter by severity
grype --fail-on high complianceiq-auth-service:latest
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly scan

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build auth-service image
        run: docker build -f services/auth/Dockerfile -t complianceiq-auth-service:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'complianceiq-auth-service:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Fail on HIGH/CRITICAL vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'complianceiq-auth-service:${{ github.sha }}'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - security

build:
  stage: build
  script:
    - docker build -f services/auth/Dockerfile -t $CI_REGISTRY_IMAGE/auth-service:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/auth-service:$CI_COMMIT_SHA

trivy-scan:
  stage: security
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 0 --severity HIGH,CRITICAL --format template --template "@contrib/gitlab.tpl" $CI_REGISTRY_IMAGE/auth-service:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: gl-container-scanning-report.json
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -f services/auth/Dockerfile -t complianceiq-auth-service:${BUILD_NUMBER} .'
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL \
                    --format json --output trivy-report.json \
                    complianceiq-auth-service:${BUILD_NUMBER}
                '''
            }
        }

        stage('Publish Report') {
            steps {
                archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: false
            }
        }
    }
}
```

---

## Best Practices

### 1. Use Specific Base Image Tags

❌ **Bad:**
```dockerfile
FROM python:3.11
FROM python:latest
```

✅ **Good:**
```dockerfile
FROM python:3.11.9-slim-bookworm
```

### 2. Multi-Stage Builds

```dockerfile
# Build stage
FROM python:3.11.9-slim-bookworm AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11.9-slim-bookworm
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "app.main:app"]
```

### 3. Run as Non-Root User

✅ **Already implemented in our Dockerfiles:**
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 4. Regular Updates

**Monthly schedule:**
```bash
# Update base images
docker pull python:3.11.9-slim-bookworm

# Rebuild all services
docker-compose -f docker-compose.microservices.yml build --no-cache

# Scan again
./scripts/scan-all-images.sh
```

### 5. Minimize Image Layers

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

### 6. Use .dockerignore

✅ **Already created at project root**

### 7. Sign Images (Optional but Recommended)

```bash
# Enable Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Build and sign
docker build -t complianceiq-auth-service:latest .
docker push complianceiq-auth-service:latest
```

---

## Remediation Guide

### When Vulnerabilities Are Found

#### 1. Assess Severity

| Severity | Action Required | Timeline |
|----------|----------------|----------|
| **CRITICAL** | Immediate fix | 24 hours |
| **HIGH** | Urgent fix | 7 days |
| **MEDIUM** | Scheduled fix | 30 days |
| **LOW** | Backlog | Next sprint |

#### 2. Update Base Image

```bash
# Check for newer Python image
docker pull python:3.11-slim-bookworm

# Check release notes
# https://hub.docker.com/_/python

# Update Dockerfile
FROM python:3.11.10-slim-bookworm  # Updated version

# Rebuild
docker build -f services/auth/Dockerfile -t complianceiq-auth-service:latest .

# Rescan
trivy image complianceiq-auth-service:latest
```

#### 3. Update Python Dependencies

```bash
# Update requirements.txt
pip install --upgrade pip
pip list --outdated
pip install --upgrade <package-name>
pip freeze > requirements.txt

# Rebuild image
docker build -f services/auth/Dockerfile -t complianceiq-auth-service:latest .
```

#### 4. Document Exceptions

If a vulnerability cannot be fixed (e.g., no patch available):

1. Create security ticket: `SEC-YYYY-XXX`
2. Document in `.trivyignore` with reference
3. Add compensating controls
4. Schedule review date

**Example:**
```
# .trivyignore
# Ticket: SEC-2024-001
# Justification: No fix available from upstream. Mitigated by network isolation.
# Review Date: 2024-03-01
CVE-2024-12345
```

---

## Automated Scanning Script

Our project includes automated scanning scripts:

### PowerShell (Windows)

```powershell
# Scan all services
.\scripts\scan-all-images.ps1

# Options
.\scripts\scan-all-images.ps1 -Severity "HIGH,CRITICAL" -OutputFormat json
```

### Bash (Linux/macOS)

```bash
# Scan all services
./scripts/scan-all-images.sh

# With options
./scripts/scan-all-images.sh --severity HIGH,CRITICAL --format json
```

---

## Summary Checklist

- [ ] Trivy installed and configured
- [ ] All images scanned before deployment
- [ ] CI/CD pipeline includes security scanning
- [ ] Base images use specific tags (not `latest`)
- [ ] Non-root user configured in all Dockerfiles
- [ ] `.dockerignore` configured
- [ ] `.trivyignore` created for documented exceptions
- [ ] Monthly security review scheduled
- [ ] SBOM generated for each release
- [ ] Vulnerability remediation process documented

---

## Additional Resources

- **Trivy Documentation**: https://aquasecurity.github.io/trivy/
- **Docker Scout**: https://docs.docker.com/scout/
- **OWASP Docker Security**: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- **CIS Docker Benchmark**: https://www.cisecurity.org/benchmark/docker
- **NIST Container Security**: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-190.pdf

---

**Last Updated**: 2025-01-15
**Maintained By**: ComplianceIQ Security Team
