import { prisma } from "../src/lib/prisma";

// minEquipment = the LOWEST tier that can perform this exercise.
// bodyweight < home_dumbbells < full_gym (see src/lib/equipment-rank.ts)
const EXERCISES: {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
}[] = [
  // --- Chest ---
  { name: "Barbell Bench Press", muscleGroup: "chest", movementPattern: "push", minEquipment: "full_gym" },
  { name: "Dumbbell Bench Press", muscleGroup: "chest", movementPattern: "push", minEquipment: "home_dumbbells" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", movementPattern: "push", minEquipment: "home_dumbbells" },
  { name: "Push-Up", muscleGroup: "chest", movementPattern: "push", minEquipment: "bodyweight" },
  { name: "Cable Fly", muscleGroup: "chest", movementPattern: "push", minEquipment: "full_gym" },
  { name: "Dumbbell Fly", muscleGroup: "chest", movementPattern: "push", minEquipment: "home_dumbbells" },

  // --- Back ---
  { name: "Barbell Row", muscleGroup: "back", movementPattern: "pull", minEquipment: "full_gym" },
  { name: "Dumbbell Row", muscleGroup: "back", movementPattern: "pull", minEquipment: "home_dumbbells" },
  { name: "Lat Pulldown", muscleGroup: "back", movementPattern: "pull", minEquipment: "full_gym" },
  { name: "Pull-Up", muscleGroup: "back", movementPattern: "pull", minEquipment: "bodyweight" },
  { name: "Inverted Row", muscleGroup: "back", movementPattern: "pull", minEquipment: "bodyweight" },
  { name: "Seated Cable Row", muscleGroup: "back", movementPattern: "pull", minEquipment: "full_gym" },

  // --- Shoulders ---
  { name: "Overhead Barbell Press", muscleGroup: "shoulders", movementPattern: "push", minEquipment: "full_gym" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", movementPattern: "push", minEquipment: "home_dumbbells" },
  { name: "Pike Push-Up", muscleGroup: "shoulders", movementPattern: "push", minEquipment: "bodyweight" },
  { name: "Lateral Raise", muscleGroup: "shoulders", movementPattern: "push", minEquipment: "home_dumbbells" },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", movementPattern: "pull", minEquipment: "home_dumbbells" },

  // --- Biceps ---
  { name: "Barbell Curl", muscleGroup: "biceps", movementPattern: "pull", minEquipment: "full_gym" },
  { name: "Dumbbell Curl", muscleGroup: "biceps", movementPattern: "pull", minEquipment: "home_dumbbells" },
  { name: "Chin-Up", muscleGroup: "biceps", movementPattern: "pull", minEquipment: "bodyweight" },

  // --- Triceps ---
  { name: "Cable Triceps Pushdown", muscleGroup: "triceps", movementPattern: "push", minEquipment: "full_gym" },
  { name: "Dumbbell Overhead Extension", muscleGroup: "triceps", movementPattern: "push", minEquipment: "home_dumbbells" },
  { name: "Diamond Push-Up", muscleGroup: "triceps", movementPattern: "push", minEquipment: "bodyweight" },
  { name: "Bench Dip", muscleGroup: "triceps", movementPattern: "push", minEquipment: "bodyweight" },

  // --- Quads ---
  { name: "Barbell Back Squat", muscleGroup: "quads", movementPattern: "squat", minEquipment: "full_gym" },
  { name: "Goblet Squat", muscleGroup: "quads", movementPattern: "squat", minEquipment: "home_dumbbells" },
  { name: "Bodyweight Squat", muscleGroup: "quads", movementPattern: "squat", minEquipment: "bodyweight" },
  { name: "Walking Lunge", muscleGroup: "quads", movementPattern: "squat", minEquipment: "bodyweight" },
  { name: "Leg Press", muscleGroup: "quads", movementPattern: "squat", minEquipment: "full_gym" },
  { name: "Bulgarian Split Squat", muscleGroup: "quads", movementPattern: "squat", minEquipment: "home_dumbbells" },

  // --- Hamstrings / Glutes ---
  { name: "Barbell Romanian Deadlift", muscleGroup: "hamstrings", movementPattern: "hinge", minEquipment: "full_gym" },
  { name: "Dumbbell Romanian Deadlift", muscleGroup: "hamstrings", movementPattern: "hinge", minEquipment: "home_dumbbells" },
  { name: "Nordic Curl", muscleGroup: "hamstrings", movementPattern: "hinge", minEquipment: "bodyweight" },
  { name: "Glute Bridge", muscleGroup: "glutes", movementPattern: "hinge", minEquipment: "bodyweight" },
  { name: "Hip Thrust", muscleGroup: "glutes", movementPattern: "hinge", minEquipment: "home_dumbbells" },
  { name: "Single-Leg Glute Bridge", muscleGroup: "glutes", movementPattern: "hinge", minEquipment: "bodyweight" },

  // --- Calves ---
  { name: "Standing Calf Raise", muscleGroup: "calves", movementPattern: "squat", minEquipment: "full_gym" },
  { name: "Dumbbell Calf Raise", muscleGroup: "calves", movementPattern: "squat", minEquipment: "home_dumbbells" },
  { name: "Bodyweight Calf Raise", muscleGroup: "calves", movementPattern: "squat", minEquipment: "bodyweight" },

  // --- Core ---
  { name: "Hanging Leg Raise", muscleGroup: "core", movementPattern: "carry", minEquipment: "full_gym" },
  { name: "Plank", muscleGroup: "core", movementPattern: "carry", minEquipment: "bodyweight" },
  { name: "Cable Crunch", muscleGroup: "core", movementPattern: "carry", minEquipment: "full_gym" },
  { name: "Dead Bug", muscleGroup: "core", movementPattern: "carry", minEquipment: "bodyweight" },
  { name: "Russian Twist", muscleGroup: "core", movementPattern: "carry", minEquipment: "bodyweight" },
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
      },
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup as any,
        movementPattern: ex.movementPattern as any,
        minEquipment: ex.minEquipment as any,
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