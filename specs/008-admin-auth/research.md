# Admin Authentication Research

**Feature**: Admin Authentication & Administration System
**Date**: 2026-06-01

## Decision

Implement a dedicated admin identity domain with separate `Admin` and `AdminSession` models. Reuse the existing access/refresh token lifecycle and session revocation semantics, but keep admin credentials and session state logically distinct from the regular `User` domain.

## Rationale

- The spec explicitly requires that admin accounts be separate from `User`, `ClientProfile`, and `WorkerProfile` domains.
- Existing `User.role === 'ADMIN'` checks are insufficient for strict separation and risk mixing admin identity with normal platform users.
- Reusing the existing session/token architecture minimizes duplication and preserves proven refresh/revoke behavior.
- Immediate session revocation on disablement reduces risk and aligns with the admin security model.

## Alternatives Considered

- Reuse the existing `User` model with `role: ADMIN`.
  - Rejected because it violates domain separation and makes audit/authorization harder to enforce cleanly.
- Use the existing `Session` table for admin sessions.
  - Rejected because it mixes admin session semantics with user sessions and complicates any future admin-specific session policies.
- Introduce only admin token differentiation without a dedicated `AdminSession` model.
  - Rejected because the feature requires force logout and immediate disablement, which are safer with a dedicated session store.

## Existing Infrastructure to Reuse

- `AuthService`, `AuthController`, and middleware patterns for token verification and authenticated request handling.
- `verifyHeaderToken` and token utilities in `src/utils/tokens.ts` for access and refresh verification.
- `ActivityLog` and audit logging conventions for recording admin actions.
- Zod/OpenAPI documentation patterns in `src/docs/paths/v1/` and centralized Swagger registration.

## Key Clarifications

- Admin authentication is username/password only; no OTP or phone-based login for admins.
- Disabled admins must have all active admin sessions revoked immediately.
- Exactly one `SUPER_ADMIN` account is enforced by business rules, not by reusing a regular `User` account.
- Admin roles should include `SUPER_ADMIN`, `USER_MANAGEMENT`, `FINANCIAL_MONITOR`, and `ISSUES_MANAGEMENT`.

## Implementation Impact

- The current user auth flow remains intact and unaffected.
- New admin endpoints will live under an admin route prefix such as `/api/v1/admin/auth`.
- Existing Swagger/OpenAPI generation will be extended to include admin auth contracts.
