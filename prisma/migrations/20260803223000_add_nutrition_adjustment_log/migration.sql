-- CreateTable
CREATE TABLE "nutrition_adjustment_log" (
    "id" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldCalories" INTEGER NOT NULL,
    "newCalories" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "nutrition_adjustment_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_adjustment_log_userId_appliedAt_idx" ON "nutrition_adjustment_log"("userId", "appliedAt");

-- AddForeignKey
ALTER TABLE "nutrition_adjustment_log" ADD CONSTRAINT "nutrition_adjustment_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
