/*
  Warnings:

  - The values [TIME_SPECIFIED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endDate` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workerProfileId,accountNumber]` on the table `payout_methods` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estimatedDurationHours` to the `negotiations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposalId` to the `negotiations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `negotiations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AdminAuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AdminAuditCategory" AS ENUM ('AUTH', 'ADMIN_MANAGEMENT', 'USER_MANAGEMENT', 'FINANCIAL', 'ISSUES', 'SUPPORT_CHAT', 'REPORT_MODERATION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_ACCEPTED', 'ORDER_CANCELLED', 'ORDER_COMPLETED', 'NEGOTIATION_OFFER', 'NEGOTIATION_ACCEPTED', 'NEGOTIATION_REJECTED', 'WORK_STARTED', 'WORK_DONE', 'PAYMENT_REQUIRED', 'PAYMENT_RECEIVED', 'PAYOUT_COMPLETED', 'DISPUTE_OPENED', 'DISPUTE_UPDATED', 'DISPUTE_RESOLVED', 'REFUND_PROCESSED', 'WITHDRAW_REQUESTED', 'WITHDRAW_APPROVED', 'WITHDRAW_REJECTED', 'ADMIN_ACTION');

-- CreateEnum
CREATE TYPE "BroadcastTargetRole" AS ENUM ('WORKER', 'CLIENT', 'ALL');

-- CreateEnum
CREATE TYPE "OrderMode" AS ENUM ('DIRECT', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED');

-- CreateEnum
CREATE TYPE "VerificationRejectionReason" AS ENUM ('BLURRY_IMAGE', 'EXPIRED_ID', 'MISMATCHED_PERSON', 'MISSING_DOCUMENT', 'INVALID_DOCUMENT', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'OPEN', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_workerProfileId_fkey";

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN     "assignedAdminId" TEXT,
ADD COLUMN     "assignedDepartment" "AdminRole";

-- AlterTable
ALTER TABLE "negotiations" ADD COLUMN     "estimatedDurationHours" INTEGER NOT NULL,
ADD COLUMN     "proposalId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "endDate",
ADD COLUMN     "estimatedDurationHours" INTEGER,
ADD COLUMN     "initialPrice" DOUBLE PRECISION,
ADD COLUMN     "orderMode" "OrderMode" NOT NULL DEFAULT 'DIRECT',
ALTER COLUMN "workerProfileId" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payout_methods" ALTER COLUMN "isVerified" SET DEFAULT true;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "assignedAdminId" TEXT,
ADD COLUMN     "assignedDepartment" "AdminRole";

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastNotificationReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "verifications" ADD COLUMN     "assignedAdminId" TEXT,
ADD COLUMN     "assignedDepartment" "AdminRole",
ADD COLUMN     "rejectionNote" TEXT,
ADD COLUMN     "rejectionReasons" "VerificationRejectionReason"[];

-- AlterTable
ALTER TABLE "worker_occupied_time_slots" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPER_ADMIN',
    "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "deviceId" TEXT NOT NULL,
    "fcmToken" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actorAdminId" TEXT,
    "actorUsername" TEXT,
    "actorRole" "AdminRole",
    "action" TEXT NOT NULL,
    "category" "AdminAuditCategory" NOT NULL,
    "severity" "AdminAuditSeverity" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcasts" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "targetRole" "BroadcastTargetRole",
    "targetGovId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_notes" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "authorAdminId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_assignment_history" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "previousAdminId" TEXT,
    "newAdminId" TEXT,
    "previousDepartment" "AdminRole",
    "newDepartment" "AdminRole",
    "event" TEXT NOT NULL,
    "note" TEXT,
    "actorAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_isRevoked_idx" ON "admin_sessions"("adminId", "isRevoked");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_severity_idx" ON "admin_audit_logs"("severity");

-- CreateIndex
CREATE INDEX "admin_audit_logs_actorAdminId_idx" ON "admin_audit_logs"("actorAdminId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_category_createdAt_idx" ON "admin_audit_logs"("category", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_isSent_createdAt_idx" ON "notifications"("isSent", "createdAt");

-- CreateIndex
CREATE INDEX "broadcasts_targetRole_createdAt_idx" ON "broadcasts"("targetRole", "createdAt");

-- CreateIndex
CREATE INDEX "broadcasts_targetGovId_createdAt_idx" ON "broadcasts"("targetGovId", "createdAt");

-- CreateIndex
CREATE INDEX "proposals_orderId_idx" ON "proposals"("orderId");

-- CreateIndex
CREATE INDEX "proposals_workerProfileId_idx" ON "proposals"("workerProfileId");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_orderId_workerProfileId_key" ON "proposals"("orderId", "workerProfileId");

-- CreateIndex
CREATE INDEX "issue_notes_targetType_targetId_idx" ON "issue_notes"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "issue_assignment_history_targetType_targetId_idx" ON "issue_assignment_history"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "payout_methods_workerProfileId_accountNumber_key" ON "payout_methods"("workerProfileId", "accountNumber");

-- CreateIndex
CREATE INDEX "sessions_userId_isRevoked_idx" ON "sessions"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "verifications_assignedDepartment_status_idx" ON "verifications"("assignedDepartment", "status");

-- CreateIndex
CREATE INDEX "verifications_assignedAdminId_idx" ON "verifications"("assignedAdminId");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_payoutMethodId_fkey" FOREIGN KEY ("payoutMethodId") REFERENCES "payout_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
