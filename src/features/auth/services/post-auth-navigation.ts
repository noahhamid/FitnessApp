import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { isOnboardingProfileComplete } from "@/src/lib/onboarding-complete";
import { router } from "expo-router";
import {
  getSession,
  isEmailNotVerifiedError,
  refreshAuthSession,
  signIn,
} from "./auth.service";
import { useAuthStore } from "../hooks/useAuth";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "./onboarding-draft.service";
import {
  clearPendingSignUp,
  loadPendingSignUp,
} from "./pending-signup.service";
import {
  hasCompletedOnboardingPayload,
  onboardingParamsForNavigation,
  saveCompletedOnboardingPayload,
  type OnboardingAuthParams,
} from "./onboarding-payload.service";

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function hasActiveSession(): Promise<boolean> {
  const { readSessionToken } = await import("@/src/lib/session-token");
  const session = await getSession();
  if (session?.user) return true;
  return !!(await readSessionToken());
}

/** Try stored sign-up credentials (same device, right after register). */
async function tryPendingSignIn(): Promise<boolean> {
  const pending = await loadPendingSignUp();
  if (!pending) return false;
  try {
    await signIn(pending.email, pending.password);
    await clearPendingSignUp();
    return true;
  } catch (e) {
    if (!isEmailNotVerifiedError(e)) {
      await clearPendingSignUp();
    }
    return false;
  }
}

async function establishSessionWithRetries(): Promise<boolean> {
  if (await hasActiveSession()) return true;
  await refreshAuthSession();
  if (await hasActiveSession()) return true;
  // One pending sign-in only — repeated tries hit Better Auth's rate limit.
  await tryPendingSignIn();
  await refreshAuthSession();
  return hasActiveSession();
}

async function enterApp(clearDraft: boolean) {
  if (clearDraft) await clearOnboardingDraft();
  useAuthStore.getState().setOnboarded(true);
  router.replace("/(app)/(tabs)");
}

async function redirectToVerifyEmail(merged: OnboardingAuthParams) {
  await saveOnboardingDraft(merged);
  useAuthStore.getState().setOnboarded(false);
  const pending = await loadPendingSignUp();
  const email = single(merged.email) ?? pending?.email;
  router.replace({
    pathname: "/(auth)/verify-email",
    params: {
      ...onboardingParamsForNavigation(merged),
      ...(email ? { email: encodeURIComponent(email) } : {}),
    },
  });
}

async function redirectToSignInWithDraft(merged: OnboardingAuthParams) {
  await saveOnboardingDraft(merged);
  const pending = await loadPendingSignUp();
  const email = single(merged.email) ?? pending?.email;
  router.replace({
    pathname: "/(auth)/sign-in",
    params: {
      ...onboardingParamsForNavigation(merged),
      autoSignIn: "1",
      ...(email ? { email: encodeURIComponent(email) } : {}),
    },
  });
}

async function trySaveOnboardingPayload(
  merged: OnboardingAuthParams,
  deferEmailVerification: boolean,
): Promise<boolean> {
  let saved = await saveCompletedOnboardingPayload(merged);
  if (saved) return true;
  if (!deferEmailVerification) return false;
  return saveCompletedOnboardingPayload(merged, {
    sessionWaitAttempts: 24,
  });
}

/** Shared routing after email or social sign-in / sign-up. */
export async function navigateAfterAuth(
  params: OnboardingAuthParams,
  options?: { isNewAccount?: boolean; deferEmailVerification?: boolean },
): Promise<void> {
  const draft = await loadOnboardingDraft();
  const merged: OnboardingAuthParams = {
    ...draft,
    ...onboardingParamsForNavigation(params),
  };

  if (options?.isNewAccount || options?.deferEmailVerification) {
    await establishSessionWithRetries();
  }

  if (hasCompletedOnboardingPayload(merged)) {
    const saved = await trySaveOnboardingPayload(
      merged,
      options?.deferEmailVerification === true,
    );
    if (saved) {
      await enterApp(true);
      return;
    }

    if (options?.deferEmailVerification) {
      if (!(await hasActiveSession())) {
        await redirectToSignInWithDraft(merged);
        return;
      }

      try {
        if (isOnboardingProfileComplete(await fetchUserProfile())) {
          await enterApp(true);
          return;
        }
      } catch {
        // Offline or API unreachable — fall through to local entry below.
      }

      await saveOnboardingDraft(merged);
      await enterApp(false);
      return;
    }

    // New account without a session (email verify required on API) — never
    // leave the user stuck on the form with a throw.
    if (options?.isNewAccount) {
      await redirectToVerifyEmail(merged);
      return;
    }

    await saveOnboardingDraft(merged);
    useAuthStore.getState().setOnboarded(false);
    await redirectToSignInWithDraft(merged);
    return;
  }

  if (options?.isNewAccount) {
    useAuthStore.getState().setOnboarded(false);
    if (!(await hasActiveSession())) {
      await redirectToVerifyEmail(merged);
      return;
    }
    router.replace("/(auth)/onboarding");
    return;
  }

  let profileComplete = false;
  try {
    profileComplete = isOnboardingProfileComplete(await fetchUserProfile());
  } catch {
    // Fall through to onboarding rather than blocking sign-in.
  }

  useAuthStore.getState().setOnboarded(profileComplete);
  if (profileComplete) {
    await clearOnboardingDraft();
    router.replace("/(app)/(tabs)");
    return;
  }
  router.replace("/(auth)/onboarding");
}

/** Used by sign-in screen after verify-email deferral. */
export async function tryAutoSignInFromPending(): Promise<boolean> {
  return establishSessionWithRetries();
}
