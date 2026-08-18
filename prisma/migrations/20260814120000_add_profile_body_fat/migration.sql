-- Optional body-fat % collected in onboarding (range midpoint or typed).
-- Null means protein/predictions fall back to the BMI estimate.
CREATE TYPE "BodyFatSource" AS ENUM ('measured', 'range');

ALTER TABLE "user_profile"
  ADD COLUMN "bodyFatPercent" DECIMAL(4, 1),
  ADD COLUMN "bodyFatSource" "BodyFatSource";
