/*
  Warnings:

  - You are about to drop the column `daysOfWeek` on the `worker_availability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workerProfileId,day]` on the table `worker_availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `worker_availability` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- DropForeignKey
ALTER TABLE "worker_profiles" DROP CONSTRAINT "worker_profiles_workingHoursId_fkey";

-- AlterTable
ALTER TABLE "worker_availability" DROP COLUMN "daysOfWeek",
ADD COLUMN     "day" "Day" NOT NULL;

-- CreateTable
CREATE TABLE "_DayWorkingHoursToWorkerProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DayWorkingHoursToWorkerProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DayWorkingHoursToWorkerProfile_B_index" ON "_DayWorkingHoursToWorkerProfile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "worker_availability_workerProfileId_day_key" ON "worker_availability"("workerProfileId", "day");

-- AddForeignKey
ALTER TABLE "_DayWorkingHoursToWorkerProfile" ADD CONSTRAINT "_DayWorkingHoursToWorkerProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "worker_availability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DayWorkingHoursToWorkerProfile" ADD CONSTRAINT "_DayWorkingHoursToWorkerProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
