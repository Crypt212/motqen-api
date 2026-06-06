# Admin Withdrawal Processing Dashboard

## Required Reading

Before starting:

Read:

* docs/specs/admin/*
* docs/specs/audits/*
* docs/specs/progress/*
* src/routes/v1/admin/*
* Existing Users implementation
* Existing WorkerProfile implementationS
* Existing ClientProfile implementation
* Existing Verification implementation
* Existing Sessions implementation
* Existing Locations implementation
* Existing Notifications implementation

Additionally:

Review the existing Admin implementation before making any changes.

Mandatory review:

* src/routes/v1/admin/*
* every controller used by those routes
* every service used by those controllers
* every repository used by those services
* existing admin validation schemas
* existing admin swagger patterns
* existing SuccessResponse usage
* existing AppError usage
* existing audit logging implementation
* existing financial services implementation

Important:

Do not assume missing functionality.

Inspect the current codebase first.

A significant portion of withdrawals, payout execution, worker balances, payout methods, audit logs, and financial workflows may already exist.

Reuse existing implementations whenever possible.

Do not introduce parallel withdrawal workflows.

Do not introduce duplicate payout execution systems.

Do not introduce duplicate proof-of-payment systems.

---

# Objective

Complete the Admin Withdrawal Processing workflow.

Current business flow:

1. Worker earns money.
2. Worker adds payout method.
3. Worker submits withdrawal request.
4. Admin reviews request.
5. Admin manually transfers funds externally.
6. Admin uploads proof of transfer.
7. Admin marks payout as completed.

The dashboard must expose all required information for processing withdrawals manually.

---

# Existing Flow Review

Before implementation:

Review:

* WithdrawRequest
* PayoutExecution
* WorkerBalance
* PayoutMethod
* WithdrawalService
* existing admin withdrawal routes

Determine:

* what already exists
* what is partially implemented
* what is missing

Modify existing implementation instead of replacing it.

---

# Withdrawal Requests Listing

Review existing endpoint.

If insufficient:

Extend existing endpoint.

Required endpoint:

GET /api/v1/admin/withdraw-requests

Purpose:

Display all withdrawal requests in admin dashboard.

---

## Required Response Data

Each item must include:

Withdrawal Information:

* withdrawRequestId
* amount
* status
* createdAt

Worker Information:

* workerProfileId
* worker full name
* phone number

Payout Method:

* payoutMethodType
* accountName
* accountNumber
* bankName

Processing Information:

* processedBy
* admin notes

Execution Information:

* payoutExecutionId
* execution status
* executedAt
* completedAt

Proof Information:

* proofOfPaymentUrl

---

# Filters

Support:

## Status

* PENDING
* IN_PROGRESS
* COMPLETED
* FAILED
* CANCELLED

---

## Date Range

Filter by:

* createdFrom
* createdTo

---

## Worker Search

Search by:

* worker name
* phone number

Case-insensitive.

---

# Withdrawal Details Screen

Add endpoint:

GET /api/v1/admin/withdraw-requests/:requestId

Purpose:

Retrieve full withdrawal details.

---

## Response Includes

Worker Information:

* full name
* phone number

Balance Information:

* total earned
* withdrawn
* pending withdraw

Withdrawal Information:

* amount
* status
* createdAt

Payout Method Information:

* payout method type
* account name
* account number
* bank name

Execution Information:

* execution status
* external reference
* proof image

Audit History:

* related withdrawal activity logs

---

# Start Processing

Review existing implementation first.

If endpoint already exists:

Extend if necessary.

Endpoint:

POST /api/v1/admin/withdraw-requests/:requestId/start-processing

Requirements:

* FINANCIAL_MONITOR
* SUPER_ADMIN

Effects:

* status becomes IN_PROGRESS
* payout execution created if needed
* processing admin recorded
* audit log generated

Return updated request.

---

# Complete Withdrawal

This is the primary missing dashboard workflow.

Review current implementation first.

Modify existing implementation if possible.

---

## Endpoint

POST /api/v1/admin/payout-executions/:executionId/complete

Requirements:

* FINANCIAL_MONITOR
* SUPER_ADMIN

Execution must be:

PENDING

Associated request must be:

IN_PROGRESS

---

## Payload

multipart/form-data

Fields:

* externalReferenceId
* proofOfPaymentImage
* notes

Example:

```text
externalReferenceId = TXN-123456
notes = Bank transfer completed successfully
proofOfPaymentImage = file
```

---

## Effects

Store:

* externalReferenceId
* proofOfPaymentUrl
* notes

Update:

PayoutExecution:

* status = COMPLETED
* completedAt = now()

WithdrawRequest:

* status = COMPLETED

WorkerBalance:

existing business logic must remain intact

Reuse current implementation.

Do not rewrite balance logic if already implemented.

---

## Proof Upload

Use existing upload infrastructure.

Review existing file upload providers.

Examples:

* Cloudinary
* existing image upload services

Do not create a second upload mechanism.

Store uploaded image URL.

---

# Fail Withdrawal

Review existing implementation.

If compliant:

reuse.

Otherwise extend.

Endpoint:

POST /api/v1/admin/payout-executions/:executionId/fail

Payload:

```json
{
  "reason": ""
}
```

Requirements:

* FINANCIAL_MONITOR
* SUPER_ADMIN

Effects:

* execution status becomes FAILED
* withdrawal status becomes FAILED
* reserved balance restored according to existing logic
* audit log generated

---

# Withdrawal Proof Retrieval

Add endpoint:

GET /api/v1/admin/payout-executions/:executionId/proof

Purpose:

Return:

* proof image URL
* external reference id
* notes
* completion information

Used by dashboard review screens.

---

# Audit Logging

Reuse existing audit infrastructure.

Do not create a new audit system.

Generate audit records for:

* WITHDRAWAL_PROCESSING_STARTED
* WITHDRAWAL_COMPLETED
* WITHDRAWAL_FAILED
* WITHDRAWAL_PROOF_UPLOADED

Audit metadata should include:

* withdrawal id
* payout execution id
* worker id
* amount
* admin id

---

# Authorization

Only:

* FINANCIAL_MONITOR
* SUPER_ADMIN

may process withdrawals.

USER_MANAGEMENT must not access these operations.

ISSUES_MANAGEMENT must not access these operations.

Reuse existing RBAC implementation.

---

# Swagger

Document:

* withdrawal listing
* withdrawal details
* start processing
* complete payout
* fail payout
* proof retrieval

Document:

* multipart upload requirements
* role requirements
* response structures

Follow existing admin swagger style.

---

# Implementation Requirements

Before modifying code:

Inspect:

* src/routes/v1/admin/*
* related controllers
* related services
* related repositories

Follow existing architecture patterns.

Use:

* SuccessResponse
* AppError
* validation middleware
* dependency injection
* repository pattern

Do not introduce architectural inconsistencies.

---

# Verification Checklist

* Build passes.
* Prisma generation passes.
* Existing withdrawal implementation reviewed.
* Existing admin routes reviewed.
* Existing admin architecture followed.
* Existing upload infrastructure reused.
* Existing balance logic preserved.
* Withdrawal listing operational.
* Withdrawal details endpoint operational.
* Start processing operational.
* Complete payout operational.
* Proof upload operational.
* Proof retrieval operational.
* Fail payout operational.
* Audit logs generated.
* Swagger updated.
