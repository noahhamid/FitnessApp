import { Hono } from "hono";
import { getAuth } from "../lib/auth.server";

export const authRouter = new Hono();

authRouter.on(["GET", "POST"], "/*", async (c) => {
  const auth = await getAuth();
  return auth.handler(c.req.raw);
});
