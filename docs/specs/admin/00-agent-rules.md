# Motqen Admin Initiative - Agent Rules

## Purpose

This document defines the mandatory rules that all agents must follow while implementing the Admin System.

These rules apply to all admin-related specifications.

Failure to follow these rules may cause duplicated work, broken functionality, inconsistent APIs, or performance issues.

---

# Primary Objective

The goal is to add admin functionality while preserving all existing platform behavior.

Priority order:

1. Do not break existing functionality.
2. Reuse existing infrastructure.
3. Keep implementation simple.
4. Add new functionality.

A working simple solution is preferred over a complex architecture change.

---

# Branch Rules

IMPORTANT:

All admin specifications MUST be implemented on the SAME branch.

DO NOT create feature branches.

DO NOT create sub-branches.

DO NOT split work across multiple git branches unless explicitly instructed by the project owner.

The entire admin initiative is considered a single implementation stream.

---

# Single Branch Rule

- جميع الـ Specs الخاصة بالـ Admin Dashboard يتم تنفيذها على نفس الـ branch.
- لا يتم إنشاء branches إضافية إلا إذا طُلب ذلك صراحة.
- اعتبر أن جميع Specs جزء من نفس feature set وسيتم دمجها معًا.

---

# Existing Infrastructure First

Before creating any new component, search for existing implementations.

Always attempt to reuse:

- SuccessResponse
- AppError
- ValidationError
- Existing DTOs
- Existing Zod schemas
- Existing repositories
- Existing service classes
- Existing middleware
- Existing socket infrastructure
- Existing Redis infrastructure
- Existing notification services
- Existing dependency injection registrations
- Existing pagination helpers
- Existing utility functions

Do not duplicate infrastructure that already exists.

---

# Audit First Rule

قبل أي تعديل:

1. ابحث في الكود الحالي.
2. وثّق النتائج داخل:

   docs/specs/audits/<feature-name>-audit.md

3. سجل:
   - ما الموجود حاليًا
   - ما يمكن إعادة استخدامه
   - ما سيتم تعديله
   - المخاطر المحتملة

The audit MUST also document:

- Existing Models
- Existing Enums
- Existing Routes
- Existing Controllers
- Existing Services
- Existing Repositories
- Existing DTOs
- Existing Zod Schemas
- Existing Socket Events
- Existing Redis Usage
- Existing Swagger Integration
- Reusable Components
- Missing Components
- Files Expected To Change
- Files Expected To Be Added

Implementation MUST NOT begin until the audit is completed.

---

# Mandatory Audit Phase

Before implementation begins:

Create or update an audit file inside:

docs/specs/audits/

Example:

docs/specs/audits/admin-auth-audit.md

The audit MUST document:

## Existing Models

Relevant Prisma models already available.

## Existing Enums

Relevant enums already available.

## Existing Routes

Relevant routes already available.

## Existing Controllers

Relevant controllers already available.

## Existing Services

Relevant services already available.

## Existing Repositories

Relevant repositories already available.

## Existing DTOs

Relevant DTOs already available.

## Existing Zod Schemas

Relevant validation schemas already available.

## Existing Socket Events

Relevant socket implementation already available.

## Existing Redis Usage

Relevant Redis usage already available.

## Existing Swagger Integration

Current OpenAPI / Swagger generation approach.

## Reusable Components

Everything that can be reused.

## Missing Components

Everything that must be added.

## Files Expected To Change

Explicit list of files expected to be modified.

## Files Expected To Be Added

Explicit list of files expected to be created.

Implementation MUST NOT begin until the audit is completed.

---

# Audit Reuse Rules

Before scanning the codebase:

Check:

docs/specs/audits/

If a relevant audit already exists:

DO NOT repeat the same investigation.

Reuse previous findings.

Only inspect files directly related to the current feature.

Update existing audit files with new findings if necessary.

---

# Existing Knowledge Rule

Before performing any new audit:

Check:

- docs/specs/audits/\*
- docs/specs/progress/\*

Do not re-investigate parts of the codebase that have already been documented unless:

- the previous audit is outdated
- implementation changes require re-validation

Agents should reuse existing findings whenever possible.

---

# Progress Documentation

Every feature must maintain a progress file inside:

docs/specs/progress/

Example:

docs/specs/progress/admin-auth.md

After implementation update:

## Added Files

List all new files.

## Modified Files

List all modified files.

## Added APIs

List all new endpoints.

## Added Models

List all new Prisma models.

## Added Services

List all new services.

## Added Redis Keys

List all new Redis keys.

## Added Socket Events

List all new socket events.

## Added Migrations

List all new migrations.

## Notes For Future Specs

Anything future agents must know.

Progress files become the source of truth for future work.

---

# Documentation Sync Rule

After any API modification:

- Update Zod Schemas
- Update Swagger Registration
- Update OpenAPI Documentation

Any new endpoint is not complete until it appears in Swagger.

# Swagger Completion Rule

A task is NOT considered complete until:

- Zod schemas are updated
- Swagger/OpenAPI documentation is updated
- New endpoints appear in generated API documentation

This applies to every API-related spec.

Documentation must include:

- request body
- params
- query parameters
- response schema
- pagination schema
- authentication requirements
- authorization requirements

---

# Schema Change Rules

Before modifying:

- prisma/schema.prisma
- existing enums
- existing relations
- existing indexes

Create:

docs/specs/impacts/<change-name>.md

Document:

- affected APIs
- affected services
- affected repositories
- affected sockets
- affected cron jobs
- affected Swagger docs

No schema change may be implemented without impact analysis.

---

# Performance Rules

Avoid expensive aggregations.

Avoid loading large tables unnecessarily.

Avoid N+1 query patterns.

Prefer:

- indexed lookups
- targeted queries
- cached counters
- precomputed metrics
- efficient pagination

When introducing dashboard metrics:

Favor lightweight queries whenever possible.

Do not introduce expensive queries that may degrade production performance.

---

# Redis Rules

Before introducing polling or repeated database reads:

Evaluate whether Redis can be used.

Prefer Redis for:

- online admin status
- support queue counters
- dashboard counters
- chat presence
- typing indicators
- active assignment tracking

Document all Redis keys introduced.

Reuse existing Redis patterns whenever possible.

---

# Pagination Standard

In any new endpoint that supports pagination, the response MUST return:

{
"items": [],
"page": 1,
"limit": 20,
"total": 100,
"hasNext": true,
"hasPrevious": false
}

If the current system uses cursor pagination in the same domain:

- follow the existing cursor pattern
- document the reason in the audit

---

# Immutable Financial Data Rule

If data is stored inside an immutable financial entity such as:

- Payment
- EscrowHold
- Refund
- WithdrawRequest
- PayoutExecution
- TransactionLog
- WorkerDebt

Do not duplicate the same financial fields inside audit logs.

Store references only, for example:

{
"entityType": "PayoutExecution",
"entityId": "..."
}

Do not store repeated financial fields such as amount, currency, or transaction details unless there is a clear operational need documented in the audit.

---

# API Contract Rules

Do not modify existing response contracts unless required.

Do not rename existing fields.

Do not remove existing fields.

When changes are required:

- document the impact
- preserve backward compatibility whenever possible

Existing frontend integrations must continue working.

---

# Query and Index Rules

Whenever introducing:

- filtering
- sorting
- search
- dashboard metrics
- large list endpoints

Verify existing indexes.

Document:

- index reused
  or
- new index required

Avoid full table scans whenever possible.

---

# Migration Rules

Migration names must be descriptive.

Examples:

add_admin_table

add_admin_activity_logs

add_support_chat

add_verification_rejection_reasons

Avoid generic migration names.

---

# Documentation Rules

The project uses Zod-based API documentation generation.

Every API change MUST update documentation.

Required actions:

1. Update affected Zod schemas.
2. Add schemas for all new endpoints.
3. Register schemas in the documentation system.
4. Ensure Swagger/OpenAPI output is updated.

Documentation must include:

- request body
- params
- query parameters
- response schema
- pagination schema
- authentication requirements
- authorization requirements

No API work is complete until documentation is updated.

---

# Completion Checklist

Before marking a task complete verify:

[ ] Audit completed

[ ] Existing infrastructure reused where possible

[ ] Models updated

[ ] Repositories updated

[ ] Services updated

[ ] Controllers updated

[ ] Routes updated

[ ] Validation schemas updated

[ ] Swagger/OpenAPI updated

[ ] Redis usage documented

[ ] Socket events documented

[ ] Impact analysis updated (if applicable)

[ ] Progress file updated

[ ] Existing functionality verified

[ ] Build passes

[ ] Tests pass if applicable

---

# Required Reading Order

Before any implementation:

1. Read:

docs/specs/admin/00-agent-rules.md

2. Read:

docs/specs/audits/\*

3. Read:

docs/specs/progress/\*

4. Read the current feature specification.

Only then begin planning and implementation.
