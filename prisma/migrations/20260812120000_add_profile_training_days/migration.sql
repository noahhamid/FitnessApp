-- Chosen training weekdays, Monday-indexed (0=Mon … 6=Sun).
-- Empty array keeps the previous behaviour: the fixed pattern for daysPerWeek.
ALTER TABLE "user_profile"
  ADD COLUMN "trainingDays" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
