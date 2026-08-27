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

const result = await prisma.rateLimit.deleteMany();
console.log(`Cleared ${result.count} auth rate-limit row(s).`);
await prisma.$disconnect();
