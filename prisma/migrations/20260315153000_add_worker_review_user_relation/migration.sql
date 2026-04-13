CREATE TABLE IF NOT EXISTS "WorkerReview" (
	"id" TEXT NOT NULL,
	"workerProfileId" TEXT NOT NULL,
	"rating" DOUBLE PRECISION NOT NULL,
	"comment" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "WorkerReview_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "WorkerReview_workerProfileId_fkey"
	  FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "WorkerReview" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "WorkerReview_userId_idx" ON "WorkerReview"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "WorkerReview_workerProfileId_userId_unique"
ON "WorkerReview"("workerProfileId", "userId")
WHERE "userId" IS NOT NULL;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'WorkerReview_userId_fkey'
	) THEN
		ALTER TABLE "WorkerReview"
		ADD CONSTRAINT "WorkerReview_userId_fkey"
		FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;
END $$;
