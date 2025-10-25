# Frontend Blank Page Troubleshooting

## Issue: Blank Page at localhost:3500

If you see a blank white page when accessing http://localhost:3500, follow these steps:

---

## Step 1: Check Browser Console

1. **Open Developer Tools:**
   - Windows/Linux: Press **F12**
   - Mac: Press **Cmd + Option + I**

2. **Click the "Console" tab**

3. **Look for errors** - Common errors:

### Error A: "Failed to fetch dynamically imported module"
```
Failed to fetch dynamically imported module: http://localhost:3500/src/main.tsx
```

**Cause:** Vite isn't serving the TypeScript files properly

**Fix:**
```powershell
# Restart frontend container
docker-compose -f docker-compose.microservices.yml restart frontend

# Wait 10 seconds, then refresh browser (Ctrl+F5)
```

### Error B: "Uncaught SyntaxError" or "Unexpected token"
```
Uncaught SyntaxError: Unexpected token '<'
```

**Cause:** Browser is receiving HTML instead of JavaScript

**Fix:**
```powershell
# Check Vite logs
docker-compose -f docker-compose.microservices.yml logs frontend

# Should see: "VITE v5.4.21 ready in XXX ms"
```

### Error C: WebSocket connection failed
```
[vite] failed to connect to websocket.
[vite] your machine might be behind a proxy, consider setting the proxy options.
```

**Cause:** HMR (Hot Module Replacement) can't connect

**Fix:** This is usually not critical - page should still load. If page is blank, continue to other steps.

### Error D: "Cannot find module" or 404 for CSS/JS files
```
GET http://localhost:3500/src/App.css 404 (Not Found)
```

**Cause:** Files aren't being served properly

**Fix:**
```powershell
# Check files exist in container
docker exec complianceiq-frontend sh -c "ls -la /app/src/"

# Should see: App.tsx, App.css, main.tsx, index.css
```

---

## Step 2: Verify Vite is Running

```powershell
# Check frontend logs
docker-compose -f docker-compose.microservices.yml logs frontend
```

**Expected output:**
```
VITE v5.4.21 ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://172.21.0.18:3000/
```

**If you DON'T see this:**
```powershell
# Restart frontend
docker-compose -f docker-compose.microservices.yml restart frontend
```

---

## Step 3: Check if Files are Mounted Correctly

```powershell
# Check index.html exists in container root
docker exec complianceiq-frontend sh -c "ls -la /app/index.html"

# Check src files exist
docker exec complianceiq-frontend sh -c "ls -la /app/src/"

# Check main.tsx content
docker exec complianceiq-frontend sh -c "cat /app/src/main.tsx"
```

**Expected in /app/src/:**
- `main.tsx` ✅
- `App.tsx` ✅
- `App.css` ✅
- `index.css` ✅

---

## Step 4: Test Direct Access

Try accessing Vite directly:

```powershell
# Test from inside container
docker exec complianceiq-frontend sh -c "wget -q -O- http://0.0.0.0:3000 | head -20"
```

**Expected:** Should see HTML with Vite scripts

---

## Step 5: Hard Refresh Browser

Sometimes the browser caches the blank page:

1. **Windows:** Ctrl + F5
2. **Mac:** Cmd + Shift + R
3. **Or:** Open in Incognito/Private window

---

## Step 6: Check Network Tab

1. **Open Developer Tools** (F12)
2. **Click "Network" tab**
3. **Refresh the page** (F5)
4. **Look at the requests:**

**Should see:**
- `localhost:3500/` - Status **200** - Type: **document**
- `localhost:3500/src/main.tsx` - Status **200** - Type: **script**
- `localhost:3500/@vite/client` - Status **200** - Type: **script**
- `localhost:3500/src/App.tsx` - Status **200** - Type: **script**
- `localhost:3500/src/index.css` - Status **200** - Type: **stylesheet**
- `localhost:3500/src/App.css` - Status **200** - Type: **stylesheet**

**If any show 404:** Files aren't being served properly

---

## Step 7: Verify React is Loading

In browser console, type:
```javascript
document.getElementById('root')
```

**Expected result:**
- If React hasn't loaded: `<div id="root"></div>` (empty)
- If React loaded: `<div id="root"><div class="App">...</div></div>` (with content)

---

## Step 8: Rebuild Frontend (Nuclear Option)

If nothing else works:

```powershell
# Stop and remove frontend container
docker-compose -f docker-compose.microservices.yml rm -sf frontend

# Rebuild from scratch
docker-compose -f docker-compose.microservices.yml build --no-cache frontend

# Start it up
docker-compose -f docker-compose.microservices.yml up -d frontend

# Wait 10 seconds
Start-Sleep -Seconds 10

# Check logs
docker-compose -f docker-compose.microservices.yml logs frontend

# Refresh browser (Ctrl+F5)
```

---

## Common Causes and Solutions

### Cause 1: Volume Mount Not Working

**Symptom:** Changes to source files don't appear

**Solution:**
Check docker-compose.microservices.yml has volume mounts:
```yaml
frontend:
  volumes:
    - ./services/frontend/src:/app/src
    - ./services/frontend/public:/app/public
```

### Cause 2: index.css Not Found

**Symptom:** Console error: "Failed to load resource: index.css"

**Solution:**
```powershell
# Check if index.css exists in host
ls services/frontend/src/index.css

# Copy to container if needed
docker cp services/frontend/src/index.css complianceiq-frontend:/app/src/
```

### Cause 3: React Import Error

**Symptom:** Console error about React not being defined

**Solution:**
```powershell
# Reinstall dependencies
docker exec complianceiq-frontend sh -c "rm -rf node_modules && npm install"

# Restart frontend
docker-compose -f docker-compose.microservices.yml restart frontend
```

### Cause 4: Port Conflict

**Symptom:** Page loads but shows wrong content

**Solution:**
```powershell
# Check nothing else is using port 3500
netstat -ano | findstr :3500

# If something is using it, kill it or change frontend port in docker-compose
```

---

## Quick Diagnostic Script

Save this as `diagnose-frontend.ps1`:

```powershell
Write-Host "=== Frontend Diagnostics ===" -ForegroundColor Cyan

Write-Host "`n1. Checking container status..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml ps frontend

Write-Host "`n2. Checking Vite status..." -ForegroundColor Yellow
docker-compose -f docker-compose.microservices.yml logs --tail=10 frontend

Write-Host "`n3. Checking files in container..." -ForegroundColor Yellow
docker exec complianceiq-frontend sh -c "ls -la /app/index.html && ls -la /app/src/"

Write-Host "`n4. Testing direct access..." -ForegroundColor Yellow
docker exec complianceiq-frontend sh -c "wget -q -O- http://0.0.0.0:3000 2>&1 | head -5"

Write-Host "`n5. Checking port accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:3500 -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Port 3500 is accessible - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Port 3500 not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDone!" -ForegroundColor Cyan
```

Then run:
```powershell
.\diagnose-frontend.ps1
```

---

## Still Not Working?

If you've tried all the above and still see a blank page:

1. **Tell me:**
   - What you see in the browser console
   - What's in the Network tab
   - Output of the diagnostic script

2. **Try a minimal test:**
```powershell
# Create a simple test HTML
docker exec complianceiq-frontend sh -c 'echo "<h1>Test</h1>" > /app/test.html'

# Visit http://localhost:3500/test.html
# If this works, the issue is with React/Vite configuration
```

---

## Expected Final Result

When working correctly, you should see:

**Browser displays:**
- Purple gradient background
- "ComplianceIQ" heading
- "GRC AI Analysis Platform" subheading
- "Status: Healthy" (in green)
- Version information
- Environment information
- API Gateway URL

**Browser console shows:**
- No errors
- Maybe some Vite HMR messages (normal)

**Network tab shows:**
- All files loading with 200 status
- WebSocket connection to Vite HMR

---

**Last Updated:** 2025-10-25
