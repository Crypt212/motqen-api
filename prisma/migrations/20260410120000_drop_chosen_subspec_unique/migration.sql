-- Allow multiple workers to offer the same sub-specialization.
-- Composite @@id([workerProfileId, subSpecializationId]) already enforces one row per worker per sub.
ALTER TABLE "chosen_specializations" DROP CONSTRAINT IF EXISTS "chosen_specializations_subSpecializationId_key";
