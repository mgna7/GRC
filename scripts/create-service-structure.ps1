# Script to create basic microservice structure for all services
# This creates the app directory, requirements.txt, and basic Python files

$services = @(
    "user",
    "organization",
    "instance",
    "analysis",
    "insights",
    "widget",
    "dashboard",
    "notification",
    "audit"
)

Write-Host "Creating service structure for all microservices..." -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services) {
    $servicePath = "services\$service"
    $appPath = "$servicePath\app"

    Write-Host "Processing: $service" -ForegroundColor Yellow

    # Create app directory if it doesn't exist
    if (-not (Test-Path $appPath)) {
        New-Item -ItemType Directory -Path $appPath -Force | Out-Null
        Write-Host "  ✅ Created app directory" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  App directory already exists" -ForegroundColor Gray
    }

    # Create __init__.py
    if (-not (Test-Path "$appPath\__init__.py")) {
        "" | Out-File -FilePath "$appPath\__init__.py" -Encoding UTF8
        Write-Host "  ✅ Created __init__.py" -ForegroundColor Green
    }

    # Create requirements.txt if it doesn't exist
    if (-not (Test-Path "$servicePath\requirements.txt")) {
        @"
# FastAPI and server
fastapi==0.110.0
uvicorn[standard]==0.27.0
python-multipart==0.0.9

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Redis
redis==5.0.1
hiredis==2.3.2

# HTTP Client
httpx==0.26.0
requests==2.31.0

# Validation
pydantic==2.7.4
pydantic-settings==2.3.2
email-validator==2.1.0

# Authentication (JWT)
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9

# Utilities
python-dotenv==1.0.1
python-json-logger==2.0.7

# Date/Time
python-dateutil==2.8.2
"@ | Out-File -FilePath "$servicePath\requirements.txt" -Encoding UTF8
        Write-Host "  ✅ Created requirements.txt" -ForegroundColor Green
    }

    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Service structure created!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the generated requirements.txt files"
Write-Host "  2. Add service-specific dependencies as needed"
Write-Host "  3. Implement service logic in app/main.py"
Write-Host ""
