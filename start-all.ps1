# ComplianceIQ Complete Startup Script
# This script starts the entire microservices platform

param(
    [switch]$Build,
    [switch]$Clean
)

Write-Host "=== ComplianceIQ Platform Startup ===" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Clean if requested
if ($Clean) {
    Write-Host "Cleaning up existing containers and volumes..." -ForegroundColor Yellow
    docker-compose -f docker-compose.microservices.yml down -v --remove-orphans
    Write-Host "Cleanup complete.`n" -ForegroundColor Green
}

# Step 1: Build (if needed or requested)
Write-Host "Step 1: Checking images..." -ForegroundColor Yellow
$frontendImage = docker images -q grc-ai-frontend
$authImage = docker images -q grc-ai-auth-service

if ([string]::IsNullOrEmpty($frontendImage) -or [string]::IsNullOrEmpty($authImage) -or $Build) {
    Write-Host "Building images (this may take 5-10 minutes)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.microservices.yml build --parallel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed. Exiting." -ForegroundColor Red
        exit 1
    }
    Write-Host "Build complete.`n" -ForegroundColor Green
} else {
    Write-Host "Images already built. Use -Build to rebuild.`n" -ForegroundColor Green
}

# Step 2: Start infrastructure
Write-Host "Step 2: Starting infrastructure services..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d postgres-auth postgres-core postgres-analysis postgres-audit redis rabbitmq

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start infrastructure. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for databases to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check database health
Write-Host "Checking database health..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 6
$allHealthy = $false

while ($retries -lt $maxRetries -and -not $allHealthy) {
    $status = docker-compose -f docker-compose.microservices.yml ps --format json | ConvertFrom-Json
    $unhealthy = $status | Where-Object { $_.Service -like "postgres-*" -and $_.Health -ne "healthy" }

    if ($unhealthy.Count -eq 0) {
        $allHealthy = $true
        Write-Host "All databases are healthy.`n" -ForegroundColor Green
    } else {
        $retries++
        if ($retries -lt $maxRetries) {
            Write-Host "Waiting for databases... (attempt $retries/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $allHealthy) {
    Write-Host "Warning: Some databases may not be fully ready.`n" -ForegroundColor Yellow
}

# Step 3: Start backend services
Write-Host "Step 3: Starting backend services..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d `
    auth-service `
    user-service `
    organization-service `
    instance-service `
    analysis-service `
    insights-service `
    widget-service `
    dashboard-service `
    notification-service `
    audit-service `
    celery-worker-analysis

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start backend services. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for backend services to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Start API Gateway
Write-Host "`nStep 4: Starting API Gateway (Kong)..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d kong

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start Kong. Exiting." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5

# Step 5: Start frontend
Write-Host "`nStep 5: Starting frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start frontend. Exiting." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5

# Step 6: Check status
Write-Host "`nStep 6: Service Status" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml ps

# Step 7: Health checks
Write-Host "`nStep 7: Testing service health..." -ForegroundColor Yellow

$services = @(
    @{Name="Auth Service"; URL="http://localhost:9001/health"},
    @{Name="User Service"; URL="http://localhost:9002/health"},
    @{Name="Frontend"; URL="http://localhost:3500"}
)

$healthyCount = 0
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  [OK] $($service.Name)" -ForegroundColor Green
            $healthyCount++
        }
    } catch {
        Write-Host "  [WAIT] $($service.Name) - Still starting..." -ForegroundColor Yellow
    }
}

# Step 8: Summary
Write-Host "`n=== Startup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:          http://localhost:3500" -ForegroundColor White
Write-Host "  API Gateway:       http://localhost:9000" -ForegroundColor White
Write-Host ""
Write-Host "Backend Services:" -ForegroundColor Cyan
Write-Host "  Auth Service:      http://localhost:9001/docs" -ForegroundColor White
Write-Host "  User Service:      http://localhost:9002/docs" -ForegroundColor White
Write-Host "  Organization:      http://localhost:9003/docs" -ForegroundColor White
Write-Host "  Instance:          http://localhost:9004/docs" -ForegroundColor White
Write-Host "  Analysis:          http://localhost:9005/docs" -ForegroundColor White
Write-Host "  Insights:          http://localhost:9006/docs" -ForegroundColor White
Write-Host "  Widget:            http://localhost:9007/docs" -ForegroundColor White
Write-Host "  Dashboard:         http://localhost:9008/docs" -ForegroundColor White
Write-Host "  Notification:      http://localhost:9009/docs" -ForegroundColor White
Write-Host "  Audit:             http://localhost:9010/docs" -ForegroundColor White
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor Cyan
Write-Host "  RabbitMQ:          http://localhost:15672" -ForegroundColor White
Write-Host "    (complianceiq/rabbitmq_dev_password)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:         docker-compose -f docker-compose.microservices.yml logs -f" -ForegroundColor White
Write-Host "  View service logs: docker-compose -f docker-compose.microservices.yml logs -f frontend" -ForegroundColor White
Write-Host "  Stop all:          docker-compose -f docker-compose.microservices.yml down" -ForegroundColor White
Write-Host "  Restart service:   docker-compose -f docker-compose.microservices.yml restart frontend" -ForegroundColor White
Write-Host ""

if ($healthyCount -lt $services.Count) {
    Write-Host "Note: Some services may still be starting. Wait 30 seconds and check again." -ForegroundColor Yellow
    Write-Host "Run: docker-compose -f docker-compose.microservices.yml ps" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Platform is ready to use!" -ForegroundColor Green
Write-Host ""
