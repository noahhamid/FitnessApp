import { execSync } from "node:child_process";

const port = process.argv[2] || "3000";

function pidsOnPort(p) {
  try {
    const out = execSync("netstat -ano", { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes(`:${p}`) || !line.includes("LISTENING")) continue;
      const m = line.trim().match(/(\d+)\s*$/);
      if (m) pids.add(m[1]);
    }
    return [...pids];
  } catch {
    return [];
  }
}

const pids = pidsOnPort(port);
if (pids.length === 0) {
  console.log(`Port ${port} is free.`);
  process.exit(0);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
    console.log(`Freed port ${port} (killed PID ${pid}).`);
  } catch {
    console.warn(`Could not kill PID ${pid} on port ${port}.`);
  }
}
