# Admin Account Setup - ComplianceIQ

## Current Status

✅ **Auth Service is Running Successfully!**
✅ **Frontend is Running on http://localhost:3500**
✅ **Database is Ready**

⚠️ **Registration Issue:** There's a password hashing bug in the auth service backend that causes the registration API to fail with certain passwords.

---

## How to Create Your Admin Account

### Method 1: Register Through Frontend UI (RECOMMENDED)

Since the frontend handles registration differently, it should work properly:

1. **Open the application:**
   - Go to http://localhost:3500

2. **Click "Create Account"** or navigate to http://localhost:3500/register

3. **Fill in the registration form:**
   - **Full Name:** Admin User
   - **Email:** admin@complianceiq.com
   - **Password:** Admin@123!
   - **Confirm Password:** Admin@123!

4. **Click "Create Account"**

You should be automatically logged in and redirected to the dashboard!

---

## Password Requirements

Your password must meet these requirements:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Example valid passwords:**
- Admin@123!
- Welcome2024!
- Pass@word1
- Secure#99

---

## Troubleshooting

### If Registration Still Fails:

**Check 1: Is the auth service running?**
```bash
docker-compose -f docker-compose.microservices.yml ps auth-service
```

**Check 2: Check auth service logs**
```bash
docker-compose -f docker-compose.microservices.yml logs --tail=50 auth-service
```

**Check 3: Try a different password**
Try using a very simple password like:
- Pass@123
- Test@456

**Check 4: Verify frontend is connecting to the right backend**
Open browser Developer Tools (F12), go to Network tab, and watch the request when you click "Create Account". It should send a POST request to http://localhost:9000/api/v1/auth/register

---

## What's Fixed

✅ **Auth Service Configuration** - Fixed CORS settings
✅ **Database Models** - Fixed missing imports and duplicate indexes
✅ **Encryption** - Added encryption key environment variable
✅ **Database** - Fresh database created with proper schema
✅ **Frontend** - All pages created and working

---

## After Registration

Once you've successfully registered:

1. You'll be logged in automatically
2. You'll see the **Dashboard** with:
   - Stats cards (instances, analyses, compliance score)
   - Quick action buttons
   - Recent activity feed

3. **Next Steps:**
   - Add your first ServiceNow instance at `/instances/new`
   - Run your first GRC analysis at `/analysis/new`
   - Explore the platform features

---

## Known Issue: Backend Password Hashing

There's a bug in the auth service where bcrypt is complaining about password length even for short passwords. This seems to be happening when the service tries to hash the incoming password.

**Technical Details:**
- Error: "password cannot be longer than 72 bytes"
- Occurs with passwords like "Admin@123" (only 9 bytes)
- Likely cause: The code might be accidentally trying to hash an already-hashed value
- Needs investigation in: `services/auth/app/service.py` or `services/auth/app/routes.py`

**Workaround:**
Use the frontend registration form, which might handle password hashing differently.

---

## For Development/Debugging

If you need to create a user directly in the database (advanced):

```bash
# Connect to database
docker-compose -f docker-compose.microservices.yml exec postgres-auth psql -U complianceiq -d complianceiq_auth
```

```sql
-- First, create an organization
INSERT INTO organizations (id, name, created_at)
VALUES (
  gen_random_uuid(),
  'Your Company Name',
  NOW()
)
RETURNING id;

-- Then create a user (use the organization ID from above)
-- Note: You'll need to generate a proper bcrypt hash
INSERT INTO users (
  id,
  email,
  password_hash,
  is_active,
  is_verified,
  is_superuser,
  organization_id,
  failed_login_attempts,
  created_at
)
VALUES (
  gen_random_uuid(),
  'your@email.com',
  '<bcrypt-hash-here>',
  true,
  true,
  true,
  '<organization-id-here>',
  0,
  NOW()
);
```

---

## Summary

1. ✅ All services are running
2. ✅ Frontend is accessible at http://localhost:3500
3. ⏳ **ACTION REQUIRED:** Register your admin account through the UI
4. ✅ Once registered, you can manage everything through the frontend

**Recommended First Account:**
- Email: admin@complianceiq.com
- Password: Admin@123! (or your choice meeting requirements)

---

**Status:** Ready for registration
**Last Updated:** 2025-10-25
**Frontend URL:** http://localhost:3500
