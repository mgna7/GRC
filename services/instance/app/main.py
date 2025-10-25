"""
INSTANCE Service - ServiceNow instance management service for ComplianceIQ platform
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine
from app.routes import router as instance_router
from shared.utils.database import Base

# Service metadata
SERVICE_NAME = os.getenv("SERVICE_NAME", "instance-service")
SERVICE_VERSION = "1.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events."""
    # Startup
    print(f"Starting {SERVICE_NAME} v{SERVICE_VERSION}...")
    print(f"Environment: {ENVIRONMENT}")

    # Create database tables (safe for concurrent calls)
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created")
    except Exception as e:
        # Ignore errors if tables already exist (happens with multiple uvicorn workers)
        print(f"Database initialization: {str(e)}")

    yield

    # Shutdown
    print(f"{SERVICE_NAME} shutting down...")


# Create FastAPI application
app = FastAPI(
    title=f"ComplianceIQ {SERVICE_NAME.title()}",
    description="ServiceNow instance management service for ComplianceIQ platform",
    version=SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
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

# Include routers
app.include_router(instance_router)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "environment": ENVIRONMENT
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with service information"""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }
