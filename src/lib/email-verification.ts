/**
 * Client counterpart to auth.server.ts `requireEmailVerification`
 * (`REQUIRE_EMAIL_VERIFICATION === "true"`).
 *
 * Must stay opt-in: a hard gate in every release build (`!__DEV__`) locked
 * existing unverified accounts out and broke "I'll confirm later".
 * Set EXPO_PUBLIC_REQUIRE_EMAIL_VERIFICATION=true only when the API also
 * sets REQUIRE_EMAIL_VERIFICATION=true.
 */
export function clientRequiresEmailVerification(): boolean {
  return process.env.EXPO_PUBLIC_REQUIRE_EMAIL_VERIFICATION === "true";
}

type VerifyEmailUser = {
  email?: string | null;
  emailVerified?: boolean | null;
};

/**
 * True when navigation should send the user to the confirm-email screen.
 * Narrows `user` to non-null: `user?.emailVerified === false` only holds when
 * a session user object exists.
 *
 * When `allowDeferred` is true (user already marked onboarded after
 * "confirm later"), do not bounce them out of the app.
 */
export function shouldRedirectToVerifyEmail(
  user: VerifyEmailUser | null | undefined,
  options?: { allowDeferred?: boolean },
): user is VerifyEmailUser & { emailVerified: false } {
  if (!clientRequiresEmailVerification()) return false;
  if (options?.allowDeferred) return false;
  return user?.emailVerified === false;
}
