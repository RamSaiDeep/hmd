-- Supabase RLS hardening for Prisma-managed public tables
-- Safe to run multiple times (idempotent where possible).

BEGIN;

-- Preflight (optional): inspect current RLS status before changes.
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- =====================================================
-- 1) Turn on RLS for application tables in public schema
-- =====================================================
ALTER TABLE IF EXISTS public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."EventRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."MusicRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."StudioBooking" ENABLE ROW LEVEL SECURITY;

-- Force RLS so table owners do not bypass policies accidentally.
ALTER TABLE IF EXISTS public."User" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Account" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Session" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."VerificationToken" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Complaint" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."EventRequest" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."MusicRequest" FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."StudioBooking" FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2) Remove old policies (if present) so this can be rerun
-- =====================================================
DROP POLICY IF EXISTS "user_select_own" ON public."User";
DROP POLICY IF EXISTS "user_update_own" ON public."User";

DROP POLICY IF EXISTS "complaint_select_own" ON public."Complaint";
DROP POLICY IF EXISTS "complaint_insert_own" ON public."Complaint";
DROP POLICY IF EXISTS "complaint_update_own" ON public."Complaint";

DROP POLICY IF EXISTS "music_request_select_own" ON public."MusicRequest";
DROP POLICY IF EXISTS "music_request_insert_own" ON public."MusicRequest";
DROP POLICY IF EXISTS "music_request_update_own" ON public."MusicRequest";

DROP POLICY IF EXISTS "studio_booking_select_own" ON public."StudioBooking";
DROP POLICY IF EXISTS "studio_booking_insert_own" ON public."StudioBooking";
DROP POLICY IF EXISTS "studio_booking_update_own" ON public."StudioBooking";

DROP POLICY IF EXISTS "service_role_all_account" ON public."Account";
DROP POLICY IF EXISTS "service_role_all_session" ON public."Session";
DROP POLICY IF EXISTS "service_role_all_verification_token" ON public."VerificationToken";
DROP POLICY IF EXISTS "service_role_all_event_request" ON public."EventRequest";

-- =====================================================
-- 3) Policies: authenticated user can only access own rows
-- =====================================================

-- User profile row access
CREATE POLICY "user_select_own"
ON public."User"
FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "user_update_own"
ON public."User"
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- Complaint access
CREATE POLICY "complaint_select_own"
ON public."Complaint"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid()::text);

CREATE POLICY "complaint_insert_own"
ON public."Complaint"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "complaint_update_own"
ON public."Complaint"
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid()::text)
WITH CHECK ("userId" = auth.uid()::text);

-- Music request access (nullable userId is allowed only for service role inserts)
CREATE POLICY "music_request_select_own"
ON public."MusicRequest"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid()::text);

CREATE POLICY "music_request_insert_own"
ON public."MusicRequest"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "music_request_update_own"
ON public."MusicRequest"
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid()::text)
WITH CHECK ("userId" = auth.uid()::text);

-- Studio booking access
CREATE POLICY "studio_booking_select_own"
ON public."StudioBooking"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid()::text);

CREATE POLICY "studio_booking_insert_own"
ON public."StudioBooking"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "studio_booking_update_own"
ON public."StudioBooking"
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid()::text)
WITH CHECK ("userId" = auth.uid()::text);

-- =====================================================
-- 4) Server-only tables: service_role only
-- =====================================================

CREATE POLICY "service_role_all_account"
ON public."Account"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_session"
ON public."Session"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_verification_token"
ON public."VerificationToken"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_event_request"
ON public."EventRequest"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMIT;

-- =====================================================
-- 5) Verification queries
-- =====================================================
-- RLS status by table:
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Effective policies:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
