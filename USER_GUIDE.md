# ComplianceIQ User Guide

## Getting Started with ComplianceIQ

**Current Status:** ✅ Platform is running and ready!

---

## Table of Contents

1. [Admin Login & User Management](#admin-login--user-management)
2. [Adding ServiceNow Instances](#adding-servicenow-instances)
3. [Running Analysis](#running-analysis)
4. [Viewing Results](#viewing-results)
5. [API Documentation](#api-documentation)
6. [Next Steps](#next-steps)

---

## Admin Login & User Management

### Current Status: Authentication Service Ready

The authentication system is set up, but the **frontend UI for login is not yet implemented**. You have two options:

### Option 1: Use API Directly (Current)

Until the login UI is built, you can interact with the backend APIs directly using Swagger UI:

**Access Auth Service API:**
```
http://localhost:9001/docs
```

**Available Endpoints:**

#### 1. Register Admin User
**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "email": "admin@complianceiq.com",
  "password": "YourSecurePassword123!",
  "full_name": "Admin User",
  "role": "admin"
}
```

**How to test:**
1. Open http://localhost:9001/docs
2. Click on `POST /api/v1/auth/register`
3. Click "Try it out"
4. Paste the JSON above
5. Click "Execute"

**Expected Response:**
```json
{
  "id": "uuid-here",
  "email": "admin@complianceiq.com",
  "full_name": "Admin User",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-10-25T..."
}
```

#### 2. Login
**Endpoint:** `POST /api/v1/auth/login`

**Body:**
```json
{
  "email": "admin@complianceiq.com",
  "password": "YourSecurePassword123!"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "admin@complianceiq.com",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

**Save the `access_token`** - you'll need it for authenticated requests!

#### 3. Create Regular User
**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "email": "user@company.com",
  "password": "UserPassword123!",
  "full_name": "John Doe",
  "role": "user"
}
```

### Option 2: Build the Login UI (Recommended for Production)

I can help you add a login page to the React frontend. This would include:
- Login form
- Registration form
- JWT token storage
- Protected routes
- User profile

**Would you like me to create the login UI now?**

---

## Adding ServiceNow Instances

### Step 1: Create an Organization

**Endpoint:** `POST /api/v1/organizations`
**Service:** http://localhost:9003/docs

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "name": "Your Company Name",
  "description": "Production ServiceNow instance",
  "industry": "Technology",
  "size": "Enterprise"
}
```

**Example:**
1. Open http://localhost:9003/docs
2. Click the lock icon (🔒) at the top right
3. Enter your access token: `Bearer YOUR_TOKEN_HERE`
4. Click `POST /api/v1/organizations`
5. Click "Try it out"
6. Paste the JSON above
7. Click "Execute"

**Response:**
```json
{
  "id": "org-uuid",
  "name": "Your Company Name",
  "description": "Production ServiceNow instance",
  "created_at": "2025-10-25T..."
}
```

### Step 2: Add ServiceNow Instance

**Endpoint:** `POST /api/v1/instances`
**Service:** http://localhost:9004/docs

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "name": "Production Instance",
  "url": "https://your-instance.service-now.com",
  "organization_id": "org-uuid-from-step-1",
  "credentials": {
    "type": "oauth",
    "client_id": "your_servicenow_client_id",
    "client_secret": "your_servicenow_client_secret"
  },
  "is_active": true
}
```

**For Basic Auth (Alternative):**
```json
{
  "name": "Production Instance",
  "url": "https://your-instance.service-now.com",
  "organization_id": "org-uuid-from-step-1",
  "credentials": {
    "type": "basic",
    "username": "your_servicenow_username",
    "password": "your_servicenow_password"
  },
  "is_active": true
}
```

**Response:**
```json
{
  "id": "instance-uuid",
  "name": "Production Instance",
  "url": "https://your-instance.service-now.com",
  "status": "active",
  "last_sync": null
}
```

### Step 3: Test Connection

**Endpoint:** `POST /api/v1/instances/{instance_id}/test`
**Service:** http://localhost:9004/docs

This will verify the connection to ServiceNow.

---

## Running Analysis

### Step 1: Sync Data from ServiceNow

**Endpoint:** `POST /api/v1/instances/{instance_id}/sync`
**Service:** http://localhost:9004/docs

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "sync_type": "full",
  "modules": ["controls", "risks", "compliance"]
}
```

**This will:**
- Connect to your ServiceNow instance
- Pull GRC data (controls, risks, compliance items)
- Store in the local database

### Step 2: Run AI Analysis

**Endpoint:** `POST /api/v1/analysis/analyze`
**Service:** http://localhost:9005/docs

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "instance_id": "instance-uuid-from-earlier",
  "analysis_type": "comprehensive",
  "modules": ["controls", "risks", "compliance"]
}
```

**This will:**
- Analyze control effectiveness
- Assess risk levels
- Identify compliance gaps
- Generate recommendations

**Response:**
```json
{
  "analysis_id": "analysis-uuid",
  "status": "processing",
  "message": "Analysis started. Task ID: celery-task-id"
}
```

**Note:** Analysis runs asynchronously via Celery worker.

### Step 3: Check Analysis Status

**Endpoint:** `GET /api/v1/analysis/{analysis_id}/status`
**Service:** http://localhost:9005/docs

**Statuses:**
- `processing` - Analysis in progress
- `completed` - Analysis done
- `failed` - Error occurred

---

## Viewing Results

### Get Analysis Results

**Endpoint:** `GET /api/v1/analysis/{analysis_id}/results`
**Service:** http://localhost:9005/docs

**Response:**
```json
{
  "analysis_id": "uuid",
  "instance_id": "uuid",
  "completed_at": "2025-10-25T...",
  "summary": {
    "total_controls": 150,
    "effective_controls": 120,
    "partially_effective": 20,
    "ineffective": 10,
    "high_risks": 5,
    "medium_risks": 15,
    "low_risks": 30,
    "compliance_score": 85.5
  },
  "details": {
    "controls": [...],
    "risks": [...],
    "recommendations": [...]
  }
}
```

### Get Insights

**Endpoint:** `GET /api/v1/insights`
**Service:** http://localhost:9006/docs

**Query Parameters:**
- `instance_id` - Filter by instance
- `type` - Filter by insight type (trend, anomaly, recommendation)

**Response:**
```json
{
  "insights": [
    {
      "id": "uuid",
      "type": "trend",
      "title": "Control Effectiveness Declining",
      "description": "Control effectiveness has decreased by 5% over the last month",
      "severity": "medium",
      "recommendations": ["Review control testing procedures", "..."]
    }
  ]
}
```

### Get Dashboard Data

**Endpoint:** `GET /api/v1/dashboards`
**Service:** http://localhost:9008/docs

**Response:**
```json
{
  "dashboards": [
    {
      "id": "uuid",
      "name": "Executive Dashboard",
      "widgets": [
        {
          "type": "chart",
          "title": "Control Effectiveness Trend",
          "data": {...}
        },
        {
          "type": "metric",
          "title": "Compliance Score",
          "value": 85.5
        }
      ]
    }
  ]
}
```

---

## API Documentation

### All Services with Swagger UI

| Service | URL | Purpose |
|---------|-----|---------|
| **Auth** | http://localhost:9001/docs | Login, register, user management |
| **User** | http://localhost:9002/docs | User profiles |
| **Organization** | http://localhost:9003/docs | Organization management |
| **Instance** | http://localhost:9004/docs | ServiceNow instances |
| **Analysis** | http://localhost:9005/docs | Run AI analysis |
| **Insights** | http://localhost:9006/docs | View insights |
| **Dashboard** | http://localhost:9008/docs | Dashboard data |
| **Audit** | http://localhost:9010/docs | Audit logs |

### Authentication

All authenticated endpoints require:

**Header:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Getting a token:**
1. Register/Login via http://localhost:9001/docs
2. Copy the `access_token` from the response
3. Click the lock icon (🔒) in any Swagger UI
4. Paste: `Bearer YOUR_TOKEN`

---

## Complete Workflow Example

### 1. Register Admin
```bash
curl -X POST "http://localhost:9001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:9001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!"
  }'
```

**Save the token:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Create Organization
```bash
curl -X POST "http://localhost:9003/api/v1/organizations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corp",
    "industry": "Technology"
  }'
```

**Save the org_id:**
```bash
export ORG_ID="org-uuid-here"
```

### 4. Add ServiceNow Instance
```bash
curl -X POST "http://localhost:9004/api/v1/instances" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production",
    "url": "https://acme.service-now.com",
    "organization_id": "'$ORG_ID'",
    "credentials": {
      "type": "oauth",
      "client_id": "your_client_id",
      "client_secret": "your_secret"
    }
  }'
```

**Save the instance_id:**
```bash
export INSTANCE_ID="instance-uuid-here"
```

### 5. Sync ServiceNow Data
```bash
curl -X POST "http://localhost:9004/api/v1/instances/$INSTANCE_ID/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sync_type": "full",
    "modules": ["controls", "risks", "compliance"]
  }'
```

### 6. Run Analysis
```bash
curl -X POST "http://localhost:9005/api/v1/analysis/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_id": "'$INSTANCE_ID'",
    "analysis_type": "comprehensive"
  }'
```

**Save the analysis_id:**
```bash
export ANALYSIS_ID="analysis-uuid-here"
```

### 7. Check Status
```bash
curl -X GET "http://localhost:9005/api/v1/analysis/$ANALYSIS_ID/status" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Get Results
```bash
curl -X GET "http://localhost:9005/api/v1/analysis/$ANALYSIS_ID/results" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

### Option A: Use APIs Directly (Current)

You can continue using the Swagger UI and cURL commands to:
- Create users
- Add ServiceNow instances
- Run analysis
- View results

### Option B: Build Full Frontend UI (Recommended)

I can help you build a complete React frontend with:

**1. Authentication Pages:**
- Login form
- Registration form
- Password reset
- User profile

**2. Dashboard:**
- Overview of all instances
- Key metrics
- Recent analysis results
- Compliance scores

**3. Instance Management:**
- Add/edit ServiceNow instances
- Test connections
- Sync data
- View sync history

**4. Analysis:**
- Run new analysis
- View analysis history
- Filter and search results
- Export reports

**5. Insights:**
- View AI-generated insights
- Trend analysis
- Risk heatmaps
- Recommendations

**6. Settings:**
- User management
- Organization settings
- API keys
- Notifications

**Would you like me to start building the full frontend UI?**

---

## ServiceNow Configuration

### Setting up OAuth in ServiceNow

1. **Navigate to:** System OAuth → Application Registry
2. **Create New** → Create an OAuth API endpoint for external clients
3. **Fill in:**
   - Name: ComplianceIQ
   - Client ID: (auto-generated, copy this)
   - Client Secret: (generate and copy)
   - Redirect URL: http://localhost:3500/callback
4. **Accessible from:** All application scopes
5. **Active:** Yes

### Required ServiceNow Scopes

Grant these scopes to the OAuth client:
- `useraccount`
- `sn_grc_api` (GRC API access)
- `sn_grc_read` (Read GRC data)

### ServiceNow GRC Tables

ComplianceIQ will access:
- `sn_grc_control` - Controls
- `sn_grc_risk` - Risks
- `sn_grc_policy` - Policies
- `sn_compliance_assessment` - Compliance assessments
- `sn_grc_issue` - Issues

---

## Troubleshooting

### 401 Unauthorized
- Token expired - login again
- Token missing - add `Authorization: Bearer TOKEN` header
- Token invalid - check you copied the full token

### 403 Forbidden
- User doesn't have permission
- Check user role (admin vs user)

### 404 Not Found
- Check the endpoint URL
- Verify the ID exists (organization_id, instance_id, etc.)

### 500 Internal Server Error
- Check service logs:
  ```powershell
  docker-compose -f docker-compose.microservices.yml logs SERVICE_NAME
  ```

### ServiceNow Connection Failed
- Verify URL is correct (include https://)
- Check credentials are valid
- Verify OAuth client is active in ServiceNow
- Check ServiceNow instance is accessible

---

## Quick Reference

**Login:**
```
http://localhost:9001/docs → POST /api/v1/auth/login
```

**Add Instance:**
```
http://localhost:9004/docs → POST /api/v1/instances
```

**Run Analysis:**
```
http://localhost:9005/docs → POST /api/v1/analysis/analyze
```

**View Results:**
```
http://localhost:9005/docs → GET /api/v1/analysis/{id}/results
```

**All APIs:**
```
http://localhost:9000 (API Gateway)
```

---

**Need help building the frontend UI? Let me know and I'll create:**
- Login/Registration pages
- ServiceNow instance management UI
- Analysis dashboard
- Results visualization
- And more!

**Last Updated:** 2025-10-25
