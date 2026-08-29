import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";

type SeedExercise = {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
  /** Omitted means floor-only. True = needs a bench, bar, wall or step. */
  needsProp?: boolean;
  instructions?: string | null;
};

// Curated from hasaneyldrm/exercises-dataset (MIT metadata only — no media).
// Regenerate via: npx tsx scripts/curate-exercises.ts
const CURATED: SeedExercise[] = JSON.parse(
  readFileSync(join(__dirname, "data", "curated-exercises.json"), "utf8"),
);
// Hand-authored mobility / finisher moves used by plan-blocks.ts.
const BLOCKS: SeedExercise[] = JSON.parse(
  readFileSync(join(__dirname, "data", "block-exercises.json"), "utf8"),
);
// Hand-authored floor-only moves so a bodyweight plan can rotate without
// ever asking for a bench, bar or step.
const FLOOR: SeedExercise[] = JSON.parse(
  readFileSync(join(__dirname, "data", "floor-exercises.json"), "utf8"),
);
// Rows from the original pre-curation seed that survive under slightly
// different names (Pull-Up vs Pull-up). Listed only to carry their needsProp
// tag, so instructions are deliberately omitted — the update below leaves
// existing text alone when a row has none.
const LEGACY_PROPS: SeedExercise[] = JSON.parse(
  readFileSync(join(__dirname, "data", "legacy-prop-exercises.json"), "utf8"),
);
const EXERCISES: SeedExercise[] = [
  ...CURATED,
  ...BLOCKS,
  ...FLOOR,
  ...LEGACY_PROPS,
];

async function main() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);

  for (const ex of EXERCISES) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        muscleGroup: ex.muscleGroup as any,
        movementPattern: ex.movementPattern as any,
        minEquipment: ex.minEquipment as any,
        needsProp: ex.needsProp ?? false,
        instructions: ex.instructions ?? undefined,
      },
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup as any,
        movementPattern: ex.movementPattern as any,
        minEquipment: ex.minEquipment as any,
        needsProp: ex.needsProp ?? false,
        instructions: ex.instructions ?? null,
      },
    });
  }

  const keepNames = new Set(EXERCISES.map((e) => e.name));
  const stale = await prisma.exercise.findMany({
    where: { name: { notIn: [...keepNames] } },
    select: {
      id: true,
      name: true,
      _count: { select: { planExercises: true } },
    },
  });

  for (const ex of stale) {
    if (ex._count.planExercises > 0) {
      console.warn(`Skipping remove "${ex.name}" — still referenced in plans`);
      continue;
    }
    await prisma.exercise.delete({ where: { id: ex.id } });
    console.log(`Removed stale exercise: ${ex.name}`);
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
