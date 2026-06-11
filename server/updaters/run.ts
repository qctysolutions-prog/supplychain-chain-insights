/**
 * CLI runner for the automated updaters.
 *
 *   pnpm update:news      → tsx server/updaters/run.ts news
 *   pnpm update:indices   → tsx server/updaters/run.ts indices
 *   tsx server/updaters/run.ts all
 */

import "dotenv/config";
import { runNewsUpdate } from "./newsUpdater";
import { runIndicesUpdate } from "./indicesUpdater";

async function main() {
  const job = process.argv[2] || "all";

  if (job === "news" || job === "all") {
    console.log("▶ Running news update...");
    const r = await runNewsUpdate();
    console.log(JSON.stringify(r, null, 2));
  }
  if (job === "indices" || job === "all") {
    console.log("▶ Running indices update...");
    const r = await runIndicesUpdate();
    console.log(JSON.stringify(r, null, 2));
  }
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
