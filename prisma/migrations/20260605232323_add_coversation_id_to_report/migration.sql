-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RATING';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_ORDER';
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_RATED';
ALTER TYPE "NotificationType" ADD VALUE 'TEST_NOTIFICATION';

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "conversationId" TEXT,
ALTER COLUMN "targetId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
