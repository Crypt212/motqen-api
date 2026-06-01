Admin Permissions & RBAC

Required Reading

Before starting:

Read:

- docs/specs/admin/00-agent-rules.md
- docs/specs/admin/01-admin-auth.md
- docs/specs/admin/02-admin-logs-and-monitoring.md
- docs/specs/audits/\*
- docs/specs/progress/\*

Do not re-audit previously documented areas.

Reuse all existing infrastructure.

---

Objective

Implement a complete RBAC (Role Based Access Control) system for administrative operations.

The system must:

- protect admin endpoints
- control dashboard visibility
- control issue ownership
- control financial operations
- control user management operations
- support future expansion

---

Mandatory Audit Phase

Create:

docs/specs/audits/admin-rbac-audit.md

Document:

Existing Authorization

Identify:

- authorizeAdmin middleware
- role checks
- permission checks
- route protection patterns

Existing Admin Endpoints

Document:

- financial endpoints
- report endpoints
- verification endpoints
- user management endpoints
- moderation endpoints

Existing Dashboard Endpoints

Identify reusable authorization patterns.

Existing Notification Infrastructure

Document reusable notification mechanisms.

Existing Socket Infrastructure

Document reusable socket mechanisms.

Existing Redis Infrastructure

Document reusable redis mechanisms.

Final Decisions

Document all RBAC implementation decisions.

---

Roles

Only the following roles exist.

SUPER_ADMIN
USER_MANAGEMENT
FINANCIAL_MONITOR
ISSUES_MANAGEMENT

No additional roles should be introduced.

---

Super Admin

There is exactly one Super Admin.

The implementation must verify current codebase behavior and ensure:

Maximum 1 active SUPER_ADMIN

is enforced.

---

Super Admin Permissions

Super Admin bypasses all permission checks.

Super Admin can:

- create admins
- disable admins
- enable admins
- change admin roles
- force logout admins
- view all logs
- view all departments
- view all dashboards
- view all queues
- view all issues
- access all administrative areas

---

Role Changes

Role changes must take effect immediately.

Expected result:

- new requests use new permissions
- websocket notification is delivered when possible
- admin receives notification
- frontend refresh reflects new permissions

Implementation strategy must be documented.

Examples:

- cache invalidation
- session invalidation
- redis invalidation
- database lookups

Use the strategy most compatible with the existing codebase.

---

Permission Escalation

Forbidden:

Grant permissions outside assigned department

Examples:

User Management cannot gain:

- refunds
- payouts
- escrow release

Financial Monitor cannot gain:

- user banning
- verification approval

Issues Management cannot gain:

- payout execution
- withdrawal processing

---

Permission Reduction

Allowed.

Example:

USER_MANAGEMENT

may have some permissions disabled if future requirements require it.

Document implementation.

---

User Management Scope

User Management can access:

Users

- view users
- search users
- inspect users
- ban users
- unban users
- force logout users

Worker Verification

- view verification
- review verification
- approve verification
- reject verification
- request re-upload

Worker Profile Operations

- inspect worker profile
- inspect worker availability
- modify worker availability
- modify worker time slots

Administrative actions must be logged.

---

Verification Rejection

Verification rejection must support:

rejectionReasons[]
rejectionNote

Stored inside verification entities.

Do not create separate review entities unless existing architecture requires it.

Recommended reasons:

BLURRY_IMAGE
EXPIRED_ID
MISMATCHED_PERSON
MISSING_DOCUMENT
INVALID_DOCUMENT
OTHER

Final implementation may adjust names.

---

Financial Monitor Scope

Financial Monitor can access:

Refunds

- create refunds
- view refunds

Escrow

- release escrow
- inspect escrow

Withdrawals

- process withdrawal
- reject withdrawal

Payouts

- execute payout
- fail payout
- complete payout

Debts

- inspect worker debts
- settle worker debts

Financial Issues

- investigate payment-related reports
- investigate payment-related disputes

Financial Dashboard

- access financial monitoring dashboard

---

Issues Management Scope

Issues Management can access:

Reports

- view reports
- review reports
- update report status

Moderation

- review flagged messages
- investigate moderation cases

Investigations

- inspect issue details
- inspect evidence
- inspect attachments
- inspect notes
- inspect timeline

Support

- manage support queues
- manage support ownership

---

Issue Routing

Reports do not automatically belong to Issues Management.

Reports must be routed to departments.

Examples:

Verification issue
→ USER_MANAGEMENT

Payment issue
→ FINANCIAL_MONITOR

Moderation issue
→ ISSUES_MANAGEMENT

Initial routing may use:

- ProblemCategory
- ProblemType

Implementation should remain flexible.

---

Department Ownership

Issues belong to departments.

Recommended fields:

assignedDepartment
assignedAdminId

Implementation may adjust naming.

---

Queue Visibility

Admins can only access:

assignedDepartment = own department

or

assignedAdminId = current admin

Super Admin can access all.

---

Claiming Issues

Opening an issue does not automatically claim ownership.

Explicit claiming is required.

Recommended action:

Claim Issue

Implementation may use different naming.

---

Assignment Rules

Only one owner exists at a time.

Allowed:

assignedAdminId = single admin

Forbidden:

multiple active owners

---

Department Transfer

Allowed.

Example:

FINANCIAL_MONITOR
→
USER_MANAGEMENT

When transferred:

assignedDepartment = target department
assignedAdminId = null

Issue returns to department queue.

---

Admin Transfer

Allowed.

Example:

assignedDepartment = FINANCIAL_MONITOR
assignedAdminId = target admin

---

Automatic Unassignment

Transfers automatically remove previous ownership.

Forbidden:

Old owner

- New owner

simultaneously.

---

Issue Notes

Issues must support internal notes.

Notes are administrative only.

Users cannot access them.

Recommended structure:

IssueNote

Each note should contain:

- author
- note content
- timestamp

Notes must survive reassignment.

---

Assignment History

Issues must support assignment history.

Recommended structure:

IssueAssignmentHistory

or equivalent timeline mechanism.

Events should include:

- assigned
- reassigned
- transferred
- returned to queue
- reopened
- closed

---

Conversation Access

Private conversations are protected.

Admins do not automatically gain access.

Conversation access is allowed only when:

Issue is assigned to admin

and

Conversation is required for investigation

---

Conversation Access Restrictions

Allowed:

- read messages
- read negotiations
- read order context

Forbidden:

- edit messages
- delete messages
- modify negotiations
- impersonate users

Read-only access only.

---

Investigation Closure Rule

Access must be revoked when:

- issue resolved
- issue closed
- issue reassigned
- issue transferred
- issue returned to queue

---

Sensitive Access Logging

The following actions must create audit logs:

ADMIN_VIEWED_CONVERSATION
ADMIN_VIEWED_NEGOTIATION
ADMIN_VIEWED_VERIFICATION
ADMIN_VIEWED_PAYMENT_DETAILS

Additional events may be added.

---

Dashboard Visibility

Super Admin

Can view:

- all dashboards
- all queues
- all departments

User Management

Can view:

- user management dashboard

Financial Monitor

Can view:

- financial dashboard

Issues Management

Can view:

- moderation/support dashboard

---

Notifications

Administrative events should generate notifications where appropriate.

Examples:

- issue assigned
- issue transferred
- role changed
- admin disabled

Reuse existing notification infrastructure.

---

Redis

Evaluate redis usage for:

- queue counters
- dashboard counters
- active workload metrics

Avoid unnecessary database aggregations.

Document all caching decisions.

---

Swagger

All RBAC endpoints and updates must:

- use Zod schemas
- update Swagger/OpenAPI
- include permission documentation

---

Deliverables

Authorization

RBAC implementation.

Permissions

Department-level access control.

Ownership

Issue ownership and routing.

Visibility

Dashboard visibility enforcement.

Logging

Audit logging integration.

Documentation

Swagger/OpenAPI updated.

Audit

Updated:

docs/specs/audits/admin-rbac-audit.md

Progress

Updated:

docs/specs/progress/admin-rbac.md

---

Completion Criteria

Implementation is complete only when:

- roles exist
- permissions enforced
- ownership enforced
- routing implemented
- transfers implemented
- notes implemented
- assignment history implemented
- conversation access controlled
- audit logs generated
- dashboard visibility enforced
- swagger updated
- audit updated
- progress updated
- build passes
