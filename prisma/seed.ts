import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";

type SeedExercise = {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
  instructions?: string | null;
};

// Curated from hasaneyldrm/exercises-dataset (MIT metadata only — no media).
// Regenerate via: npx tsx scripts/curate-exercises.ts
const EXERCISES: SeedExercise[] = JSON.parse(
  readFileSync(join(__dirname, "data", "curated-exercises.json"), "utf8"),
);

async function main() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);

  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        muscleGroup: ex.muscleGroup as any,
        movementPattern: ex.movementPattern as any,
        minEquipment: ex.minEquipment as any,
        instructions: ex.instructions ?? null,
      },
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup as any,
        movementPattern: ex.movementPattern as any,
        minEquipment: ex.minEquipment as any,
        instructions: ex.instructions ?? null,
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
