# Financial Folder Analysis - Endpoint Inventory

**Date**: 2026-06-12
**Scope**: Analyze all financial route files for consolidation
**Status**: 🟢 ANALYSIS COMPLETE

---

## 📁 Financial Folder Structure

**Location**: `motqen-api/src/routes/v1/financial/`

```
financial/
├── admin-dashboard.ts          (3 endpoints)
├── escrow.ts                   (2 endpoints)
├── refunds.ts                  (2 endpoints)
├── withdrawals.ts              (7 endpoints)
└── worker-earnings.ts          (8 endpoints)

TOTAL: 22 endpoints across 5 files
```

---

## 📊 Detailed Endpoint Inventory

### 1. `admin-dashboard.ts` (3 Endpoints)

**File**: `motqen-api/src/routes/v1/financial/admin-dashboard.ts`

| Endpoint | Method | Purpose | Auth | Middleware | Schema |
|----------|--------|---------|------|-----------|--------|
| `/summary` | GET | Get financial dashboard summary | Admin | `authenticateAccess, authorizeAdmin` | `financialSummaryQuerySchema` |
| `/activity-log` | GET | Get activity log entries | Admin | `authenticateAccess, authorizeAdmin` | `activityLogQuerySchema` |
| `/users/:userId/aggregation` | GET | Get user financial aggregation | Admin | `authenticateAccess, authorizeAdmin` | `userAggregationParamsSchema` |

**Controllers Used**:
- `adminDashboardController`

**Middleware Chain**:
```typescript
authenticateAccess
authorizeAdmin
validateCsrf (custom per endpoint)
```

**Route Path**: Currently mounted at `/admin/finance` in admin router

---

### 2. `escrow.ts` (2 Endpoints)

**File**: `motqen-api/src/routes/v1/financial/escrow.ts`

| Endpoint | Method | Purpose | Auth | Body/Query | Response |
|----------|--------|---------|------|-----------|----------|
| `/` | GET | List escrow holds (paginated) | Admin | Query: status, orderId, limit, offset | Paginated array |
| `/:id/release` | POST | Manually release escrow hold | Admin | Path: id (UUID) | Success message |

**Controllers Used**:
- `escrowController`

**Middleware Chain**:
```typescript
authenticateAccess
authorizeAdmin
```

**Route Path**: Currently mounted at `/admin/escrow-holds` in admin router

**Special Considerations**:
- Supports pagination (limit, offset)
- Supports filtering by status and orderId
- Release operation requires hold eligibility check

---

### 3. `refunds.ts` (2 Endpoints)

**File**: `motqen-api/src/routes/v1/financial/refunds.ts`

| Endpoint | Method | Purpose | Auth | Body/Query | Response |
|----------|--------|---------|------|-----------|----------|
| `/` | POST | Initiate refund for order | Admin | Body: refund request (with idempotency key) | Refund object |
| `/` | GET | List refunds for an order | Admin | Path: orderId | Array of refunds |

**Controllers Used**:
- `refundController`

**Middleware Chain**:
```typescript
authenticateAccess
authorizeAdmin
```

**Route Path**: Currently mounted at `/admin/orders/:orderId/refunds` in admin router

**Special Considerations**:
- Requires idempotency key to prevent duplicates
- Supports refund status checking (already refunded returns 409)
- Complex request body validation

---

### 4. `withdrawals.ts` (7 Endpoints)

**File**: `motqen-api/src/routes/v1/financial/withdrawals.ts`

| Endpoint | Method | Purpose | Auth | Body/Query | Response |
|----------|--------|---------|------|-----------|----------|
| `/withdraw-requests` | GET | List withdrawal requests | Admin | Query: pagination | Array of requests |
| `/withdraw-requests/:id/start-processing` | POST | Start processing withdrawal | Admin | Path: id (UUID) | Success |
| `/withdraw-requests/:id/reject` | POST | Reject withdrawal request | Admin | Body: notes (optional) | Success |
| `/payout-executions/:id/complete` | POST | Complete payout | Admin | Body: proof_of_payment_url, external_reference_id | Success |
| `/payout-executions/:id/fail` | POST | Mark payout as failed | Admin | Body: reason (optional) | Success |
| `/worker-debts` | GET | List worker debts | Admin | Query: pagination | Array of debts |
| `/worker-debts/:id/settle` | POST | Settle worker debt | Admin | Path: id (UUID) | Success |

**Controllers Used**:
- `withdrawalAdminController`
- `workerEarningsController`

**Middleware Chain**:
```typescript
authenticateAccess
isActive
authorizeAdmin
```

**Route Path**: Currently mounted at root `/admin/` in admin router

**Special Considerations**:
- Complex workflow (pending → processing → complete/fail)
- Separate payout execution tracking
- Worker debt management
- Validation schemas for request/response

---

### 5. `worker-earnings.ts` (8 Endpoints)

**File**: `motqen-api/src/routes/v1/financial/worker-earnings.ts`

| Endpoint | Method | Purpose | Auth | Body/Query | Response |
|----------|--------|---------|------|-----------|----------|
| `/` | GET | Get my earnings | Worker | - | Earnings object |
| `/withdraw-requests` | GET | List my withdrawal requests | Worker | Query: pagination | Array of requests |
| `/withdraw-requests/:id` | GET | Get specific withdrawal request | Worker | Path: id (UUID) | Request object |
| `/withdraw-requests` | POST | Create withdrawal request | Worker | Body: withdrawRequestSchema | Request object |
| `/payout-methods` | GET | List payout methods | Worker | - | Array of methods |
| `/payout-methods` | POST | Add payout method | Worker | Body: payoutMethodSchema | Method object |
| `/payout-methods/:id` | PUT | Update payout method | Worker | Body: updatePayoutMethodSchema | Updated object |
| `/payout-methods/:id` | DELETE | Delete payout method | Worker | Path: id (UUID) | Success |

**Controllers Used**:
- `workerEarningsController`

**Middleware Chain**:
```typescript
authenticateAccess
isActive
authorizeWorker  (NOT ADMIN - WORKER!)
```

**Route Path**: Currently mounted at `/workers/me/earnings` in main API router

**Special Considerations**:
- ⚠️ This is WORKER authorization, NOT ADMIN
- Sensitive operations (rate-limited on POST)
- Multiple payout method management
- Idempotent withdrawal request creation

---

## 🎯 Consolidation Strategy

### Current Mount Points

```
/api/v1/admin/auth                    → auth.ts
/api/v1/admin/admins/available        → admins.ts
/api/v1/admin/finance                 → admin-dashboard.ts
/api/v1/admin/escrow-holds            → escrow.ts
/api/v1/admin/orders/:orderId/refunds → refunds.ts
/api/v1/admin/[withdrawals]           → withdrawals.ts (root mount)
/api/v1/workers/me/earnings           → worker-earnings.ts (WORKER - NOT ADMIN!)
```

### Proposed Consolidated Structure

**Dashboard APIs** (Should consolidate):
```
/api/v1/admin/
  ├─ auth/                    ← Move all auth endpoints here
  ├─ admins/                  ← Move all admin endpoints here
  ├─ dashboard/               ← Move all dashboard endpoints here
  ├─ finance/
  │  ├─ summary
  │  ├─ activity-log
  │  ├─ escrow-holds
  │  ├─ refunds
  │  └─ withdrawals
  └─ ...
```

**Worker APIs** (Keep separate - different auth):
```
/api/v1/workers/me/earnings/
  ├─ list earnings
  ├─ withdraw-requests/
  └─ payout-methods/
```

---

## ⚠️ Important Considerations

### 1. Authorization Differences

**Admin Routes**:
- Use: `authenticateAccess` + `authorizeAdmin`
- Permissions: `['FINANCIAL_MONITOR']`, `['ADMIN_ONLY']`, etc.

**Worker Routes**:
- Use: `authenticateAccess` + `isActive` + `authorizeWorker`
- Access: Own earnings only, not admin access

**Decision**: Keep worker-earnings.ts separate (different auth model)

### 2. Middleware Chains

**Inconsistent middleware**:
- Some use `validateCsrf`
- Some don't
- Some use `requireAdminPermission`, others don't

**Action**: Standardize middleware when consolidating

### 3. Rate Limiting

**Currently Applied**:
- `sensitiveIpRateLimiter` on POST `/withdraw-requests` (worker-earnings)
- Should also apply to admin withdrawal operations

**Action**: Review and standardize rate limiting

### 4. Response Schemas

**Pagination**:
- Inconsistently implemented
- Some use `limit/offset`, others don't
- Some manually handle, others use utilities

**Action**: Use standardized pagination utilities

---

## 📋 Consolidation Checklist

### Phase 1: Create Consolidated Admin API File

```
File: motqen-api/src/routes/v1/admin/api.ts

Sections:
1. AUTHENTICATION
   └─ Copy from: auth.ts
   └─ 3 endpoints

2. ADMIN MANAGEMENT
   └─ Copy from: admins.ts
   └─ 1 endpoint

3. DASHBOARD
   └─ Copy from: admin-dashboard.ts
   └─ 3 endpoints

4. FINANCIAL OPERATIONS

   a. Finance Dashboard
      └─ Copy from: admin-dashboard.ts (the financial version)
      └─ 3 endpoints

   b. Escrow Management
      └─ Copy from: escrow.ts
      └─ 2 endpoints

   c. Refund Processing
      └─ Copy from: refunds.ts
      └─ 2 endpoints

   d. Withdrawal Management
      └─ Copy from: withdrawals.ts
      └─ 7 endpoints

Total Admin Endpoints: 21
```

### Phase 2: Keep Worker Earnings Separate

```
File: motqen-api/src/routes/v1/financial/worker-earnings.ts

Reason: Different auth model (worker vs admin)
Keep mounted at: /api/v1/workers/me/earnings
No changes needed
```

### Phase 3: Update Mount Points

```
In: admin/index.ts

Before:
  import authRouter from './auth.js';
  import adminsRouter from './admins.js';
  import dashboardRouter from './admin-dashboard.js';
  import escrowRouter from './escrow.js';
  ...
  adminRouter.use('/auth', authRouter);
  adminRouter.use('/admins', adminsRouter);
  ...

After:
  import adminApiRouter from './api.js';
  ...
  adminRouter.use('/', adminApiRouter);
```

---

## 🔍 Schema & Validation Summary

### Schemas Used (Need to import)

**From `financial/dashboard.schema.js`**:
- `financialSummaryQuerySchema`
- `activityLogQuerySchema`
- `userAggregationParamsSchema`

**From `requests/admin-auth.request.js`**:
- `AdminLoginSchema`

**From `financial/withdrawal.schema.js`**:
- `withdrawRequestSchema`
- `payoutMethodSchema`
- `updatePayoutMethodSchema`

**Ad-hoc Zod Schemas** (in withdrawals.ts):
- `idParamsSchema`
- `rejectBodySchema`
- `completePayoutBodySchema`
- `failPayoutBodySchema`

### Controllers Used (Need to import)

```typescript
import { adminAuthController } from '../../../state.js';
import { adminDashboardController } from '../../../state.js';
import { adminUsersController } from '../../../state.js';
import { escrowController } from '../../../state.js';
import { refundController } from '../../../state.js';
import { withdrawalAdminController } from '../../../state.js';
```

---

## 📊 Size & Complexity Analysis

### Consolidated File Metrics

**Estimated Line Count**:
- Imports: ~30 lines
- Type definitions: ~20 lines
- Route definitions: ~150 lines
- Comments & documentation: ~100 lines
- **Total: ~300 lines**

**Complexity**: Medium-High
- Multiple middleware chains
- Different permission requirements
- Pagination handling
- Error handling variations

**Maintainability**: Good
- Clear section separation
- Well-documented endpoints
- Consistent patterns

---

## 🎯 Next Steps

### Step 1: Design & Plan ✅ (COMPLETE)
- [x] Analyzed all financial files
- [x] Created endpoint inventory
- [x] Identified consolidation strategy
- [x] Documented considerations

### Step 2: Implementation (NEXT)
- [ ] Create `admin/api.ts` file
- [ ] Copy all admin endpoints
- [ ] Copy financial endpoints
- [ ] Update imports and middleware
- [ ] Test all endpoints

### Step 3: Integration & Testing
- [ ] Update `admin/index.ts` mount points
- [ ] Test all admin routes work
- [ ] Test all financial routes work
- [ ] Verify authentication
- [ ] Verify permissions

### Step 4: Cleanup & Documentation
- [ ] Archive old route files
- [ ] Update API documentation
- [ ] Update architecture docs
- [ ] Create migration guide

---

## 📝 Implementation Template

### The consolidated `admin/api.ts` will look like:

```typescript
import { Router } from 'express';

// Controllers
import { adminAuthController } from '../../../state.js';
import { adminDashboardController } from '../../../state.js';
import { adminUsersController } from '../../../state.js';
import { escrowController } from '../../../state.js';
import { refundController } from '../../../state.js';
import { withdrawalAdminController } from '../../../state.js';
import { workerEarningsController } from '../../../state.js';

// Middlewares
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { authenticateAccess, isActive } from '../../../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../../../middlewares/accessMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import { sensitiveIpRateLimiter } from '../../../middlewares/rateLimitMiddleware.js';

// Schemas
import { AdminLoginSchema } from '../../../schemas/requests/admin-auth.request.js';
import {
  financialSummaryQuerySchema,
  activityLogQuerySchema,
  userAggregationParamsSchema,
} from '../../../schemas/financial/dashboard.schema.js';

const router: Router = Router();

// ════════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

router.post('/auth/login', sensitiveIpRateLimiter, validateBody(AdminLoginSchema), adminAuthController.login);
router.post('/auth/logout', authenticateAdminAccess, adminAuthController.logout);
router.get('/auth/access', authenticateAdminAccess, adminAuthController.refreshAccessToken);

// ════════════════════════════════════════════════════════════════════════════
// 2. DASHBOARD SUMMARY & ANALYTICS (Protected)
// ════════════════════════════════════════════════════════════════════════════

router.use(authenticateAdminAccess, validateCsrf);

router.get('/dashboard/summary', requireAdminPermission(['FINANCIAL_MONITOR']), validateQuery(financialSummaryQuerySchema), adminDashboardController.getSummary);
router.get('/dashboard/activity-log', requireAdminPermission(['FINANCIAL_MONITOR']), validateQuery(activityLogQuerySchema), adminDashboardController.getActivityLog);
router.get('/dashboard/users/:userId/aggregation', requireAdminPermission(['FINANCIAL_MONITOR']), adminDashboardController.getUserAggregation);

// ════════════════════════════════════════════════════════════════════════════
// 3. ADMIN MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

router.get('/admins/available', adminUsersController.getAvailableAdmins);

// ════════════════════════════════════════════════════════════════════════════
// 4. FINANCIAL OPERATIONS - ESCROW
// ════════════════════════════════════════════════════════════════════════════

router.get('/finance/escrow-holds', escrowController.list);
router.post('/finance/escrow-holds/:id/release', validateParams(idParamsSchema), escrowController.manualRelease);

// ════════════════════════════════════════════════════════════════════════════
// 5. FINANCIAL OPERATIONS - REFUNDS
// ════════════════════════════════════════════════════════════════════════════

router.post('/finance/orders/:orderId/refunds', refundController.initiateRefund);
router.get('/finance/orders/:orderId/refunds', refundController.listRefunds);

// ════════════════════════════════════════════════════════════════════════════
// 6. FINANCIAL OPERATIONS - WITHDRAWALS
// ════════════════════════════════════════════════════════════════════════════

router.get('/finance/withdraw-requests', workerEarningsController.listWithdrawRequests);
router.post('/finance/withdraw-requests/:id/start-processing', validateParams(idParamsSchema), withdrawalAdminController.startProcessing);
router.post('/finance/withdraw-requests/:id/reject', validateParams(idParamsSchema), validateBody(rejectBodySchema), withdrawalAdminController.rejectRequest);
router.post('/finance/payout-executions/:id/complete', validateParams(idParamsSchema), validateBody(completePayoutBodySchema), withdrawalAdminController.completePayout);
router.post('/finance/payout-executions/:id/fail', validateParams(idParamsSchema), validateBody(failPayoutBodySchema), withdrawalAdminController.failPayout);
router.get('/finance/worker-debts', workerEarningsController.listWorkerDebts);
router.post('/finance/worker-debts/:id/settle', validateParams(idParamsSchema), withdrawalAdminController.settleDebt);

export default router;
```

---

**Document Version**: 1.0
**Status**: ANALYSIS COMPLETE - READY FOR IMPLEMENTATION
**Next**: Implementation Phase (Create consolidated api.ts)
