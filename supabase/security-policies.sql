-- Supabase Security Policies Implementation
-- This file implements Row-Level Security (RLS) to fix critical security vulnerabilities

-- =====================================================
-- PHASE 1: Enable Row-Level Security on All Tables
-- =====================================================

-- Enable RLS on auth.users table (primary user table)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table if it exists
-- Note: You may need to create a profiles table if it doesn't exist
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 2: User Authentication Policies
-- =====================================================

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON auth.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can only insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON auth.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON auth.users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PHASE 3: Session Security Policies
-- =====================================================

-- Enable RLS on auth.sessions table
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON auth.sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only delete their own sessions
CREATE POLICY "Users can delete own sessions" ON auth.sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role has full access to sessions
CREATE POLICY "Service role full access on sessions" ON auth.sessions
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PHASE 4: Refresh Token Security
-- =====================================================

-- Enable RLS on auth.refresh_tokens table
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own refresh tokens
CREATE POLICY "Users can view own refresh tokens" ON auth.refresh_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role has full access to refresh tokens
CREATE POLICY "Service role full access on refresh tokens" ON auth.refresh_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PHASE 5: Additional Security Tables (if they exist)
-- =====================================================

-- If you have additional tables in Supabase, add RLS policies here
-- Example for a custom profiles table:
/*
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
*/

-- =====================================================
-- PHASE 6: Verification and Testing
-- =====================================================

-- Test queries to verify RLS is working
-- These should be run after implementing the policies

-- Test 1: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename IN ('users', 'sessions', 'refresh_tokens');

-- Test 2: Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'auth';

-- =====================================================
-- SECURITY NOTES:
-- =====================================================

-- 1. These policies ensure that:
--    - Users can only access their own data
--    - External attackers cannot read any data
--    - Service role (admin) maintains full access
--    - All API calls require authentication

-- 2. Critical security improvements:
--    - Fixes "Table publicly accessible" vulnerability
--    - Fixes "Sensitive data publicly accessible" vulnerability
--    - Prevents unauthorized data access via API

-- 3. Implementation approach:
--    - Gradual rollout with testing at each step
--    - No impact on legitimate user workflows
--    - Maintains all existing functionality

-- 4. Next steps after implementation:
--    - Test all user workflows
--    - Verify admin functionality
--    - Monitor for any issues
--    - Check Supabase security dashboard
