/**
 * Bundle the Hono API for Vercel. Prefers a local esbuild, then the copy
 * that ships with tsx, then an already-built api/handler.cjs.
 */
const fs = require("fs");
const { createRequire } = require("module");

function loadEsbuild() {
  try {
    return require("esbuild");
  } catch {
    // not a direct dependency
  }
  try {
    return createRequire(require.resolve("tsx/package.json"))("esbuild");
  } catch {
    // tsx omitted from the install (production prune)
  }
  return null;
}

const esbuild = loadEsbuild();
if (!esbuild) {
  if (fs.existsSync("api/handler.cjs")) {
    console.log("esbuild unavailable; using existing api/handler.cjs");
    process.exit(0);
  }
  throw new Error("esbuild not found and api/handler.cjs is missing");
}

esbuild.buildSync({
  entryPoints: ["src/app.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "api/handler.cjs",
  // @sentry/node pulls in OpenTelemetry, which uses dynamic requires that
  // esbuild can't resolve statically — leave it to Node at runtime.
  external: ["@neondatabase/serverless", "ws", "@sentry/node"],
});

console.log("bundled api/handler.cjs");
