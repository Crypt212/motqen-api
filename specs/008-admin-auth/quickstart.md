# Quickstart: Admin Authentication Implementation

## Goal

Add a dedicated admin authentication domain, including admin login, session management, and `SUPER_ADMIN` management endpoints.

## Quick Steps

1. Add admin database models
   - Extend `prisma/schema.prisma` with `Admin` and `AdminSession`.
   - Generate Prisma client: `pnpm prisma generate`.

2. Add admin domain repositories and entities
   - Create `src/repositories/prisma/AdminRepository.ts`.
   - Create `src/repositories/prisma/AdminSessionRepository.ts`.
   - Add domain entities/types for `Admin`, `AdminSession`, and admin roles.

3. Implement admin auth service and controller
   - Create `src/services/AdminAuthService.ts`.
   - Create `src/controllers/AdminAuthController.ts`.
   - Support username/password login, logout, and refresh token generation.

4. Implement admin middleware
   - Add `src/middlewares/adminAuthMiddleware.ts`.
   - Add `authenticateAdminAccess`, `authenticateAdminRefresh`, and role guards.

5. Add routes and docs
   - Add `/api/v1/admin/auth` routes for login, logout, refresh.
   - Add `/api/v1/admin/users` routes for `SUPER_ADMIN` operations.
   - Update `src/docs/paths/v1/admin.docs.ts` for Swagger/OpenAPI.

6. Add audit logging
   - Record login, logout, failed login, create, update, role change, disable, enable, password reset, and force logout.
   - Reuse `ActivityLog` where possible.

7. Test and verify
   - Write tests for admin authentication, disabled account rejection, session revocation, pagination, and management actions.
   - Confirm regular user auth flows are unaffected.

## Expected route prefixes

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `POST /api/v1/admin/auth/refresh`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:adminId`
- `PATCH /api/v1/admin/users/:adminId/disable`
- `PATCH /api/v1/admin/users/:adminId/enable`
- `POST /api/v1/admin/users/:adminId/reset-password`
- `POST /api/v1/admin/users/:adminId/force-logout`

## Testing notes

- Use `SUPER_ADMIN` credentials for management operations.
- Ensure `hasNext` and `hasPrevious` appear on paginated results.
- Verify disabled admins cannot authenticate and that their active sessions are revoked immediately.
