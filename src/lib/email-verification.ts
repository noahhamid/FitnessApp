/**
 * Client counterpart to auth.server.ts `requireEmailVerification`
 * (`NODE_ENV === "production"`).
 *
 * In React Native / Expo, use `__DEV__` (Metro injects it) — true in Expo Go
 * and debug builds, false in release/store binaries. Do not rely on
 * `process.env.NODE_ENV` for runtime client branching unless it is an
 * `EXPO_PUBLIC_*` var baked at build time.
 */
export function clientRequiresEmailVerification(): boolean {
  return !__DEV__;
}

type VerifyEmailUser = {
  email?: string | null;
  emailVerified?: boolean | null;
};

/**
 * True when navigation should send the user to the confirm-email screen.
 * Narrows `user` to non-null: `user?.emailVerified === false` only holds when
 * a session user object exists.
 */
export function shouldRedirectToVerifyEmail(
  user: VerifyEmailUser | null | undefined,
): user is VerifyEmailUser & { emailVerified: false } {
  return (
    clientRequiresEmailVerification() && user?.emailVerified === false
  );
}
