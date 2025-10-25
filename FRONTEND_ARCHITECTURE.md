# ComplianceIQ Frontend Architecture - Scalable Multi-Integration Platform

## Vision

A **modular, plugin-based frontend** that supports multiple integrations:
- ✅ ServiceNow GRC (Current)
- 🔜 GitLab (DevSecOps analysis)
- 🔜 Kubernetes (Security & compliance scanning)
- 🔜 Salesforce (CRM compliance)
- 🔜 AWS/Azure/GCP (Cloud governance)
- 🔜 Jira (Issue tracking)
- 🔜 Custom integrations

---

## Architecture Principles

### 1. Plugin-Based Integration System
Each integration is a **plugin** with standardized interface:

```typescript
interface Integration {
  id: string;
  name: string;
  type: 'servicenow' | 'gitlab' | 'kubernetes' | 'salesforce' | 'custom';
  icon: string;
  color: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];  // e.g., ['analysis', 'sync', 'reporting']
  config: IntegrationConfig;
}
```

### 2. Unified Dashboard
Dashboard shows **all integrations** with consistent UI:
- Integration cards (ServiceNow, GitLab, K8s, etc.)
- Health status for each
- Quick actions per integration
- Cross-integration analytics

### 3. Modular Components
Components work with **any integration type**:
- `<IntegrationCard />` - Display any integration
- `<AnalysisResults />` - Show results from any source
- `<SyncButton />` - Sync any integration
- `<ConfigForm />` - Configure any integration

### 4. Type-Safe Design
TypeScript interfaces ensure consistency across all integrations.

---

## Project Structure

```
frontend/src/
├── integrations/              # Integration plugin system
│   ├── types.ts              # Common integration types
│   ├── registry.ts           # Integration registry
│   ├── servicenow/           # ServiceNow plugin
│   │   ├── types.ts
│   │   ├── config.ts
│   │   ├── ServiceNowCard.tsx
│   │   └── ServiceNowDashboard.tsx
│   ├── gitlab/               # GitLab plugin (future)
│   │   ├── types.ts
│   │   ├── config.ts
│   │   ├── GitLabCard.tsx
│   │   └── GitLabDashboard.tsx
│   ├── kubernetes/           # Kubernetes plugin (future)
│   └── salesforce/           # Salesforce plugin (future)
│
├── pages/
│   ├── Auth/                 # Authentication
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard/            # Main dashboard
│   │   ├── Dashboard.tsx    # Shows all integrations
│   │   └── Overview.tsx     # Cross-integration analytics
│   ├── Integrations/         # Integration management
│   │   ├── IntegrationList.tsx
│   │   ├── AddIntegration.tsx
│   │   ├── IntegrationDetails.tsx
│   │   └── IntegrationSettings.tsx
│   ├── Analysis/             # Analysis (all integrations)
│   │   ├── AnalysisList.tsx
│   │   ├── RunAnalysis.tsx
│   │   ├── AnalysisResults.tsx
│   │   └── CompareAnalysis.tsx
│   ├── Users/                # User management
│   │   ├── UserList.tsx
│   │   ├── CreateUser.tsx
│   │   └── CustomerAccounts.tsx
│   └── Settings/             # Settings
│       ├── Profile.tsx
│       ├── Organization.tsx
│       └── Preferences.tsx
│
├── components/
│   ├── Layout/               # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── Integrations/         # Integration components
│   │   ├── IntegrationCard.tsx
│   │   ├── IntegrationStatus.tsx
│   │   ├── IntegrationActions.tsx
│   │   └── IntegrationConfig.tsx
│   ├── Analysis/             # Analysis components
│   │   ├── AnalysisCard.tsx
│   │   ├── ResultsChart.tsx
│   │   └── MetricsDisplay.tsx
│   ├── Forms/                # Form components
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Button.tsx
│   │   └── FormField.tsx
│   └── Common/               # Common components
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Loading.tsx
│       ├── Alert.tsx
│       └── ProtectedRoute.tsx
│
├── services/
│   ├── api.ts                # Base API client
│   ├── integrations/         # Integration-specific APIs
│   │   ├── servicenow.ts
│   │   ├── gitlab.ts         # Future
│   │   └── kubernetes.ts     # Future
│   └── analytics.ts          # Cross-integration analytics
│
├── contexts/
│   ├── AuthContext.tsx       # Authentication
│   ├── IntegrationsContext.tsx  # Integration state
│   └── ThemeContext.tsx      # Theme/UI preferences
│
├── hooks/                    # Custom hooks
│   ├── useIntegrations.ts
│   ├── useAnalysis.ts
│   └── useAuth.ts
│
├── types/                    # TypeScript types
│   ├── auth.ts
│   ├── integration.ts
│   ├── analysis.ts
│   └── user.ts
│
└── utils/                    # Utilities
    ├── formatters.ts
    ├── validators.ts
    └── helpers.ts
```

---

## Core Type Definitions

### Integration Types

```typescript
// Common integration interface
export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  organizationId: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  capabilities: IntegrationCapability[];
  metadata: IntegrationMetadata;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationType =
  | 'servicenow'
  | 'gitlab'
  | 'kubernetes'
  | 'salesforce'
  | 'jira'
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'custom';

export type IntegrationStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'syncing'
  | 'configuring';

export type IntegrationCapability =
  | 'analysis'      // Can analyze data
  | 'sync'          // Can sync data
  | 'reporting'     // Can generate reports
  | 'automation'    // Can automate tasks
  | 'alerting'      // Can send alerts
  | 'compliance'    // Compliance checking
  | 'security'      // Security scanning
  | 'governance';   // Governance features

export interface IntegrationConfig {
  type: 'oauth' | 'basic' | 'token' | 'apikey';
  url?: string;
  credentials: Record<string, any>;
  options: Record<string, any>;
}

export interface IntegrationMetadata {
  icon: string;
  color: string;
  description: string;
  version: string;
  vendor: string;
  category: IntegrationCategory;
}

export type IntegrationCategory =
  | 'grc'           // Governance, Risk, Compliance
  | 'devops'        // DevOps tools
  | 'cloud'         // Cloud platforms
  | 'security'      // Security tools
  | 'productivity'  // Productivity tools
  | 'custom';       // Custom integrations
```

### Analysis Types

```typescript
export interface Analysis {
  id: string;
  integrationId: string;
  integrationType: IntegrationType;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  results?: AnalysisResults;
  createdAt: string;
  completedAt?: string;
  userId: string;
}

export type AnalysisType =
  | 'comprehensive'
  | 'quick'
  | 'security'
  | 'compliance'
  | 'governance'
  | 'risk'
  | 'custom';

export type AnalysisStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AnalysisResults {
  summary: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    findings: number;
    recommendations: number;
  };
  details: AnalysisDetail[];
  insights: AnalysisInsight[];
  recommendations: AnalysisRecommendation[];
}
```

---

## Integration Plugin System

### Plugin Registration

```typescript
// integrations/registry.ts
export const integrationRegistry: Record<IntegrationType, IntegrationPlugin> = {
  servicenow: {
    id: 'servicenow',
    name: 'ServiceNow',
    icon: 'Server',
    color: '#00a1e0',
    category: 'grc',
    capabilities: ['analysis', 'sync', 'reporting', 'compliance'],
    configSchema: serviceNowConfigSchema,
    components: {
      Card: ServiceNowCard,
      Dashboard: ServiceNowDashboard,
      ConfigForm: ServiceNowConfigForm,
    },
  },

  // Future integrations
  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
    icon: 'GitBranch',
    color: '#fc6d26',
    category: 'devops',
    capabilities: ['analysis', 'security', 'compliance'],
    configSchema: gitLabConfigSchema,
    components: {
      Card: GitLabCard,
      Dashboard: GitLabDashboard,
      ConfigForm: GitLabConfigForm,
    },
  },

  kubernetes: {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: 'Container',
    color: '#326ce5',
    category: 'cloud',
    capabilities: ['analysis', 'security', 'governance'],
    configSchema: k8sConfigSchema,
    components: {
      Card: K8sCard,
      Dashboard: K8sDashboard,
      ConfigForm: K8sConfigForm,
    },
  },

  // ... more integrations
};
```

### Using Plugins

```typescript
// In components
const integration = getIntegration(integrationId);
const plugin = integrationRegistry[integration.type];

// Render plugin-specific component
const CardComponent = plugin.components.Card;
return <CardComponent integration={integration} />;
```

---

## Page Layouts

### 1. Dashboard (Multi-Integration View)

```
┌────────────────────────────────────────────────────────────┐
│  Header: ComplianceIQ                            [Profile▼] │
├────────────┬───────────────────────────────────────────────┤
│            │  Dashboard                                     │
│            │                                                │
│  Sidebar   │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│            │  │ServiceNow│ │ GitLab  │ │Kubernetes│        │
│ • Dashboard│  │  Active  │ │ Pending │ │  Active  │        │
│ • Integrations  │  ✓ 95%  │ │   --    │ │  ✓ 88%  │        │
│ • Analysis │  └─────────┘ └─────────┘ └─────────┘         │
│ • Users    │                                                │
│ • Settings │  Recent Activity                              │
│            │  ┌─────────────────────────────────────────┐  │
│            │  │ • Analysis completed: ServiceNow GRC    │  │
│            │  │ • New integration: GitLab added         │  │
│            │  │ • Sync completed: Kubernetes cluster    │  │
│            │  └─────────────────────────────────────────┘  │
└────────────┴───────────────────────────────────────────────┘
```

### 2. Integrations List

```
┌────────────────────────────────────────────────────────────┐
│  Integrations                          [+ Add Integration] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🟢 ServiceNow Production                             │ │
│  │    Type: ServiceNow GRC                              │ │
│  │    Status: Active • Last Sync: 2 hours ago           │ │
│  │    [Sync] [Analyze] [Settings] [...]                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🟡 GitLab Main Repo                                  │ │
│  │    Type: GitLab DevSecOps                            │ │
│  │    Status: Syncing • Progress: 45%                   │ │
│  │    [View Progress] [Settings] [...]                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🟢 Kubernetes Prod Cluster                           │ │
│  │    Type: Kubernetes Security                         │ │
│  │    Status: Active • Last Scan: 30 minutes ago        │ │
│  │    [Scan] [Analyze] [Settings] [...]                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3. Add Integration (Multi-Step)

```
┌────────────────────────────────────────────────────────────┐
│  Add Integration                                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1: Select Integration Type                          │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ ServiceNow │  │   GitLab   │  │ Kubernetes │          │
│  │    GRC     │  │  DevSecOps │  │  Security  │          │
│  │   [Select] │  │   [Select] │  │   [Select] │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Salesforce │  │    Jira    │  │    AWS     │          │
│  │ Compliance │  │   Issues   │  │  Governance│          │
│  │   [Select] │  │   [Select] │  │   [Select] │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
│                           [Next: Configure →]              │
└────────────────────────────────────────────────────────────┘
```

---

## Navigation Structure

```
App
├── / (Redirect to /login or /dashboard)
├── /login
├── /register
│
├── /dashboard (Main overview - all integrations)
│
├── /integrations
│   ├── /list (All integrations)
│   ├── /add (Add new integration)
│   ├── /:id (Integration details)
│   ├── /:id/settings (Configure integration)
│   └── /:id/dashboard (Integration-specific dashboard)
│
├── /analysis
│   ├── /list (All analyses across all integrations)
│   ├── /new (Run new analysis - select integration)
│   ├── /:id (Analysis results)
│   └── /compare (Compare across integrations)
│
├── /users (Admin only)
│   ├── /list
│   ├── /create
│   ├── /customers (Customer account management)
│   └── /:id
│
└── /settings
    ├── /profile
    ├── /organization
    ├── /preferences
    └── /api-keys
```

---

## Component Reusability

### Generic Components Work with Any Integration

```typescript
// Integration Card - works with any integration type
<IntegrationCard
  integration={integration}
  onSync={() => syncIntegration(integration.id)}
  onAnalyze={() => runAnalysis(integration.id)}
/>

// Analysis Results - works with any analysis type
<AnalysisResults
  analysis={analysis}
  integrationType={integration.type}
/>

// Sync Button - works with any integration
<SyncButton
  integrationId={id}
  integrationType={type}
/>
```

---

## Future-Proof Design Benefits

### ✅ Easy to Add New Integrations
1. Create plugin config in `integrations/[name]/`
2. Register in `integrations/registry.ts`
3. Implement plugin interface
4. No changes to existing code needed!

### ✅ Consistent User Experience
All integrations use same UI patterns:
- Same card layout
- Same configuration flow
- Same analysis workflow
- Same results display

### ✅ Cross-Integration Features
- Compare analyses across integrations
- Unified reporting
- Single dashboard for everything
- Consistent security model

### ✅ Scalable Architecture
- Add unlimited integrations
- Each integration is isolated
- No breaking changes
- Easy maintenance

---

## Implementation Plan

### Phase 1: Core Foundation (Now)
- ✅ API service layer
- ✅ Auth context
- 🔄 Plugin registry system
- 🔄 Base components
- 🔄 Layout system

### Phase 2: ServiceNow Integration (Current)
- 🔄 ServiceNow plugin
- 🔄 ServiceNow pages
- 🔄 ServiceNow dashboard
- 🔄 ServiceNow analysis

### Phase 3: User Management
- 🔄 User pages
- 🔄 Customer accounts
- 🔄 Role management

### Phase 4: Analytics & Reporting
- Cross-integration analytics
- Custom reports
- Export functionality

### Phase 5: Future Integrations
- GitLab plugin
- Kubernetes plugin
- Salesforce plugin
- Custom integrations API

---

## Next: Building All Pages

Creating now (in order):
1. Integration plugin system ✅ (architecture defined)
2. Login/Register pages
3. Main dashboard
4. Integration management
5. Analysis pages
6. User management
7. Settings pages

**Status:** Creating comprehensive pages now with future-proof design!

---

**Last Updated:** 2025-10-25
**Next:** Creating all React components and pages...
