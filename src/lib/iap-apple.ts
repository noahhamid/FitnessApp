import { X509Certificate, createPublicKey, verify } from "node:crypto";

/**
 * Apple Root CA - G3 (https://www.apple.com/certificateauthority/).
 * StoreKit 2 / App Store Server Notification JWS chains to this root.
 */
const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwMDIyMTc1MTIxWhcNMzkwMjIyMDAwMDAwWjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDwpBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3P6TkT9mJNfdwCoKm0B7m2o7iJsX/DghK1CVNaVcdKsbKq
NsWtFXABMuVl/CUYU+dBAQKjZDBiMC8GA1UdIwQoMCaAFK2RlDqKIW1DAxmGN43+
pzjPJwKsMB0GA1UdDgQWBBStkZQ6iiFtQwMZhjeN/qc4zycCrDAOBgNVHQ8BAf8E
BAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBAzAKBggqhkjOPQQDAwNnADBkAjA6z3rq
vRgCvtjU8LgynElNSZf9lK7n2M5t01Tnwz0N4loogmB0n/m2OxGT3OsEaiwCMGTO
mogOINIfb+yS+JePNlrOBfNwBCjk1EaKESYRZN1lrIQBGNjmMOrF0BZB+e5IIg==
-----END CERTIFICATE-----`;

const PINNED_ROOT = new X509Certificate(APPLE_ROOT_CA_G3_PEM);

export type AppleTransaction = {
  transactionId: string;
  originalTransactionId: string;
  bundleId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  type?: string;
  environment?: string;
  revocationDate?: number;
};

export type AppleNotification = {
  notificationType: string;
  subtype?: string;
  data?: {
    bundleId?: string;
    environment?: string;
    signedTransactionInfo?: string;
  };
};

function b64urlJson(part: string): unknown {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

function looksLikeJws(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

function certFromX5c(derB64: string): X509Certificate {
  return new X509Certificate(Buffer.from(derB64, "base64"));
}

function assertCertCurrentlyValid(cert: X509Certificate): void {
  const now = Date.now();
  if (new Date(cert.validFrom).getTime() > now) {
    throw new Error("Apple certificate not yet valid");
  }
  if (new Date(cert.validTo).getTime() < now) {
    throw new Error("Apple certificate expired");
  }
}

function verifyX5cChain(x5c: unknown): X509Certificate {
  if (!Array.isArray(x5c) || x5c.length < 2 || typeof x5c[0] !== "string") {
    throw new Error("Apple JWS missing certificate chain");
  }

  const chain = x5c.map((der) => {
    if (typeof der !== "string") throw new Error("Invalid x5c");
    return certFromX5c(der);
  });

  for (const cert of chain) assertCertCurrentlyValid(cert);

  const leaf = chain[0]!;
  const intermediate = chain[1]!;
  if (!leaf.verify(intermediate.publicKey)) {
    throw new Error("Apple leaf certificate not signed by intermediate");
  }

  const tail = chain[chain.length - 1]!;
  const signer =
    tail.fingerprint256 === PINNED_ROOT.fingerprint256
      ? chain[chain.length - 2] ?? intermediate
      : tail;

  if (!signer.verify(PINNED_ROOT.publicKey)) {
    throw new Error("Apple certificate chain does not pin to Root CA G3");
  }

  return leaf;
}

/** Verify a StoreKit 2 / App Store Server Notifications JWS and return the payload. */
export function verifyAppleJws<T>(jws: string): T {
  if (!looksLikeJws(jws)) {
    throw new Error("Not an Apple signed payload");
  }

  const [headerB64, payloadB64, signatureB64] = jws.split(".");
  const header = b64urlJson(headerB64!) as {
    alg?: string;
    x5c?: string[];
  };

  if (header.alg !== "ES256") {
    throw new Error("Unexpected Apple JWS algorithm");
  }

  const leaf = verifyX5cChain(header.x5c);
  const key = createPublicKey(leaf.publicKey);
  const ok = verify(
    "SHA256",
    Buffer.from(`${headerB64}.${payloadB64}`),
    { key, dsaEncoding: "ieee-p1363" },
    Buffer.from(signatureB64!, "base64url"),
  );
  if (!ok) {
    throw new Error("Apple JWS signature invalid");
  }

  return b64urlJson(payloadB64!) as T;
}

export function isAppleJws(value: string): boolean {
  if (!looksLikeJws(value)) return false;
  try {
    const header = b64urlJson(value.split(".")[0]!) as { x5c?: unknown };
    return Array.isArray(header.x5c);
  } catch {
    return false;
  }
}

export function parseAppleTransaction(payload: AppleTransaction): AppleTransaction {
  if (
    typeof payload.transactionId !== "string" ||
    typeof payload.originalTransactionId !== "string" ||
    typeof payload.bundleId !== "string" ||
    typeof payload.productId !== "string"
  ) {
    throw new Error("Apple transaction missing required fields");
  }
  return payload;
}

export function expectedAppleBundleId(): string {
  return process.env.APPLE_IAP_BUNDLE_ID?.trim() || "com.exo.fitness";
}
