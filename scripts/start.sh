#!/bin/bash

# ComplianceIQ Microservices Startup Script

set -e

echo "========================================="
echo "ComplianceIQ Microservices Startup"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it:"
    echo "  cp .env.example .env"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "🚀 Starting infrastructure services..."
docker-compose -f docker-compose.microservices.yml up -d \
    postgres-auth \
    postgres-core \
    postgres-analysis \
    postgres-audit \
    redis \
    rabbitmq \
    minio

echo ""
echo "⏳ Waiting for databases to be healthy (30 seconds)..."
sleep 30

echo ""
echo "🚀 Starting microservices..."
docker-compose -f docker-compose.microservices.yml up -d \
    auth-service \
    user-service \
    organization-service \
    instance-service \
    analysis-service \
    celery-worker-analysis \
    insights-service \
    dashboard-service \
    audit-service

echo ""
echo "⏳ Waiting for services to be ready (15 seconds)..."
sleep 15

echo ""
echo "🚀 Starting API Gateway..."
docker-compose -f docker-compose.microservices.yml up -d kong

echo ""
echo "🚀 Starting Frontend..."
docker-compose -f docker-compose.microservices.yml up -d frontend

echo ""
echo "========================================="
echo "✅ All services started successfully!"
echo "========================================="
echo ""
echo "📊 Service URLs:"
echo "   API Gateway:       http://localhost:8000"
echo "   Frontend:          http://localhost:3000"
echo "   Kong Admin:        http://localhost:8444"
echo "   RabbitMQ UI:       http://localhost:15672 (user: complianceiq)"
echo "   MinIO Console:     http://localhost:9001 (user: complianceiq)"
echo ""
echo "📚 API Documentation:"
echo "   Auth Service:      http://localhost:8001/docs"
echo "   User Service:      http://localhost:8002/docs"
echo "   Organization:      http://localhost:8003/docs"
echo "   Instance:          http://localhost:8004/docs"
echo "   Analysis:          http://localhost:8005/docs"
echo "   Insights:          http://localhost:8006/docs"
echo "   Dashboard:         http://localhost:8008/docs"
echo "   Audit:             http://localhost:8010/docs"
echo ""
echo "🔍 View logs:"
echo "   docker-compose -f docker-compose.microservices.yml logs -f [service-name]"
echo ""
echo "🛑 Stop all services:"
echo "   ./scripts/stop.sh"
echo ""
