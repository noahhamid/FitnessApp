import { Hono } from "hono";
import { getAuth } from "../lib/auth.server";

export const authRouter = new Hono();

/**
 * Browsers block JS from reading `Set-Cookie` on cross-origin fetch.
 * Expo native can; web cannot. After verify-email, Better Auth sets a session
 * cookie but returns `{ status: true }` with no token — so we copy the session
 * token into the JSON body for web clients to store as Bearer.
 */
function sessionTokenFromSetCookie(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(
    /(?:^|,)\s*(?:__Secure-)?better-auth\.session_token=([^;,]+)/i,
  );
  return match?.[1] ? decodeURIComponent(match[1].trim()) : null;
}

authRouter.on(["GET", "POST"], "/*", async (c) => {
  const auth = await getAuth();
  const response = await auth.handler(c.req.raw);

  const path = new URL(c.req.url).pathname;
  if (!path.includes("verify-email")) {
    return response;
  }

  const sessionToken = sessionTokenFromSetCookie(
    response.headers.get("set-cookie"),
  );
  if (!sessionToken) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  try {
    const body: unknown = await response.clone().json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response;
    }
    if ("token" in body && typeof (body as { token: unknown }).token === "string") {
      return response;
    }
    return new Response(JSON.stringify({ ...body, token: sessionToken }), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return response;
  }
});
