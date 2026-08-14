import { prisma } from "./prisma";

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

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },

    trustedOrigins: [
      "myapp://",
      "http://localhost:8081",
      "exp://localhost:8081",
      "exp://192.168.100.243:8081",
      "exp://",
      "https://potential-peak.vercel.app",
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
