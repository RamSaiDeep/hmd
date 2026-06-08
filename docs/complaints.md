# Complaints

## Summary

Complaints are user-submitted maintenance/issue reports. Users create and view their own complaints; members accept complaints; admins/superusers manage status, priority, assignment, and deletion.

## Key files

- `app/register-complaint/page.tsx`: complaint submission UI.
- `app/dashboard/page.tsx`: user-facing complaint list.
- `app/admin/page.tsx`: server-side admin complaint data load and access gate.
- `app/admin/AdminDashboard.tsx`: admin complaint management UI.
- `app/member/page.tsx`: server-side member queue data load and access gate.
- `app/member/MemberDashboard.tsx`: member complaint queue UI.
- `app/api/complaints/route.ts`: create/fetch complaints.
- `app/api/complaints/update/route.ts`: status/priority updates.
- `app/api/admin/complaints/delete/route.ts`: complaint deletion.
- `app/api/accept/route.ts`: member acceptance.
- `app/api/assign/route.ts`: admin assignment.
- `prisma/schema.prisma`: `Complaint` and `ComplaintAcceptance` models.

## Data model

`Complaint` fields include:

- `id`
- `userId`
- `place`
- `issueType`
- `issueDetail`
- `description`
- `photoUrl`
- `status`
- `priority`
- `createdAt`
- `updatedAt`
- `updatedBy`

`ComplaintAcceptance` links a complaint to a member user. The pair `(complaintId, memberId)` is unique, so one member cannot accept the same complaint twice.

## Lifecycle

1. A logged-in user submits a complaint.
2. The API validates required fields and ensures the Prisma user exists.
3. Complaint starts with default status `Not Started` and default priority `Medium` unless the API supplies otherwise.
4. The user sees the complaint in their dashboard.
5. Members can accept the complaint if the acceptance limit has not been reached.
6. Admins can update status/priority, assign members, or delete the complaint.
7. The latest status/priority is reflected in dashboards.

## Statuses and priorities

Statuses currently used by the admin dashboard:

- `Not Started`
- `In Progress`
- `Finished`
- `Invalid Request`

Priorities currently used by the admin dashboard:

- `Low`
- `Medium`
- `High`

## Maintenance recommendations

- Centralize complaint statuses and priorities in a shared constants file before adding new values.
- Extract complaint tables, filters, image modal, and mutation handlers from the admin dashboard into feature components/hooks.
- Add tests for role enforcement on update/delete/assign endpoints.
- Add audit logging for admin changes.
