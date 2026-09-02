import { createSign } from "node:crypto";
import { BUNDLE_ID } from "./brand";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

export type PlaySubscription = {
  subscriptionState?: string;
  lineItems?: {
    productId?: string;
    expiryTime?: string;
  }[];
};

const GRANT_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_CANCELED",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ServiceAccount;
      if (parsed.client_email && parsed.private_key) return parsed;
    } catch {
      return null;
    }
  }

  const email = process.env.GOOGLE_PLAY_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_PLAY_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (email && key) return { client_email: email, private_key: key };
  return null;
}

export function playVerifyConfigured(): boolean {
  return readServiceAccount() !== null;
}

export function playPackageName(): string {
  return process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || BUNDLE_ID;
}

function signJwt(email: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(privateKey, "base64url")}`;
}

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAtMs > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const account = readServiceAccount();
  if (!account) {
    throw new Error("Google Play service account is not configured");
  }

  const assertion = signJwt(account.client_email, account.private_key);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!response.ok || !json.access_token) {
    throw new Error(json.error || "Google Play auth failed");
  }

  tokenCache = {
    accessToken: json.access_token,
    expiresAtMs: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return json.access_token;
}

export async function fetchPlaySubscription(
  purchaseToken: string,
): Promise<PlaySubscription> {
  const token = await accessToken();
  const pkg = encodeURIComponent(playPackageName());
  const encoded = encodeURIComponent(purchaseToken);
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/subscriptionsv2/tokens/${encoded}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await response.json()) as PlaySubscription & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message || "Google Play subscription lookup failed");
  }
  return json;
}

export function playSubscriptionIsEntitled(sub: PlaySubscription): boolean {
  if (!sub.subscriptionState || !GRANT_STATES.has(sub.subscriptionState)) {
    return false;
  }
  const expiry = sub.lineItems?.[0]?.expiryTime;
  if (expiry && new Date(expiry).getTime() <= Date.now()) return false;
  return true;
}
