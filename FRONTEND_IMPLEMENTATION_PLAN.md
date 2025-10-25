# ComplianceIQ Frontend Implementation Plan

## Overview

Building a complete React frontend with:
- **Authentication** (Login/Register)
- **User Management** (Admin create customer accounts)
- **ServiceNow Instance Management** (Users add their own instances)
- **GRC Dashboard** (View assets and analysis)
- **Analysis Dashboard** (Run and view analysis results)

---

## Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout/         # Layout components (Header, Sidebar, etc.)
│   │   ├── Forms/          # Form components
│   │   ├── Charts/         # Chart components (Recharts)
│   │   └── Common/         # Buttons, Cards, Modals, etc.
│   ├── pages/              # Page components
│   │   ├── Auth/           # Login, Register
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Instances/      # ServiceNow instance management
│   │   ├── Analysis/       # Analysis pages
│   │   ├── Users/          # User management (admin only)
│   │   └── Settings/       # User settings
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── services/           # API services
│   │   └── api.ts          # Axios API calls
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
```

---

## Implementation Steps

### Phase 1: Core Setup ✅ DONE
- [x] API service layer (`services/api.ts`)
- [x] Authentication context (`contexts/AuthContext.tsx`)
- [x] Package dependencies updated

### Phase 2: Authentication UI (NEXT)
- [ ] Login page
- [ ] Registration page
- [ ] Protected route component
- [ ] Auth layout

### Phase 3: Main Layout
- [ ] App layout with sidebar
- [ ] Header with user menu
- [ ] Navigation sidebar
- [ ] Responsive design

### Phase 4: Dashboard
- [ ] Main dashboard page
- [ ] Overview cards (total instances, analyses, compliance score)
- [ ] Recent activity
- [ ] Quick actions

### Phase 5: ServiceNow Instances
- [ ] Instance list page
- [ ] Add instance form
- [ ] Edit instance
- [ ] Test connection
- [ ] Sync data button
- [ ] Instance details page

### Phase 6: Analysis
- [ ] Analysis list page
- [ ] Run new analysis form
- [ ] Analysis results page
- [ ] Charts and visualizations
- [ ] Export results

### Phase 7: User Management (Admin)
- [ ] User list page
- [ ] Create user form
- [ ] Edit user
- [ ] User roles management
- [ ] Customer account creation

### Phase 8: Settings
- [ ] User profile
- [ ] Change password
- [ ] Organization settings
- [ ] Notification preferences

---

## Quick Implementation Option

Given the scope, I recommend a **two-phase approach**:

### Option A: Full Custom Build (2-3 hours of implementation)
Build everything from scratch with custom styling and components.

**Pros:**
- Complete control
- Custom branding
- Exactly what you need

**Cons:**
- Takes longer
- More code to maintain

### Option B: Use UI Library (30-60 minutes) ⭐ RECOMMENDED
Use a React UI library like **Material-UI** or **Ant Design** for faster development.

**Pros:**
- Pre-built components
- Consistent design
- Faster development
- Professional look
- Accessibility built-in

**Cons:**
- Learning curve for library
- Some customization limits

---

## Immediate Next Steps

I'll create the essential pages first so you can start using the platform:

### 1. Login/Register Pages
Let users authenticate and create accounts.

### 2. Dashboard
Overview of their GRC data.

### 3. ServiceNow Instance Management
Add and manage ServiceNow connections.

### 4. Basic Analysis View
Run and view analysis results.

---

## Files to Create

### Essential Files (Creating Now):

**1. Pages:**
- `src/pages/Auth/Login.tsx`
- `src/pages/Auth/Register.tsx`
- `src/pages/Dashboard/Dashboard.tsx`
- `src/pages/Instances/InstanceList.tsx`
- `src/pages/Instances/AddInstance.tsx`
- `src/pages/Analysis/AnalysisList.tsx`
- `src/pages/Analysis/AnalysisResults.tsx`

**2. Components:**
- `src/components/Layout/AppLayout.tsx`
- `src/components/Layout/Header.tsx`
- `src/components/Layout/Sidebar.tsx`
- `src/components/Common/ProtectedRoute.tsx`

**3. Routing:**
- Updated `src/App.tsx` with React Router

---

## Technology Stack

### Core:
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.1** - Build tool

### Routing:
- **React Router 6.22** - Client-side routing

### State Management:
- **React Context** - Authentication state
- **TanStack Query 5.20** - Server state management

### HTTP Client:
- **Axios 1.6.7** - API requests

### Charts:
- **Recharts 2.10.3** - Data visualization

### Icons:
- **Lucide React 0.309** - Icon library

### Date Handling:
- **date-fns 3.3.1** - Date formatting

---

## UI Components Needed

### Forms:
- Input fields (text, email, password)
- Textareas
- Select dropdowns
- Checkboxes
- Radio buttons
- Form validation
- Error messages

### Data Display:
- Tables with sorting/filtering
- Cards
- Lists
- Stats cards
- Charts (bar, line, pie)
- Progress bars

### Navigation:
- Sidebar menu
- Top navigation
- Breadcrumbs
- Tabs

### Feedback:
- Alerts/Notifications
- Loading spinners
- Modals/Dialogs
- Tooltips

### Layout:
- Grid system
- Responsive containers
- Spacing utilities

---

## Styling Approach

### Option 1: Custom CSS ✅ Current
Using plain CSS with BEM methodology.

### Option 2: CSS Modules
Scoped CSS for each component.

### Option 3: Styled Components
CSS-in-JS with TypeScript support.

### Option 4: Tailwind CSS
Utility-first CSS framework.

**Current:** Using custom CSS for simplicity. Can be upgraded later.

---

## API Integration

### Authentication Flow:
```
1. User enters credentials
2. Call authAPI.login(email, password)
3. Receive JWT token + user data
4. Store in localStorage
5. Set in AuthContext
6. Redirect to dashboard
```

### Protected Routes:
```
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### API Calls:
```typescript
// With React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['instances'],
  queryFn: instancesAPI.getAll,
});
```

---

## User Roles & Permissions

### Admin:
- Create/manage all users
- Create customer accounts
- View all organizations
- Manage all instances
- System settings

### User:
- Manage own profile
- Add ServiceNow instances (own organization only)
- Run analysis
- View results
- Manage team members (own org)

### Customer:
- View-only access
- See assigned dashboards
- Export reports

---

## Next Actions

I'll now create the essential files in order:

1. ✅ API service layer
2. ✅ Auth context
3. **Login page** (creating next)
4. **Register page**
5. **Main App with routing**
6. **Dashboard**
7. **Instance management**
8. **Analysis views**

---

## Estimated Timeline

**Minimal Viable UI:**
- Login/Register: 15 mins
- Dashboard: 20 mins
- Instance Management: 25 mins
- Analysis View: 20 mins
- **Total: ~80 minutes**

**Full-Featured UI:**
- All pages: 2-3 hours
- Polish and refinement: 1 hour
- **Total: 3-4 hours**

---

## Would You Like To:

**A. Continue with custom build** (I'll create all pages one by one)

**B. Use UI library** (Material-UI, Ant Design) for faster development

**C. Create minimal pages first** (just login, dashboard, instances) to get started quickly

Let me know your preference and I'll proceed accordingly!

---

**Status:** API layer and Auth context created ✅
**Next:** Creating Login/Register pages...
