# Admin Issues Ownership & Verification Workflow

## Required Reading

Before starting:

Read:

- docs/specs/admin/*
- docs/specs/audits/*
- docs/specs/progress/*

Do not re-audit areas already documented unless implementation changes require it.

---

## Objective

Complete the remaining Admin Issues Management implementation using the existing RBAC foundation already implemented.

Important:

A significant portion of the required database structure and ownership system may already exist from previous specs and implementations.

Before adding any new schema fields, services, repositories, controllers, routes, or business logic:

- Review the current implementation.
- Reuse existing functionality whenever it already satisfies the requirements below.
- If an existing implementation partially satisfies a requirement, modify it instead of creating duplicate functionality.
- Do not introduce parallel ownership systems, assignment systems, verification workflows, or issue tracking models.

The goal is to align the implementation with the requirements below, not to recreate functionality that already exists.

---

# Functional Requirements

## Issue Ownership

Applies to:

- Report
- Dispute
- WorkerVerification

Ownership is tracked through:

- assignedDepartment
- assignedAdminId

Current owner is determined from assignedAdminId.

---

## Assignment Rules

### Claim

An issue without an assigned owner may be claimed by an eligible admin from the responsible department.

Effects:

- assignedAdminId = current admin
- assignedDepartment remains unchanged
- ownership becomes exclusive

Only one owner may exist at a time.

---

### Transfer To Another Admin

Allowed only when:

- current admin owns the issue

Effects:

- ownership moves to target admin
- previous owner loses ownership

Assignment history must be recorded.

---

### Transfer To Another Department

Allowed only when:

- current admin owns the issue

Effects:

- assignedAdminId becomes null
- assignedDepartment becomes target department

The receiving department must explicitly claim the issue.

Assignment history must be recorded.

---

### Return / Unassign

Allowed only when:

- current admin owns the issue

Effects:

- assignedAdminId = null
- issue remains assigned to its current department

Assignment history must be recorded.

---

## Department Visibility

Admins may only view issues belonging to:

- their department
- SUPER_ADMIN access

Ownership is not required for list visibility.

Ownership is required for actions.

Example:

USER_MANAGEMENT admin can see:

- verification queue
- reports assigned to USER_MANAGEMENT
- disputes assigned to USER_MANAGEMENT

but may only act on issues they currently own.

---

## Ownership Enforcement

The following actions require ownership:

### Reports

- status changes
- moderation actions
- resolution actions

### Disputes

- status changes
- resolution actions
- evidence review decisions

### Worker Verifications

- approve
- reject
- request additional information
- status modifications

SUPER_ADMIN bypasses ownership restrictions.

---

# Assignment Notes

## Purpose

Assignment notes are internal handover notes.

They are not user-visible.

They exist to help departments and admins continue work after ownership changes.

---

## Requirements

Support:

- add note
- list notes

Applies to:

- Report
- Dispute
- WorkerVerification

Each note stores:

- targetType
- targetId
- authorAdminId
- content
- createdAt

Use existing implementation if already present.

Do not create a duplicate note system.

---

# Assignment History

Track ownership events.

Supported events:

- CLAIMED
- TRANSFERRED_ADMIN
- TRANSFERRED_DEPARTMEN
- UNASSIGNED

Each event should capture:

- targetType
- targetId
- previousAdminId
- newAdminId
- previousDepartment
- newDepartment
- actorAdminId
- createdAt
- optional note

Use existing history implementation if available.

Do not introduce a second history mechanism.

---

# Verification Workflow

## Department Ownership

WorkerVerification issues belong to:

USER_MANAGEMENT

Future departments may be introduced later.

Do not hardcode assumptions that prevent future department expansion.

---

## Approval Endpoint

Add admin endpoint:

POST /api/v1/admin/verifications/:verificationId/approve

Requirements:

- authenticated admin
- USER_MANAGEMENT or SUPER_ADMIN
- ownership required unless SUPER_ADMIN
- verification must be pending

Effects:

- verification status becomes APPROVED
- ownership remains unchanged
- audit log recorded

Return updated verification.

---

## Rejection Endpoint

If not already implemented and compliant with existing specs:

POST /api/v1/admin/verifications/:verificationId/reject

Requirements:

- authenticated admin
- USER_MANAGEMENT or SUPER_ADMIN
- ownership required unless SUPER_ADMIN

Payload:

```json
{
  "rejectionReasons": [],
  "rejectionNote": ""
}

Effects:

status = REJECTED

rejectionReasons stored

rejectionNote stored

audit log recorded


Return updated verification.


---

Admin Discovery Endpoint

Required for assignment UI.

Add endpoint:

GET /api/v1/admin/admins/available

Purpose:

Allow ownership transfer screens to retrieve eligible admins.

Response should include:

id

firstName

lastName

username

role

status


Future online availability handling will be implemented separately through socket presence tracking.

Do not implement presence logic in this spec.

Use existing admin structures where possible.


---

Issue Assignment Endpoints

Ensure support for:

Claim

POST /api/v1/admin/issues/claim


---

Transfer To Admin

POST /api/v1/admin/issues/transfer-admin

Requirements:

same department transfer

owner only



---

Transfer To Department

POST /api/v1/admin/issues/transfer-department

Requirements:

owner only

ownership cleared



---

Unassign

POST /api/v1/admin/issues/unassign

Requirements:

owner only



---

Audit Logging

All assignment operations must generate audit records.

Examples:

ISSUE_CLAIMED

ISSUE_TRANSFERRED_ADMIN

ISSUE_TRANSFERRED_DEPARTMENT

ISSUE_UNASSIGNED

VERIFICATION_APPROVED

VERIFICATION_REJECTED


Reuse existing audit infrastructure.

Do not create a new audit logging mechanism.


---

Swagger

Document:

assignment endpoints

verification approval endpoint

verification rejection endpoint

admin discovery endpoint

ownership requirements

role requirements



---

Verification Checklist

Build passes.

Prisma generation passes.

Existing assignment implementation reviewed before modifications.

No duplicate ownership system introduced.

No duplicate notes system introduced.

No duplicate history system introduced.

Department visibility enforced.

Ownership enforcement enforced.

Verification approval endpoint operational.

Verification rejection endpoint operational.

Assignment audit logs generated.

Swagger updated.