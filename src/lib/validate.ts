import type { Context } from "hono";
import type { z } from "zod";
import { err } from "./response";

export async function parseJson<T extends z.ZodType>(
  c: Context,
  schema: T,
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: Response }
> {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return { success: false, response: err(c, "Invalid JSON body", 400) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Invalid request payload";
    return { success: false, response: err(c, message, 400) };
  }

  return { success: true, data: result.data };
}

export function parseQuery<T extends z.ZodType>(
  c: Context,
  schema: T,
):
  | { success: true; data: z.infer<T> }
  | { success: false; response: Response } {
  const result = schema.safeParse(c.req.query());
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Invalid query parameters";
    return { success: false, response: err(c, message, 400) };
  }

  return { success: true, data: result.data };
}
