import { prisma } from "./prisma";
import { normalizeDisplayFirstName } from "./display-name";
import { sendAuthEmail } from "./send-auth-email";

const APP_VERIFY_EMAIL_URL = "com.exo.fitness://verify-email";

/**
 * better-auth (and @better-auth/expo) are ESM-only. Root package.json is
 * "type": "commonjs", so Vercel's Hono preset compiles this file to CJS and a
 * static `import`/`require` of better-auth crashes with ERR_REQUIRE_ESM.
 *
 * Dynamic `import()` works from CJS and loads the ESM package correctly.
 * Keep all better-auth imports inside this async factory — never top-level.
 */
async function createAuth() {
  const [{ betterAuth }, { prismaAdapter }, { expo }] = await Promise.all([
    import("better-auth"),
    import("better-auth/adapters/prisma"),
    import("@better-auth/expo"),
  ]);

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    plugins: [expo()],

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    user: {
      deleteUser: {
        enabled: true,
        // OAuth users have no password — email confirm is required for them.
        // Password users can also delete with a fresh session (default 1 day).
        sendDeleteAccountVerification: async ({ user, token }) => {
          // Mobile app deep link — Better Auth's default web callback URL requires
          // a browser session cookie on the API host, which email clients don't have.
          // Opening this link in the app (still signed in) completes deletion via token.
          const confirmUrl = `com.exo.fitness://delete-account?token=${encodeURIComponent(token)}`;
          await sendAuthEmail({
            to: user.email,
            subject: "Confirm deleting your PotentialPeak account",
            html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>We received a request to permanently delete your PotentialPeak account and all associated data (workouts, meals, weight logs, and profile).</p>
      <p>This cannot be undone. Open the link below on the device where you are signed in to PotentialPeak:</p>
      <p><a href="${confirmUrl}">Delete my account permanently</a></p>
      <p>If you didn't request this, you can ignore this email — your account will stay active.</p>
    `,
          });
        },
      },
    },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your PotentialPeak password",
        html: `
          <p>Hi${user.name ? ` ${user.name}` : ""},</p>
          <p>Tap the link below to choose a new password:</p>
          <p><a href="${url}">Reset password</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      });
    },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${APP_VERIFY_EMAIL_URL}?token=${encodeURIComponent(token)}`;
      await sendAuthEmail({
        to: user.email,
        subject: "Confirm your PotentialPeak email",
        html: `
          <p>Hi${user.name ? ` ${user.name}` : ""},</p>
          <p>Tap the link below to confirm this email belongs to you:</p>
          <p><a href="${verifyUrl}">Confirm email</a></p>
          <p>If you didn't create an account, you can ignore this email.</p>
        `,
      });
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },

    // Default Better Auth limiter is production-only and 3 tries / 10s on
    // sign-in — an attacker can just wait and keep guessing. Always on, stored
    // in Postgres so Vercel instances share the same counters.
    advanced: {
      ipAddress: {
        ipAddressHeaders: [
          "x-vercel-forwarded-for",
          "x-real-ip",
          "x-forwarded-for",
        ],
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 15 * 60, max: 8 },
        "/sign-up/email": { window: 15 * 60, max: 5 },
        "/forget-password*": { window: 15 * 60, max: 5 },
        "/request-password-reset": { window: 15 * 60, max: 5 },
        "/send-verification-email": { window: 15 * 60, max: 5 },
        "/reset-password": { window: 15 * 60, max: 8 },
      },
    },

  trustedOrigins: [
    "com.exo.fitness://",
    "com.exo.fitness://*",
    "http://localhost:8081",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
    "http://192.168.1.12:8081",
    "http://192.168.1.12:3000",
    "https://appleid.apple.com",
    "exp://",
    "https://potentialpeak-app.vercel.app",
    "https://potentialpeak-app-puce.vercel.app",
    "exp://**",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
});

type AuthInstance = Awaited<ReturnType<typeof createAuth>>;

let authInstance: AuthInstance | undefined;
let authInit: Promise<AuthInstance> | undefined;

export async function getAuth(): Promise<AuthInstance> {
  if (authInstance) return authInstance;
  if (!authInit) {
    authInit = createAuth().then((instance) => {
      authInstance = instance;
      return instance;
    });
  }
  return authInit;
}

export type Auth = AuthInstance;
export type AuthUser = Auth["$Infer"]["Session"]["user"];
