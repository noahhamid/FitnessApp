import { Hono } from "hono";
import { z } from "zod";
import { isPremiumSku } from "@/src/features/billing/skus";
import {
  isEntitlementActive,
  pickActivePremium,
} from "../lib/entitlement";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { isParseFail, parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const subscriptionSchema = z.object({
  productId: z.string().min(1),
  isActive: z.boolean(),
  transactionId: z.string().min(1).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const syncSchema = z.object({
  platform: z.enum(["ios", "android"]),
  subscriptions: z.array(subscriptionSchema).max(8),
});

export const billingRouter = new Hono<AppEnv>().use("*", requireAuth);

billingRouter.get("/me", async (c) => {
  const user = getUser(c);
  const row = await prisma.userEntitlement.findUnique({
    where: { userId: user.id },
  });
  return ok(c, {
    isPremium: isEntitlementActive(row),
    productId: row?.productId ?? null,
    platform: row?.platform ?? null,
    expiresAt: row?.expiresAt?.toISOString() ?? null,
  });
});

billingRouter.post("/sync", async (c) => {
  const parsed = await parseJson(c, syncSchema);
  if (isParseFail(parsed)) return parsed.response;

  const user = getUser(c);
  const { platform, subscriptions } = parsed.data;

  const recognized = subscriptions.filter((sub) => isPremiumSku(sub.productId));
  if (subscriptions.length > 0 && recognized.length === 0) {
    return err(c, "Unknown product", 400);
  }

  const active = recognized
    .map((sub) => ({
      productId: sub.productId,
      isActive: sub.isActive,
      transactionId: sub.transactionId ?? null,
      expiresAt: sub.expiresAt ? new Date(sub.expiresAt) : null,
    }))
    .find((sub) => pickActivePremium(sub));

  const existing = await prisma.userEntitlement.findUnique({
    where: { userId: user.id },
  });

  // Client-reported isActive alone is not a receipt. Refuse elevating
  // non-premium → premium without a transactionId. Full App Store / Play
  // verification still required for production-grade anti-spoof.
  if (active && !active.transactionId && !isEntitlementActive(existing)) {
    return err(c, "transactionId required to activate entitlement", 400);
  }

  // Allow deactivate always; allow refresh when already premium or when
  // client supplies a transaction id (IAP restore path until server verify).
  const grantPremium = Boolean(active);

  const row = await prisma.userEntitlement.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      isPremium: grantPremium,
      productId: active?.productId ?? null,
      platform,
      transactionId: active?.transactionId ?? null,
      expiresAt: active?.expiresAt ?? null,
    },
    update: {
      isPremium: grantPremium,
      productId: active?.productId ?? null,
      platform,
      transactionId: active?.transactionId ?? existing?.transactionId ?? null,
      expiresAt: active?.expiresAt ?? null,
    },
  });

  return ok(c, {
    isPremium: isEntitlementActive(row),
    productId: row.productId,
    platform: row.platform,
    expiresAt: row.expiresAt?.toISOString() ?? null,
  });
});
