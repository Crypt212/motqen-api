# Admin RBAC Audit

**Feature**: Admin Role Based Access Control (RBAC)
**Date**: 2026-06-01

## Existing Authorization

- **`authorizeAdmin` middleware**: Currently located in `src/middlewares/authMiddleware.ts`. It relies on `req.userState` and checks if `req.userState.role === 'ADMIN'`. This is part of the old user-based auth system.
- **`authenticateAdminAccess` & `authorizeAdminRole` middleware**: Located in `src/middlewares/adminAuthMiddleware.ts`. `authenticateAdminAccess` verifies admin JWTs and sets `req.adminState`. `authorizeAdminRole` checks if the admin has a specific role (e.g., `'SUPER_ADMIN'`).
- **Route protection patterns**: Financial routes (`escrow.ts`, `withdrawals.ts`, `refunds.ts`, `disputes.ts`, `admin-dashboard.ts`) currently use `router.use(authenticateAccess, authorizeAdmin);` or `router.use(authenticateAccess, isActive, authorizeAdmin);`. Admin auth routes and admin audit log routes use `authenticateAdminAccess`.

## Existing Admin Endpoints

- **Financial endpoints**:
  - `src/routes/v1/financial/escrow.ts` (Escrow hold management)
  - `src/routes/v1/financial/withdrawals.ts` (Withdrawal processing, payout execution, debt settlement)
  - `src/routes/v1/financial/refunds.ts` (Refunds initiation and listing)
  - `src/routes/v1/financial/disputes.ts` (Disputes listing, resolution, and messaging)
- **Report endpoints**:
  - `src/routes/v1/reports.ts`: Uses `authorizeAdmin` for `PATCH /:reportId/status`.
- **Verification endpoints**:
  - `src/routes/v1/workers.ts` has verification routes, though specific admin worker verification management endpoints might be mixed or missing (needs checking).
- **User management endpoints**:
  - `src/routes/v1/admin/users.ts`: Currently just a stub with `listAdmins`.
- **Moderation endpoints**:
  - Moderation for flagged messages exists in the DB (`FlaggedMessage`) but specific admin routes may need to be updated.

## Existing Dashboard Endpoints

- `src/routes/v1/financial/admin-dashboard.ts`: Provides `/summary`, `/activity-log`, and `/users/:userId/aggregation`. Currently uses `authenticateAccess, authorizeAdmin`.

## Existing Notification Infrastructure

- `src/services/NotificationService.ts`: Provides `notify`, `broadcast`, `sendFCMToUser` capabilities. Handles sending FCM pushes and saving to `Notification` table.

## Existing Socket Infrastructure

- `src/socket/socketManager.ts` and `src/socket/socket-emitter.ts`: Standard Socket.IO setup with Redis adapter. `emitToUser` allows emitting events to specific users via `user:${userId}` room. Admin specific presence could be added if needed, or we can use existing rooms.

## Existing Redis Infrastructure

- `src/state.ts` exposes various caches: `otpCache`, `dataCache`, `chatPresenceCache`, `rateLimitCache`, `tokenCache`.

## Final Decisions

1. **Middleware Update**: Create a new RBAC middleware `requireAdminPermission(allowedRoles[])` or utilize `authorizeAdminRole` but modified to support multiple roles and the `SUPER_ADMIN` bypass. Replace all usages of the old `authorizeAdmin` (from `authMiddleware.ts`) on admin endpoints with the new admin auth and RBAC middleware.
2. **Issue Routing & Ownership**: Update `Report` and `Dispute` entities to include `assignedDepartment` and `assignedAdminId`. Note: The instructions say "Issues belong to departments", "Recommended fields: assignedDepartment, assignedAdminId". I will need to update the Prisma schema for this.
3. **Internal Notes**: Add an `IssueNote` table (or similar) to `prisma/schema.prisma` to support admin-only notes on issues (Reports/Disputes/Verifications).
4. **Assignment History**: Add an `IssueAssignmentHistory` table to `prisma/schema.prisma` to track ownership changes.
5. **Conversation Access**: We will need to enforce read-only checks for conversations when accessed by an admin, ensuring they are the assigned admin for an issue related to that conversation.
6. **Logging Sensitive Access**: Integrate `AdminAuditLogService.record` into endpoints that fetch sensitive info (conversations, payments, verifications).
7. **Role Definitions**: Roles are already defined in `AdminRole` enum: `SUPER_ADMIN`, `USER_MANAGEMENT`, `FINANCIAL_MONITOR`, `ISSUES_MANAGEMENT`.
8. **Role Changes**: Update `AdminUsersController` to support role changes with immediate effect. To make role changes immediate, we can invalidate `AdminSession` or store the role in redis/cache during verification. Actually, `adminAuthMiddleware.ts` extracts `role` from the JWT token. If the role changes, the JWT role becomes stale. To fix this, we can either look up the admin in the DB/Cache on every request, or issue a force-logout on role change. The spec says: "Role changes must take effect immediately... Examples: cache invalidation, session invalidation... Use the strategy most compatible with the existing codebase." Invalidating all sessions for that admin (forcing them to re-login) or updating the DB and modifying the middleware to verify the DB role. I will modify `authenticateAdminAccess` to check the DB or a Redis cache for the latest role.

## Implementation Notes (Post-Completion)

1. **Role State Caching**: Modified `AdminAuthService` to set `admin:{adminId}` key in Redis upon role change, status change, or login. The `authenticateAdminAccess` middleware checks this cache (falling back to the database) on every request. This ensures immediate enforcement of role/status changes without strictly requiring a force-logout.
2. **Issue Ownership Routing**: Added `assignedDepartment` and `assignedAdminId` to the `Report`, `Dispute`, and `WorkerVerification` models. Routing is data-driven: issues start unassigned, and admins claim them.
3. **Unified Issue Queue**: Created `AdminIssuesController.getUnifiedQueue` returning a polymorphic list of all issues with `targetType` and `targetId`.
4. **Sensitive Data Constraints**: Implemented strict ownership checks in `AdminDashboardController` (for `getUserAggregation`), `AdminReportsController`, `AdminVerificationsController`, and `DisputeController`. Admins (except `SUPER_ADMIN`) must be explicitly assigned to an active issue involving the user to fetch their detailed data.
5. **Admin Access Revocation**: Introduced `POST /admin/users/:adminId/force-logout` to revoke all admin sessions.
6. **Polymorphic Issue Models**: `IssueNote` and `IssueAssignmentHistory` use `targetType` and `targetId` so they can attach to reports, disputes, and verifications without duplicating the models.
