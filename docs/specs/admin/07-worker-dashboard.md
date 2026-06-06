# Workers Management Dashboard

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

Review all related:

* routes
* controllers
* services
* repositories
* DTOs
* validators
* Swagger documentation

Review existing implementations before adding any new functionality.

Important:

This project already contains:

* User model
* WorkerProfile model
* WorkerVerification model
* Government model
* Specialization model
* Admin RBAC system
* Audit logging infrastructure
* Existing pagination utilities
* Existing response wrappers
* Existing validation patterns

Before creating new endpoints, services, repositories, DTOs, or schema fields:

* Review existing implementation.
* Reuse existing services whenever possible.
* Extend existing worker/admin functionality instead of duplicating it.
* Reuse SuccessResponse, AppError, validation middleware, repository patterns, and DI structure already used across the project.

Do not introduce duplicate worker management workflows.

---

# Objective

Implement the User Management Admin Workers Dashboard.

This page is responsible for displaying, reviewing, filtering, approving, rejecting, suspending, and manually creating worker accounts.

Access:

* USER_MANAGEMENT
* SUPER_ADMIN

Only authorized admins may access these endpoints.

---

# Worker Listing

Add endpoint:

GET /api/v1/admin/workers

Purpose:

Retrieve all workers in the platform regardless of current verification state.

Must support pagination.

---

## Response Data

Each worker item should include:

* workerProfileId
* userId
* firstName
* middleName
* lastName
* phoneNumber
* profileImageUrl
* accountStatus
* verificationStatus
* specialization
* government
* city
* rate
* ratingCount
* completedJobsCount
* createdAt

Return paginated response using existing pagination pattern.

---

# Filters

Support the following filters:

## Account Status

Filter by:

* ACTIVE
* SUSPENDED
* BANNED

Maps to:

User.status

---

## Verification Status

Filter by:

* PENDING
* APPROVED
* REJECTED

Maps to:

WorkerVerification.status

---

## Government

Filter by:

Government.id

Maps to worker location.

---

## Specialization

Filter by:

Specialization.id

Maps to worker selected specializations.

---

## Search

Support text search by worker name.

Search fields:

* firstName
* middleName
* lastName

Partial matching required.

Case-insensitive search.

---

# Worker Details

Add endpoint:

GET /api/v1/admin/workers/:workerId

Purpose:

Retrieve full worker details for review screen.

---

## Response Includes

User Information:

* full name
* phone number
* profile image
* account status
* createdAt

Worker Information:

* experienceYears
* bio
* rate
* completedJobsCount
* chosen specializations
* work governments

Verification Information:

* verification status
* rejection reasons (if any)
* rejection note (if any)

Documents:

* idDocumentUrl
* idWithPersonalImageUrl

Portfolio Summary:

* project count
* project images

Availability:

* working days
* working hours

Administrative Information:

* assigned admin (if applicable)
* recent audit history (if available)

Reuse existing services where possible.

---

# Verification Review

The review screen must allow admins to inspect:

* account data
* uploaded verification documents
* selected specializations
* worker profile data

before making a verification decision.

---

# Verification Approval

Verify whether approval endpoint already exists.

If compliant:

* reuse existing implementation

If missing:

Add endpoint:

POST /api/v1/admin/workers/:workerId/approve

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Verification must be:

PENDING

Effects:

* verification status becomes APPROVED
* audit log generated

Return updated worker verification.

---

# Verification Rejection

Verify whether rejection endpoint already exists.

If compliant:

* reuse existing implementation

If missing:

Add endpoint:

POST /api/v1/admin/workers/:workerId/reject

Payload:

```json
{
  "rejectionReasons": [],
  "rejectionNote": ""
}
```

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Verification must be:

PENDING

Effects:

* verification status becomes REJECTED
* rejection reasons stored
* rejection note stored
* audit log generated

Return updated verification.

---

# Rejection Reasons

Implement reusable rejection reason enum if not already present.

Suggested values:

* BLURRY_DOCUMENT
* EXPIRED_ID
* INVALID_DOCUMENT
* FACE_NOT_CLEAR
* MISMATCHED_INFORMATION
* DOCUMENT_INCOMPLETE
* OTHER

Do not introduce duplicates if similar implementation already exists.

---

# Worker Account Management

## Suspend Worker

Add endpoint:

POST /api/v1/admin/workers/:workerId/suspend

Payload:

```json
{
  "reason": ""
}
```

Effects:

* User.status = SUSPENDED

Generate audit log.

---

## Reactivate Worker

Add endpoint:

POST /api/v1/admin/workers/:workerId/reactivate

Effects:

* User.status = ACTIVE

Generate audit log.

---

## Ban Worker

Add endpoint:

POST /api/v1/admin/workers/:workerId/ban

Payload:

```json
{
  "reason": ""
}
```

Effects:

* User.status = BANNED

Generate audit log.

---

# Manual Worker Creation

Purpose:

Allow USER_MANAGEMENT admins to create demonstration/test workers directly from dashboard.

Example use case:

* showcasing the platform
* demo environments
* manually onboarding workers

---

Add endpoint:

POST /api/v1/admin/workers

Payload:

```json
{
  "firstName": "",
  "middleName": "",
  "lastName": "",
  "phoneNumber": "",
  "governmentId": "",
  "cityId": "",
  "specializationIds": []
}
```

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Effects:

Creates:

* User
* WorkerProfile
* WorkerVerification

Default values:

* status = ACTIVE
* verificationStatus = APPROVED

Audit log required.

Return created worker.

---

# Audit Logging

All actions must generate audit records.

Examples:

* WORKER_CREATED_BY_ADMIN
* WORKER_APPROVED
* WORKER_REJECTED
* WORKER_SUSPENDED
* WORKER_REACTIVATED
* WORKER_BANNED

Reuse existing audit infrastructure.

Do not create a new audit system.

---

# Swagger

Document:

* worker listing endpoint
* worker details endpoint
* filters
* approval endpoint
* rejection endpoint
* suspend endpoint
* reactivate endpoint
* ban endpoint
* worker creation endpoint

Document role requirements.

Document payloads and responses.

---

# Verification Checklist

* Build passes.
* Prisma generation passes.
* Existing worker management reviewed before modification.
* Existing verification implementation reviewed before modification.
* Existing audit logging reused.
* Existing pagination reused.
* Worker listing operational.
* Filters operational.
* Search operational.
* Worker details endpoint operational.
* Approval workflow operational.
* Rejection workflow operational.
* Suspend workflow operational.
* Reactivate workflow operational.
* Ban workflow operational.
* Manual worker creation operational.
* Swagger updated.
