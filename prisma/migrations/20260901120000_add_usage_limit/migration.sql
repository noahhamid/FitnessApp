-- Per-user quotas for paid endpoints (Gemini scans, Blob uploads).
-- Must be in Postgres: an in-memory counter resets on every Vercel cold start.

-- CreateTable
CREATE TABLE "usage_limit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_limit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Also the conflict target for the atomic increment in src/lib/usage-limit.ts.
CREATE UNIQUE INDEX "usage_limit_userId_feature_key" ON "usage_limit"("userId", "feature");

-- AddForeignKey
ALTER TABLE "usage_limit" ADD CONSTRAINT "usage_limit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
