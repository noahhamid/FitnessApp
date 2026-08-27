// src/features/auth/services/auth.service.ts

import { authClient } from "@/src/lib/auth";
import {
  DISPLAY_NAME_MAX_LENGTH,
  normalizeDisplayFirstName,
} from "@/src/lib/display-name";
import {
  clearSessionToken,
  persistTokenFromAuthData,
} from "@/src/lib/session-token";
import { invalidateAuthHeaderCache } from "@/src/lib/api";
import { getClientApiUrl } from "@/src/lib/public-api-url";
import { NativeModules, Platform } from "react-native";

type GoogleSignInSdk = typeof import("@react-native-google-signin/google-signin");

/** Expo Go does not ship this native module — a static import crashes on load. */
function googleNativeReady(): boolean {
  return Boolean(NativeModules.RNGoogleSignin);
}

async function loadGoogleSignIn(): Promise<GoogleSignInSdk> {
  if (!googleNativeReady()) {
    throw new Error(
      "Google Sign-In needs a development build or EAS APK. Expo Go does not include it.",
    );
  }
  return import("@react-native-google-signin/google-signin");
}

/** Thrown when the user dismisses the Google sheet — UI should ignore quietly. */
export class AuthCancelledError extends Error {
  constructor(message = "Sign-in cancelled") {
    super(message);
    this.name = "AuthCancelledError";
  }
}

// Same iOS client as app.config.ts google-signin plugin.
const IOS_CLIENT_ID =
  "571605491186-kd1lt4933dp1a60hvuvegu2rn9cteodo.apps.googleusercontent.com";
// Web client ID is public (not the secret). Baked in so EAS APKs work
// even when EXPO_PUBLIC_* was missing from the build profile.
const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "571605491186-b04ac11j9h523q4v733k4g9726hupbh9.apps.googleusercontent.com";

let googleConfigured = false;

async function configureGoogleSignIn(sdk: GoogleSignInSdk) {
  if (googleConfigured) return;

  sdk.GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    offlineAccess: false,
  });
  googleConfigured = true;
}

// ── Sign in ───────────────────────────────────────────────────────────────────

type AuthClientError = {
  message?: string | null;
  status?: number;
} | null;

function throwIfAuthError(error: AuthClientError): void {
  if (!error) return;
  if (error.status === 429 || /too many (requests|attempts)/i.test(error.message ?? "")) {
    const api = getClientApiUrl();
    throw new Error(
      `Too many tries on ${api}. Wait 60s, or make sure Expo uses your local API (192.168.1.8:3000).`,
    );
  }
  if (/invalid token/i.test(error.message ?? "")) {
    throw new Error(
      "Google signed you in, but the server rejected Google's ID token. The Web client ID on the API must match the one in this app — SHA-1 is not that token.",
    );
  }
  throw new Error(error.message || "Something went wrong.");
}

export async function signIn(email: string, password: string): Promise<void> {
  const { data, error } = await authClient.signIn.email({ email, password });
  throwIfAuthError(error);
  await persistTokenFromAuthData(data);
  invalidateAuthHeaderCache();
  await refreshAuthSession();
}

// ── Sign up ───────────────────────────────────────────────────────────────────

/** @deprecated Use DISPLAY_NAME_MAX_LENGTH — kept for existing imports. */
export const SIGN_UP_NAME_MAX_LENGTH = DISPLAY_NAME_MAX_LENGTH;

/** Keep the first given name only (no family names) and clamp length. */
export function normalizeSignUpFirstName(raw: string): string {
  return normalizeDisplayFirstName(raw);
}

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<void> {
  const firstName = name ? normalizeDisplayFirstName(name) : "";
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name: firstName || email.split("@")[0],
  });
  throwIfAuthError(error);
  await persistTokenFromAuthData(data);
  invalidateAuthHeaderCache();
  await refreshAuthSession();
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not verified/i.test(message);
}

export async function sendVerificationEmail(email: string): Promise<void> {
  const { error } = await authClient.sendVerificationEmail({
    email,
    callbackURL: "com.exo.fitness://verify-email",
  });
  throwIfAuthError(error);
}

export async function verifyEmail(token: string): Promise<void> {
  const { data, error } = await authClient.verifyEmail({
    query: { token },
  });
  throwIfAuthError(error);
  await persistTokenFromAuthData(data);
  invalidateAuthHeaderCache();
  await refreshAuthSession();
}

/**
 * OAuth providers often send "First Last". Persist first name only so greetings
 * match email sign-up. Prefer an explicit given name when the native SDK has one.
 */
async function ensureOAuthFirstName(
  preferredGivenName?: string | null,
): Promise<void> {
  const preferred = preferredGivenName
    ? normalizeDisplayFirstName(preferredGivenName)
    : "";

  const { data } = await authClient.getSession();
  const current = data?.user?.name ?? "";
  const next =
    preferred || (current ? normalizeDisplayFirstName(current) : "");

  if (!next || next === current) return;

  const { error } = await authClient.updateUser({ name: next });
  if (error) {
    console.log("oauth: failed to trim display name", error.message);
  }
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Drop any cached Google account so the next `signIn()` always shows the
 * account picker instead of silently reusing the last account.
 */
async function clearGoogleSessionForAccountPicker(
  sdk: GoogleSignInSdk,
): Promise<void> {
  try {
    if (sdk.GoogleSignin.hasPreviousSignIn()) {
      await sdk.GoogleSignin.signOut();
    }
  } catch {
    // No active Google session — picker will still appear.
  }
}

/**
 * Native Google Sign-In → Better Auth idToken verification.
 * Requires a development / production build (not Expo Go).
 */
export async function signInWithGoogle(): Promise<void> {
  const sdk = await loadGoogleSignIn();
  await configureGoogleSignIn(sdk);
  const { GoogleSignin, isErrorWithCode, statusCodes } = sdk;

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    await clearGoogleSessionForAccountPicker(sdk);

    const response = await GoogleSignin.signIn();
    if (response.type === "cancelled") {
      throw new AuthCancelledError();
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }
    if (!idToken) {
      throw new Error("Google did not return an ID token. Check webClientId.");
    }

    const givenName = response.data.user.givenName;

    const { data, error } = await authClient.signIn.social({
      provider: "google",
      idToken: { token: idToken },
    });
    throwIfAuthError(error);
    await persistTokenFromAuthData(data);
    invalidateAuthHeaderCache();

    await ensureOAuthFirstName(givenName);
  } catch (e) {
    if (e instanceof AuthCancelledError) throw e;
    if (isErrorWithCode(e)) {
      if (
        e.code === statusCodes.SIGN_IN_CANCELLED ||
        e.code === statusCodes.IN_PROGRESS
      ) {
        throw new AuthCancelledError();
      }
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is missing or out of date.");
      }
    }
    throw e instanceof Error ? e : new Error("Google sign-in failed");
  }
}

export async function signInWithApple(): Promise<void> {
  const AppleAuthentication = await import("expo-apple-authentication");
  const Crypto = await import("expo-crypto");

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error(
      "Sign in with Apple is only available on Apple devices with iOS 13+.",
    );
  }

  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error("Apple did not return an identity token.");
    }

    const { data, error } = await authClient.signIn.social({
      provider: "apple",
      idToken: {
        token: credential.identityToken,
        nonce: rawNonce,
      },
    });
    throwIfAuthError(error);
    await persistTokenFromAuthData(data);
    invalidateAuthHeaderCache();

    await ensureOAuthFirstName(credential.fullName?.givenName);
  } catch (e) {
    if (e instanceof AuthCancelledError) throw e;
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "ERR_REQUEST_CANCELED"
    ) {
      throw new AuthCancelledError();
    }
    throw e instanceof Error ? e : new Error("Apple sign-in failed");
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  try {
    if (googleNativeReady()) {
      const { GoogleSignin } = await loadGoogleSignIn();
      if (GoogleSignin.hasPreviousSignIn()) {
        await GoogleSignin.signOut();
      }
    }
  } catch {
    // Best-effort; Better Auth session is what matters.
  }

  const { error } = await authClient.signOut();
  await clearSessionToken();
  invalidateAuthHeaderCache();
  throwIfAuthError(error);
}


/**
 * Permanently delete the signed-in user via Better Auth.
 * Without a token: requests deletion (sends confirmation email when configured).
 * With a token: completes deletion after the user opens the email deep link.
 */
export async function deleteAccount(token?: string): Promise<{
  /** True when deletion completed in this call (session should be gone). */
  deleted: boolean;
  /** True when Better Auth sent a confirmation email instead of deleting now. */
  verificationEmailSent: boolean;
}> {
  const { data, error } = await authClient.deleteUser(
    token
      ? { token }
      : { callbackURL: "com.exo.fitness://" },
  );
  throwIfAuthError(error);

  const message =
    data && typeof data === "object" && "message" in data
      ? String((data as { message?: string }).message ?? "")
      : "";

  if (message === "Verification email sent") {
    return { deleted: false, verificationEmailSent: true };
  }

  try {
    await authClient.signOut();
  } catch {
    // Session may already be invalidated server-side.
  }

  return { deleted: true, verificationEmailSent: false };
}

// ── Get current session ───────────────────────────────────────────────────────

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
}

/** Re-fetch session after persisting a bearer token (Expo / cross-origin web). */
export async function refreshAuthSession(): Promise<boolean> {
  invalidateAuthHeaderCache();
  const { readSessionToken } = await import("@/src/lib/session-token");
  const session = await getSession();
  if (session?.user) return true;
  return !!(await readSessionToken());
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(
  email: string,
  redirectTo: string,
): Promise<void> {
  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo,
  });
  throwIfAuthError(error);
}

export async function resetPassword(
  newPassword: string,
  token: string,
): Promise<void> {
  const { error } = await authClient.resetPassword({
    newPassword,
    token,
  });
  throwIfAuthError(error);
}
