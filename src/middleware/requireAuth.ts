import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.server";
import { err } from "../lib/response";
import type { AppEnv } from "../types/hono";

/** Hono middleware — same pattern as nutrition/weight routers (.use("*", requireAuth)). */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return err(c, "Unauthorized", 401);
  }

  c.set("user", session.user);
  await next();
});

export function getUser(c: Context<AppEnv>) {
  return c.get("user");
}
