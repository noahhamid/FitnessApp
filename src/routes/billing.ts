import { Hono } from "hono";
import { z } from "zod";
import { isPremiumSku } from "@/src/features/billing/skus";
import {
  expectedAppleBundleId,
  isAppleJws,
  parseAppleTransaction,
  verifyAppleJws,
  type AppleNotification,
  type AppleTransaction,
} from "../lib/iap-apple";
import {
  fetchPlaySubscription,
  playSubscriptionIsEntitled,
  playVerifyConfigured,
} from "../lib/iap-google";
import { verifyStoreSubscription } from "../lib/iap-verify";
import { isEntitlementActive } from "../lib/entitlement";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { isParseFail, parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const subscriptionSchema = z.object({
  productId: z.string().min(1),
  purchaseToken: z.string().min(8).optional(),
  transactionId: z.string().min(1).optional(),
});

const syncSchema = z.object({
  platform: z.enum(["ios", "android"]),
  subscriptions: z.array(subscriptionSchema).max(8),
});

const appleNotificationSchema = z.object({
  signedPayload: z.string().min(20),
});

const googleRtdnSchema = z.object({
  message: z
    .object({
      data: z.string().min(1),
    })
    .optional(),
});

function entitlementPayload(row: {
  isPremium: boolean;
  storeVerified: boolean;
  productId: string | null;
  platform: string | null;
  expiresAt: Date | null;
}) {
  return {
    isPremium: isEntitlementActive(row),
    productId: row.productId,
    platform: row.platform,
    expiresAt: row.expiresAt?.toISOString() ?? null,
  };
}

/** Prisma unique-constraint violation, without pulling in the runtime class. */
function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: unknown }).code === "P2002"
  );
}

async function assertTokenNotLinkedToOtherUser(
  userId: string,
  transactionId: string | null,
  originalTransactionId: string | null,
): Promise<string | null> {
  if (transactionId) {
    const taken = await prisma.userEntitlement.findFirst({
      where: { transactionId, userId: { not: userId } },
    });
    if (taken) return "This purchase is already linked to another account";
  }
  if (originalTransactionId) {
    const taken = await prisma.userEntitlement.findFirst({
      where: { originalTransactionId, userId: { not: userId } },
    });
    if (taken) return "This purchase is already linked to another account";
  }
  return null;
}

export const billingRouter = new Hono<AppEnv>();

billingRouter.get("/me", requireAuth, async (c) => {
  const user = getUser(c);
  const row = await prisma.userEntitlement.findUnique({
    where: { userId: user.id },
  });
  return ok(c, entitlementPayload(row ?? {
    isPremium: false,
    storeVerified: false,
    productId: null,
    platform: null,
    expiresAt: null,
  }));
});

billingRouter.post("/sync", requireAuth, async (c) => {
  const parsed = await parseJson(c, syncSchema);
  if (isParseFail(parsed)) return parsed.response;

  const user = getUser(c);
  const { platform, subscriptions } = parsed.data;

  const recognized = subscriptions.filter((sub) => isPremiumSku(sub.productId));
  if (subscriptions.length > 0 && recognized.length === 0) {
    return err(c, "Unknown product", 400);
  }

  const candidates = recognized.filter((sub) => sub.purchaseToken);
  if (recognized.length > 0 && candidates.length === 0) {
    return err(c, "purchaseToken required to activate entitlement", 400);
  }

  let granted:
    | {
        productId: string;
        transactionId: string;
        originalTransactionId: string | null;
        expiresAt: Date | null;
        platform: "ios" | "android";
        purchaseToken: string;
      }
    | null = null;

  for (const sub of candidates) {
    const verified = await verifyStoreSubscription({
      platform,
      productId: sub.productId,
      purchaseToken: sub.purchaseToken!,
      transactionId: sub.transactionId,
    });
    if (verified.ok === false) {
      if (candidates.length === 1) {
        return err(c, verified.reason, 400);
      }
      continue;
    }
    granted = verified.subscription;
      break;
  }

  if (granted) {
    const conflict = await assertTokenNotLinkedToOtherUser(
      user.id,
      granted.transactionId,
      granted.originalTransactionId,
    );
    if (conflict) return err(c, conflict, 409);
  }

  // An empty list means the store told us nothing — offline, a StoreKit
  // timeout, or a lookup that threw. That is not proof the user has no
  // subscription, so never revoke on it. Real revocation comes from the
  // expiresAt check in isEntitlementActive and from the store webhooks.
  // Dev grants (scripts/grant-premium.mjs) also stay until explicitly revoked.
  if (!granted) {
    const existing = await prisma.userEntitlement.findUnique({
      where: { userId: user.id },
    });
    if (subscriptions.length === 0 && existing) {
      return ok(c, entitlementPayload(existing));
    }
    if (existing?.platform === "dev" && isEntitlementActive(existing)) {
      return ok(c, entitlementPayload(existing));
    }
  }

  let row;
  try {
    row = await prisma.userEntitlement.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        isPremium: Boolean(granted),
        storeVerified: Boolean(granted),
        productId: granted?.productId ?? null,
        platform: granted?.platform ?? platform,
        transactionId: granted?.transactionId ?? null,
        originalTransactionId: granted?.originalTransactionId ?? null,
        purchaseToken: granted?.purchaseToken ?? null,
        expiresAt: granted?.expiresAt ?? null,
      },
      update: granted
        ? {
            isPremium: true,
            storeVerified: true,
            productId: granted.productId,
            platform: granted.platform,
            transactionId: granted.transactionId,
            originalTransactionId: granted.originalTransactionId,
            purchaseToken: granted.purchaseToken,
            expiresAt: granted.expiresAt,
          }
        : {
            isPremium: false,
            storeVerified: false,
            productId: null,
            expiresAt: null,
          },
    });
  } catch (e) {
    // assertTokenNotLinkedToOtherUser reads before this writes, so two accounts
    // racing the same receipt can both pass it. The unique indexes on
    // transactionId / originalTransactionId are what actually stop the second
    // one — report that as the conflict it is rather than a 500.
    if (isUniqueViolation(e)) {
      return err(c, "This purchase is already linked to another account", 409);
    }
    throw e;
  }

  return ok(c, entitlementPayload(row));
});

/** App Store Server Notifications V2 — configure this URL in App Store Connect. */
billingRouter.post("/apple-notifications", async (c) => {
  const parsed = await parseJson(c, appleNotificationSchema);
  if (isParseFail(parsed)) return parsed.response;

  if (!isAppleJws(parsed.data.signedPayload)) {
    return err(c, "Invalid Apple notification", 400);
  }

  let note: AppleNotification;
  try {
    note = verifyAppleJws<AppleNotification>(parsed.data.signedPayload);
  } catch {
    return err(c, "Invalid Apple notification", 400);
  }

  const signedTx = note.data?.signedTransactionInfo;
  if (!signedTx) return ok(c, { ignored: true });

  let tx: AppleTransaction;
  try {
    tx = parseAppleTransaction(verifyAppleJws<AppleTransaction>(signedTx));
  } catch {
    return err(c, "Invalid Apple transaction", 400);
  }
  if (tx.bundleId !== expectedAppleBundleId()) {
    return ok(c, { ignored: true });
  }

  const revoke = new Set(["REFUND", "REVOKE", "EXPIRED", "GRACE_PERIOD_EXPIRED"]);
  const row = await prisma.userEntitlement.findFirst({
    where: {
      OR: [
        { originalTransactionId: tx.originalTransactionId },
        { transactionId: tx.transactionId },
      ],
    },
  });
  if (!row) return ok(c, { unmatched: true });

  const expiresAt = tx.expiresDate ? new Date(tx.expiresDate) : row.expiresAt;
  const stillActive =
    !revoke.has(note.notificationType) &&
    !tx.revocationDate &&
    (!expiresAt || expiresAt.getTime() > Date.now());

  await prisma.userEntitlement.update({
    where: { id: row.id },
    data: {
      isPremium: stillActive,
      storeVerified: stillActive,
      productId: isPremiumSku(tx.productId) ? tx.productId : row.productId,
      expiresAt,
      transactionId: tx.transactionId,
      originalTransactionId: tx.originalTransactionId,
    },
  });

  return ok(c, { updated: true });
});

/** Google Play Real-time developer notifications (Pub/Sub push). */
billingRouter.post("/google-rtdn", async (c) => {
  const parsed = await parseJson(c, googleRtdnSchema);
  if (isParseFail(parsed)) return parsed.response;
  if (!parsed.data.message?.data) return ok(c, { ignored: true });
  if (!playVerifyConfigured()) return ok(c, { skipped: true });

  let decoded: {
    subscriptionNotification?: {
      purchaseToken?: string;
      subscriptionId?: string;
    };
  };
  try {
    decoded = JSON.parse(
      Buffer.from(parsed.data.message.data, "base64").toString("utf8"),
    ) as typeof decoded;
  } catch {
    return err(c, "Invalid Play notification", 400);
  }

  const purchaseToken = decoded.subscriptionNotification?.purchaseToken;
  if (!purchaseToken) return ok(c, { ignored: true });

  const row = await prisma.userEntitlement.findFirst({
    where: { purchaseToken },
  });
  if (!row) return ok(c, { unmatched: true });

  try {
    const sub = await fetchPlaySubscription(purchaseToken);
    const entitled = playSubscriptionIsEntitled(sub);
    const line = sub.lineItems?.[0];
    await prisma.userEntitlement.update({
      where: { id: row.id },
      data: {
        isPremium: entitled,
        storeVerified: entitled,
        productId:
          line?.productId && isPremiumSku(line.productId)
            ? line.productId
            : row.productId,
        expiresAt: line?.expiryTime ? new Date(line.expiryTime) : row.expiresAt,
      },
    });
  } catch {
    return ok(c, { lookupFailed: true });
  }

  return ok(c, { updated: true });
});
