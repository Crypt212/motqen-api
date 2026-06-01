# Add Admin Audit Logs Impact

**Date**: 2026-06-01

## Schema Change

- Adds `AdminAuditSeverity` enum.
- Adds `AdminAuditCategory` enum.
- Adds `AdminAuditLog` model mapped to `admin_audit_logs`.
- Adds indexes for created date, action, severity, actor, target, and category/date queries.
- Adds migration triggers to reject update and delete operations on `admin_audit_logs`.

## Affected APIs

- Adds `GET /api/v1/admin/audit-logs`.
- Adds `GET /api/v1/admin/audit-logs/metrics`.
- Updates admin auth login/logout behavior to write audit logs.

## Affected Services and Repositories

- Adds `AdminAuditLogRepository`.
- Adds `AdminAuditLogService`.
- Updates `AdminAuthController` to log authentication events.
- Updates `state.ts` dependency registration.

## Affected Sockets and Cron Jobs

- No socket changes.
- No cron changes.

## Swagger and Docs

- Adds Zod request/response schemas for admin audit logs.
- Registers admin audit log endpoints in Swagger.

## Compatibility

- Does not replace `ActivityLog` or `TransactionLog`.
- Does not change existing user auth, financial log, or activity log response contracts.
- Adds no Redis keys in v1.
