// Prisma 7: connection URLs live here, not in schema.prisma.
// DATABASE_URL (pooled) → runtime PrismaClient; DIRECT_URL → CLI migrations.
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});