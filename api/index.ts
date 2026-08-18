/**
 * Vercel entry. `handler.cjs` is produced by vercel.json buildCommand
 * (esbuild CJS bundle) so better-auth is inlined, not require()'d as ESM.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
module.exports = require("./handler.cjs");
