-- AlterTable
ALTER TABLE "negotiations" ADD COLUMN "senderId" TEXT NOT NULL,
                           ADD COLUMN "acceptedBy" TEXT;

-- CreateIndex
CREATE INDEX "negotiations_orderId_idx" ON "negotiations"("orderId");

-- CreateIndex
CREATE INDEX "negotiations_senderId_idx" ON "negotiations"("senderId");

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
