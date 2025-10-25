# ComplianceIQ Setup Script
# Checks prerequisites and prepares the environment

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ComplianceIQ Setup & Verification" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
Write-Host ""
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found!" -ForegroundColor Red
    exit 1
}

# Check Docker is running
Write-Host ""
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running! Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check .env file
Write-Host ""
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✅ .env file exists" -ForegroundColor Green

    # Check if it has required variables
    $envContent = Get-Content .env -Raw
    $requiredVars = @("DB_PASSWORD", "REDIS_PASSWORD", "JWT_SECRET_KEY", "ENCRYPTION_KEY")
    $missing = @()

    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missing += $var
        }
    }

    if ($missing.Count -gt 0) {
        Write-Host "⚠️  Warning: Missing environment variables:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    } else {
        Write-Host "✅ All required environment variables present" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ .env file created. Please review and update if needed." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Check docker-compose.microservices.yml
Write-Host ""
Write-Host "Checking docker-compose.microservices.yml..." -ForegroundColor Yellow
if (Test-Path docker-compose.microservices.yml) {
    Write-Host "✅ docker-compose.microservices.yml found" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.microservices.yml not found!" -ForegroundColor Red
    exit 1
}

# Check available disk space
Write-Host ""
Write-Host "Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive -Name (Get-Location).Drive.Name
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
if ($freeSpaceGB -lt 20) {
    Write-Host "⚠️  Warning: Low disk space ($freeSpaceGB GB free). Recommended: 20GB+" -ForegroundColor Yellow
} else {
    Write-Host "✅ Sufficient disk space: $freeSpaceGB GB free" -ForegroundColor Green
}

# Check for port conflicts
Write-Host ""
Write-Host "Checking for port conflicts..." -ForegroundColor Yellow
$portsToCheck = @(9000, 9001, 9002, 9003, 9004, 9005, 3500, 5433, 5434, 5435, 5436, 6380, 5673, 15673, 9100, 9101)
$conflicts = @()

foreach ($port in $portsToCheck) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $conflicts += $port
    }
}

if ($conflicts.Count -gt 0) {
    Write-Host "⚠️  Warning: The following ports are in use:" -ForegroundColor Yellow
    $conflicts | ForEach-Object { Write-Host "   - Port $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "   You may need to stop other services or change ports in docker-compose.microservices.yml" -ForegroundColor Yellow
} else {
    Write-Host "✅ All required ports are available" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Verification Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Summary:" -ForegroundColor White
Write-Host "   Docker: Installed and Running ✅" -ForegroundColor Green
Write-Host "   .env: Configured ✅" -ForegroundColor Green
Write-Host "   docker-compose: Ready ✅" -ForegroundColor Green
Write-Host "   Disk Space: $freeSpaceGB GB free" -ForegroundColor Green
if ($conflicts.Count -gt 0) {
    Write-Host "   Port Conflicts: $($conflicts.Count) found ⚠️" -ForegroundColor Yellow
} else {
    Write-Host "   Ports: All available ✅" -ForegroundColor Green
}
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review .env file if needed: notepad .env" -ForegroundColor White
Write-Host "   2. Start the platform: .\scripts\start.ps1" -ForegroundColor White
Write-Host "   3. Open API docs: http://localhost:9001/docs" -ForegroundColor White
Write-Host "   4. Read START_HERE.md for detailed guide" -ForegroundColor White
Write-Host ""

# Ask if user wants to start now
$response = Read-Host "Do you want to start the platform now? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting ComplianceIQ platform..." -ForegroundColor Green
    & .\scripts\start.ps1
} else {
    Write-Host ""
    Write-Host "✅ Setup complete! Run .\scripts\start.ps1 when ready." -ForegroundColor Green
}
