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
CREATE TYPE "NotificationType" AS ENUM ('ORDER_ACCEPTED', 'ORDER_CANCELLED', 'ORDER_COMPLETED', 'NEGOTIATION_OFFER', 'NEGOTIATION_ACCEPTED', 'NEGOTIATION_REJECTED', 'WORK_STARTED', 'WORK_DONE', 'PAYMENT_REQUIRED', 'PAYMENT_RECEIVED', 'PAYOUT_COMPLETED', 'DISPUTE_OPENED', 'DISPUTE_UPDATED', 'DISPUTE_RESOLVED', 'REFUND_PROCESSED', 'WITHDRAW_REQUESTED', 'WITHDRAW_APPROVED', 'WITHDRAW_REJECTED', 'ADMIN_ACTION');

-- CreateEnum
CREATE TYPE "BroadcastTargetRole" AS ENUM ('WORKER', 'CLIENT', 'ALL');

-- CreateEnum
CREATE TYPE "OrderMode" AS ENUM ('DIRECT', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED');

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
ALTER TABLE "reports" ADD COLUMN     "conversationId" TEXT,
ALTER COLUMN "targetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastNotificationReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "worker_occupied_time_slots" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

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
CREATE UNIQUE INDEX "payout_methods_workerProfileId_accountNumber_key" ON "payout_methods"("workerProfileId", "accountNumber");

-- CreateIndex
CREATE INDEX "sessions_userId_isRevoked_idx" ON "sessions"("userId", "isRevoked");

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

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
