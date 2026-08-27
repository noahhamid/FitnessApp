import { serve } from "@hono/node-server";
import { config } from "dotenv";
import app from "./app";

config({ path: ".env.local" });

/**
 * Vercel imports this file (or api/index.ts) and uses `export default app`.
 * Only start the Node listener for local `npm run server` / `dev:server`.
 */
const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

/** Avoid double-listen when the module is evaluated twice in one process. */
const g = globalThis as typeof globalThis & { __ppApiServer?: boolean };

if (!isVercel && !g.__ppApiServer) {
  g.__ppApiServer = true;
  const port = Number(process.env.PORT ?? 3000);
  /** Bind all interfaces so LAN devices (Expo Go on physical hardware) can reach the API. */
  const hostname = process.env.HOST ?? "0.0.0.0";

  const server = serve({ fetch: app.fetch, port, hostname }, (info) => {
    console.log(`API ready — http://${hostname}:${info.port}`);
    console.log("Verification links will print here when you sign up / resend.");
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\nPort ${port} is already in use.\n` +
          `Run:  npm run free:port\n` +
          `Then: npm run dev:server\n`,
      );
      process.exit(1);
    }
    throw err;
  });
}

export default app;
