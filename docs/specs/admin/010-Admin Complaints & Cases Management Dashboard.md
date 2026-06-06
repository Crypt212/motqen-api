# Admin Complaints & Cases Management Dashboard

## Required Reading

Before starting:

Read:

* docs/specs/admin/*
* docs/specs/audits/*
* docs/specs/progress/*
* src/routes/v1/admin/*
* src/routes/v1/financial/*
* Existing Reports implementation
* Existing Disputes implementation
* Existing Withdraw Requests implementation
* Existing Verification implementation
* Existing Issue Ownership implementation
* Existing Admin RBAC implementation

Review all related controllers, services, repositories, DTOs, validators, Swagger docs, and audit infrastructure before making changes.

Do not reimplement functionality that already exists.

---

## Objective

Implement the Admin Complaints & Cases dashboard.

This dashboard acts as the central place where admins manage all issues occurring within the platform.

Important:

The system already contains multiple issue-like entities:

* Reports
* Disputes
* Verification Reviews
* Withdrawal Problems
* Financial Cases

The dashboard must unify visibility and management of these cases without creating a second issue system.

Reuse existing entities whenever possible.

Do not create duplicate complaint models.

---

# Case Categories

The dashboard should aggregate existing issue sources into a unified admin view.

Supported categories:

## ACCOUNT_ISSUE

Examples:

* worker verification rejected
* account suspension review
* user report
* worker misconduct report
* client misconduct report

Source:

* Report
* WorkerVerification

Department:

USER_MANAGEMENT

---

## FINANCIAL_ISSUE

Examples:

* withdrawal problem
* payout issue
* refund issue
* payment dispute
* escrow issue

Source:

* WithdrawRequest
* Refund
* Escrow
* Payment
* Financial reports

Department:

FINANCIAL_MONITOR

---

## DISPUTE_CASE

Examples:

* worker/client conflict
* service dispute
* quality dispute

Source:

* Dispute

Department:

ISSUES_MANAGEMENT

---

## Visibility Rules

### USER_MANAGEMENT

Can only see:

* ACCOUNT_ISSUE

Cannot see:

* financial cases
* dispute cases

---

### FINANCIAL_MONITOR

Can only see:

* FINANCIAL_ISSUE

Cannot see:

* account cases
* dispute cases

---

### ISSUES_MANAGEMENT

Can only see:

* DISPUTE_CASE

Cannot see:

* account cases
* financial cases

---

### SUPER_ADMIN

Can see all cases.

Can filter all departments.

Can perform all actions.

---

# Cases Listing

Add endpoint:

GET /api/v1/admin/cases

Purpose:

Unified dashboard listing.

The frontend should not need to call multiple endpoints.

---

## Response Fields

Each row should include:

* caseId
* caseType
* department
* assignedAdminId
* title
* summary
* status
* createdAt
* updatedAt
* priority (if available)
* sourceEntityType
* sourceEntityId

---

# Filters

Support:

## Status

Using existing statuses where applicable.

Examples:

* PENDING
* OPEN
* UNDER_REVIEW
* RESOLVED
* REJECTED
* CANCELLED

Normalize only at API response level.

Do not duplicate enums.

---

## Case Type

Support:

* ACCOUNT_ISSUE
* FINANCIAL_ISSUE
* DISPUTE_CASE

---

## Assigned State

Support:

* assigned
* unassigned

---

## Assigned Admin

Filter by:

assignedAdminId

---

## Date Range

Support:

* createdFrom
* createdTo

---

## Search

Support text search.

Search should include:

* worker name
* client name
* report title
* report description
* dispute identifiers
* verification identifiers

Reuse existing search logic if available.

---

# Case Details

Add endpoint:

GET /api/v1/admin/cases/:caseType/:caseId

Purpose:

Return full details for dashboard inspection.

---

## Account Issues

Must return:

### Report Information

* report details
* status
* category
* problem type
* description

### Reporter Information

* user information

### Target Information

* reported entity information

### Attachments

* report images

### Assignment Information

* owner
* department
* notes
* history

---

## Financial Issues

Must return:

### Financial Context

* payment details
* withdrawal details
* refund details
* escrow details

### Related Users

* worker
* client

### Administrative Actions

* payout history
* refund history
* activity logs

### Assignment Information

* owner
* department
* notes
* history

---

## Dispute Cases

Must return:

### Dispute Information

* dispute status
* evidence
* timeline

### Related Order

* order details

### Participants

* worker
* client

### Messages

* dispute messages

### Assignment Information

* owner
* department
* notes
* history

---

# Assignment Integration

Reuse existing ownership system.

Do not create a second assignment system.

The dashboard must integrate with:

* claim
* transfer admin
* transfer department
* unassign

using existing endpoints.

---

# Available Actions

## USER_MANAGEMENT

Can:

* claim case
* transfer case
* approve verification
* reject verification
* update report status
* suspend users
* reactivate users

Reuse existing functionality.

---

## FINANCIAL_MONITOR

Can:

* claim case
* transfer case
* process withdrawal
* approve payout
* reject payout
* review refunds
* review escrow cases

Reuse existing financial services.

---

## ISSUES_MANAGEMENT

Can:

* claim case
* transfer case
* request information
* resolve disputes
* close disputes

Reuse existing dispute services.

---

## SUPER_ADMIN

Can perform all actions.

---

# Withdrawal Problem Handling

When case type is FINANCIAL_ISSUE and source is WithdrawRequest:

Return:

* withdrawal request
* worker information
* payout method
* amount
* status
* payout execution

If proof of transfer exists:

Return proof image URL.

Reuse existing payout execution implementation.

Do not create duplicate payout workflows.

---

# Assignment Notes

Reuse existing assignment notes implementation.

Support:

* list notes
* add note

Do not create a second note system.

---

# Assignment History

Reuse existing ownership history implementation.

Support:

* claim events
* transfer events
* unassign events

Do not create a duplicate history mechanism.

---

# Dashboard Metrics

Add endpoint:

GET /api/v1/admin/cases/stats

Return counts based on admin role.

Examples:

* total cases
* open cases
* assigned cases
* unassigned cases
* resolved cases

SUPER_ADMIN receives all counts.

Department admins receive department-scoped counts only.

---

# Audit Logging

Generate audit records for:

* CASE_VIEWED
* CASE_CLAIMED
* CASE_TRANSFERRED
* CASE_UNASSIGNED
* CASE_RESOLVED
* VERIFICATION_APPROVED
* VERIFICATION_REJECTED
* PAYOUT_COMPLETED
* PAYOUT_REJECTED

Reuse existing audit infrastructure.

Do not create a second audit mechanism.

---

# Swagger

Document:

* cases listing
* filters
* details endpoint
* statistics endpoint
* role visibility rules
* assignment integration

Document department restrictions.

Document ownership requirements.

---

# Verification Checklist

* Build passes.
* Existing reports implementation reviewed.
* Existing disputes implementation reviewed.
* Existing verification implementation reviewed.
* Existing withdrawal implementation reviewed.
* Existing ownership system reused.
* No duplicate complaint model introduced.
* No duplicate assignment system introduced.
* No duplicate notes system introduced.
* No duplicate history system introduced.
* Department visibility enforced.
* Dashboard listing operational.
* Case details operational.
* Statistics endpoint operational.
* Audit logs generated.
* Swagger updated.
