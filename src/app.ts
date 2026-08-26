import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { billingRouter } from "./routes/billing";
import { nutritionRouter } from "./routes/nutrition";
import { profileRouter } from "./routes/profile";
import { weightRouter } from "./routes/weight";
import { workoutsRouter } from "./routes/workouts";
import { PRIVACY_HTML, TERMS_HTML } from "./lib/legal-html";
import { PRODUCTION_API_URL } from "./lib/public-api-url";
import { ok } from "./lib/response";

/**
 * Shared Hono app — default-exported for Vercel (and local Node via src/index.ts).
 * Keep this free of `serve()` / process listeners so serverless can import it.
 */
/** strict: false — /api/workouts and /api/workouts/ both resolve (matches nutrition/weight mount style). */
const app = new Hono({ strict: false });

app.use("*", logger());

const CORS_ALLOW = new Set([
  PRODUCTION_API_URL,
  "https://potentialpeak-app-puce.vercel.app",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:3000",
]);

function corsOrigin(origin: string): string | undefined {
  if (!origin) return origin;
  if (CORS_ALLOW.has(origin.replace(/\/$/, ""))) return origin;
  if (origin.startsWith("com.exo.fitness://") || origin.startsWith("exp://")) {
    return origin;
  }
  const extra = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");
  if (extra && origin.replace(/\/$/, "") === extra) return origin;
  return undefined;
}

app.use(
  "*",
  cors({
    origin: (origin) => corsOrigin(origin) ?? "",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/api/auth", authRouter);
app.route("/api/billing", billingRouter);
app.route("/api/ai", aiRouter);
app.route("/api/nutrition", nutritionRouter);
app.route("/api/profile", profileRouter);
app.route("/api/weight", weightRouter);
app.route("/api/workouts", workoutsRouter);

/**
 * Local-only static files for meal photos when BLOB_READ_WRITE_TOKEN is unset.
 * On Vercel, meal photos go to Vercel Blob (see src/lib/meal-photo-storage.ts).
 */
if (!process.env.VERCEL) {
  app.use(
    "/uploads/*",
    serveStatic({
      root: "./",
    }),
  );
}

app.get("/health", (c) => ok(c, { ok: true }));

/** Public legal pages for App Store Connect / Play Console listing URLs. */
app.get("/privacy", (c) => c.html(PRIVACY_HTML));
app.get("/terms", (c) => c.html(TERMS_HTML));

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
