# ComplianceIQ - Detailed Architecture & Flow Diagrams

> Comprehensive documentation of system architecture, data flows, and component interactions

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Request Flow Diagrams](#request-flow-diagrams)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Component Interaction Diagrams](#component-interaction-diagrams)
5. [Analysis Engine Workflows](#analysis-engine-workflows)
6. [Database Entity Relationships](#database-entity-relationships)
7. [Authentication & Security Flow](#authentication--security-flow)
8. [ServiceNow Integration Flow](#servicenow-integration-flow)
9. [Sequence Diagrams](#sequence-diagrams)
10. [Deployment Architecture](#deployment-architecture)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                       │
│                                                                             │
│  ┌────────────────────┐                        ┌────────────────────┐      │
│  │   Web Browser      │                        │   External API     │      │
│  │   (UI Client)      │                        │   Consumers        │      │
│  │                    │                        │                    │      │
│  │ - Dashboard        │                        │ - Python SDK       │      │
│  │ - Settings         │                        │ - cURL/Postman     │      │
│  │ - Login            │                        │ - Third-party      │      │
│  └──────────┬─────────┘                        └──────────┬─────────┘      │
│             │                                             │                │
│             │ HTTP/HTTPS                                  │ REST API       │
│             │ Session Cookies                             │ X-API-Key      │
└─────────────┼─────────────────────────────────────────────┼────────────────┘
              │                                             │
              └──────────────────┬──────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (FastAPI)                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        Middleware Stack                               │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐  │ │
│  │  │   CORS      │→ │  Session     │→ │  Exception Handling         │  │ │
│  │  │  Middleware │  │  Middleware  │  │  (Custom Error Handlers)    │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                 ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        Routing Layer                                  │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐         ┌──────────────────────────────┐  │ │
│  │  │   Web Router         │         │    API Router                │  │ │
│  │  │   (Templates)        │         │    (/api/v1/*)               │  │ │
│  │  │                      │         │                              │  │ │
│  │  │  GET  /              │         │  ├─ /servicenow              │  │ │
│  │  │  GET  /login         │         │  ├─ /analyze                 │  │ │
│  │  │  POST /login         │         │  ├─ /insights                │  │ │
│  │  │  POST /logout        │         │  ├─ /widgets                 │  │ │
│  │  │  GET  /settings      │         │  ├─ /dashboard               │  │ │
│  │  │                      │         │  └─ /operations              │  │ │
│  │  └──────────┬───────────┘         └───────────┬──────────────────┘  │ │
│  │             │                                  │                     │ │
│  │             └──────────────┬───────────────────┘                     │ │
│  └────────────────────────────┼───────────────────────────────────────┘ │
│                                ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    Security Layer                                     │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │  authenticate_admin()     - Validates email/password           │  │ │
│  │  │  verify_request()         - Session OR API key validation      │  │ │
│  │  │  require_session()        - Session enforcement decorator      │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┬───────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER (Business Logic)                       │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│  │  ServiceNow        │  │  Analysis          │  │  Dashboard         │   │
│  │  Connector         │  │  Service           │  │  Service           │   │
│  │                    │  │                    │  │                    │   │
│  │ - create_instance()│  │ - analyze_         │  │ - get_summary()    │   │
│  │ - update_instance()│  │   controls()       │  │ - get_instance_    │   │
│  │ - delete_instance()│  │ - analyze_risks()  │  │   metrics()        │   │
│  │ - list_instances() │  │ - analyze_         │  │ - aggregate_data() │   │
│  │ - verify_auth()    │  │   compliance()     │  │                    │   │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘   │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│  │  Insights          │  │  Widget            │  │  Operations        │   │
│  │  Service           │  │  Service           │  │  Service           │   │
│  │                    │  │                    │  │                    │   │
│  │ - get_insights()   │  │ - configure_       │  │ - replay_control_  │   │
│  │ - format_results() │  │   widget()         │  │   analysis()       │   │
│  │                    │  │ - get_configs()    │  │ - replay_risk_     │   │
│  │                    │  │                    │  │   analysis()       │   │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Analysis Engines (AI/ML)                         │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────────┐   │   │
│  │  │ ControlEffectiveness     │  │ RiskCorrelationEngine        │   │   │
│  │  │ Analyzer                 │  │                              │   │   │
│  │  │ - calculate_score()      │  │ - map_risks_to_controls()    │   │   │
│  │  │ - evaluate_procedures()  │  │ - calculate_coverage()       │   │   │
│  │  │ - assess_maturity()      │  │ - find_unmitigated_risks()   │   │   │
│  │  └──────────────────────────┘  └──────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────────┐   │   │
│  │  │ ComplianceGapAnalyzer    │  │ PredictiveAnalytics          │   │   │
│  │  │                          │  │                              │   │   │
│  │  │ - identify_gaps()        │  │ - forecast_effectiveness()   │   │   │
│  │  │ - evaluate_evidence()    │  │ - predict_trends()           │   │   │
│  │  │ - prioritize_gaps()      │  │ - calculate_risk_exposure()  │   │   │
│  │  └──────────────────────────┘  └──────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────┐                                      │   │
│  │  │ NLPRegulatoryScan        │  (Placeholder for future ML)         │   │
│  │  │ - scan_regulations()     │                                      │   │
│  │  │ - extract_requirements() │                                      │   │
│  │  └──────────────────────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┬───────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS LAYER (ORM)                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    SQLAlchemy Models                                  │ │
│  │                                                                       │ │
│  │  ServiceNowInstance  ControlData  RiskData  AnalysisResult           │ │
│  │  WidgetConfiguration  MLModel                                        │ │
│  │                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │            Database Session Factory                            │  │ │
│  │  │  - get_db(): Yields SQLAlchemy session                         │  │ │
│  │  │  - Dependency injection for route handlers                     │  │ │
│  │  │  - Automatic commit/rollback on success/failure                │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┬───────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL 16 Database                             │ │
│  │                                                                       │ │
│  │  Tables:                                                              │ │
│  │  - servicenow_instances    (Instance configurations)                 │ │
│  │  - control_data            (Synced control records)                  │ │
│  │  - risk_data               (Synced risk records)                     │ │
│  │  - analysis_results        (Cached analysis outputs)                 │ │
│  │  - widget_configurations   (Widget configs)                          │ │
│  │  - ml_models               (Model metadata & URIs)                   │ │
│  │                                                                       │ │
│  │  Features:                                                            │ │
│  │  - JSONB columns for flexible schema                                 │ │
│  │  - Foreign key constraints with CASCADE delete                       │ │
│  │  - Indexes on frequently queried columns                             │ │
│  │  - UUID primary keys                                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATION LAYER                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              ServiceNow Instance (External System)                    │ │
│  │                                                                       │ │
│  │  REST API Endpoints:                                                  │ │
│  │  - /api/now/table/sn_grc_control                                     │ │
│  │  - /api/now/table/sn_grc_risk                                        │ │
│  │  - /api/now/table/sn_compliance                                      │ │
│  │                                                                       │ │
│  │  GRC Tables:                                                          │ │
│  │  - Controls (sn_grc_control)                                         │ │
│  │  - Risks (sn_grc_risk)                                               │ │
│  │  - Compliance (sn_compliance_*)                                      │ │
│  │  - Widgets/Dashboards (pa_dashboards, pa_widgets)                    │ │
│  │                                                                       │ │
│  │  Authentication: Basic Auth (username:password) or OAuth             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Flow Diagrams

### 2.1 Web UI Request Flow (Dashboard Access)

```
┌─────────┐                                                         ┌─────────┐
│ Browser │                                                         │ Backend │
└────┬────┘                                                         └────┬────┘
     │                                                                   │
     │  1. GET /                                                         │
     ├──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │                    2. Check session cookie (ciq_session)          │
     │                       │                                           │
     │                       ▼                                           │
     │              ┌─────────────────────┐                              │
     │              │ require_session()   │                              │
     │              │  decorator          │                              │
     │              └──────┬──────────────┘                              │
     │                     │                                             │
     │                     │ Session exists?                             │
     │                     ├──[NO]──> 307 Redirect to /login             │
     │<─────────────────────────────────────────────────────────────────┤
     │                     │                                             │
     │                     │ [YES]                                       │
     │                     ▼                                             │
     │              ┌─────────────────────┐                              │
     │              │ Render dashboard.   │                              │
     │              │ html template       │                              │
     │              └──────┬──────────────┘                              │
     │                     │                                             │
     │  3. 200 OK + HTML                                                 │
     │<──────────────────────────────────────────────────────────────────┤
     │                                                                   │
     │  4. Browser renders HTML                                          │
     │  5. Load CSS, JavaScript from /static/                            │
     ├──────────────────────────────────────────────────────────────────>│
     │<──────────────────────────────────────────────────────────────────┤
     │                                                                   │
     │  6. JavaScript: AJAX GET /api/v1/dashboard/summary                │
     ├──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │              7. Verify session (session cookie passed)            │
     │                  ▼                                                │
     │         DashboardService.get_summary()                            │
     │                  ▼                                                │
     │         Query database for metrics                                │
     │                  ▼                                                │
     │  8. 200 OK + JSON (instance count, control count, etc.)           │
     │<──────────────────────────────────────────────────────────────────┤
     │                                                                   │
     │  9. JavaScript updates dashboard UI with live data               │
     │                                                                   │
     │  10. User selects instance from dropdown                          │
     │      JavaScript: AJAX GET /api/v1/dashboard/instances/{id}/metrics│
     ├──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │              11. DashboardService.get_instance_metrics()          │
     │                   Query instance-specific data                    │
     │                                                                   │
     │  12. 200 OK + JSON (compliance analytics, risk timeline, etc.)    │
     │<──────────────────────────────────────────────────────────────────┤
     │                                                                   │
     │  13. JavaScript renders charts, tables, timelines                 │
     │                                                                   │
```

### 2.2 API Request Flow (Control Analysis)

```
┌─────────┐                                                         ┌─────────┐
│  API    │                                                         │ Backend │
│ Client  │                                                         │         │
└────┬────┘                                                         └────┬────┘
     │                                                                   │
     │  1. POST /api/v1/analyze/controls                                 │
     │     Headers: X-API-Key: <token>                                   │
     │     Body: {instance_id, controls: [...]}                          │
     ├──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │                    2. Middleware: verify_request()                │
     │                       │                                           │
     │                       ▼                                           │
     │              ┌─────────────────────┐                              │
     │              │ Check X-API-Key     │                              │
     │              │ header              │                              │
     │              └──────┬──────────────┘                              │
     │                     │                                             │
     │                     │ Valid token?                                │
     │                     ├──[NO]──> 401 Unauthorized                   │
     │<─────────────────────────────────────────────────────────────────┤
     │                     │                                             │
     │                     │ [YES]                                       │
     │                     ▼                                             │
     │              3. Route handler: analyze_controls()                 │
     │                       │                                           │
     │                       ▼                                           │
     │              ┌─────────────────────┐                              │
     │              │ Validate request    │                              │
     │              │ schema (Pydantic)   │                              │
     │              └──────┬──────────────┘                              │
     │                     │                                             │
     │                     ▼                                             │
     │              4. Verify instance exists (DB query)                 │
     │                       │                                           │
     │                       ├──[NOT FOUND]──> 404 Not Found             │
     │<─────────────────────────────────────────────────────────────────┤
     │                       │                                           │
     │                       │ [FOUND]                                   │
     │                       ▼                                           │
     │              5. Save control data to DB (ControlData model)       │
     │                  for each control in request                      │
     │                       │                                           │
     │                       ▼                                           │
     │              6. Call AnalysisService.analyze_controls()           │
     │                       │                                           │
     │                       ▼                                           │
     │         ┌─────────────────────────────────────────────┐           │
     │         │  For each control:                          │           │
     │         │  1. ControlEffectivenessAnalyzer.analyze()  │           │
     │         │     - Calculate base score                  │           │
     │         │     - Evaluate procedures (0.0-0.5)         │           │
     │         │     - Assess coverage (0.0-0.3)             │           │
     │         │     - Check maturity (0.0-0.2)              │           │
     │         │     - Sum = effectiveness_score             │           │
     │         │  2. Generate insights & recommendations     │           │
     │         └──────────────┬──────────────────────────────┘           │
     │                        │                                          │
     │                        ▼                                          │
     │              7. Aggregate results                                 │
     │                 - Average effectiveness                           │
     │                 - Count high/medium/low effectiveness             │
     │                 - Generate summary text                           │
     │                        │                                          │
     │                        ▼                                          │
     │              8. Save to AnalysisResult table                      │
     │                 - analysis_type: 'control'                        │
     │                 - summary: <text>                                 │
     │                 - payload: {scores, insights, metrics}            │
     │                 - generated_at: <timestamp>                       │
     │                        │                                          │
     │                        ▼                                          │
     │  9. 200 OK + JSON Response                                        │
     │     {                                                             │
     │       average_effectiveness: 0.78,                                │
     │       total_controls: 25,                                         │
     │       high_effectiveness: 15,                                     │
     │       insights: [...],                                            │
     │       recommendations: [...]                                      │
     │     }                                                             │
     │<──────────────────────────────────────────────────────────────────┤
     │                                                                   │
```

---

## 3. Data Flow Architecture

### 3.1 ServiceNow Integration Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 PHASE 1: INSTANCE CONNECTION                             │
└──────────────────────────────────────────────────────────────────────────┘

    User Input                    Backend Processing              Database
        │                               │                            │
        │  1. Instance Details          │                            │
        │     - name                    │                            │
        │     - url                     │                            │
        │     - api_user                │                            │
        │     - api_token               │                            │
        ├──────────────────────────────>│                            │
        │                               │                            │
        │                               │ 2. Validate URL format     │
        │                               │    (Pydantic HttpUrl)      │
        │                               │                            │
        │                               │ 3. Hash API token          │
        │                               │    SHA-256(api_token)      │
        │                               │                            │
        │                               │ 4. Verify ServiceNow       │
        │                               │    credentials (simulated) │
        │                               │                            │
        │                               │ 5. Insert/Update           │
        │                               │    ServiceNowInstance      │
        │                               ├───────────────────────────>│
        │                               │                            │
        │                               │ 6. Return instance_id      │
        │                               │<───────────────────────────┤
        │  7. Connection success        │                            │
        │<──────────────────────────────┤                            │
        │     + instance_id (UUID)      │                            │

┌──────────────────────────────────────────────────────────────────────────┐
│                 PHASE 2: DATA SYNCHRONIZATION                            │
└──────────────────────────────────────────────────────────────────────────┘

    ServiceNow API              Backend Service                Database
        │                               │                            │
        │                               │ 1. Fetch controls          │
        │                               │    from ServiceNow         │
        │<──────────────────────────────┤    (API call)              │
        │                               │                            │
        │ 2. Return controls JSON       │                            │
        ├──────────────────────────────>│                            │
        │    [{control_id, name,        │                            │
        │      description, ...}]       │                            │
        │                               │                            │
        │                               │ 3. Transform to            │
        │                               │    ControlData models      │
        │                               │                            │
        │                               │ 4. Bulk insert/update      │
        │                               │    control_data table      │
        │                               ├───────────────────────────>│
        │                               │    - instance_id (FK)      │
        │                               │    - control_id            │
        │                               │    - attributes (JSONB)    │
        │                               │    - synced_at             │
        │                               │                            │
        │                               │ 5. Fetch risks             │
        │<──────────────────────────────┤                            │
        │                               │                            │
        │ 6. Return risks JSON          │                            │
        ├──────────────────────────────>│                            │
        │                               │                            │
        │                               │ 7. Transform & insert      │
        │                               │    risk_data table         │
        │                               ├───────────────────────────>│
        │                               │                            │

┌──────────────────────────────────────────────────────────────────────────┐
│                 PHASE 3: ANALYSIS PROCESSING                             │
└──────────────────────────────────────────────────────────────────────────┘

    Trigger                     Analysis Engine                Database
        │                               │                            │
        │  1. Analysis request          │                            │
        │     (controls/risks/          │                            │
        │      compliance)              │                            │
        ├──────────────────────────────>│                            │
        │                               │                            │
        │                               │ 2. Load synced data        │
        │                               │<───────────────────────────┤
        │                               │    SELECT * FROM           │
        │                               │    control_data WHERE      │
        │                               │    instance_id = ?         │
        │                               │                            │
        │                               │ 3. Process through         │
        │                               │    analyzer engines:       │
        │                               │                            │
        │                        ┌──────┴──────┐                     │
        │                        ▼              ▼                     │
        │              ControlEffectiveness  RiskCorrelation          │
        │                    Analyzer           Engine                │
        │                        │              │                     │
        │                        │ Calculate    │ Map risks           │
        │                        │ scores       │ to controls         │
        │                        │              │                     │
        │                        ▼              ▼                     │
        │                   ComplianceGapAnalyzer                     │
        │                        │                                    │
        │                        │ Identify gaps                      │
        │                        │                                    │
        │                        ▼                                    │
        │                   PredictiveAnalytics                       │
        │                        │                                    │
        │                        │ Generate forecasts                 │
        │                        │                                    │
        │                        ▼                                    │
        │                               │ 4. Aggregate results       │
        │                               │    - Scores                │
        │                               │    - Insights              │
        │                               │    - Recommendations       │
        │                               │                            │
        │                               │ 5. Store result            │
        │                               ├───────────────────────────>│
        │                               │    INSERT INTO             │
        │                               │    analysis_results        │
        │                               │    (payload JSONB)         │
        │                               │                            │
        │  6. Return analysis           │                            │
        │<──────────────────────────────┤                            │
        │     + generated_at            │                            │
        │     + result_id               │                            │

┌──────────────────────────────────────────────────────────────────────────┐
│                 PHASE 4: WIDGET DEPLOYMENT                               │
└──────────────────────────────────────────────────────────────────────────┘

    User Request               Backend Service          ServiceNow API
        │                               │                            │
        │  1. Widget config             │                            │
        │     {widget_name,             │                            │
        │      configuration}           │                            │
        ├──────────────────────────────>│                            │
        │                               │                            │
        │                               │ 2. Validate config         │
        │                               │    (JSON schema)           │
        │                               │                            │
        │                               │ 3. Store in DB             │
        │                               ├───────────────────────────>│
        │                               │    widget_configurations   │  (Database)
        │                               │                            │
        │                               │ 4. Push to ServiceNow      │
        │                               ├───────────────────────────────────>│
        │                               │    POST /api/now/ui/       │
        │                               │    dashboard_widgets       │
        │                               │                            │
        │                               │ 5. Widget created          │
        │                               │<───────────────────────────────────┤
        │                               │    {widget_id}             │
        │                               │                            │
        │  6. Success + widget_id       │                            │
        │<──────────────────────────────┤                            │
```

---

## 4. Component Interaction Diagrams

### 4.1 Analysis Service Component Interactions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AnalysisService                                  │
│                                                                         │
│  Entry Point: analyze_controls(instance_id, controls[])                │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 1: Data Persistence                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  for control in controls:                                   │  │ │
│  │  │      ControlData.create_or_update(                          │  │ │
│  │  │          instance_id=instance_id,                           │  │ │
│  │  │          control_id=control.control_id,                     │  │ │
│  │  │          attributes={                                       │  │ │
│  │  │              "procedures": control.procedures,              │  │ │
│  │  │              "coverage": control.coverage,                  │  │ │
│  │  │              "maturity_level": control.maturity_level,      │  │ │
│  │  │              "categories": control.categories               │  │ │
│  │  │          }                                                   │  │ │
│  │  │      )                                                       │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 2: Initialize Analyzers                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  effectiveness_analyzer = ControlEffectivenessAnalyzer()    │  │ │
│  │  │  compliance_analyzer = ComplianceGapAnalyzer()              │  │ │
│  │  │  predictive = PredictiveAnalytics()                         │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 3: Analysis Loop                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  scores = []                                                │  │ │
│  │  │  insights = []                                              │  │ │
│  │  │                                                              │  │ │
│  │  │  for control in controls:                                   │  │ │
│  │  │      # Effectiveness Analysis                               │  │ │
│  │  │      score = effectiveness_analyzer.analyze(control)        │  │ │
│  │  │      scores.append({                                        │  │ │
│  │  │          "control_id": control.control_id,                  │  │ │
│  │  │          "effectiveness": score,                            │  │ │
│  │  │          "status": categorize_score(score)                  │  │ │
│  │  │      })                                                      │  │ │
│  │  │                                                              │  │ │
│  │  │      # Generate insights                                    │  │ │
│  │  │      if score < 0.5:                                        │  │ │
│  │  │          insights.append({                                  │  │ │
│  │  │              "type": "warning",                             │  │ │
│  │  │              "control_id": control.control_id,              │  │ │
│  │  │              "message": "Low effectiveness detected",       │  │ │
│  │  │              "recommendation": "Strengthen procedures"      │  │ │
│  │  │          })                                                  │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 4: Aggregation                                             │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  avg_effectiveness = mean(scores)                           │  │ │
│  │  │  high_count = count(score >= 0.7)                           │  │ │
│  │  │  medium_count = count(0.4 <= score < 0.7)                   │  │ │
│  │  │  low_count = count(score < 0.4)                             │  │ │
│  │  │                                                              │  │ │
│  │  │  summary = f"Analyzed {len(controls)} controls..."          │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 5: Persist Results                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  AnalysisResult.create(                                     │  │ │
│  │  │      instance_id=instance_id,                               │  │ │
│  │  │      analysis_type="control",                               │  │ │
│  │  │      summary=summary,                                       │  │ │
│  │  │      payload={                                              │  │ │
│  │  │          "average_effectiveness": avg_effectiveness,        │  │ │
│  │  │          "total_controls": len(controls),                   │  │ │
│  │  │          "scores": scores,                                  │  │ │
│  │  │          "insights": insights,                              │  │ │
│  │  │          "distribution": {                                  │  │ │
│  │  │              "high": high_count,                            │  │ │
│  │  │              "medium": medium_count,                        │  │ │
│  │  │              "low": low_count                               │  │ │
│  │  │          }                                                   │  │ │
│  │  │      }                                                       │  │ │
│  │  │  )                                                           │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Step 6: Return Response                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  return ControlAnalysisResponse(                            │  │ │
│  │  │      average_effectiveness=avg_effectiveness,               │  │ │
│  │  │      total_controls=len(controls),                          │  │ │
│  │  │      high_effectiveness=high_count,                         │  │ │
│  │  │      medium_effectiveness=medium_count,                     │  │ │
│  │  │      low_effectiveness=low_count,                           │  │ │
│  │  │      insights=insights,                                     │  │ │
│  │  │      generated_at=datetime.utcnow()                         │  │ │
│  │  │  )                                                           │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Control Effectiveness Analyzer Algorithm

```
┌─────────────────────────────────────────────────────────────────────────┐
│           ControlEffectivenessAnalyzer.analyze(control)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │  Initialize base_score = 0.0  │
                └───────────────┬───────────────┘
                                ▼
        ┌───────────────────────────────────────────────────┐
        │  Component 1: Procedures Evaluation (max: 0.5)    │
        │  ┌─────────────────────────────────────────────┐  │
        │  │  procedures_text = control.procedures       │  │
        │  │                                              │  │
        │  │  if procedures_text is None or empty:       │  │
        │  │      procedures_score = 0.0                 │  │
        │  │  else:                                       │  │
        │  │      length = len(procedures_text)          │  │
        │  │      if length > 200:                       │  │
        │  │          procedures_score = 0.5             │  │
        │  │      elif length > 100:                     │  │
        │  │          procedures_score = 0.3             │  │
        │  │      else:                                   │  │
        │  │          procedures_score = 0.1             │  │
        │  │                                              │  │
        │  │  base_score += procedures_score             │  │
        │  └─────────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────────┐
        │  Component 2: Coverage Evaluation (max: 0.3)      │
        │  ┌─────────────────────────────────────────────┐  │
        │  │  coverage_text = control.coverage           │  │
        │  │                                              │  │
        │  │  if "all" in coverage_text.lower():         │  │
        │  │      coverage_score = 0.3                   │  │
        │  │  elif "most" in coverage_text.lower():      │  │
        │  │      coverage_score = 0.2                   │  │
        │  │  elif "some" in coverage_text.lower():      │  │
        │  │      coverage_score = 0.1                   │  │
        │  │  else:                                       │  │
        │  │      coverage_score = 0.05                  │  │
        │  │                                              │  │
        │  │  base_score += coverage_score               │  │
        │  └─────────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────────┐
        │  Component 3: Maturity Assessment (max: 0.2)      │
        │  ┌─────────────────────────────────────────────┐  │
        │  │  maturity_level = control.maturity_level    │  │
        │  │                                              │  │
        │  │  maturity_map = {                           │  │
        │  │      "Optimized": 0.2,                      │  │
        │  │      "Managed": 0.15,                       │  │
        │  │      "Defined": 0.1,                        │  │
        │  │      "Repeatable": 0.05,                    │  │
        │  │      "Initial": 0.0                         │  │
        │  │  }                                           │  │
        │  │                                              │  │
        │  │  maturity_score = maturity_map.get(         │  │
        │  │      maturity_level, 0.0                    │  │
        │  │  )                                           │  │
        │  │                                              │  │
        │  │  base_score += maturity_score               │  │
        │  └─────────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────────┐
        │  Normalization & Return                           │
        │  ┌─────────────────────────────────────────────┐  │
        │  │  # Ensure score is in [0.0, 1.0]            │  │
        │  │  final_score = min(max(base_score, 0.0),    │  │
        │  │                    1.0)                      │  │
        │  │                                              │  │
        │  │  return final_score                         │  │
        │  └─────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────┘

Scoring Examples:

Control A (High Effectiveness):
  - Procedures: 250 chars → 0.5
  - Coverage: "All users" → 0.3
  - Maturity: "Optimized" → 0.2
  - Total: 1.0 (100% effective)

Control B (Medium Effectiveness):
  - Procedures: 150 chars → 0.3
  - Coverage: "Most departments" → 0.2
  - Maturity: "Defined" → 0.1
  - Total: 0.6 (60% effective)

Control C (Low Effectiveness):
  - Procedures: 50 chars → 0.1
  - Coverage: "Some systems" → 0.1
  - Maturity: "Initial" → 0.0
  - Total: 0.2 (20% effective)
```

---

## 5. Analysis Engine Workflows

### 5.1 Risk Correlation Engine Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│            RiskCorrelationEngine.analyze(instance_id, risks)            │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │  Step 1: Load All Controls for Instance       │
        │  ┌─────────────────────────────────────────┐  │
        │  │  controls = db.query(ControlData)       │  │
        │  │      .filter(                           │  │
        │  │          instance_id == instance_id     │  │
        │  │      ).all()                            │  │
        │  │                                          │  │
        │  │  if not controls:                       │  │
        │  │      return empty_result                │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 2: Build Control Category Index         │
        │  ┌─────────────────────────────────────────┐  │
        │  │  control_by_category = defaultdict(list)│  │
        │  │                                          │  │
        │  │  for control in controls:               │  │
        │  │      for category in control.categories:│  │
        │  │          control_by_category[category]  │  │
        │  │              .append(control)           │  │
        │  │                                          │  │
        │  │  # Example:                             │  │
        │  │  # {                                     │  │
        │  │  #   "Access Management": [CTRL-001],   │  │
        │  │  #   "Data Security": [CTRL-002, ...]   │  │
        │  │  # }                                     │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 3: Correlate Each Risk                  │
        │  ┌─────────────────────────────────────────┐  │
        │  │  correlations = []                      │  │
        │  │  unmitigated_risks = []                 │  │
        │  │                                          │  │
        │  │  for risk in risks:                     │  │
        │  │      # Find matching controls           │  │
        │  │      matched_controls = []              │  │
        │  │                                          │  │
        │  │      # Direct category match            │  │
        │  │      if risk.category in control_by_    │  │
        │  │         category:                       │  │
        │  │          matched_controls.extend(       │  │
        │  │              control_by_category[       │  │
        │  │                  risk.category]         │  │
        │  │          )                               │  │
        │  │                                          │  │
        │  │      # Tag-based matching               │  │
        │  │      for tag in risk.tags:              │  │
        │  │          for cat, ctrls in              │  │
        │  │              control_by_category.items():│ │
        │  │              if tag.lower() in          │  │
        │  │                  cat.lower():           │  │
        │  │                  matched_controls.      │  │
        │  │                      extend(ctrls)      │  │
        │  │                                          │  │
        │  │      # De-duplicate                     │  │
        │  │      matched_controls = list(set(       │  │
        │  │          matched_controls))             │  │
        │  │                                          │  │
        │  │      if matched_controls:               │  │
        │  │          correlations.append({          │  │
        │  │              "risk_id": risk.risk_id,   │  │
        │  │              "risk_category": risk.     │  │
        │  │                  category,              │  │
        │  │              "matched_controls": [      │  │
        │  │                  c.control_id for c in  │  │
        │  │                  matched_controls       │  │
        │  │              ],                          │  │
        │  │              "coverage_count": len(     │  │
        │  │                  matched_controls),     │  │
        │  │              "risk_score": risk.        │  │
        │  │                  likelihood * risk.impact│ │
        │  │          })                              │  │
        │  │      else:                              │  │
        │  │          unmitigated_risks.append({     │  │
        │  │              "risk_id": risk.risk_id,   │  │
        │  │              "category": risk.category, │  │
        │  │              "reason": "No matching     │  │
        │  │                  controls found"        │  │
        │  │          })                              │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 4: Calculate Metrics                    │
        │  ┌─────────────────────────────────────────┐  │
        │  │  total_risks = len(risks)               │  │
        │  │  covered_risks = len(correlations)      │  │
        │  │  uncovered_risks = len(                 │  │
        │  │      unmitigated_risks)                 │  │
        │  │                                          │  │
        │  │  coverage_percentage = (covered_risks / │  │
        │  │      total_risks) * 100                 │  │
        │  │                                          │  │
        │  │  avg_controls_per_risk = mean([         │  │
        │  │      c["coverage_count"] for c in       │  │
        │  │      correlations                       │  │
        │  │  ])                                      │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 5: Generate Insights                    │
        │  ┌─────────────────────────────────────────┐  │
        │  │  insights = []                          │  │
        │  │                                          │  │
        │  │  if uncovered_risks > 0:                │  │
        │  │      insights.append({                  │  │
        │  │          "type": "critical",            │  │
        │  │          "message": f"{uncovered_risks} │  │
        │  │              risks have no mitigation", │  │
        │  │          "recommendation": "Implement   │  │
        │  │              controls for these risks"  │  │
        │  │      })                                  │  │
        │  │                                          │  │
        │  │  # Identify high-risk items             │  │
        │  │  high_risk_items = [                    │  │
        │  │      c for c in correlations            │  │
        │  │      if c["risk_score"] > 0.7           │  │
        │  │  ]                                       │  │
        │  │                                          │  │
        │  │  if high_risk_items:                    │  │
        │  │      insights.append({                  │  │
        │  │          "type": "warning",             │  │
        │  │          "message": f"{len(high_risk_   │  │
        │  │              items)} high-severity      │  │
        │  │              risks detected"            │  │
        │  │      })                                  │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 6: Persist & Return                     │
        │  ┌─────────────────────────────────────────┐  │
        │  │  # Save to analysis_results table       │  │
        │  │  AnalysisResult.create(...)             │  │
        │  │                                          │  │
        │  │  return RiskAnalysisResponse(           │  │
        │  │      total_risks=total_risks,           │  │
        │  │      covered_risks=covered_risks,       │  │
        │  │      uncovered_risks=uncovered_risks,   │  │
        │  │      coverage_percentage=coverage_      │  │
        │  │          percentage,                    │  │
        │  │      correlations=correlations,         │  │
        │  │      unmitigated_risks=unmitigated_     │  │
        │  │          risks,                         │  │
        │  │      insights=insights                  │  │
        │  │  )                                       │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
```

### 5.2 Compliance Gap Analyzer Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│       ComplianceGapAnalyzer.analyze(instance_id, requirements)          │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │  Step 1: Load Control & Risk Data             │
        │  ┌─────────────────────────────────────────┐  │
        │  │  controls = load_controls(instance_id)  │  │
        │  │  risks = load_risks(instance_id)        │  │
        │  │  requirements = input_requirements      │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 2: For Each Requirement, Check Coverage │
        │  ┌─────────────────────────────────────────┐  │
        │  │  gaps = []                              │  │
        │  │                                          │  │
        │  │  for req in requirements:               │  │
        │  │      # Find relevant controls           │  │
        │  │      relevant_controls = [              │  │
        │  │          c for c in controls            │  │
        │  │          if req.requirement_id in       │  │
        │  │             c.attributes.get(           │  │
        │  │                 "compliance_refs", [])  │  │
        │  │      ]                                   │  │
        │  │                                          │  │
        │  │      # Evaluate evidence strength       │  │
        │  │      evidence_score = 0.0               │  │
        │  │                                          │  │
        │  │      if req.evidence:                   │  │
        │  │          if req.evidence.status ==      │  │
        │  │              "Verified":                │  │
        │  │              evidence_score = 1.0       │  │
        │  │          elif req.evidence.status ==    │  │
        │  │              "Partial":                 │  │
        │  │              evidence_score = 0.5       │  │
        │  │          else:                           │  │
        │  │              evidence_score = 0.0       │  │
        │  │                                          │  │
        │  │      # Identify gaps                    │  │
        │  │      if not relevant_controls:          │  │
        │  │          gaps.append({                  │  │
        │  │              "requirement_id": req.id,  │  │
        │  │              "type": "missing_control", │  │
        │  │              "severity": "high",        │  │
        │  │              "description": "No control │  │
        │  │                  addresses requirement" │  │
        │  │          })                              │  │
        │  │                                          │  │
        │  │      if evidence_score < 0.5:           │  │
        │  │          gaps.append({                  │  │
        │  │              "requirement_id": req.id,  │  │
        │  │              "type": "insufficient_     │  │
        │  │                  evidence",             │  │
        │  │              "severity": "medium",      │  │
        │  │              "description": "Evidence   │  │
        │  │                  not verified"          │  │
        │  │          })                              │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 3: Prioritize Gaps                      │
        │  ┌─────────────────────────────────────────┐  │
        │  │  # Sort by severity                     │  │
        │  │  severity_order = {                     │  │
        │  │      "critical": 0,                     │  │
        │  │      "high": 1,                         │  │
        │  │      "medium": 2,                       │  │
        │  │      "low": 3                           │  │
        │  │  }                                       │  │
        │  │                                          │  │
        │  │  gaps.sort(key=lambda g:                │  │
        │  │      severity_order[g["severity"]])    │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 4: Generate Remediation Plan            │
        │  ┌─────────────────────────────────────────┐  │
        │  │  remediation_actions = []               │  │
        │  │                                          │  │
        │  │  for gap in gaps:                       │  │
        │  │      if gap["type"] == "missing_control"│ │
        │  │          action = {                     │  │
        │  │              "priority": gap["severity"],│ │
        │  │              "action": "Implement new   │  │
        │  │                  control",              │  │
        │  │              "timeline": "30 days"      │  │
        │  │          }                               │  │
        │  │      elif gap["type"] ==                │  │
        │  │          "insufficient_evidence":       │  │
        │  │          action = {                     │  │
        │  │              "priority": gap["severity"],│ │
        │  │              "action": "Collect evidence│ │
        │  │                  & document",           │  │
        │  │              "timeline": "14 days"      │  │
        │  │          }                               │  │
        │  │                                          │  │
        │  │      remediation_actions.append(action) │  │
        │  └─────────────────────────────────────────┘  │
        └────────────────────┬──────────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │  Step 5: Return Analysis                      │
        │  ┌─────────────────────────────────────────┐  │
        │  │  return ComplianceAnalysisResponse(     │  │
        │  │      total_requirements=len(            │  │
        │  │          requirements),                 │  │
        │  │      gaps_identified=len(gaps),         │  │
        │  │      compliance_percentage=(1 - len(    │  │
        │  │          gaps)/len(requirements)) * 100,│  │
        │  │      gaps=gaps,                         │  │
        │  │      remediation_plan=remediation_      │  │
        │  │          actions                        │  │
        │  │  )                                       │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
```

---

## 6. Database Entity Relationships

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Entity Relationship Diagram                         │
└────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     ServiceNowInstance (Central Entity)             │
│─────────────────────────────────────────────────────────────────────│
│  PK  id                    UUID                                     │
│  UQ  instance_name         VARCHAR(255)                             │
│  UQ  instance_url          VARCHAR(512)                             │
│      api_user              VARCHAR(255)                             │
│      api_token_hash        VARCHAR(64)   -- SHA-256                 │
│      instance_metadata     JSONB         -- Flexible JSON           │
│      is_active             BOOLEAN       -- Default: TRUE           │
│      created_at            TIMESTAMP     -- Auto: now()             │
│      updated_at            TIMESTAMP     -- Auto: now()             │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               │ 1
               │
               ├───────────────────┐
               │                   │
               │ *                 │ *
               ▼                   ▼
┌───────────────────────┐   ┌───────────────────────┐
│    ControlData        │   │      RiskData         │
│───────────────────────│   │───────────────────────│
│  PK  id        UUID   │   │  PK  id        UUID   │
│  FK  instance_id      │   │  FK  instance_id      │
│      control_id       │   │      risk_id          │
│      name             │   │      category         │
│      description      │   │      description      │
│      attributes JSONB │   │      attributes JSONB │
│         ├─procedures  │   │         ├─likelihood  │
│         ├─coverage    │   │         ├─impact      │
│         ├─maturity_   │   │         └─tags[]      │
│         │  level      │   │                       │
│         └─categories[]│   │      synced_at        │
│                       │   │                       │
│      synced_at        │   │                       │
└───────────────────────┘   └───────────────────────┘
               │
               │ 1
               │
               ├───────────────────┬───────────────────┐
               │                   │                   │
               │ *                 │ *                 │ *
               ▼                   ▼                   ▼
┌───────────────────────┐   ┌───────────────────┐   ┌─────────────────┐
│   AnalysisResult      │   │WidgetConfiguration│   │    MLModel      │
│───────────────────────│   │───────────────────│   │─────────────────│
│  PK  id        UUID   │   │  PK  id      UUID │   │  PK  id   UUID  │
│  FK  instance_id      │   │  FK  instance_id  │   │  FK  instance_id│
│      analysis_type    │   │      widget_name  │   │      model_name │
│         ├─ 'control'  │   │      configuration│   │      version    │
│         ├─ 'risk'     │   │         JSONB     │   │      storage_uri│
│         └─ 'compliance│   │                   │   │      model_     │
│                       │   │      pushed_at    │   │      metadata   │
│      summary   TEXT   │   │                   │   │         JSONB   │
│      payload   JSONB  │   │                   │   │                 │
│         ├─scores[]    │   │                   │   │      trained_at │
│         ├─insights[]  │   │                   │   │                 │
│         ├─metrics{}   │   │                   │   │                 │
│         └─distribution│   │                   │   │                 │
│                       │   │                   │   │                 │
│      generated_at     │   │                   │   │                 │
└───────────────────────┘   └───────────────────┘   └─────────────────┘


Relationships & Cardinality:

  ServiceNowInstance  1──────*  ControlData
  ServiceNowInstance  1──────*  RiskData
  ServiceNowInstance  1──────*  AnalysisResult
  ServiceNowInstance  1──────*  WidgetConfiguration
  ServiceNowInstance  1──────*  MLModel

Foreign Key Constraints:
  - ON DELETE CASCADE: Deleting instance removes all child records
  - ON UPDATE CASCADE: Instance ID updates propagate

Indexes (for performance):
  - servicenow_instances: (instance_name), (instance_url), (is_active)
  - control_data: (instance_id), (control_id), (synced_at)
  - risk_data: (instance_id), (risk_id), (category), (synced_at)
  - analysis_results: (instance_id), (analysis_type), (generated_at)
  - widget_configurations: (instance_id), (pushed_at)
  - ml_models: (instance_id), (model_name, version)
```

---

## 7. Authentication & Security Flow

### 7.1 Session-Based Authentication (Web UI)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Web UI Login & Session Flow                            │
└─────────────────────────────────────────────────────────────────────────┘

    Browser                     Backend                    Session Store
        │                          │                             │
        │  1. GET /login           │                             │
        ├─────────────────────────>│                             │
        │                          │                             │
        │  2. 200 OK + login.html  │                             │
        │<─────────────────────────┤                             │
        │                          │                             │
        │  3. User enters email &  │                             │
        │     password             │                             │
        │                          │                             │
        │  4. POST /login          │                             │
        │     {email, password}    │                             │
        ├─────────────────────────>│                             │
        │                          │                             │
        │                          │ 5. authenticate_admin()     │
        │                          │    - Check ADMIN_EMAIL env  │
        │                          │    - Check ADMIN_PASSWORD   │
        │                          │    - Compare credentials    │
        │                          │                             │
        │                          │    Valid?                   │
        │                          │    ├─[NO]──> 401 Invalid    │
        │  6. 401 Unauthorized     │    │         credentials    │
        │<─────────────────────────┤    │                        │
        │                          │    │                        │
        │                          │    └─[YES]                  │
        │                          │                             │
        │                          │ 7. Create session           │
        │                          ├────────────────────────────>│
        │                          │    request.session[         │
        │                          │        "authenticated"      │
        │                          │    ] = True                 │
        │                          │    request.session[         │
        │                          │        "user"               │
        │                          │    ] = email                │
        │                          │                             │
        │  8. Set-Cookie:          │                             │
        │     ciq_session=<token>  │                             │
        │     307 Redirect to /    │                             │
        │<─────────────────────────┤                             │
        │                          │                             │
        │  9. GET /                │                             │
        │     Cookie: ciq_session  │                             │
        ├─────────────────────────>│                             │
        │                          │                             │
        │                          │ 10. require_session()       │
        │                          │     decorator checks        │
        │                          │     session cookie          │
        │                          ├────────────────────────────>│
        │                          │     Retrieve session        │
        │                          │<────────────────────────────┤
        │                          │                             │
        │                          │ 11. session.get(            │
        │                          │     "authenticated")        │
        │                          │                             │
        │                          │     Authenticated?          │
        │                          │     ├─[NO]──> 307 /login    │
        │                          │     │                       │
        │                          │     └─[YES]                 │
        │                          │                             │
        │ 12. 200 OK + dashboard   │                             │
        │     HTML                 │                             │
        │<─────────────────────────┤                             │
        │                          │                             │
        │ 13. User clicks Logout   │                             │
        │                          │                             │
        │ 14. POST /logout         │                             │
        ├─────────────────────────>│                             │
        │                          │                             │
        │                          │ 15. request.session.clear() │
        │                          ├────────────────────────────>│
        │                          │     Delete session          │
        │                          │                             │
        │ 16. Clear cookie         │                             │
        │     307 Redirect to      │                             │
        │     /login               │                             │
        │<─────────────────────────┤                             │
```

### 7.2 API Key Authentication (REST API)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     API Key Authentication Flow                         │
└─────────────────────────────────────────────────────────────────────────┘

    API Client                   Backend                  Config/Env
        │                          │                             │
        │  1. GET /api/v1/         │                             │
        │     servicenow           │                             │
        │     Headers:             │                             │
        │       X-API-Key: abc123  │                             │
        ├─────────────────────────>│                             │
        │                          │                             │
        │                          │ 2. verify_request()         │
        │                          │    dependency               │
        │                          │                             │
        │                          │ 3. Check for session        │
        │                          │    (not present for API)    │
        │                          │                             │
        │                          │ 4. Extract X-API-Key        │
        │                          │    from headers             │
        │                          │                             │
        │                          │ 5. Load SERVICE_ACCOUNT_    │
        │                          │    TOKEN from env           │
        │                          │<────────────────────────────┤
        │                          │    "local-dev-token"        │
        │                          │                             │
        │                          │ 6. Compare tokens           │
        │                          │    if X-API-Key ==          │
        │                          │       SERVICE_ACCOUNT_TOKEN:│
        │                          │         ✓ Authorized        │
        │                          │    else:                    │
        │                          │         ✗ Unauthorized      │
        │                          │                             │
        │                          │    Match?                   │
        │                          │    ├─[NO]──> Raise          │
        │                          │    │         HTTPException  │
        │                          │    │         401            │
        │  7. 401 Unauthorized     │    │                        │
        │     {detail: "Invalid    │    │                        │
        │      API key"}           │    │                        │
        │<─────────────────────────┤    │                        │
        │                          │    │                        │
        │                          │    └─[YES]                  │
        │                          │                             │
        │                          │ 8. Proceed to route handler │
        │                          │                             │
        │ 9. 200 OK + Response     │                             │
        │    data                  │                             │
        │<─────────────────────────┤                             │

Security Notes:

1. Dual Authentication:
   - Web UI: Session-based (ciq_session cookie)
   - API: Token-based (X-API-Key header)

2. Token Storage:
   - ServiceNow API tokens: SHA-256 hashed in database
   - Service account token: Environment variable (plain text)

3. Session Security:
   - Secret key from environment (SECRET_KEY)
   - Secure cookies in production (https_only=True)
   - Session expiry handled by SessionMiddleware

4. Production Hardening:
   - Use strong SECRET_KEY (32+ random bytes)
   - Enable HTTPS-only cookies
   - Rotate SERVICE_ACCOUNT_TOKEN regularly
   - Implement rate limiting (not currently present)
   - Add IP whitelisting for sensitive endpoints
```

---

## 8. ServiceNow Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│              ServiceNow Bidirectional Integration Flow                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  INBOUND: Fetch Data from ServiceNow → ComplianceIQ                     │
└─────────────────────────────────────────────────────────────────────────┘

ComplianceIQ              ServiceNow API            PostgreSQL
     │                          │                         │
     │ 1. Trigger sync          │                         │
     │    (manual/scheduled)    │                         │
     │                          │                         │
     │ 2. GET /api/now/table/   │                         │
     │    sn_grc_control?       │                         │
     │    sysparm_limit=1000    │                         │
     ├─────────────────────────>│                         │
     │    Auth: Basic user:token│                         │
     │                          │                         │
     │ 3. ServiceNow validates  │                         │
     │    credentials           │                         │
     │                          │                         │
     │ 4. 200 OK + JSON         │                         │
     │    {result: [            │                         │
     │      {sys_id, number,    │                         │
     │       name, description, │                         │
     │       control_category}  │                         │
     │    ]}                    │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │ 5. Transform to          │                         │
     │    ControlData models    │                         │
     │    - Extract attributes  │                         │
     │    - Map fields          │                         │
     │                          │                         │
     │ 6. UPSERT control_data   │                         │
     ├─────────────────────────────────────────────────────>│
     │    ON CONFLICT (         │                         │
     │    instance_id,          │                         │
     │    control_id)           │                         │
     │    DO UPDATE             │                         │
     │                          │                         │
     │ 7. GET /api/now/table/   │                         │
     │    sn_grc_risk           │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │ 8. 200 OK + Risks JSON   │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │ 9. Transform & UPSERT    │                         │
     │    risk_data             │                         │
     ├─────────────────────────────────────────────────────>│
     │                          │                         │
     │10. Sync complete         │                         │

┌─────────────────────────────────────────────────────────────────────────┐
│  OUTBOUND: Push Analytics/Widgets → ServiceNow                          │
└─────────────────────────────────────────────────────────────────────────┘

ComplianceIQ              ServiceNow API            PostgreSQL
     │                          │                         │
     │ 1. User configures       │                         │
     │    widget via UI/API     │                         │
     │                          │                         │
     │ 2. POST /api/v1/widgets/ │                         │
     │    configure             │                         │
     │    {widget_name,         │                         │
     │     configuration}       │                         │
     │                          │                         │
     │ 3. Validate & store      │                         │
     ├─────────────────────────────────────────────────────>│
     │    INSERT INTO           │                         │
     │    widget_configurations │                         │
     │                          │                         │
     │ 4. Build ServiceNow      │                         │
     │    widget payload        │                         │
     │    {                     │                         │
     │      name: "Control      │                         │
     │        Effectiveness",   │                         │
     │      type: "chart",      │                         │
     │      data_source: {...}  │                         │
     │    }                     │                         │
     │                          │                         │
     │ 5. POST /api/now/ui/     │                         │
     │    pa_dashboards         │                         │
     ├─────────────────────────>│                         │
     │    Auth: Basic user:token│                         │
     │    Body: widget config   │                         │
     │                          │                         │
     │ 6. ServiceNow creates    │                         │
     │    dashboard widget      │                         │
     │                          │                         │
     │ 7. 201 Created +         │                         │
     │    {sys_id}              │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │ 8. Update widget_        │                         │
     │    configurations with   │                         │
     │    ServiceNow widget ID  │                         │
     ├─────────────────────────────────────────────────────>│
     │                          │                         │
     │ 9. Return success to user│                         │

Data Mapping Examples:

ServiceNow Control → ComplianceIQ ControlData:
  {
    "sys_id": "abc123" → control_id
    "number": "CTRL0001" → attributes.control_number
    "name": "Access Control" → name
    "description": "..." → description
    "control_category": "Access Management" → attributes.categories
    "implementation_status": "Implemented" → attributes.status
  }

ComplianceIQ Analysis → ServiceNow Widget:
  AnalysisResult (effectiveness scores) →
    ServiceNow Dashboard Widget (Bar Chart):
      {
        "widget_name": "Control Effectiveness",
        "type": "bar_chart",
        "series": [
          {"label": "High", "value": 15},
          {"label": "Medium", "value": 8},
          {"label": "Low", "value": 2}
        ]
      }
```

---

## 9. Sequence Diagrams

### 9.1 Complete Control Analysis Sequence

```
User  WebUI  APIRoute  AnalysisService  ControlEffectiveness  DB  ServiceNow
 │      │       │            │                  Analyzer      │      │
 │      │       │            │                      │         │      │
 │ 1. Click "Analyze        │                      │         │      │
 │    Controls"  │          │                      │         │      │
 ├──────>│       │          │                      │         │      │
 │       │       │          │                      │         │      │
 │       │ 2. AJAX POST /api/v1/analyze/controls   │         │      │
 │       ├──────>│          │                      │         │      │
 │       │       │          │                      │         │      │
 │       │       │ 3. verify_request()              │         │      │
 │       │       │    (check session/API key)       │         │      │
 │       │       │          │                      │         │      │
 │       │       │ 4. Load instance from DB         │         │      │
 │       │       ├─────────────────────────────────────────────>│    │
 │       │       │<────────────────────────────────────────────┤    │
 │       │       │   Instance details               │         │      │
 │       │       │          │                      │         │      │
 │       │       │ 5. Call analyze_controls()       │         │      │
 │       │       ├─────────>│                      │         │      │
 │       │       │          │                      │         │      │
 │       │       │          │ 6. Save controls to DB│         │      │
 │       │       │          ├─────────────────────────────────>│    │
 │       │       │          │   INSERT control_data │         │      │
 │       │       │          │<─────────────────────────────────┤    │
 │       │       │          │                      │         │      │
 │       │       │          │ 7. For each control, analyze()  │      │
 │       │       │          ├─────────────────────>│         │      │
 │       │       │          │                      │         │      │
 │       │       │          │                      │ 8. Calculate     │
 │       │       │          │                      │    - procedures  │
 │       │       │          │                      │    - coverage    │
 │       │       │          │                      │    - maturity    │
 │       │       │          │                      │    → score       │
 │       │       │          │                      │         │      │
 │       │       │          │ 9. Return score      │         │      │
 │       │       │          │<─────────────────────┤         │      │
 │       │       │          │                      │         │      │
 │       │       │          │ 10. Aggregate all scores        │      │
 │       │       │          │     - Calculate avg  │         │      │
 │       │       │          │     - Count by level │         │      │
 │       │       │          │     - Generate insights        │      │
 │       │       │          │                      │         │      │
 │       │       │          │ 11. Save AnalysisResult to DB  │      │
 │       │       │          ├─────────────────────────────────>│    │
 │       │       │          │<─────────────────────────────────┤    │
 │       │       │          │                      │         │      │
 │       │       │          │ 12. Optional: Push to ServiceNow│     │
 │       │       │          ├─────────────────────────────────────────>│
 │       │       │          │    (Widget update)   │         │      │
 │       │       │          │<─────────────────────────────────────────┤
 │       │       │          │                      │         │      │
 │       │       │ 13. Return ControlAnalysisResponse         │      │
 │       │       │<─────────┤                      │         │      │
 │       │       │          │                      │         │      │
 │       │ 14. 200 OK + JSON                       │         │      │
 │       │<──────┤          │                      │         │      │
 │       │  {avg_effectiveness: 0.78, ...}         │         │      │
 │       │       │          │                      │         │      │
 │ 15. Update    │          │                      │         │      │
 │     dashboard │          │                      │         │      │
 │     UI with   │          │                      │         │      │
 │     results   │          │                      │         │      │
 │<──────┤       │          │                      │         │      │
```

---

## 10. Deployment Architecture

### 10.1 Docker Compose Deployment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Docker Host Machine                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                Docker Network: bridge (default)                   │ │
│  │                                                                   │ │
│  │  ┌────────────────────────────┐  ┌──────────────────────────────┐│ │
│  │  │   Container: postgres      │  │   Container: backend         ││ │
│  │  │   ────────────────────────  │  │   ─────────────────────────  ││ │
│  │  │   Image: postgres:16-alpine│  │   Image: complianceiq-backend││ │
│  │  │                            │  │                              ││ │
│  │  │   ┌──────────────────────┐ │  │   ┌────────────────────────┐ ││ │
│  │  │   │  PostgreSQL Server   │ │  │   │  FastAPI Application   │ ││ │
│  │  │   │  Port: 5432          │ │  │   │  Uvicorn ASGI Server   │ ││ │
│  │  │   │                      │ │  │   │  Port: 8000 (internal) │ ││ │
│  │  │   │  Database:           │ │  │   │                        │ ││ │
│  │  │   │  - complianceiq      │ │  │   │  Environment:          │ ││ │
│  │  │   │                      │ │  │   │  - DATABASE_URL        │ ││ │
│  │  │   │  Users:              │ │  │   │  - SERVICE_ACCOUNT_    │ ││ │
│  │  │   │  - complianceiq      │ │  │   │    TOKEN               │ ││ │
│  │  │   │    (owner)           │ │  │   │  - ADMIN_EMAIL         │ ││ │
│  │  │   └──────────────────────┘ │  │   │  - SECRET_KEY          │ ││ │
│  │  │                            │  │   └────────────────────────┘ ││ │
│  │  │   Health Check:            │  │                              ││ │
│  │  │   pg_isready every 10s     │  │   Depends On:                ││ │
│  │  │                            │  │   postgres (healthy)         ││ │
│  │  │   Restart: unless-stopped  │  │                              ││ │
│  │  │                            │  │   Restart: unless-stopped    ││ │
│  │  └────────────┬───────────────┘  └─────────────┬────────────────┘│ │
│  │               │                                 │                 │ │
│  │               │ postgres://complianceiq:***@    │                 │ │
│  │               │ postgres:5432/complianceiq      │                 │ │
│  │               │<────────────────────────────────┘                 │ │
│  │               │                                                   │ │
│  └───────────────┼───────────────────────────────────────────────────┘ │
│                  │                                 │                   │
│  ┌───────────────┼───────────────────────────────────────────────┐    │
│  │  Volume Mounts │                                │             │    │
│  │  ──────────────┼────────────────────────────────┼────────     │    │
│  │               ▼                                 ▼             │    │
│  │  postgres_data:/var/lib/postgresql/data                       │    │
│  │  (persistent database storage)                                │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                  │                                 │                   │
│  ┌───────────────┼─────────────────────────────────┼───────────────┐  │
│  │  Port Mappings│                                 │               │  │
│  │  ──────────────┼─────────────────────────────────┼──────────     │  │
│  │               ▼                                 ▼               │  │
│  │  Host:5432 → Container:5432 (postgres)                         │  │
│  │  Host:8100 → Container:8000 (backend)                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────┬─────────────────────┬─────────────────────────┘
                      │                     │
                      ▼                     ▼
            ┌──────────────────┐  ┌───────────────────┐
            │  External Clients│  │  ServiceNow API   │
            │  - Browser       │  │  (External)       │
            │  - API Consumers │  │                   │
            │  http://localhost│  │  https://dev123.  │
            │  :8100           │  │  service-now.com  │
            └──────────────────┘  └───────────────────┘
```

### 10.2 Production Kubernetes Deployment (Future)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                          Ingress                                  │ │
│  │  ┌────────────────────────────────────────────────────────────┐  │ │
│  │  │  Nginx Ingress Controller                                  │  │ │
│  │  │  - TLS Termination (HTTPS)                                 │  │ │
│  │  │  - Path-based routing                                      │  │ │
│  │  │  - Rate limiting                                           │  │ │
│  │  └────────────┬───────────────────────────────────────────────┘  │ │
│  └───────────────┼──────────────────────────────────────────────────┘ │
│                  │                                                     │
│                  ▼                                                     │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │               Service: complianceiq-backend                       │ │
│  │               Type: ClusterIP                                     │ │
│  │               Port: 8000                                          │ │
│  └────────────────────────┬──────────────────────────────────────────┘ │
│                           │                                            │
│                           ├──────────────────┬─────────────────┐       │
│                           ▼                  ▼                 ▼       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │              Deployment: complianceiq-backend                   │  │
│  │              Replicas: 3 (for high availability)                │  │
│  │                                                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Pod 1      │  │  Pod 2      │  │  Pod 3      │            │  │
│  │  │  ─────────   │  │  ─────────   │  │  ─────────   │            │  │
│  │  │  FastAPI    │  │  FastAPI    │  │  FastAPI    │            │  │
│  │  │  Container  │  │  Container  │  │  Container  │            │  │
│  │  │             │  │             │  │             │            │  │
│  │  │  Resources: │  │  Resources: │  │  Resources: │            │  │
│  │  │  CPU: 500m  │  │  CPU: 500m  │  │  CPU: 500m  │            │  │
│  │  │  MEM: 1Gi   │  │  MEM: 1Gi   │  │  MEM: 1Gi   │            │  │
│  │  │             │  │             │  │             │            │  │
│  │  │  Liveness   │  │  Liveness   │  │  Liveness   │            │  │
│  │  │  Readiness  │  │  Readiness  │  │  Readiness  │            │  │
│  │  │  Probes     │  │  Probes     │  │  Probes     │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                           │                                            │
│                           │ DATABASE_URL                               │
│                           ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │               Service: postgres                                   │ │
│  │               Type: ClusterIP                                     │ │
│  │               Port: 5432                                          │ │
│  └────────────────────────┬──────────────────────────────────────────┘ │
│                           │                                            │
│                           ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              StatefulSet: postgres                                │ │
│  │              Replicas: 1 (or 3 with replication)                  │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  Pod: postgres-0                                            │ │ │
│  │  │  ───────────────────                                         │ │ │
│  │  │  PostgreSQL 16                                              │ │ │
│  │  │                                                              │ │ │
│  │  │  PersistentVolumeClaim:                                     │ │ │
│  │  │  - postgres-data (100Gi)                                    │ │ │
│  │  │  - StorageClass: ssd (or cloud provider specific)           │ │ │
│  │  │                                                              │ │ │
│  │  │  Resources:                                                  │ │ │
│  │  │  - CPU: 2000m                                               │ │ │
│  │  │  - Memory: 4Gi                                              │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │               ConfigMap: complianceiq-config                      │ │
│  │               - APP_NAME                                          │ │
│  │               - ENVIRONMENT                                       │ │
│  │               - API_PREFIX                                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │               Secret: complianceiq-secrets                        │ │
│  │               - DATABASE_URL                                      │ │
│  │               - SECRET_KEY                                        │ │
│  │               - SERVICE_ACCOUNT_TOKEN                             │ │
│  │               - ADMIN_EMAIL                                       │ │
│  │               - ADMIN_PASSWORD                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

Additional Production Components:
  - HorizontalPodAutoscaler (scale based on CPU/memory)
  - NetworkPolicy (restrict pod-to-pod communication)
  - PodDisruptionBudget (maintain availability during updates)
  - Monitoring: Prometheus + Grafana
  - Logging: ELK Stack or Loki
  - Secrets Management: HashiCorp Vault or cloud KMS
```

---

## Summary

This architecture document provides a comprehensive view of the ComplianceIQ GRC AI tool, including:

1. **Layered Architecture**: Clear separation of concerns (UI, API, Service, Data)
2. **Analysis Engines**: AI-powered control effectiveness, risk correlation, and compliance gap detection
3. **Dual Authentication**: Session-based for web UI, API key for REST clients
4. **ServiceNow Integration**: Bidirectional data sync and widget deployment
5. **PostgreSQL Database**: Flexible JSONB schema with relational integrity
6. **Docker Deployment**: Production-ready containerization with health checks
7. **Scalable Design**: Kubernetes-ready for enterprise deployments

The system follows modern best practices with FastAPI, SQLAlchemy ORM, Pydantic validation, and structured logging, making it maintainable, testable, and scalable for enterprise GRC operations.
