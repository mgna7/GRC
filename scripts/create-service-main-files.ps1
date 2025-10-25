# Script to create main.py for all services

$services = @{
    "organization" = "Organization management service for ComplianceIQ platform"
    "instance" = "ServiceNow instance management service for ComplianceIQ platform"
    "analysis" = "GRC analysis engine service for ComplianceIQ platform"
    "insights" = "Insights and reporting service for ComplianceIQ platform"
    "widget" = "Widget configuration service for ComplianceIQ platform"
    "dashboard" = "Dashboard aggregation service for ComplianceIQ platform"
    "notification" = "Notification and alerting service for ComplianceIQ platform"
    "audit" = "Audit logging service for ComplianceIQ platform"
}

foreach ($service in $services.Keys) {
    $description = $services[$service]
    $servicePath = "services\$service\app\main.py"

    $content = @"
"""
$($service.ToUpper() -replace '-',' ') Service - $description
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Service metadata
SERVICE_NAME = os.getenv("SERVICE_NAME", "$service-service")
SERVICE_VERSION = "1.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Create FastAPI application
app = FastAPI(
    title=f"ComplianceIQ {SERVICE_NAME.title()}",
    description="$description",
    version=SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3500,http://localhost:9000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    ""Health check endpoint""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "environment": ENVIRONMENT
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    ""Root endpoint with service information""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    ""Startup event handler""
    print(f"🚀 {SERVICE_NAME} v{SERVICE_VERSION} starting up...")
    print(f"📍 Environment: {ENVIRONMENT}")
    print(f"📖 API Docs: http://localhost:8000/docs")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    ""Shutdown event handler""
    print(f"👋 {SERVICE_NAME} shutting down...")
"@

    $content | Out-File -FilePath $servicePath -Encoding UTF8
    Write-Host "✅ Created $servicePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All main.py files created!" -ForegroundColor Green
