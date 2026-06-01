# Admin Logs & Monitoring

## Required Reading

Before starting:

Read:

- docs/specs/admin/00-agent-rules.md
- docs/specs/admin/01-admin-auth.md
- docs/specs/audits/\*
- docs/specs/progress/\*

Do not re-audit areas already documented unless implementation changes require it.

---

# Objective

Introduce a dedicated Admin Audit Logging system.

The goal is to provide:

- Full admin action traceability
- Security monitoring
- Investigation support
- Operational accountability

This system is dedicated to admin activity only.

It must remain independent from:

- ActivityLog
- TransactionLog
- Financial entities

while allowing cross-referencing when needed.

---

# Mandatory Audit Phase

Before implementation create:

docs/specs/audits/admin-logs-audit.md

Document:

## Existing Logging

Identify:

- ActivityLog usage
- TransactionLog usage
- Existing log helpers
- Existing audit mechanisms

## Existing Admin Features

Identify actions that must generate logs.

## Existing Pagination Patterns

Document reusable pagination utilities.

## Existing Redis Usage

Identify reusable Redis infrastructure.

## Final Decision

Document:

- AdminAuditLog design
- Search strategy
- Retention strategy

---

# Business Requirements

## Dedicated Admin Audit Log

Create dedicated admin logging.

Recommended entity:

```text
AdminAuditLog
```

The implementation may choose a different name if justified.

This entity must not replace:

- ActivityLog
- TransactionLog

---

# Scope

AdminAuditLog stores:

- authentication actions
- administration actions
- moderation actions
- financial administration actions
- support operations

Only admin-originated actions.

---

# Log Immutability

Logs are immutable.

Forbidden:

- update log
- delete log

Logs are append-only.

---

# Severity

Supported severities:

```text
INFO
WARNING
CRITICAL
```

Examples:

INFO

- login
- logout
- create admin

WARNING

- disable account
- force logout
- verification rejection

CRITICAL

- password reset
- recovery action
- financial override actions

Final mapping may be adjusted if documented.

---

# Actor Information

Every log must contain:

- actor admin id
- actor username
- actor role

Store enough information for future investigation.

---

# Target Information

Every log should support:

- target entity type
- target entity id

Examples:

```text
User
WorkerProfile
Report
Dispute
WithdrawRequest
Admin
```

---

# Metadata

Support metadata object.

Examples:

```json
{
  "oldRole": "USER_MANAGEMENT",
  "newRole": "ISSUES_MANAGEMENT"
}
```

```json
{
  "oldStatus": "ACTIVE",
  "newStatus": "DISABLED"
}
```

---

# Financial Logging Rule

Financial entities already act as source of truth.

Examples:

- Payment
- EscrowHold
- Refund
- WithdrawRequest
- PayoutExecution
- WorkerDebt
- TransactionLog

Do not duplicate immutable financial data inside audit logs.

Store references instead.

Correct:

```json
{
  "entityType": "PayoutExecution",
  "entityId": "..."
}
```

Avoid:

```json
{
  "amount": 5000,
  "currency": "EGP"
}
```

unless operationally required and documented.

---

# IP Address Tracking

Store:

- IP address

when available.

If unavailable:

store null.

---

# User Agent Tracking

Store:

- user agent

when available.

If unavailable:

store null.

---

# Authentication Logs

Log:

- successful login
- failed login
- logout
- force logout
- password reset

---

# Admin Management Logs

Log:

- admin creation
- admin update
- role change
- admin enable
- admin disable

---

# User Management Logs

Future and current actions must support logging.

Examples:

- user suspension
- user activation
- worker approval
- worker rejection
- worker schedule modification

---

# Financial Administration Logs

Examples:

- payout started
- payout completed
- payout failed
- withdrawal rejection
- escrow release
- refund initiation
- debt settlement

Store references only.

---

# Issues Management Logs

Examples:

- report status update
- dispute resolution
- dispute information request
- evidence review

---

# Support Chat Events

Reserve support for future chat operations.

Prepare action definitions for:

```text
CHAT_ASSIGNED
CHAT_UNASSIGNED
CHAT_TRANSFERRED
CHAT_CLOSED
CHAT_PERMISSION_CHANGED
```

Implementation may defer usage until support chat spec is implemented.

---

# Search API

Provide admin log search.

Supported filters:

- action
- severity
- actorId
- targetType
- targetId
- startDate
- endDate

Search strategy must be documented.

Avoid expensive query patterns.

---

# Pagination

Pagination must follow project standards.

Return:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 100,
  "hasNext": true,
  "hasPrevious": false
}
```

Reuse existing pagination helpers whenever possible.

---

# Authorization

Visibility rules:

## SUPER_ADMIN

Can view all admin logs.

## USER_MANAGEMENT

Can view logs relevant to user-management operations.

## FINANCIAL_MONITOR

Can view logs relevant to financial operations.

## ISSUES_MANAGEMENT

Can view logs relevant to issue-management operations.

Implementation strategy must be documented.

---

# Monitoring Dashboard

Provide monitoring endpoints.

Recommended metrics:

- login count
- failed login count
- critical action count
- actions by admin
- actions by role

Avoid expensive aggregation queries.

Prefer:

- indexed queries
- cached summaries
- Redis where justified

Document decisions.

---

# Redis Optimization

Evaluate Redis usage.

Potential uses:

- dashboard counters
- recent activity cache
- monitoring widgets

Do not introduce caching without documenting:

- purpose
- invalidation strategy

in the audit file.

---

# Swagger Documentation

All endpoints must:

- use Zod schemas
- appear in Swagger/OpenAPI

Documentation must include:

- filters
- pagination
- permissions

---

# Deliverables

## Database

Admin audit log storage.

## Services

Admin audit logging service.

## APIs

Admin log listing and filtering.

## Monitoring

Dashboard monitoring endpoints.

## Security

Authentication activity logging.

## Documentation

Swagger/OpenAPI updated.

## Audit

Updated:

docs/specs/audits/admin-logs-audit.md

## Progress

Updated:

docs/specs/progress/admin-logs.md

---

# Completion Criteria

Implementation is complete only when:

- admin logs are stored
- logs are immutable
- authentication events are logged
- administration events are logged
- monitoring endpoints exist
- pagination works
- filtering works
- authorization works
- swagger is updated
- audit file is updated
- progress file is updated
- build passes
