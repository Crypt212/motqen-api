# Financial Module Progress

**Feature**: Financial Module Refactor & Hardening
**Date**: 2026-06-03

## Added Files

- `docs/specs/audits/financial-module-audit.md`
- `src/schemas/financial/escrow.schema.ts`
- `src/schemas/financial/dashboard.schema.ts`
- `src/repositories/interfaces/financial/FinancialDashboardRepository.ts`
- `src/repositories/prisma/financial/FinancialDashboardRepository.ts`
- `src/services/financial/EscrowReleaseOrchestratorService.ts`

## Modified Files

- `src/routes/v1/admin/withdrawals.ts`
- `src/routes/v1/admin/escrow.ts`
- `src/routes/v1/admin/refunds.ts`
- `src/routes/v1/admin/admin-dashboard.ts`
- `src/controllers/financial/RefundController.ts`
- `src/controllers/financial/WithdrawalAdminController.ts`
- `src/controllers/financial/AdminDashboardController.ts`
- `src/controllers/financial/EscrowController.ts`
- `src/services/financial/RefundService.ts`
- `src/services/financial/EscrowService.ts`
- `src/services/financial/DashboardService.ts`
- `src/services/financial/WithdrawalService.ts`
- `src/services/OrderService.ts`
- `src/repositories/interfaces/financial/EscrowHoldRepository.ts`
- `src/repositories/prisma/financial/EscrowHoldRepository.ts`
- `src/schemas/financial/refund.schema.ts`
- `src/state.ts`
- `src/docs/paths/v1/admin.docs.ts`
- `src/controllers/AdminUsersController.ts` (pre-existing build typo fix)

## Bug Fixes

- `GET /admin/worker-debts` now returns worker debts via `WithdrawalAdminController.listDebts`
- Admin financial controllers use `req.adminState.adminId` for actor identity
- Order completion schedules escrow release eligibility via `EscrowService.onOrderCompleted`
- Post-release refunds call Paymob before persisting ledger changes
- Pre-release external refund calls moved outside the DB transaction

## Architecture Improvements

- `EscrowHoldRepository.findMany` / `updateReleaseEligibleAt` replace direct Prisma in escrow list/scheduling paths
- `RefundService.listByOrderId` replaces controller → repository access
- `FinancialDashboardRepository` replaces direct Prisma in dashboard service
- `AdminDashboardController` uses `asyncHandler`, `SuccessResponse`, and `AppError`
- `EscrowService` uses `AppError` instead of raw `Error`

## Auto-Release Preparation

- `EscrowReleaseOrchestratorService` exported from `state.ts` with:
  - `findEligibleHolds(limit)`
  - `releaseEligibleHold(holdId)`
  - `processEligibleReleases(limit)`
- No cron/BullMQ runner added (per spec)

## Validation & OpenAPI

- Zod middleware added for escrow, refund, dashboard, and admin withdraw/debt routes
- OpenAPI registrations updated in `admin.docs.ts`

## Verification

- `npx prisma generate` — pass
- `npx tsc --noEmit` — pass
- Payment/webhook flows untouched

## Deferred

- None
