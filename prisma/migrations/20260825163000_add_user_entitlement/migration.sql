CREATE TABLE "user_entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT,
    "platform" TEXT,
    "transactionId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_entitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_entitlement_userId_key" ON "user_entitlement"("userId");

ALTER TABLE "user_entitlement"
    ADD CONSTRAINT "user_entitlement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
