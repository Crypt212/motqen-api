-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "worker_profiles" ALTER COLUMN "rate" SET DEFAULT -1.0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL DEFAULT -1.0;
ALTER TABLE "orders" ADD COLUMN     "comment" TEXT;
