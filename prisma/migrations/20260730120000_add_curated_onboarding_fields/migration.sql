-- CreateEnum
CREATE TYPE "Pace" AS ENUM ('slow', 'moderate', 'aggressive');

-- AlterTable
ALTER TABLE "user_profile"
  ADD COLUMN "goalDetail" TEXT,
  ADD COLUMN "targetWeightKg" DECIMAL(6,2),
  ADD COLUMN "pace" "Pace",
  ADD COLUMN "focusAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "bodyIssues" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "injuries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "reminderEnabled" BOOLEAN DEFAULT true,
  ADD COLUMN "reminderHour" INTEGER;
