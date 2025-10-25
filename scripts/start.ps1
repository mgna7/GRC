# ComplianceIQ Microservices Startup Script (PowerShell/Windows)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ComplianceIQ Microservices Startup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it:"
    Write-Host "  Copy-Item .env.example .env"
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting infrastructure services..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d `
    postgres-auth `
    postgres-core `
    postgres-analysis `
    postgres-audit `
    redis `
    rabbitmq `
    minio

Write-Host ""
Write-Host "⏳ Waiting for databases to be healthy (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "🚀 Starting microservices..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d `
    auth-service `
    user-service `
    organization-service `
    instance-service `
    analysis-service `
    celery-worker-analysis `
    insights-service `
    dashboard-service `
    audit-service

Write-Host ""
Write-Host "⏳ Waiting for services to be ready (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🚀 Starting API Gateway..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d kong

Write-Host ""
Write-Host "🚀 Starting Frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml up -d frontend

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ All services started successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   API Gateway:       http://localhost:9000"
Write-Host "   Frontend:          http://localhost:3500"
Write-Host "   Kong Admin:        http://localhost:9444"
Write-Host "   RabbitMQ UI:       http://localhost:15673 (user: complianceiq)"
Write-Host "   MinIO Console:     http://localhost:9101 (user: complianceiq)"
Write-Host "   Grafana:           http://localhost:3600 (admin/admin)"
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor Cyan
Write-Host "   Auth Service:      http://localhost:9001/docs"
Write-Host "   User Service:      http://localhost:9002/docs"
Write-Host "   Organization:      http://localhost:9003/docs"
Write-Host "   Instance:          http://localhost:9004/docs"
Write-Host "   Analysis:          http://localhost:9005/docs"
Write-Host "   Insights:          http://localhost:9006/docs"
Write-Host "   Widget:            http://localhost:9007/docs"
Write-Host "   Dashboard:         http://localhost:9008/docs"
Write-Host "   Notification:      http://localhost:9009/docs"
Write-Host "   Audit:             http://localhost:9010/docs"
Write-Host ""
Write-Host "🔍 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.microservices.yml logs -f [service-name]"
Write-Host ""
Write-Host "🛑 Stop all services:" -ForegroundColor Cyan
Write-Host "   .\scripts\stop.ps1"
Write-Host ""
