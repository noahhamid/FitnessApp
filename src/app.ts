import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { nutritionRouter } from "./routes/nutrition";
import { profileRouter } from "./routes/profile";
import { weightRouter } from "./routes/weight";
import { workoutsRouter } from "./routes/workouts";
import { ok } from "./lib/response";

/**
 * Shared Hono app — default-exported for Vercel (and local Node via src/index.ts).
 * Keep this free of `serve()` / process listeners so serverless can import it.
 */
/** strict: false — /api/workouts and /api/workouts/ both resolve (matches nutrition/weight mount style). */
const app = new Hono({ strict: false });

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/api/auth", authRouter);
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

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
