#!/bin/bash

# ComplianceIQ Microservices Shutdown Script

set -e

echo "========================================="
echo "ComplianceIQ Microservices Shutdown"
echo "========================================="
echo ""

echo "🛑 Stopping all services..."
docker-compose -f docker-compose.microservices.yml down

echo ""
echo "✅ All services stopped!"
echo ""
echo "🗑️  To remove volumes (WARNING: This deletes all data):"
echo "   docker-compose -f docker-compose.microservices.yml down -v"
echo ""
