/**
 * One-off: delete all incomplete WorkoutSession rows for a user.
 * Usage: npx tsx scripts/delete-orphan-sessions.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../prisma/generated/client";

neonConfig.webSocketConstructor = ws;

const TARGET_EMAIL = "test1@gmail.com";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
  });
  if (!user) {
    console.error(`User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const orphanIds = (
    await prisma.workoutSession.findMany({
      where: { userId: user.id, completedAt: null },
      select: { id: true },
    })
  ).map((s) => s.id);

  console.log(`Deleting ${orphanIds.length} incomplete session(s) for ${TARGET_EMAIL}…`);

  // Cascade deletes WorkoutExercise via FK onDelete
  const result = await prisma.workoutSession.deleteMany({
    where: { id: { in: orphanIds }, userId: user.id, completedAt: null },
  });

  console.log(`Deleted ${result.count} session(s).`);

  const remaining = await prisma.workoutSession.count({
    where: { userId: user.id, completedAt: null },
  });
  console.log(`Remaining incomplete for this user: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
