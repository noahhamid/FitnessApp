/**
 * Dev-only Pro switch. Writes the user_entitlement row the app reads, so you
 * can use Pro features without a store account.
 *
 *   node scripts/grant-premium.mjs you@example.com
 *   node scripts/grant-premium.mjs you@example.com --revoke
 *
 * Writes to whatever DATABASE_URL in .env.local points at — the host is
 * printed before the write so you can check it isn't production.
 */
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../prisma/generated/client/index.js";

config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

/** Keep in sync with PREMIUM_MONTHLY_SKU in src/features/billing/skus.ts. */
const PREMIUM_SKU = "com.exo.fitness.premium.monthly";

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email || email.startsWith("--")) {
  console.error("Usage: node scripts/grant-premium.mjs <email> [--revoke]");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set (checked .env.local).");
  process.exit(1);
}

console.log(`Database: ${new URL(connectionString).host}`);
console.log(`User:     ${email}`);
console.log(`Action:   ${revoke ? "revoke" : "grant"} Pro\n`);

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true },
});

if (!user) {
  console.error(`No user with email ${email}. Sign up in the app first.`);
  await prisma.$disconnect();
  process.exit(1);
}

// platform "dev" so this row is obviously not a real store purchase.
// transactionId stays null to avoid colliding with the unique indexes.
const data = revoke
  ? { isPremium: false, storeVerified: false, productId: null, expiresAt: null }
  : {
      isPremium: true,
      storeVerified: true,
      productId: PREMIUM_SKU,
      platform: "dev",
      expiresAt: null,
    };

const row = await prisma.userEntitlement.upsert({
  where: { userId: user.id },
  create: { userId: user.id, ...data },
  update: data,
});

console.log(
  `Done. isPremium=${row.isPremium} storeVerified=${row.storeVerified} productId=${row.productId ?? "null"}`,
);
console.log("Restart the app (or pull to refresh) to pick it up.");

await prisma.$disconnect();
