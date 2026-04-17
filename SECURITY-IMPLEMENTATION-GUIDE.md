# Supabase Security Implementation Guide

## **URGENT: Fix Critical Security Vulnerabilities**

This guide will help you implement Row-Level Security (RLS) policies to fix the critical Supabase security alerts you received.

## **Step-by-Step Implementation**

### **Step 1: Access Supabase SQL Editor**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `hmd-maintenance`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**

### **Step 2: Apply Security Policies**
1. Copy the entire content from `supabase/security-policies.sql`
2. Paste it into the SQL Editor
3. **IMPORTANT**: Run the SQL in sections to test each step

### **Step 3: Run SQL in Phases (Recommended)**

#### **Phase 1: Enable RLS (Safe)**
```sql
-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auth.sessions table  
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auth.refresh_tokens table
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
```
**Run this first** - This enables RLS but doesn't restrict access yet.

#### **Phase 2: Add User Policies**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON auth.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON auth.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### **Phase 3: Add Session Policies**
```sql
-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON auth.sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only delete their own sessions
CREATE POLICY "Users can delete own sessions" ON auth.sessions
  FOR DELETE USING (auth.uid() = user_id);
```

#### **Phase 4: Add Service Role Policies**
```sql
-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON auth.users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sessions" ON auth.sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on refresh tokens" ON auth.refresh_tokens
  FOR ALL USING (auth.role() = 'service_role');
```

### **Step 4: Verify Implementation**
Run these verification queries:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename IN ('users', 'sessions', 'refresh_tokens');

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'auth';
```

### **Step 5: Test Your Application**
1. **Test user login/logout** - Should work normally
2. **Test user registration** - Should work normally  
3. **Test admin panel** - Should work normally
4. **Test unauthorized access** - Should be blocked

## **What This Fixes:**

### **Before (Vulnerable):**
- Anyone with project URL can read all user data
- Anyone can edit/delete user information
- No authentication required for data access
- Critical security vulnerability

### **After (Secure):**
- Only authenticated users can access data
- Users can only see their own information
- External attackers completely blocked
- All API calls require authentication

## **Troubleshooting:**

### **If something breaks:**
1. Check the SQL Editor for error messages
2. Verify you're using the correct project
3. Make sure you have admin permissions
4. Check Supabase logs for errors

### **If users can't login:**
1. Verify all policies were applied successfully
2. Check that service role policies exist
3. Review authentication flow logs

### **If admin panel issues:**
1. Ensure service role policies are applied
2. Verify admin user has correct role
3. Check API endpoint permissions

## **Next Steps:**

### **Immediate (After Implementation):**
1. Test all user workflows
2. Verify admin functionality
3. Check Supabase security dashboard
4. Monitor for any errors

### **Additional Security (Optional):**
1. Implement API rate limiting
2. Add security headers
3. Set up access logging
4. Regular security audits

## **Expected Results:**

- **Supabase security alerts should resolve**
- **No functional impact on your app**
- **Complete protection against external access**
- **Compliance with security best practices**

## **Emergency Rollback:**

If you need to rollback immediately:
```sql
-- Disable RLS (emergency only)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
DROP POLICY IF EXISTS "Users can update own profile" ON auth.users;
-- (Continue for all policies)
```

## **Support:**

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review SQL error messages
3. Contact Supabase support if needed

---

**This implementation will fix the critical security vulnerabilities while maintaining all your app's functionality.**
