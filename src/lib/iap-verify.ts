import { createHash } from "node:crypto";
import { isPremiumSku } from "@/src/features/billing/skus";
import {
  expectedAppleBundleId,
  isAppleJws,
  parseAppleTransaction,
  verifyAppleJws,
  type AppleTransaction,
} from "./iap-apple";
import {
  fetchPlaySubscription,
  playSubscriptionIsEntitled,
  playVerifyConfigured,
} from "./iap-google";

function playTransactionId(purchaseToken: string): string {
  return createHash("sha256").update(purchaseToken).digest("hex");
}

export type VerifiedSubscription = {
  productId: string;
  transactionId: string;
  originalTransactionId: string | null;
  expiresAt: Date | null;
  platform: "ios" | "android";
  environment: string | null;
  purchaseToken: string;
};

export type VerifyOk = { ok: true; subscription: VerifiedSubscription };
export type VerifyFail = { ok: false; reason: string };
export type VerifyResult = VerifyOk | VerifyFail;

/** True on a real deployment, whoever hosts it. */
function isProductionServer(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

/**
 * Local-only escape hatch that grants Pro with no store check. Gated on
 * NODE_ENV as well as VERCEL — the Vercel flag alone would silently stop
 * protecting anything if this ever moved to a container host.
 */
function skipVerifyAllowed(): boolean {
  if (isProductionServer()) return false;
  return process.env.IAP_SKIP_VERIFY === "true";
}

function asExpiry(ms: number | undefined): Date | null {
  if (!ms || !Number.isFinite(ms)) return null;
  return new Date(ms);
}

function verifyDecodedApple(tx: AppleTransaction, purchaseToken: string): VerifyResult {
  if (tx.bundleId !== expectedAppleBundleId()) {
    return { ok: false, reason: "Apple bundle id does not match this app" };
  }
  if (!isPremiumSku(tx.productId)) {
    return { ok: false, reason: "Unknown product" };
  }
  if (tx.revocationDate) {
    return { ok: false, reason: "Apple transaction was revoked" };
  }
  // Sandbox purchases are free. Useful against a local server, never a reason
  // to grant Pro in production.
  if (tx.environment === "Sandbox" && isProductionServer()) {
    return { ok: false, reason: "Sandbox purchases are not valid here" };
  }
  const expiresAt = asExpiry(tx.expiresDate);
  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "Apple subscription is expired" };
  }

  return {
    ok: true,
    subscription: {
      productId: tx.productId,
      transactionId: tx.transactionId,
      originalTransactionId: tx.originalTransactionId,
      expiresAt,
      platform: "ios",
      environment: tx.environment ?? null,
      purchaseToken,
    },
  };
}

async function verifyAppleToken(purchaseToken: string): Promise<VerifyResult> {
  try {
    const payload = parseAppleTransaction(
      verifyAppleJws<AppleTransaction>(purchaseToken),
    );
    return verifyDecodedApple(payload, purchaseToken);
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Apple receipt invalid",
    };
  }
}

async function verifyGoogleToken(
  productId: string,
  purchaseToken: string,
): Promise<VerifyResult> {
  if (!playVerifyConfigured()) {
    return {
      ok: false,
      reason: "Google Play verification is not configured on the server",
    };
  }

  try {
    const sub = await fetchPlaySubscription(purchaseToken);
    if (!playSubscriptionIsEntitled(sub)) {
      return { ok: false, reason: "Google Play subscription is not active" };
    }

    const line = sub.lineItems?.[0];
    const storeProductId = line?.productId ?? productId;
    if (!isPremiumSku(storeProductId)) {
      return { ok: false, reason: "Unknown product" };
    }

    return {
      ok: true,
      subscription: {
        productId: storeProductId,
        transactionId: playTransactionId(purchaseToken),
        originalTransactionId: playTransactionId(purchaseToken),
        expiresAt: line?.expiryTime ? new Date(line.expiryTime) : null,
        platform: "android",
        environment: null,
        purchaseToken,
      },
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Google Play lookup failed",
    };
  }
}

export async function verifyStoreSubscription(input: {
  platform: "ios" | "android";
  productId: string;
  purchaseToken: string;
  transactionId?: string;
}): Promise<VerifyResult> {
  if (!isPremiumSku(input.productId)) {
    return { ok: false, reason: "Unknown product" };
  }

  if (skipVerifyAllowed()) {
    return {
      ok: true,
      subscription: {
        productId: input.productId,
        transactionId: input.transactionId || playTransactionId(input.purchaseToken),
        originalTransactionId:
          input.transactionId || playTransactionId(input.purchaseToken),
        expiresAt: null,
        platform: input.platform,
        environment: "skip-verify",
        purchaseToken: input.purchaseToken,
      },
    };
  }

  if (isAppleJws(input.purchaseToken) || input.platform === "ios") {
    return verifyAppleToken(input.purchaseToken);
  }

  return verifyGoogleToken(input.productId, input.purchaseToken);
}
