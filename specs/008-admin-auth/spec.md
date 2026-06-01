# Feature Specification: Admin Authentication & Administration System

**Feature Branch**: `008-admin-auth`
**Created**: 2026-06-01
**Status**: Draft
**Input**: Admin authentication and administration requirements from `docs/specs/admin/01-admin-auth.md`

## Clarifications

### Session 2026-06-01

- Q: Should disabling an admin immediately invalidate active sessions? → A: Yes, revoke active admin sessions immediately upon disablement.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin authentication and status control (Priority: P1)

Admins must be able to log in using a dedicated admin account and only access admin functionality when their status is ACTIVE.

**Why this priority**: This is the foundation of the admin domain and must work before any administration features can be used.

**Independent Test**: Verify that a valid admin can authenticate, that a disabled admin cannot authenticate, and that login attempts create the expected audit records.

**Acceptance Scenarios**:

1. **Given** an ACTIVE admin account, **when** the admin submits a correct username and password, **then** the system authenticates the admin, creates a session/token, returns authentication details, and logs the login action.
2. **Given** a DISABLED admin account, **when** the admin submits valid credentials, **then** the system rejects the login and logs the failed login action.
3. **Given** an admin account, **when** the admin logs out or is force logged out, **then** the active session(s) are invalidated and the action is recorded.

---

### User Story 2 - Admin management and role assignment (Priority: P1)

A SUPER_ADMIN must be able to create admins, see admin details, and manage status and role assignments.

**Why this priority**: Admin creation and role control are the core management capabilities for the admin domain.

**Independent Test**: Verify that a SUPER_ADMIN can create a new admin, list admins, update a profile, change a role, and that each action generates audit logs.

**Acceptance Scenarios**:

1. **Given** a SUPER_ADMIN, **when** they create a new admin with a unique username, **then** the system saves the admin with a hashed password, returns the new profile, and logs the creation.
2. **Given** a SUPER_ADMIN, **when** they update an admin's first name, last name, or profile image, **then** the changes are persisted and an update audit log is created.
3. **Given** a SUPER_ADMIN, **when** they change an admin's role, **then** the role is updated and a role change audit record is created.
4. **Given** a SUPER_ADMIN, **when** they retrieve the admin list, **then** the system returns paginated results with `hasNext` and `hasPrevious`.

---

### User Story 3 - Super Admin protection and recovery (Priority: P2)

The system must protect the Super Admin account and provide a recovery mechanism that can restore access safely.

**Why this priority**: Super Admin recovery ensures the admin domain remains secure and recoverable without weakening protections.

**Independent Test**: Verify that Super Admin restrictions are enforced, that recovery can reset access, and that recovery actions are audited.

**Acceptance Scenarios**:

1. **Given** the Super Admin account, **when** a SUPER_ADMIN attempts to disable or delete it, **then** the request is rejected.
2. **Given** a Super Admin recovery path, **when** the recovery action is executed, **then** the Super Admin password is reset, active sessions are invalidated if configured, and a recovery audit log is created.
3. **Given** a password reset request for another admin, **when** the SUPER_ADMIN enables force logout, **then** all of the target admin's active sessions are invalidated.

---

### Edge Cases

- Username collisions must be handled case-insensitively so `admin`, `ADMIN`, and `Admin` map to the same account.
- The system must enforce exactly one Super Admin and prevent any change that would disable, delete, or alter that Super Admin role.
- If a disabled admin still has active sessions, the implementation must invalidate those sessions immediately and prevent further access.
- Role change actions and sensitive management operations must always generate audit logs even when no state changes.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST authenticate admins using username and password only.
- **FR-002**: Admins MUST be separate from User, ClientProfile, and WorkerProfile domains.
- **FR-003**: The admin domain MUST support roles: `SUPER_ADMIN`, `USER_MANAGEMENT`, `FINANCIAL_MONITOR`, and `ISSUES_MANAGEMENT`.
- **FR-004**: Exactly one Super Admin MUST exist. The Super Admin MUST not be deletable, disabling is prohibited, and its role cannot be changed.
- **FR-005**: Admin profiles MUST include username, password hash, first name, last name, optional profile image, role, status, and timestamps.
- **FR-006**: Only `SUPER_ADMIN` MAY create new admins.
- **FR-007**: Admin usernames MUST be unique in a case-insensitive manner.
- **FR-008**: Passwords MUST be stored hashed; bcrypt MUST be used for verification and hashing.
- **FR-009**: The system MUST provide paginated admin listing with standard pagination fields and must include `hasNext` and `hasPrevious`.
- **FR-010**: SUPER_ADMIN MUST be able to update admin profile fields and change roles, with role changes logging audit details.
- **FR-011**: SUPER_ADMIN MUST be able to disable or enable an admin, with disabled admins prevented from authenticating and all active sessions revoked immediately.
- **FR-012**: SUPER_ADMIN MUST be able to reset an admin password, optionally forcing logout of all active sessions.
- **FR-013**: SUPER_ADMIN MUST be able to force logout all sessions of a target admin.
- **FR-014**: All admin actions MUST generate dedicated audit logs for login, logout, failed login, create, update, role change, disable, enable, password reset, and force logout.
- **FR-015**: The implementation MUST evaluate whether to reuse existing session architecture or introduce dedicated admin sessions, and document the decision in `docs/specs/audits/admin-auth-audit.md`.
- **FR-016**: The implementation MUST define reusable admin authorization middleware consistent with existing middleware architecture.
- **FR-017**: All new admin API endpoints MUST include Zod schemas, Swagger registration, and OpenAPI documentation.

### Key Entities _(include if feature involves data)_

- **Admin**: Represents an administrator account with `username`, hashed password, `firstName`, `lastName`, optional `profileImage`, `role`, `status`, and audit metadata.
- **AdminSession**: Represents an authenticated admin session or token state used to validate active sessions and force logout behavior.
- **AdminAuditLog**: Represents a recorded admin action capturing actor, target, action, entity type, entity ID, old/new state, IP, user agent, and timestamp.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Admins can authenticate successfully with username/password only, and disabled admins cannot authenticate.
- **SC-002**: `SUPER_ADMIN` can create, update, disable, enable, and reset passwords for admins, with enforced role restrictions.
- **SC-003**: Admin listing returns paginated results including `hasNext` and `hasPrevious`.
- **SC-004**: Super Admin protections are enforced: no delete, disable, or role change of the Super Admin account.
- **SC-005**: All administrative actions produce audit logs for the required events.
- **SC-006**: New admin endpoints are documented in Swagger/OpenAPI with request/response schemas and auth requirements.
- **SC-007**: Audit file and progress file are created and updated.

## Assumptions

- Existing authentication infrastructure, validation helpers, and response patterns will be reused where feasible.
- Existing audit logging utilities can be extended for admin action logging.
- Admin session behavior may reuse current JWT/session architecture if it minimizes risk and complexity; the audit will record the chosen strategy.
- The admin domain does not support OTP, phone login, or WhatsApp verification.
- The feature is implemented as part of the admin initiative without creating a separate git branch.
