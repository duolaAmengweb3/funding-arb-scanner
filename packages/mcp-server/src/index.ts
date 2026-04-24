#!/usr/bin/env node
import { runServer } from "./server.js";

runServer().catch((err) => {
  process.stderr.write(`funding-arb-scanner fatal: ${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
