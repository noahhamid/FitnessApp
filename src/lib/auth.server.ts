import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  plugins: [expo()],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url, token }) => {
      // Prefer Resend when configured; always log in server console for local/dev.
      console.log(`[password-reset] ${user.email}`);
      console.log(`[password-reset] url: ${url}`);
      console.log(`[password-reset] token: ${token}`);

      const resendKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
      if (!resendKey) return;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: user.email,
          subject: "Reset your PotentialPeak password",
          html: `
            <p>Hi${user.name ? ` ${user.name}` : ""},</p>
            <p>Tap the link below to choose a new password:</p>
            <p><a href="${url}">Reset password</a></p>
            <p>If you didn't request this, you can ignore this email.</p>
          `,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error("[password-reset] Resend failed:", response.status, body);
        throw new Error("Failed to send password reset email");
      }
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

  trustedOrigins: [
    "com.exo.fitness://",
    "com.exo.fitness://*",
    "http://localhost:8081",
    "http://localhost:3000",
    "https://appleid.apple.com",
    "exp://",
    "https://potentialpeak-app.vercel.app",
    "exp://**",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
});

export type Auth = typeof auth;
export type AuthUser = typeof auth.$Infer.Session.user;
