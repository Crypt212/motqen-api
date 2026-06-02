Financial Module Refactor & Hardening

Required Reading

Before starting:

Read:

- docs/specs/admin/*
- docs/specs/audits/*
- docs/specs/progress/*

Do not re-audit areas already documented unless implementation changes require it.

---

Objective

Review, harden, and refactor the Financial module implementation to align with the project's architecture standards while preserving existing business behavior.

This is NOT a rewrite.

The goal is to:

- improve maintainability
- improve testability
- reduce controller complexity
- improve validation coverage
- improve transaction safety
- improve error handling consistency
- remove duplicated business logic
- prepare the module for future queue-based automation

while preserving all currently working payment flows.

---

Important Restrictions

Payment Flow

The following areas are considered production-critical and must not be rewritten unless a confirmed defect is discovered:

- payment link creation
- payment intention creation
- webhook processing
- payment provider integration

Audit them only for obvious defects.

Do not redesign them.

---

Existing Architecture

The project already contains:

- Controllers
- Services
- Repositories
- Repository Interfaces
- Redis Cache Layer
- Zod Validation
- OpenAPI Generation
- AppError
- SuccessResponse
- AsyncHandler

Reuse existing patterns.

Do not introduce a second architecture style.

---

Scope

Review and refactor only where necessary.

Primary focus:

- WithdrawRequest
- Refund
- WorkerDebt
- EscrowHold
- Financial Admin Operations

Out of scope unless bug fixes are required:

- Payment
- PaymentAttempt
- PayoutExecution
- WorkerBalance

FeeRule and logs should only be modified when required by the refactor.

---

Architecture Rules

Every endpoint must follow:

Route
→ Validation Middleware
→ Controller
→ Service
→ Repository Interface
→ Repository

Controllers must never directly call Prisma.

Controllers must never contain business logic.

Repositories must never contain HTTP concerns.

Services must remain framework-independent.

---

Validation Standard

Every endpoint accepting:

- body
- params
- query

must use Zod validation.

Validation must occur before controller execution.

No manual request validation inside controllers.

Reuse existing validation middleware.

Generate OpenAPI definitions from Zod schemas where applicable.

---

Controller Standards

Controllers should only:

- extract validated request data
- invoke service methods
- return SuccessResponse

Controllers should not:

- execute Prisma queries
- contain transaction logic
- contain financial calculations
- contain balance calculations
- contain escrow calculations

---

Service Standards

Services are responsible for:

- business rules
- authorization decisions
- transaction orchestration
- workflow validation
- state transitions

Services should be testable in isolation through repository interfaces.

---

Repository Standards

Repositories should contain:

- Prisma access
- persistence logic
- query composition

Repositories should not:

- perform business decisions
- calculate financial outcomes
- contain authorization logic

Ensure all repositories implement existing interfaces.

Create missing interfaces only when required.

---

Transaction Safety Review

Audit all financial write operations.

Verify:

- refunds
- escrow releases
- debt creation
- debt settlement
- withdraw processing

execute within appropriate Prisma transactions.

Transactions should remain orchestrated from the service layer.

Do not move transaction ownership into repositories.

---

Error Handling Standard

Replace inconsistent error handling with project standards.

Use:

- AppError
- Prisma error mapping
- existing error utilities

Avoid:

- raw Error throws
- string throws
- generic catch blocks returning custom JSON

Controllers must use:

- AsyncHandler
- SuccessResponse

Maintain consistent response contracts.

---

Escrow Review

Audit EscrowHold workflows.

Verify:

- invalid state transitions are blocked
- duplicate releases are impossible
- duplicate refunds are impossible
- idempotency is respected

Document and fix any discovered issues.

---

Refund Review

Audit refund implementation.

Verify:

- duplicate refund execution protection
- transaction safety
- debt creation consistency
- escrow state synchronization

Document and fix discovered issues.

---

Worker Debt Review

Audit WorkerDebt workflows.

Verify:

- debt creation
- settlement tracking
- outstanding balance calculations

Identify hidden edge cases.

Fix only where required.

---

Withdraw Review

Audit WithdrawRequest workflows.

Verify:

- authorization
- state transitions
- idempotency
- transaction safety

Remove duplicated logic.

---

Auto Release Preparation

Do not implement BullMQ.

Do not implement queues.

Prepare the module for future automation.

Create a dedicated service abstraction for escrow release scheduling if one does not already exist.

Example responsibilities:

- determine eligible escrow releases
- release execution orchestration

The service must be callable later by:

- BullMQ jobs
- cron jobs
- manual admin actions

without refactoring business logic again.

---

Code Quality Review

Identify and refactor:

- duplicated financial logic
- duplicated validation
- duplicated state transition checks
- duplicated authorization checks

Extract reusable helpers only where repetition exists.

Avoid unnecessary abstractions.

---

Security Review

Verify:

- admin-only financial operations
- role restrictions
- ownership checks where applicable
- idempotency protection
- race condition protection

Fix discovered vulnerabilities.

---

OpenAPI

Ensure all reviewed endpoints:

- use Zod schemas
- generate accurate OpenAPI definitions
- document success responses
- document error responses

---

Verification Checklist

- Build passes.
- Prisma generation passes.
- Existing payment flow remains operational.
- Existing webhook flow remains operational.
- Controllers contain no business logic.
- Services contain workflow orchestration.
- Repositories contain persistence logic only.
- Repository interfaces are respected.
- Zod validation covers all financial endpoints.
- AsyncHandler used consistently.
- SuccessResponse used consistently.
- AppError used consistently.
- Financial write operations are transaction-safe.
- Escrow workflows audited.
- Refund workflows audited.
- Withdraw workflows audited.
- Worker debt workflows audited.
- Auto-release service abstraction prepared.
- OpenAPI documentation updated.
- No unnecessary rewrites performed.