#!/bin/bash

# ComplianceIQ - Automated Security Scanning Script (Bash)
# Scans all Docker images for vulnerabilities using Trivy

set -e

# Default parameters
SEVERITY="HIGH,CRITICAL"
OUTPUT_FORMAT="table"
EXIT_ON_ERROR=false
IGNORE_UNFIXED=false
OUTPUT_DIR="./security-reports"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --severity)
            SEVERITY="$2"
            shift 2
            ;;
        --format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        --exit-on-error)
            EXIT_ON_ERROR=true
            shift
            ;;
        --ignore-unfixed)
            IGNORE_UNFIXED=true
            shift
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--severity SEVERITY] [--format FORMAT] [--exit-on-error] [--ignore-unfixed] [--output-dir DIR]"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}ComplianceIQ Security Scanner${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Check if Trivy is installed
echo -e "${YELLOW}Checking for Trivy installation...${NC}"
if ! command -v trivy &> /dev/null; then
    echo -e "${RED}❌ Trivy is not installed!${NC}"
    echo ""
    echo -e "${YELLOW}Install Trivy:${NC}"
    echo "  Linux: See https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
    echo "  macOS: brew install trivy"
    echo ""
    echo "See SECURITY_SCANNING.md for detailed installation instructions"
    exit 1
fi

echo -e "${GREEN}✅ Trivy found: $(trivy --version | grep Version)${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}📁 Output directory: $OUTPUT_DIR${NC}"

# List of services
services=(
    "auth-service"
    "user-service"
    "organization-service"
    "instance-service"
    "analysis-service"
    "insights-service"
    "widget-service"
    "dashboard-service"
    "notification-service"
    "audit-service"
)

timestamp=$(date +"%Y%m%d-%H%M%S")
success_count=0
vuln_count=0
failed_scans=()

echo -e "${CYAN}🔍 Scanning ${#services[@]} services...${NC}"
echo -e "${GRAY}   Severity Filter: $SEVERITY${NC}"
echo -e "${GRAY}   Output Format: $OUTPUT_FORMAT${NC}"
echo -e "${GRAY}   Ignore Unfixed: $IGNORE_UNFIXED${NC}"
echo ""

for service in "${services[@]}"; do
    image_name="complianceiq-$service"

    echo -e "${GRAY}----------------------------------------${NC}"
    echo -e "${YELLOW}Scanning: $image_name${NC}"
    echo -e "${GRAY}----------------------------------------${NC}"

    # Build Trivy command
    trivy_args=(
        "image"
        "--severity" "$SEVERITY"
        "--format" "$OUTPUT_FORMAT"
    )

    if [ "$IGNORE_UNFIXED" = true ]; then
        trivy_args+=("--ignore-unfixed")
    fi

    # JSON output file
    json_output="$OUTPUT_DIR/$service-$timestamp.json"

    # Run scan
    echo -e "${GRAY}Running scan...${NC}"

    if trivy "${trivy_args[@]}" "$image_name"; then
        # Generate JSON report
        trivy image --severity "$SEVERITY" --format json --output "$json_output" "$image_name" 2>/dev/null || true

        echo -e "${GREEN}✅ Scan completed: $service${NC}"
        ((success_count++))
    else
        # Generate JSON report even on failure
        trivy image --severity "$SEVERITY" --format json --output "$json_output" "$image_name" 2>/dev/null || true

        echo -e "${YELLOW}⚠️  Vulnerabilities found in: $service${NC}"
        ((vuln_count++))

        if [ "$EXIT_ON_ERROR" = true ]; then
            failed_scans+=("$service")
        fi
    fi

    echo ""
done

# Summary
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Scan Summary${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

echo "Total Services Scanned: ${#services[@]}"
echo -e "${GREEN}Clean (No vulnerabilities): $success_count${NC}"
echo -e "${YELLOW}Vulnerabilities Found: $vuln_count${NC}"
echo ""

echo -e "${CYAN}📊 Detailed Reports:${NC}"
for service in "${services[@]}"; do
    report_file="$OUTPUT_DIR/$service-$timestamp.json"
    if [ -f "$report_file" ]; then
        echo -e "${GRAY}  $service -> $report_file${NC}"
    fi
done

echo ""
echo -e "${CYAN}Reports saved to: $OUTPUT_DIR${NC}"
echo ""

# Generate summary report
summary_file="$OUTPUT_DIR/scan-summary-$timestamp.txt"
cat > "$summary_file" << EOF
ComplianceIQ Security Scan Summary
Generated: $(date +"%Y-%m-%d %H:%M:%S")
Severity Filter: $SEVERITY
Ignore Unfixed: $IGNORE_UNFIXED

Total Services: ${#services[@]}
Clean: $success_count
Vulnerabilities: $vuln_count

Detailed Results:
$(for service in "${services[@]}"; do echo "  $service"; done)
EOF

echo -e "${GREEN}📄 Summary saved to: $summary_file${NC}"
echo ""

# Exit with error if vulnerabilities found and --exit-on-error is set
if [ "$EXIT_ON_ERROR" = true ] && [ ${#failed_scans[@]} -gt 0 ]; then
    echo -e "${RED}❌ Scan failed for services: ${failed_scans[*]}${NC}"
    echo -e "${RED}Exiting with error code 1${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Security scan completed!${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Review reports in $OUTPUT_DIR"
echo "  2. Address HIGH and CRITICAL vulnerabilities"
echo "  3. Update base images if needed"
echo "  4. See SECURITY_SCANNING.md for remediation guide"
echo ""
