/*
  Warnings:

  - The values [OPEN] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AdminAuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AdminAuditCategory" AS ENUM ('AUTH', 'ADMIN_MANAGEMENT', 'USER_MANAGEMENT', 'FINANCIAL', 'ISSUES', 'SUPPORT_CHAT', 'REPORT_MODERATION');

-- AlterEnum
ALTER TYPE "NegotiationStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

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

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_isRevoked_idx" ON "admin_sessions"("adminId", "isRevoked");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
