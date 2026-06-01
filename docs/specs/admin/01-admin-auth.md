# Admin Authentication & Administration System

## Required Reading

Before starting:

Read:

- docs/specs/admin/00-agent-rules.md
- docs/specs/audits/\*
- docs/specs/progress/\*

---

# Objective

Introduce a dedicated Admin authentication and administration system.

The implementation must be completely separated from the existing User authentication flow.

The goal is to support:

- Admin login
- Admin session management
- Admin creation
- Admin role management
- Admin activation/deactivation
- Force logout
- Admin audit logging
- Super Admin recovery

while preserving all existing user functionality.

---

# Mandatory Audit Phase

Before implementation:

Create:

docs/specs/audits/admin-auth-audit.md

Document:

## Existing Authentication

Identify:

- JWT implementation
- Session implementation
- Token generation
- Refresh token flow
- Password hashing utilities
- Existing auth middleware

## Existing Reusable Components

Document reusable:

- repositories
- service patterns
- middleware
- response helpers
- validation helpers
- swagger integration

## Existing Logging

Identify:

- ActivityLog usage
- TransactionLog usage
- any existing audit logging helpers

## Existing Documentation System

Identify:

- Zod schemas
- Swagger registration flow
- OpenAPI generation

## Decision

Determine whether admin authentication should:

A) Reuse existing session architecture

or

B) Use dedicated admin session storage

Provide justification.

---

# Business Requirements

## Authentication Method

Admins authenticate using:

- username
- password

Only.

No:

- phone login
- OTP login
- WhatsApp verification

---

## Separate Admin Domain

Admins must not reuse User accounts.

Create a dedicated admin domain.

Admins are independent from:

- User
- ClientProfile
- WorkerProfile

---

# Roles

Supported roles:

```text
SUPER_ADMIN
USER_MANAGEMENT
FINANCIAL_MONITOR
ISSUES_MANAGEMENT
```

---

# Role Permissions

## SUPER_ADMIN

Full access.

Can:

- create admins
- disable admins
- enable admins
- change admin role
- reset passwords
- force logout admins
- access all admin modules

---

## USER_MANAGEMENT

Responsible for user administration.

Expected future scope:

- verification review
- worker approvals
- user suspension
- user bans
- worker schedule management

Must not receive financial permissions.

---

## FINANCIAL_MONITOR

Responsible for financial operations.

Expected future scope:

- withdrawals
- payouts
- escrow
- refunds
- financial disputes
- fee management

Must not receive user administration permissions.

---

## ISSUES_MANAGEMENT

Responsible for operational issues.

Expected future scope:

- reports
- support conversations
- operational investigations

Must not receive financial permissions.

---

# Admin Status

Supported statuses:

```text
ACTIVE
DISABLED
```

Only.

No deletion flow.

---

# Super Admin Rules

Exactly one Super Admin exists.

The system must enforce:

- Super Admin cannot be deleted
- Super Admin cannot be disabled
- Super Admin role cannot be changed
- Additional Super Admin accounts cannot be created

---

# Admin Profile

Admin must contain:

- username
- password hash
- first name
- last name
- optional profile image
- role
- status
- timestamps

Additional fields may be added if justified during audit.

---

# Admin Login

Provide admin login endpoint.

Behavior:

- validate credentials
- verify account status
- create session/token
- create audit log
- return authentication payload

Use bcrypt for password verification.

Reuse existing auth patterns whenever possible.

---

# Session Strategy

The implementation must evaluate:

- reuse current JWT/session architecture

or

- introduce admin-specific session storage

Decision must be documented in:

docs/specs/audits/admin-auth-audit.md

The chosen option must maximize reuse and minimize risk.

---

# Admin Creation

Only SUPER_ADMIN may create admins.

Required input:

- username
- password
- firstName
- lastName
- profileImage (optional)
- role

Requirements:

- unique username
- password hashing
- audit logging
- validation schema
- swagger documentation

---

# Admin Listing

Provide paginated admin listing.

Return:

- basic profile
- role
- status
- creation date

Pagination must follow project standards.

Include:

- hasNext
- hasPrevious

---

# Admin Details

Provide endpoint to retrieve:

- profile
- role
- status
- audit metadata

---

# Admin Update

SUPER_ADMIN may update:

- first name
- last name
- profile image
- role

Role changes must generate audit logs.

---

# Enable / Disable Admin

SUPER_ADMIN may:

- disable admin
- re-enable admin

Rules:

- cannot disable Super Admin
- disabling prevents login
- existing sessions should be handled according to implementation decision

All actions must be logged.

---

# Password Reset

Only SUPER_ADMIN may reset passwords.

Requirements:

- password hashing
- audit logging

Provide optional:

Force Logout Sessions

flag during password reset.

If enabled:

all sessions become invalid.

---

# Force Logout

SUPER_ADMIN may:

Force logout all sessions of a target admin.

Requirements:

- invalidate all active sessions
- create audit log
- document chosen implementation

---

# Username Rules

Usernames should be treated as case-insensitive.

Examples:

admin
ADMIN
Admin

must resolve to the same identity.

Implementation approach must be documented.

---

# Audit Logging

Create dedicated admin audit logging.

Every admin action must generate logs.

Minimum actions:

- login
- logout
- failed login
- create admin
- update admin
- role change
- disable admin
- enable admin
- password reset
- force logout

Recommended fields:

- actorId
- targetId
- action
- entityType
- entityId
- oldValues
- newValues
- ip
- userAgent
- timestamp

Reuse existing logging infrastructure whenever possible.

---

# Super Admin Recovery

Provide recovery mechanism.

Example:

admin recovery command

or

recovery script

Behavior:

- reset Super Admin password
- optionally rotate username
- invalidate active sessions
- generate security audit log

Implementation details may vary according to project structure.

Must use bcrypt hashing.

Must not store plain-text passwords.

---

# Authorization Middleware

Introduce reusable admin authorization.

Expected usage:

- authenticate admin
- authorize role

Implementation must remain consistent with existing middleware architecture.

---

# API Documentation

All new endpoints must:

- define Zod schemas
- register schemas
- appear in Swagger/OpenAPI

Documentation must include:

- authentication requirements
- authorization requirements
- request schemas
- response schemas

---

# Deliverables

Expected output:

## Database

Admin domain implementation.

## Authentication

Admin login flow.

## Authorization

Role-based access control.

## Audit Logging

Admin activity logging.

## Recovery

Super Admin recovery command.

## Documentation

Updated Swagger/OpenAPI.

## Audit

Updated:

docs/specs/audits/admin-auth-audit.md

## Progress

Updated:

docs/specs/progress/admin-auth.md

---

# Completion Criteria

Implementation is complete only when:

- admin authentication works
- role authorization works
- super admin protections exist
- admin creation works
- admin disabling works
- password reset works
- force logout works
- audit logs exist
- swagger is updated
- audit file is updated
- progress file is updated
- build passes
