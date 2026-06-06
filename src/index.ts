import { serve } from "@hono/node-server";
import { config } from "dotenv";
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

config({ path: ".env.local" });

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

app.get("/health", (c) => ok(c, { ok: true }));

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env.PORT ?? 3000);
/** Bind all interfaces so LAN devices (Expo Go on physical hardware) can reach the API. */
const hostname = process.env.HOST ?? "0.0.0.0";
console.log(`Server listening on http://${hostname}:${port}`);

serve({ fetch: app.fetch, port, hostname });

export default app;
