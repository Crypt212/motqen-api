/*
  Warnings:

  - You are about to drop the column `daysOfWeek` on the `worker_availability` table. All the data in the column will be lost.
  - You are about to drop the column `workingHoursId` on the `worker_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workerProfileId,day]` on the table `worker_availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `worker_availability` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- DropForeignKey
ALTER TABLE "worker_profiles" DROP CONSTRAINT "worker_profiles_workingHoursId_fkey";

-- DropIndex
DROP INDEX "worker_availability_workerProfileId_key";

-- DropIndex
DROP INDEX "worker_profiles_workingHoursId_key";

-- AlterTable
ALTER TABLE "worker_availability" DROP COLUMN "daysOfWeek",
ADD COLUMN     "day" "Day" NOT NULL;

-- AlterTable
ALTER TABLE "worker_profiles" DROP COLUMN "workingHoursId";

-- CreateIndex
CREATE UNIQUE INDEX "worker_availability_workerProfileId_day_key" ON "worker_availability"("workerProfileId", "day");

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
