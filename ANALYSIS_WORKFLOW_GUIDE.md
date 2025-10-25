# ComplianceIQ GRC Analysis - Complete Workflow Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Adding ServiceNow Instance](#adding-servicenow-instance)
3. [Running GRC Analysis](#running-grc-analysis)
4. [Understanding Analysis Results](#understanding-analysis-results)
5. [Analysis Types Explained](#analysis-types-explained)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- ServiceNow Personal Developer Instance (PDI) or production instance
- Admin credentials or integration user account
- ComplianceIQ platform running (http://localhost:3500)

### 5-Minute Getting Started
1. Log in to ComplianceIQ → http://localhost:3500/login
2. Add your ServiceNow instance → Navigate to "Instances"
3. Run your first analysis → Click "Analyze" on your instance
4. View results → Check Dashboard for insights

---

## Adding ServiceNow Instance

### Step 1: Navigate to Instances Page
- From Dashboard, click **"ServiceNow Instances"** or **"Add Instance"**
- URL: http://localhost:3500/instances

### Step 2: Fill Instance Details

#### Basic Information
- **Instance Name**: A friendly name (e.g., "Production ServiceNow", "Dev Instance")
- **ServiceNow URL**: Your instance URL
  - Format: `https://yourinstance.service-now.com`
  - Example: `https://dev12345.service-now.com`
- **Description** (Optional): Notes about this instance

#### Authentication
Choose one of two authentication methods:

**Option A: Basic Auth** (Recommended for PDI)
- Username: Your ServiceNow admin username
- Password: Your ServiceNow password
- Best for: Development/testing environments

**Option B: OAuth 2.0** (Recommended for Production)
- Client ID: Your OAuth application client ID
- Client Secret: Your OAuth application secret
- Best for: Production environments
- Setup guide: https://docs.servicenow.com/bundle/paris-platform-administration/page/administer/security/task/t_CreateEndpointforExternalClients.html

### Step 3: Test Connection
- Click **"Test Connection"** button
- Wait for validation
- ✅ "Connection test successful!" = Ready to save
- ❌ Error = Check credentials and URL

### Step 4: Save Instance
- Click **"Save Instance"**
- Your instance will appear in the instances list

---

## Running GRC Analysis

### Method 1: From Instance List
1. Navigate to **Instances** page
2. Find your ServiceNow instance
3. Click **"📊 Analyze"** button
4. Select analysis type and options

### Method 2: From Dashboard
1. Go to **Dashboard**
2. Click **"Run Analysis"**
3. Select instance from dropdown

### Method 3: Direct URL
- Navigate to: http://localhost:3500/analysis/new

---

## Analysis Configuration

### 1. Select Instance
- Choose from active ServiceNow instances
- Only active instances appear in dropdown
- Status indicator shows instance health

### 2. Analysis Details

**Title** (Required)
- Give your analysis a descriptive name
- Example: "Q4 2025 Compliance Audit", "Monthly Risk Assessment"

**Description** (Optional)
- Add context about this analysis
- Example: "Pre-audit compliance check for ISO 27001"

**Analysis Type** (Required) - Choose one:

#### 📊 **Comprehensive Analysis** (Recommended for first run)
**What it does:**
- Complete GRC assessment
- Analyzes all controls, risks, and compliance requirements
- Generates full dashboard with all metrics

**Use when:**
- Running initial assessment
- Quarterly/annual audits
- Executive reporting needed

**Duration:** 5-15 minutes (depending on data volume)

**Outputs:**
- Control effectiveness scores and distribution
- Risk correlation matrix
- Compliance gap analysis
- Exception report
- Executive summary

---

#### 🎯 **Risk Analysis**
**What it does:**
- Focuses on risk identification and assessment
- Maps risks to existing controls
- Calculates likelihood and impact scores
- Identifies control coverage gaps

**Use when:**
- Risk assessment exercises
- Threat modeling sessions
- Before major changes/projects

**Duration:** 3-7 minutes

**Outputs:**
- Risk scores (likelihood × impact)
- Risk-control correlation map
- Unmitigated risks list
- Mean likelihood across risks
- Top risks by score

**Metrics Generated:**
```
Risk Score = (Likelihood + Impact) / 2
- Critical: > 0.8
- High: 0.6 - 0.8
- Medium: 0.4 - 0.6
- Low: < 0.4
```

---

#### ✅ **Compliance Check**
**What it does:**
- Verifies compliance with standards
- Identifies gaps between requirements and evidence
- Generates remediation recommendations
- Supports multiple frameworks (ISO 27001, SOC 2, HIPAA, etc.)

**Use when:**
- Pre-audit preparation
- Framework certification processes
- Regulatory reporting
- Compliance monitoring

**Duration:** 4-8 minutes

**Outputs:**
- Compliance gap scores by requirement
- Healthy vs. Exception breakdown
- Top 5 compliance gaps
- Remediation recommendations
- Policy alignment metrics

**Gap Scoring:**
```
Gap Score = 1.0 - (Evidence Strength × 0.6 + Status Factor × 0.4)

Classification:
- Healthy: gap_score ≤ 0.3
- Monitor: 0.3 < gap_score ≤ 0.6
- Exception: gap_score > 0.6
```

**Recommendations:**
- Score ≤ 0.3: "Requirement satisfied"
- Score > 0.3: "Evidence insufficient or status incomplete; remediate promptly"

---

#### 🛡️ **Control Effectiveness**
**What it does:**
- Evaluates implementation and maturity of controls
- Scores control effectiveness (0-1 scale)
- Analyzes coverage and procedures
- Forecasts average effectiveness trends

**Use when:**
- Control testing cycles
- Security posture assessments
- Control maturity evaluations

**Duration:** 3-6 minutes

**Outputs:**
- Control effectiveness scores
- Average effectiveness forecast
- Control distribution (top 10)
- Effectiveness commentary by control
- Maturity analysis

**Effectiveness Calculation:**
```python
Effectiveness = (
    (Procedures / 5.0) × 0.4 +  # Complexity: 40%
    Coverage × 0.4 +              # Coverage: 40%
    (Maturity Level / 5.0) × 0.2  # Maturity: 20%
)
```

**Commentary Levels:**
- **< 0.4**: "Limited effectiveness; expand coverage and procedures"
- **0.4 - 0.7**: "Moderate effectiveness; focus on maturity improvements"
- **> 0.7**: "Robust control with balanced coverage"

---

### 3. Start Analysis
- Click **"Start Analysis"** button
- You'll be redirected to analysis progress page
- Status updates every 5 seconds

---

## Understanding Analysis Results

### Analysis Status

**🔄 In Progress**
- Analysis is running
- Progress percentage shown
- Auto-refreshes every 5 seconds
- Estimated time: 3-15 minutes

**✅ Completed**
- Analysis finished successfully
- Full results available
- Can view dashboard metrics
- Export option enabled

**❌ Failed**
- Analysis encountered an error
- Error message displayed
- Retry option available
- Check logs for details

### Viewing Results

#### Dashboard View (Recommended)
Navigate to: **Dashboard** → Select your instance

**Overview Panel:**
- Total instances
- Active connections
- Total controls analyzed
- Total risks identified

**Control Analytics:**
- Total control count
- Average effectiveness: 0.62 (example)
- Distribution: Top 10 controls by effectiveness
- Effectiveness trends over time

**Risk Analytics:**
- Risk points with ID, likelihood, impact, score
- Sorted by score (highest first)
- Color-coded severity:
  - 🔴 Red: Critical (> 0.8)
  - 🟠 Orange: High (0.6-0.8)
  - 🟡 Yellow: Medium (0.4-0.6)
  - 🟢 Green: Low (< 0.4)

**Compliance Analytics:**
- Healthy requirements: gap_score ≤ 0.3
- Monitor: 0.3 < gap_score ≤ 0.6
- Exceptions: gap_score > 0.6
- Top 5 gaps with remediation recommendations

**Exceptions Panel:**
- Critical issues requiring immediate attention
- Categorized by: Compliance, Risk, Control
- Includes recommendations
- Prioritized by severity

**Timeline:**
- Last 8 analyses
- Analysis type, summary, timestamp
- Historical trends visible

#### Analysis List View
Navigate to: **Analysis** → View all analyses

**Filters:**
- All Analyses
- Completed
- In Progress
- Failed

**Each Analysis Card Shows:**
- Title and description
- Status badge with icon
- Instance name
- Start date/time
- Duration
- Progress bar (if running)
- Error details (if failed)

**Actions:**
- 📊 View Results
- 📥 Export (coming soon)
- 🔄 Retry (if failed)
- 🗑️ Delete

---

## Analysis Types Explained

### GRC Modules Analyzed

**1. Risk Management**
- Risk identification and categorization
- Likelihood and impact assessment
- Risk-control correlation
- Coverage gap identification
- Mitigation recommendations

**2. Control Management**
- Control inventory tracking
- Effectiveness evaluation
- Procedure completeness
- Coverage metrics
- Maturity assessment

**3. Compliance Management**
- Requirement tracking
- Evidence validation
- Gap identification
- Framework alignment (ISO 27001, SOC 2, etc.)
- Remediation planning

**4. Policy Compliance**
- Policy alignment scoring
- Coverage metrics
- Regulatory text scanning (NLP)

**5. Audit Trail**
- Analysis history tracking
- Timeline of assessments
- Change tracking over time
- Historical trending

---

## Data Synchronization

### What Gets Synced from ServiceNow?

**Controls:**
- Control ID, name, description
- Procedures and documentation
- Coverage percentage
- Maturity level (1-5)
- Categories and tags
- Implementation status

**Risks:**
- Risk ID, category, description
- Likelihood (0-1 scale)
- Impact (0-1 scale)
- Associated controls
- Mitigation status
- Risk owner

**Compliance Requirements:**
- Requirement ID and description
- Framework/standard (ISO 27001, etc.)
- Evidence documentation
- Implementation status
- Attestation records

**Control-Risk Mappings:**
- Which controls mitigate which risks
- Correlation strength
- Coverage analysis

### Sync Methods

**Manual Sync:**
1. Go to Instances page
2. Click **"🔄 Sync"** button on instance card
3. Syncs all GRC modules
4. Duration: 2-10 minutes

**Automatic Sync:**
- Triggered before each analysis
- Ensures fresh data
- Incremental updates for speed

### Sync Types

**Full Sync:**
- Complete data refresh
- All GRC modules
- Recommended: Monthly or after major changes

**Incremental Sync:**
- Only changed/new records
- Faster performance
- Recommended: Daily or weekly

---

## Advanced Features

### Predictive Analytics
- Forecasts future control effectiveness
- Uses statistical averaging
- Trends over time
- Helps with capacity planning

### NLP Regulatory Scanning
- Extracts insights from policy text
- Policy alignment scoring
- Coverage metrics
- Framework compliance checking

### Celery Async Processing
- Large analyses run in background
- No blocking
- Can continue working
- Email notifications (coming soon)

---

## API Endpoints

For integration or automation:

### Analysis Endpoints
```
POST /api/v1/analyze/controls
POST /api/v1/analyze/risks
POST /api/v1/analyze/compliance
```

### Operations Endpoints
```
POST /api/v1/operations/{instance_id}/controls/replay
POST /api/v1/operations/{instance_id}/risks/replay
```

### Insights Endpoints
```
GET /api/v1/insights/{instance_id}
```

### Dashboard Endpoints
```
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/instances/{instance_id}/metrics
```

### ServiceNow Endpoints
```
POST /api/v1/instances         # Create instance
GET  /api/v1/instances         # List instances
GET  /api/v1/instances/{id}    # Get instance
PUT  /api/v1/instances/{id}    # Update instance
DELETE /api/v1/instances/{id}  # Delete instance
POST /api/v1/instances/{id}/test   # Test connection
POST /api/v1/instances/{id}/sync   # Sync data
```

All endpoints require authentication with JWT bearer token.

---

## Troubleshooting

### Issue: "Not authenticated" error

**Solution:**
1. Log out from the application
2. Clear browser localStorage (F12 → Application → Local Storage → Clear)
3. Log in again
4. Try adding instance again

**Root cause:** JWT token missing organization_id

---

### Issue: Instances page is blank/crashes

**Solution:**
- The issue has been fixed in the latest code
- Restart frontend: `docker restart complianceiq-frontend`
- Clear browser cache and reload

**Root cause:** API response handling mismatch

---

### Issue: Analysis fails immediately

**Check:**
1. Instance status is "Active"
2. Connection test passes
3. ServiceNow credentials are valid
4. Instance has GRC data to analyze

**Debug:**
```bash
docker logs complianceiq-analysis-service --tail 50
docker logs complianceiq-celery-worker-analysis --tail 50
```

---

### Issue: Analysis stuck "In Progress"

**Check:**
1. Celery worker is running: `docker ps | grep celery`
2. RabbitMQ is healthy: `docker ps | grep rabbitmq`
3. Analysis service logs for errors

**Restart workers:**
```bash
docker restart complianceiq-celery-worker-analysis
```

---

### Issue: "Connection test failed"

**Check:**
1. ServiceNow URL is correct (include https://)
2. Credentials are valid
3. ServiceNow instance is accessible from Docker network
4. Account has required permissions:
   - grc_read
   - risk_read
   - compliance_read

---

### Issue: Empty analysis results

**Possible causes:**
1. No GRC data in ServiceNow instance
2. Permissions insufficient
3. Data not synced

**Solution:**
1. Run manual sync first: Click "🔄 Sync" on instance
2. Wait for sync to complete
3. Then run analysis

---

## Best Practices

### 1. Initial Setup
- Start with "Comprehensive Analysis" for baseline
- Review all dashboards to understand current state
- Address critical exceptions first

### 2. Regular Monitoring
- Run monthly comprehensive analysis
- Weekly risk assessments for high-risk environments
- Quarterly compliance checks before audits

### 3. Before Audits
- Run compliance check 2 weeks before
- Address top 5 gaps
- Re-run to verify fixes
- Export results for auditors

### 4. After Major Changes
- Run risk analysis after infrastructure changes
- Run control effectiveness after control updates
- Update risk-control mappings

### 5. Continuous Improvement
- Track effectiveness trends over time
- Monitor exception counts
- Set targets for control maturity
- Regular sync to keep data fresh

---

## Sample Workflows

### Workflow 1: Monthly GRC Assessment
```
1. Sync all instances (1st of month)
2. Run comprehensive analysis on each instance
3. Review dashboard exceptions
4. Create remediation tasks for gaps
5. Schedule follow-up
```

### Workflow 2: Pre-Audit Compliance Check
```
1. Run compliance check 2-3 weeks before audit
2. Identify all exceptions (gap_score > 0.6)
3. Gather/create missing evidence
4. Update implementation status
5. Sync and re-run compliance check
6. Verify gap scores improved
7. Export results for audit package
```

### Workflow 3: Risk Assessment Exercise
```
1. Conduct threat modeling session
2. Update risks in ServiceNow
3. Sync instance
4. Run risk analysis
5. Review unmitigated risks
6. Map risks to new controls
7. Re-run to verify coverage
```

### Workflow 4: Control Testing
```
1. Run control effectiveness analysis
2. Sort controls by effectiveness (lowest first)
3. Test bottom 10 controls
4. Update procedures/coverage in ServiceNow
5. Sync and re-run
6. Track improvement over time
```

---

## Security & Compliance

### Data Security
- All API tokens are hashed (SHA-256)
- JWT-based authentication
- HTTPS for all communications
- No plaintext password storage

### Compliance Features
- Audit trail for all analyses
- Timestamp tracking
- Historical data retention
- Export capabilities

### Access Control
- Role-based access (coming soon)
- Organization-level isolation
- User permissions

---

## Next Steps

After running your first analysis:

1. **Review Dashboard**: Understand your GRC posture
2. **Address Exceptions**: Prioritize critical gaps
3. **Set Baselines**: Record current metrics
4. **Create Schedule**: Plan regular assessments
5. **Track Trends**: Monitor improvements over time

---

## Support & Resources

- **API Documentation**: http://localhost:9005/docs (Analysis Service)
- **GitHub Issues**: Report bugs and feature requests
- **User Guide**: This document
- **Architecture**: See `/docs` folder for technical details

---

## Changelog

### v1.0.0 (2025-10-25)
- ✅ Fixed InstanceList crash issue
- ✅ Fixed JWT authentication for all services
- ✅ Fixed login redirection loop
- ✅ Fixed sync endpoint parameters
- ✅ Fixed analysis service syntax errors
- ✅ Comprehensive analysis types implemented
- ✅ Dashboard analytics operational
- ✅ Celery async task processing
- ✅ Multi-framework compliance support

---

**End of Guide**
