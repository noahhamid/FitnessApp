-- Workout history and personal-records both filter by userId and order by
-- completedAt. Without this they sequential-scan a table that grows with every
-- user, then sort in memory.
-- CreateIndex
CREATE INDEX "workout_session_userId_completedAt_idx" ON "workout_session"("userId", "completedAt");

-- Google RTDN resolves a notification to a row by purchaseToken.
-- CreateIndex
CREATE INDEX "user_entitlement_purchaseToken_idx" ON "user_entitlement"("purchaseToken");
