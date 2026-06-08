# Dependency and Module Overview

## Runtime dependency graph

```text
Browser UI
  -> app/* client pages and dashboard components
  -> lib/supabase/client.ts for auth actions
  -> app/api/* route handlers for mutations/data

Server pages / route handlers
  -> lib/supabase/server.ts for authenticated Supabase user
  -> lib/roles.ts for authorization decisions
  -> lib/prisma.ts for database access
  -> prisma/schema.prisma models in PostgreSQL

Request middleware
  -> proxy.ts
  -> lib/supabase/middleware.ts
  -> Supabase cookie/session refresh
```

## Module interaction summary

- Public pages and category pages render forms and marketing content.
- Client pages submit JSON payloads to `app/api/**/route.ts` endpoints.
- API routes authenticate through Supabase, authorize through Prisma user roles, and mutate/read PostgreSQL through Prisma.
- Server dashboard pages do privileged data loading before handing typed data to large client dashboard components.
- Acceptance endpoints create rows in join tables, allowing multiple members per complaint/event/music/studio request.
- Settings endpoints read/write `SystemSetting`, and acceptance routes parse configured acceptance limits.
- `NavbarWrapper` and role helpers determine visible navigation, but server routes remain responsible for real authorization.

## Oversized file analysis

Files over 300 lines, excluding `node_modules`, `.git`, and `.next`:

| Lines | File | Why it is large | Safe split recommendation |
| ---: | --- | --- | --- |
| 11,186 | `package-lock.json` | npm lockfile. | Do not split; generated file. |
| 1,149 | `app/admin/AdminDashboard.tsx` | Multiple admin domains, local optimistic mutations, filters, modals, tables, and role actions in one client component. | Extract admin types, tab shell, complaint management, event management, music management, user management, and mutation hooks. |
| 645 | `app/member/MemberDashboard.tsx` | Multiple operational queues and acceptance UI in one client component. | Extract queue cards/tables per request type and a shared acceptance action component/hook. |
| 563 | `app/superuser/SuperUserDashboard.tsx` | Superuser-specific stats and management UI in one component. | Extract role/user management, stats cards, and any duplicated admin-style table components. |
| 458 | `app/dashboard/page.tsx` | User dashboard fetch logic, complaint/music display, status formatting, and image modal in one client page. | Extract `UserDashboard`, `ComplaintList`, `MusicRequestList`, and `ImageModal`; keep page as routing/data shell. |
| 397 | `app/category/events/page.tsx` | Event request form state, validation, dynamic sound rows, lighting/decorations, and success UI in one page. | Extract reusable request form sections and a `useEventRequestForm` hook. |
| 384 | `app/event-support/page.tsx` | Department request form state and dynamic fields in one page. | Reuse/extract department selectors, Dhwani rows, Prakash lighting, Kriti needs, and submit hook. |
| 326 | `app/category/music-programs/page.tsx` | Music request form state, validation, sound rows, lighting, and success UI in one page. | Extract sound-row editor and `useMusicProgramForm` hook shared with event form where practical. |
| 318 | `api-security-enhancements.md` | Existing long-form security documentation. | Do not split unless it becomes hard to navigate; add headings/table of contents if needed. |

## Refactor decision for this pass

No behavior-changing code refactor was performed in this documentation pass. The highest-value safe next step is to extract types and pure presentational components from `app/admin/AdminDashboard.tsx`, but that should be done incrementally with UI screenshots and lint/build checks because the dashboard has many coupled optimistic updates and modals.

## Recommended future feature folder shape

```text
features/
  complaints/
    constants.ts
    types.ts
    service.ts
    components/
  music-requests/
    constants.ts
    types.ts
    service.ts
    components/
  events/
    constants.ts
    types.ts
    service.ts
    components/
  admin/
    components/
    hooks/
```

This would reduce future AI context by allowing agents to inspect one feature folder instead of scanning all dashboards and route handlers.
