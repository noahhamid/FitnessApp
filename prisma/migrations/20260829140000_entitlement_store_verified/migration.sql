-- AlterTable
ALTER TABLE "user_entitlement" ADD COLUMN "storeVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_entitlement" ADD COLUMN "originalTransactionId" TEXT;
ALTER TABLE "user_entitlement" ADD COLUMN "purchaseToken" TEXT;

-- Existing rows were client-claimed. Clear spoofable transaction ids
-- so the unique indexes can apply, then require a real store verify.
UPDATE "user_entitlement"
SET "storeVerified" = false, "isPremium" = false, "transactionId" = NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_entitlement_transactionId_key" ON "user_entitlement"("transactionId");
CREATE UNIQUE INDEX "user_entitlement_originalTransactionId_key" ON "user_entitlement"("originalTransactionId");
