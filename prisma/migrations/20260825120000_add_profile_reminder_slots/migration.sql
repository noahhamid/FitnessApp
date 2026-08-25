-- Per-slot reminder toggles. Existing users keep all five on.
ALTER TABLE "user_profile"
  ADD COLUMN "reminderSlots" TEXT[] NOT NULL DEFAULT ARRAY['breakfast', 'lunch', 'snack', 'dinner', 'workout']::TEXT[];
