import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { normalizeDisplayFirstName } from "./display-name";
import { prisma } from "./prisma";
import { sendAuthEmail } from "./send-auth-email";

const APP_VERIFY_EMAIL_URL = "com.exo.fitness://verify-email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  plugins: [expo()],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

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

export type Auth = typeof auth;
export type AuthUser = typeof auth.$Infer.Session.user;
