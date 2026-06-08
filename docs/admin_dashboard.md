# Admin Dashboard

## Summary

The admin dashboard is the central privileged UI for operational management. It currently combines complaints, events, music requests, user management, and settings in one large client component.

## Access

- Server page: `app/admin/page.tsx`.
- Client dashboard: `app/admin/AdminDashboard.tsx`.
- Access helper: `canAccessAdminPanel(role)` in `lib/roles.ts`.
- Admin access is available to `admin` and `superuser` roles.

## Data loaded by the server page

`app/admin/page.tsx` authenticates the Supabase user, loads the Prisma user role, redirects unauthorized users, and then loads dashboard data including:

- Complaints with submitter and acceptances.
- Event requests with acceptances.
- Music requests with users and acceptances.
- Users for role/delete management.

## Dashboard tabs/responsibilities

- **Complaints:** filter/search complaints, update status/priority, assign members, delete complaints, view photos.
- **Events:** view event-support requests and assign members.
- **Music:** view music requests, accept/reject/offer alternatives, delete requests.
- **Users:** change roles and delete users subject to role rules.
- **Settings:** configure runtime settings such as acceptance limits.

## Mutation endpoints

- `POST /api/complaints/update`
- `POST /api/admin/complaints/delete`
- `POST /api/admin/users/delete`
- `POST /api/admin/users/role`
- `GET /api/admin/music-requests`
- `PUT /api/admin/music-requests`
- `DELETE /api/admin/music-requests`
- `POST /api/assign`
- `GET /api/settings`
- `POST /api/settings`

## Refactor recommendations

`app/admin/AdminDashboard.tsx` is the largest file in the repository and should be split before more features are added.

Suggested extraction sequence:

1. `app/admin/types.ts` for `ComplaintItem`, `EventItem`, `MusicRequestItem`, `UserItem`, and tab/scope types.
2. `app/admin/components/AdminTabs.tsx` for tab navigation.
3. `app/admin/components/ComplaintManagement.tsx` for filters, table, image modal, status/priority updates, deletion, and assignment entry points.
4. `app/admin/components/EventManagement.tsx` for event request display and assignment.
5. `app/admin/components/MusicRequestManagement.tsx` for music list/actions and response modal.
6. `app/admin/components/UserManagement.tsx` for user roles/deletion.
7. `app/admin/hooks/useAdminMutations.ts` for optimistic mutation helpers and rollback behavior.

Perform these extractions incrementally and run lint after each step.
