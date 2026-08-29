import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../prisma/generated/client/index.js";

config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const before = await prisma.rateLimit.findMany();
console.log(`Found ${before.length} rate-limit row(s).`);
for (const row of before) {
  console.log(`  key=${row.key} count=${row.count}`);
}

const result = await prisma.rateLimit.deleteMany();
console.log(`Cleared ${result.count} auth rate-limit row(s).`);

// Raw wipe in case Better Auth wrote unexpected keys.
try {
  const raw = await prisma.$executeRawUnsafe(`DELETE FROM "rateLimit"`);
  console.log(`Raw DELETE affected ${raw} row(s).`);
} catch (e) {
  console.warn("Raw delete skipped:", e instanceof Error ? e.message : e);
}

await prisma.$disconnect();
