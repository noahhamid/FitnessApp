/**
 * Vercel serverless entry used by vercel.json rewrites → `/api`.
 * Re-exports the same Hono app as src/index.ts / src/app.ts.
 */
export { default } from "../src/app";
