-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('SMS', 'WhatsApp');

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "deviceFingerprint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "governmentId" TEXT,
    "cityId" TEXT,
    "bio" TEXT,
    "profileImage" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'SUSPENDED',
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "isInTeam" BOOLEAN NOT NULL,
    "acceptsUrgentJobs" BOOLEAN NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chosen_specializations" (
    "workerProfileId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,

    CONSTRAINT "chosen_specializations_pkey" PRIMARY KEY ("workerProfileId","specializationId")
);

-- CreateTable
CREATE TABLE "chosen_sub_specializations" (
    "workerProfileId" TEXT NOT NULL,
    "subSpecializationId" TEXT NOT NULL,
    "chosenSpecializationId" TEXT NOT NULL,

    CONSTRAINT "chosen_sub_specializations_pkey" PRIMARY KEY ("chosenSpecializationId","subSpecializationId")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_specializations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainSpecializationId" TEXT NOT NULL,

    CONSTRAINT "sub_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governments_for_workers" (
    "workerProfileId" TEXT NOT NULL,
    "governmentId" TEXT NOT NULL,

    CONSTRAINT "governments_for_workers_pkey" PRIMARY KEY ("workerProfileId","governmentId")
);

-- CreateTable
CREATE TABLE "governments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "governments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "governmentId" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_userId_key" ON "client_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_userId_key" ON "worker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chosen_sub_specializations_chosenSpecializationId_subSpecia_key" ON "chosen_sub_specializations"("chosenSpecializationId", "subSpecializationId");

-- CreateIndex
CREATE INDEX "specializations_name_idx" ON "specializations"("name");

-- CreateIndex
CREATE INDEX "sub_specializations_name_idx" ON "sub_specializations"("name");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "governments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chosen_specializations" ADD CONSTRAINT "chosen_specializations_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chosen_specializations" ADD CONSTRAINT "chosen_specializations_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chosen_sub_specializations" ADD CONSTRAINT "chosen_sub_specializations_subSpecializationId_fkey" FOREIGN KEY ("subSpecializationId") REFERENCES "sub_specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chosen_sub_specializations" ADD CONSTRAINT "chosen_sub_specializations_workerProfileId_chosenSpecializ_fkey" FOREIGN KEY ("workerProfileId", "chosenSpecializationId") REFERENCES "chosen_specializations"("workerProfileId", "specializationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_specializations" ADD CONSTRAINT "sub_specializations_mainSpecializationId_fkey" FOREIGN KEY ("mainSpecializationId") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governments_for_workers" ADD CONSTRAINT "governments_for_workers_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governments_for_workers" ADD CONSTRAINT "governments_for_workers_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "governments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "governments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
