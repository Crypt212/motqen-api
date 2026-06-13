# Task: Connect Admin Dashboard Frontend with Backend APIs

## Objective

Perform a complete integration audit between:

Frontend:
MOTQEN-Dashboard/src/api

Backend:
motqen-api/src/routes/v1/admin

and any admin-related routes registered through:

motqen-api/src/routes/v1/api.ts

The goal is to identify:

1. APIs already implemented in backend and not connected in frontend.
2. APIs expected by frontend but missing in backend.
3. APIs implemented differently between frontend and backend.
4. Missing DTOs, response mappings, pagination mappings, filters, enums, and status handling.
5. Complete all API integrations without breaking existing code.

---

## Mandatory Analysis Phase

Before writing any code:

### Analyze Frontend

Inspect:

```txt
MOTQEN-Dashboard/src/api
MOTQEN-Dashboard/src/services
MOTQEN-Dashboard/src/hooks
MOTQEN-Dashboard/src/pages
MOTQEN-Dashboard/src/features
```

Document:

- Existing API files
- Existing React Query hooks
- Existing service layer
- Existing endpoint definitions
- Expected request payloads
- Expected response shapes

---

### Analyze Backend

Inspect:

```txt
motqen-api/src/routes/v1/admin
motqen-api/src/routes/v1/financial
motqen-api/src/routes/v1/api.ts

motqen-api/src/controllers
motqen-api/src/services
motqen-api/src/schemas
```

Document:

- Existing routes
- Existing controllers
- Existing DTOs
- Existing validation schemas
- Existing response structures

---

### Verify Route Registration

Do not assume routes exist.

Verify they are actually mounted through:

```txt
src/routes/v1/api.ts
```

and reachable.

---

## Build Integration Matrix

Create a table:

| Feature | Front Exists | Backend Exists | Connected | Missing Side |
|----------|-------------|-------------|------------|-------------|
| Login | Yes | Yes | No | Front |
| Admin Users | Yes | Yes | Partial | Both |
| Dashboard Summary | ... | ... | ... | ... |

Cover ALL admin features.

---

## Required Areas

Audit and connect:

### Authentication

- Admin Login
- Admin Logout
- Admin Profile
- Refresh Token
- Session Management

---

### Dashboard

- Summary
- Metrics
- Activity Feed
- Analytics
- Growth Charts

---

### Admin Management

- List Admins
- Create Admin
- Update Admin
- Change Role
- Disable
- Enable
- Reset Password
- Force Logout
- Sessions

---

### Reports

- List Reports
- Report Details
- Status Updates

---

### Verification

- Pending Verification List
- Verification Details
- Approve
- Reject
- Reupload Support

---

### Financial

- Escrow
- Refunds
- Disputes
- Withdrawals
- Payouts
- Debts
- Financial Dashboard

---

### Support Chat

If backend exists:

- List Conversations
- Assignment
- Transfer
- Messaging
- Restrictions

If backend doesn't exist:

Document as backend pending.

---

### Worker Controls

- Working Hours
- Occupied Slots
- Verification Reset
- Specializations
- Internal Notes

---

### Fee Management

- Current Fee
- Fee History
- Create Rule
- Future Rules

---

## Response Standardization

Backend already contains infrastructure.

Reuse existing:

```txt
SuccessResponse
AppError
Pagination Utilities
Validation Schemas
DI Container
Repositories
Services
```

Do NOT create duplicate wrappers.

---

## Frontend Standards

Reuse existing:

```txt
axios instance
React Query
API service layer
Error handlers
Auth store
Permission guards
```

Do not introduce a new API architecture.

---

## Deliverables

### 1. Integration Audit Report

Generate:

```txt
docs/admin-dashboard-api-audit.md
```

Containing:

- Existing endpoints
- Missing endpoints
- Frontend gaps
- Backend gaps
- Required mappings

---

### 2. Connection Work

Implement:

- Missing API calls
- Missing hooks
- Missing service functions
- Missing response mapping

---

### 3. Final Coverage Report

Generate:

```txt
docs/admin-dashboard-api-coverage.md
```

With:

| Feature | Status |
|----------|---------|
| Connected |
| Missing Backend |
| Missing Frontend |
| Blocked |

---

## Critical Rules

1. Never assume endpoint names.
2. Read actual code first.
3. Do not break existing frontend architecture.
4. Do not create duplicate services.
5. Reuse existing response handling.
6. Reuse existing auth handling.
7. Reuse existing pagination handling.
8. Follow existing folder structure.
9. Produce audit report before implementation.
10. If backend endpoint is missing, document it instead of inventing it.

Goal:
Achieve 100% integration coverage between the Admin Dashboard frontend and the currently implemented backend APIs.
