# Admin Logs & Monitoring Audit

**Feature**: Admin Audit Logs & Monitoring
**Date**: 2026-06-01

## Existing Logging

- `ActivityLog` exists in `prisma/schema.prisma` and is currently used by financial dashboard code as a simple activity feed with `actorId`, `actionType`, `entityType`, `entityId`, `metadata`, and `createdAt`.
- `TransactionLog` exists as a financial source-of-truth record with immutable financial values such as amount, type, reference, and created date.
- Winston file logging exists for operational logs, but it is not an admin investigation/audit store.
- Existing admin-auth audit notes mention `ActivityLog`, but the admin logs spec requires a dedicated admin-only log. `ActivityLog` and `TransactionLog` will remain independent.

## Existing Admin Features

- Admin auth currently has `POST /api/v1/admin/auth/login`, `POST /api/v1/admin/auth/logout`, and `GET /api/v1/admin/auth/access`.
- Admin users routing exists at `/api/v1/admin/users`, but list management is still a stub.
- Current implemented actions that must generate logs in this feature are admin login success, admin login failure, and admin logout.
- Future admin-management, user-management, financial, issues, and support-chat actions are represented by action/category definitions for later specs.

## Existing Pagination Patterns

- `src/utils/handleFilteration.ts` provides offset pagination from `page` and `limit`.
- The admin spec requires response fields `{ items, page, limit, total, hasNext, hasPrevious }`.
- The implementation reuses `handlePagination` and maps its `hasPrev` field to `hasPrevious`.

## Existing Redis Usage

- Redis is used for OTP/token caches, rate limiting, data cache helpers, chat presence, notification unread counts, and socket adapter/presence behavior.
- Redis was evaluated for dashboard counters and recent activity widgets.
- Decision for v1: defer Redis for admin audit monitoring. Metrics use indexed database queries only.
- Added Redis keys: none.

## Existing Swagger Integration

- OpenAPI docs use `@asteasolutions/zod-to-openapi`, Zod schemas, and registration through `src/docs/paths/v1/api.ts`.
- Existing admin auth docs live in `src/docs/paths/v1/admin.docs.ts`; admin audit log endpoints are added there with query and response schemas.

## Final Decision

- Add a dedicated `AdminAuditLog` Prisma model mapped to `admin_audit_logs`.
- Store actor snapshot fields, action, category, severity, optional target reference, metadata, IP address, user agent, and creation date.
- Preserve log immutability with app-level read/create-only repository methods and database triggers that reject update/delete.
- Search strategy: indexed exact filters for action, severity, actor, target, and date range; no broad text search in v1.
- Retention strategy: keep indefinitely in v1. No delete endpoint, purge job, TTL, or archive job.
- Monitoring strategy: live indexed database counts/grouping for metrics; Redis counters are deferred.

## Files Expected To Change

- `prisma/schema.prisma`
- `src/state.ts`
- `src/controllers/AdminAuthController.ts`
- `src/docs/paths/v1/admin.docs.ts`
- `src/routes/v1/api.ts`

## Files Expected To Be Added

- `prisma/migrations/20260601000000_add_admin_audit_logs/migration.sql`
- `src/domain/adminAuditLog.entity.ts`
- `src/repositories/prisma/AdminAuditLogRepository.ts`
- `src/services/AdminAuditLogService.ts`
- `src/controllers/AdminAuditLogController.ts`
- `src/routes/v1/admin/audit-logs.ts`
- `src/schemas/requests/admin-audit-logs.request.ts`
- `src/schemas/responses/admin-audit-logs.response.ts`
- `docs/specs/impacts/add-admin-audit-logs.md`
- `docs/specs/progress/admin-logs.md`
