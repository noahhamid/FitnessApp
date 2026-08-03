-- CreateTable
CREATE TABLE "planned_extra_exercise" (
    "id" TEXT NOT NULL,
    "logDate" DATE NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "movementPattern" "MovementPattern" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "planned_extra_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planned_extra_exercise_userId_logDate_exerciseName_key" ON "planned_extra_exercise"("userId", "logDate", "exerciseName");

-- AddForeignKey
ALTER TABLE "planned_extra_exercise" ADD CONSTRAINT "planned_extra_exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
