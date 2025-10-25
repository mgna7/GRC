# Fix for Instance Disappearing Issue

## Problem Summary
- Instances are being created successfully in the database
- The API returns 403 Forbidden errors when trying to fetch instances
- The frontend crashes because it's loading an old cached version

## Root Cause
Your JWT token was created **before** we added the JWT_SECRET_KEY to the instance-service. The old token doesn't have the proper structure or the organization_id isn't being validated correctly.

## Solution: Complete Reset

### Step 1: Clear Browser Cache and Storage
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → http://localhost:3500
4. Click **"Clear All"** button
5. Go to **Session Storage** and clear it too
6. Go to **Cookies** and delete all cookies for localhost:3500

### Step 2: Hard Refresh Browser
- Windows/Linux: Press `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: Press `Cmd + Shift + R`

### Step 3: Log Out (if still logged in)
- Click logout or navigate to: http://localhost:3500/login

### Step 4: Clear localStorage via Console
1. Open browser console (F12 → Console tab)
2. Run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 5: Log In Again
1. Navigate to: http://localhost:3500/login
2. Enter credentials:
   - Email: admin@complianceiq.com
   - Password: [your password]
3. Click "Sign In"

### Step 6: Verify Token Has Organization ID
1. After logging in, open browser console (F12)
2. Run:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token Payload:', payload);
console.log('Organization ID:', payload.organization_id);
```

3. Verify the output shows:
   - `organization_id: "446b8f9d-08f8-4bc1-8ecb-e70ab3438043"`
   - If it's missing or undefined → The auth service needs to be restarted

### Step 7: Navigate to Instances Page
- Go to: http://localhost:3500/instances
- You should see your instance: "Test" (https://dev264844.service-now.com)

---

## If Step 6 Shows Missing organization_id

The auth service might need to generate a new token. Restart it:

```bash
docker restart complianceiq-auth-service
```

Wait 10 seconds, then:
1. Clear localStorage again
2. Log in again
3. Repeat Step 6 to verify organization_id is present

---

## If Instances Page Still Shows Errors

### Check API Response
1. Open browser DevTools (F12) → Network tab
2. Refresh instances page
3. Look for request to `/api/v1/instances`
4. Check the response:
   - **200 OK** = Success, but frontend parsing issue
   - **401 Unauthorized** = Token invalid or missing
   - **403 Forbidden** = Token valid but organization_id mismatch
   - **500 Server Error** = Backend error

### For 403 Forbidden Errors

The organization_id in your token doesn't match the instance in the database.

**Check your token's org_id:**
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Your org_id:', payload.organization_id);
```

**Check instance's org_id in database:**
```bash
docker exec complianceiq-postgres-core psql -U complianceiq -d complianceiq_core -c "SELECT id, name, organization_id FROM servicenow_instances;"
```

**If they don't match:**
The instance was created with a different organization. Delete it and recreate:

```bash
docker exec complianceiq-postgres-core psql -U complianceiq -d complianceiq_core -c "DELETE FROM servicenow_instances WHERE organization_id != '446b8f9d-08f8-4bc1-8ecb-e70ab3438043';"
```

---

## If Frontend Shows Blank Page or Crashes

The browser is loading old cached JavaScript. Force a complete cache clear:

**Method 1: Chrome/Edge**
1. Press F12
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Method 2: Manual**
1. Settings → Privacy → Clear browsing data
2. Select:
   - Cached images and files
   - Cookies and other site data
3. Time range: All time
4. Click "Clear data"

**Method 3: Incognito/Private Window**
- Open a new incognito window (Ctrl+Shift+N)
- Navigate to http://localhost:3500/login
- Test there

---

## Verification Checklist

After following all steps, verify:

- [ ] Can log in successfully
- [ ] Token has `organization_id` field
- [ ] Instances page loads without errors
- [ ] Can see your "Test" instance
- [ ] Can click "Analyze" button
- [ ] Analysis page shows instance in dropdown
- [ ] Can create new instance

---

## Quick Debug Commands

**Check if services are running:**
```bash
docker ps | findstr /C:"instance" /C:"auth" /C:"frontend"
```

**Check instance service logs:**
```bash
docker logs complianceiq-instance-service --tail 50
```

**Check auth service logs:**
```bash
docker logs complianceiq-auth-service --tail 50
```

**Check frontend logs:**
```bash
docker logs complianceiq-frontend --tail 50
```

**Restart all affected services:**
```bash
docker restart complianceiq-frontend complianceiq-auth-service complianceiq-instance-service
```

Wait 15 seconds after restart, then:
1. Clear browser cache
2. Log out
3. Log in again

---

## Expected Behavior After Fix

### Instances Page
- Shows list of ServiceNow instances
- Each instance has:
  - Name and URL
  - Status badge (Active/Inactive/Error)
  - Last sync time
  - Action buttons: Test, Sync, Analyze, Delete

### Add Instance Page
- Form with all fields
- Connection test works
- Save persists to database
- Redirects to instances list

### Analysis Page
- Instance dropdown shows all active instances
- Can select analysis type
- Can start analysis
- Redirects to results page

---

## Still Having Issues?

If problems persist after following all steps:

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed API calls
3. **Run:** `docker-compose -f docker-compose.microservices.yml down -v`
4. **Run:** `docker-compose -f docker-compose.microservices.yml up -d`
5. **Wait 2 minutes** for all services to start
6. **Recreate user account:**

```bash
# Access auth database
docker exec -it complianceiq-postgres-auth psql -U complianceiq -d complianceiq_auth

# Delete and recreate user (be careful!)
DELETE FROM login_history WHERE user_id = (SELECT id FROM users WHERE email = 'admin@complianceiq.com');
DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'admin@complianceiq.com');
DELETE FROM users WHERE email = 'admin@complianceiq.com';
\q
```

Then register a new account at http://localhost:3500/register

---

## Summary

The core issue is:
1. **Old JWT token** without organization_id or with wrong secret
2. **Browser cache** serving old JavaScript code
3. **Organization_id mismatch** between token and instances

The fix is:
1. **Clear all browser storage**
2. **Log out and log in again** (generates new token)
3. **Hard refresh browser** (loads new code)
4. **Verify token has organization_id**

After these steps, everything should work correctly!
