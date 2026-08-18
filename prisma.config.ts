// Prisma 7: connection URLs live here, not in schema.prisma.
// DATABASE_URL (pooled) → runtime PrismaClient; DIRECT_URL → CLI migrations.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` (postinstall) must work on EAS without secrets.
    // Migrations / the API still set DIRECT_URL in .env.local.
    url:
      process.env.DIRECT_URL ??
      "postgresql://prisma:prisma@127.0.0.1:5432/prisma",
  },
});