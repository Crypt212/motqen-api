-- AlterTable
ALTER TABLE "escrow_holds" ADD COLUMN "assignedDepartment" "AdminRole",
ADD COLUMN "assignedAdminId" TEXT;

-- AlterTable
ALTER TABLE "withdraw_requests" ADD COLUMN "assignedDepartment" "AdminRole",
ADD COLUMN "assignedAdminId" TEXT;

-- AlterTable
ALTER TABLE "refunds" ADD COLUMN "assignedDepartment" "AdminRole",
ADD COLUMN "assignedAdminId" TEXT;

-- CreateIndex
CREATE INDEX "escrow_holds_assignedDepartment_status_idx" ON "escrow_holds"("assignedDepartment", "status");

-- CreateIndex
CREATE INDEX "escrow_holds_assignedAdminId_idx" ON "escrow_holds"("assignedAdminId");

-- CreateIndex
CREATE INDEX "withdraw_requests_assignedDepartment_status_idx" ON "withdraw_requests"("assignedDepartment", "status");

-- CreateIndex
CREATE INDEX "withdraw_requests_assignedAdminId_idx" ON "withdraw_requests"("assignedAdminId");

-- CreateIndex
CREATE INDEX "refunds_assignedDepartment_idx" ON "refunds"("assignedDepartment");

-- CreateIndex
CREATE INDEX "refunds_assignedAdminId_idx" ON "refunds"("assignedAdminId");

-- Backfill withdraw request ownership from processedBy
UPDATE "withdraw_requests"
SET "assignedAdminId" = "processedBy",
    "assignedDepartment" = 'FINANCIAL_MONITOR'
WHERE "processedBy" IS NOT NULL;
