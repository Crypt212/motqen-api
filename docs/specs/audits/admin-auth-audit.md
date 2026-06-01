# Admin Auth Audit

**Feature**: Admin Authentication & Administration System
**Date**: 2026-06-01
**Author**: GitHub Copilot

## Summary

This audit evaluates the current authentication architecture and recommends a safe, reusable implementation path for the dedicated admin domain.

## Current State

- The project currently authenticates users through OTP-based login and registration flows.
- User sessions are stored in `prisma.Session` and are tied to `User` records.
- Admin authorization is presently inferred from `User.role === 'ADMIN'` using `authorizeAdmin` middleware.
- There is no dedicated `Admin`, `AdminSession`, or admin-specific authentication flow in the current schema.

## Reusable Components

- `AuthService`, `AuthController`, and `authMiddleware` provide a strong pattern for token lifecycle, session revocation, and authenticated request handling.
- `verifyHeaderToken`, `generateAccessToken`, and `generateRefreshToken` already handle access/refresh flows that can be extended for admin token payloads.
- `ActivityLog` is available for recording audit events and can be reused for admin action auditing.
- Swagger/OpenAPI registration and Zod schema patterns are already in place for documented API endpoints.

## Requirement Alignment

The admin feature spec explicitly requires that admins be separate from `User`, `ClientProfile`, and `WorkerProfile` domains. Reusing the existing `User` table for admin accounts would violate this separation and the targeted admin domain boundary.

## Decision

- **Admin data and credentials will be implemented in a dedicated admin domain.**
  - Introduce a new `Admin` model for credentials and profile data.
  - Introduce a new `AdminSession` model for admin session state.

- **Reuse the existing session/token architecture where possible.**
  - Retain the proven access/refresh token model and session revocation semantics.
  - Extend token utilities to support distinct admin token payloads and verification contexts.

- **Do not reuse `User` for admin identity.**
  - Preserve the current user domain for clients and workers.
  - Avoid role-based mixing of admin users with regular platform users.

## Implementation Progress

- Admin route and documentation stubs have been added for `/api/v1/admin/auth`.
- A dedicated admin middleware file was created with admin access and refresh token verification.
- `Admin` and `AdminSession` models were added to `prisma/schema.prisma`.
- Prisma client was regenerated successfully.
- Repositories, domain entities, service skeleton, and controller skeleton are in place.
- Admin token payload types were extended in `src/types/tokens.ts`.
- Admin auth routes were wired into `src/routes/v1/api.ts`.

## Rationale

- A dedicated admin domain fulfills the spec requirement for strict separation between admin accounts and regular platform users.
- Reusing admin session semantics avoids unnecessary duplication of session lifecycle and revocation logic.
- Existing admin authorization middleware should be mirrored with admin-specific middleware, not merged into the user auth path.
- The current `User` model already supports roles and authorization checks, but it is not aligned with the desired dedicated admin domain.

## Risk and Impact

- **Risk**: Introducing a separate admin domain requires careful routing and middleware separation to avoid accidental reuse of user authentication paths.
- **Mitigation**: Use clear admin token types, dedicated `authenticateAdminAccess`/`authenticateAdminRefresh` middleware, and separate admin route prefixes such as `/api/v1/admin/auth`.
- **Impact**: The change is localized to admin auth, while the broader user authentication flows remain intact.

## Next Steps

1. Define the admin Prisma schema and generate the client.
2. Add `Admin` and `AdminSession` repositories and domain entities.
3. Implement dedicated admin auth service and controller with username/password login.
4. Create admin authorization middleware, including `authorizeAdminRole` and `authorizeSuperAdmin`.
5. Add admin audit logging for login, logout, creation, updates, role changes, and forced logouts.
6. Add Zod schemas and Swagger docs for admin auth and admin management endpoints.
7. Update progress documentation and create the implementation plan.
