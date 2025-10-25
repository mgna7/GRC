# ComplianceIQ Health Check Script
# Checks the health of all microservices

Write-Host "=== ComplianceIQ Service Health Check ===" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Auth Service"; URL="http://localhost:9001/health"},
    @{Name="User Service"; URL="http://localhost:9002/health"},
    @{Name="Organization Service"; URL="http://localhost:9003/health"},
    @{Name="Instance Service"; URL="http://localhost:9004/health"},
    @{Name="Analysis Service"; URL="http://localhost:9005/health"},
    @{Name="Insights Service"; URL="http://localhost:9006/health"},
    @{Name="Widget Service"; URL="http://localhost:9007/health"},
    @{Name="Dashboard Service"; URL="http://localhost:9008/health"},
    @{Name="Notification Service"; URL="http://localhost:9009/health"},
    @{Name="Audit Service"; URL="http://localhost:9010/health"},
    @{Name="Frontend"; URL="http://localhost:3500"},
    @{Name="API Gateway"; URL="http://localhost:9000"},
    @{Name="RabbitMQ"; URL="http://localhost:15672"}
)

$healthyCount = 0
$unhealthyCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK]   $($service.Name)" -ForegroundColor Green
            $healthyCount++
        } else {
            Write-Host "[WARN] $($service.Name) - HTTP $($response.StatusCode)" -ForegroundColor Yellow
            $unhealthyCount++
        }
    } catch {
        Write-Host "[FAIL] $($service.Name) - Not responding" -ForegroundColor Red
        $unhealthyCount++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Healthy:   $healthyCount / $totalCount" -ForegroundColor Green
Write-Host "Unhealthy: $unhealthyCount / $totalCount" -ForegroundColor $(if ($unhealthyCount -eq 0) { "Green" } else { "Red" })

if ($unhealthyCount -gt 0) {
    Write-Host ""
    Write-Host "To check logs for failed services:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.microservices.yml logs -f SERVICE_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "To check container status:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.microservices.yml ps" -ForegroundColor White
}

Write-Host ""
exit $(if ($unhealthyCount -eq 0) { 0 } else { 1 })
