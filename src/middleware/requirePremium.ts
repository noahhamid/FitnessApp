import { createMiddleware } from "hono/factory";
import { userHasPremium } from "../lib/entitlement";
import { err } from "../lib/response";
import type { AppEnv } from "../types/hono";

/** 403 unless this account has a current Pro row in user_entitlement. */
export const requirePremium = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user?.id) {
    return err(c, "Unauthorized", 401);
  }
  if (!(await userHasPremium(user.id))) {
    return err(c, "Premium required", 403);
  }
  await next();
});
