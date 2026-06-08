# HMD Project Status

## Current features

- Public landing and navigation pages for services, categories, team/contact sections, and calls to action.
- Supabase email/password and Google authentication, including signup profile metadata and callback synchronization into Prisma.
- User dashboard showing the authenticated user's complaints and music requests.
- Complaint registration and tracking with status, priority, issue metadata, optional photo URL, and admin updates.
- Event-support request entry for Dhwani, Prakash, and Kriti needs.
- Music-program request entry with sound requirements, lighting needs, notes, and admin response/alternative-offer handling.
- Member dashboard for operational users to view and accept complaints, event requests, music requests, and studio bookings.
- Admin dashboard for complaints, events, music requests, user management, and settings.
- Superuser dashboard/panel with highest-level access and role governance.
- Runtime system settings for acceptance limits.
- Supabase/Prisma user synchronization endpoints.
- Security support documents and Supabase RLS rollout SQL in the repository.

## Completed modules

| Module | Status | Notes |
| --- | --- | --- |
| Authentication | Complete baseline | Supabase Auth is wired through browser/server clients, callbacks, middleware refresh, and Prisma user sync. |
| Role hierarchy | Complete baseline | `user < member < admin < superuser` is centralized in `lib/roles.ts`. |
| Complaint lifecycle | Complete baseline | Users submit complaints; admins update status/priority or delete; members can accept within configured limits. |
| Event requests | Complete baseline | Users submit department-specific event support requests; members/admins can view/accept. |
| Music requests | Complete baseline | Users submit requests; admins accept/reject/offer alternatives; users can respond to alternatives. |
| Admin dashboard | Complete baseline | Complaints, events, music, users, and settings are available in one dashboard. |
| Member dashboard | Complete baseline | Members can view/accept operational queues. |
| Settings | Complete baseline | Key/value settings are stored in `SystemSetting` and used by acceptance endpoints. |
| Database schema | Complete baseline | Prisma schema covers users, requests, acceptances, studio bookings, and settings. |
| Project documentation | Added | Root AI-facing docs and workflow docs are now available. |

## Pending modules

- Central domain constants for statuses, priorities, request types, and acceptance limits.
- Shared TypeScript DTOs for API responses and dashboard props.
- Extracted feature components for large admin/member/user dashboards.
- Dedicated notification delivery implementation using the installed `resend` dependency or Supabase email hooks.
- Audit log for privileged changes such as status updates, role changes, deletion, and assignment.
- Test suite for role helpers, route authorization, validation, and lifecycle transitions.
- Error-handling and toast/notification UX consistency across dashboards.
- Studio booking entry UI and lifecycle documentation parity if studio workflows expand.
- Central data-access/service layer to reduce repeated Prisma queries in route handlers.

## Roadmap

### Phase 1: Stabilize maintainability

- Split oversized dashboards into feature-specific components and hooks.
- Add shared constants/types under `lib/domain/` or `features/*`.
- Add route-handler helper utilities for authentication, authorization, validation, and structured JSON errors.
- Add smoke tests for role helpers and critical API route behavior.

### Phase 2: Improve operations

- Add audit logging for admin/superuser actions.
- Implement notification delivery for new assignments, accepted work, status changes, and music alternatives.
- Make acceptance limits visible and editable with clearer validation.
- Improve dashboard filtering/search with URL state where appropriate.

### Phase 3: Scale feature architecture

- Move domain workflows into feature folders such as `features/complaints`, `features/music-requests`, `features/events`, and `features/admin`.
- Introduce shared server-side data services that route handlers and server pages can reuse.
- Add stronger type contracts for API payloads and responses.
- Add integration tests backed by a test database or mocked Prisma client.

### Phase 4: Product maturity

- Add analytics/reporting for request volume, completion time, and member workload.
- Add SLA/escalation rules for high-priority complaints.
- Add file-upload/storage integration for complaint photos instead of plain photo URL fields.
- Add richer notification preferences and digest emails.
