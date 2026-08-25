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
  const [{ betterAuth }, { prismaAdapter }, { expo }, { bearer }] =
    await Promise.all([
      import("better-auth"),
      import("better-auth/adapters/prisma"),
      import("@better-auth/expo"),
      import("better-auth/plugins"),
    ]);

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    plugins: [expo(), bearer()],

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
            subject: "Confirm deleting your Exo account",
            html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>We received a request to permanently delete your Exo account and all associated data (workouts, meals, weight logs, and profile).</p>
      <p>This cannot be undone. Open the link below on the device where you are signed in to Exo:</p>
      <p><a href="${confirmUrl}">Delete my account permanently</a></p>
      <p>If you didn't request this, you can ignore this email — your account will stay active.</p>
    `,
          });
        },
      },
    },

    databaseHooks: {
      user: {
        create: {
          async before(user) {
            if (typeof user.name !== "string" || !user.name.trim()) {
              return { data: user };
            }
            return {
              data: {
                ...user,
                name: normalizeDisplayFirstName(user.name),
              },
            };
          },
        },
        update: {
          async before(user) {
            if (typeof user.name !== "string") return { data: user };
            return {
              data: {
                ...user,
                name: normalizeDisplayFirstName(user.name),
              },
            };
          },
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: process.env.NODE_ENV === "production",
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Reset your Exo password",
          html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>Tap the link below to choose a new password:</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
        });
      },
    },

    emailVerification: {
      sendOnSignUp: process.env.NODE_ENV === "production",
      sendOnSignIn: process.env.NODE_ENV === "production",
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        const verifyUrl = `${APP_VERIFY_EMAIL_URL}?token=${encodeURIComponent(token)}`;
        await sendAuthEmail({
          to: user.email,
          subject: "Confirm your Exo email",
          html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>Tap the link below to confirm this email belongs to you:</p>
      <p><a href="${verifyUrl}">Confirm email</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
        });
      },
    },

    socialProviders: {
      google: {
        // Must be the Google Cloud *Web* client ID + secret (not Android/iOS).
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      apple: {
        // Service ID for web OAuth; native idToken aud is the App ID / bundle.
        clientId: process.env.APPLE_CLIENT_ID ?? "com.exo.fitness",
        // Required by the provider shape. Native idToken verify uses
        // appBundleIdentifier; set a real JWT secret when enabling web Apple OAuth.
        clientSecret: process.env.APPLE_CLIENT_SECRET ?? "native-idtoken-only",
        appBundleIdentifier:
          process.env.APPLE_APP_BUNDLE_IDENTIFIER ?? "com.exo.fitness",
      },
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
      "http://localhost:8080",
      "http://localhost:19006",
      "http://localhost:3000",
      "http://127.0.0.1:8081",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:19006",
      "http://127.0.0.1:3000",
      "https://appleid.apple.com",
      "exp://",
      "exp://**",
      "https://potential-peak.vercel.app",
      "https://potentialpeak-app.vercel.app",
      "https://potentialpeak-app-puce.vercel.app",
      ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ],
  });
}

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
