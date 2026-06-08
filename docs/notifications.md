# Notifications

## Current state

Notification delivery is not yet implemented as a complete product module. The `resend` package is installed, and Supabase email capabilities are available through authentication, but there is no centralized notification service for domain events.

## Events that should trigger notifications

Recommended future notification triggers:

- New complaint submitted.
- Complaint accepted by a member.
- Complaint status or priority changed.
- Complaint assigned by admin/superuser.
- New event-support request submitted.
- New music-program request submitted.
- Music request accepted, rejected, or given an alternative.
- User accepts/rejects a music-request alternative.
- Admin/superuser changes a user's role.

## Suggested architecture

Create a dedicated notification module instead of sending email directly from pages or dashboard components.

Recommended files:

- `lib/notifications/types.ts`: domain event and recipient types.
- `lib/notifications/service.ts`: high-level `notify(event)` function.
- `lib/notifications/email.ts`: Resend transport implementation.
- `lib/notifications/templates/*`: small email templates.

## Rules for implementation

- Trigger notifications from server-side route handlers or service functions after successful database writes.
- Keep notification failures from rolling back critical user actions unless the product explicitly requires transactional delivery.
- Store delivery attempts if auditability becomes important.
- Do not expose service-role keys or email provider secrets to client components.
- Prefer idempotent notification calls when retries are possible.

## Documentation impact

When notification delivery is implemented, update:

- `PROJECT.md` completed/pending modules.
- `AI_CONTEXT.md` important architectural decisions.
- This file with concrete events, templates, and provider configuration.
