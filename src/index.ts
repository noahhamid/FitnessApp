import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth";
import { nutritionRouter } from "./routes/nutrition";
import { weightRouter } from "./routes/weight";
import { workoutsRouter } from "./routes/workouts";
import { ok } from "./lib/response";

config({ path: ".env.local" });

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:8081",
      "exp://localhost:8081",
      "http://192.168.0.150:8081",
      "exp://192.168.0.150:8081",
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/api/auth", authRouter);
app.route("/api/nutrition", nutritionRouter);
app.route("/api/weight", weightRouter);
app.route("/api/workouts", workoutsRouter);

app.get("/health", (c) => ok(c, { ok: true }));

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env.PORT ?? 3000);
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
