-- CreateEnum
CREATE TYPE "MealSource" AS ENUM ('manual', 'scan');

-- AlterTable
ALTER TABLE "meal_log" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "source" "MealSource" NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "water_log" (
    "id" TEXT NOT NULL,
    "logDate" DATE NOT NULL,
    "glasses" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "water_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "water_log_userId_logDate_key" ON "water_log"("userId", "logDate");

-- AddForeignKey
ALTER TABLE "water_log" ADD CONSTRAINT "water_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
