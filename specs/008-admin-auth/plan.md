# Implementation Plan: Admin Authentication & Administration System

**Branch**: `008-admin-auth` | **Date**: 2026-06-01 | **Spec**: `specs/008-admin-auth/spec.md`
**Input**: Feature specification from `/specs/008-admin-auth/spec.md`

## Summary

Implement a dedicated admin authentication domain with separate admin identity and session storage, while reusing the existing session/token architecture for access and refresh lifecycle management.

The feature will add admin-only authentication endpoints, admin management endpoints for `SUPER_ADMIN`, and admin-specific middleware, without merging admin identity into the regular user model.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ (existing backend stack)
**Primary Dependencies**: Express, Prisma, Zod, bcrypt, JWT token utilities, Vitest
**Storage**: PostgreSQL via Prisma
**Testing**: Vitest with unit and integration tests for auth flows and admin management
**Target Platform**: Linux backend API service
**Project Type**: Web service / REST API
**Performance Goals**: Admin endpoints should remain responsive under normal administrative load, with auth validation and pagination completing within standard API latency budgets.
**Constraints**: Passwords must be hashed securely, admin sessions must support revocation, and the admin domain must remain separate from client/worker user data.
**Scale/Scope**: Small internal administrative user base, focused on security and auditability rather than high concurrent volume.

## Constitution Check

- This feature follows the admin initiative's single-branch approach.
- It preserves existing user authentication flows and does not merge admin identity into the regular user domain.
- It is audit-driven and maintains documented decision-making in `docs/specs/audits/admin-auth-audit.md`.

## Project Structure

### Documentation (this feature)

```text
specs/008-admin-auth/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── controllers/
│   ├── AuthController.ts          # existing user auth
│   └── AdminAuthController.ts     # new admin auth endpoints
├── services/
│   ├── AuthService.ts            # existing user auth service
│   └── AdminAuthService.ts       # new admin auth service
├── middlewares/
│   └── adminAuthMiddleware.ts    # admin auth and role guards
├── repositories/prisma/
│   ├── UserRepository.ts         # existing user repository
│   ├── AdminRepository.ts        # new admin repository
│   └── AdminSessionRepository.ts # new admin session repository
├── docs/paths/v1/
│   └── admin.docs.ts            # new admin auth docs
├── utils/
│   └── tokens.ts                # extend for admin token payloads
└── prisma/schema.prisma         # admin domain schema updates
```

**Structure Decision**: Keep the implementation within the existing backend API service. Add dedicated admin domain artifacts under `src/` rather than creating a separate project, because this preserves existing infrastructure and keeps admin auth aligned with the current codebase.

## Implementation Plan

1. Design the admin Prisma schema:
   - Add `Admin` model with `username`, `passwordHash`, `firstName`, `lastName`, optional `profileImageUrl`, `role`, `status`, and timestamps.
   - Add `AdminSession` model with `adminId`, `token`, `deviceId`, `isRevoked`, `revokedAt`, `revokedBy`, `expiresAt`, and optional `fcmToken` or audit metadata as needed.
   - Consider adding `AdminAuditLog` or reuse `ActivityLog` for admin action auditing.

2. Implement admin domain entities and repositories:
   - Create `AdminRepository` and `AdminSessionRepository` for Prisma access.
   - Add domain types for `Admin`, `AdminSession`, and admin roles.

3. Build admin authentication service and controller:
   - Implement username/password login and session creation.
   - Support disabled account rejection and session revocation.
   - Add super admin management operations: create admin, update profile, change roles, enable/disable, reset password, force logout.

4. Extend auth token utilities:
   - Add admin token payload types and token purpose tags.
   - Support separate admin access and refresh tokens.
   - Ensure token verification is explicit for admin auth flows.

5. Add admin-specific middleware:
   - Create `authenticateAdminAccess` and `authenticateAdminRefresh`.
   - Create `authorizeAdminRole` to enforce `SUPER_ADMIN` and other admin roles.
   - Keep user auth middleware unchanged to preserve current user flows.

6. Add API route and documentation:
   - Expose admin auth endpoints under `/api/v1/admin/auth` and admin management under `/api/v1/admin/users` or similar.
   - Add Zod schemas for requests and responses.
   - Register admin endpoints in Swagger/OpenAPI documentation.

7. Implement audit logging:
   - Record admin login, logout, failed login, create, update, role change, disable/enable, password reset, and force logout.
   - Use `ActivityLog` or a dedicated admin audit log table.

8. Test the admin auth feature:
   - Write unit and integration tests for login, disabled account rejection, session revocation, role enforcement, and admin management.
   - Validate pagination on admin list endpoints and audit log creation.
   - Confirm existing user auth flows remain operational.

9. Update documentation and progress:
   - Finalize `docs/specs/audits/admin-auth-audit.md` with the chosen implementation strategy.
   - Update `docs/specs/progress/admin-auth.md` and keep the admin auth feature tracked.

## Known Constraints and Decisions

- `User`-based admin accounts will not be reused; admins require a separate identity domain.
- Session/token lifecycle will be reused where safe, but admin tokens and sessions will remain logically distinct.
- `SUPER_ADMIN` protections will be implemented as a guarded rule set rather than solely a database constraint.
- Admin auth will not extend OTP-based login; it will be username/password only.

## Checklist for Next Phase

- [ ] Define Prisma schema and generate client
- [ ] Create admin repositories and service layer
- [ ] Implement admin auth endpoints and middleware
- [ ] Add Swagger docs and Zod schemas
- [ ] Add audit logs for admin actions
- [ ] Write tests for admin auth and management
- [ ] Update audit and progress documentation
