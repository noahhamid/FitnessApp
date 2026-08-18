// Prisma 7: connection URLs live here, not in schema.prisma.
// DATABASE_URL (pooled) → runtime PrismaClient; DIRECT_URL → CLI migrations.
//
// Do NOT use env("DIRECT_URL") here — that throws when the var is missing and
// breaks `npm install` postinstall (prisma generate) on EAS, where .env* is
// not uploaded. A placeholder is enough for client generation.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config();

const datasourceUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://127.0.0.1:5432/prisma_generate_placeholder";

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
