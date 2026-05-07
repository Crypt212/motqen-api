/*
  Warnings:

  - Made the column `senderId` on table `negotiations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "negotiations" ALTER COLUMN "senderId" SET NOT NULL;
