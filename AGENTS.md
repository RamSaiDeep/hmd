<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HMD Project Agent Guide

## Project overview

HMD is a Next.js App Router application for hostel/media-department operations. It lets authenticated users submit complaints and support requests, lets members accept operational work, and lets admins/superusers manage complaints, music/event requests, users, and system settings.

The app is intentionally small today, but the product surface already spans four workflows:

1. **Public marketing/navigation** for categories and services.
2. **User self-service** for complaints, music/event requests, profile, and personal dashboard.
3. **Member operations** for accepting assigned/available requests.
4. **Admin/superuser governance** for status changes, assignment, user roles, settings, and destructive actions.

## Tech stack

- **Framework:** Next.js 16 App Router with React 19.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS 4, shadcn-style UI primitives, `clsx`, `tailwind-merge`, `next-themes`.
- **Authentication:** Supabase Auth via `@supabase/ssr` browser/server clients.
- **Database:** PostgreSQL accessed through Prisma 7 and `@prisma/adapter-pg`; optional Prisma Accelerate support.
- **Email/service integrations:** Supabase service-role admin client is available; `resend` is installed for future notification delivery.
- **Package manager:** npm with `package-lock.json` committed.

## Architecture summary

- `app/` owns routes, pages, layouts, and API route handlers.
- `app/api/**/route.ts` exposes JSON endpoints for complaints, requests, assignment, settings, user sync, and admin actions.
- `lib/supabase/*` centralizes Supabase browser, server, admin, and middleware clients.
- `lib/prisma.ts` lazily initializes and caches the Prisma client on `globalThis` to avoid repeated clients during development.
- `lib/roles.ts` is the source of truth for role parsing, hierarchy, navigation, and role mutation rules.
- `lib/sync-user.ts` syncs Supabase Auth users into the Prisma `User` table.
- `components/` contains reusable visual and UI components used by pages and dashboards.
- `prisma/schema.prisma` is the source of truth for database models and relationships.
- `proxy.ts` refreshes Supabase auth state for matched requests through `lib/supabase/middleware.ts`.

## Coding conventions

- Before changing App Router code, read the relevant guide under `node_modules/next/dist/docs/`; this repository uses Next.js 16 and may differ from older conventions.
- Prefer Server Components for data-loading pages and Client Components only where interactivity, browser APIs, hooks, or event handlers are required.
- Keep route handlers small: validate input, authenticate/authorize, call Prisma, and return `NextResponse.json`.
- Keep role logic centralized in `lib/roles.ts`; do not duplicate role hierarchy or permission rules in UI components.
- Keep Supabase client creation centralized in `lib/supabase/*`; do not instantiate ad hoc clients in pages/routes.
- Keep database access through `lib/prisma.ts`; do not create additional Prisma clients.
- Normalize user email addresses before Prisma writes.
- Use optimistic UI only when rollback is implemented on failed API calls.
- Avoid `any` in new code; add small local types or shared domain types when data crosses route/component boundaries.
- Never add try/catch blocks around imports.
- Prefer extracting components/hooks once a page exceeds roughly 300 lines or mixes unrelated concerns.
- Preserve application behavior unless the task explicitly asks for feature or bug changes.

## Folder responsibilities

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, route groups, and API handlers. |
| `app/api/` | Server-side JSON endpoints for domain operations and auth/user synchronization. |
| `app/admin/` | Admin-only page and client dashboard for complaints, events, music requests, users, and settings. |
| `app/member/` | Member/admin/superuser operations dashboard. |
| `app/superuser/` | Superuser panel and server-side access gate. |
| `app/category/` | Request-entry pages for category-specific workflows. |
| `components/` | Reusable presentation components and shared UI primitives. |
| `lib/` | Cross-cutting infrastructure: Prisma, Supabase clients, roles, auth helpers, utilities. |
| `prisma/` | Prisma schema and database model definitions. |
| `scripts/` | Operational scripts for migrations, setup, and data maintenance. |
| `supabase/` | Supabase RLS/security SQL and rollout notes. |
| `docs/` | Persistent project documentation for future humans and AI agents. |

## Database schema summary

Primary models in `prisma/schema.prisma`:

- `User`: Supabase-auth-aligned app user with profile fields and role (`user`, `member`, `admin`, `superuser`). Owns complaints, studio bookings, music requests, and acceptance records.
- `Account`, `Session`, `VerificationToken`: legacy/NextAuth-shaped tables retained in schema; Supabase Auth is the active auth system in app code.
- `Complaint`: user-submitted maintenance/issue report with place, issue type/detail, optional description/photo, status, priority, and updater metadata.
- `ComplaintAcceptance`: many-to-many assignment/acceptance join between members and complaints.
- `EventRequest`: support request for Dhwani/Prakash/Kriti departments with requested equipment/venue/notes and member response state.
- `EventAcceptance`: member acceptance join for event requests.
- `MusicRequest`: music-program support request with sound items, lighting, admin response, and alternative-offer fields.
- `MusicAcceptance`: member acceptance join for music requests.
- `StudioBooking`: studio booking request with day/slot/purpose/status.
- `StudioAcceptance`: member acceptance join for studio bookings.
- `SystemSetting`: key/value runtime settings, including acceptance limits.

## Rules for future development

1. **Document new workflows immediately.** Update `AI_CONTEXT.md`, `PROJECT.md`, and the relevant file in `docs/` when adding a workflow, role permission, or status transition.
2. **Keep AI context small.** Extract large dashboard sections into focused components and keep shared logic in `lib/` or feature-local helpers.
3. **Protect role boundaries.** Every privileged API route must authenticate with Supabase and authorize against Prisma user roles.
4. **Use Prisma schema as the domain contract.** Schema changes must be reflected in docs and any affected route/component types.
5. **Avoid dashboard sprawl.** Files over 300 lines should get an extraction plan before new UI is appended.
6. **Prefer explicit status constants.** Existing statuses are string literals; future work should centralize them before adding new statuses.
7. **Do not rely on client-side authorization.** UI hiding is helpful, but server routes must enforce permissions.
8. **Run `npm run lint` before committing.** If environment configuration prevents a stronger check/build, document the limitation.
9. **Use npm.** Keep `package-lock.json` in sync with dependency changes.
10. **Do not change behavior during documentation/refactor tasks.** Refactors should be small, reversible, and covered by lint/build checks.

## Oversized file guidance

Current files over 300 lines are documented in `docs/module_overview.md`. Treat these as refactor candidates and avoid adding more logic to them unless the change also extracts nearby responsibilities.
