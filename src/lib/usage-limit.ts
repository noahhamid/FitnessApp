import { prisma } from "./prisma";

/** Endpoints whose cost we cap per user. Values are stored, so don't rename. */
export type UsageFeature = "food-scan" | "meal-photo";

export type UsageQuota = {
  feature: UsageFeature;
  max: number;
  windowMs: number;
};

const HOUR_MS = 60 * 60 * 1000;

/** Each scan is a billed Gemini call. */
export const FOOD_SCAN_QUOTA: UsageQuota = {
  feature: "food-scan",
  max: 20,
  windowMs: HOUR_MS,
};

/** Each upload is permanent Blob storage we pay to keep and serve. */
export const MEAL_PHOTO_QUOTA: UsageQuota = {
  feature: "meal-photo",
  max: 40,
  windowMs: HOUR_MS,
};

/**
 * Consume one unit of a per-user quota. Returns false once the window is spent.
 *
 * Counters live in Postgres, not memory: Vercel runs many short-lived instances
 * and each would get its own copy, resetting on every cold start — so an
 * in-memory Map is not a limit at all in production. Same reasoning as the
 * Better Auth `rateLimit` table.
 *
 * The read-modify-write is a single statement so two simultaneous requests
 * can't both observe the same count and both be let through.
 */
export async function consumeUsage(quota: UsageQuota, userId: string) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + quota.windowMs);

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "usage_limit" ("id", "userId", "feature", "count", "windowEnd")
    VALUES (gen_random_uuid()::text, ${userId}, ${quota.feature}, 1, ${windowEnd})
    ON CONFLICT ("userId", "feature") DO UPDATE
      SET "count" = CASE
            WHEN "usage_limit"."windowEnd" <= ${now} THEN 1
            ELSE "usage_limit"."count" + 1
          END,
          "windowEnd" = CASE
            WHEN "usage_limit"."windowEnd" <= ${now} THEN ${windowEnd}
            ELSE "usage_limit"."windowEnd"
          END
    RETURNING "count"
  `;

  const used = Number(rows[0]?.count ?? 1);
  return { allowed: used <= quota.max, used };
}
