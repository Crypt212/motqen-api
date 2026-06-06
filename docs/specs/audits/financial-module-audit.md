# Financial Module Audit

**Feature**: Financial Module Refactor & Hardening
**Date**: 2026-06-03

---

## FIN-AUDIT-001

**Category**: Bug
**Severity**: Critical
**Location**: `src/routes/v1/admin/withdrawals.ts`

**Description**
`GET /admin/worker-debts` is wired to `workerEarningsController.listWithdrawRequests` instead of `withdrawalAdminController.listDebts`. Admin callers receive withdraw requests instead of worker debt records.

**Recommended Fix**
Route `GET /worker-debts` to `withdrawalAdminController.listDebts` and apply `validateQuery(listDebtsQuerySchema)`.

**Status**: RESOLVED

**Resolution**: Routed `GET /worker-debts` to `withdrawalAdminController.listDebts` with `validateQuery(listDebtsQuerySchema)`.

**Category**: Bug
**Severity**: High
**Location**: `src/controllers/financial/RefundController.ts`, `src/controllers/financial/WithdrawalAdminController.ts`

**Description**
Admin financial controllers read `req.userState` for actor identity. Admin routes use `authenticateAdminAccess`, which only sets `req.adminState`. Activity logs and refund `initiatedBy` fields receive `undefined` or incorrect values.

**Recommended Fix**
Use `req.adminState!.adminId` consistently, matching `DisputeController`.

**Status**: RESOLVED

**Resolution**: Controllers now read `req.adminState!.adminId` with unauthorized guard.

**Category**: Bug
**Severity**: High
**Location**: `src/services/OrderService.ts`, `src/services/financial/EscrowService.ts`

**Description**
`EscrowService.onOrderCompleted` sets `escrowReleaseEligibleAt` (+7 days) but is never invoked when an order completes. Holds remain without a release eligibility date, blocking automated and eligibility-gated manual releases.

**Recommended Fix**
Call `escrowService.onOrderCompleted(orderId, workFinishedAt, tx)` inside `OrderService.finishWork` within the existing transaction. Wire `EscrowService` into `OrderService` via DI.

**Status**: RESOLVED

**Resolution**: `OrderService.finishWork` calls `escrowService.onOrderCompleted` inside the order completion transaction; wired via `orderService.setEscrowService`.

**Category**: Bug
**Severity**: High
**Location**: `src/services/financial/RefundService.ts`

**Description**
Post-release refund path debits worker balance and may create `WorkerDebt`, but never calls `paymentProvider.initiateRefund`. The client is not refunded through the payment provider while internal ledger entries are recorded.

**Recommended Fix**
Call `paymentProvider.initiateRefund` for post-release refunds (using `escrow.totalAmount` or documented client refund amount), store `externalRefundReference`, and handle provider failure with `AppError`.

**Status**: RESOLVED

**Resolution**: Post-release path calls `paymentProvider.initiateRefund` before DB transaction and stores `externalRefundReference`.

**Category**: Technical Debt
**Severity**: Medium
**Location**: `src/repositories/prisma/financial/EscrowHoldRepository.ts`, `src/services/financial/EscrowService.ts`

**Description**
`findEligibleForRelease` exists on the repository and `releaseHold` exists on the service, but no dedicated orchestrator abstraction wraps batch eligibility scanning and per-hold release execution for future cron/BullMQ integration.

**Recommended Fix**
Create `EscrowReleaseOrchestratorService` with `findEligibleHolds`, `releaseEligibleHold`, and `processEligibleReleases`. Do not implement queue/cron runner.

**Status**: RESOLVED

**Resolution**: Added `EscrowReleaseOrchestratorService` and exported from `state.ts`.

**Category**: Architecture
**Severity**: Medium
**Location**: `src/services/financial/EscrowService.ts`

**Description**
`EscrowService.listHolds` executes Prisma queries directly instead of delegating to `IEscrowHoldRepository`, violating the repository layer boundary.

**Recommended Fix**
Add `findMany(filters, limit, offset)` to `IEscrowHoldRepository` and delegate from the service.

**Status**: RESOLVED

**Resolution**: Added `EscrowHoldRepository.findMany`; `EscrowService.listHolds` delegates to repository.

**Category**: Architecture
**Severity**: Medium
**Location**: `src/controllers/financial/RefundController.ts`

**Description**
`listRefunds` calls `refundRepo.findByOrderId` directly, bypassing the service layer.

**Recommended Fix**
Add `RefundService.listByOrderId` and invoke it from the controller.

**Status**: RESOLVED

**Resolution**: Added `RefundService.listByOrderId`; controller no longer injects repository.

**Category**: Architecture
**Severity**: Medium
**Location**: `src/services/financial/DashboardService.ts`

**Description**
`DashboardService` holds a public `PrismaClient` and performs all aggregation queries directly. Persistence logic is not isolated in a repository.

**Recommended Fix**
Introduce `FinancialDashboardRepository` with aggregation and user-aggregation query methods. Inject repository into `DashboardService`.

**Status**: RESOLVED

**Resolution**: Introduced `FinancialDashboardRepository`; `DashboardService` delegates all queries.

**Category**: Architecture
**Severity**: Medium
**Location**: `src/controllers/financial/AdminDashboardController.ts`

**Description**
`getUserAggregation` performs Prisma ownership checks via `dashboardService.prisma` inside the controller. Controllers must not access Prisma.

**Recommended Fix**
Move ownership verification into `DashboardService.assertAdminCanAccessUser(adminId, userId)` using repository methods.

**Status**: RESOLVED

**Resolution**: Ownership check moved to `DashboardService.assertAdminCanAccessUser`.

**Category**: Error Handling
**Severity**: Medium
**Location**: `src/services/financial/EscrowService.ts`

**Description**
Escrow workflows throw raw `Error` instances instead of `AppError`, producing inconsistent HTTP status mapping.

**Recommended Fix**
Replace with `AppError` using appropriate status codes (404, 409, 422).

**Status**: RESOLVED

**Resolution**: All escrow service errors now use `AppError` with appropriate HTTP codes.

**Category**: Error Handling
**Severity**: Medium
**Location**: `src/controllers/financial/AdminDashboardController.ts`

**Description**
Controller methods use manual try/catch, custom JSON error responses, and do not use `asyncHandler`, `AppError`, or `SuccessResponse`.

**Recommended Fix**
Migrate all handlers to `asyncHandler` + `SuccessResponse` + service-thrown `AppError`.

**Status**: RESOLVED

**Resolution**: Dashboard handlers migrated to `asyncHandler` + `SuccessResponse` + `AppError`.

**Category**: Validation
**Severity**: Medium
**Location**: `src/routes/v1/admin/escrow.ts`, `src/routes/v1/admin/refunds.ts`, `src/routes/v1/admin/admin-dashboard.ts`, `src/routes/v1/admin/withdrawals.ts`

**Description**
Several in-scope endpoints parse query/params manually in controllers or omit Zod middleware: escrow list/release params, refund orderId params, dashboard summary/activity-log queries, admin withdraw-requests list query.

**Recommended Fix**
Add Zod schemas and `validateQuery` / `validateParams` middleware on routes before controller execution.

**Status**: RESOLVED

**Resolution**: Added Zod schemas and route middleware for all in-scope admin financial endpoints.

**Category**: Maintainability
**Severity**: Low
**Location**: `src/controllers/financial/EscrowController.ts`

**Description**
`EscrowController.list` returns raw `res.status(200).json(...)` while other financial controllers use `SuccessResponse`.

**Recommended Fix**
Use `SuccessResponse` consistently.

**Status**: RESOLVED

**Resolution**: `EscrowController.list` now uses `SuccessResponse`.

**Category**: Transaction Safety
**Severity**: Medium
**Location**: `src/services/financial/RefundService.ts`

**Description**
Pre-release refund calls the external payment provider inside a Prisma transaction before all DB writes complete. Provider success followed by DB rollback would leave inconsistent external/internal state.

**Recommended Fix**
Defer external provider call until after idempotent DB record creation, or document and accept with compensating retry logic. Prefer moving provider call after transaction commit when low-risk.

**Status**: RESOLVED

**Resolution**: Pre-release Paymob call moved outside the Prisma transaction; idempotency check runs first.

**Category**: Validation
**Severity**: Low
**Location**: `src/controllers/financial/RefundController.ts`, `src/routes/v1/admin/refunds.ts`

**Description**
`initiateRefundSchema.parse(req.body)` runs inside the controller instead of route validation middleware.

**Recommended Fix**
Apply `validateBody(initiateRefundSchema)` on the route.

**Status**: RESOLVED

**Resolution**: Refund body validation moved to `validateBody(initiateRefundSchema)` on route.

**Category**: Maintainability
**Severity**: Low
**Location**: `src/utils/computeAvailableToWithdraw.ts`, `src/services/financial/WithdrawalService.ts`

**Description**
Identical available-balance calculation exists in both a utility function and `WithdrawalService.computeAvailableToWithdraw`.

**Recommended Fix**
Keep single source in `src/services/financial/helpers/balanceHelper.ts` (or retain utility) and remove duplication from `WithdrawalService`.

**Status**: RESOLVED

**Resolution**: `WithdrawalService` imports shared `computeAvailableToWithdraw` utility; duplicate method removed.

**Category**: Bug
**Severity**: Medium
**Location**: `src/services/financial/WithdrawalService.ts` (`settleDebt`)

**Description**
Manual debt settlement marks debt `SETTLED` and writes a transaction log but does not verify outstanding amount or adjust `WorkerBalance.deductedForDebts`. Partial/outstanding debts may be cleared without financial reconciliation.

**Recommended Fix**
Validate debt status and outstanding amount; update balance fields if manual settlement implies recovery. Document behavior if external settlement is intentional.

**Status**: RESOLVED

**Resolution**: `settleDebt` rejects debts with zero outstanding amount; manual external settlement behavior documented in progress notes.

---

## Summary

| Metric | Count |
|--------|-------|
| Total Issues Found | 17 |
| Critical Fixed | 1 |
| High Fixed | 3 |
| Medium Fixed | 11 |
| Low Fixed | 2 |
| Deferred | 0 |

### Deferred Items

None.
