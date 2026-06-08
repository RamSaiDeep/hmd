# Authentication

## Summary

HMD uses Supabase Auth for login/session management and Prisma for application user records. A Supabase user must be synchronized into the Prisma `User` table before role-based application features can work reliably.

## Key files

- `app/login/page.tsx`: login/signup UI and client-side auth actions.
- `app/auth/callback/route.ts`: primary callback for email/OAuth verification and session exchange.
- `app/api/auth/callback/route.ts`: API-scoped callback variant.
- `app/api/auth/sync-user/route.ts`: shared helper based user sync endpoint.
- `app/api/user/sync/route.ts`: verbose reconciliation sync endpoint.
- `app/api/user/ensure-sync/route.ts`: ensures the logged-in Supabase user exists in Prisma.
- `app/api/user/me/route.ts`: returns the current Prisma user/role.
- `lib/supabase/client.ts`: browser Supabase client.
- `lib/supabase/server.ts`: server Supabase client using request cookies.
- `lib/supabase/middleware.ts`: session refresh support.
- `lib/supabase/admin.ts`: service-role client factory.
- `lib/sync-user.ts`: canonical Supabase-to-Prisma sync helper.
- `proxy.ts`: applies session refresh middleware to matched requests.

## Flow

1. User signs up or logs in on `/login`.
2. Supabase stores the browser session and sends verification/OAuth callback traffic to `/auth/callback`.
3. The callback exchanges `code` for a session.
4. The callback reads the Supabase user and calls `syncAuthUserToPrisma`.
5. `syncAuthUserToPrisma` extracts normalized profile fields and creates or updates `User` in Prisma.
6. Pages/routes read the Supabase session with the server client.
7. Privileged pages/routes load the matching Prisma user and evaluate `User.role` through helpers in `lib/roles.ts`.

## Role checks

Use `lib/roles.ts` helpers instead of inline comparisons where possible:

- `canAccessMemberDashboard(role)`
- `canAccessAdminPanel(role)`
- `canAccessSuperuserPanel(role)`
- `canAssignRole(actorRole, targetCurrentRole, newRole)`
- `canDeleteUser(actorRole, targetRole, actorId, targetId)`

## Future development rules

- Keep Supabase Auth as the session authority.
- Keep Prisma `User` as the role/profile authority.
- Always normalize email before Prisma writes.
- Never trust client-provided role information.
- Every privileged API route must authenticate and authorize server-side.
- Prefer the shared sync helper unless a route intentionally needs reconciliation behavior.
