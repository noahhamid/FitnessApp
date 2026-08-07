import { serve } from "@hono/node-server";
import { config } from "dotenv";
import app from "./app";

config({ path: ".env.local" });

/**
 * Vercel imports this file (or api/index.ts) and uses `export default app`.
 * Only start the Node listener for local `npm run server` / `dev:server`.
 */
const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

if (!isVercel) {
  const port = Number(process.env.PORT ?? 3000);
  /** Bind all interfaces so LAN devices (Expo Go on physical hardware) can reach the API. */
  const hostname = process.env.HOST ?? "0.0.0.0";
  console.log(`Server listening on http://${hostname}:${port}`);
  serve({ fetch: app.fetch, port, hostname });
}

export default app;
