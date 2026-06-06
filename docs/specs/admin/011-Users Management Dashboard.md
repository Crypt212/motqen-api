# Admin Users Management Dashboard

## Required Reading

Before starting:

Read:

* docs/specs/admin/*
* docs/specs/audits/*
* docs/specs/progress/*
* src/routes/v1/admin/*
* Existing Users implementation
* Existing WorkerProfile implementation
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

Before adding anything new:

Review existing functionality and reuse it whenever possible.

Do not create duplicate user-management flows.

---

## Objective

Implement the Admin Users Management dashboard.

This dashboard allows authorized admins to:

* inspect users
* inspect workers
* inspect clients
* create users manually
* update user data
* suspend users
* ban users
* reactivate users
* force logout users
* review account information

The dashboard must operate on top of the existing user system.

Do not introduce a second user management model.

---

# Permissions

Department:

USER_MANAGEMENT

Allowed:

* user management actions
* worker management actions
* account moderation
* verification review

SUPER_ADMIN:

Full access.

Other departments:

Read-only access if already allowed by current RBAC.

No user management actions.

---

# Users Listing

Add endpoint:

GET /api/v1/admin/users

Purpose:

Provide dashboard listing.

---

## Required Fields

Return:

* id
* firstName
* middleName
* lastName
* phoneNumber
* role
* status
* isOnline
* profileImageUrl
* createdAt
* updatedAt

If worker:

also include:

* workerProfileId
* verification status
* rate
* completedJobsCount

If client:

also include:

* clientProfileId

---

# Search

Support text search.

Search by:

* first name
* middle name
* last name
* full name
* phone number

---

# Filters

## Account Status

Using existing AccountStatus enum.

Support:

* ACTIVE
* SUSPENDED
* BANNED

---

## User Type

Support:

* CLIENT
* WORKER

Determine using existing profiles.

Do not create new user type enums.

---

## Verification Status

If worker:

Support:

* PENDING
* APPROVED
* REJECTED

Reuse existing verification enums.

---

## Government

Filter by:

worker/client main location government.

Reuse existing location relationships.

---

## Specialization

Filter workers by specialization.

Reuse existing specialization relationships.

---

## Online Status

Support:

* online
* offline

Reuse existing presence implementation.

---

# Pagination

Reuse existing admin pagination pattern.

Do not create a new pagination mechanism.

---

# User Details

Add endpoint:

GET /api/v1/admin/users/:userId

Purpose:

Provide complete user profile information.

---

## Required Data

### Basic Information

Return:

* id
* names
* phone number
* role
* status
* online status
* profile image
* creation date

---

### Profile Information

Worker:

* worker profile
* bio
* experience
* rating
* completed jobs
* specializations
* governments

Client:

* client profile

---

### Locations

Return:

* all locations
* main location

Reuse existing location DTOs.

---

### Verification

If worker:

Return:

* verification status
* documents
* rejection reasons
* rejection notes

Reuse existing verification implementation.

---

### Portfolio

Return:

* portfolio
* project images

Reuse existing portfolio implementation.

---

### Financial Snapshot

If worker:

Return:

* balance
* pending withdrawal
* total earned
* withdrawn

Reuse existing financial services.

---

### Sessions

Return:

* active sessions
* device ids
* last used dates

Reuse existing session implementation.

---

# Create User

Add endpoint:

POST /api/v1/admin/users

Purpose:

Allow manual user creation from dashboard.

Used for:

* demonstrations
* onboarding assistance
* manual setup

---

## Requirements

Admin provides:

* firstName
* middleName
* lastName
* phoneNumber
* account type

Optional:

* worker profile data
* specialization data
* location data

---

## Behavior

Reuse existing registration services whenever possible.

Do not create a second registration flow.

Avoid duplicating validation logic.

---

# Update User

Add endpoint:

PATCH /api/v1/admin/users/:userId

Purpose:

Allow administrative profile correction.

---

## Editable Fields

Support updating:

* names
* profile image
* phone number
* worker profile fields
* locations
* specializations
* governments

Reuse existing services whenever possible.

---

# Suspend User

Add endpoint:

POST /api/v1/admin/users/:userId/suspend

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Payload:

```json
{
  "reason": ""
}
```

Effects:

* status = SUSPENDED
* reason logged
* audit log generated

---

# Ban User

Add endpoint:

POST /api/v1/admin/users/:userId/ban

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Payload:

```json
{
  "reason": ""
}
```

Effects:

* status = BANNED
* revoke active sessions
* audit log generated

---

# Reactivate User

Add endpoint:

POST /api/v1/admin/users/:userId/reactivate

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Effects:

* status = ACTIVE
* audit log generated

---

# Force Logout

Add endpoint:

POST /api/v1/admin/users/:userId/force-logout

Purpose:

Terminate all active sessions.

Requirements:

* USER_MANAGEMENT
* SUPER_ADMIN

Effects:

* revoke all sessions
* disconnect active sockets if supported
* audit log generated

Reuse existing session infrastructure.

Do not create a duplicate logout system.

---

# Administrative Profile Corrections

Admins may perform emergency corrections.

Examples:

* wrong specialization
* wrong government
* incorrect worker settings
* incorrect working hours
* broken occupied slots

---

## Working Hours Management

Allow admin access to:

* DayWorkingHours

Support:

* create
* update
* delete

Reuse existing worker availability structures.

Do not create a second scheduling system.

---

## Occupied Time Slots Management

Allow admin access to:

* WorkerOccupiedTimeSlot

Support:

* inspect
* modify
* remove

Used for operational fixes.

Must generate audit logs.

---

# User Activity

Add endpoint:

GET /api/v1/admin/users/:userId/activity

Purpose:

Administrative review.

Return:

* recent orders
* disputes
* reports
* withdrawals
* notifications
* moderation actions

Reuse existing entities.

Do not duplicate activity storage.

---

# Audit Logging

Generate audit records for:

* USER_CREATED
* USER_UPDATED
* USER_SUSPENDED
* USER_BANNED
* USER_REACTIVATED
* USER_FORCE_LOGOUT
* USER_LOCATION_UPDATED
* USER_SPECIALIZATION_UPDATED
* USER_WORKING_HOURS_UPDATED
* USER_OCCUPIED_SLOT_UPDATED

Reuse existing audit infrastructure.

Do not create a second audit mechanism.

---

# Swagger

Document:

* listing
* filters
* user details
* create user
* update user
* suspend
* ban
* reactivate
* force logout
* activity endpoint

Document:

* role requirements
* permissions
* audit behavior

---

# Verification Checklist

* Build passes.
* Existing user services reviewed.
* Existing registration flow reused.
* Existing session flow reused.
* Existing verification flow reused.
* Existing worker profile flow reused.
* Existing financial flow reused.
* No duplicate user model introduced.
* No duplicate registration flow introduced.
* No duplicate session management introduced.
* User listing operational.
* User details operational.
* Manual user creation operational.
* Suspend/ban/reactivate operational.
* Force logout operational.
* Working hours management operational.
* Occupied slot management operational.
* Audit logs generated.
* Swagger updated.
