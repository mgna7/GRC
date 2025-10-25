# ComplianceIQ - Automated Security Scanning Script (PowerShell)
# Scans all Docker images for vulnerabilities using Trivy

param(
    [string]$Severity = "HIGH,CRITICAL",
    [string]$OutputFormat = "table",
    [switch]$ExitOnError,
    [switch]$IgnoreUnfixed,
    [string]$OutputDir = ".\security-reports"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ComplianceIQ Security Scanner" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Trivy is installed
Write-Host "Checking for Trivy installation..." -ForegroundColor Yellow
$trivyInstalled = Get-Command trivy -ErrorAction SilentlyContinue

if (-not $trivyInstalled) {
    Write-Host "❌ Trivy is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Trivy:" -ForegroundColor Yellow
    Write-Host "  Windows (Chocolatey): choco install trivy"
    Write-Host "  Windows (Manual): https://github.com/aquasecurity/trivy/releases"
    Write-Host ""
    Write-Host "See SECURITY_SCANNING.md for detailed installation instructions"
    exit 1
}

Write-Host "✅ Trivy found: $(trivy --version | Select-String 'Version')" -ForegroundColor Green
Write-Host ""

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "📁 Created output directory: $OutputDir" -ForegroundColor Green
}

# List of services to scan
$services = @(
    "auth-service",
    "user-service",
    "organization-service",
    "instance-service",
    "analysis-service",
    "insights-service",
    "widget-service",
    "dashboard-service",
    "notification-service",
    "audit-service"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$overallResults = @()
$failedScans = @()

Write-Host "🔍 Scanning $($services.Count) services..." -ForegroundColor Cyan
Write-Host "   Severity Filter: $Severity" -ForegroundColor Gray
Write-Host "   Output Format: $OutputFormat" -ForegroundColor Gray
Write-Host "   Ignore Unfixed: $IgnoreUnfixed" -ForegroundColor Gray
Write-Host ""

foreach ($service in $services) {
    $imageName = "complianceiq-$service"

    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    Write-Host "Scanning: $imageName" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray

    # Build Trivy command
    $trivyArgs = @(
        "image",
        "--severity", $Severity,
        "--format", $OutputFormat
    )

    if ($IgnoreUnfixed) {
        $trivyArgs += "--ignore-unfixed"
    }

    # Add JSON output for reporting
    $jsonOutputFile = Join-Path $OutputDir "$service-$timestamp.json"

    # Run scan with table output to console
    Write-Host "Running scan..." -ForegroundColor Gray

    $exitCode = 0
    try {
        & trivy @trivyArgs $imageName

        # Also generate JSON report
        & trivy image --severity $Severity --format json --output $jsonOutputFile $imageName

        if ($LASTEXITCODE -ne 0) {
            $exitCode = $LASTEXITCODE
        }
    }
    catch {
        Write-Host "❌ Error scanning $imageName : $_" -ForegroundColor Red
        $failedScans += $service
        $exitCode = 1
    }

    if ($exitCode -eq 0) {
        Write-Host "✅ Scan completed: $service" -ForegroundColor Green
        $overallResults += @{
            Service = $service
            Status = "Success"
            ReportFile = $jsonOutputFile
        }
    }
    else {
        Write-Host "⚠️  Vulnerabilities found in: $service" -ForegroundColor Yellow
        $overallResults += @{
            Service = $service
            Status = "Vulnerabilities Found"
            ReportFile = $jsonOutputFile
        }

        if ($ExitOnError) {
            $failedScans += $service
        }
    }

    Write-Host ""
}

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Scan Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = ($overallResults | Where-Object { $_.Status -eq "Success" }).Count
$vulnCount = ($overallResults | Where-Object { $_.Status -eq "Vulnerabilities Found" }).Count

Write-Host "Total Services Scanned: $($services.Count)" -ForegroundColor White
Write-Host "Clean (No vulnerabilities): $successCount" -ForegroundColor Green
Write-Host "Vulnerabilities Found: $vulnCount" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 Detailed Reports:" -ForegroundColor Cyan
foreach ($result in $overallResults) {
    $statusColor = if ($result.Status -eq "Success") { "Green" } else { "Yellow" }
    Write-Host "  [$($result.Status)]" -ForegroundColor $statusColor -NoNewline
    Write-Host " $($result.Service) -> $($result.ReportFile)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Reports saved to: $OutputDir" -ForegroundColor Cyan
Write-Host ""

# Generate summary report
$summaryFile = Join-Path $OutputDir "scan-summary-$timestamp.txt"
$summaryContent = @"
ComplianceIQ Security Scan Summary
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Severity Filter: $Severity
Ignore Unfixed: $IgnoreUnfixed

Total Services: $($services.Count)
Clean: $successCount
Vulnerabilities: $vulnCount

Detailed Results:
$($overallResults | ForEach-Object { "  [$($_.Status)] $($_.Service)" } | Out-String)
"@

$summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
Write-Host "📄 Summary saved to: $summaryFile" -ForegroundColor Green
Write-Host ""

# Exit with error if vulnerabilities found and -ExitOnError is set
if ($ExitOnError -and $failedScans.Count -gt 0) {
    Write-Host "❌ Scan failed for services: $($failedScans -join ', ')" -ForegroundColor Red
    Write-Host "Exiting with error code 1" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Security scan completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review reports in $OutputDir" -ForegroundColor White
Write-Host "  2. Address HIGH and CRITICAL vulnerabilities" -ForegroundColor White
Write-Host "  3. Update base images if needed" -ForegroundColor White
Write-Host "  4. See SECURITY_SCANNING.md for remediation guide" -ForegroundColor White
Write-Host ""
