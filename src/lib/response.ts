import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ data }, status);
}

export function err(c: Context, message: string, status: ContentfulStatusCode = 400) {
  return c.json({ error: message }, status);
}
