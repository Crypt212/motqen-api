/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderReference]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderReference" TEXT,
ADD COLUMN     "referenceNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_referenceNumber_key" ON "orders"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderReference_key" ON "orders"("orderReference");
