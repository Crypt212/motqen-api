# Admin Authentication Data Model

## Entities

### Admin

Represents a dedicated admin account.

- `id`: UUID
- `username`: string, unique, case-insensitive
- `passwordHash`: string (bcrypt)
- `firstName`: string
- `lastName`: string
- `profileImageUrl`: string? (optional)
- `role`: enum(`SUPER_ADMIN`, `USER_MANAGEMENT`, `FINANCIAL_MONITOR`, `ISSUES_MANAGEMENT`)
- `status`: enum(`ACTIVE`, `DISABLED`)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### AdminSession

Represents an authenticated admin session.

- `id`: UUID
- `adminId`: UUID
- `token`: string, unique
- `deviceId`: string
- `isRevoked`: boolean
- `revokedAt`: DateTime?
- `revokedBy`: string? (admin id or system)
- `expiresAt`: DateTime
- `lastUsedAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

### AdminAuditLog (optional)

An admin action audit record may be stored either in a dedicated `AdminAuditLog` or in the existing `ActivityLog` table.

- `id`: UUID
- `actorId`: UUID
- `targetId`: UUID
- `actionType`: string
- `entityType`: string
- `entityId`: string
- `metadata`: Json?
- `createdAt`: DateTime

## Relationships

- `Admin` has many `AdminSession`
- `AdminSession` belongs to `Admin`
- `Admin` is the actor for audit trail records

## Validation Rules

- `username` must be unique and compared case-insensitively.
- `passwordHash` must be generated with bcrypt.
- `role` must be one of the approved admin roles.
- `status` must be `ACTIVE` or `DISABLED`.
- Disabling an admin must revoke all active sessions immediately.

## State Transitions

- `ACTIVE` → `DISABLED` when an admin is disabled.
  - Invalidate all existing `AdminSession` records for that admin.
- `DISABLED` → `ACTIVE` when an admin is re-enabled.
- `SUPER_ADMIN` role cannot be changed, disabled, or deleted.
- Password reset may optionally force logout of active sessions.

## Design Notes

- A dedicated admin domain ensures separation from the existing `User`/`Worker`/`Client` models.
- `AdminSession` is deliberately separated from `Session` to support admin-specific revocation, force logout, and audit semantics.
- `ActivityLog` can capture admin action events, avoiding duplicate financial log records and preserving existing audit infrastructure.
