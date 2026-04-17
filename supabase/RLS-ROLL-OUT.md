# Supabase RLS Rollout Guide

Use this when Supabase flags tables as **unrestricted**.

## 1) Before you run anything

1. **Back up your database** (or ensure PITR is enabled in Supabase).
2. Confirm your app stores Supabase auth user IDs in Prisma tables (`User.id`, `Complaint.userId`, etc.).
3. Make sure your server-only code uses the **service role key** only on trusted server routes.

## 2) Run the policy script

In Supabase Dashboard:

1. Open **SQL Editor**.
2. Paste contents of `supabase/security-policies-fixed.sql`.
3. Run it as a single script.

## 3) Verify it worked

Run these checks in SQL Editor:

```sql
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 4) Smoke-test the app

- As a normal user, confirm you can see/update only your own rows.
- Confirm admin/server workflows still function (these should run server-side with service role where needed).
- Re-check Supabase Security Advisor.

## 5) If anything breaks

- Do **not** disable RLS globally.
- Inspect failed query/table and add the **minimum** required policy for that access path.
- Re-test after each policy change.

## Is it secure now?

RLS is a major security layer, but not the only one. You still need:

- strict server-side authorization,
- protected service role key,
- input validation/rate limiting,
- regular security reviews.
