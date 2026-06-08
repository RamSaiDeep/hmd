# AI Context for HMD

Use this file as the first context stop for AI-assisted changes. It summarizes the flows and contracts that otherwise require reading many route handlers and dashboards.

## Authentication flow

1. Browser clients use `lib/supabase/client.ts` for Supabase Auth actions.
2. Server components and route handlers use `lib/supabase/server.ts` to read the current Supabase session from cookies.
3. `proxy.ts` calls `lib/supabase/middleware.ts` to refresh session state for most non-static requests.
4. Signup/login UI lives in `app/login/page.tsx`.
5. Supabase auth callbacks are handled by `app/auth/callback/route.ts`; successful code exchange triggers `syncAuthUserToPrisma`.
6. Additional sync endpoints exist under `app/api/auth/sync-user`, `app/api/user/sync`, and `app/api/user/ensure-sync` for reconciling Supabase users with the Prisma `User` table.
7. Prisma `User.id` should match Supabase `user.id`; email should be normalized to lowercase before persistence.

## Complaint lifecycle

1. Authenticated user submits a complaint from `app/register-complaint/page.tsx` to `POST /api/complaints`.
2. `POST /api/complaints` validates required fields, ensures a Prisma user exists, and creates a `Complaint`.
3. Users can fetch their own complaints through `GET /api/complaints` or view them on `app/dashboard/page.tsx`.
4. Admins view all complaints from server-loaded data in `app/admin/page.tsx` and interact through `app/admin/AdminDashboard.tsx`.
5. Admins update complaint `status` or `priority` through `POST /api/complaints/update`.
6. Admins can delete complaints through `POST /api/admin/complaints/delete`.
7. Members/admins/superusers accept complaints through `POST /api/accept`; admins may also assign members through `POST /api/assign`.
8. Complaint acceptance is limited by `SystemSetting.COMPLAINT_ACCEPTANCE_LIMIT`, defaulting to `2` when no setting is stored.

Known complaint statuses:

- `Not Started`
- `In Progress`
- `Finished`
- `Invalid Request`

Known priorities:

- `Low`
- `Medium`
- `High`

## User roles

Roles are string values stored on `User.role` and interpreted by `lib/roles.ts`.

| Role | Rank | Access summary |
| --- | ---: | --- |
| `user` | 0 | Personal dashboard and request submission. |
| `member` | 1 | Member dashboard and acceptance actions. |
| `admin` | 2 | Admin panel, member access, user management within limits, settings, request management. |
| `superuser` | 3 | Superuser panel and highest-level role/user governance. |

Important rules:

- Unknown or empty roles parse as `user`.
- Only `superuser` has superuser-panel access.
- Admins cannot promote users to admin/superuser, mutate admins, or affect superusers.
- Superusers can assign `user`, `member`, or `admin`, but not `superuser` through normal role-change APIs.
- No actor may delete themself; superusers are protected from deletion.

## API endpoints

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/accept` | `POST` | Member/admin/superuser accepts complaint, event, music, or studio work subject to acceptance limits. |
| `/api/assign` | `POST` | Admin/superuser assigns a member to complaint, event, music, or studio work. |
| `/api/complaints` | `GET`, `POST` | Fetch current user's complaints; create authenticated user complaint. |
| `/api/complaints/update` | `POST` | Admin/superuser updates complaint status or priority. |
| `/api/events` | `POST` | Create authenticated event-support request. |
| `/api/music-programs` | `POST` | Create authenticated music-program request. |
| `/api/settings` | `GET`, `POST` | Read settings; admin/superuser updates settings. |
| `/api/admin/complaints/delete` | `POST` | Admin/superuser deletes a complaint. |
| `/api/admin/music-requests` | `GET`, `PUT`, `DELETE` | Admin music-request list, status/response update, and deletion. |
| `/api/admin/users/delete` | `POST` | Authorized admin/superuser user deletion. |
| `/api/admin/users/role` | `POST` | Authorized role mutation. |
| `/api/auth/callback` | `GET` | API-scoped Supabase callback variant. |
| `/auth/callback` | `GET` | Primary Supabase callback; exchanges code and syncs user. |
| `/api/auth/sync-user` | `POST` | Sync current Supabase user into Prisma using shared sync helper. |
| `/api/user/ensure-sync` | `POST` | Ensure current Supabase user has a Prisma record. |
| `/api/user/me` | `GET` | Return current Prisma user/role information. |
| `/api/user/music-requests` | `GET` | Return current user's music requests. |
| `/api/user/music-requests/respond` | `POST` | User responds to admin-proposed music-request alternatives. |
| `/api/user/sync` | `POST` | Verbose user sync/reconciliation endpoint. |
| `/api/test` | `GET`, `POST` | Development/test endpoint. |
| `/api/test-db` | `GET` | Database/environment diagnostic endpoint. |

## Database tables and relationships

- `User` is the central identity table. It has one-to-many relationships to `Complaint`, `StudioBooking`, and optionally `MusicRequest`.
- `Complaint` belongs to `User` and has many `ComplaintAcceptance` rows.
- `ComplaintAcceptance` joins `Complaint` to accepting member `User`; `(complaintId, memberId)` is unique.
- `EventRequest` has many `EventAcceptance` rows.
- `EventAcceptance` joins `EventRequest` to accepting member `User`; `(eventId, memberId)` is unique.
- `MusicRequest` optionally belongs to `User` and has many `MusicAcceptance` rows.
- `MusicAcceptance` joins `MusicRequest` to accepting member `User`; `(musicId, memberId)` is unique.
- `StudioBooking` belongs to `User` and has many `StudioAcceptance` rows.
- `StudioAcceptance` joins `StudioBooking` to accepting member `User`; `(bookingId, memberId)` is unique.
- `SystemSetting` stores string key/value configuration used by runtime workflows.
- `Account`, `Session`, and `VerificationToken` exist in Prisma but are not the active authentication control plane in current app code.

## Important architectural decisions

- Supabase Auth is authoritative for sessions; Prisma `User` is authoritative for app profile/role data.
- Server pages gate privileged dashboards before rendering by reading Supabase user and Prisma role, then redirecting unauthorized users.
- Client dashboards call API routes for mutations; API routes must repeat authorization checks server-side.
- Acceptance records are explicit join tables rather than a single assignee field, allowing multiple members per request up to configurable limits.
- Settings are simple strings in `SystemSetting`; callers parse them into numbers where needed.
- Current dashboards are large client components. Future development should extract subcomponents instead of appending new logic.
- Status values are currently string literals across UI and routes. Long-term work should centralize them to reduce drift.
