/*
  Warnings:

  - Added the required column `equipment` to the `workout_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `splitLabel` to the `workout_plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workout_plan" ADD COLUMN     "equipment" "EquipmentAccess" NOT NULL,
ADD COLUMN     "splitLabel" TEXT NOT NULL;
