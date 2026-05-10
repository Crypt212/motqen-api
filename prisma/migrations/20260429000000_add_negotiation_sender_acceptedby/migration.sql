-- AlterTable: Add senderId (required) and acceptedBy (nullable) to negotiations

-- Add acceptedBy (nullable, no default needed)
ALTER TABLE "negotiations" ADD COLUMN "acceptedBy" TEXT;

-- Add senderId as nullable first so we can backfill if needed
ALTER TABLE "negotiations" ADD COLUMN "senderId" TEXT;

-- Add foreign key constraints
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_acceptedBy_fkey"
  FOREIGN KEY ("acceptedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "negotiations_orderId_idx" ON "negotiations"("orderId");
CREATE INDEX "negotiations_senderId_idx" ON "negotiations"("senderId");
