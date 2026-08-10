// src/features/auth/services/auth.service.ts

import { authClient } from "@/src/lib/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

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

let googleConfigured = false;

function configureGoogleSignIn() {
  if (googleConfigured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Use your Google Cloud Web client ID (same as GOOGLE_CLIENT_ID).",
    );
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: IOS_CLIENT_ID,
    offlineAccess: false,
  });
  googleConfigured = true;
}

// ── Sign in ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message);
}

// ── Sign up ───────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<void> {
  const { error } = await authClient.signUp.email({
    email,
    password,
    name: name ?? email.split("@")[0],
  });
  if (error) throw new Error(error.message);
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Native Google Sign-In → Better Auth idToken verification.
 * Requires a development / production build (not Expo Go).
 */
export async function signInWithGoogle(): Promise<void> {
  configureGoogleSignIn();

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

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

    const { error } = await authClient.signIn.social({
      provider: "google",
      idToken: { token: idToken },
    });
    if (error) throw new Error(error.message);
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

    const { error } = await authClient.signIn.social({
      provider: "apple",
      idToken: {
        token: credential.identityToken,
        nonce: rawNonce,
      },
    });
    if (error) throw new Error(error.message);
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
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Best-effort; Better Auth session is what matters.
  }

  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
}

// ── Get current session ───────────────────────────────────────────────────────

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
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
  if (error) throw new Error(error.message);
}

export async function resetPassword(
  newPassword: string,
  token: string,
): Promise<void> {
  const { error } = await authClient.resetPassword({
    newPassword,
    token,
  });
  if (error) throw new Error(error.message);
}
