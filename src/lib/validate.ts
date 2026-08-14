import type { Context } from "hono";
import type { z } from "zod";
import { err } from "./response";

/** Discriminated parse result — use `isParseFail()` to narrow safely. */
export type ParseOk<T> = { success: true; data: T };
export type ParseFail = { success: false; response: Response };
export type ParseResult<T> = ParseOk<T> | ParseFail;

/** Type guard — preferred over `!result.success` (generic unions often break that). */
export function isParseFail<T>(result: ParseResult<T>): result is ParseFail {
  return result.success === false;
}

/**
 * Prefer `schema: z.ZodType<T>` over `T extends z.ZodType` + `z.infer<T>` —
 * the latter often prevents TypeScript from narrowing `ParseResult` on `success`.
 */
export async function parseJson<T>(
  c: Context,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
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

export function parseQuery<T>(
  c: Context,
  schema: z.ZodType<T>,
): ParseResult<T> {
  const result = schema.safeParse(c.req.query());
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Invalid query parameters";
    return { success: false, response: err(c, message, 400) };
  }

  return { success: true, data: result.data };
}
