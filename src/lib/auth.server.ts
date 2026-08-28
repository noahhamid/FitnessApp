import { prisma } from "./prisma";
import { normalizeDisplayFirstName } from "./display-name";
import { logEmailVerificationLink, sendAuthEmail } from "./send-auth-email";

const APP_VERIFY_EMAIL_URL = "com.exo.fitness://verify-email";

/** On in production; opt out with ENABLE_AUTH_RATE_LIMIT=false for local stress tests. */
const authRateLimitEnabled =
  process.env.ENABLE_AUTH_RATE_LIMIT !== "false" &&
  (process.env.NODE_ENV === "production" ||
    process.env.ENABLE_AUTH_RATE_LIMIT === "true");

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
        sendDeleteAccountVerification: async ({ user, token }) => {
          const confirmUrl = `com.exo.fitness://delete-account?token=${encodeURIComponent(token)}`;
          await sendAuthEmail({
            to: user.email,
            subject: "Confirm deleting your PotentialPeak Fitness account",
            html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>We got a request to delete your PotentialPeak Fitness account. If you go through with this, everything including your workouts, meals, weight logs, and profile. It will be permanently wiped out.</p>
      <p>There's no turning back once you do it. If you're sure, just tap the link below on the device where you're currently logged in:</p>
      <p><a href="${confirmUrl}">Yes, delete my account</a></p>
      <p>Didn't ask for this? No worries at all, you can just ignore this email and your account will stay safe and active.</p>
      <p>Take care,<br>The PotentialPeak Fitness Team</p>
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
      // When true, sign-up returns no session (Better Auth skips auto sign-in) and
      // sign-in is blocked until verify — breaks "confirm later" on mobile.
      requireEmailVerification:
        process.env.REQUIRE_EMAIL_VERIFICATION === "true",
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Reset your PotentialPeak Fitness password",
          html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>We received a request to reset your password. No worries, it happens to the best of us! Just tap the link below to set up a new one:</p>
      <p><a href="${url}">Choose a new password</a></p>
      <p>If you didn't ask for this, you can safely ignore this email—your current password won't change.</p>
      <p>Take care,<br>The PotentialPeak Fitness Team</p>
    `,
        });
      },
    },

    emailVerification: {
      // Send + log verification links on sign-up in dev too (see logEmailVerificationLink).
      sendOnSignUp: true,
      sendOnSignIn: process.env.NODE_ENV === "production",
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        const verifyUrl = `${APP_VERIFY_EMAIL_URL}?token=${encodeURIComponent(token)}`;
        logEmailVerificationLink({
          email: user.email,
          token,
          appDeepLink: verifyUrl,
          apiBaseUrl: process.env.BETTER_AUTH_URL,
        });
        // Local dev: link is in the API terminal — skip Resend so we don't hit email rate limits.
        if (process.env.NODE_ENV !== "production") {
          return;
        }
        await sendAuthEmail({
          to: user.email,
          subject: "Welcome to PotentialPeak Fitness! Please verify your email",
          html: `
      <p>Hi${user.name ? ` ${user.name}` : ""},</p>
      <p>Welcome aboard! We're super excited to have you. Just click the link below to verify your email address and get everything set up:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>If you didn't create an account with us, feel free to ignore this email.</p>
      <p>Take care,<br>The PotentialPeak Fitness Team</p>
    `,
        });
      },
    },

    socialProviders: {
      google: {
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
      enabled: authRateLimitEnabled,
      storage: "database",
      window: 60,
      max: 100,
      customRules: authRateLimitEnabled
        ? {
            "/sign-in/email": { window: 15 * 60, max: 8 },
            "/sign-up/email": { window: 15 * 60, max: 5 },
            "/forget-password*": { window: 15 * 60, max: 5 },
            "/request-password-reset": { window: 15 * 60, max: 5 },
            "/send-verification-email": { window: 15 * 60, max: 5 },
            "/reset-password": { window: 15 * 60, max: 8 },
          }
        : {},
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
