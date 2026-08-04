/**
 * One-off: list incomplete WorkoutSession rows (no deletes).
 * Usage: npx tsx scripts/list-orphan-sessions.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../prisma/generated/client";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  const sessions = await prisma.workoutSession.findMany({
    where: { completedAt: null },
    include: {
      user: { select: { id: true, email: true, name: true } },
      exercises: { select: { id: true, exerciseName: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  console.log(`Found ${sessions.length} incomplete session(s):\n`);
  for (const s of sessions) {
    const ageMs = Date.now() - s.startedAt.getTime();
    const ageHours = (ageMs / 3_600_000).toFixed(1);
    console.log(
      JSON.stringify(
        {
          id: s.id,
          startedAt: s.startedAt.toISOString(),
          ageHours: Number(ageHours),
          notes: s.notes,
          exerciseCount: s.exercises.length,
          exercises: s.exercises.map((e) => e.exerciseName),
          user: s.user,
        },
        null,
        2,
      ),
    );
    console.log("---");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
