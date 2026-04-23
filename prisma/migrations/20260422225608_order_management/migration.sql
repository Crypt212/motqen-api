/*
  Warnings:

  - The values [PAID_FAILED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `date` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `OrderImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `worker_occupied_timeslots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `startDate` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "OrderImage" DROP CONSTRAINT "OrderImage_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_workerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "worker_occupied_timeslots" DROP CONSTRAINT "worker_occupied_timeslots_orderId_fkey";

-- DropForeignKey
ALTER TABLE "worker_occupied_timeslots" DROP CONSTRAINT "worker_occupied_timeslots_workerProfileId_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "type",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workFinishedAt" TIMESTAMP(3),
ADD COLUMN     "workStartedAt" TIMESTAMP(3),
ALTER COLUMN "workerProfileId" DROP NOT NULL;

-- DropTable
DROP TABLE "OrderImage";

-- DropTable
DROP TABLE "worker_occupied_timeslots";

-- CreateTable
CREATE TABLE "worker_occupied_time_slots" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_occupied_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_images" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "worker_occupied_time_slots_orderId_key" ON "worker_occupied_time_slots"("orderId");

-- CreateIndex
CREATE INDEX "worker_occupied_time_slots_workerProfileId_idx" ON "worker_occupied_time_slots"("workerProfileId");

-- CreateIndex
CREATE INDEX "order_images_orderId_idx" ON "order_images"("orderId");

-- CreateIndex
CREATE INDEX "orders_clientProfileId_idx" ON "orders"("clientProfileId");

-- CreateIndex
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");

-- CreateIndex
CREATE INDEX "orders_locationId_idx" ON "orders"("locationId");

-- AddForeignKey
ALTER TABLE "worker_occupied_time_slots" ADD CONSTRAINT "worker_occupied_time_slots_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_occupied_time_slots" ADD CONSTRAINT "worker_occupied_time_slots_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_images" ADD CONSTRAINT "order_images_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_orders_worker_id" RENAME TO "orders_workerProfileId_idx";
