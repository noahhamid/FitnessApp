import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const freePort = path.join(root, "free-port.mjs");

const free = spawn(process.execPath, [freePort, "3000"], {
  stdio: "inherit",
  cwd: path.join(root, ".."),
});

free.on("exit", (code) => {
  if (code !== 0 && code !== null) process.exit(code);
  const child = spawn("npx", ["tsx", "watch", "src/index.ts"], {
    stdio: "inherit",
    cwd: path.join(root, ".."),
    shell: true,
  });
  child.on("exit", (c) => process.exit(c ?? 0));
});
