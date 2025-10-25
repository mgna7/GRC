# Admin Account Creation

## Quick Start - Admin Credentials

**Username:** admin@complianceiq.com
**Password:** Admin@123
**Role:** Superuser (full admin access)

---

## How to Create the Admin Account

The admin account will be created automatically when you first try to register. The auth service has been fixed and is now running successfully!

### Method 1: Register Through UI (Recommended)

1. Go to http://localhost:3500
2. Click "Create Account" or go to http://localhost:3500/register
3. Fill in the registration form:
   - **Full Name:** Admin User
   - **Email:** admin@complianceiq.com
   - **Password:** Admin@123
   - **Confirm Password:** Admin@123
4. Click "Create Account"

The first user will automatically become a superuser with admin privileges.

### Method 2: Create via Database (If needed)

If registration still fails, you can create the admin user directly in the database:

```bash
# Connect to database container
docker-compose -f docker-compose.microservices.yml exec postgres-auth psql -U complianceiq -d complianceiq_auth

# Then run these SQL commands:
```

```sql
-- Create a default organization first
INSERT INTO organizations (id, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  NOW()
);

-- Create admin user
-- Password hash for "Admin@123" using bcrypt
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
  'admin@complianceiq.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ByWU6VlI0wZm',
  true,
  true,
  true,
  '00000000-0000-0000-0000-000000000001',
  0,
  NOW()
);

-- Verify the user was created
SELECT id, email, is_superuser, is_active FROM users WHERE email = 'admin@complianceiq.com';

-- Exit psql
\q
```

---

## Testing the Admin Account

### 1. Login Test
```bash
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@complianceiq.com",
    "password": "Admin@123"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "admin@complianceiq.com",
    "is_superuser": true
  }
}
```

### 2. UI Login Test
1. Go to http://localhost:3500/login
2. Enter:
   - Email: admin@complianceiq.com
   - Password: Admin@123
3. Click "Sign In"
4. You should be redirected to the dashboard

---

## Admin Capabilities

As a superuser, the admin account can:

- ✅ Access all features in the UI
- ✅ Add and manage ServiceNow instances
- ✅ Run GRC analyses
- ✅ View all organizations' data
- ✅ Manage user accounts (when user management UI is added)
- ✅ Configure system settings
- ✅ Access admin panels

---

## Security Notes

**IMPORTANT:** Change the default admin password immediately after first login!

The default credentials are:
- Email: admin@complianceiq.com
- Password: Admin@123

For production use:
1. Change the default password to a strong, unique password
2. Enable two-factor authentication (when implemented)
3. Rotate JWT secret keys regularly
4. Use environment-specific encryption keys

---

## Troubleshooting

### Registration Still Failing?

1. Check auth service logs:
```bash
docker-compose -f docker-compose.microservices.yml logs auth-service
```

2. Verify auth service is running:
```bash
docker-compose -f docker-compose.microservices.yml ps auth-service
```

3. Test the registration endpoint directly:
```bash
curl -X POST http://localhost:9000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@complianceiq.com",
    "password": "Admin@123",
    "full_name": "Admin User"
  }'
```

### Can't Login?

1. Verify user exists in database:
```bash
docker-compose -f docker-compose.microservices.yml exec postgres-auth \
  psql -U complianceiq -d complianceiq_auth \
  -c "SELECT email, is_active, is_superuser FROM users WHERE email = 'admin@complianceiq.com';"
```

2. Check if password is correct by resetting it:
```sql
UPDATE users
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ByWU6VlI0wZm'
WHERE email = 'admin@complianceiq.com';
```

---

## Next Steps After Login

Once you're logged in as admin:

1. **Add Your First ServiceNow Instance**
   - Go to `/instances/new`
   - Fill in your ServiceNow URL
   - Choose authentication method
   - Test connection and save

2. **Run Your First Analysis**
   - Go to `/analysis/new`
   - Select your ServiceNow instance
   - Choose analysis type
   - Start analysis

3. **Invite Team Members** (when user management is added)
   - Go to Settings > Users
   - Send invitations
   - Assign roles

---

## Password Hash Generation (For Reference)

If you need to generate a new password hash:

```python
import bcrypt

password = "YourNewPassword123"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(hashed.decode('utf-8'))
```

---

**Status:** ✅ Auth service is running
**Created:** 2025-10-25
**Default Admin:** admin@complianceiq.com / Admin@123
